import chai, { expect } from "chai";
import { IPOrgReadOnlyClient } from "../../../src";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { PublicClient } from "viem";

chai.use(chaiAsPromised);

describe(`Test IPOrgReadOnlyClient`, function () {
  let ipOrgClient: IPOrgReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    ipOrgClient = new IPOrgReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipOrgClient.get", function () {
    const ipOrgMock = {
      id: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
      name: "Star Wars",
      symbol: "STAR",
      owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
      metadataUrl: "https://arweave.net/dnFJl1v8kgOx_6Z0gEsBce3D56cMP4-lxAcFqSsL0_w",
      createdAt: "2023-11-14T00:29:13Z",
      txHash: "0xc80c23b7992cc94a271d1a56280ccc16a8f78a6d63ee34efdc35d8ffc71eda58",
    };

    it("should return ipOrgClient when the ipOrgClient id is valid", async function () {
      axiosMock.get = sinon.stub().returns({
        data: {
          ipOrg: ipOrgMock,
        },
      });

      const response = await ipOrgClient.get({
        ipOrgId: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
      });

      expect(response.ipOrg).to.deep.equal(ipOrgMock);
    });

    it("should throw error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipOrgClient.get({
          ipOrgId: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error when the ipOrgClient id is invalid", async function () {
      await expect(
        ipOrgClient.get({
          ipOrgId: "abc",
        }),
      ).to.be.rejectedWith(
        `Failed to get IPOrg: Invalid IPOrg id. Must be an address. But got: abc`,
      );
    });
  });

  describe("Test ipOrgClient.list", async function () {
    it("should return ipOrgs on a successful query", async function () {
      axiosMock.post = sinon.stub().returns({
        data: {
          ipOrgs: [
            {
              id: "7",
              name: "Alice In Wonderland",
              symbol: "AIW",
              owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
              metadataUrl: "https://arweave.net/dnFJl1v8kgOx_6Z0gEsBce3D56cMP4-lxAcFqSsL0_w",
              createdAt: "2023-11-14T00:29:13Z",
              txHash: "0xc80c23b7992cc94a271d1a56280ccc16a8f78a6d63ee34efdc35d8ffc71eda58",
            },
          ],
        },
      });

      const response = await ipOrgClient.list();

      expect(response.ipOrgs[0].id).to.equal("7");
      expect(response.ipOrgs[0].name).to.equal("Alice In Wonderland");
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(ipOrgClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
