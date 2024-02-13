import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "./ipAsset.test";

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
  });

  describe("Mint Licenses", async function () {
    it("should not throw error when minting a license", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.license.mintLicense({
          policyId: "2",
          licensorIpId: "0x3b4bdf523f5b85a466b3501efaee87f2e2ad6431",
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
        licensorIpId: "0x3b4bdf523f5b85a466b3501efaee87f2e2ad6431",
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
          childIpId: "0x92f54fe4cfca3c0f7bdf4798ed0d07a2c209577e",
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
