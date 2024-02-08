import { TxOptions } from "../options";

export type Tag = {
  id: string;
  ipId: `0x${string}`;
  tag: string;
};

export type SetTagRequest = {
  tag: string;
  ipId: `0x${string}`;
  txOptions?: TxOptions;
};

export type SetTagResponse = {
  txHash: string;
};

export type RemoveTagRequest = {
  tag: string;
  ipId: `0x${string}`;
  txOptions?: TxOptions;
};

export type RemoveTagResponse = {
  txHash: string;
};
