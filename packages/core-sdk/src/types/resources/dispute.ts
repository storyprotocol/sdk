import { Address } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";

export type RaiseDisputeRequest = {
  targetIpId: Address;
  cid: string;
  targetTag: string;
  liveness: bigint | number | string;
  bond: bigint | number | string;
  txOptions?: TxOptions;
};

export type RaiseDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  disputeId?: bigint;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  data?: Address;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  data: Address;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
};
