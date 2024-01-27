import { expect } from "chai";
import { StoryClient, StoryReadOnlyConfig, ReadOnlyClient, ResourceType } from "../../src";
import { ListModuleRequest } from "../../src/types/resources/module";

describe("Module client integration tests", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Modules", async function () {
    it("should return array of modules", async function () {
      const req = {
        options: {
          limit: 10,
          offset: 0,
        },
      } as ListModuleRequest;

      const response = await client.module.list(req);
      expect(response).to.have.property("modules");
      expect(response.modules).to.be.an("array");
      expect(response.modules.length).to.gt(0);
    });

    it("should return a list of module successfully without options", async function () {
      const response = await client.module.list();

      expect(response).to.have.property("modules");
      expect(response.modules).to.be.an("array");
      expect(response.modules.length).to.gt(0);
    });

    it("should return a list of module if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListModuleRequest;
      const response = await client.module.list(options);

      expect(response).to.have.property("modules");
      expect(response.modules).to.be.an("array");
      expect(response.modules.length).to.gt(0);
    });
  });

  describe("Get modules", async function () {
    it("should return modules from request modules id", async function () {
      const response = await client.module.get({
        name: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
      });

      expect(response).to.have.property("module");
      expect(response).to.have.property("name");
    });
  });
});
