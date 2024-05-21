import { Address } from "viem";

import { TxOptions } from "../options";

export type SetPermissionsRequest = {
  ipId: Address;
  signer: Address;
  to: Address;
  func?: string;
  permission: AccessPermission;
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
