import { Address } from "viem";

import { TxOptions } from "../options";

export type Tag = {
  id: string;
  ipId: Address;
  tag: string;
};

export type SetTagRequest = {
  tag: string;
  ipId: Address;
  txOptions?: TxOptions;
};

export type SetTagResponse = {
  txHash: string;
};

export type RemoveTagRequest = {
  tag: string;
  ipId: Address;
  txOptions?: TxOptions;
};

export type RemoveTagResponse = {
  txHash: string;
};
