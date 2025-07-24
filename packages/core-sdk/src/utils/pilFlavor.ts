import { Address, zeroAddress } from "viem";

import { chain } from "./utils";
import { royaltyPolicyLapAddress, royaltyPolicyLrpAddress } from "../abi/generated";
import { SupportedChainIds } from "../types/config";
import { LicenseTerms, LicenseTermsInput, RoyaltyPolicyType } from "../types/resources/license";
import {
  CommercialRemixRequest,
  CommercialUseRequest,
  CreativeCommonsAttributionRequest,
} from "../types/utils/pilFlavor";

// PIL Document URIs
const PIL_URIS = {
  NCSR: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
  COMMERCIAL_USE:
    "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
  COMMERCIAL_REMIX:
    "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
  CC_BY:
    "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
} as const;

// Common default values to reduce duplication
const COMMON_DEFAULTS: Partial<LicenseTerms> = {
  transferable: true,
  royaltyPolicy: zeroAddress,
  defaultMintingFee: 0n,
  expiration: 0n,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: zeroAddress,
  commercialRevShare: 0,
  commercialRevCeiling: 0n,
  derivativeRevCeiling: 0n,
  currency: zeroAddress,
};

class PILFlavorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PILFlavorError";
  }
}

/**
 * Pre-configured Programmable IP License (PIL) flavors for ease of use.
 *
 * The PIL is highly configurable, but these pre-configured license terms (flavors)
 * are the most popular options that cover common use cases.
 *
 * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors | PIL Flavors Documentation}
 *
 * @example
 * ```typescript
 * // Create a commercial use license
 * const commercialLicense = PILFlavor.commercialUse({
 *   defaultMintingFee: 1000000000000000000n, // 1 IP minting fee
 *   currencyToken: "0x1234...", // currency token
 *   royaltyPolicy: "LAP"  // royalty policy
 * });
 *
 * // Create a non-commercial social remixing license
 * const remixLicense = PILFlavor.nonCommercialSocialRemixing();
 * ```
 */
