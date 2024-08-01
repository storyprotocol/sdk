import { Address } from "viem";

import { TxOptions } from "../options";
import { MethodEncode } from "../../abi/generated";

export type RoyaltyPolicyApiResponse = {
  data: RoyaltyPolicy;
};

export type RoyaltyPolicy = {
  id: Address; // ipId
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
  parentIpId: Address;
  royaltyVaultIpId: Address;
  txOptions?: TxOptions;
};

export type CollectRoyaltyTokensResponse = {
  txHash?: string;
  encodedTxData?: MethodEncode;
  royaltyTokensCollected?: bigint;
};

export type RoyaltyData = [
  isUnlinkableToParents: boolean,
  ipRoyaltyVault: Address,
  royaltyStack: bigint,
  ancestorsAddresses: Address,
  ancestorsRoyalties: bigint[],
];

export type ClaimableRevenueRequest = {
  royaltyVaultIpId: Address;
  account: Address;
  snapshotId: string | number | bigint;
  token: Address;
};

export type ClaimableRevenueResponse = bigint;

export type PayRoyaltyOnBehalfRequest = {
  receiverIpId: Address;
  payerIpId: Address;
  token: Address;
  amount: string | number | bigint;
  txOptions?: TxOptions;
};

export type PayRoyaltyOnBehalfResponse = {
  txHash?: string;
  encodedTxData?: MethodEncode;
};

export type SnapshotRequest = {
  royaltyVaultIpId: Address;
  txOptions?: TxOptions;
};

export type ClaimRevenueRequest = {
  snapshotIds: string[] | number[] | bigint[];
  token: Address;
  royaltyVaultIpId: Address;
  account?: Address;
  txOptions?: TxOptions;
};

export type ClaimRevenueResponse = {
  txHash?: string;
  encodedTxData?: MethodEncode;
  claimableToken?: bigint;
};

export type SnapshotResponse = {
  txHash?: string;
  encodedTxData?: MethodEncode;
  snapshotId?: bigint;
};
