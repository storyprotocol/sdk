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
  royaltyVaultIpId: Hex;
  txOptions?: TxOptions;
};

export type CollectRoyaltyTokensResponse = {
  txHash: string;
  royaltyTokensCollected?: string;
};

export type RoyaltyData = [
  isUnlinkableToParents: boolean,
  ipRoyaltyVault: Hex,
  royaltyStack: bigint,
  ancestorsAddresses: Hex,
  ancestorsRoyalties: bigint[],
];

export type ClaimableRevenueRequest = {
  royaltyVaultIpId: Hex;
  account: Hex;
  snapshotId: string;
  token: Hex;
  txOptions?: TxOptions;
};

export type ClaimableRevenueResponse = bigint;

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

export type SnapshotRequest = {
  royaltyVaultIpId: Hex;
  txOptions?: TxOptions;
};

export type SnapshotResponse = {
  txHash: string;
  snapshotId?: bigint;
};

export type RoyaltyVaultAddress = Hex;
