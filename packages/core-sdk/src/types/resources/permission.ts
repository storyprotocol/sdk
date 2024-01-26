import { QueryOptions, TxOptions } from "../options";

export type setPermissionsRequest = {
  ipAsset: string;
  signer: string;
  to: string;
  func: string;
  permission: number;
  txOptions?: TxOptions;
};

export type Permission = {
  id: string;
  ipAccount: string;
  permission: string;
  signer: string;
  to: string;
  func: string;
  blockTimestamp: string;
  blockNumber: string;
};

export type setPermissionsResponse = {
  txHash: string;
};

export type GetPermissionRequest = {
  permissionId: string;
};

export type GetPermissionResponse = {
  data: Permission;
};

export type ListPermissionsRequest = {
  options: QueryOptions;
};

export type ListPermissionsResponse = {
  data: Permission[];
};
