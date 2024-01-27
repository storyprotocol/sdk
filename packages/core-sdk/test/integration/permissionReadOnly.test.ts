import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  ReadOnlyClient,
  ListTransactionRequest,
  ResourceType,
  Transaction,
} from "../../src";
import { ListPermissionsRequest, Permission } from "../../src/types/resources/permission";

describe("Permission client integration tests", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Permissions", async function () {
    it("should return array of permissions", async function () {
      const req = {
        options: {
          limit: 10,
          offset: 0,
        },
      } as ListPermissionsRequest;

      const response = await client.permission.list(req);
      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectPermissionFields(response.data[0]);
    });

    it("should return a list of permissions successfully without options", async function () {
      const response = await client.permission.list();

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectPermissionFields(response.data[0]);
    });

    it("should return a list of permissions if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListPermissionsRequest;
      const response = await client.permission.list(options);

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectPermissionFields(response.data[0]);
    });
  });

  describe("Get Permission", async function () {
    it("should return permission from request permission id", async function () {
      const response = await client.permission.get({
        permissionId:
          (process.env.TEST_PERMISSION_ID as string) ||
          "47d64d52821188b04d2d549917a6e639d71ba967a9020bc2a144a53932a9163223cee3c012e7aeb680b59573e290f9068e4ec1ce83ec813faa670e8c1857dcb2f08c652bf97d0273ebd0cc52a5160c66bba6d9d3909857f1962c854249a7c59d2de86705e74bf05d2efd29e9bc6f40f3e92e5a9e8e5c60f326e7b875fe63cbc00c2d85616fea2c2f8d3f03cdf29029c35f03f015ded2227446e2abdd8d1069ab",
      });

      expect(response).to.have.property("data");
      expectPermissionFields(response.data);
    });
  });

  function expectPermissionFields(permission: Permission) {
    expect(permission).to.have.property("id");
    expect(permission).to.have.property("ipAccount");
    expect(permission).to.have.property("permission");
    expect(permission).to.have.property("signer");
    expect(permission).to.have.property("to");
    expect(permission).to.have.property("func");
    expect(permission).to.have.property("blockTimestamp");
    expect(permission).to.have.property("blockNumber");
  }
});
