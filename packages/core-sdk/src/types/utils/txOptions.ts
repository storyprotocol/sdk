import { Hex, PublicClient, TransactionReceipt } from "viem";

import { TxOptions } from "../options";

export type HandleTxOptionsParams = {
  txHash: Hex;
  txOptions?: TxOptions;
  rpcClient: PublicClient;
};

export type TransactionResponse = {
  txHash: Hex;

  /** Transaction receipt, only available if waitForTransaction is set to true */
  receipt?: TransactionReceipt;
};
