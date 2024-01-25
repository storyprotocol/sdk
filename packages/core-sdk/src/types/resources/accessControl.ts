import { TxOptions } from "../options";

export type setPermissionsRequest = {
  ipAccount: string;
  signer: string;
  to: string;
  func: string;
  permission: number;
  txOptions?: TxOptions;
};

export type setPermissionsResponse = {
  txHash: string;
};
