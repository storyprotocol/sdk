import {
  Address,
  decodeEventLog,
  encodeFunctionData,
  erc20Abi,
  Hex,
  PublicClient,
  TransactionReceipt,
  zeroAddress,
} from "viem";

import { handleError } from "../utils/errors";
import {
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
  Erc20TokenClient,
  IpAccountImplClient,
  IpAssetRegistryClient,
  ipRoyaltyVaultImplAbi,
  IpRoyaltyVaultImplEventClient,
  IpRoyaltyVaultImplReadOnlyClient,
  Multicall3Client,
  RoyaltyModuleClient,
  royaltyWorkflowsAbi,
  royaltyWorkflowsAddress,
  SimpleWalletClient,
} from "../abi/generated";
import { IPAccountClient } from "./ipAccount";
import { getAddress, validateAddress, validateAddresses } from "../utils/utils";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { contractCallWithWipFees } from "../utils/wipFeeUtils";
import { WipSpender } from "../types/utils/wip";
import { simulateAndWriteContract } from "../utils/contract";

export class RoyaltyClient {
  public royaltyModuleClient: RoyaltyModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public ipAccountClient: IPAccountClient;
  public ipRoyaltyVaultImplReadOnlyClient: IpRoyaltyVaultImplReadOnlyClient;
  public ipRoyaltyVaultImplEventClient: IpRoyaltyVaultImplEventClient;
  public multicall3Client: Multicall3Client;
  public wipClient: Erc20TokenClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly walletAddress: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.royaltyModuleClient = new RoyaltyModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.ipRoyaltyVaultImplReadOnlyClient = new IpRoyaltyVaultImplReadOnlyClient(rpcClient);
    this.ipRoyaltyVaultImplEventClient = new IpRoyaltyVaultImplEventClient(rpcClient);
    this.ipAccountClient = new IPAccountClient(rpcClient, wallet);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.wipClient = new Erc20TokenClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.walletAddress = wallet.account!.address;
  }

  public async claimAllRevenue(req: ClaimAllRevenueRequest): Promise<ClaimAllRevenueResponse> {
    try {
      const ancestorIpId = validateAddress(req.ancestorIpId);
      const claimer = validateAddress(req.claimer);
      const childIpIds = validateAddresses(req.childIpIds);
      const royaltyPolicies = validateAddresses(req.royaltyPolicies);
      const currencyTokens = validateAddresses(req.currencyTokens);

      // todo: use generated code when aeneid explorer is available
      const { txHash, receipt } = await simulateAndWriteContract({
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        waitForTransaction: true,
        data: {
          abi: royaltyWorkflowsAbi,
          address: royaltyWorkflowsAddress[1315],
          functionName: "claimAllRevenue",
          args: [ancestorIpId, claimer, childIpIds, royaltyPolicies, currencyTokens],
        },
      });
      const txHashes: Hex[] = [];
      txHashes.push(txHash);

      // determine if the claimer is an IP owned by the wallet
      const isClaimerIp = await this.ipAssetRegistryClient.isRegistered({
        id: claimer,
      });
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, claimer);
      let ownsClaimer = claimer === this.walletAddress;
      if (isClaimerIp) {
        const ipOwner = await ipAccount.owner();
        ownsClaimer = ipOwner === this.walletAddress;
      }

      // if wallet does not own the claimer then we cannot auto claim or unwrap
      if (!ownsClaimer) {
        return { receipt, txHashes };
      }

      const claimedTokens = this.getClaimedTokensFromReceipt(receipt!);
      const skipTransfer = req.claimOptions?.autoTransferAllClaimedTokensFromIp === false;
      const skipUnwrapIp = req.claimOptions?.autoUnwrapIpTokens === false;

      // transfer claimed tokens from IP to wallet if wallet owns IP
      if (!skipTransfer && isClaimerIp && ownsClaimer) {
        const hashes = await this.transferClaimedTokensFromIpToWallet({
          ipAccount,
          skipUnwrapIp,
          claimedTokens,
        });
        txHashes.push(...hashes);
      } else if (!skipUnwrapIp && this.walletAddress === claimer) {
        // if the claimer is the wallet, then we can unwrap any claimed WIP tokens
        for (const { token, amount } of claimedTokens) {
          if (token !== WIP_TOKEN_ADDRESS) {
            continue;
          }
          const hash = await this.wipClient.withdraw({
            value: amount,
          });
          txHashes.push(hash);
          await this.rpcClient.waitForTransactionReceipt({ hash });
        }
      }
      return { receipt, claimedTokens, txHashes };
    } catch (error) {
      handleError(error, "Failed to claim all revenue");
    }
  }

  /**
   * Allows the function caller to pay royalties to the receiver IP asset on behalf of the payer IP asset.
   * @param request - The request object that contains all data needed to pay royalty on behalf.
   *   @param request.receiverIpId The ipId that receives the royalties.
   *   @param request.payerIpId The ID of the IP asset that pays the royalties.
   *   @param request.token The token to use to pay the royalties.
   *   @param request.amount The amount to pay.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async payRoyaltyOnBehalf(
    request: PayRoyaltyOnBehalfRequest,
  ): Promise<PayRoyaltyOnBehalfResponse> {
    try {
      const { receiverIpId, payerIpId, token, amount, wipOptions, txOptions } = request;
      const sender = this.wallet.account!.address;
      const payAmount = BigInt(amount);
      if (payAmount <= 0n) {
        throw new Error("The amount to pay must be number greater than 0.");
      }
      const isReceiverRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(receiverIpId, "request.receiverIpId"),
      });
      if (!isReceiverRegistered) {
        throw new Error(`The receiver IP with id ${receiverIpId} is not registered.`);
      }
      if (getAddress(payerIpId, "request.payerIpId") && payerIpId !== zeroAddress) {
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
        token: getAddress(token, "request.token"),
        amount: BigInt(amount),
      };

      const encodedTxData = this.royaltyModuleClient.payRoyaltyOnBehalfEncode(req);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }
      const contractCall = () => {
        return this.royaltyModuleClient.payRoyaltyOnBehalf(req);
      };

      // auto wrap wallet's IP to WIP if paying WIP
      if (token === WIP_TOKEN_ADDRESS) {
        const wipSpenders: WipSpender[] = [
          {
            address: this.royaltyModuleClient.address,
            amount: payAmount,
          },
        ];
        return contractCallWithWipFees({
          totalFees: payAmount,
          wipOptions,
          multicall3Client: this.multicall3Client,
          rpcClient: this.rpcClient,
          wipClient: this.wipClient,
          wipSpenders,
          contractCall,
          sender,
          wallet: this.wallet,
          txOptions,
          encodedTxs: [encodedTxData],
        });
      } else {
        const txHash = await contractCall();
        return { txHash };
      }
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

  private getClaimedTokensFromReceipt(receipt: TransactionReceipt): ClaimedToken[] {
    const eventName = "RevenueTokenClaimed";
    const claimedTokens: ClaimedToken[] = [];
    for (const log of receipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: eventName,
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === eventName) {
          claimedTokens.push({
            token: event.args.token,
            amount: event.args.amount,
          });
        }
      } catch (e) {
        /* empty */
      }
    }
    return claimedTokens;
  }

  private async transferClaimedTokensFromIpToWallet({
    ipAccount,
    skipUnwrapIp,
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

      // auto unwrap WIP tokens once they are transferred
      if (token === WIP_TOKEN_ADDRESS && !skipUnwrapIp) {
        const withdrawalHash = await this.wipClient.withdraw({
          value: amount,
        });
        txHashes.push(withdrawalHash);
        await this.rpcClient.waitForTransactionReceipt({ hash: withdrawalHash });
      }
    };
    for (const { token, amount } of claimedTokens) {
      await transferToken(token, amount);
    }
    return txHashes;
  }
}
