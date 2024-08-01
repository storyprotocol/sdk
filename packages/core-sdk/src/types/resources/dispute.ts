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
  encodedTxData?: MethodEncode;
  disputeId?: bigint;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  calldata?: Address;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash?: string;
  encodedTxData?: MethodEncode;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  data: Address;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash?: string;
  encodedTxData?: MethodEncode;
};
