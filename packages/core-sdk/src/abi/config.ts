import { getAddress } from "viem";

import IPAccountImplABI from "./json/IPAccountImpl.abi";
import IRoyaltyPolicyLAPABI from "./json/IRoyaltyPolicyLAP.abi";
import ErrorsABI from "./json/Errors.abi";
import { contractAddress } from "../utils/env";
import { SupportedChainIds } from "../types/config";

export const IPAccountABI = [...IPAccountImplABI, ...ErrorsABI];

export const getRoyaltyPolicyLAPConfig = (chain: SupportedChainIds) => ({
  abi: [...IRoyaltyPolicyLAPABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].RoyaltyPolicyLAP),
});
