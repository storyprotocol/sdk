import { Address } from "viem";

import { TxOptions } from "../options";

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
