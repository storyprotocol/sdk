import { formatAbi } from "abitype";
import { getAddress } from "viem";
import * as dotenv from "dotenv";

import TaggingModuleABI from "./json/TaggingModule.abi";
import errorsJson from "./json/Errors.json";

if (typeof process !== "undefined") {
  dotenv.config();
}

if (typeof process !== "undefined") {
  dotenv.config();
}

export const TaggingModuleRaw = TaggingModuleABI;
export const TaggingModuleReadable = formatAbi(TaggingModuleRaw);

export const ErrorsAbi = errorsJson;

export const TaggingModuleABImerged = [...TaggingModuleABI, ...ErrorsAbi];

export const TaggingModuleConfig = {
  abi: TaggingModuleABImerged,
  address: getAddress(process.env.TAGGING_MODULE || process.env.NEXT_PUBLIC_TAGGING_MODULE || ""),
};
