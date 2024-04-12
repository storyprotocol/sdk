export type TxOptions = {
  waitForTransaction?: boolean;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  numBlockConfirmations?: number;
};

export type WithTxOptions<T> = T & {
  txOptions?: TxOptions;
};
