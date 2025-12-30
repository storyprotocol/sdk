import { Address, Hash, TransactionReceipt } from "viem";

import { EncodedTxData } from "../../abi/generated";
import {
  FeeInput,
  LicenseTermsIdInput,
  LicensingConfigInput,
  RevShareInput,
  TokenAmountInput,
} from "../common";
import { TxOptions, WithErc20AndWipOptions, WithTxOptions } from "../options";
import { RoyaltyPolicyInput } from "./royalty";
/**
 * This structure defines the terms for a Programmable IP License (PIL).
 * These terms can be attached to IP Assets.
 *
 * For more information, see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-terms | PIL}.
 **/
export type LicenseTerms = {
  /** Indicates whether the license is transferable or not. */
  transferable: boolean;
  /** The address of the royalty policy contract which required to StoryProtocol in advance. */
  royaltyPolicy: Address;
  /** The default minting fee to be paid when minting a license. */
  defaultMintingFee: bigint;
  /** The expiration period of the license. */
  expiration: bigint;
  /** Indicates whether the work can be used commercially or not. */
  commercialUse: boolean;
  /** Whether attribution is required when reproducing the work commercially or not. */
  commercialAttribution: boolean;
  /** Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced. */
  commercializerChecker: Address;
  /** The data to be passed to the commercializer checker contract. */
  commercializerCheckerData: Address;
  /** Percentage of revenue that must be shared with the licensor. */
  commercialRevShare: number;
  /** The maximum revenue that can be generated from the commercial use of the work. */
  commercialRevCeiling: bigint;
  /** Indicates whether the licensee can create derivatives of his work or not. */
  derivativesAllowed: boolean;
  /** Indicates whether attribution is required for derivatives of the work or not. */
  derivativesAttribution: boolean;
  /** Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not. */
  derivativesApproval: boolean;
  /** Indicates whether the licensee must license derivatives of the work under the same terms or not. */
  derivativesReciprocal: boolean;
  /** The maximum revenue that can be generated from the derivative use of the work. */
  derivativeRevCeiling: bigint;
  /** The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol. */
  currency: Address;
  /** The URI of the license terms, which can be used to fetch the offchain license terms. */
  uri: string;
};

export type LicenseTermsInput = Omit<
  LicenseTerms,
  | "defaultMintingFee"
  | "expiration"
  | "commercialRevCeiling"
  | "derivativeRevCeiling"
  | "royaltyPolicy"
  | "commercialRevShare"
> & {
  /** The default minting fee to be paid when minting a license. */
  defaultMintingFee: FeeInput;
  /** The expiration period of the license. */
  expiration: bigint | number;
  /** The maximum revenue that can be generated from the commercial use of the work. */
  commercialRevCeiling: bigint | number;
  /** The maximum revenue that can be generated from the derivative use of the work. */
  derivativeRevCeiling: bigint | number;
  /**
   * The address of the royalty policy contract.
   * @default LAP
   */
  royaltyPolicy?: RoyaltyPolicyInput;

  /**
   * Percentage of revenue that must be shared with the licensor.
   * Must be between 0 and 100 (where 100% represents 100_000_000).
   */
  commercialRevShare: RevShareInput;
};

export type RegisterPILTermsRequest = LicenseTermsInput & {
  txOptions?: TxOptions;
};

export type LicenseTermsIdResponse = bigint;

export type RegisterPILResponse = {
  licenseTermsId?: bigint;
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
};

export type AttachLicenseTermsRequest = {
  /** The address of the IP ID to which the license terms are being attached. */
  ipId: Address;
  licenseTermsId: LicenseTermsIdInput;
  /**
   * The address of the license template.
   * Defaults to {@link https://docs.story.foundation/concepts/licensing-module/license-template | PIL} address if not provided.
   */
  licenseTemplate?: Address;
  txOptions?: TxOptions;
};

export type AttachLicenseTermsResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  success?: boolean;
};

export type MintLicenseTokensRequest = {
  licensorIpId: Address;
  licenseTermsId: LicenseTermsIdInput;
  /**
   * The address of the license template.
   * Defaults to {@link https://docs.story.foundation/concepts/licensing-module/license-template | PIL} address if not provided.
   */
  licenseTemplate?: Address;
  /**
   * The maximum minting fee that the caller is willing to pay.if set to 0 then no limit.
   *
   * @default 0
   */
  maxMintingFee?: FeeInput;
  /**
   * The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
   *
   *  @default 100
   */
  maxRevenueShare?: RevShareInput;
  /**
   * The amount of license tokens to mint.
   * @default 1
   */
  amount?: TokenAmountInput;
  /** The address of the receiver. */
  receiver?: Address;
} & WithTxOptions &
  WithErc20AndWipOptions;

export type MintLicenseTokensResponse = {
  licenseTokenIds?: bigint[];
  receipt?: TransactionReceipt;
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
};

