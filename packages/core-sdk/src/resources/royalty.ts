import {
  Address,
  encodeFunctionData,
  erc20Abi,
  Hex,
  PublicClient,
  TransactionReceipt,
  zeroAddress,
} from "viem";

import { handleError } from "../utils/errors";
import {
  BatchClaimAllRevenueRequest,
  BatchClaimAllRevenueResponse,
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
  ClaimAllRevenueRequest,
  ClaimAllRevenueResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  TransferClaimedTokensFromIpToWalletParams,
  TransferToVaultRequest,
} from "../types/resources/royalty";
import {
  IpAccountImplClient,
  IpAssetRegistryClient,
  IpRoyaltyVaultImplEventClient,
  IpRoyaltyVaultImplReadOnlyClient,
  IpRoyaltyVaultImplRevenueTokenClaimedEvent,
  Multicall3Client,
  RoyaltyModuleClient,
  royaltyPolicyLrpAbi,
  RoyaltyWorkflowsClient,
  SimpleWalletClient,
  WrappedIpClient,
} from "../abi/generated";
import { validateAddress, validateAddresses } from "../utils/utils";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { contractCallWithFees } from "../utils/feeUtils";
import { Erc20Spender } from "../types/utils/wip";
import { TransactionResponse } from "../types/options";
import { ChainIds } from "../types/config";
import { royaltyPolicyInputToAddress } from "../utils/royalty";
import { waitForTxReceipt } from "../utils/txOptions";

