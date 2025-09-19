import { Address } from "viem";

import { RevShareInput } from "../common";
import { SupportedChainIds } from "../config";
import { LicenseTermsInput } from "../resources/license";
import { RoyaltyPolicyInput } from "../resources/royalty";

export type NonCommercialSocialRemixingRequest = {
  /** Optional overrides for the default license terms. */
  override?: Partial<LicenseTermsInput>;
  /**
   * The chain ID to use for this license flavor.
   *
   * @default aeneid
   */
  chainId?: SupportedChainIds;
};

export type CommercialRemixRequest = {
  /** The fee to be paid when minting a license. */
  defaultMintingFee: bigint | number;
  /** Percentage of revenue that must be shared with the licensor. Must be between 0 and 100. */
  commercialRevShare: RevShareInput;
  /** The ERC20 token to be used to pay the minting fee */
  currency: Address;
  /**
   * The type of royalty policy to be used.
   *
   * @default LAP
   */
  royaltyPolicy?: RoyaltyPolicyInput;

  /**
   * The chain ID to use for this license flavor.
   *
   * @default aeneid
   */
  chainId?: SupportedChainIds;
  /** Optional overrides for the default license terms. */
  override?: Partial<LicenseTermsInput>;
};

export type CommercialUseRequest = {
  /** The fee to be paid when minting a license. */
  defaultMintingFee: bigint | number;
  /** The ERC20 token to be used to pay the minting fee. */
  currency: Address;
  /**
   * The type of royalty policy to be used.
   *
   * @default LAP
   */
  royaltyPolicy?: RoyaltyPolicyInput;
  /**
   * The chain ID to use for this license flavor.
   *
   * @default aeneid
   */
  chainId?: SupportedChainIds;
  /** Optional overrides for the default license terms. */
  override?: Partial<LicenseTermsInput>;
};

export type CreativeCommonsAttributionRequest = {
  /** The ERC20 token to be used to pay the minting fee. */
  currency: Address;
  /**
   * The type of royalty policy to be used.
   *
   * @default LAP
   */
  royaltyPolicy?: RoyaltyPolicyInput;
  /**
   * The chain ID to use for this license flavor.
   *
   * @default aeneid
   */
  chainId?: SupportedChainIds;
  /** Optional overrides for the default license terms. */
  override?: Partial<LicenseTermsInput>;
};