export type PredictMintingLicenseFeeRequest = {
  licensorIpId: Address;
  licenseTermsId: LicenseTermsIdInput;
  /** The amount of license tokens to mint. */
  amount: TokenAmountInput;
  /**
   * The address of the license template.
   * Defaults to {@link https://docs.story.foundation/concepts/licensing-module/license-template | PIL} address if not provided.
   */
  licenseTemplate?: Address;
  receiver?: Address;
  txOptions?: TxOptions;
};

export type SetLicensingConfigRequest = GetLicensingConfigRequest & {
  /** The licensing configuration for the license. */
  licensingConfig: LicensingConfigInput;
  txOptions?: TxOptions;
};

export type SetLicensingConfigResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  success?: boolean;
};

export type GetLicensingConfigRequest = {
  /** The address of the IP for which the configuration is being set. */
  ipId: Address;
  /** The ID of the license terms within the license template. */
  licenseTermsId: LicenseTermsIdInput;
  /**
   * The address of the license template.
   * Defaults to {@link https://docs.story.foundation/concepts/licensing-module/license-template | PIL} address if not provided.
   */
  licenseTemplate?: Address;
};

export type SetMaxLicenseTokensRequest = GetLicensingConfigRequest &
  WithTxOptions & {
    /** The total license token limit, 0 means no limit */
    maxLicenseTokens: TokenAmountInput;
  };

export type SetMaxLicenseTokens = {
  maxLicenseTokensData: (LicenseTermsDataInput | { maxLicenseTokens: bigint })[];
  licensorIpId: Address;
  licenseTermsIds: bigint[];
};

export type RegisterPilTermsAndAttachRequest = {
  ipId: Address;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /** The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint;
  txOptions?: TxOptions;
};

export type RegisterPilTermsAndAttachResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  licenseTermsIds?: bigint[];
  maxLicenseTokensTxHashes?: Hash[];
};

/**
 * The data of the license and its configuration to be attached to the IP.
 *
 * You must provide either `licenseTermsId` or `terms`:
 * - `licenseTermsId`: Use an existing pre-registered license terms
 * - `terms`: Register new license terms and attach
 *
 * If both are provided, `terms` takes priority and new terms will be registered.
 */
export type LicenseTermsDataInput = {
  /**
   * Full license terms to register and attach.
   * Use this to create new license terms.
   */
  terms?: LicenseTermsInput;
  /**
   * The ID of pre-registered license terms to attach.
   * Use this when the license terms already exist on-chain.
   */
  licenseTermsId?: LicenseTermsIdInput;
  /** The licensing configuration for the license. */
  licensingConfig?: LicensingConfigInput;
  /**
   * The max number of license tokens that can be minted from this license term.
   *
   * - When not specified, there is no limit on license token minting
   * - When specified, minting is capped at this value and the {@link https://github.com/storyprotocol/protocol-periphery-v1/blob/release/1.3/contracts/hooks/TotalLicenseTokenLimitHook.sol | TotalLicenseTokenLimitHook}
   *   is automatically configured as the {@link LicensingConfigInput.licensingHook}
   */
  maxLicenseTokens?: TokenAmountInput;
};

export type RegisterNonComSocialRemixingPILRequest = {
  txOptions?: TxOptions;
};
export type RegisterCommercialUsePILRequest = {
  /** The fee to be paid when minting a license. */
  defaultMintingFee: string | number | bigint;
  /** The ERC20 token to be used to pay the minting fee */
  currency: Address;
  /**
   * The address of the royalty policy contract.
   * Defaults to {@link https://docs.story.foundation/docs/liquid-absolute-percentage | LAP} policy address if not provided.
   */
  royaltyPolicyAddress?: Address;
  txOptions?: TxOptions;
};

export type RegisterCommercialRemixPILRequest = {
  /** The fee to be paid when minting a license. */
  defaultMintingFee: string | number | bigint;
  /**
   * Percentage of revenue that must be shared with the licensor.
   * Must be between 0 and 100 (where 100% represents 100_000_000).
   */
  commercialRevShare: number;
  /** The ERC20 token to be used to pay the minting fee */
  currency: Address;
  /**
   * The address of the royalty policy contract.
   * Defaults to {@link https://docs.story.foundation/docs/liquid-absolute-percentage | LAP} policy address if not provided.
   */
  royaltyPolicyAddress?: Address;
  txOptions?: TxOptions;
};

export type RegisterCreativeCommonsAttributionPILRequest = WithTxOptions & {
  /** The ERC20 or WIP token to be used to pay the minting fee. */
  currency: Address;
  /**
   * The address of the royalty policy contract.
   * Defaults to {@link https://docs.story.foundation/docs/liquid-absolute-percentage | LAP} policy address if not provided.
   */
  royaltyPolicyAddress?: Address;
};
/**
 * @deprecated Use `PILFlavor.nonCommercialSocialRemixing`, `PILFlavor.commercialUse`, `PILFlavor.commercialRemix`, or `PILFlavor.creativeCommonsAttribution` instead.
 *
 * The type of PIL.
 */
export enum PIL_TYPE {
  NON_COMMERCIAL_REMIX,
  COMMERCIAL_USE,
  COMMERCIAL_REMIX,
  CREATIVE_COMMONS_ATTRIBUTION,
}
