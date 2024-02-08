import { getAddress } from "viem";
import * as dotenv from "dotenv";

import DisputeModuleABI from "./json/DisputeModule.abi";
import ErrorsABI from "./json/Errors.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const disputeModuleAbiWithErrors = [...DisputeModuleABI, ...ErrorsABI];

export const DisputeModuleConfig = {
  abi: disputeModuleAbiWithErrors,
  address: getAddress(process.env.DISPUTE_MODULE || process.env.NEXT_PUBLIC_DISPUTE_MODULE || ""),
};
