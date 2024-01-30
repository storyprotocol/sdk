import { formatAbi } from "abitype";
import { getAddress } from "viem";
import * as dotenv from "dotenv";

import TaggingModuleABI from "./json/TaggingModule.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const TaggingModuleRaw = TaggingModuleABI;
export const TaggingModuleReadable = formatAbi(TaggingModuleRaw);

export const TaggingModuleConfig = {
  abi: TaggingModuleRaw,
  address: getAddress(process.env.TAGGING_MODULE || process.env.NEXT_PUBLIC_TAGGING_MODULE || ""),
};
