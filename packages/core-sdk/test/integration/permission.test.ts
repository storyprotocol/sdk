import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { IPAccountABI, AccessControllerConfig } from "./testABI.tenderly";

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
    client.permission.ipAccountABI = IPAccountABI;
    client.permission.accessControllerConfig = AccessControllerConfig;
  });

  describe("Set Permission", async function () {
    it.only("should not throw error when setting permission", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.permission.setPermission({
          ipId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
          signer: process.env.TEST_WALLET_ADDRESS as `0x${string}`,
          to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
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
