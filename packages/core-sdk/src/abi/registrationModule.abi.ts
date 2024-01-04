import { getAddress } from "viem";
import * as dotenv from "dotenv";

import RegistrationModuleABI from "./json/RegistrationModule.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}
export const registrationModuleAbi = RegistrationModuleABI;

export const registrationModuleConfig = {
  abi: registrationModuleAbi,
  address: getAddress(
    process.env.REGISTRATION_MODULE_CONTRACT ||
      process.env.NEXT_PUBLIC_REGISTRATION_MODULE_CONTRACT ||
      "",
  ),
};
