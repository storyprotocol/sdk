import { Address } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";

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
  encodedTxData?: EncodedTxData;
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
  encodedTxData?: EncodedTxData;
  claimableToken?: bigint;
};
export type SnapshotResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  snapshotId?: bigint;
};
type RoyaltyClaimDetail = {
  childIpId: Address;
  royaltyPolicy: Address;
  currencyToken: Address;
  amount: bigint | string | number;
};
export type TransferToVaultAndSnapshotAndClaimByTokenBatchRequest = {
  ancestorIpId: Address;
  royaltyClaimDetails: RoyaltyClaimDetail[];
  claimer?: Address;
  txOptions?: TxOptions;
};
export type TransferToVaultAndSnapshotAndClaimByTokenBatchResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  snapshotId?: bigint;
  amountsClaimed?: bigint;
};
export type TransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest = {
  ancestorIpId: Address;
  unclaimedSnapshotIds: bigint[] | number[] | string[];
  claimer?: Address;
  royaltyClaimDetails: RoyaltyClaimDetail[];
  txOptions?: TxOptions;
};
export type TransferToVaultAndSnapshotAndClaimBySnapshotBatchResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  snapshotId?: bigint;
  amountsClaimed?: bigint;
};
export type SnapshotAndClaimByTokenBatchRequest = {
  royaltyVaultIpId: Address;
  currencyTokens: Address[];
  claimer?: Address;
  txOptions?: TxOptions;
};
export type SnapshotAndClaimByTokenBatchResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  snapshotId?: bigint;
  amountsClaimed?: bigint;
};
export type SnapshotAndClaimBySnapshotBatchRequest = {
  royaltyVaultIpId: Address;
  unclaimedSnapshotIds: bigint[] | number[] | string[];
  currencyTokens: Address[];
  claimer?: Address;
  txOptions?: TxOptions;
};

export type SnapshotAndClaimBySnapshotBatchResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  snapshotId?: bigint;
  amountsClaimed?: bigint;
};
