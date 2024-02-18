import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe("Permission Functions", () => {
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

  describe("Set Permission", async function () {
    it("should not throw error when setting permission", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.permission.setPermission({
          ipAsset: "0x3b4bdf523f5b85a466b3501efaee87f2e2ad6431",
          signer: process.env.TEST_WALLET_ADDRESS as `0x${string}`,
          to: "0x83BADBEaee19cd0ADB786da57E2Ff5c500ee3A50",
          func: "0x00000000",
          permission: 1,
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
