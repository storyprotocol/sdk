import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Address, Hex, http, Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  RegistrationModuleConfig,
  IPAssetRegistryConfig,
  IPAccountABI,
  LicenseRegistryConfig,
  LicensingModuleConfig,
} from "./testABI.tenderly";

describe("IP Asset Functions", () => {
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
    client.ipAsset.registrationModuleConfig = RegistrationModuleConfig;
    client.ipAsset.ipAssetRegistryConfig = IPAssetRegistryConfig;
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = LicenseRegistryConfig;
    client.license.licensingModuleConfig = LicensingModuleConfig;
  });

  describe("Create root IP Asset", async function () {
    it("should not throw error when creating a root IP Asset", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.registerRootIp({
          policyId: "0",
          tokenContractAddress: "0x7a90a7acff8bf14f13f8d1bdac5b663ef4f379ee",
          tokenId: "105",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipId).to.be.a("string");
        expect(response.ipId).not.empty;
      }
    });
    it("should not throw error when creating an existing root IP Asset", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.registerRootIp({
          policyId: "0",
          tokenContractAddress: "0x7a90a7acff8bf14f13f8d1bdac5b663ef4f379ee",
          tokenId: "105",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.not.exist;
      expect(response.ipId).to.be.a("string");
      expect(response.ipId).not.empty;
    });
  });

  describe("Create derivative IP Asset", async function () {
    it("should not throw error when creating a derivative IP Asset", async () => {
      // 1. mint a license
      const mintLicenseResponse = await client.license.mintLicense({
        policyId: "2",
        licensorIpId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
        mintAmount: 1,
        receiverAddress: process.env.TEST_WALLET_ADDRESS! as `0x${string}`,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const licenseId = mintLicenseResponse.licenseId!;
      // 2. register derivative
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.registerDerivativeIp({
          licenseIds: [licenseId],
          tokenContractAddress: "0x7a90a7acff8bf14f13f8d1bdac5b663ef4f379ee",
          tokenId: "100",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipId).to.be.a("string");
        expect(response.ipId).not.empty;
      }
    });

    it("should not throw error when creating an existing derivative IP Asset", async () => {
      // 1. mint a license
      const mintLicenseResponse = await client.license.mintLicense({
        policyId: "2",
        licensorIpId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
        mintAmount: 1,
        receiverAddress: process.env.TEST_WALLET_ADDRESS! as `0x${string}`,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const licenseId = mintLicenseResponse.licenseId!;
      // 2. register derivative
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.registerDerivativeIp({
          licenseIds: [licenseId],
          tokenContractAddress: "0x7a90a7acff8bf14f13f8d1bdac5b663ef4f379ee",
          tokenId: "100",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.not.exist;
      expect(response.ipId).to.be.a("string");
      expect(response.ipId).not.empty;
    });
  });
});
