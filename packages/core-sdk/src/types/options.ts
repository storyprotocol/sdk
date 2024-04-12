export type TxOptions = {
  waitForTransaction?: boolean;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  numBlockConfirmations?: number;
};
