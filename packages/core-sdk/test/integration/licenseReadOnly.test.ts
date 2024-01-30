import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  ReadOnlyClient,
  ListTransactionRequest,
  ResourceType,
  Transaction,
} from "../../src";
import { ListLicensesRequest, License } from "../../src/types/resources/license";

describe("License client integration tests", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Licenses", async function () {
    it("should return array of Licenses", async function () {
      const req = {
        options: {
          limit: 10,
          offset: 0,
        },
      } as ListLicensesRequest;

      const response = await client.license.list(req);
      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectLicenseFields(response.data[0]);
    });

    it("should return a list of Licenses successfully without options", async function () {
      const response = await client.license.list();

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectLicenseFields(response.data[0]);
    });

    it("should return a list of Licenses if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListLicensesRequest;
      const response = await client.license.list(options);

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectLicenseFields(response.data[0]);
    });
  });

  describe("Get License", async function () {
    it("should return License from request License id", async function () {
      const response = await client.license.get({
        licenseId: "1",
      });

      expect(response).to.have.property("data");
      expectLicenseFields(response.data);
    });
  });

  function expectLicenseFields(License: License) {
    expect(License).to.have.property("id");
    expect(License).to.have.property("amount");
    expect(License).to.have.property("creator");
    expect(License).to.have.property("licenseId");
    expect(License).to.have.property("receiver");
    expect(License).to.have.property("licenseData");
  }
});
