import { formatAbi } from "abitype";
import { getAddress } from "viem";

import ModuleRegistryABI from "./json/ModuleRegistry.abi";

export const ModuleRegistryRaw = ModuleRegistryABI;
export const ModuleRegistryReadable = formatAbi(ModuleRegistryRaw);

export const ModuleRegistryConfig = {
  abi: ModuleRegistryRaw,
  address: getAddress(process.env.MODULE_REGISTRY || process.env.NEXT_PUBLIC_MODULE_REGISTRY || ""),
};
