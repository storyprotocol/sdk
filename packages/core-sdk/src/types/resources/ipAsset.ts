import { Hex } from "viem";

import { TxOptions } from "../options";

export type RegisterIpResponse = {
  txHash?: string;
  ipId?: Hex;
};

export type RegisterRequest = {
  tokenContract: Hex;
  tokenId: string;
  txOptions?: TxOptions;
};
