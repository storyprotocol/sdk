import { Address } from "viem";

import { TxOptions } from "../options";
import { MethodEncode } from "../../abi/generated";

export type RaiseDisputeRequest = {
  targetIpId: Address;
  arbitrationPolicy: Address;
  linkToDisputeEvidence: string;
  targetTag: string;
  calldata?: Address;
  txOptions?: TxOptions;
};

export type RaiseDisputeResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
  disputeId?: bigint;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  calldata?: Address;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  data: Address;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
};
