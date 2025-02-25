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
  ClaimedToken,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  TransferClaimedTokensFromIpToWalletParams,
} from "../types/resources/royalty";
import {
  IpAccountImplClient,
  IpAssetRegistryClient,
  IpRoyaltyVaultImplEventClient,
  IpRoyaltyVaultImplReadOnlyClient,
  IpRoyaltyVaultImplRevenueTokenClaimedEvent,
  Multicall3Client,
  RoyaltyModuleClient,
  RoyaltyWorkflowsClient,
  SimpleWalletClient,
  WrappedIpClient,
} from "../abi/generated";
import { getAddress, validateAddress, validateAddresses } from "../utils/utils";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { contractCallWithFees } from "../utils/feeUtils";
import { Erc20Spender } from "../types/utils/wip";

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

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.royaltyModuleClient = new RoyaltyModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.ipRoyaltyVaultImplReadOnlyClient = new IpRoyaltyVaultImplReadOnlyClient(rpcClient);
    this.ipRoyaltyVaultImplEventClient = new IpRoyaltyVaultImplEventClient(rpcClient);
    this.royaltyWorkflowsClient = new RoyaltyWorkflowsClient(rpcClient, wallet);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.wrappedIpClient = new WrappedIpClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.walletAddress = wallet.account!.address;
  }
  /**
   * Claims all revenue from the child IPs of an ancestor IP, then transfer.
   * all claimed tokens to the wallet if the wallet owns the IP or is the claimer.
   * If claimed token is WIP, it will also be converted back to IP.
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

      // if wallet does not own the claimer then we cannot auto claim or unwrap
      // If ownsClaimer is false, it means the claimer is neither an IP owned by the wallet nor the wallet address itself.
      if (!ownsClaimer) {
        return { receipt, txHashes };
      }
      const claimedTokens =
        this.ipRoyaltyVaultImplEventClient.parseTxRevenueTokenClaimedEvent(receipt);
      const autoTransfer = req.claimOptions?.autoTransferAllClaimedTokensFromIp !== false;
      const autoUnwrapIp = req.claimOptions?.autoUnwrapIpTokens !== false;

      // transfer claimed tokens from IP to wallet if wallet owns IP
      if (autoTransfer && isClaimerIp && ownsClaimer) {
        const hashes = await this.transferClaimedTokensFromIpToWallet({
          ipAccount,
          autoUnwrapIp,
          claimedTokens,
        });
        txHashes.push(...hashes);
      }
      if (autoUnwrapIp) {
        const hashes = await this.unwrapWIPTokens(claimedTokens);
        txHashes.push(...hashes);
      }
      return { receipt, claimedTokens, txHashes };
    } catch (error) {
      handleError(error, "Failed to claim all revenue");
    }
  }

  /**
   * Automatically batch claims all revenue from the child IPs of multiple ancestor IPs.
   * if multicall is disabled, it will call @link{claimAllRevenue} for each ancestor IP.
   * Then transfer all claimed tokens to the wallet if the wallet owns the IP or is the claimer.
   * If claimed token is WIP, it will also be converted back to IP.
   */
  public async batchClaimAllRevenue(
    request: BatchClaimAllRevenueRequest,
  ): Promise<BatchClaimAllRevenueResponse> {
    try {
      // if the number of ancestor IPs is 1 or if multicall is disabled, then just call claimAllRevenue.
      const useMulticallWhenPossible = request.options?.useMulticallWhenPossible !== false;
      if (request.ancestorIps.length === 1 || !useMulticallWhenPossible) {
        const txHashes: Hex[] = [];
        const receipts: TransactionReceipt[] = [];
        const claimedTokens: ClaimedToken[] = [];
        for (const ancestorIp of request.ancestorIps) {
          const result = await this.claimAllRevenue({
            ...ancestorIp,
            ancestorIpId: validateAddress(ancestorIp.ipId),
            claimOptions: request.claimOptions,
          });
          txHashes.push(...result.txHashes);
          if (result.receipt) {
            receipts.push(result.receipt);
          }
          if (result.claimedTokens) {
            claimedTokens.push(...result.claimedTokens);
          }
        }
        return { txHashes, receipts, claimedTokens };
      }

      // Otherwise, we need to batch the calls into a single multicall
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
      const txHashes: Hex[] = [];
      const txHash = await this.royaltyWorkflowsClient.multicall({ data: encodedTxs });
      txHashes.push(txHash);
      const receipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      const claimedTokens =
        this.ipRoyaltyVaultImplEventClient.parseTxRevenueTokenClaimedEvent(receipt);
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
      let ownsClaimerCount = 0;
      for (const claimer of claimers) {
        const { ownsClaimer, isClaimerIp, ipAccount } = await this.getClaimerInfo(claimer);

        // If ownsClaimer is false, it means the claimer is neither an IP owned by the wallet nor the wallet address itself.
        if (!ownsClaimer) {
          continue;
        }
        ownsClaimerCount++;
        const filterClaimedTokens = aggregatedClaimedTokens.filter(
          (item) => item.claimer === claimer,
        );
        // transfer claimed tokens from IP to wallet if wallet owns IP
        if (autoTransfer && isClaimerIp && ownsClaimer) {
          const hashes = await this.transferClaimedTokensFromIpToWallet({
            ipAccount,
            autoUnwrapIp,
            claimedTokens: filterClaimedTokens,
          });
          txHashes.push(...hashes);
        }
        if (autoUnwrapIp) {
          // if the claimer is the wallet, then we can unwrap any claimed WIP tokens
          const hashes = await this.unwrapWIPTokens(filterClaimedTokens);
          txHashes.push(...hashes);
        }
      }
      if (ownsClaimerCount === 0) {
        return { receipts: [receipt], txHashes };
      }
      return {
        receipts: [receipt],
        claimedTokens: aggregatedClaimedTokens,
        txHashes,
      };
    } catch (error) {
      handleError(
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
      return contractCallWithFees({
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
      handleError(error, "Failed to pay royalty on behalf");
    }
  }

  /**
   * Get total amount of revenue token claimable by a royalty token holder.
   * @param request - The request object that contains all data needed to claim Revenue.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.claimer The address of the royalty token holder
   *   @param request.token The revenue token to claim.
   * @returns A Promise that contains the amount of revenue token claimable
   */
  public async claimableRevenue(
    request: ClaimableRevenueRequest,
  ): Promise<ClaimableRevenueResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultAddress(
        getAddress(request.royaltyVaultIpId, "request.royaltyVaultIpId"),
      );
      const ipRoyaltyVault = new IpRoyaltyVaultImplReadOnlyClient(this.rpcClient, proxyAddress);
      return await ipRoyaltyVault.claimableRevenue({
        claimer: getAddress(request.claimer, "request.account"),
        token: getAddress(request.token, "request.token"),
      });
    } catch (error) {
      handleError(error, "Failed to calculate claimable revenue");
    }
  }

  /**
   * Get the royalty vault proxy address of given royaltyVaultIpId.
   * @param royaltyVaultIpId the id of the royalty vault.
   * @returns A Promise that resolves to an object containing the royalty vault address.
   */
  public async getRoyaltyVaultAddress(royaltyVaultIpId: Hex): Promise<Address> {
    const isRoyaltyVaultIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
      id: getAddress(royaltyVaultIpId, "royaltyVaultIpId"),
    });
    if (!isRoyaltyVaultIpIdRegistered) {
      throw new Error(`The royalty vault IP with id ${royaltyVaultIpId} is not registered.`);
    }
    return await this.royaltyModuleClient.ipRoyaltyVaults({ ipId: royaltyVaultIpId });
  }

  private async transferClaimedTokensFromIpToWallet({
    ipAccount,
    claimedTokens,
  }: TransferClaimedTokensFromIpToWalletParams) {
    const txHashes: Hex[] = [];
    const transferToken = async (token: Address, amount: bigint) => {
      if (amount <= 0) {
        return;
      }
      const hash = await ipAccount.execute({
        to: token,
        value: BigInt(0),
        operation: 0,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [this.walletAddress, amount],
        }),
      });
      await this.rpcClient.waitForTransactionReceipt({ hash });
      txHashes.push(hash);
    };
    for (const { token, amount } of claimedTokens) {
      await transferToken(token, amount);
    }
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

  private async unwrapWIPTokens(claimedTokens: IpRoyaltyVaultImplRevenueTokenClaimedEvent[]) {
    const txHashes: Hex[] = [];
    for (const { token, amount } of claimedTokens) {
      if (token !== WIP_TOKEN_ADDRESS || !amount) {
        continue;
      }
      const hash = await this.wrappedIpClient.withdraw({
        value: amount,
      });
      txHashes.push(hash);
      await this.rpcClient.waitForTransactionReceipt({ hash });
    }
    return txHashes;
  }
}
