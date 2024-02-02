import { formatAbi } from "abitype";
import { getAddress } from "viem";
import * as dotenv from "dotenv";

import DisputeModuleABI from "./json/DisputeModule.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const DisputeModuleRaw = DisputeModuleABI;
export const DisputeModuleReadable = formatAbi(DisputeModuleRaw);

export const DisputeModuleConfig = {
  abi: DisputeModuleRaw,
  address: getAddress(process.env.DISPUTE_MODULE || process.env.NEXT_PUBLIC_DISPUTE_MODULE || ""),
};
