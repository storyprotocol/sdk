import { expect } from "chai";
import { StoryClient, StoryConfig, Client, AddressZero } from "../../src";
import { sepolia } from "viem/chains";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe.only("Permission Functions", () => {
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

  describe("Set Permission", async function () {
    it("should not throw error when setting permission", async () => {
      const waitForTransaction: boolean = false;

      // TODO: this test is failing because only the IPAccount/IPAsset owner can set permission for the IPAccount. (wrong wallet)
      const response = await expect(
        client.permission.setPermission({
          ipAsset: "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d",
          signer: "0x0baa92f82d8992ff152047f29084079c263be7f7",
          to: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
          func: "0xa2b4192f",
          permission: 1,
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
