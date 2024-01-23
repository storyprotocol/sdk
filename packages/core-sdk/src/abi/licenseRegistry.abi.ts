import { formatAbi } from "abitype";
import { getAddress } from "viem";

import LicenseRegistryABI from "./json/LicenseRegistry.abi";

export const LicenseRegistryRaw = LicenseRegistryABI;
export const LicenseRegistryReadable = formatAbi(LicenseRegistryRaw);

export const LicenseRegistryConfig = {
  abi: LicenseRegistryRaw,
  address: getAddress(
    process.env.LICENSE_REGISTRY || process.env.NEXT_PUBLIC_LICENSE_REGISTRY || "",
  ),
};
