import chai from "chai";
import { LicensingConfig, StoryClient } from "../../src";
import { Hex, maxUint256, zeroAddress } from "viem";
import chaiAsPromised from "chai-as-promised";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  aeneid,
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
import { getDerivedStoryClient } from "./utils/BIP32";
import { generateHex } from "./utils/generateHex";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("License Functions", () => {
  let client: StoryClient;
  let clientB: StoryClient;
  before(async () => {
    client = getStoryClient();
    const derivedClient = await getDerivedStoryClient();
    clientB = derivedClient.clientB;
  });
  describe("register license with different types", async () => {
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
        currency: WIP_TOKEN_ADDRESS,
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
        currency: WIP_TOKEN_ADDRESS,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should register license with creative commons attribution PIL", async () => {
      const result = await client.license.registerCreativeCommonsAttributionPIL({
        currency: WIP_TOKEN_ADDRESS,
        royaltyPolicyAddress: royaltyPolicyLapAddress[aeneid],
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
      const mockERC20 = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      await mockERC20.approve(licensingModuleAddress[aeneid], maxUint256);
      ipId = registerResult.ipId!;
      const registerLicenseResult = await client.license.registerCommercialRemixPIL({
        defaultMintingFee: 0,
        commercialRevShare: 100,
        currency: WIP_TOKEN_ADDRESS,
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

    it("should mint license tokens with ip owner", async () => {
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

    it("should mint license tokens with non ip owner", async () => {
      // register ip with another wallet account
      const tokenIdB = await getTokenId();
      const registerResult = await clientB.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenIdB!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const ipIdB = registerResult.ipId!;

      // attach license terms to the ip
      await client.license.attachLicenseTerms({
        ipId: ipIdB,
        licenseTermsId: licenseId,
        txOptions: { waitForTransaction: true },
      });

      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipIdB,
        maxMintingFee: "1",
        maxRevenueShare: "100",
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTokenIds).to.be.a("array").and.not.empty;
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
        txOptions: { waitForTransaction: true },
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

    describe("set and get licensing config", () => {
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
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
        expect(result.success).to.be.true;
      });

      it("should get licensing config", async () => {
        const result = await client.license.getLicensingConfig({
          ipId: ipId,
          licenseTermsId: licenseId,
        });
        expect(result).to.deep.equal(licensingConfig);
      });
    });
  });

  describe("Creative Commons Attribution License Tests", () => {
    let client: StoryClient;
    let ipId: Hex;
    let ccLicenseTermsId: bigint;
    let tokenId;

    before(async () => {
      client = getStoryClient();
      tokenId = await getTokenId();
      
      // Register an IP asset
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      ipId = registerResult.ipId!;
      
      // Create a Creative Commons Attribution license
      const ccLicenseResult = await client.license.registerCreativeCommonsAttributionPIL({
        currency: WIP_TOKEN_ADDRESS,
        royaltyPolicyAddress: royaltyPolicyLapAddress[aeneid],
        txOptions: {
          waitForTransaction: true,
        },
      });
      ccLicenseTermsId = ccLicenseResult.licenseTermsId!;
    });

    it("should verify the license terms match Creative Commons Attribution specifications", async () => {
      const licenseTerms = await client.license.getLicenseTerms(ccLicenseTermsId);
      
      expect(licenseTerms.terms.transferable).to.be.true;
      expect(licenseTerms.terms.commercialUse).to.be.true;
      expect(licenseTerms.terms.derivativesAllowed).to.be.true;
      expect(licenseTerms.terms.derivativesAttribution).to.be.true;
      expect(licenseTerms.terms.derivativesReciprocal).to.be.true;
      expect(licenseTerms.terms.derivativesApproval).to.be.false;
      expect(licenseTerms.terms.commercialAttribution).to.be.true;
      expect(licenseTerms.terms.commercialRevShare).to.equal(0);
      expect(licenseTerms.terms.defaultMintingFee).to.equal(0n);
      
      expect(licenseTerms.terms.royaltyPolicy).to.equal(royaltyPolicyLapAddress[aeneid]);
      expect(licenseTerms.terms.expiration).to.equal(0n);
    });

    it("should attach Creative Commons Attribution license to an IP", async () => {
      const attachResult = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: ccLicenseTermsId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      
      expect(attachResult.txHash).to.be.a("string").and.not.empty;
      expect(attachResult.success).to.be.true;
      
      const licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(publicClient);
      const hasLicense = await licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
        ipId: ipId,
        licenseTemplate:client.ipAsset.licenseTemplateClient.address,
        licenseTermsId: ccLicenseTermsId,
      });
      expect(hasLicense).to.be.true;
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
        txOptions: {
          waitForTransaction: true,
        },
      });
      
      expect(mintResult.txHash).to.be.a("string").and.not.empty;
      expect(mintResult.licenseTokenIds).to.be.a("array").and.not.empty;
      
      const balanceAfter = await client.getWalletBalance();
      
      // Verify no fee was charged just gas
      // This checks that any difference is very small (just gas costs)
      const balanceDiff = balanceBefore - balanceAfter;
      const gasUsed = mintResult.receipt!.gasUsed
      const effectiveGasPrice = mintResult.receipt!.effectiveGasPrice
      const totalGas = gasUsed * effectiveGasPrice
      
      // Confirms the balance diff only reflects gas cost, since license fee is zero.
      expect(balanceDiff == totalGas).to.be.true; // Small amount for gas
    });
  });
});