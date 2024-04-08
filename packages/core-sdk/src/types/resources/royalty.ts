import { Hex } from "viem";

import { TxOptions } from "../options";

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

export type CollectRoyaltyTokensRequest = {
  ancestorIpId: Hex;
  derivativeId: Hex;
  txOptions?: TxOptions;
};

export type CollectRoyaltyTokensResponse = {
  txHash: string;
};

export type RoyaltyData = [
  isUnlinkableToParents: boolean,
  ipRoyaltyVault: Hex,
  royaltyStack: bigint,
  ancestorsAddresses: Hex,
  ancestorsRoyalties: bigint[],
];

export type ClaimableRevenueRequest = {
  account: Hex;
  snapshotId: bigint;
  token: Hex;
  txOptions?: TxOptions;
};

export type ClaimableRevenueResponse = {
  claimableRevenueAmount: bigint;
  txHash: string;
};

export type PayRoyaltyOnBehalfRequest = {
  receiverIpId: Hex;
  payerIpId: Hex;
  token: Hex;
  amount: bigint;
  txOptions?: TxOptions;
};

export type PayRoyaltyOnBehalfResponse = {
  txHash: string;
};

export type ApproveResponse = {
  txHash: string;
  success: boolean;
};
