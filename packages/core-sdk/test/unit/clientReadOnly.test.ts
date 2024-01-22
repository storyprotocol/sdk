import { expect } from "chai";
import { StoryClient, ReadOnlyClient } from "../../src";
import { fantom } from "viem/chains";
import { http } from "viem";

describe("Test StoryReadOnlyClient", function () {
  describe("Test constructor", function () {
    it("should succeed when passing in valid params", function () {
      try {
        StoryClient.newReadOnlyClient({});
      } catch (error) {
        expect.fail(`Function should not have thrown any error, but it threw: ${error}`);
      }
    });

    it("should succeed when passing in valid params w/ provider", function () {
      try {
        StoryClient.newReadOnlyClient({
          chain: fantom,
          transport: http(process.env.RPC_PROVIDER_URL),
        });
      } catch (error) {
        expect.fail(`Function should not have thrown any error, but it threw: ${error}`);
      }
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

  // describe("Test getters w/ provider", function () {
  //   let client: ReadOnlyClient;

  //   beforeEach(function () {
  //     client = StoryClient.newReadOnlyClient({
  //       environment: Environment.TEST,
  //       provider: new providers.JsonRpcProvider(),
  //     });
  //   });

  //   describe("Test franchise getter w/ provider", function () {
  //     it("should return the same franchise when every time it's called", function () {
  //       const franchise1 = client.franchise;
  //       const franchise2 = client.franchise;
  //       expect(franchise1).to.be.equal(franchise2);
  //     });
  //   });
  // });

  // describe("Test franchise getter w/o creating a client", function () {
  //   let client: ReadOnlyClient;

  //   it("should throw error when a client hasn't been created", function () {
  //     try {
  //       client.franchise;

  //       expect.fail(`You haven't created a client yet.`);
  //     } catch (error) {}
  //   });
  // });
});
