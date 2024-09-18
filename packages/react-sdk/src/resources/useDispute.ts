import {
  RaiseDisputeRequest,
  RaiseDisputeResponse,
  CancelDisputeRequest,
  CancelDisputeResponse,
  ResolveDisputeRequest,
  ResolveDisputeResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { withLoadingErrorHandling } from "../withLoadingErrorHandling";

const useDispute = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    raiseDispute: false,
    cancelDispute: false,
    resolveDispute: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    raiseDispute: null,
    cancelDispute: null,
    resolveDispute: null,
  });

  /**
   * Raises a dispute on a given ipId
   * @param request - The request object containing necessary data to raise a dispute.
   *   @param request.targetIpId - The IP ID that is the target of the dispute.
   *   @param request.arbitrationPolicy - The address of the arbitration policy.
   *   @param request.linkToDisputeEvidence - The link to the dispute evidence.
   *   @param request.targetTag - The target tag of the dispute.
   *   @param request.calldata - Optional calldata to initialize the policy.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a RaiseDisputeResponse containing the transaction hash.
   * @throws `NotRegisteredIpId` if targetIpId is not registered in the IPA Registry.
   * @throws `NotWhitelistedDisputeTag` if targetTag is not whitelisted.
   * @throws `ZeroLinkToDisputeEvidence` if linkToDisputeEvidence is empty
   * @calls raiseDispute(address _targetIpId, string memory _linkToDisputeEvidence, bytes32 _targetTag, bytes calldata _data) external nonReentrant returns (uint256) {
   * @emits DisputeRaised (disputeId_, targetIpId, msg.sender, arbitrationPolicy, linkToDisputeEvidence, targetTag, calldata);
   */
  const raiseDispute = withLoadingErrorHandling<
    RaiseDisputeRequest,
    RaiseDisputeResponse
  >(
    "raiseDispute",
    client.dispute.raiseDispute.bind(client.dispute),
    setLoadings,
    setErrors
  );

  /**
   * Cancels an ongoing dispute
   * @param request - The request object containing details to cancel the dispute.
   *   @param request.disputeId The ID of the dispute to be cancelled.
   *   @param request.calldata Optional additional data used in the cancellation process.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a CancelDisputeResponse containing the transaction hash.
   * @throws NotInDisputeState, if the currentTag of the Dispute is not being disputed
   * @throws NotDisputeInitiator, if the transaction executor is not the one that initiated the dispute
   * @throws error if the Dispute&#39;s ArbitrationPolicy contract is not valid
   * @calls cancelDispute(uint256 _disputeId, bytes calldata _data) external nonReentrant {
   * @emits DisputeCancelled (_disputeId, _data);
   */
  const cancelDispute = withLoadingErrorHandling<
    CancelDisputeRequest,
    CancelDisputeResponse
  >(
    "cancelDispute",
    client.dispute.cancelDispute.bind(client.dispute),
    setLoadings,
    setErrors
  );

  /**
   * Resolves a dispute after it has been judged
   * @param request - The request object containing details to resolve the dispute.
   *   @param request.disputeId The ID of the dispute to be resolved.
   *   @param request.data The data to resolve the dispute.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a ResolveDisputeResponse.
   * @throws NotAbleToResolve, if currentTag is still in dispute (i.e still needs a judgement to be set)
   * @throws NotDisputeInitiator, if the transaction executor is not the one that initiated the dispute
   * @emits DisputeResolved (_disputeId)
   */
  const resolveDispute = withLoadingErrorHandling<
    ResolveDisputeRequest,
    ResolveDisputeResponse
  >(
    "resolveDispute",
    client.dispute.resolveDispute.bind(client.dispute),
    setLoadings,
    setErrors
  );

  return {
    loadings,
    errors,
    raiseDispute,
    cancelDispute,
    resolveDispute,
  };
};
export default useDispute;
