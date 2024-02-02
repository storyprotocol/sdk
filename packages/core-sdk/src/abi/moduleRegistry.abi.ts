import { formatAbi } from "abitype";
import { getAddress } from "viem";
import * as dotenv from "dotenv";

import ModuleRegistryABI from "./json/ModuleRegistry.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const ModuleRegistryRaw = ModuleRegistryABI;
export const ModuleRegistryReadable = formatAbi(ModuleRegistryRaw);

export const ModuleRegistryConfig = {
  abi: ModuleRegistryRaw,
  address: getAddress(process.env.MODULE_REGISTRY || process.env.NEXT_PUBLIC_MODULE_REGISTRY || ""),
};
