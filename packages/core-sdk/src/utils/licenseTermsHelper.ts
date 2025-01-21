import { PublicClient, zeroAddress } from "viem";

import { InnerPILTerms, PILTerms } from "../types/resources/license";
import { getAddress } from "./utils";
import { RoyaltyModuleReadOnlyClient } from "../abi/generated";
import { MAX_ROYALTY_TOKEN } from "../constants/common";

export async function validateLicenseTerms(
  params: PILTerms,
  rpcClient: PublicClient,
): Promise<InnerPILTerms> {
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
    commercialRevShare: getRevenueShare(params.commercialRevShare),
  } as const;
  verifyCommercialUse(object);
  verifyDerivatives(object);
  return object;
}

const verifyCommercialUse = (terms: InnerPILTerms) => {
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

const verifyDerivatives = (terms: InnerPILTerms) => {
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

export const getRevenueShare = (revShare: number | string) => {
  const revShareNumber = Number(revShare);
  if (isNaN(revShareNumber)) {
    throw new Error("CommercialRevShare must be a valid number.");
  }
  if (revShareNumber < 0 || revShareNumber > 100) {
    throw new Error("CommercialRevShare should be between 0 and 100.");
  }
  return (revShareNumber / 100) * MAX_ROYALTY_TOKEN;
};
