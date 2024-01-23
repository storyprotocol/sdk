import { formatAbi } from "abitype";
import { getAddress } from "viem";

import IPAccountRegistryABI from "./json/IPAccountRegistry.abi";

export const IPAccountRegistryRaw = IPAccountRegistryABI;
export const IPAccountRegistryReadable = formatAbi(IPAccountRegistryRaw);

export const IPAccountRegistryConfig = {
  abi: IPAccountRegistryRaw,
  address: getAddress(
    process.env.IP_ACCOUNT_REGISTRY || process.env.NEXT_PUBLIC_IP_ACCOUNT_REGISTRY || "",
  ),
};
