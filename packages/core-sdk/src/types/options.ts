export type TxOptions = {
  // Whether or not to wait for the transaction so you
  // can receive a transaction receipt in return (which
  // contains data about the transaction and return values).
  waitForTransaction?: boolean;
  // When the time of setting this option, the transaction will
  // not submit and execute, it will only encode the abi and
  // function data and return.
  onlyEncodeTransactions?: boolean;
  // The price (in wei) to pay per gas.
  gasPrice?: bigint;
  // Total fee per gas (in wei).
  maxFeePerGas?: bigint;
  // The number of confirmations (blocks that have passed)
  // to wait before resolving.
  numBlockConfirmations?: number;
};

export type WithTxOptions<T> = T & {
  txOptions?: TxOptions;
};
