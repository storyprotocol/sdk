import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  ReadOnlyClient,
  ListIPOrgRequest,
  IPOrg,
} from "../../src";

describe("IPOrg Read Only Functions", function () {
  let client: ReadOnlyClient;

  before(function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("Get IPOrg", async function () {
    it("should return ipOrg when the ipOrg id is valid", async function () {
      const response = await client.ipOrg.get({
        ipOrgId: process.env.TEST_IPORG_ID as string,
      });

      expect(response).to.have.property("ipOrg");
      expectIpOrgFields(response.ipOrg);
    });
  });

  describe("List IPOrgs", async function () {
    it("should return a list of ipOrgs successfully upon query", async function () {
      const options = {
        options: {
          pagination: {
            limit: 10,
            offset: 0,
          },
        },
      } as ListIPOrgRequest;
      const response = await client.ipOrg.list(options);

      expect(response).to.have.property("ipOrgs");
      expect(response.ipOrgs).to.be.an("array");
      expect(response.ipOrgs.length).to.gt(0);
      expectIpOrgFields(response.ipOrgs[0]);
    });

    it("should return a list of ipOrgs successfully without options", async function () {
      const response = await client.ipOrg.list();

      expect(response).to.have.property("ipOrgs");
      expect(response.ipOrgs).to.be.an("array");
      expect(response.ipOrgs.length).to.gt(0);
      expectIpOrgFields(response.ipOrgs[0]);
    });

    it("should return a list of ipOrgs with pagination", async function () {
      const options = {
        options: {
          pagination: {
            limit: 1,
            offset: 0,
          },
        },
      } as ListIPOrgRequest;
      const response = await client.ipOrg.list(options);

      expect(response).to.have.property("ipOrgs");
      expect(response.ipOrgs).to.be.an("array");
      expect(response.ipOrgs.length).to.gt(0);
      expectIpOrgFields(response.ipOrgs[0]);
    });

    it("should return a list of ipOrgs if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListIPOrgRequest;
      const response = await client.ipOrg.list(options);

      expect(response).to.have.property("ipOrgs");
      expect(response.ipOrgs).to.be.an("array");
      expect(response.ipOrgs.length).to.gt(0);
      expectIpOrgFields(response.ipOrgs[0]);
    });
  });

  function expectIpOrgFields(ipOrg: IPOrg) {
    expect(ipOrg).to.have.property("id");
    expect(ipOrg).to.have.property("name");
    expect(ipOrg).to.have.property("symbol");
    expect(ipOrg).to.have.property("owner");
    expect(ipOrg).to.have.property("ipAssetTypes");
    expect(ipOrg).to.have.property("createdAt");
    expect(ipOrg).to.have.property("txHash");

    expect(ipOrg.id).to.be.a("string");
    expect(ipOrg.name).to.be.a("string");
    expect(ipOrg.symbol).to.be.a("string");
    expect(ipOrg.owner).to.be.a("string");
    expect(ipOrg.ipAssetTypes).to.be.an("array");
    expect(ipOrg.createdAt).to.be.a("string");
    expect(ipOrg.txHash).to.be.a("string");
  }
});
