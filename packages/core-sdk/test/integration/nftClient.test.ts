import { expect } from "chai";
import { StoryClient } from "../../src";
import { getStoryClient } from "./utils/util";

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
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(txData.nftContract).to.be.a("string").and.not.empty;
  });
});
