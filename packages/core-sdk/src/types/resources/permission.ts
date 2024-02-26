import { TxOptions } from "../options";

export type SetPermissionsRequest = {
  ipId: `0x${string}`;
  signer: `0x${string}`;
  to: `0x${string}`;
  func?: string;
  permission: number;
  txOptions?: TxOptions;
};

export type SetPermissionsResponse = {
  txHash: string;
  success?: boolean;
};
