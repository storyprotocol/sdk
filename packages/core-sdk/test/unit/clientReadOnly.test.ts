import { expect } from "chai";
import { StoryClient, ReadOnlyClient } from "../../src";
import { http } from "viem";

describe("Test StoryReadOnlyClient", function () {
  describe("Test constructor", function () {
    it("should succeed when passing in default params", function () {
      const client = StoryClient.newReadOnlyClient({});
      expect(client).to.be.instanceOf(StoryClient);
    });
    it("should succeed when passing in chainId = '1' ", function () {
      const client = StoryClient.newReadOnlyClient({ chainId: "1" });
      expect(client).to.be.instanceOf(StoryClient);
    });
    it("should succeed when passing in chainId = 'mainnet' ", function () {
      const client = StoryClient.newReadOnlyClient({ chainId: "mainnet" });
      expect(client).to.be.instanceOf(StoryClient);
    });
    it("should succeed when passing in chainId = '11155111' ", function () {
      const client = StoryClient.newReadOnlyClient({ chainId: "11155111" });
      expect(client).to.be.instanceOf(StoryClient);
    });
    it("should succeed when passing in chainId = 'sepolia' ", function () {
      const client = StoryClient.newReadOnlyClient({ chainId: "sepolia" });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should fail when passing in unsupported chain ID", function () {
      expect(() =>
        StoryClient.newReadOnlyClient({
          //@ts-ignore
          chainId: "fantom",
          transport: http(process.env.RPC_PROVIDER_URL),
        }),
      ).to.throw(`chainId fantom not supported`);
    });
  });

  describe("Test getters", function () {
    let client: ReadOnlyClient;

    beforeEach(function () {
      client = StoryClient.newReadOnlyClient({});
    });

    describe("Test transactions getter", function () {
      it("should return the same transaction client when every time it's called", function () {
        const transaction1 = client.transaction;
        const transaction2 = client.transaction;
        expect(transaction1).to.be.equal(transaction2);
      });
    });
  });
});
