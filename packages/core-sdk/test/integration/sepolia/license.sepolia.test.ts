import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { IPAccountABI, LicenseRegistryConfig, LicensingModuleConfig } from "./testABI.sepolia";

describe("License Functions", () => {
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
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = LicenseRegistryConfig;
    client.license.licensingModuleConfig = LicensingModuleConfig;
  });

  describe("Mint Licenses", async function () {
    it.skip("should not throw error when minting a license", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.license.mintLicense({
          policyId: "5",
          licensorIpId: "0x32d062fffb59ec552ab7cf05f5966a0990c768df",
          mintAmount: 1,
          receiverAddress: process.env.SEPOLIA_TEST_WALLET_ADDRESS! as `0x${string}`,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.licenseId).to.be.a("string");
        expect(response.licenseId).not.empty;
      }
    });
  });

  describe("Link IP To Parents", async function () {
    it.skip("should not throw error when link IP to parents", async () => {
      // 1. mint a license
      const mintLicenseResponse = await client.license.mintLicense({
        policyId: "5",
        licensorIpId: "0xb69d3277be50b0b851695bc010131a83933132db",
        mintAmount: 1,
        receiverAddress: process.env.SEPOLIA_TEST_WALLET_ADDRESS! as `0x${string}`,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const licenseId1 = mintLicenseResponse.licenseId!;

      const mintLicenseResponse2 = await client.license.mintLicense({
        policyId: "7",
        licensorIpId: "0x7a4f65669a36d1c7c34c96d65eb1c5cdb94aaeea",
        mintAmount: 1,
        receiverAddress: process.env.SEPOLIA_TEST_WALLET_ADDRESS! as `0x${string}`,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const licenseId2 = mintLicenseResponse2.licenseId!;

      // 2. link ip to parents
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.license.linkIpToParent({
          licenseIds: [licenseId1, licenseId2],
          childIpId: "0x3a94abcc7c7dd46f82326c3333bbd55168eb8dde",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.success).to.be.a("boolean");
        expect(response.success).to.equal(true);
      }
    });
  });
});
