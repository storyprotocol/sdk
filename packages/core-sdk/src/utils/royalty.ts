import { Address } from "viem";

import { NativeRoyaltyPolicy, RoyaltyPolicyInput } from "../types/resources/royalty";
import { chain, validateAddress } from "./utils";
import { royaltyPolicyLapAddress, royaltyPolicyLrpAddress } from "../abi/generated";
import { ChainIds } from "../types/config";

export const royaltyPolicyInputToAddress = (
  input: RoyaltyPolicyInput,
  chainId: ChainIds,
): Address => {
  // if input is string, validate and return address
  if (typeof input === "string") {
    return validateAddress(input);
  }
  switch (input) {
    case NativeRoyaltyPolicy.LAP:
      return royaltyPolicyLapAddress[chain[chainId]];
    case NativeRoyaltyPolicy.LRP:
      return royaltyPolicyLrpAddress[chain[chainId]];
  }
};
