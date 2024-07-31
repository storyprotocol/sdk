import { Address } from "viem";

import { TxOptions } from "../options";
import { MethodEncode } from "../../abi/generated";

export type IPAccountExecuteRequest = {
  ipId: Address;
  to: Address;
  value: number;
  data: Address;
  txOptions?: TxOptions;
};

export type IPAccountExecuteResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
};

export type IPAccountExecuteWithSigRequest = {
  ipId: Address;
  to: Address;
  value: number;
  data: Address;
  signer: Address;
  deadline: number | bigint | string;
  signature: Address;
  txOptions?: TxOptions;
};

export type IPAccountExecuteWithSigResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
};
