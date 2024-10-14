import { Address, Hex, PublicClient, zeroAddress } from "viem";

import { handleError } from "../utils/errors";
import {
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  SnapshotRequest,
  SnapshotResponse,
  TransferToVaultAndSnapshotAndClaimByTokenBatchRequest,
  TransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest,
  SnapshotAndClaimByTokenBatchRequest,
  SnapshotAndClaimBySnapshotBatchRequest,
} from "../types/resources/royalty";
import {
  IpAssetRegistryClient,
  IpRoyaltyVaultImplClient,
  RoyaltyModuleClient,
  RoyaltyWorkflowsClient,
  RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest,
  RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest,
  RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest,
  RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest,
  SimpleWalletClient,
} from "../abi/generated";
import { IPAccountClient } from "./ipAccount";
import { getAddress } from "../utils/utils";

export class RoyaltyClient {
  public royaltyModuleClient: RoyaltyModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public ipAccountClient: IPAccountClient;
  public royaltyWorkflowsClient: RoyaltyWorkflowsClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.royaltyModuleClient = new RoyaltyModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.royaltyWorkflowsClient = new RoyaltyWorkflowsClient(rpcClient, wallet);
    this.ipAccountClient = new IPAccountClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
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
      const { receiverIpId, payerIpId, token, amount } = request;
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
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.royaltyModuleClient.payRoyaltyOnBehalfEncode(req) };
      } else {
        const txHash = await this.royaltyModuleClient.payRoyaltyOnBehalf(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
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
   * @returns A Promise that contains the amount of revenue token claimable
   */
  public async claimableRevenue(
    request: ClaimableRevenueRequest,
  ): Promise<ClaimableRevenueResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultAddress(
        getAddress(request.royaltyVaultIpId, "request.royaltyVaultIpId"),
      );
      const ipRoyaltyVault = new IpRoyaltyVaultImplClient(
        this.rpcClient,
        this.wallet,
        proxyAddress,
      );
      return await ipRoyaltyVault.claimableRevenue({
        account: getAddress(request.account, "request.account"),
        snapshotId: BigInt(request.snapshotId),
        token: getAddress(request.token, "request.token"),
      });
    } catch (error) {
      handleError(error, "Failed to calculate claimable revenue");
    }
  }

  /**
   * Snapshots the claimable revenue and royalty token amounts.
   * @param request - The request object that contains all data needed to snapshot.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional snapshotId if waitForTxn is set to true.
   * @emits SnapshotCompleted (snapshotId, snapshotTimestamp, unclaimedTokens).
   */
  public async snapshot(request: SnapshotRequest): Promise<SnapshotResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultAddress(
        getAddress(request.royaltyVaultIpId, "request.royaltyVaultIpId"),
      );
      const ipRoyaltyVault = new IpRoyaltyVaultImplClient(
        this.rpcClient,
        this.wallet,
        proxyAddress,
      );
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipRoyaltyVault.snapshotEncode() };
      } else {
        const txHash = await ipRoyaltyVault.snapshot();
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs = ipRoyaltyVault.parseTxSnapshotCompletedEvent(txReceipt);
          return { txHash, snapshotId: targetLogs[0].snapshotId };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to snapshot");
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

  public async transferToVaultAndSnapshotAndClaimByTokenBatch(
    request: TransferToVaultAndSnapshotAndClaimByTokenBatchRequest,
  ) {
    try {
      if (request.royaltyClaimDetails.length === 0) {
        throw new Error("The royaltyClaimDetails must provide at least one item.");
      }
      const isAncestorIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.ancestorIpId, "request.ancestorIpId"),
      });
      if (!isAncestorIpIdRegistered) {
        throw new Error(`The ancestor IP with id ${request.ancestorIpId} is not registered.`);
      }
      const object: RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest = {
        ancestorIpId: getAddress(request.ancestorIpId, "request.ancestorIpId"),
        royaltyClaimDetails: request.royaltyClaimDetails.map((item) => ({
          childIpId: getAddress(item.childIpId, "item.childIpId"),
          royaltyPolicy: getAddress(item.royaltyPolicy, "item.royaltyPolicy"),
          currencyToken: getAddress(item.currencyToken, "item.currencyToken"),
          amount: BigInt(item.amount),
        })),
        claimer: this.wallet.account!.address,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.royaltyWorkflowsClient.transferToVaultAndSnapshotAndClaimByTokenBatchEncode(
              object,
            ),
        };
      } else {
        const txHash =
          await this.royaltyWorkflowsClient.transferToVaultAndSnapshotAndClaimByTokenBatch(object);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to transfer to vault and snapshot and claim by token batch");
    }
  }

  public async transferToVaultAndSnapshotAndClaimBySnapshotBatch(
    request: TransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest,
  ) {
    try {
      if (request.royaltyClaimDetails.length === 0) {
        throw new Error("The royaltyClaimDetails must provide at least one item.");
      }
      const isAncestorIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.ancestorIpId, "request.ancestorIpId"),
      });
      if (!isAncestorIpIdRegistered) {
        throw new Error(`The ancestor IP with id ${request.ancestorIpId} is not registered.`);
      }
      const object: RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest = {
        ancestorIpId: getAddress(request.ancestorIpId, "request.ancestorIpId"),
        royaltyClaimDetails: request.royaltyClaimDetails.map((item) => ({
          childIpId: getAddress(item.childIpId, "item.childIpId"),
          royaltyPolicy: getAddress(item.royaltyPolicy, "item.royaltyPolicy"),
          currencyToken: getAddress(item.currencyToken, "item.currencyToken"),
          amount: BigInt(item.amount),
        })),
        claimer: this.wallet.account!.address,
        unclaimedSnapshotIds: request.unclaimedSnapshotIds.map((item) => BigInt(item)),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.royaltyWorkflowsClient.transferToVaultAndSnapshotAndClaimBySnapshotBatchEncode(
              object,
            ),
        };
      } else {
        const txHash =
          await this.royaltyWorkflowsClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch(
            object,
          );
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to transfer to vault and snapshot and claim by snapshot batch");
    }
  }

  public async snapshotAndClaimByTokenBatch(request: SnapshotAndClaimByTokenBatchRequest) {
    try {
      const object: RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest = {
        ipId: getAddress(request.ipId, "request.ipId"),
        currencyTokens: request.currencyTokens.map((item) =>
          getAddress(item, "item.currencyTokens"),
        ),
        claimer: this.wallet.account!.address,
      };
      // const test = await this.getRoyaltyVaultAddress(object.ipId);
      // console.log("test", test);
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.royaltyWorkflowsClient.snapshotAndClaimByTokenBatchEncode(object),
        };
      } else {
        const txHash = await this.royaltyWorkflowsClient.snapshotAndClaimByTokenBatch(object);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to snapshot and claim by token batch");
    }
  }

  public async snapshotAndClaimBySnapshotBatch(request: SnapshotAndClaimBySnapshotBatchRequest) {
    try {
      const object: RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest = {
        ipId: getAddress(request.ipId, "request.ipId"),
        claimer: this.wallet.account!.address,
        currencyTokens: request.currencyTokens.map((item) =>
          getAddress(item, "item.currencyTokens"),
        ),
        unclaimedSnapshotIds: request.unclaimedSnapshotIds.map((item) => BigInt(item)),
      };
      // const test = await this.getRoyaltyVaultAddress(object.ipId);
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.royaltyWorkflowsClient.snapshotAndClaimBySnapshotBatchEncode(object),
        };
      } else {
        const txHash = await this.royaltyWorkflowsClient.snapshotAndClaimBySnapshotBatch(object);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to snapshot and claim by snapshot batch");
    }
  }
}
