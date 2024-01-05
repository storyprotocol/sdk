import { expect } from "chai";
import { StoryClient, StoryConfig, Client } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe("IPOrg Functions", () => {
  let client: Client;
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

  describe("Create IPOrg", async function () {
    it("should not throw error when creating a ipOrg", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.exist.and.be.a("string").and.not.be.empty;

      if (waitForTransaction) {
        expect(response.ipOrgId).to.exist.and.be.a("string").and.not.be.empty;
      }
    });

    it("should not throw error when creating a ipOrg without the owner field", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.exist.and.be.a("string").and.not.be.empty;

      if (waitForTransaction) {
        expect(response.ipOrgId).to.exist.and.be.a("string").and.not.be.empty;
      }
    });
  });
});
