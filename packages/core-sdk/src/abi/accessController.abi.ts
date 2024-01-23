import { formatAbi } from "abitype";
import { getAddress } from "viem";

import AccessControllerABI from "./json/AccessController.abi";

export const AccessControllerRaw = AccessControllerABI;
export const AccessControllerReadable = formatAbi(AccessControllerRaw);

export const AccessControllerConfig = {
  abi: AccessControllerRaw,
  address: getAddress(
    process.env.ACCESS_CONTROLLER || process.env.NEXT_PUBLIC_ACCESS_CONTROLLER || "",
  ),
};
