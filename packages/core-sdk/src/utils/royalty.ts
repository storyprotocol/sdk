import { Address } from "viem";

import { chain, validateAddress } from "./utils";
import { royaltyPolicyLapAddress, royaltyPolicyLrpAddress } from "../abi/generated";
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
