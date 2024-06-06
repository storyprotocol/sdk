import { Address, WalletClient } from "viem";

import { SetPermissionsRequest } from "./resources/permission";

export type TypedData = {
  interface: string; // i.e. "(address,uint256)"
  data: unknown[];
};

export type PermissionSignatureRequest = {
  ipId: Address;
  nonce: number | bigint;
  deadline: bigint;
  wallet: WalletClient;
  chainId: bigint;
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
  permissionFunc?: "setPermission" | "setBatchPermissions";
};
