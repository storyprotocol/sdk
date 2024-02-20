import { TxOptions } from "../options";

export type Dispute = {
  targetIpId: `0x${string}`; // The ipId that is the target of the dispute
  disputeInitiator: `0x${string}`; // The address of the dispute initiator
  arbitrationPolicy: `0x${string}`; // The address of the arbitration policy
  linkToDisputeEvidence: string; // The link of the dispute evidence
  targetTag: string; // The target tag of the dispute
  currentTag: string; // The current tag of the dispute
};

export type RaiseDisputeRequest = {
  targetIpId: `0x${string}`;
  arbitrationPolicy: `0x${string}`;
  linkToDisputeEvidence: string;
  targetTag: string;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

export type RaiseDisputeResponse = {
  txHash: string;
  disputeId?: `0x${string}`;
  arbitrationPolicy?: `0x${string}`;
};

export type SetDisputeJudgementRequest = {
  disputeId: number;
  decision: boolean;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

export type SetDisputeJudgementResponse = {
  txHash: string;
  disputeId?: bigint;
  decision?: boolean;
  data?: `0x${string}`;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash: string;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash: string;
};
