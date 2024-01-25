import { expect } from "chai";
import { StoryClient, StoryConfig, Client } from "../../src";
import { sepolia, goerli } from "viem/chains";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe.only("IP Account Functions", () => {
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

  describe("Create IP Asset", async function () {
    it("should not throw error when creating an IP Asset", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAccount.registerRootIp({
          policyId: "0",
          tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipAccountId).to.be.a("string");
        expect(response.ipAccountId).not.empty;
      }
    });

    it.skip("should not throw error when creating an IP Asset with contentHash (SHA256)", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAccount.registerRootIp({
          policyId: "0",
          tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.ipAccountId).to.be.a("string");
        expect(response.ipAccountId).not.empty;
      }
    });
  });
});
