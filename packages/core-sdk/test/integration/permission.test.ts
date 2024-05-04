import { expect } from "chai";
import { StoryClient } from "../../src";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./util";
import { Hex } from "viem";

describe("Permission Functions", () => {
  let client: StoryClient;

  before(function () {
    client = getStoryClientInSepolia();
  });

  describe("Set Permission", async function () {
    it("should not throw error when setting permission", async () => {
      const waitForTransaction: boolean = true;
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        tokenContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const response = await expect(
        client.permission.setPermission({
          ipId: registerResult.ipId!,
          signer: process.env.TEST_WALLET_ADDRESS as Hex,
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
