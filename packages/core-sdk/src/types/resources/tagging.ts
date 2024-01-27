import { Address } from "viem";

import { QueryOptions, TxOptions } from "../options";

export type Tag = {
  id: string;
  ipId: Address;
  tag: string;
};

export type ListTagRequest = {
  options?: QueryOptions;
};

export type ListTagResponse = {
  data: Tag[];
};

export type GetTagRequest = {
  id: string;
};

export type GetTagResponse = {
  data: Tag;
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
