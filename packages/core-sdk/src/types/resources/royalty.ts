import { Address, Hash, TransactionReceipt } from "viem";

import {
  EncodedTxData,
  IpAccountImplClient,
  IpRoyaltyVaultImplRevenueTokenClaimedEvent,
} from "../../abi/generated";
import { TokenAmountInput } from "../common";
import { WithErc20AndWipOptions, WithTxOptions } from "../options";

export type ClaimableRevenueRequest = {
  /** The IP ID of the royalty vault. */
  ipId: Address;
  /** The address of the royalty token holder. */
  claimer: Address;
  /** The revenue token to claim. */
  token: Address;
};

/** The amount of revenue token claimable. */
export type ClaimableRevenueResponse = bigint;

export type PayRoyaltyOnBehalfRequest = WithTxOptions &
  WithErc20AndWipOptions & {
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
  txHash?: Hash;
  receipt?: TransactionReceipt;
  encodedTxData?: EncodedTxData;
};

export type ClaimAllRevenueRequest = WithClaimOptions & {
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
};

export type WithClaimOptions = {
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
     * @default true
     */
    autoUnwrapIpTokens?: boolean;
  };
};
export type BatchClaimAllRevenueRequest = WithClaimOptions & {
  /** The ancestor IPs from which the revenue is being claimed. */
  ancestorIps: (Omit<ClaimAllRevenueRequest, "ancestorIpId" | "claimOptions"> & {
    /** The address of the ancestor IP from which the revenue is being claimed. */
    ipId: Address;
  })[];
  options?: {
    /**
     * Use multicall to batch the calls `claimAllRevenue` into one transaction when possible.
     *
     * If only 1 ancestorIp is provided, multicall will not be used.
     * @default true
     */
    useMulticallWhenPossible?: boolean;
  };
};

export type BatchClaimAllRevenueResponse = {
  txHashes: Hash[];
  receipts: TransactionReceipt[];
  claimedTokens?: IpRoyaltyVaultImplRevenueTokenClaimedEvent[];
};

export type ClaimAllRevenueResponse = {
  txHashes: Hash[];
  receipt: TransactionReceipt;
  /**
   * Aggregate list of all tokens claimed across all transactions in the batch.
   * Events are aggregated by unique combinations of claimer and token addresses,
   * summing up the amounts for the same claimer-token pairs.
   */
  claimedTokens: IpRoyaltyVaultImplRevenueTokenClaimedEvent[];
};

export type TransferClaimedTokensFromIpToWalletParams = {
  ipAccount: IpAccountImplClient;
  claimedTokens: IpRoyaltyVaultImplRevenueTokenClaimedEvent[];
};

/**
 * Native royalty policy created by the Story team
 * - LAP: {@link https://docs.story.foundation/concepts/royalty-module/liquid-absolute-percentage | Liquid Absolute Percentage}
 * - LRP: {@link https://docs.story.foundation/concepts/royalty-module/liquid-relative-percentage | Liquid Relative Percentage}
 */
export enum NativeRoyaltyPolicy {
  LAP = 0,
  LRP,
}

/**
 * Allow custom royalty policy address or use a native royalty policy enum.
 * For custom royalty policy, @see {@link https://docs.story.foundation/concepts/royalty-module/external-royalty-policies | External Royalty Policies}
 */
export type RoyaltyPolicyInput = Address | NativeRoyaltyPolicy;

export type TransferToVaultRequest = WithTxOptions & {
  royaltyPolicy: RoyaltyPolicyInput;
  ipId: Address;
  ancestorIpId: Address;
  /** the token address to transfer */
  token: Address;
};

export type ClaimerInfo = {
  ownsClaimer: boolean;
  isClaimerIp: boolean;
  ipAccount: IpAccountImplClient;
};
