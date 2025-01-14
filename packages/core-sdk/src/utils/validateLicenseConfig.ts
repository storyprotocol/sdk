import { LicensingConfig } from "../types/common";
import { InnerLicensingConfig } from "../types/resources/license";
import { getRevenueShare } from "./licenseTermsHelper";
import { getAddress } from "./utils";

export const validateLicenseConfig = (licensingConfig: LicensingConfig): InnerLicensingConfig => {
  const licenseConfig = {
    ...licensingConfig,
    expectMinimumGroupRewardShare: Number(licensingConfig.expectMinimumGroupRewardShare),
    commercialRevShare: getRevenueShare(licensingConfig.commercialRevShare),
    mintingFee: BigInt(licensingConfig.mintingFee),
    expectGroupRewardPool: getAddress(
      licensingConfig.expectGroupRewardPool,
      "licensingConfig.expectGroupRewardPool",
    ),
    licensingHook: getAddress(licensingConfig.licensingHook, "licensingConfig.licensingHook"),
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
