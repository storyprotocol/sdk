import { expect } from "chai";
import { StoryClient, Client, ReadOnlyClient } from "../../src";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { Account } from "viem";

describe("Test StoryClient", function () {
  describe("Test constructor", function () {
    it("should succeed when passing in valid params", function () {
      try {
        StoryClient.newClient({
          account: privateKeyToAccount(generatePrivateKey()),
        });
      } catch (error) {
        expect.fail(`Function should not have thrown any error, but it threw: ${error}`);
      }
    });

    it("throw error when wallet account is null", function () {
      try {
        StoryClient.newClient({
          account: null as any as Account,
        });
        expect.fail(`Function should not get here, it should throw an error `);
      } catch (error) {}
    });
  });

  describe("Test getters", function () {
    let client: Client;
    let clientRO: ReadOnlyClient;

    beforeEach(function () {
      client = StoryClient.newClient({
        account: privateKeyToAccount(generatePrivateKey()),
      });
      clientRO = StoryClient.newReadOnlyClient({});
    });

    describe("Test transactions getter", function () {
      it("should return the same transaction client when every time it's called", function () {
        const transaction1 = client.transaction;
        const transaction2 = client.transaction;
        expect(transaction1).to.be.equal(transaction2);
      });
    });

    describe("Test platform getter", function () {
      it("should return the same platform client when every time it's called", function () {
        const platform1 = client.platform;
        const platform2 = client.platform;
        expect(platform1).to.be.equal(platform2);
      });
    });
  });

  // describe("Test ipOrg getter w/o creating a client", function () {
  //   let client: Client;
  //   it("should throw error when a client hasn't been created", function () {
  //     try {
  //       client.ipOrg;

  //       expect.fail(`You haven't created a client yet.`);
  //     } catch (error) {}
  //   });
  // });
});
