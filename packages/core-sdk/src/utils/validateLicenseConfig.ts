import { zeroAddress } from "viem";

import { LicensingConfigInput, LicensingConfig } from "../types/common";
import { getRevenueShare } from "./licenseTermsHelper";
import { validateAddress } from "./utils";

export const validateLicenseConfig = (licensingConfig?: LicensingConfigInput): LicensingConfig => {
  if (!licensingConfig) {
    return {
      isSet: false,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    };
  }
  const licenseConfig = {
    expectMinimumGroupRewardShare: Number(licensingConfig.expectMinimumGroupRewardShare),
    commercialRevShare: getRevenueShare(licensingConfig.commercialRevShare),
    mintingFee: BigInt(licensingConfig.mintingFee),
    expectGroupRewardPool: validateAddress(licensingConfig.expectGroupRewardPool),
    licensingHook: validateAddress(licensingConfig.licensingHook),
    hookData: licensingConfig.hookData,
    isSet: licensingConfig.isSet,
    disabled: licensingConfig.disabled,
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
