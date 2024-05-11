import { Address } from "viem";

import { TxOptions } from "../options";

export type Dispute = {
  targetIpId: Address; // The ipId that is the target of the dispute
  disputeInitiator: Address; // The address of the dispute initiator
  arbitrationPolicy: Address; // The address of the arbitration policy
  linkToDisputeEvidence: string; // The link of the dispute evidence
  targetTag: string; // The target tag of the dispute
  currentTag: string; // The current tag of the dispute
};

export type RaiseDisputeRequest = {
  targetIpId: Address;
  arbitrationPolicy: Address;
  linkToDisputeEvidence: string;
  targetTag: string;
  calldata?: Address;
  txOptions?: TxOptions;
};

export type RaiseDisputeResponse = {
  txHash: string;
  disputeId?: bigint;
  arbitrationPolicy?: Address;
};

export type SetDisputeJudgementRequest = {
  disputeId: number;
  decision: boolean;
  calldata?: Address;
  txOptions?: TxOptions;
};

export type SetDisputeJudgementResponse = {
  txHash: string;
  disputeId?: bigint;
  decision?: boolean;
  data?: Address;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  calldata?: Address;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash: string;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  data: Address;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash: string;
};
