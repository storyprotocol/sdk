import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PermissionReadOnlyClient } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient } from "viem";

chai.use(chaiAsPromised);

describe("Test PermissionReadOnlyClient", function () {
  let permissionClient: PermissionReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    permissionClient = new PermissionReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test permissionClient.get", function () {
    it("should return permission", async function () {
      const expectedPermission = {
        id: "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d-0x6c88f438cbfd9866dcd067ffe18b951f19b968da-0x0baa92f82d8992ff152047f29084079c263be7f7-0xa2b4192f",
        ipAccount: "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d",
        permission: "1",
        signer: "0x0baa92f82d8992ff152047f29084079c263be7f7",
        to: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
        func: "0xa2b4192f",
        blockTimestamp: "1706139240",
        blockNumber: "5148052",
      };
      axiosMock.get = sinon.stub().returns({
        data: expectedPermission,
      });

      const response = await permissionClient.get({
        permissionId:
          "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d-0x6c88f438cbfd9866dcd067ffe18b951f19b968da-0x0baa92f82d8992ff152047f29084079c263be7f7-0xa2b4192f",
      });
      expect(response).to.deep.equal(expectedPermission);
    });

    it("should throw error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        permissionClient.get({
          permissionId:
            "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d-0x6c88f438cbfd9866dcd067ffe18b951f19b968da-0x0baa92f82d8992ff152047f29084079c263be7f7-0xa2b4192f",
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error if permission id is invalid", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        permissionClient.get({
          permissionId: "fake permission id",
        }),
      ).to.be.rejectedWith("Failed to get permission: http 500");
    });
  });

  describe("Test permissionClient.list", async function () {
    const permissionMock = {
      id: "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d-0x6c88f438cbfd9866dcd067ffe18b951f19b968da-0x0baa92f82d8992ff152047f29084079c263be7f7-0xa2b4192f",
      ipAccount: "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d",
      permission: "1",
      signer: "0x0baa92f82d8992ff152047f29084079c263be7f7",
      to: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
      func: "0xa2b4192f",
      blockTimestamp: "1706139240",
      blockNumber: "5148052",
    };

    const mockResponse = sinon.stub().returns({
      data: { data: [permissionMock] },
    });

    it("should return permission on a successful query", async function () {
      axiosMock.post = mockResponse;
      const response = await permissionClient.list();

      expect(response.data[0]).to.deep.equal(permissionMock);
    });

    it("should return permission without the request object", async function () {
      axiosMock.post = mockResponse;
      const response = await permissionClient.list();

      expect(response.data[0]).to.deep.equal(permissionMock);
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(permissionClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
