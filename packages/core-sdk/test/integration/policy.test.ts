import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http, Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
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

    const configAccount: Account = config.account as Account;
    senderAddress = configAccount.address;
    client = StoryClient.newClient(config);
    client.policy.ipAccountABI = IPAccountABI;
    client.policy.licensingModuleConfig = LicensingModuleConfig;
    client.policy.pilPolicyFrameworkManagerConfig = PILPolicyFrameworkManagerConfig;
    client.ipAsset.ipAssetRegistryConfig = IPAssetRegistryConfig;
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = LicenseRegistryConfig;
    client.license.licensingModuleConfig = LicensingModuleConfig;
  });

  describe("Register PIL Policy", async function () {
    it("should not throw error when registering PIL Policy with everything turned off", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: false,
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
        console.log("test policy id", response.policyId);
      }
    });

    it("should not throw error when registering existing PIL Policy with everything turned off", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: false,
          territories: ["US", "EU"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.not.exist;
      expect(response.policyId).to.be.a("string");
      expect(response.policyId).not.empty;
    });

    it("should not throw error when registering a registered policy", async () => {
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

      expect(response.txHash).to.be.empty;
      expect(response.policyId).to.be.a("string");
      expect(response.policyId).not.empty;
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
        client.policy.registerPILCommercialUsePolicy({
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

    it("should not throw error when RegisterPILCommercialUsePolicy existing policy", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILCommercialUsePolicy({
          mintingFeeToken: "0x65F7eE2eEF8C127f3c5D9dE3e95Add44c8cB286b",
          mintingFee: "1000000000000000000",
          commercialRevShare: 150,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.not.exist;
      expect(response.policyId).to.be.a("string");
      expect(response.policyId).not.empty;
    });

    it("should not throw error when RegisterPILSocialRemixPolicy", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILSocialRemixPolicy({
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

    it("should not throw error when RegisterPILSocialRemixPolicy existing policy", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILSocialRemixPolicy({
          distributionChannels: ["TV"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.not.exist;
      expect(response.policyId).to.be.a("string");
      expect(response.policyId).not.empty;
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
