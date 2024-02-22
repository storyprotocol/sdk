import { TxOptions } from "../options";

export type IPAccountExecuteRequest = {
  accountAddress: `0x${string}`;
  to: `0x${string}`;
  value: number;
  data: `0x${string}`;
  txOptions?: TxOptions;
};

export type IPAccountExecuteResponse = {
  txHash: string;
};

export type IPAccountExecuteWithSigRequest = {
  accountAddress: `0x${string}`;
  to: `0x${string}`;
  value: number;
  data: `0x${string}`;
  signer: `0x${string}`;
  deadline: number;
  signature: `0x${string}`;
  txOptions?: TxOptions;
};

export type IPAccountExecuteWithSigResponse = {
  txHash: string;
};
