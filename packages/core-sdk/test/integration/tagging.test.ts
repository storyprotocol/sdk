import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe("Tagging Functions (integration tests)", () => {
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

  describe("Should be able to", async function () {
    it("set tag and wait for transaction", async () => {
      const response = await expect(
        client.tagging.setTag({
          tag: "testTag",
          ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it("set tag without waiting for transaction and still receive transaction hash", async () => {
      const response = await expect(
        client.tagging.setTag({
          tag: "testTag",
          ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it("should revert setting tag with incorrect ipId type", async () => {
      const waitForTransaction: boolean = true;
      await expect(
        client.tagging.setTag({
          tag: "testTag",
          //@ts-expect-error
          ipId: 0xabcc2421f927c128b9f5a94b612f4541c8e624b6,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.be.rejected;
    });

    it("remove tag", async () => {
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
