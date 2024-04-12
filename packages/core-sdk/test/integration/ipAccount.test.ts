import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { Hex, http, Account } from "viem";
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

    const configAccount: Account = config.account as Account;
    senderAddress = configAccount.address;
    client = StoryClient.newClient(config);
  });

  describe("Execute Set Permission", async function () {
    it("should not throw error when execute setting permission", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAccount.execute({
          accountAddress: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
          value: 0,
          to: "0x674d6E1f7b5e2d714DBa588e9d046965225517c8",
          data: "0x7bac65fd000000000000000000000000004e38104adc39cbf4cea9bd8876440a969e3d0b0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc0000000000000000000000002ac240293f12032e103458451de8a8096c5a72e800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });

  describe("Execute with sig Set Permission", async function () {
    it.skip("should not throw error when executeWithSig setting permission", async () => {
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAccount.executeWithSig({
          accountAddress: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
          value: 0,
          to: "0x674d6E1f7b5e2d714DBa588e9d046965225517c8",
          data: "0x7bac65fd000000000000000000000000004e38104adc39cbf4cea9bd8876440a969e3d0b0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc0000000000000000000000002ac240293f12032e103458451de8a8096c5a72e800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
          deadline: 111,
          signer: "0x",
          signature: "0x",
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