export class RoyaltyClient {
  public royaltyModuleClient: RoyaltyModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public ipRoyaltyVaultImplReadOnlyClient: IpRoyaltyVaultImplReadOnlyClient;
  public ipRoyaltyVaultImplEventClient: IpRoyaltyVaultImplEventClient;
  public royaltyWorkflowsClient: RoyaltyWorkflowsClient;
  public multicall3Client: Multicall3Client;
  public wrappedIpClient: WrappedIpClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly walletAddress: Address;
  private readonly chainId: ChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.royaltyModuleClient = new RoyaltyModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.ipRoyaltyVaultImplReadOnlyClient = new IpRoyaltyVaultImplReadOnlyClient(rpcClient);
    this.ipRoyaltyVaultImplEventClient = new IpRoyaltyVaultImplEventClient(rpcClient);
    this.royaltyWorkflowsClient = new RoyaltyWorkflowsClient(rpcClient, wallet);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.wrappedIpClient = new WrappedIpClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.walletAddress = wallet.account!.address;
  }
  /**
   * Claims all revenue from the child IPs of an ancestor IP, then transfer
   * all claimed tokens to the wallet if the wallet owns the IP or is the claimer.
   * If claimed token is WIP, it will also be converted back to IP.
   *
   * @remarks
   * Even if there are no child IPs, you must still populate {@link ClaimAllRevenueRequest.currencyTokens} with
   * the token addresses you wish to claim. This is required for the claim operation to know which
   * token balances to process.
   */
  public async claimAllRevenue(req: ClaimAllRevenueRequest): Promise<ClaimAllRevenueResponse> {
    try {
      const ancestorIpId = validateAddress(req.ancestorIpId);
      const claimer = validateAddress(req.claimer);
      const childIpIds = validateAddresses(req.childIpIds);
      const royaltyPolicies = validateAddresses(req.royaltyPolicies);
      const currencyTokens = validateAddresses(req.currencyTokens);
      const txHashes: Hex[] = [];
      const txHash = await this.royaltyWorkflowsClient.claimAllRevenue({
        ancestorIpId,
        claimer,
        childIpIds,
        royaltyPolicies,
        currencyTokens,
      });
      const receipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      txHashes.push(txHash);

      // determine if the claimer is an IP owned by the wallet
      const { ownsClaimer, isClaimerIp, ipAccount } = await this.getClaimerInfo(claimer);
      const claimedTokens =
        this.ipRoyaltyVaultImplEventClient.parseTxRevenueTokenClaimedEvent(receipt);

      const autoTransfer = req.claimOptions?.autoTransferAllClaimedTokensFromIp !== false;
      const autoUnwrapIp = req.claimOptions?.autoUnwrapIpTokens !== false;

      // transfer claimed tokens from IP to wallet if wallet owns IP
      if (autoTransfer && isClaimerIp && ownsClaimer) {
        const hashes = await this.transferClaimedTokensFromIpToWallet({
          ipAccount,
          claimedTokens,
        });
        txHashes.push(...hashes);
      }
      if (autoUnwrapIp && ownsClaimer) {
        const hashes = await this.unwrapWipTokens(claimedTokens);
        if (hashes) {
          txHashes.push(hashes);
        }
      }
      return { receipt, claimedTokens, txHashes };
    } catch (error) {
      return handleError(error, "Failed to claim all revenue");
    }
  }

  /**
   * Automatically batch claims all revenue from the child IPs of multiple ancestor IPs.
   * if multicall is disabled, it will call @link{claimAllRevenue} for each ancestor IP.
   * Then transfer all claimed tokens to the wallet if the wallet owns the IP or is the claimer.
   * If claimed token is WIP, it will also be converted back to IP.
   *
   * @remarks
   * Even if there are no child IPs, you must still populate `currencyTokens` in each ancestor IP
   * with the token addresses you wish to claim. This is required for the claim operation to know which
   * token balances to process.
   */
  public async batchClaimAllRevenue(
    request: BatchClaimAllRevenueRequest,
  ): Promise<BatchClaimAllRevenueResponse> {
    try {
      const txHashes: Hex[] = [];
      const receipts: TransactionReceipt[] = [];
      const claimedTokens: IpRoyaltyVaultImplRevenueTokenClaimedEvent[] = [];
      // if the number of ancestor IPs is 1 or if multicall is disabled, then just call claimAllRevenue.
      const useMulticallWhenPossible = request.options?.useMulticallWhenPossible !== false;
      if (request.ancestorIps.length === 1 || !useMulticallWhenPossible) {
        for (const ancestorIp of request.ancestorIps) {
          const result = await this.claimAllRevenue({
            ...ancestorIp,
            ancestorIpId: ancestorIp.ipId,
            claimOptions: {
              autoTransferAllClaimedTokensFromIp: false,
              autoUnwrapIpTokens: false,
            },
          });
          txHashes.push(...result.txHashes);
          receipts.push(result.receipt);
          if (result.claimedTokens) {
            claimedTokens.push(...result.claimedTokens);
          }
        }
      } else {
        // Batch claimAllRevenue the calls into a single multicall
        const encodedTxs = request.ancestorIps.map(
          ({ ipId, claimer, childIpIds, royaltyPolicies, currencyTokens }) => {
            const claim = {
              ancestorIpId: validateAddress(ipId),
              claimer: validateAddress(claimer),
              childIpIds: validateAddresses(childIpIds),
              royaltyPolicies: validateAddresses(royaltyPolicies),
              currencyTokens: validateAddresses(currencyTokens),
            };
            return this.royaltyWorkflowsClient.claimAllRevenueEncode(claim).data;
          },
        );
        const txHash = await this.royaltyWorkflowsClient.multicall({ data: encodedTxs });
        const receipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        txHashes.push(txHash);
        receipts.push(receipt);
        const claimedTokenLogs =
          this.ipRoyaltyVaultImplEventClient.parseTxRevenueTokenClaimedEvent(receipt);
        claimedTokens.push(...claimedTokenLogs);
      }

      // Aggregate claimed tokens by claimer and token address
      const aggregatedClaimedTokens = Object.values(
        claimedTokens.reduce<Record<string, IpRoyaltyVaultImplRevenueTokenClaimedEvent>>(
          (acc, curr) => {
            const key = `${curr.claimer}_${curr.token}`;
            if (!acc[key]) {
              acc[key] = { ...curr };
            } else {
              acc[key].amount += curr.amount;
            }
            return acc;
          },
          {},
        ),
      );
      const claimers = [...new Set(request.ancestorIps.map(({ claimer }) => claimer))];
      const autoTransfer = request.claimOptions?.autoTransferAllClaimedTokensFromIp !== false;
      const autoUnwrapIp = request.claimOptions?.autoUnwrapIpTokens !== false;
      let wipClaimableAmounts = 0n;
      for (const claimer of claimers) {
        const { ownsClaimer, isClaimerIp, ipAccount } = await this.getClaimerInfo(claimer);

        // If ownsClaimer is false, it means the claimer is neither an IP owned by the wallet nor the wallet address itself.
        if (!ownsClaimer) {
          continue;
        }
        const filterClaimedTokens = aggregatedClaimedTokens.filter(
          (item) => item.claimer === claimer,
        );
        // transfer claimed tokens from IP to wallet if wallet owns IP
        if (autoTransfer && isClaimerIp && ownsClaimer) {
          const hashes = await this.transferClaimedTokensFromIpToWallet({
            ipAccount,
            claimedTokens: filterClaimedTokens,
          });
          txHashes.push(...hashes);
        }
        // Sum up the amount of WIP tokens claimed
        wipClaimableAmounts += filterClaimedTokens.reduce((acc, curr) => {
          if (curr.token === WIP_TOKEN_ADDRESS) {
            return acc + curr.amount;
          }
          return acc;
        }, 0n);
      }
      if (wipClaimableAmounts > 0n && autoUnwrapIp) {
        const hash = await this.unwrapWipTokens([
          {
            token: WIP_TOKEN_ADDRESS,
            amount: wipClaimableAmounts,
            claimer: this.walletAddress,
          },
        ]);
        if (hash) {
          txHashes.push(hash);
        }
      }
      return {
        receipts,
        claimedTokens: aggregatedClaimedTokens,
        txHashes,
      };
    } catch (error) {
      return handleError(
        new Error((error as Error).message.replace("Failed to claim all revenue: ", "").trim()),
        "Failed to batch claim all revenue",
      );
    }
  }

  /**
   * Allows the function caller to pay royalties to the receiver IP asset on behalf of the payer IP asset.
   */
  public async payRoyaltyOnBehalf(
    request: PayRoyaltyOnBehalfRequest,
  ): Promise<PayRoyaltyOnBehalfResponse> {
    try {
      const { receiverIpId, payerIpId, token, amount, erc20Options, wipOptions, txOptions } =
        request;
      const sender = this.wallet.account!.address;
      const payAmount = BigInt(amount);
      if (payAmount <= 0n) {
        throw new Error("The amount to pay must be number greater than 0.");
      }
      const isReceiverRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(receiverIpId),
      });
      if (!isReceiverRegistered) {
        throw new Error(`The receiver IP with id ${receiverIpId} is not registered.`);
      }
      if (validateAddress(payerIpId) && payerIpId !== zeroAddress) {
        const isPayerRegistered = await this.ipAssetRegistryClient.isRegistered({
          id: payerIpId,
        });
        if (!isPayerRegistered) {
          throw new Error(`The payer IP with id ${request.payerIpId} is not registered.`);
        }
      }
      const req = {
        receiverIpId: receiverIpId,
        payerIpId: payerIpId,
        token: validateAddress(token),
        amount: BigInt(amount),
      };

      const encodedTxData = this.royaltyModuleClient.payRoyaltyOnBehalfEncode(req);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }
      const contractCall = () => {
        return this.royaltyModuleClient.payRoyaltyOnBehalf(req);
      };
      const tokenSpenders: Erc20Spender[] = [
        {
          address: this.royaltyModuleClient.address,
          amount: payAmount,
        },
      ];
      return await contractCallWithFees({
        totalFees: payAmount,
        options: { erc20Options, wipOptions },
        multicall3Address: this.multicall3Client.address,
        rpcClient: this.rpcClient,
        tokenSpenders: tokenSpenders,
        contractCall,
        sender,
        token,
        wallet: this.wallet,
        txOptions,
        encodedTxs: [encodedTxData],
      });
    } catch (error) {
      return handleError(error, "Failed to pay royalty on behalf");
    }
  }

  /**
   * Get total amount of revenue token claimable by a royalty token holder.
   * Returns the amount of revenue token claimable by the claimer.
   */
  public async claimableRevenue(
    request: ClaimableRevenueRequest,
  ): Promise<ClaimableRevenueResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultAddress(validateAddress(request.ipId));
      const ipRoyaltyVault = new IpRoyaltyVaultImplReadOnlyClient(this.rpcClient, proxyAddress);
      return await ipRoyaltyVault.claimableRevenue({
        claimer: validateAddress(request.claimer),
        token: validateAddress(request.token),
      });
    } catch (error) {
      return handleError(error, "Failed to calculate claimable revenue");
    }
  }

  /**
   * Get the royalty vault proxy address of given ip id of the royalty vault.
   */
  public async getRoyaltyVaultAddress(ipId: Hex): Promise<Address> {
    const isRoyaltyVaultIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
      id: validateAddress(ipId),
    });
    if (!isRoyaltyVaultIpIdRegistered) {
      throw new Error(`The royalty vault IP with id ${ipId} is not registered.`);
    }
    return await this.royaltyModuleClient.ipRoyaltyVaults({ ipId });
  }

  /**
   * Transfers to vault an amount of revenue tokens claimable via a royalty policy.
   */
  public async transferToVault({
    txOptions,
    ipId,
    royaltyPolicy,
    ancestorIpId,
    token,
  }: TransferToVaultRequest): Promise<TransactionResponse> {
    const royaltyPolicyAddress = royaltyPolicyInputToAddress(royaltyPolicy, this.chainId);
    const protocolArgs = [
      validateAddress(ipId),
      validateAddress(ancestorIpId),
      validateAddress(token),
    ] as const;
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi, // same abi for all royalty policies
      address: royaltyPolicyAddress,
      functionName: "transferToVault",
      account: this.wallet.account,
      args: protocolArgs,
    });
    const txHash = await this.wallet.writeContract(call);
    return waitForTxReceipt({
      txHash,
      rpcClient: this.rpcClient,
      txOptions,
    });
  }

  private async transferClaimedTokensFromIpToWallet({
    ipAccount,
    claimedTokens,
  }: TransferClaimedTokensFromIpToWalletParams) {
    const txHashes: Hex[] = [];
    const calls = [];
    for (const { token, amount } of claimedTokens) {
      calls.push({
        target: token,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [this.walletAddress, amount],
        }),
      });
    }
    const hash = await ipAccount.executeBatch({ calls, operation: 0 });
    await this.rpcClient.waitForTransactionReceipt({ hash });
    txHashes.push(hash);
    return txHashes;
  }

  private async getClaimerInfo(claimer: Address) {
    const isClaimerIp = await this.ipAssetRegistryClient.isRegistered({
      id: claimer,
    });
    const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, claimer);
    let ownsClaimer = claimer === this.walletAddress;
    if (isClaimerIp) {
      const ipOwner = await ipAccount.owner();
      ownsClaimer = ipOwner === this.walletAddress;
    }
    return { ownsClaimer, isClaimerIp, ipAccount };
  }
  /**
   * Unwraps WIP tokens back to their underlying IP tokens. Only accepts a single WIP token entry
   * in the claimed tokens array. Throws an error if multiple WIP tokens are found.
   */
  private async unwrapWipTokens(claimedTokens: IpRoyaltyVaultImplRevenueTokenClaimedEvent[]) {
    const wipTokens = claimedTokens.filter((token) => token.token === WIP_TOKEN_ADDRESS);
    if (wipTokens.length > 1) {
      throw new Error("Multiple WIP tokens found in the claimed tokens.");
    }
    const wipToken = wipTokens[0];
    if (!wipToken || wipToken.amount <= 0n) {
      return;
    }
    const hash = await this.wrappedIpClient.withdraw({
      value: wipToken.amount,
    });
    await this.rpcClient.waitForTransactionReceipt({ hash });
    return hash;
  }
}
