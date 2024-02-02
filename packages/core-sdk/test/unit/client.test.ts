import { expect } from "chai";
import { StoryClient, Client, ReadOnlyClient } from "../../src";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { Account } from "viem";

describe("Test StoryClient", function () {
  describe("Test constructor", function () {
    it("should succeed when passing in default params", function () {
      const client = StoryClient.newClient({
        account: privateKeyToAccount(generatePrivateKey()),
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should throw error when wallet account is null", function () {
      expect(() => {
        const client = StoryClient.newClient({
          account: null as any as Account,
        });
      }).to.throw("account is null");
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
