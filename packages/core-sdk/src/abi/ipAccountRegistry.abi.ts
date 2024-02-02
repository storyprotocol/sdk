import { formatAbi } from "abitype";
import { getAddress } from "viem";
import * as dotenv from "dotenv";

import IPAccountRegistryABI from "./json/IIPAccountRegistry.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const IPAccountRegistryRaw = IPAccountRegistryABI;
export const IPAccountRegistryReadable = formatAbi(IPAccountRegistryRaw);

export const IPAccountRegistryConfig = {
  abi: IPAccountRegistryRaw,
  address: getAddress(
    process.env.IP_ACCOUNT_REGISTRY || process.env.NEXT_PUBLIC_IP_ACCOUNT_REGISTRY || "",
  ),
};
