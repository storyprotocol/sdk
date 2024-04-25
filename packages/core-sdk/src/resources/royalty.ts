import { Hex, PublicClient, encodeFunctionData } from "viem";

import { handleError } from "../utils/errors";
import {
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  RoyaltyVaultAddress,
  SnapshotRequest,
  SnapshotResponse,
  claimRevenueRequest,
  claimRevenueResponse,
} from "../types/resources/royalty";
import {
  IpAssetRegistryClient,
  IpRoyaltyVaultImplClient,
  RoyaltyModuleClient,
  RoyaltyPolicyLapClient,
  SimpleWalletClient,
  ipRoyaltyVaultImplAbi,
} from "../abi/generated";
import { IPAccountClient } from "./ipAccount";

export class RoyaltyClient {
  public royaltyPolicyLapClient: RoyaltyPolicyLapClient;
  public royaltyModuleClient: RoyaltyModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public ipAccountClient: IPAccountClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.royaltyPolicyLapClient = new RoyaltyPolicyLapClient(rpcClient, wallet);
    this.royaltyModuleClient = new RoyaltyModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.ipAccountClient = new IPAccountClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * Allows ancestors to claim the royalty tokens and any accrued revenue tokens
   * @param request - The request object that contains all data needed to collect royalty tokens.
   *   @param request.parentIpId The ip id of the ancestor to whom the royalty tokens belong to.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional the amount of royalty tokens collected if waitForTxn is set to true.
   * @emits RoyaltyTokensCollected (ancestorIpId, royaltyTokensCollected)
   */
  public async collectRoyaltyTokens(
    request: CollectRoyaltyTokensRequest,
  ): Promise<CollectRoyaltyTokensResponse> {
    try {
      const isParentIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: request.parentIpId,
      });
      if (!isParentIpIdRegistered) {
        throw new Error(`The parent IP with id ${request.parentIpId} is not registered.`);
      }
      const proxyAddress = await this.getRoyaltyVaultProxyAddress(request.royaltyVaultIpId);
      const ipRoyaltyVault = new IpRoyaltyVaultImplClient(
        this.rpcClient,
        this.wallet,
        proxyAddress,
      );
      const txHash = await ipRoyaltyVault.collectRoyaltyTokens({
        ancestorIpId: request.parentIpId,
      });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = ipRoyaltyVault.parseTxRoyaltyTokensCollectedEvent(txReceipt);
        return {
          txHash: txHash,
          royaltyTokensCollected: targetLogs[0].royaltyTokensCollected.toString(),
        };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to collect royalty tokens");
    }
  }

  /**
   * Allows the function caller to pay royalties to the receiver IP asset on behalf of the payer IP asset.
   * @param request - The request object that contains all data needed to pay royalty on behalf.
   *   @param request.receiverIpId The ipId that receives the royalties.
   *   @param request.payerIpId The ID of the IP asset that pays the royalties.
   *   @param request.token The token to use to pay the royalties.
   *   @param request.amount The amount to pay.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async payRoyaltyOnBehalf(
    request: PayRoyaltyOnBehalfRequest,
  ): Promise<PayRoyaltyOnBehalfResponse> {
    try {
      const isReceiverRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: request.receiverIpId,
      });
      if (!isReceiverRegistered) {
        throw new Error(`The receiver IP with id ${request.receiverIpId} is not registered.`);
      }
      const isPayerRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: request.payerIpId,
      });
      if (!isPayerRegistered) {
        throw new Error(`The payer IP with id ${request.payerIpId} is not registered.`);
      }
      const txHash = await this.royaltyModuleClient.payRoyaltyOnBehalf({
        receiverIpId: request.receiverIpId,
        payerIpId: request.payerIpId,
        token: request.token,
        amount: BigInt(request.amount),
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to pay royalty on behalf");
    }
  }

  /**
   * Calculates the amount of revenue token claimable by a token holder at certain snapshot.
   * @param request - The request object that contains all data needed to claim Revenue.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.account The address of the token holder.
   *   @param request.snapshotId The snapshot id.
   *   @param request.token The revenue token to claim.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that contains the amount of revenue token claimable
   */
  public async claimableRevenue(
    request: ClaimableRevenueRequest,
  ): Promise<ClaimableRevenueResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultProxyAddress(request.royaltyVaultIpId);
      const ipRoyaltyVault = new IpRoyaltyVaultImplClient(
        this.rpcClient,
        this.wallet,
        proxyAddress,
      );
      const amount = await ipRoyaltyVault.claimableRevenue({
        account: request.account,
        snapshotId: BigInt(request.snapshotId),
        token: request.token,
      });
      return amount.toString();
    } catch (error) {
      handleError(error, "Failed to calculate claimable revenue");
    }
  }

  /**
   * Allows token holders to claim by a list of snapshot ids based on the token balance at certain snapshot
   * @param request - The request object that contains all data needed to claim revenue.
   *   @param request.snapshotIds The list of snapshot ids.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.token The revenue token to claim.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional claimableToken if waitForTxn is set to true.
   * @emits RevenueTokenClaimed (claimer, token, amount).
   */
  public async claimRevenue(request: claimRevenueRequest): Promise<claimRevenueResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultProxyAddress(request.royaltyVaultIpId);
      const ipRoyaltyVault = new IpRoyaltyVaultImplClient(
        this.rpcClient,
        this.wallet,
        proxyAddress,
      );
      const iPAccountExecuteResponse = await this.ipAccountClient.execute({
        to: proxyAddress,
        value: 0,
        accountAddress: request.account,
        txOptions: {
          waitForTransaction: true,
        },
        data: encodeFunctionData({
          abi: ipRoyaltyVaultImplAbi,
          functionName: "claimRevenueBySnapshotBatch",
          args: [request.snapshotIds.map((item) => BigInt(item)), request.token],
        }),
      });
      const txHash = iPAccountExecuteResponse.txHash as Hex;
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          hash: txHash,
        });
        const targetLogs = ipRoyaltyVault.parseTxRevenueTokenClaimedEvent(txReceipt);
        return { txHash, claimableToken: targetLogs[0].amount.toString() };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to claim revenue");
    }
  }
  /**
   * Snapshots the claimable revenue and royalty token amounts.
   * @param request - The request object that contains all data needed to snapshot.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional snapshotId if waitForTxn is set to true.
   * @emits SnapshotCompleted (snapshotId, snapshotTimestamp, unclaimedTokens).
   */
  public async snapshot(request: SnapshotRequest): Promise<SnapshotResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultProxyAddress(request.royaltyVaultIpId);
      const ipRoyaltyVault = new IpRoyaltyVaultImplClient(
        this.rpcClient,
        this.wallet,
        proxyAddress,
      );
      const txHash = await ipRoyaltyVault.snapshot();
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = ipRoyaltyVault.parseTxSnapshotCompletedEvent(txReceipt);
        return { txHash, snapshotId: targetLogs[0].snapshotId.toString() };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to snapshot");
    }
  }

  private async getRoyaltyVaultProxyAddress(royaltyVaultIpId: Hex): Promise<RoyaltyVaultAddress> {
    const isRoyaltyVaultIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
      id: royaltyVaultIpId,
    });
    if (!isRoyaltyVaultIpIdRegistered) {
      throw new Error(`The royalty vault IP with id ${royaltyVaultIpId} is not registered.`);
    }
    const data = await this.royaltyPolicyLapClient.getRoyaltyData({
      ipId: royaltyVaultIpId,
    });
    if (!data[1] || data[1] === "0x") {
      throw new Error(`The royalty vault IP with id ${royaltyVaultIpId} address is not set.`);
    }
    return data[1];
  }
}
