import { Abi, getAddress } from "viem";

import { abi as DisputeModuleABI } from "./json/DisputeModule.abi.json";
import errorsJson from "./json/Errors.json";

export const ErrorsAbi = errorsJson;

const storyProtocolMerged = [...(DisputeModuleABI as Abi), ...(ErrorsAbi as Abi)];

type DisputeModuleConfigType = {
  abi: Abi;
  address: `0x${string}`;
};

export const DisputeModuleConfig: DisputeModuleConfigType = {
  abi: storyProtocolMerged,
  address: getAddress(process.env.DISPUTE_MODULE || process.env.NEXT_PUBLIC_DISPUTE_MODULE || ""),
};
