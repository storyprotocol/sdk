import { Address, Hex, WalletClient } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData, SimpleWalletClient } from "../../abi/generated";

export type SetPermissionsRequest = {
  /** The IP ID that grants the permission for `signer`. */
  ipId: Address;
  /**
   * The address that will be granted permission to execute transactions.
   * This address will be able to call functions on `to`
   * on behalf of the IP Account {@link https://docs.story.foundation/docs/ip-account}.
   */
  signer: Address;
  /** The address that can be called by the `signer` (currently only modules can be `to`). */
  to: Address;
  /** The new permission level of {@link AccessPermission}. */
  permission: AccessPermission;
  /**
   * The function selector string of `to` that can be called by the `signer` on behalf of the IP Account {@link https://docs.story.foundation/docs/ip-account}.
   * Be default, it allows all functions.
   * @default 0x00000000
   */
  func?: string;
  txOptions?: TxOptions;
};

export type SetPermissionsResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  success?: boolean;
};

export type SetAllPermissionsRequest = {
  /** The IP ID that grants the permission for `signer`. */
  ipId: Address;
  /** The address of the signer receiving the permissions. */
  signer: Address;
  /** The new permission level of {@link AccessPermission}. */
  permission: AccessPermission;
  txOptions?: TxOptions;
};
/**
 * Permission level
 */
export enum AccessPermission {
  /**
   * ABSTAIN means having not enough information to make decision at
   * current level, deferred decision to up.
   */
  ABSTAIN,
  /** ALLOW means the permission is granted to transaction signer to call the function. */
  ALLOW,
  /** DENY means the permission is denied to transaction signer to call the function. */
  DENY,
}

export type CreateSetPermissionSignatureRequest = {
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number | string;
} & SetPermissionsRequest;

export type SetBatchPermissionsRequest = {
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
  txOptions?: TxOptions;
};

export type CreateBatchPermissionSignatureRequest = {
  /** The ip id that grants the permission for `signer`. */
  ipId: Address;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number | string;
} & SetBatchPermissionsRequest;

export type PermissionSignatureRequest = {
  ipId: Address;
  state: Hex;
  /** The deadline for the signature in seconds. */
  deadline: string | number | bigint;
  wallet: WalletClient;
  chainId: string | number | bigint;
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
};

export type SignatureRequest = {
  state: Hex;
  to: Address;
  encodeData: Hex;
  wallet: SimpleWalletClient;
  verifyingContract: Address;
  /** The deadline for the signature in seconds. */
  deadline: bigint | number | string;
  chainId: number | bigint | string;
};

export type SignatureResponse = { signature: Hex; nonce: Hex };
