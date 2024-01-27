import IPAccountImplABI from "./json/IPAccountImpl.abi";
import errorsJson from "./json/Errors.json";

export const ErrorsAbi = errorsJson;

export const IPAccountImplMerged = [...IPAccountImplABI, ...ErrorsAbi];
