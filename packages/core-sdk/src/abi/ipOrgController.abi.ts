import { getAddress } from "viem";
import * as dotenv from "dotenv";

import IPOrgControllerABI from "./json/IPOrgController.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const ipOrgControllerAbi = IPOrgControllerABI;

export const ipOrgControllerConfig = {
  abi: ipOrgControllerAbi,
  address: getAddress(
    process.env.IP_ORG_CONTROLLER_CONTRACT ||
      process.env.NEXT_PUBLIC_IP_ORG_CONTROLLER_CONTRACT ||
      "",
  ),
};
