import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Hex, maxUint256, zeroAddress } from "viem";

import { LicensingConfig, StoryClient } from "../../src";
import { getDerivedStoryClient } from "./utils/BIP32";
import { generateHex } from "./utils/generateHex";
import {
  aeneid,
  getStoryClient,
  getTokenId,
  mockERC721,
  publicClient,
  walletClient,
} from "./utils/util";
import {
  erc20Address,
  LicenseRegistryReadOnlyClient,
  licensingModuleAddress,
  royaltyPolicyLapAddress,
} from "../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../src/constants/common";
import { ERC20Client } from "../../src/utils/token";

use(chaiAsPromised);

describe("License Functions", () => {
  let client: StoryClient;
  let clientB: StoryClient;
  before(async () => {
    client = getStoryClient();
    const derivedClient = await getDerivedStoryClient();
    clientB = derivedClient.clientB;
  });
  describe("register license with different types", () => {
    it("should register license ", async () => {
      const result = await client.license.registerPILTerms({
        defaultMintingFee: 0,
        currency: WIP_TOKEN_ADDRESS,
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
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
    it("should register license with non commercial social remixing PIL", async () => {
      const result = await client.license.registerNonComSocialRemixingPIL();
      expect(result.licenseTermsId).to.be.a("bigint");
    });
    it("should register license with commercial use", async () => {
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: "1",
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should register license with commercial Remix use", async () => {
      const result = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: "1",
        commercialRevShare: 100,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should register license with creative commons attribution PIL", async () => {
      const result = await client.license.registerCreativeCommonsAttributionPIL({
        currency: WIP_TOKEN_ADDRESS,
        royaltyPolicy: royaltyPolicyLapAddress[aeneid],
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
  });

  describe("attach License Terms and mint license tokens", () => {
    let ipId: Hex;
    let licenseId: bigint;
    let paidLicenseId: bigint; // license with 0.01IP minting fee
    let tokenId: number | undefined;
    before(async () => {
      tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const mockERC20 = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      await mockERC20.approve(licensingModuleAddress[aeneid], maxUint256);
      ipId = registerResult.ipId!;
      const registerLicenseResult = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 0,
        commercialRevShare: 100,
        currency: WIP_TOKEN_ADDRESS,
      });
      licenseId = registerLicenseResult.licenseTermsId!;

      const paidLicenseResult = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 100n,
        commercialRevShare: 10,
        currency: WIP_TOKEN_ADDRESS,
      });
      paidLicenseId = paidLicenseResult.licenseTermsId!;
    });

    it("should attach License Terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseId,
      });
      expect(result.txHash).to.be.a("string");
    });

    it("should be able to attach another license terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: paidLicenseId,
      });
      expect(result.txHash).to.be.a("string");
    });

    it("should mint license tokens with ip owner", async () => {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        maxMintingFee: "1",
        maxRevenueShare: "100",
      });
      expect(result.txHash).to.be.a("string");
      expect(result.licenseTokenIds).to.be.a("array");
    });

    it("should mint license tokens with non ip owner", async () => {
      // register ip with another wallet account
      const tokenIdB = await getTokenId();
      const registerResult = await clientB.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenIdB!,
      });
      const ipIdB = registerResult.ipId!;

      // attach license terms to the ip
      await client.license.attachLicenseTerms({
        ipId: ipIdB,
        licenseTermsId: licenseId,
      });

      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipIdB,
        maxMintingFee: "1",
        maxRevenueShare: "100",
      });
      expect(result.txHash).to.be.a("string");
      expect(result.licenseTokenIds).to.be.a("array");
    });

    it("should mint license token with default license terms", async () => {
      // get default license terms id
      const licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(publicClient);
      const { licenseTermsId: defaultLicenseTermsId } =
        await licenseRegistryReadOnlyClient.getDefaultLicenseTerms();

      const result = await client.license.mintLicenseTokens({
        licenseTermsId: defaultLicenseTermsId,
        licensorIpId: ipId,
        maxMintingFee: 0n,
        maxRevenueShare: 1,
      });

      expect(result.txHash).to.be.a("string");
      expect(result.licenseTokenIds).to.be.a("array");
    });

    it("should mint license tokens with fee and pay with IP", async () => {
      const balanceBefore = await client.getWalletBalance();
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: paidLicenseId,
        licensorIpId: ipId,
        maxMintingFee: 0n,
        maxRevenueShare: 50,
      });
      expect(result.txHash).to.be.a("string");
      const balanceAfter = await client.getWalletBalance();
      expect(Number(balanceAfter)).lessThan(Number(balanceBefore - 100n));
    });

    it("should get license terms", async () => {
      const result = await client.license.getLicenseTerms(licenseId);
      expect(result).to.be.an("object");
    });

    it("should predict minting license fee", async () => {
      const result = await client.license.predictMintingLicenseFee({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        amount: 1,
      });
      expect(result.currencyToken).to.be.a("string");
      expect(result.tokenAmount).to.be.a("bigint");
    });

    describe("licensing config and max license tokens", () => {
      const randomHookData = generateHex();
      const licensingConfig: LicensingConfig = {
        mintingFee: 0n,
        isSet: true,
        licensingHook: zeroAddress,
        hookData: randomHookData,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 1,
        expectGroupRewardPool: zeroAddress,
      };
      it("should set licensing config", async () => {
        const result = await client.license.setLicensingConfig({
          ipId: ipId,
          licenseTermsId: licenseId,
          licensingConfig,
        });
        expect(result.txHash).to.be.a("string");
        expect(result.success).to.equal(true);
      });

      it("should get licensing config", async () => {
        const result = await client.license.getLicensingConfig({
          ipId: ipId,
          licenseTermsId: licenseId,
        });
        expect(result).to.deep.equal(licensingConfig);
      });

      it("should set max license tokens", async () => {
        const result = await client.license.setMaxLicenseTokens({
          ipId: ipId,
          licenseTermsId: licenseId,
          maxLicenseTokens: 100,
        });
        expect(result.txHash).to.be.a("string");
      });
    });
  });

  describe("Creative Commons Attribution License Tests", () => {
    let ipId: Hex;
    let ccLicenseTermsId: bigint;
    let tokenId: number | undefined;

    before(async () => {
      tokenId = await getTokenId();

      // Register an IP asset
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      ipId = registerResult.ipId!;

      // Create a Creative Commons Attribution license
      const ccLicenseResult = await client.license.registerCreativeCommonsAttributionPIL({
        currency: WIP_TOKEN_ADDRESS,
        royaltyPolicy: royaltyPolicyLapAddress[aeneid],
      });
      ccLicenseTermsId = ccLicenseResult.licenseTermsId!;
    });

    it("should verify the license terms match Creative Commons Attribution specifications", async () => {
      const licenseTerms = await client.license.getLicenseTerms(ccLicenseTermsId);

      expect(licenseTerms.terms.transferable).to.equal(true);
      expect(licenseTerms.terms.commercialUse).to.equal(true);
      expect(licenseTerms.terms.derivativesAllowed).to.equal(true);
      expect(licenseTerms.terms.derivativesAttribution).to.equal(true);
      expect(licenseTerms.terms.derivativesReciprocal).to.equal(true);
      expect(licenseTerms.terms.derivativesApproval).to.equal(false);
      expect(licenseTerms.terms.commercialAttribution).to.equal(true);
      expect(licenseTerms.terms.commercialRevShare).to.equal(0);
      expect(licenseTerms.terms.defaultMintingFee).to.equal(0n);

      expect(licenseTerms.terms.royaltyPolicy).to.equal(royaltyPolicyLapAddress[aeneid]);
      expect(licenseTerms.terms.expiration).to.equal(0n);
    });

    it("should attach Creative Commons Attribution license to an IP", async () => {
      const attachResult = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: ccLicenseTermsId,
      });

      expect(attachResult.txHash).to.be.a("string");
      expect(attachResult.success).to.equal(true);

      const licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(publicClient);
      const hasLicense = await licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
        ipId: ipId,
        licenseTemplate: client.ipAsset.licenseTemplateClient.address,
        licenseTermsId: ccLicenseTermsId,
      });
      expect(hasLicense).to.equal(true);
    });

    it("should mint CC-BY license tokens with no minting fee", async () => {
      // Get wallet balance before minting
      const balanceBefore = await client.getWalletBalance();

      // Predict the minting fee (should be zero for CC-BY)
      const feePredict = await client.license.predictMintingLicenseFee({
        licenseTermsId: ccLicenseTermsId,
        licensorIpId: ipId,
        amount: 1,
      });

      // CC-BY licenses should have zero minting fee
      expect(feePredict.tokenAmount).to.equal(0n);

      const mintResult = await client.license.mintLicenseTokens({
        licenseTermsId: ccLicenseTermsId,
        licensorIpId: ipId,
        maxMintingFee: 0n,
        maxRevenueShare: 0,
      });

      expect(mintResult.txHash).to.be.a("string");
      expect(mintResult.licenseTokenIds).to.be.a("array");

      const balanceAfter = await client.getWalletBalance();

      // Verify no fee was charged just gas
      // This checks that any difference is very small (just gas costs)
      const balanceDiff = balanceBefore - balanceAfter;
      const gasUsed = mintResult.receipt!.gasUsed;
      const effectiveGasPrice = mintResult.receipt!.effectiveGasPrice;
      const totalGas = gasUsed * effectiveGasPrice;

      // Confirms the balance diff only reflects gas cost, since license fee is zero.
      expect(balanceDiff).to.equal(totalGas); // Small amount for gas
    });
  });
});
