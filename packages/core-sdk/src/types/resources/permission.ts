import { TxOptions } from "../options";

export type setPermissionsRequest = {
  ipId: `0x${string}`;
  signer: string;
  to: string;
  func: string;
  permission: number;
  txOptions?: TxOptions;
};

export type setPermissionsResponse = {
  txHash: string;
  success?: boolean;
};