export class PILFlavor {
  private static readonly _nonComSocialRemixingPIL: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: false,
    commercialAttribution: false,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    uri: PIL_URIS.NCSR,
  } as LicenseTerms;

  private static readonly _commercialUse: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: false,
    derivativesAttribution: false,
    derivativesApproval: false,
    derivativesReciprocal: false,
    uri: PIL_URIS.COMMERCIAL_USE,
  } as LicenseTerms;

  private static readonly _commercialRemix: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    uri: PIL_URIS.COMMERCIAL_REMIX,
  } as LicenseTerms;

  private static readonly _creativeCommonsAttribution: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    uri: PIL_URIS.CC_BY,
  } as LicenseTerms;

  /**
   * Gets the values to create a Non-Commercial Social Remixing licenseTerms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#non-commercial-social-remixing | non commercial social remixing}
   */
  static nonCommercialSocialRemixing = (override?: Partial<LicenseTerms>): LicenseTerms => {
    return this.validateLicenseTerms({
      ...this._nonComSocialRemixingPIL,
      ...override,
    });
  };

  /**
   * Gets the values to create a Commercial Use licenseTerms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#commercial-use | commercial use}
   */
  static commercialUse = ({
    defaultMintingFee,
    currency,
    royaltyPolicyAddress,
    chainId,
    override,
  }: CommercialUseRequest): LicenseTerms => {
    return this.validateLicenseTerms({
      ...this._commercialUse,
      defaultMintingFee,
      currency,
      ...override,
      royaltyPolicy: this.getRoyaltyPolicyAddress(
        override?.royaltyPolicyAddress || royaltyPolicyAddress,
        chainId,
      ),
    });
  };

  /**
   * Gets the values to create a Commercial Remixing licenseTerms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#commercial-remix | commercial remix}
   */
  static commercialRemix = ({
    defaultMintingFee,
    royaltyPolicyAddress,
    currency,
    commercialRevShare,
    chainId,
    override,
  }: CommercialRemixRequest): LicenseTerms => {
    return this.validateLicenseTerms({
      ...this._commercialRemix,
      commercialRevShare,
      defaultMintingFee,
      currency,
      ...override,
      royaltyPolicy: this.getRoyaltyPolicyAddress(
        override?.royaltyPolicyAddress || royaltyPolicyAddress,
        chainId,
      ),
    });
  };

  /**
   * Gets the values to create a Creative Commons Attribution (CC-BY) licenseTerms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#creative-commons-attribution | creative commons attribution}
   */
  static creativeCommonsAttribution = ({
    royaltyPolicyAddress,
    currency,
    chainId,
    override,
  }: CreativeCommonsAttributionRequest): LicenseTerms => {
    return this.validateLicenseTerms({
      ...this._creativeCommonsAttribution,
      currency,
      ...override,
      royaltyPolicy: this.getRoyaltyPolicyAddress(
        override?.royaltyPolicyAddress || royaltyPolicyAddress,
        chainId,
      ),
    });
  };

  private static getRoyaltyPolicyAddress = (
    royaltyPolicyAddress?: RoyaltyPolicyType,
    chainId?: SupportedChainIds,
  ): Address => {
    const transferredChainId = chain[chainId || "aeneid"];
    let address: Address;
    switch (royaltyPolicyAddress) {
      case undefined:
      case "LAP":
        address = royaltyPolicyLapAddress[transferredChainId];
        break;
      case "LRP":
        address = royaltyPolicyLrpAddress[transferredChainId];
        break;
      default:
        address = royaltyPolicyAddress;
    }
    return address;
  };

  private static validateLicenseTerms = (params: LicenseTermsInput): LicenseTerms => {
    const { royaltyPolicy, currency } = params;
    // Validate royalty policy and currency relationship
    if (royaltyPolicy !== zeroAddress && currency === zeroAddress) {
      throw new PILFlavorError("Royalty policy requires currency token.");
    }
    //In order compatibility with the previous version, we need to keep royaltyPolicyAddress in the params
    //but we don't want to use it in the normalized object
    delete params.royaltyPolicyAddress;
    // Normalize numeric fields to BigInt
    const normalized: LicenseTerms = {
      ...params,
      defaultMintingFee: BigInt(params.defaultMintingFee),
      expiration: BigInt(params.expiration),
      commercialRevCeiling: BigInt(params.commercialRevCeiling),
      derivativeRevCeiling: BigInt(params.derivativeRevCeiling),
    };

    // Validate defaultMintingFee
    if (normalized.defaultMintingFee < 0n) {
      throw new PILFlavorError("DefaultMintingFee should be greater than or equal to 0.");
    }

    if (normalized.defaultMintingFee > 0n && normalized.royaltyPolicy === zeroAddress) {
      throw new PILFlavorError(
        "Royalty policy is required when defaultMintingFee is greater than 0.",
      );
    }

    // Validate commercial use and derivatives
    this.verifyCommercialUse(normalized);
    this.verifyDerivatives(normalized);

    // Validate and normalize commercialRevShare
    this.validateAndNormalizeRevShare(normalized);

    return normalized;
  };

  private static validateAndNormalizeRevShare = (terms: LicenseTerms): void => {
    if (typeof terms.commercialRevShare !== "number" || isNaN(terms.commercialRevShare)) {
      throw new PILFlavorError("CommercialRevShare must be a valid number.");
    }

    if (terms.commercialRevShare < 0 || terms.commercialRevShare > 100) {
      throw new PILFlavorError(`CommercialRevShare should be between ${0} and ${100}.`);
    }

    terms.commercialRevShare = Math.round((terms.commercialRevShare / 100) * 1000000);
  };

  private static verifyCommercialUse = (terms: LicenseTerms): void => {
    if (!terms.commercialUse) {
      const commercialFields = [
        { field: "commercialAttribution", value: terms.commercialAttribution },
        { field: "commercializerChecker", value: terms.commercializerChecker !== zeroAddress },
        { field: "commercialRevShare", value: terms.commercialRevShare > 0 },
        { field: "commercialRevCeiling", value: terms.commercialRevCeiling > 0n },
        { field: "derivativeRevCeiling", value: terms.derivativeRevCeiling > 0n },
        { field: "royaltyPolicy", value: terms.royaltyPolicy !== zeroAddress },
      ];

      for (const { field, value } of commercialFields) {
        if (value) {
          throw new PILFlavorError(`Cannot add ${field} when commercial use is disabled.`);
        }
      }
    } else {
      if (terms.royaltyPolicy === zeroAddress) {
        throw new PILFlavorError("Royalty policy is required when commercial use is enabled.");
      }
    }
  };

  private static verifyDerivatives = (terms: LicenseTerms): void => {
    if (!terms.derivativesAllowed) {
      const derivativeFields = [
        { field: "derivativesAttribution", value: terms.derivativesAttribution },
        { field: "derivativesApproval", value: terms.derivativesApproval },
        { field: "derivativesReciprocal", value: terms.derivativesReciprocal },
        { field: "derivativeRevCeiling", value: terms.derivativeRevCeiling > 0n },
      ];

      for (const { field, value } of derivativeFields) {
        if (value) {
          throw new PILFlavorError(`Cannot add ${field} when derivative use is disabled.`);
        }
      }
    }
  };
}
