import { expect } from "chai";
import { StoryClient, StoryConfig, Client } from "../../src";
import { sepolia } from "viem/chains";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe("IP Asset Functions", () => {
  let client: Client;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      chain: sepolia,
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
  });

  describe("Create IP Asset", async function () {
    it("should not throw error when creating an IP Asset", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.create({
          name: "Test",
          typeIndex: 0,
          ipOrgId: process.env.TEST_IPORG_ID as string,
          owner: senderAddress,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipAssetId).to.be.a("string");
        expect(response.ipAssetId).not.empty;
      }
    });

    it("should not throw error when creating an IP Asset with contentHash (SHA256)", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.create({
          name: "Test",
          typeIndex: 0,
          ipOrgId: process.env.TEST_IPORG_ID as string,
          owner: senderAddress,
          contentHash: "0x0ffc6cd05f97735c7f621791f127c4b298159bce126a78acc2d4eaad729ca587",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipAssetId).to.be.a("string");
        expect(response.ipAssetId).not.empty;
      }
    });

    it("should not throw error when creating an IP Asset without owner field", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.create({
          name: "Test",
          typeIndex: 0,
          ipOrgId: process.env.TEST_IPORG_ID as string,
          mediaUrl: "",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipAssetId).to.be.a("string");
        expect(response.ipAssetId).not.empty;
      }
    });

    it.skip("should not throw error when creating an IP Asset with a hook", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.create({
          name: "Test",
          typeIndex: 0,
          ipOrgId: process.env.TEST_IPORG_ID_WITH_HOOK as string,
          owner: senderAddress,
          preHookData: [
            {
              interface: "address",
              data: [process.env.TEST_WALLET_ADDRESS as string],
            },
          ],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipAssetId).to.be.a("string");
        expect(response.ipAssetId).not.empty;
      }
    });

    it("should throw error when creating an IP Asset with a hook, without hook data", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.create({
          name: "Test",
          typeIndex: 0,
          ipOrgId: "0x2554E198752d0F086c8b885CbCc5d663365673C2",
          owner: senderAddress,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.be.rejected;
    });
  });
});
