import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  GetHookRequest,
  ListHookRequest,
  ReadOnlyClient,
} from "../../src";

describe("Hook client integration tests", () => {
  let client: ReadOnlyClient;

  beforeEach(function () {
    const config: StoryReadOnlyConfig = {};

    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List Hooks", async function () {
    it("should return array of all hooks", async () => {
      const req = {
        options: {
          pagination: {
            limit: 10,
            offset: 0,
          },
        },
      } as ListHookRequest;

      const response = await client.hook.list(req);

      expect(response).to.have.property("hooks");
      expect(response.hooks).to.be.an("array");

      const hook1 = response.hooks[0];
      expect(hook1).to.have.property("id");
      expect(hook1).to.have.property("moduleId");
      expect(hook1).to.have.property("registryKey");
      expect(hook1).to.have.property("txHash");
      expect(hook1.id).to.be.a("string");
      expect(hook1.moduleId).to.be.a("string");
      expect(hook1.registryKey).to.be.a("string");
      expect(hook1.txHash).to.be.a("string");
    });

    it("should return array of limited amount of hooks", async () => {
      const req = {
        options: {
          pagination: {
            limit: 1,
            offset: 0,
          },
        },
      } as ListHookRequest;

      const response = await client.hook.list(req);

      expect(response).to.have.property("hooks");
      expect(response.hooks).to.be.an("array");
      expect(response.hooks.length).to.equal(1);
    });

    it("should return a list of hooks successfully without options", async () => {
      const response = await client.hook.list();
      expect(response).is.not.null;
      expect(response.hooks.length).to.gt(0);
    });

    it("should return a list of hooks if the options are invalid", async () => {
      const options = {
        options: {},
      } as ListHookRequest;
      const response = await client.hook.list(options);
      expect(response).is.not.null;
      expect(response.hooks.length).to.gt(0);
    });
  });

  describe("Get Hook", async function () {
    it("should return array of all hooks", async () => {
      const req = {
        hookId: process.env.TEST_HOOK_ID as string,
      } as GetHookRequest;

      const response = await client.hook.get(req);

      expect(response).to.have.property("hook");

      const hook = response.hook;
      expect(hook).to.have.property("id");
      expect(hook).to.have.property("moduleId");
      expect(hook).to.have.property("registryKey");
      expect(hook).to.have.property("txHash");
      expect(hook.id).to.be.a("string");
      expect(hook.moduleId).to.be.a("string");
      expect(hook.registryKey).to.be.a("string");
      expect(hook.txHash).to.be.a("string");
    });
  });
});
