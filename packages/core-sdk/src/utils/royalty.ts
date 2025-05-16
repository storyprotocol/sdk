import { Address } from "viem";

import { chain, validateAddress } from "./utils";
import { royaltyPolicyLapAddress, royaltyPolicyLrpAddress } from "../abi/generated";
import { ChainIds } from "../types/config";
import { NativeRoyaltyPolicy, RoyaltyPolicyInput } from "../types/resources/royalty";

export const royaltyPolicyInputToAddress = (
  input: RoyaltyPolicyInput,
  chainId: ChainIds,
): Address => {
  switch (input) {
    case NativeRoyaltyPolicy.LAP:
      return royaltyPolicyLapAddress[chain[chainId]];
    case NativeRoyaltyPolicy.LRP:
      return royaltyPolicyLrpAddress[chain[chainId]];
    default:
      return validateAddress(input);
  }
};
