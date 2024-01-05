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

    describe("Test franchise getter", function () {
      it("should return the same franchise when every time it's called", function () {
        const franchise1 = client.ipOrg;
        const franchise2 = client.ipOrg;
        expect(franchise1).to.be.equal(franchise2);
      });
    });

    describe("Test IP Asset getter", function () {
      it("should return the same franchise when every time it's called", function () {
        const ipAsset1 = client.ipAsset;
        const ipAsset2 = client.ipAsset;
        expect(ipAsset1).to.be.equal(ipAsset2);
      });
    });

    describe("Test license getter", function () {
      it("should return the same license when every time it's called", function () {
        const license1 = client.license;
        const license2 = client.license;
        expect(license1).to.be.equal(license2);
      });
    });

    describe("Test transactions getter", function () {
      it("should return the same transaction client when every time it's called", function () {
        const transaction1 = client.transaction;
        const transaction2 = client.transaction;
        expect(transaction1).to.be.equal(transaction2);
      });
    });

    describe("Test relationship getter", function () {
      it("should return the same relationship when every time it's called", function () {
        const relationship1 = client.relationship;
        const relationship2 = client.relationship;
        expect(relationship1).to.be.equal(relationship2);
      });
    });

    describe("Test relationship type getter", function () {
      it("should return the same relationship when every time it's called", function () {
        const relationshipType1 = client.relationshipType;
        const relationshipType2 = client.relationshipType;
        expect(relationshipType1).to.be.equal(relationshipType2);
      });
    });
  });
});
