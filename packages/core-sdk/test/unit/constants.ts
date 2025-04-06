import { zeroAddress, zeroHash } from "viem";
import { RegisterPILTermsRequest, RoyaltyShare, homer } from "../../src";
import { LicensingConfig } from "../../src/types/common";
import { DerivativeData, LicenseTermsData } from "../../src/types/resources/ipAsset";
import { mockErc20Address, royaltyPolicyLapAddress } from "../../src/abi/generated";

export const mockIpId = "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4";

export const derivativeData: DerivativeData = {
  parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
  licenseTermsIds: [1n],
  maxMintingFee: 100,
  maxRts: 100,
  maxRevenueShare: 100,
};

export const royaltyShares: RoyaltyShare[] = [
  {
    recipient: "0x13fcb515cee99e4991465ef586cfe2b072ebb512",
    percentage: 1,
  },
];

export const tokenId = 1212n;

export const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

export const pilLicenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig> = {
  terms: {
    transferable: true,
    royaltyPolicy: royaltyPolicyLapAddress[homer.id],
    defaultMintingFee: 10000n,
    expiration: 1000n,
    commercialUse: true,
    commercialAttribution: false,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: 0,
    commercialRevCeiling: 0n,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: 0n,
    currency: mockErc20Address[homer.id],
    uri: "test case",
  },
  licensingConfig: {
    isSet: true,
    mintingFee: BigInt(1),
    licensingHook: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
    hookData: zeroHash,
    commercialRevShare: 1,
    disabled: false,
    expectMinimumGroupRewardShare: 0,
    expectGroupRewardPool: zeroAddress,
  },
};
