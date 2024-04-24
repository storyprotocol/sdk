import { Hex } from "viem";

import { TxOptions } from "../options";

export type Dispute = {
  targetIpId: Hex; // The ipId that is the target of the dispute
  disputeInitiator: Hex; // The address of the dispute initiator
  arbitrationPolicy: Hex; // The address of the arbitration policy
  linkToDisputeEvidence: string; // The link of the dispute evidence
  targetTag: string; // The target tag of the dispute
  currentTag: string; // The current tag of the dispute
};

export type RaiseDisputeRequest = {
  targetIpId: Hex;
  arbitrationPolicy: Hex;
  linkToDisputeEvidence: string;
  targetTag: string;
  calldata?: Hex;
  txOptions?: TxOptions;
};

export type RaiseDisputeResponse = {
  txHash: string;
  disputeId?: Hex;
  arbitrationPolicy?: Hex;
};

export type SetDisputeJudgementRequest = {
  disputeId: number;
  decision: boolean;
  calldata?: Hex;
  txOptions?: TxOptions;
};

export type SetDisputeJudgementResponse = {
  txHash: string;
  disputeId?: bigint;
  decision?: boolean;
  data?: Hex;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  calldata?: Hex;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash: string;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  data: Hex;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash: string;
};
