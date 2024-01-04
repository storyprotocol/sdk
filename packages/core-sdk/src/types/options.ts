export type TxOptions = {
  waitForTransaction?: boolean;
  gasPrice?: bigint;
  numBlockConfirmations?: number;
};

export type QueryOptions = {
  pagination?: {
    offset?: number; // starting from 0
    limit?: number;
  };
};
