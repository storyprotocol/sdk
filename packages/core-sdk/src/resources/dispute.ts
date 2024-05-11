import { PublicClient, stringToHex } from "viem";

import { handleError } from "../utils/errors";
import {
  CancelDisputeRequest,
  CancelDisputeResponse,
  RaiseDisputeRequest,
  RaiseDisputeResponse,
  ResolveDisputeRequest,
  ResolveDisputeResponse,
} from "../types/resources/dispute";
import { DisputeModuleClient, SimpleWalletClient } from "../abi/generated";

export class DisputeClient {
  private readonly rpcClient: PublicClient;
  public disputeModuleClient: DisputeModuleClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.rpcClient = rpcClient;
    this.disputeModuleClient = new DisputeModuleClient(rpcClient, wallet);
  }

  /**
   * Raises a dispute on a given ipId
   * @param request - The request object containing necessary data to raise a dispute.
   *   @param request.targetIpId - The IP ID that is the target of the dispute.
   *   @param request.arbitrationPolicy - The address of the arbitration policy.
   *   @param request.linkToDisputeEvidence - The link to the dispute evidence.
   *   @param request.targetTag - The target tag of the dispute.
   *   @param request.calldata - Optional calldata to initialize the policy.
   *   @param request.txOptions - Optional transaction options.
   * @returns A Promise that resolves to a RaiseDisputeResponse containing the transaction hash.
   * @throws `NotRegisteredIpId` if targetIpId is not registered in the IPA Registry.
   * @throws `NotWhitelistedDisputeTag` if targetTag is not whitelisted.
   * @throws `ZeroLinkToDisputeEvidence` if linkToDisputeEvidence is empty
   * @calls raiseDispute(address _targetIpId, string memory _linkToDisputeEvidence, bytes32 _targetTag, bytes calldata _data) external nonReentrant returns (uint256) {
   * @emits DisputeRaised (disputeId_, targetIpId, msg.sender, arbitrationPolicy, linkToDisputeEvidence, targetTag, calldata);
   */
  public async raiseDispute(request: RaiseDisputeRequest): Promise<RaiseDisputeResponse> {
    try {
      const txHash = await this.disputeModuleClient.raiseDispute({
        targetIpId: request.targetIpId,
        linkToDisputeEvidence: request.linkToDisputeEvidence,
        targetTag: stringToHex(request.targetTag, { size: 32 }),
        data: request.calldata || "0x",
      });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.disputeModuleClient.parseTxDisputeRaisedEvent(txReceipt);
        return {
          txHash: txHash,
          disputeId: targetLogs[0].disputeId,
        };
      }
      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to raise dispute");
    }
  }

  /**
   * Cancels an ongoing dispute
   * @param request - The request object containing details to cancel the dispute.
   *   @param request.disputeId The ID of the dispute to be cancelled.
   *   @param request.calldata Optional additional data used in the cancellation process.
   * @returns A Promise that resolves to a CancelDisputeResponse containing the transaction hash.
   * @throws NotInDisputeState, if the currentTag of the Dispute is not being disputed
   * @throws NotDisputeInitiator, if the transaction executor is not the one that initiated the dispute
   * @throws error if the Dispute's ArbitrationPolicy contract is not valid
   * @calls cancelDispute(uint256 _disputeId, bytes calldata _data) external nonReentrant {
   * @emits DisputeCancelled (_disputeId, _data);
   */
  public async cancelDispute(request: CancelDisputeRequest): Promise<CancelDisputeResponse> {
    try {
      const txHash = await this.disputeModuleClient.cancelDispute({
        disputeId: BigInt(request.disputeId),
        data: request.calldata ? request.calldata : "0x",
      });

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      }

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to cancel dispute");
    }
  }

  /**
   * Resolves a dispute after it has been judged
   * @param request - The request object containing details to resolve the dispute.
   *   @param request.disputeId The ID of the dispute to be resolved.
   *   @param request.data The data to resolve the dispute.
   * @returns A Promise that resolves to a ResolveDisputeResponse.
   * @throws NotAbleToResolve, if currentTag is still in dispute (i.e still needs a judgement to be set)
   * @throws NotDisputeInitiator, if the transaction executor is not the one that initiated the dispute
   * @emits DisputeResolved (_disputeId)
   */
  public async resolveDispute(request: ResolveDisputeRequest): Promise<ResolveDisputeResponse> {
    try {
      const txHash = await this.disputeModuleClient.resolveDispute({
        disputeId: BigInt(request.disputeId),
        data: request.data,
      });

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      }

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to cancel dispute");
    }
  }
}
