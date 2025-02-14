import { expect } from "chai";
import { zeroAddress } from "viem";
import { validateLicenseConfig } from "../../../src/utils/validateLicenseConfig";

describe("validateLicenseConfig", () => {
  it("should return licenseConfig", () => {
    const licensingConfig = {
      isSet: true,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    };
    const result = validateLicenseConfig(licensingConfig);
    expect(result).to.be.a("object");
  });
  it("should throw error when expectMinimumGroupRewardShare is not a number", () => {
    const licensingConfig = {
      isSet: true,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: "a",
      expectGroupRewardPool: zeroAddress,
    };
    expect(() => validateLicenseConfig(licensingConfig)).to.throw(
      "The expectMinimumGroupRewardShare must be a valid number.",
    );
  });
  it("should throw error when expectMinimumGroupRewardShare is greater than 100", () => {
    const licensingConfig = {
      isSet: true,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 101,
      expectGroupRewardPool: zeroAddress,
    };
    expect(() => validateLicenseConfig(licensingConfig)).to.throw(
      "The expectMinimumGroupRewardShare must be greater than 0 and less than 100.",
    );
  });
  it("should throw error when expectMinimumGroupRewardShare is less than 0", () => {
    const licensingConfig = {
      isSet: true,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: -1,
      expectGroupRewardPool: zeroAddress,
    };
    expect(() => validateLicenseConfig(licensingConfig)).to.throw(
      "The expectMinimumGroupRewardShare must be greater than 0 and less than 100.",
    );
  });
  it("should throw error when mintingFee is less than 0", () => {
    const licensingConfig = {
      isSet: true,
      mintingFee: -1n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    };
    expect(() => validateLicenseConfig(licensingConfig)).to.throw(
      "The mintingFee must be greater than 0.",
    );
  });

  it("should throw default value when licensingConfig is not provided", () => {
    const result = validateLicenseConfig();
    expect(result).to.deep.equal({
      isSet: false,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    });
  });
});
