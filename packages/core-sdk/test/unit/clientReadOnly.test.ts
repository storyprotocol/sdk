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

    describe("Test ipAsset getter", function () {
      it("should return the same ipAsset client when every time it's called", function () {
        const ipAsset1 = client.ipAsset;
        const ipAsset2 = client.ipAsset;
        expect(ipAsset1).to.be.equal(ipAsset2);
      });
    });

    describe("Test permission getter", function () {
      it("should return the same permission client when every time it's called", function () {
        const permission1 = client.permission;
        const permission2 = client.permission;
        expect(permission1).to.be.equal(permission2);
      });
    });

    describe("Test license getter", function () {
      it("should return the same license client when every time it's called", function () {
        const license1 = client.license;
        const license2 = client.license;
        expect(license1).to.be.equal(license2);
      });
    });

    describe("Test policy getter", function () {
      it("should return the same policy client when every time it's called", function () {
        const policy1 = client.policy;
        const policy2 = client.policy;
        expect(policy1).to.be.equal(policy2);
      });
    });

    describe("Test tagging getter", function () {
      it("should return the same tagging client when every time it's called", function () {
        const tagging1 = client.tagging;
        const tagging2 = client.tagging;
        expect(tagging1).to.be.equal(tagging2);
      });
    });

    describe("Test module getter", function () {
      it("should return the same module client when every time it's called", function () {
        const module1 = client.module;
        const module2 = client.module;
        expect(module1).to.be.equal(module2);
      });
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
