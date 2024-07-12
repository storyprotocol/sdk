import { Hex, getAddress, zeroAddress } from "viem";

import { PIL_TYPE, LicenseTerms } from "../types/resources/license";

export function getLicenseTermByType(
  type: PIL_TYPE,
  term: {
    mintingFee: string | number | bigint;
    currency: Hex;
    royaltyPolicyLAPAddress: Hex;
    commercialRevShare?: number;
  },
): LicenseTerms {
  const licenseTerms: LicenseTerms = {
    transferable: true,
    royaltyPolicy: zeroAddress,
    mintingFee: BigInt(0),
    expiration: BigInt(0),
    commercialUse: false,
    commercialAttribution: false,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: 0,
    commercialRevCelling: BigInt(0),
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCelling: BigInt(0),
    currency: zeroAddress,
    uri: "",
  };
  if (type === PIL_TYPE.COMMERCIAL_USE) {
    licenseTerms.royaltyPolicy = getAddress(term.royaltyPolicyLAPAddress);
    licenseTerms.mintingFee = BigInt(term.mintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.derivativesReciprocal = false;
    licenseTerms.currency = getAddress(term.currency);
    return licenseTerms;
  } else {
    if (term.commercialRevShare === undefined) {
      throw new Error(
        "mintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    }
    if (term.commercialRevShare < 0 || term.commercialRevShare > 100) {
      throw new Error("commercialRevShare should be between 0 and 100.");
    }
    licenseTerms.royaltyPolicy = getAddress(term.royaltyPolicyLAPAddress);
    licenseTerms.mintingFee = BigInt(term.mintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;

    licenseTerms.commercialRevShare = (term.commercialRevShare / 100) * 100000000;
    licenseTerms.derivativesReciprocal = true;
    licenseTerms.currency = getAddress(term.currency);
    return licenseTerms;
  }
}
