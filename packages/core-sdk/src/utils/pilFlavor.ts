import { zeroAddress } from "viem";

import { royaltyPolicyInputToAddress } from "./royalty";
import { MAX_ROYALTY_TOKEN } from "../constants/common";
import { SupportedChainIds } from "../types/config";
import { LicenseTerms, LicenseTermsInput } from "../types/resources/license";
import {
  CommercialRemixRequest,
  CommercialUseRequest,
  CreativeCommonsAttributionRequest,
  NonCommercialSocialRemixingRequest,
} from "../types/utils/pilFlavor";

const PIL_URIS = {
  NCSR: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
  COMMERCIAL_USE:
    "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
  COMMERCIAL_REMIX:
    "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
  CC_BY:
    "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
} as const;

const COMMON_DEFAULTS = {
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
} as const;

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
  };

  private static readonly _commercialUse: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: false,
    derivativesAttribution: false,
    derivativesApproval: false,
    derivativesReciprocal: false,
    uri: PIL_URIS.COMMERCIAL_USE,
  };

  private static readonly _commercialRemix: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    uri: PIL_URIS.COMMERCIAL_REMIX,
  };

  private static readonly _creativeCommonsAttribution: LicenseTerms = {
    ...COMMON_DEFAULTS,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    uri: PIL_URIS.CC_BY,
  };

  /**
   * Gets the values to create a Non-Commercial Social Remixing license terms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#non-commercial-social-remixing | Non Commercial Social Remixing}
   */
  public static nonCommercialSocialRemixing = (
    request?: NonCommercialSocialRemixingRequest,
  ): LicenseTerms => {
    return this.validateLicenseTerms(
      {
        ...this._nonComSocialRemixingPIL,
        ...request?.override,
      },
      request?.chainId,
    );
  };

  /**
   * Gets the values to create a Commercial Use license terms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#commercial-use | Commercial Use}
   */
  public static commercialUse = ({
    defaultMintingFee,
    currency,
    royaltyPolicy,
    chainId,
    override,
  }: CommercialUseRequest): LicenseTerms => {
    return this.validateLicenseTerms(
      {
        ...this._commercialUse,
        defaultMintingFee,
        currency,
        royaltyPolicy,
        ...override,
      },
      chainId,
    );
  };

  /**
   * Gets the values to create a Commercial Remixing license terms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#commercial-remix | Commercial Remix}
   */
  public static commercialRemix = ({
    defaultMintingFee,
    royaltyPolicy,
    currency,
    commercialRevShare,
    chainId,
    override,
  }: CommercialRemixRequest): LicenseTerms => {
    return this.validateLicenseTerms(
      {
        ...this._commercialRemix,
        commercialRevShare,
        defaultMintingFee,
        currency,
        royaltyPolicy,
        ...override,
      },
      chainId,
    );
  };

  /**
   * Gets the values to create a Creative Commons Attribution (CC-BY) license terms flavor.
   * @see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#creative-commons-attribution | Creative Commons Attribution}
   */
  public static creativeCommonsAttribution = ({
    royaltyPolicy,
    currency,
    chainId,
    override,
  }: CreativeCommonsAttributionRequest): LicenseTerms => {
    return this.validateLicenseTerms(
      {
        ...this._creativeCommonsAttribution,
        currency,
        royaltyPolicy,
        ...override,
      },
      chainId,
    );
  };

  public static validateLicenseTerms = (
    params: LicenseTermsInput,
    chainId?: SupportedChainIds,
  ): LicenseTerms => {
    const newRoyaltyPolicy = params.royaltyPolicy ?? params.royaltyPolicyAddress;
    // Delete deprecated field
    delete params.royaltyPolicyAddress;
    const normalized: LicenseTerms = {
      ...params,
      defaultMintingFee: BigInt(params.defaultMintingFee),
      expiration: BigInt(params.expiration),
      commercialRevCeiling: BigInt(params.commercialRevCeiling),
      derivativeRevCeiling: BigInt(params.derivativeRevCeiling),
      royaltyPolicy: royaltyPolicyInputToAddress(newRoyaltyPolicy, chainId),
    };
    const { royaltyPolicy, currency } = normalized;

    // Validate royalty policy and currency relationship
    if (royaltyPolicy !== zeroAddress && currency === zeroAddress) {
      throw new PILFlavorError("Royalty policy requires currency token.");
    }

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
    normalized.commercialRevShare = this.validateAndNormalizeRevShare(
      normalized.commercialRevShare,
    );

    return normalized;
  };

  private static validateAndNormalizeRevShare = (commercialRevShare: number): number => {
    if (typeof commercialRevShare !== "number" || isNaN(commercialRevShare)) {
      throw new PILFlavorError("CommercialRevShare must be a valid number.");
    }

    if (commercialRevShare < 0 || commercialRevShare > 100) {
      throw new PILFlavorError(`CommercialRevShare should be between 0 and 100.`);
    }

    return Math.round((commercialRevShare / 100) * MAX_ROYALTY_TOKEN);
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
