import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  ReadOnlyClient,
  ListTransactionRequest,
  ResourceType,
  Transaction,
} from "../../src";
import { ListPoliciesRequest, Policy } from "../../src/types/resources/policy";

describe("Policy client integration tests", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Policies", async function () {
    it("should return array of Policies", async function () {
      const req = {
        options: {
          limit: 10,
          offset: 0,
        },
      } as ListPoliciesRequest;

      const response = await client.policy.list(req);
      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectPolicyFields(response.data[0]);
    });

    it("should return a list of Policies successfully without options", async function () {
      const response = await client.policy.list();

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectPolicyFields(response.data[0]);
    });

    it("should return a list of Policies if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListPoliciesRequest;
      const response = await client.policy.list(options);

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectPolicyFields(response.data[0]);
    });
  });

  describe("Get Policy", async function () {
    it("should return Policy from request Policy id", async function () {
      const response = await client.policy.get({
        policyId: "1",
      });

      expect(response).to.have.property("data");
      expectPolicyFields(response.data);
    });
  });

  function expectPolicyFields(Policy: Policy) {
    expect(Policy).to.have.property("policyId");
    expect(Policy).to.have.property("creator");
    expect(Policy).to.have.property("frameworkId");
    expect(Policy).to.have.property("blockNumber");
    expect(Policy).to.have.property("blockTimestamp");
  }
});
