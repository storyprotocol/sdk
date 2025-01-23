import { Address, zeroAddress } from "viem";

import { PILTerms } from "../types/resources/license";
import { getAddress } from "../utils/utils";
import { getRevenueShare } from "../utils/licenseTermsHelper";

export class PILFlavor {
  static nonComSocialRemixingPIL(): PILTerms {
    return {
      transferable: true,
      royaltyPolicy: zeroAddress,
      defaultMintingFee: 0n,
      expiration: 0n,
      commercialUse: false,
      commercialAttribution: false,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      currency: zeroAddress,
      uri: "",
    };
  }

  static commercialUsePIL(
    defaultMintingFee: bigint | number | string,
    royaltyPolicy: Address,
    currency: Address,
  ): PILTerms {
    if (defaultMintingFee === undefined || currency === undefined || royaltyPolicy === undefined) {
      throw new Error(
        "DefaultMintingFee, currency and royaltyPolicy are required for commercial use PIL.",
      );
    }
    return {
      transferable: true,
      royaltyPolicy: getAddress(royaltyPolicy, "royaltyPolicyLAPAddress"),
      defaultMintingFee: BigInt(defaultMintingFee),
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: false,
      derivativeRevCeiling: 0n,
      currency: getAddress(currency, "currency"),
      uri: "",
    };
  }

  static commercialRemixPIL(
    defaultMintingFee: bigint | number | string,
    royaltyPolicy: Address,
    currency: Address,
    commercialRevShare: number | string,
  ): PILTerms {
    return {
      transferable: true,
      royaltyPolicy: getAddress(royaltyPolicy, "royaltyPolicyLAPAddress"),
      defaultMintingFee: BigInt(defaultMintingFee),
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: getRevenueShare(commercialRevShare),
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      currency: getAddress(currency, "currency"),
      uri: "",
    };
  }
}
