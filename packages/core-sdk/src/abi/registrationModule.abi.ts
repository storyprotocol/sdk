import { formatAbi } from "abitype";
import { getAddress } from "viem";

import RegistrationModuleABI from "./json/RegistrationModule.abi";

export const RegistrationModuleRaw = RegistrationModuleABI;
export const RegistrationModuleReadable = formatAbi(RegistrationModuleRaw);

export const RegistrationModuleConfig = {
  abi: RegistrationModuleRaw,
  address: getAddress(
    process.env.REGISTRATION_MODULE || process.env.NEXT_PUBLIC_REGISTRATION_MODULE || "",
  ),
};
