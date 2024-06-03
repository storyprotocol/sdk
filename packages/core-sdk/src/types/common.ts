import { Address, LocalAccount, PrivateKeyAccount } from "viem";

import { SetPermissionsRequest } from "./resources/permission";

export type TypedData = {
  interface: string; // i.e. "(address,uint256)"
  data: unknown[];
};

export type SignatureHelpParameter = {
  ipId: Address;
  nonce: number | bigint;
  deadline: bigint;
  account: LocalAccount | PrivateKeyAccount;
  chainId: bigint;
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
  permissionFunc?: "setPermission" | "setBatchPermissions";
};
