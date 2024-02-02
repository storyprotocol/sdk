import { formatAbi } from "abitype";
import { getAddress } from "viem";
import * as dotenv from "dotenv";

import LicenseRegistryABI from "./json/LicenseRegistry.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const LicenseRegistryRaw = LicenseRegistryABI;
export const LicenseRegistryReadable = formatAbi(LicenseRegistryRaw);

export const LicenseRegistryConfig = {
  abi: LicenseRegistryRaw,
  address: getAddress(
    process.env.LICENSE_REGISTRY || process.env.NEXT_PUBLIC_LICENSE_REGISTRY || "",
  ),
};
