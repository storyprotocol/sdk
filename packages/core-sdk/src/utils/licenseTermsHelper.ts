import { Address, PublicClient, zeroAddress } from "viem";

import { PIL_TYPE, LicenseTerms, RegisterPILTermsRequest } from "../types/resources/license";
import { getAddress } from "./utils";
import { RoyaltyModuleReadOnlyClient } from "../abi/generated";

export function getLicenseTermByType(
  type: PIL_TYPE,
  term?: {
    defaultMintingFee?: string | number | bigint;
    currency?: Address;
    royaltyPolicyAddress: Address;
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
      throw new Error("DefaultMintingFee, currency are required for commercial use PIL.");
    }
    licenseTerms.royaltyPolicy = getAddress(
      term.royaltyPolicyAddress,
      "term.royaltyPolicyLAPAddress",
    );
    licenseTerms.defaultMintingFee = BigInt(term.defaultMintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.derivativesReciprocal = false;
    licenseTerms.currency = getAddress(term.currency, "term.currency");
    return licenseTerms;
  } else {
    if (
      !term ||
      term.defaultMintingFee === undefined ||
      term.currency === undefined ||
      term.commercialRevShare === undefined
    ) {
      throw new Error(
        "DefaultMintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    }
    if (term.commercialRevShare < 0 || term.commercialRevShare > 100) {
      throw new Error("CommercialRevShare should be between 0 and 100.");
    }
    licenseTerms.royaltyPolicy = getAddress(
      term.royaltyPolicyAddress,
      "term.royaltyPolicyLAPAddress",
    );
    licenseTerms.defaultMintingFee = BigInt(term.defaultMintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;

    licenseTerms.commercialRevShare = (term.commercialRevShare / 100) * 100000000;
    licenseTerms.derivativesReciprocal = true;
    licenseTerms.currency = getAddress(term.currency, "term.currency");
    return licenseTerms;
  }
}

export async function validateLicenseTerms(
  params: RegisterPILTermsRequest,
  rpcClient: PublicClient,
): Promise<LicenseTerms> {
  const { royaltyPolicy, currency } = params;
  const royaltyModuleReadOnlyClient = new RoyaltyModuleReadOnlyClient(rpcClient);
  if (getAddress(royaltyPolicy, "params.royaltyPolicy") !== zeroAddress) {
    const isWhitelistedArbitrationPolicy =
      await royaltyModuleReadOnlyClient.isWhitelistedRoyaltyPolicy({ royaltyPolicy });
    if (!isWhitelistedArbitrationPolicy) {
      throw new Error("The royalty policy is not whitelisted.");
    }
  }
  if (getAddress(currency, "params.currency") !== zeroAddress) {
    const isWhitelistedRoyaltyToken = await royaltyModuleReadOnlyClient.isWhitelistedRoyaltyToken({
      token: currency,
    });
    if (!isWhitelistedRoyaltyToken) {
      throw new Error("The currency token is not whitelisted.");
    }
  }
  if (royaltyPolicy !== zeroAddress && currency === zeroAddress) {
    throw new Error("Royalty policy requires currency token.");
  }
  const object = {
    ...params,
    defaultMintingFee: BigInt(params.defaultMintingFee),
    expiration: BigInt(params.expiration),
    commercialRevCeiling: BigInt(params.commercialRevCeiling),
    derivativeRevCeiling: BigInt(params.derivativeRevCeiling),
  };
  verifyCommercialUse(object);
  verifyDerivatives(object);
  if (object.commercialRevShare < 0 || object.commercialRevShare > 100) {
    throw new Error("CommercialRevShare should be between 0 and 100.");
  } else {
    object.commercialRevShare = (object.commercialRevShare / 100) * 100000000;
  }
  return object;
}

const verifyCommercialUse = (terms: LicenseTerms) => {
  if (!terms.commercialUse) {
    if (terms.commercialAttribution) {
      throw new Error("Cannot add commercial attribution when commercial use is disabled.");
    }
    if (terms.commercializerChecker !== zeroAddress) {
      throw new Error("Cannot add commercializerChecker when commercial use is disabled.");
    }
    if (terms.commercialRevShare > 0) {
      throw new Error("Cannot add commercial revenue share when commercial use is disabled.");
    }
    if (terms.commercialRevCeiling > 0) {
      throw new Error("Cannot add commercial revenue ceiling when commercial use is disabled.");
    }
    if (terms.derivativeRevCeiling > 0) {
      throw new Error(
        "Cannot add derivative revenue ceiling share when commercial use is disabled.",
      );
    }
    if (terms.royaltyPolicy !== zeroAddress) {
      throw new Error("Cannot add commercial royalty policy when commercial use is disabled.");
    }
  } else {
    if (terms.royaltyPolicy === zeroAddress) {
      throw new Error("Royalty policy is required when commercial use is enabled.");
    }
  }
};

const verifyDerivatives = (terms: LicenseTerms) => {
  if (!terms.derivativesAllowed) {
    if (terms.derivativesAttribution) {
      throw new Error("Cannot add derivative attribution when derivative use is disabled.");
    }
    if (terms.derivativesApproval) {
      throw new Error("Cannot add derivative approval when derivative use is disabled.");
    }
    if (terms.derivativesReciprocal) {
      throw new Error("Cannot add derivative reciprocal when derivative use is disabled.");
    }
    if (terms.derivativeRevCeiling > 0) {
      throw new Error("Cannot add derivative revenue ceiling when derivative use is disabled.");
    }
  }
};
