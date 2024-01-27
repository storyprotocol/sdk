import { getAddress } from "viem";

import AccessControllerABI from "./json/AccessController.abi";
import errorsJson from "./json/Errors.json";

export const ErrorsAbi = errorsJson;

export const AccessControllerABImerged = [...AccessControllerABI, ...ErrorsAbi];

export const AccessControllerConfig = {
  abi: AccessControllerABImerged,
  address: getAddress(
    process.env.ACCESS_CONTROLLER || process.env.NEXT_PUBLIC_ACCESS_CONTROLLER || "",
  ),
};
