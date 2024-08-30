import { Hex, getAddress, zeroAddress } from "viem";

import { PIL_TYPE, LicenseTerms } from "../types/resources/license";

export function getLicenseTermByType(
  type: PIL_TYPE,
  term?: {
    defaultMintingFee?: string | number | bigint;
    currency?: Hex;
    royaltyPolicyLAPAddress: Hex;
    commercialRevShare?: number;
  },
): LicenseTerms {
  const licenseTerms: LicenseTerms = {
    transferable: true,
    royaltyPolicy: zeroAddress,
    defaultMintingFee: BigInt(0),
    expiration: BigInt(0),
    commercialUse: false,
    commercialAttribution: false,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: 0,
    commercialRevCeiling: BigInt(0),
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: BigInt(0),
    currency: zeroAddress,
    uri: "",
  };
  if (type === PIL_TYPE.NON_COMMERCIAL_REMIX) {
    licenseTerms.commercializerCheckerData = "0x";
    return licenseTerms;
  } else if (type === PIL_TYPE.COMMERCIAL_USE) {
    if (!term || term.defaultMintingFee === undefined || term.currency === undefined) {
      throw new Error("mintingFee currency are required for commercial use PIL.");
    }
    licenseTerms.royaltyPolicy = getAddress(term.royaltyPolicyLAPAddress);
    licenseTerms.defaultMintingFee = BigInt(term.defaultMintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.derivativesReciprocal = false;
    licenseTerms.currency = getAddress(term.currency);
    return licenseTerms;
  } else {
    if (
      !term ||
      term.defaultMintingFee === undefined ||
      term.currency === undefined ||
      term.commercialRevShare === undefined
    ) {
      throw new Error(
        "mintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    }
    if (term.commercialRevShare < 0 || term.commercialRevShare > 100) {
      throw new Error("commercialRevShare should be between 0 and 100.");
    }
    licenseTerms.royaltyPolicy = getAddress(term.royaltyPolicyLAPAddress);
    licenseTerms.defaultMintingFee = BigInt(term.defaultMintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;

    licenseTerms.commercialRevShare = (term.commercialRevShare / 100) * 100000000;
    licenseTerms.derivativesReciprocal = true;
    licenseTerms.currency = getAddress(term.currency);
    return licenseTerms;
  }
}
