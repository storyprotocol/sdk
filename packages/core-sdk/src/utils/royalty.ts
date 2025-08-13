import { Address } from "viem";

import { chain, validateAddress } from "./utils";
import { royaltyPolicyLapAddress, royaltyPolicyLrpAddress } from "../abi/generated";
import { RevShareType } from "../types/common";
import { SupportedChainIds } from "../types/config";
import { NativeRoyaltyPolicy, RoyaltyPolicyInput } from "../types/resources/royalty";

export const royaltyPolicyInputToAddress = (
  input?: RoyaltyPolicyInput,
  chainId?: SupportedChainIds,
): Address => {
  const transferredChainId = chain[chainId || "aeneid"];
  let address: Address;
  switch (input) {
    case undefined:
    case NativeRoyaltyPolicy.LAP:
      address = royaltyPolicyLapAddress[transferredChainId];
      break;
    case NativeRoyaltyPolicy.LRP:
      address = royaltyPolicyLrpAddress[transferredChainId];
      break;
    default:
      address = validateAddress(input);
  }
  return address;
};

export const getRevenueShare = (
  revShare: number | string,
  type: RevShareType = RevShareType.COMMERCIAL_REVENUE_SHARE,
): number => {
  const revShareNumber = Number(revShare);
  if (isNaN(revShareNumber)) {
    throw new Error(`${type} must be a valid number.`);
  }

  if (revShareNumber < 0 || revShareNumber > 100) {
    throw new Error(`${type} must be between 0 and 100.`);
  }
  return revShareNumber * 10 ** 6;
};
