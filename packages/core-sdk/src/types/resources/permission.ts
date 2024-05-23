import { Address } from "viem";

import { TxOptions } from "../options";

export type SetPermissionsRequest = {
  ipId: Address;
  signer: Address;
  to: Address;
  permission: AccessPermission;
  func?: string;
  txOptions?: TxOptions;
};

export type SetPermissionsResponse = {
  txHash: string;
  success?: boolean;
};

export type SetAllPermissionsRequest = {
  ipId: Address;
  signer: Address;
  permission: AccessPermission;
  txOptions?: TxOptions;
};
/**
 * Permission level
 * @enum {number}
 **/
export enum AccessPermission {
  /* ABSTAIN means having not enough information to make decision at current level, deferred decision to up. */
  ABSTAIN,
  /* ALLOW means the permission is granted to transaction signer to call the function. */
  ALLOW,
  /* DENY means the permission is denied to transaction signer to call the function. */
  DENY,
}

export type CreateSetPermissionSignatureRequest = {
  deadline?: bigint | number | string;
} & SetPermissionsRequest;

export type SetBatchPermissionsRequest = {
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
  txOptions?: TxOptions;
};

export type CreateBatchPermissionSignatureRequest = {
  ipId: Address;
  deadline?: bigint | number | string;
} & SetBatchPermissionsRequest;
