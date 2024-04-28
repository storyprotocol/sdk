import { Hex } from "viem";

import { TxOptions } from "../options";

export type IPAccountExecuteRequest = {
  accountAddress: Hex;
  to: Hex;
  value: number;
  data: Hex;
  txOptions?: TxOptions;
};

export type IPAccountExecuteResponse = {
  txHash: string;
};

export type IPAccountExecuteWithSigRequest = {
  accountAddress: Hex;
  to: Hex;
  value: number;
  data: Hex;
  signer: Hex;
  deadline: number;
  signature: Hex;
  txOptions?: TxOptions;
};

export type IPAccountExecuteWithSigResponse = {
  txHash: string;
};
