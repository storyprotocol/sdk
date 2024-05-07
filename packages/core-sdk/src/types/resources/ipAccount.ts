import { Address } from "viem";

import { TxOptions } from "../options";

export type IPAccountExecuteRequest = {
  accountAddress: Address;
  to: Address;
  value: number;
  data: Address;
  txOptions?: TxOptions;
};

export type IPAccountExecuteResponse = {
  txHash: string;
};

export type IPAccountExecuteWithSigRequest = {
  accountAddress: Address;
  to: Address;
  value: number;
  data: Address;
  signer: Address;
  deadline: number | bigint | string;
  signature: Address;
  txOptions?: TxOptions;
};

export type IPAccountExecuteWithSigResponse = {
  txHash: string;
};
