import { formatAbi } from "abitype";
import { getAddress } from "viem";

import DisputeModuleABI from "./json/DisputeModule.abi";

export const DisputeModuleRaw = DisputeModuleABI;
export const DisputeModuleReadable = formatAbi(DisputeModuleRaw);

export const DisputeModuleConfig = {
  abi: DisputeModuleRaw,
  address: getAddress(process.env.DISPUTE_MODULE || process.env.NEXT_PUBLIC_DISPUTE_MODULE || ""),
};
