import { getAddress } from "viem";
import * as dotenv from "dotenv";

import IPAccountRegistryABI from "./json/ipAccountRegistry.json";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const ipAccountRegistryAbi = IPAccountRegistryABI;

export const ipAccountRegistryConfig = {
  abi: ipAccountRegistryAbi,
  address: getAddress(
    process.env.IP_ACCOUNT_REGISTRY || process.env.NEXT_PUBLIC_IP_ACCOUNT_REGISTRY || "",
  ),
};
