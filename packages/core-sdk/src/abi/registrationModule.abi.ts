import { getAddress } from "viem";
import * as dotenv from "dotenv";

import RegistrationModuleABI from "./json/RegistrationModule.abi";
import errorsJson from "./json/Errors.json";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const ErrorsAbi = errorsJson;

const storyProtocolMerged = [...RegistrationModuleABI, ...ErrorsAbi];

export const RegistrationModuleConfig = {
  abi: storyProtocolMerged,
  address: getAddress(
    process.env.REGISTRATION_MODULE || process.env.NEXT_PUBLIC_REGISTRATION_MODULE || "",
  ),
};
