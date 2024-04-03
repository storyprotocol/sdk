import { Hex } from "viem";

import { TxOptions } from "../options";
export type RegisterIpResponse = {
  txHash?: string;
  ipId?: string;
};

export type RegisterRequest = {
  tokenContract: Hex;
  tokenId: string;
  txOptions?: TxOptions;
};
