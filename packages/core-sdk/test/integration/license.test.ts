import chai from "chai";
import { StoryClient } from "../../src";
import { Hex, zeroAddress } from "viem";
import chaiAsPromised from "chai-as-promised";
import { mockERC721, getStoryClient, getTokenId, aeneid } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import {
  licensingModuleAddress,
  piLicenseTemplateAddress,
  wrappedIpAddress,
} from "../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../src/constants/common";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("License Functions", () => {
  let client: StoryClient;

  before(() => {
    client = getStoryClient();
  });
  describe("register license with different types", async () => {
    it("should register license ", async () => {
      const result = await client.license.registerPILTerms({
        defaultMintingFee: 0,
        currency: wrappedIpAddress[aeneid],
        transferable: false,
        royaltyPolicy: zeroAddress,
        commercialUse: false,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x",
        commercialRevShare: 0,
        derivativesAllowed: false,
        derivativesAttribution: false,
        derivativesApproval: false,
        derivativesReciprocal: false,
        uri: "",
        expiration: "",
        commercialRevCeiling: "",
        derivativeRevCeiling: "",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
    it("should register license with non commercial social remixing PIL", async () => {
      const result = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
    it("should register license with commercial use", async () => {
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: "1",
        currency: wrappedIpAddress[aeneid],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should register license with commercial Remix use", async () => {
      const result = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: "1",
        commercialRevShare: 100,
        currency: wrappedIpAddress[aeneid],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
  });

  describe("attach License Terms and mint license tokens", async () => {
    let ipId: Hex;
    let licenseId: bigint;
    let paidLicenseId: bigint; // license with 0.01IP minting fee
    let tokenId;
    before(async () => {
      tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const mockERC20 = new MockERC20();
      await mockERC20.approve(licensingModuleAddress[aeneid]);
      ipId = registerResult.ipId!;
      const registerLicenseResult = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 0,
        commercialRevShare: 100,
        currency: wrappedIpAddress[aeneid],
        txOptions: {
          waitForTransaction: true,
        },
      });
      licenseId = registerLicenseResult.licenseTermsId!;

      const paidLicenseResult = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 100n,
        commercialRevShare: 10,
        currency: WIP_TOKEN_ADDRESS,
        txOptions: { waitForTransaction: true },
      });
      paidLicenseId = paidLicenseResult.licenseTermsId!;
    });

    it("should attach License Terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should be able to attach another license terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: paidLicenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should mint license tokens", async () => {
      const balanceBefore = await client.getWalletBalance();
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        maxMintingFee: "1",
        maxRevenueShare: "100",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTokenIds).to.be.a("array").and.not.empty;
    });

    it("should mint license tokens with fee and pay with IP", async () => {
      const balanceBefore = await client.getWalletBalance();
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: paidLicenseId,
        licensorIpId: ipId,
        maxMintingFee: 0n,
        maxRevenueShare: 50,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      const balanceAfter = await client.getWalletBalance();
      expect(balanceAfter < balanceBefore - 100n).to.be.true;
    });

    it("should get license terms", async () => {
      const result = await client.license.getLicenseTerms(licenseId);
      expect(result).not.empty;
    });

    it("should predict minting license fee", async () => {
      const result = await client.license.predictMintingLicenseFee({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        amount: 1,
      });
      expect(result.currencyToken).to.be.a("string").and.not.empty;
      expect(result.tokenAmount).to.be.a("bigint");
    });

    it("should set licensing config", async () => {
      const result = await client.license.setLicensingConfig({
        ipId: ipId,
        licenseTermsId: licenseId,
        licenseTemplate: piLicenseTemplateAddress[aeneid],
        licensingConfig: {
          mintingFee: 0,
          isSet: true,
          licensingHook: zeroAddress,
          hookData: "0xFcd3243590d29B131a26B1554B0b21a5B43e622e",
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: "1",
          expectGroupRewardPool: zeroAddress,
        },
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.success).to.be.true;
    });
  });
});
