import { Address, Hex, WalletClient } from "viem";

import { SetPermissionsRequest } from "./resources/permission";

export type TypedData = {
  interface: string; // i.e. "(address,uint256)"
  data: unknown[];
};

export type PermissionSignatureRequest = {
  ipId: Address;
  state: Hex;
  deadline: string | number | bigint;
  wallet: WalletClient;
  chainId: string | number | bigint;
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
  permissionFunc?: "setPermission" | "setBatchPermissions";
};

export type PermissionSignatureResponse = Hex;
