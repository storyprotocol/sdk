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

    describe("Test ipOrg getter", function () {
      it("should return the same ipOrg when every time it's called", function () {
        const ipOrg1 = client.ipOrg;
        const ipOrg2 = client.ipOrg;
        expect(ipOrg1).to.be.equal(ipOrg2);
      });
    });

    describe("Test IP Asset getter", function () {
      it("should return the same ipOrg when every time it's called", function () {
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
      it("should return the same relationship type when every time it's called", function () {
        const relationshipType1 = client.relationshipType;
        const relationshipType2 = client.relationshipType;
        expect(relationshipType1).to.be.equal(relationshipType2);
      });
    });

    describe("Test platform getter", function () {
      it("should return the same platform when every time it's called", function () {
        const platform1 = client.platform;
        const platform2 = client.platform;
        expect(platform1).to.be.equal(platform2);
      });
    });

    describe("Test module getter", function () {
      it("should return the same module when every time it's called", function () {
        const module1 = client.module;
        const module2 = client.module;
        expect(module1).to.be.equal(module2);

        const moduleRO1 = clientRO.module;
        const moduleRO2 = clientRO.module;
        expect(moduleRO1).to.be.equal(moduleRO2);
      });
    });

    describe("Test hook getter", function () {
      it("should return the same hook when every time it's called", function () {
        const hook1 = client.hook;
        const hook2 = client.hook;
        expect(hook1).to.be.equal(hook2);

        const hookRO1 = clientRO.hook;
        const hookRO2 = clientRO.hook;
        expect(hookRO1).to.be.equal(hookRO2);
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
