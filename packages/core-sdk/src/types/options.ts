import { WaitForTransactionReceiptParameters } from "viem";

export interface TxOptions extends Omit<WaitForTransactionReceiptParameters, "hash"> {
  // Whether or not to wait for the transaction so you
  // can receive a transaction receipt in return (which
  // contains data about the transaction and return values).
  waitForTransaction?: boolean;
  // When the time of setting this option, the transaction will
  // not submit and execute, it will only encode the abi and
  // function data and return.
  encodedTxDataOnly?: boolean;
  // // The number of confirmations (blocks that have passed) to wait before resolving.
  // confirmations?: number;
  // // Optional callback to emit if the transaction has been replaced.
  // onReplaced?: (object: {
  //   reason: "replaced" | "repriced" | "cancelled";
  //   replacedTransaction: Transaction;
  //   transaction: Transaction;
  //   transactionReceipt: TransactionReceipt;
  // }) => void;
  // // Polling frequency (in ms). Defaults to the Viem Client's pollingInterval config.
  // pollingInterval?: number;
  // // Number of times to retry if the transaction or block is not found.
  // retryCount?: number;
  // // Time to wait (in ms) between retries.
  // retryDelay?: number;
  // // set timeout for waitForTransaction
  // timeout?: number;
}

export type WithTxOptions<T> = T & {
  txOptions?: TxOptions;
};
