import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  IPAccountABI,
  LicensingModuleConfig,
  PILPolicyFrameworkManagerConfig,
} from "./testABI.sepolia";

describe("Test Policy Functions", () => {
  let client: StoryClient;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      chainId: "sepolia",
      transport: http(process.env.SEPOLIA_RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.SEPOLIA_WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
    client.policy.ipAccountABI = IPAccountABI;
    client.policy.licensingModuleConfig = LicensingModuleConfig;
    client.policy.pilPolicyFrameworkManagerConfig = PILPolicyFrameworkManagerConfig;
  });

  describe("Register PIL Policy", async function () {
    it.skip("should not throw error when registering PIL Policy with everything turned off", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: false,
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

    it.skip("should not throw error when registering PIL Policy with social remixing", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          attribution: true,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesReciprocal: true,
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

    it.skip("should not throw error when registering PIL Policy with commercial use", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          mintingFeeToken: "0xd53c2a80d24f6b3ff009e48cf88d3b482e8e1457",
          mintingFee: "1000000000000000000",
          royaltyPolicy: "0x8404061350ba0ca85c4e733b0be78c5519679003",
          commercialRevShare: 100,
          attribution: true,
          commercialUse: true,
          commercialAttribution: true,
          derivativesAllowed: true,
          derivativesReciprocal: true,
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
  });

  describe("Add Policy to IP", async function () {
    it.skip("should not throw error when adding Policy to IP", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.addPolicyToIp({
          ipId: "0x90daC93B2F2a6ABf44116d8A76b5C330F5A29dC0",
          policyId: "3",
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
