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
        expiration: 0n,
        commercialRevCeiling: 0n,
        derivativeRevCeiling: 0n,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
    it("should register license with non commercial social remixing PIL", async () => {
      const result = await client.license.registerNonComSocialRemixingPIL();
      expect(result.licenseTermsId).to.be.a("bigint");
    });
    it("should register license with commercial use", async () => {
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: 1n,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should register license with commercial Remix use", async () => {
      const result = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 1n,
        commercialRevShare: 100,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should register license with creative commons attribution PIL", async () => {
      const result = await client.license.registerCreativeCommonsAttributionPIL({
        currency: WIP_TOKEN_ADDRESS,
        royaltyPolicyAddress: royaltyPolicyLapAddress[aeneid],
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
  });

  describe("registerCommercialUsePIL v1 vs v2 method compatibility", () => {
    it("should produce same results for registerCommercialUsePIL v1 and v2", async () => {
      const v1Result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const v2Result = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      expect(v1Result.licenseTermsId).to.be.a("bigint");
      expect(v2Result.licenseTermsId).to.be.a("bigint");
      // Both should produce valid license terms IDs
      expect(Number(v1Result.licenseTermsId)).to.be.greaterThan(0);
      expect(Number(v2Result.licenseTermsId)).to.be.greaterThan(0);
    });

    it("should produce same results for registerCommercialRemixPIL v1 and v2", async () => {
      const v1Result = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 50n,
        commercialRevShare: 25,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const v2Result = await client.license.registerCommercialRemixPILV2({
        defaultMintingFee: 50n,
        commercialRevShare: 25,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      expect(v1Result.licenseTermsId).to.be.a("bigint");
      expect(v2Result.licenseTermsId).to.be.a("bigint");
      // Both should produce valid license terms IDs
      expect(Number(v1Result.licenseTermsId)).to.be.greaterThan(0);
      expect(Number(v2Result.licenseTermsId)).to.be.greaterThan(0);
    });

    it("should support backward compatibility with string values in v1 methods", async () => {
      // Test that v1 methods still accept string values (with deprecation warning)
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: "100" as any, // Type assertion to test backward compatibility
        currency: WIP_TOKEN_ADDRESS,  
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      
      expect(result.licenseTermsId).to.be.a("bigint");
      expect(Number(result.licenseTermsId)).to.be.greaterThan(0);
    });

    it("should support backward compatibility with number values in v1 methods", async () => {
      // Test that v1 methods still accept number values
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: 100, // Number value
        currency: WIP_TOKEN_ADDRESS,
      });
      
      expect(result.licenseTermsId).to.be.a("bigint");
      expect(Number(result.licenseTermsId)).to.be.greaterThan(0);
    });

    it("should support backward compatibility with bigint values in v1 methods", async () => {
      // Test that v1 methods still accept bigint values
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: 100n, // BigInt value
        currency: WIP_TOKEN_ADDRESS,
      });
      
      expect(result.licenseTermsId).to.be.a("bigint");
      expect(Number(result.licenseTermsId)).to.be.greaterThan(0);
    });

    it("should validate that v2 methods only accept proper types", async () => {
      // This test ensures v2 methods have proper type safety
      // The TypeScript compiler should catch any attempts to pass strings
      const result = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n, // Only bigint | number allowed
        currency: WIP_TOKEN_ADDRESS,
      });
      
      expect(result.licenseTermsId).to.be.a("bigint");
      expect(Number(result.licenseTermsId)).to.be.greaterThan(0);
    });
  });

  describe("String type compatibility tests", () => {
    it("should accept string values in registerCommercialUsePIL v1", async () => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      const result = await client.license.registerCommercialUsePIL({
        defaultMintingFee: "1000" as any,
        currency: WIP_TOKEN_ADDRESS,
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should accept string values in registerCommercialRemixPIL v1", async () => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      const result = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: "2000" as any,
        commercialRevShare: 30,
        currency: WIP_TOKEN_ADDRESS,
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should accept string values in mintLicenseTokens v1", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;
      
      await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseResult.licenseTermsId!,
      });

      // Test string values in v1 method
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseResult.licenseTermsId!,
        licensorIpId: ipId,
        maxMintingFee: "100" as any,
        maxRevenueShare: 50,
        amount: "1" as any,
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      
      expect(result.txHash).to.be.a("string");
    });

    it("should accept string values in predictMintingLicenseFee v1", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;

      // Test string values in v1 method
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      const result = await client.license.predictMintingLicenseFee({
        licenseTermsId: licenseResult.licenseTermsId!,
        licensorIpId: ipId,
        amount: "2" as any,
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      
      expect(result.currencyToken).to.be.a("string");
      expect(result.tokenAmount).to.be.a("bigint");
    });

    it("should accept string values in setMaxLicenseTokens v1", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 0n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;
      
      await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseResult.licenseTermsId!,
      });

      const result = await client.license.setMaxLicenseTokens({
        ipId: ipId,
        licenseTermsId: licenseResult.licenseTermsId!,
        maxLicenseTokens: 1000n,
      });
      
      expect(result.txHash).to.be.a("string");
    });
  });

  describe("V2 method type safety tests", () => {
    it("should work with bigint values in registerCommercialUsePILV2", async () => {
      const result = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 1000n,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should work with number values in registerCommercialUsePILV2", async () => {
      const result = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 1000,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should work with bigint values in registerCommercialRemixPILV2", async () => {
      const result = await client.license.registerCommercialRemixPILV2({
        defaultMintingFee: 2000n,
        commercialRevShare: 25,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should work with number values in registerCommercialRemixPILV2", async () => {
      const result = await client.license.registerCommercialRemixPILV2({
        defaultMintingFee: 2000,
        commercialRevShare: 25,
        currency: WIP_TOKEN_ADDRESS,
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should work with bigint values in mintLicenseTokensV2", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;
      
      await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseResult.licenseTermsId!,
      });

      const result = await client.license.mintLicenseTokensV2({
        licenseTermsId: licenseResult.licenseTermsId!,
        licensorIpId: ipId,
        maxMintingFee: 100n,
        maxRevenueShare: 50,
        amount: 1n,
      });
      
      expect(result.txHash).to.be.a("string");
    });

    it("should work with number values in mintLicenseTokensV2", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;
      
      await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseResult.licenseTermsId!,
      });

      const result = await client.license.mintLicenseTokensV2({
        licenseTermsId: licenseResult.licenseTermsId!,
        licensorIpId: ipId,
        maxMintingFee: 100,
        maxRevenueShare: 50,
        amount: 1,
      });
      
      expect(result.txHash).to.be.a("string");
    });

    it("should work with bigint values in predictMintingLicenseFeeV2", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;

      const result = await client.license.predictMintingLicenseFeeV2({
        licenseTermsId: licenseResult.licenseTermsId!,
        licensorIpId: ipId,
        amount: 2n,
      });
      
      expect(result.currencyToken).to.be.a("string");
      expect(result.tokenAmount).to.be.a("bigint");
    });

    it("should work with number values in predictMintingLicenseFeeV2", async () => {
      // Setup: Create license and IP
      const licenseResult = await client.license.registerCommercialUsePILV2({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
      });
      
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const ipId = registerResult.ipId!;

      const result = await client.license.predictMintingLicenseFeeV2({
        licenseTermsId: licenseResult.licenseTermsId!,
        licensorIpId: ipId,
        amount: 2,
      });
      
      expect(result.currencyToken).to.be.a("string");
      expect(result.tokenAmount).to.be.a("bigint");
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
        maxMintingFee: 1n,
        maxRevenueShare: 100,
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
        maxMintingFee: 1n,
        maxRevenueShare: 100,
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
        royaltyPolicyAddress: royaltyPolicyLapAddress[aeneid],
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
