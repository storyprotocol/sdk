import { getAddress } from "viem";

import RelationshipModuleABI from "./json/RelationshipModule.abi";

export const relationshipModuleAbi = RelationshipModuleABI;

export const relationshipModuleConfig = {
  abi: relationshipModuleAbi,
  address: getAddress(
    process.env.RELATIONSHIP_MODULE_CONTRACT ||
      process.env.NEXT_PUBLIC_RELATIONSHIP_MODULE_CONTRACT ||
      "",
  ),
};
