import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  RegistrationModuleConfig,
  IPAssetRegistryConfig,
  LicenseRegistryConfig,
  IPAccountABI,
  LicensingModuleConfig,
  PILPolicyFrameworkManagerConfig,
  RoyaltyPolicyLAPConfig,
} from "./testABI.tenderly";

// Disable since it's flaky
describe.skip("Test Policy Functions", () => {
  let client: StoryClient;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      chainId: "sepolia",
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
    client.policy.ipAccountABI = IPAccountABI;
    client.policy.licensingModuleConfig = LicensingModuleConfig;
    client.policy.pilPolicyFrameworkManagerConfig = PILPolicyFrameworkManagerConfig;
    client.policy.royaltyPolicyLAPConfig = RoyaltyPolicyLAPConfig;
    client.ipAsset.registrationModuleConfig = RegistrationModuleConfig;
    client.ipAsset.ipAssetRegistryConfig = IPAssetRegistryConfig;
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = LicenseRegistryConfig;
    client.license.licensingModuleConfig = LicensingModuleConfig;
  });
  // 0x3b4bdf523f5b85a466b3501efaee87f2e2ad6431
  describe("Register PIL Policy", async function () {
    it("should not throw error when registering PIL Policy with everything turned off", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          territories: ["US", "EU"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.policyId).to.be.a("string");
        expect(response.policyId).not.empty;
      }
    });

    it("should not throw error when registering PIL Policy with social remixing", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          attribution: true,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesReciprocal: true,
          territories: ["US", "EU"],
          distributionChannels: ["Book"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.policyId).to.be.a("string");
        expect(response.policyId).not.empty;
      }
    });

    it("should not throw error when registering PIL Policy with commercial use", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          royaltyPolicy: "0xb811a9aD59375eDC449cb3A05eB4672042BB9Daf",
          commercialRevShare: 300,
          attribution: true,
          commercialUse: true,
          commercialAttribution: true,
          derivativesAllowed: true,
          derivativesReciprocal: true,
          territories: ["US", "EU"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.policyId).to.be.a("string");
        expect(response.policyId).not.empty;
      }
    });

    it("should not throw error when RegisterPILCommercialUsePolicy", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.RegisterPILCommercialUsePolicy({
          mintingFeeToken: "0x65F7eE2eEF8C127f3c5D9dE3e95Add44c8cB286b",
          mintingFee: "1000000000000000000",
          commercialRevShare: 150,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.policyId).to.be.a("string");
        expect(response.policyId).not.empty;
      }
    });

    it("should not throw error when RegisterPILSocialRemixPolicy", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.RegisterPILSocialRemixPolicy({
          distributionChannels: ["TV"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.policyId).to.be.a("string");
        expect(response.policyId).not.empty;
      }
    });

    it.skip("Test license minting with Commercial policy", async () => {
      const waitForTransaction: boolean = true;
      const policyResponse = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          mintingFeeToken: "0x65F7eE2eEF8C127f3c5D9dE3e95Add44c8cB286b",
          mintingFee: "1000000000000000000",
          royaltyPolicy: "0xb811a9aD59375eDC449cb3A05eB4672042BB9Daf",
          commercialRevShare: 100,
          attribution: true,
          commercialUse: true,
          commercialAttribution: true,
          derivativesAllowed: true,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      console.log("policyId:", policyResponse.policyId);

      const ipaResponse = await expect(
        client.ipAsset.registerRootIp({
          policyId: policyResponse.policyId,
          tokenContractAddress: "0x7a90a7acff8bf14f13f8d1bdac5b663ef4f379ee",
          tokenId: "102",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      console.log("ipId:", ipaResponse.ipId);

      const licenseResponse = await expect(
        client.license.mintLicense({
          policyId: policyResponse.policyId,
          licensorIpId: ipaResponse.ipId,
          mintAmount: 1,
          receiverAddress: process.env.TEST_WALLET_ADDRESS! as `0x${string}`,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;
    });
  });

  describe("Add Policy to IP", async function () {
    it("should not throw error when adding Policy to IP", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.addPolicyToIp({
          ipId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
          policyId: "6",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.index).to.be.a("string");
        expect(response.index).not.empty;
      }
    });
  });
});
