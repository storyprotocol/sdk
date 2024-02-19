import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { IPAccountABI, LicenseRegistryConfig, LicensingModuleConfig } from "./testABI";

describe("License Functions", () => {
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
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = LicenseRegistryConfig;
    client.license.licensingModuleConfig = LicensingModuleConfig;
  });

  describe("Mint Licenses", async function () {
    it("should not throw error when minting a license", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.license.mintLicense({
          policyId: "2",
          licensorIpId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
          mintAmount: 1,
          receiverAddress: process.env.TEST_WALLET_ADDRESS! as `0x${string}`,
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
    it("should not throw error when link IP to parents", async () => {
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
      // 2. link ip to parents
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.license.linkIpToParent({
          licenseIds: [licenseId],
          childIpId: "0x5a75ab16eaaee5fb1d2f66e3b217d36b4fc831f9",
          minRoyalty: 1,
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
