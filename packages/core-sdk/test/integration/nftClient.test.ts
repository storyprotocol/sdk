import { expect } from "chai";
import { StoryClient } from "../../src";
import { getStoryClient } from "./utils/util";
import { Address } from "viem";

describe("nftClient Functions", () => {
  let client: StoryClient;
  before(async () => {
    client = getStoryClient();
  });
  it("should success when create nft collection", async () => {
    const txData = await client.nftClient.createNFTCollection({
      name: "test-collection",
      symbol: "TEST",
      maxSupply: 100,
      isPublicMinting: true,
      mintFeeRecipient: process.env.TEST_WALLET_ADDRESS as Address,
      mintOpen: true,
      contractURI: "test-uri",
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(txData.spgNftContract).to.be.a("string").and.not.empty;
  });
});
