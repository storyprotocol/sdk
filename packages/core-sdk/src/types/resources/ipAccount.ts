import { Address } from "viem";

import { TxOptions } from "../options";

export type IPAccountExecuteRequest = {
  ipId: Address;
  to: Address;
  value: number;
  data: Address;
  txOptions?: TxOptions;
};

export type IPAccountExecuteResponse = {
  txHash?: string;
  encodedTx?: string;
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
  encodedTx?: string;
};
