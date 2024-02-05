import * as dotenv from "dotenv";

import IPAccountImplABI from "./json/IPAccountImpl.abi";
import errorsJson from "./json/Errors.json";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const ErrorsAbi = errorsJson;
export const IPAccountImplMerged = [...IPAccountImplABI, ...ErrorsAbi];
