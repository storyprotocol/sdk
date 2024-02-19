import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  IPAccountABI,
  LicensingModuleConfig,
  PILPolicyFrameworkManagerConfig,
} from "./testABI.tenderly";

describe("Test Policy Functions", () => {
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
  });
  // 0x3b4bdf523f5b85a466b3501efaee87f2e2ad6431
  describe("Register PIL Policy", async function () {
    it("should not throw error when registering PIL Policy with everything turned off", async () => {
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

    it("should not throw error when registering PIL Policy with social remixing", async () => {
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

    it("should not throw error when registering PIL Policy with commercial use", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.registerPILPolicy({
          transferable: true,
          royaltyPolicy: "0xb811a9aD59375eDC449cb3A05eB4672042BB9Daf",
          attribution: true,
          commercialUse: true,
          commercialAttribution: true,
          derivativesAllowed: true,
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
    it("should not throw error when adding Policy to IP", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.policy.addPolicyToIp({
          ipId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
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
