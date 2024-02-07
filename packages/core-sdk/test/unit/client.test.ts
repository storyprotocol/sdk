import { expect } from "chai";
import { StoryClient, Client } from "../../src";
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

    beforeEach(function () {
      client = StoryClient.newClient({
        account: privateKeyToAccount(generatePrivateKey()),
      });
    });
  });
});
