import { zeroAddress } from "viem";

import { LicensingConfig, ValidatedLicensingConfig } from "../types/common";
import { getRevenueShare } from "./licenseTermsHelper";
import { validateAddress } from "./utils";

export const validateLicenseConfig = (
  licensingConfig: LicensingConfig,
): ValidatedLicensingConfig => {
  const licenseConfig = {
    expectMinimumGroupRewardShare: Number(licensingConfig.expectMinimumGroupRewardShare),
    commercialRevShare: getRevenueShare(licensingConfig.commercialRevShare || 0),
    mintingFee: BigInt(licensingConfig.mintingFee || 0),
    expectGroupRewardPool: validateAddress(licensingConfig.expectGroupRewardPool || zeroAddress),
    licensingHook: validateAddress(licensingConfig.licensingHook || zeroAddress),
    hookData: licensingConfig.hookData || zeroAddress,
    isSet: licensingConfig.isSet || false,
    disabled: licensingConfig.disabled || false,
  } as const;
  if (isNaN(licenseConfig.expectMinimumGroupRewardShare)) {
    throw new Error(`The expectMinimumGroupRewardShare must be a valid number.`);
  }
  if (
    licenseConfig.expectMinimumGroupRewardShare < 0 ||
    licenseConfig.expectMinimumGroupRewardShare > 100
  ) {
    throw new Error(`The expectMinimumGroupRewardShare must be greater than 0 and less than 100.`);
  }
  if (licenseConfig.mintingFee < 0) {
    throw new Error(`The mintingFee must be greater than 0.`);
  }
  return licenseConfig;
};
