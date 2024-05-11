import { Address } from "viem";

import { TxOptions } from "../options";

export type SetPermissionsRequest = {
  ipId: Address;
  signer: Address;
  to: Address;
  func?: string;
  permission: number;
  txOptions?: TxOptions;
};

export type SetPermissionsResponse = {
  txHash: string;
  success?: boolean;
};
