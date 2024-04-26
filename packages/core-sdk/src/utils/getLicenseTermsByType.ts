import { Hex, zeroAddress } from "viem";

import { PIL_TYPE, LicenseTerms } from "../types/resources/license";

export function getLicenseTermByType(
  type: PIL_TYPE,
  term?: {
    mintingFee: string;
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
  if (type === PIL_TYPE.NON_COMMERCIAL_REMIX) {
    return licenseTerms;
  } else if (type === PIL_TYPE.COMMERCIAL_USE) {
    licenseTerms.royaltyPolicy = term!.royaltyPolicyLAPAddress;
    licenseTerms.mintingFee = BigInt(term!.mintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.derivativesReciprocal = false;
    licenseTerms.currency = term!.currency;
    return licenseTerms;
  } else {
    licenseTerms.royaltyPolicy = term!.royaltyPolicyLAPAddress;
    licenseTerms.mintingFee = BigInt(term!.mintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.commercialRevShare = term!.commercialRevShare!;
    licenseTerms.derivativesReciprocal = true;
    licenseTerms.currency = term!.currency;
    return licenseTerms;
  }
}
