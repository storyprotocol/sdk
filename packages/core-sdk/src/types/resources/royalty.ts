export type RoyaltyPolicyApiResponse = {
  data: RoyaltyPolicy;
};

export type RoyaltyPolicy = {
  id: `0x${string}`; // ipId
  targetAncestors: string[];
  targetRoyaltyAmount: string[];
};

export type RoyaltyContext = {
  targetAncestors: string[];
  targetRoyaltyAmount: number[];
  parentAncestors1: string[];
  parentAncestors2: string[];
  parentAncestorsRoyalties1: number[];
  parentAncestorsRoyalties2: number[];
};
