import { expect } from "chai";
import { StoryClient, StoryConfig, Client } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe.only("Tagging Functions", () => {
  let client: Client;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
  });

  describe("Set Tag", async function () {
    it("should be able to set tag", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.tagging.setTag({
          tag: "testTag",
          ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it("should be able to remove tag", async () => {
      // Set tag first, then remove it
      const tagString = "bad-tag69";
      const ipId = "0xabCc2421F927c128B9F5a94B612F4541C8E624B6";
      const waitForTransaction: boolean = true;
      await client.tagging.setTag({
        tag: tagString,
        ipId: ipId,
        txOptions: {
          waitForTransaction: waitForTransaction,
        },
      });

      const response = await expect(
        client.tagging.removeTag({
          tag: tagString,
          ipId: ipId,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });
});
