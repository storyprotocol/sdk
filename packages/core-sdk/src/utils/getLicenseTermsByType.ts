import { Hex, getAddress, zeroAddress } from "viem";

import { PIL_TYPE, LicenseTerms } from "../types/resources/license";

export function getLicenseTermByType(
  type: PIL_TYPE,
  term: {
    defaultMintingFee: string | number | bigint;
    currency: Hex;
    royaltyPolicyLAPAddress: Hex;
    commercialRevShare?: number;
  },
): LicenseTerms {
  const licenseTerms: LicenseTerms = {
    transferable: true,
    royaltyPolicy: getAddress(term.royaltyPolicyLAPAddress),
    defaultMintingFee: BigInt(term.defaultMintingFee),
    expiration: 0n,
    commercialUse: true,
    commercialAttribution: true,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: 0,
    commercialRevCeiling: 0n,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: false,
    derivativeRevCeiling: 0n,
    currency: getAddress(term.currency),
    uri: "",
  };

  if (type === PIL_TYPE.COMMERCIAL_REMIX) {
    if (term.commercialRevShare === undefined) {
      throw new Error(
        "mintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    }
    if (term.commercialRevShare < 0 || term.commercialRevShare > 100) {
      throw new Error("commercialRevShare should be between 0 and 100.");
    }
    licenseTerms.commercialRevShare = (term.commercialRevShare / 100) * 100000000;
    licenseTerms.derivativesReciprocal = true;
    return licenseTerms;
  } else {
    return licenseTerms;
  }
}
