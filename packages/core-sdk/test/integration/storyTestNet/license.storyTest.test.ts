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
  getRoyaltyPolicyLAPConfig,
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
    client.license.royaltyPolicyLAPConfig = getRoyaltyPolicyLAPConfig("1513");
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
  });
  describe("registering license with different types", async function () {
    it("should not throw error when registering license with non commercial social remixing PIL", async function () {
      const result = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      // expect(result.txHash).to.a("string").and.not.empty;
      expect(result.licenseTermsId).to.be.a("string").and.not.empty;
    });

    it("should not throw error when registering license with commercial use", async function () {
      const result = await client.license.registerCommercialUsePIL({
        mintingFee: "1",
        currency: storyTestnetAddress.MockERC20,
        txOptions: {
          waitForTransaction: true,
        },
      });
      // expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTermsId).to.be.a("string").not.empty;
    });

    it("should not throw error when registering license with commercial Remix use", async function () {
      const result = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: storyTestnetAddress.MockERC20,
        txOptions: {
          waitForTransaction: true,
        },
      });
      // expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTermsId).to.be.a("string").and.not.empty;
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
      licenseId = registerLicenseResult.licenseTermsId!;
    });

    it("should not throw error when attach License Terms", async function () {
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
