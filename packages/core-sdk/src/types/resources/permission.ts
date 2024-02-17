import { TxOptions } from "../options";

export type setPermissionsRequest = {
  ipAccount: `0x${string}`;
  signer: `0x${string}`;
  to: `0x${string}`;
  func: string;
  permission: number;
  txOptions?: TxOptions;
};

export type setPermissionsResponse = {
  txHash: string;
  success?: boolean;
};
