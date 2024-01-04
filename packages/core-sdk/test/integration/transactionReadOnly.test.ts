import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  ReadOnlyClient,
  ListTransactionRequest,
  ResourceType,
  Transaction,
} from "../../src";

describe("Transaction client integration tests", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Transactions", async function () {
    it("should return array of transactions", async function () {
      const req = {
        options: {
          limit: 10,
          offset: 0,
        },
      } as ListTransactionRequest;

      const response = await client.transaction.list(req);
      expect(response).to.have.property("transactions");
      expect(response.transactions).to.be.an("array");
      expect(response.transactions.length).to.gt(0);
      expectTransactionFields(response.transactions[0]);
    });

    it("should return a list of transactions successfully without options", async function () {
      const response = await client.transaction.list();

      expect(response).to.have.property("transactions");
      expect(response.transactions).to.be.an("array");
      expect(response.transactions.length).to.gt(0);
      expectTransactionFields(response.transactions[0]);
    });

    it("should return a list of transactions if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListTransactionRequest;
      const response = await client.transaction.list(options);

      expect(response).to.have.property("transactions");
      expect(response.transactions).to.be.an("array");
      expect(response.transactions.length).to.gt(0);
      expectTransactionFields(response.transactions[0]);
    });
  });

  describe("Get Transaction", async function () {
    it("should return transaction from request transaction id", async function () {
      const response = await client.transaction.get({
        transactionId: process.env.TEST_TRANSACTION_ID as string,
      });

      expect(response).to.have.property("transaction");
      expectTransactionFields(response.transaction);
    });
  });

  function expectTransactionFields(transaction: Transaction) {
    expect(transaction).to.have.property("id");
    expect(transaction).to.have.property("txHash");
    expect(transaction).to.have.property("createdAt");
    expect(transaction).to.have.property("initiator");
    expect(transaction).to.have.property("resourceType");
    expect(transaction).to.have.property("resourceId");
    if (transaction.resourceType !== ResourceType.Relationship.valueOf()) {
      expect(transaction).to.have.property("ipOrgId");
      expect(transaction.ipOrgId).to.be.a("string");
    }
    expect(transaction.id).to.be.a("string");
    expect(transaction.txHash).to.be.a("string");
    expect(transaction.createdAt).to.be.a("string");
    expect(transaction.initiator).to.be.a("string");
    expect(transaction.resourceType).to.be.a("string");
    expect(transaction.resourceId).to.be.a("string");
  }
});
