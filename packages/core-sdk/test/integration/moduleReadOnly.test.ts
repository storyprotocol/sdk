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

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
    });

    it("should return a list of module successfully without options", async function () {
      const response = await client.module.list();

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
    });

    it("should return a list of module if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListModuleRequest;
      const response = await client.module.list(options);

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
    });
  });

  describe("Get modules", async function () {
    it("should get module from module name", async function () {
      const response = await client.module.get({
        name: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
      });

      expect(response).to.have.property("data");
      expect(response.data).to.have.property("name");
      expect(response.data).to.have.property("module");
      expect(response.data.name).to.be.equal(
        "0x5b76492fbbe6653ff47a1b3351689d78ffcf629216807b1ff4686cec53e393a6",
      );
      expect(response.data.module).to.be.equal("0x6c88f438cbfd9866dcd067ffe18b951f19b968da");
    });
  });
});
