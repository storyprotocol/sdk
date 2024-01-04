import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  GetModuleRequest,
  ListModuleRequest,
  ReadOnlyClient,
} from "../../src";

describe("Module client integration tests", () => {
  let client: ReadOnlyClient;

  beforeEach(function () {
    const config: StoryReadOnlyConfig = {};

    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Modules", async function () {
    it("should return array of all modules", async () => {
      const req = {
        options: {
          pagination: {
            limit: 10,
            offset: 0,
          },
        },
      } as ListModuleRequest;

      const response = await client.module.list(req);

      expect(response).to.have.property("modules");
      expect(response.modules).to.be.an("array");

      const module1 = response.modules[0];
      expect(module1).to.have.property("id");
      expect(module1).to.have.property("ipOrgId");
      expect(module1).to.have.property("moduleKey");
      expect(module1.id).to.be.a("string");
      expect(module1.ipOrgId).to.be.a("string");
      expect(module1.moduleKey).to.be.a("string");
    });

    it("should return array of limited amount of modules", async () => {
      const req = {
        options: {
          pagination: {
            limit: 1,
            offset: 0,
          },
        },
      } as ListModuleRequest;

      const response = await client.module.list(req);

      expect(response).to.have.property("modules");
      expect(response.modules).to.be.an("array");
      expect(response.modules.length).to.equal(1);
    });

    it("should return a list of modules successfully without options", async () => {
      const response = await client.module.list();
      expect(response).is.not.null;
      expect(response.modules.length).to.gt(0);
    });

    it("should return a list of modules if the options are invalid", async () => {
      const options = {
        options: {},
      } as ListModuleRequest;
      const response = await client.module.list(options);
      expect(response).is.not.null;
      expect(response.modules.length).to.gt(0);
    });
  });

  describe("Get Module", async function () {
    it("should return a module based on the module id", async () => {
      const req = {
        moduleId: process.env.TEST_MODULE_ID as string,
      } as GetModuleRequest;

      const response = await client.module.get(req);

      expect(response).to.have.property("module");

      const module = response.module;
      expect(module).to.have.property("id");
      expect(module).to.have.property("ipOrgId");
      expect(module).to.have.property("moduleKey");
      expect(module.id).to.be.a("string");
      expect(module.ipOrgId).to.be.a("string");
      expect(module.moduleKey).to.be.a("string");
    });
  });
});
