import { AxiosInstance } from "axios";
import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient } from "viem";
import { ModuleReadOnlyClient } from "../../../src/resources/moduleReadOnly";

chai.use(chaiAsPromised);

describe("Test ModuleReadOnlyClient", function () {
  let moduleReadOnlyClient: ModuleReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    moduleReadOnlyClient = new ModuleReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ModuleReadOnlyClient.get", function () {
    const moduleMock = {
      name: "foo",
      module: "bar",
    };
    it("should get module ", async function () {
      axiosMock.get = sinon.stub().resolves({
        data: {
          name: "foo",
          module: "bar",
        },
      });

      const response = await moduleReadOnlyClient.get({ name: "foo" });
      expect(response.module).to.deep.equal(moduleMock);
    });

    it("should be able to throw an error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(moduleReadOnlyClient.get({ name: "foo" })).to.be.rejectedWith("HTTP 500");
    });
  });

  describe("Test ModuleReadOnlyClient.list", function () {
    const moduleMock1 = {
      name: "foo1",
      module: "bar1",
    };
    const moduleMock2 = {
      name: "foo2",
      module: "bar2",
    };
    it("should return list of collections", async function () {
      axiosMock.post = sinon.stub().resolves({
        data: {
          modules: [moduleMock1, moduleMock2],
        },
      });

      const response = await moduleReadOnlyClient.list();
      const modules = response.modules;

      // Get each modules in array
      expect(modules[0]).to.be.deep.equal(moduleMock1);
      expect(modules[1]).to.be.deep.equal(moduleMock2);
    });

    it("should be able to throw an error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(moduleReadOnlyClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
