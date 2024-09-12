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
}

export type WithTxOptions<T> = T & {
  txOptions?: TxOptions;
};
