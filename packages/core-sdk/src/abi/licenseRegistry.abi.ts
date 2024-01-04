import { formatAbi } from "abitype";
import { getAddress } from "viem";

import LicenseRegistryABI from "./json/LicenseRegistry.abi";

export const licenseRegistryRaw = LicenseRegistryABI;
export const licenseRegistryReadable = formatAbi(licenseRegistryRaw);

export const licenseRegistryConfig = {
  abi: licenseRegistryRaw,
  address: getAddress(process.env.NEXT_PUBLIC_LICENSE_REGISTRY_CONTRACT!),
};
