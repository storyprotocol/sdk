import { Address, Hash, TransactionReceipt } from "viem";

import { TxOptions, WithTxOptions } from "../options";
import { EncodedTxData, IpAccountImplClient } from "../../abi/generated";
import { ERC20Options } from "../utils/wip";
import { TokenAmountInput } from "../common";

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
  claimer: Address;
  token: Address;
};
export type ClaimableRevenueResponse = bigint;
export type PayRoyaltyOnBehalfRequest = WithTxOptions &
  ERC20Options & {
    /** The IP ID that receives the royalties. */
    receiverIpId: Address;
    /** The IP ID that pays the royalties. */
    payerIpId: Address;
    /** The token to use to pay the royalties. */
    token: Address;
    /** The amount to pay. */
    amount: TokenAmountInput;
  };

export type PayRoyaltyOnBehalfResponse = {
  txHash?: string;
  receipt?: TransactionReceipt;
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

/**
 * Claims all revenue from the child IPs of an ancestor IP, then transfer
 * all claimed tokens to the wallet if the wallet owns the IP or is the claimer.
 * If claimed token is WIP, it will also be converted back to IP.
 */
export type ClaimAllRevenueRequest = {
  /** The address of the ancestor IP from which the revenue is being claimed. */
  ancestorIpId: Address;
  /**
   * The address of the claimer of the currency (revenue) tokens.
   *
   * This is normally the ipId of the ancestor IP if the IP has all royalty tokens.
   * Otherwise, this would be the address that is holding the ancestor IP royalty tokens.
   */
  claimer: Address;
  /** The addresses of the child IPs from which royalties are derived. */
  childIpIds: Address[];
  /**
   * The addresses of the royalty policies, where
   * royaltyPolicies[i] governs the royalty flow for childIpIds[i].
   */
  royaltyPolicies: Address[];
  /** The addresses of the currency tokens in which royalties will be claimed */
  currencyTokens: Address[];

  claimOptions?: {
    /**
     * When enabled, all claimed tokens on the claimer are transferred to the
     * wallet address if the wallet owns the IP. If the wallet is the claimer
     * or if the claimer is not an IP owned by the wallet, then the tokens
     * will not be transferred.
     * Set to false to disable auto transferring claimed tokens from the claimer.
     *
     * @default true
     */
    autoTransferAllClaimedTokensFromIp?: boolean;

    /**
     * By default all claimed WIP tokens are converted back to IP after
     * they are transferred.
     * Set this to false to disable this behavior.
     *
     * @default false
     */
    autoUnwrapIpTokens?: boolean;
  };
};

export type ClaimedToken = {
  token: Address;
  amount: bigint;
};

export type ClaimAllRevenueResponse = {
  txHashes: Hash[];
  receipt?: TransactionReceipt;
  claimedTokens?: ClaimedToken[];
};

export type TransferClaimedTokensFromIpToWalletParams = {
  ipAccount: IpAccountImplClient;
  skipUnwrapIp: boolean;
  claimedTokens: ClaimedToken[];
};
