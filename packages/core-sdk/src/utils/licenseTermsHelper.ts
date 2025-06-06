import { Address, PublicClient, zeroAddress } from "viem";

import { validateAddress } from "./utils";
import { RoyaltyModuleReadOnlyClient } from "../abi/generated";
import { MAX_ROYALTY_TOKEN } from "../constants/common";
import { RevShareType } from "../types/common";
import { LicenseTerms, LicenseTermsInput, PIL_TYPE } from "../types/resources/license";

export const getLicenseTermByType = (
  type: PIL_TYPE,
  term?: {
    defaultMintingFee?: string | number | bigint;
    currency?: Address;
    royaltyPolicyAddress: Address;
    commercialRevShare?: number;
  },
): LicenseTerms => {
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
    licenseTerms.uri =
      "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json";
    return licenseTerms;
  } else if (type === PIL_TYPE.COMMERCIAL_USE) {
    if (!term || term.defaultMintingFee === undefined || term.currency === undefined) {
      throw new Error("DefaultMintingFee, currency are required for commercial use PIL.");
    }
    licenseTerms.royaltyPolicy = validateAddress(term.royaltyPolicyAddress);
    licenseTerms.defaultMintingFee = BigInt(term.defaultMintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.derivativesReciprocal = false;
    licenseTerms.currency = validateAddress(term.currency);
    licenseTerms.uri =
      "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json";
    licenseTerms.derivativesAllowed = false;
    licenseTerms.derivativesAttribution = false;
    return licenseTerms;
  } else if (type === PIL_TYPE.CREATIVE_COMMONS_ATTRIBUTION) {
    if (!term || !term.royaltyPolicyAddress || !term.currency) {
      throw new Error(
        "royaltyPolicyAddress and currency are required for creative commons attribution PIL.",
      );
    }
    licenseTerms.royaltyPolicy = validateAddress(term.royaltyPolicyAddress);
    licenseTerms.currency = validateAddress(term.currency);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.uri =
      "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json";

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
    licenseTerms.royaltyPolicy = validateAddress(term.royaltyPolicyAddress);
    licenseTerms.defaultMintingFee = BigInt(term.defaultMintingFee);
    licenseTerms.commercialUse = true;
    licenseTerms.commercialAttribution = true;
    licenseTerms.uri =
      "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json";
    licenseTerms.commercialRevShare = getRevenueShare(term.commercialRevShare);
    licenseTerms.derivativesReciprocal = true;
    licenseTerms.currency = validateAddress(term.currency);
    return licenseTerms;
  }
};

export const validateLicenseTerms = async (
  params: LicenseTermsInput,
  rpcClient: PublicClient,
): Promise<LicenseTerms> => {
  const { royaltyPolicy, currency } = params;
  const royaltyModuleReadOnlyClient = new RoyaltyModuleReadOnlyClient(rpcClient);
  if (validateAddress(royaltyPolicy) !== zeroAddress) {
    const isWhitelistedArbitrationPolicy =
      await royaltyModuleReadOnlyClient.isWhitelistedRoyaltyPolicy({ royaltyPolicy });
    if (!isWhitelistedArbitrationPolicy) {
      throw new Error("The royalty policy is not whitelisted.");
    }
  }

  if (validateAddress(currency) !== zeroAddress) {
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
  if (object.defaultMintingFee < 0) {
    throw new Error("DefaultMintingFee should be greater than or equal to 0.");
  }

  if (object.defaultMintingFee > 0 && object.royaltyPolicy === zeroAddress) {
    throw new Error("Royalty policy is required when defaultMintingFee is greater than 0.");
  }
  verifyCommercialUse(object);
  verifyDerivatives(object);
  if (object.commercialRevShare < 0 || object.commercialRevShare > 100) {
    throw new Error("CommercialRevShare should be between 0 and 100.");
  } else {
    object.commercialRevShare = (object.commercialRevShare / 100) * 100000000;
  }
  return object;
};

const verifyCommercialUse = (terms: LicenseTerms): void => {
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

const verifyDerivatives = (terms: LicenseTerms): void => {
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

export const getRevenueShare = (
  revShare: number | string,
  type: RevShareType = RevShareType.COMMERCIAL_REVENUE_SHARE,
): number => {
  const revShareNumber = Number(revShare);
  if (isNaN(revShareNumber)) {
    throw new Error(`${type} must be a valid number.`);
  }

  if (revShareNumber < 0 || revShareNumber > 100) {
    throw new Error(`${type} must be between 0 and 100.`);
  }
  return (revShareNumber / 100) * MAX_ROYALTY_TOKEN;
};
