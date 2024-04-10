import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  IPAccountABI,
  getLicenseTemplateConfig,
  getLicenseRegistryConfig,
  getLicensingModuleConfig,
  getIPAssetRegistryConfig,
} from "../../config";
import chaiAsPromised from "chai-as-promised";
import { storyTestnetAddress } from "../../env";

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("License Functions in storyTestnet", () => {
  let client: StoryClient;
  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    };
    client = StoryClient.newClient(config);
    client.license.ipAccountABI = IPAccountABI;
    client.license.licensingModuleConfig = getLicensingModuleConfig("1513");
    client.license.licenseTemplateConfig = getLicenseTemplateConfig("1513");
    client.license.royaltyPolicyLAPConfig = getLicenseRegistryConfig("1513");
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
  });
  describe.skip("registering license with different types", async function () {
    it("should not throw error when registering license with non commercial social remixing PIL", async function () {
      const result = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.not.empty.and.to.be.a("string");
      expect(result.licenseId).not.empty.and.to.be.a("string");
    });

    it("should not throw error when registering license with commercial use", async function () {
      const result = await client.license.registerCommercialUsePIL({
        royaltyPolicy: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
        mintingFee: "1",
        currency: "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAE",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.not.empty.and.to.be.a("string");
      expect(result.licenseId).not.empty.and.to.be.a("string");
    });

    it("should not throw error when registering license with commercial Remix use", async function () {
      const result = await client.license.registerCommercialRemixPIL({
        royaltyPolicy: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
        mintingFee: "1",
        commercialRevShare: 100,
        currency: "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAE",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.not.empty.and.to.be.a("string");
      expect(result.licenseId).not.empty.and.to.be.a("string");
    });
  });

  describe("attach License Terms and mint license tokens", async function () {
    let ipId: Hex;
    let licenseId: string;
    before(async function () {
      const registerResult = await client.ipAsset.register({
        tokenContract: storyTestnetAddress.MockERC721,
        tokenId: "1",
        txOptions: {
          waitForTransaction: true,
        },
      });
      ipId = registerResult.ipId!;
      const registerLicenseResult = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      licenseId = registerLicenseResult.licenseId!;
    });

    it.skip("should not throw error when attach License Terms", async function () {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTemplate: storyTestnetAddress.PILicenseTemplate,
        licenseTermsId: licenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when minting license tokens", async function () {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTokenId).to.be.a("string").and.not.empty;
    });
  });
});
