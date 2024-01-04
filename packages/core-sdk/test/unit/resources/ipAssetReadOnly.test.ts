import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAssetReadOnlyClient } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient } from "viem";

chai.use(chaiAsPromised);

describe("Test IpAssetReadOnlyClient", function () {
  let ipAssetClient: IPAssetReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    ipAssetClient = new IPAssetReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipAssetClient.get", function () {
    it("should return asset when the franchise id is valid", async function () {
      const expectedAsset = {
        id: "1",
        name: "The Empire Strikes Back",
        ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
        owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        metadataUrl: "https://arweave.net/R7-xPDAMqOhUSw3CM_UwXI7zdpQkzCCCUq3smzxyAaU",
        createdAt: "2023-11-14T00:29:13Z",
        txHash: "0x00a1a14e0193144e1d7024428ee242c44e5cacdbd7458c629d17c6366f6c5cb6",
      };
      axiosMock.get = sinon.stub().returns({
        data: {
          ipAsset: expectedAsset,
        },
      });

      const response = await ipAssetClient.get({
        ipAssetId: "7",
      });
      expect(response.ipAsset).to.deep.equal(expectedAsset);
    });

    it("should throw error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAssetClient.get({
          ipAssetId: "7",
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error if asset id is invalid", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAssetClient.get({
          ipAssetId: "fake ip asset id",
        }),
      ).to.be.rejectedWith("fake ip asset id");
    });
  });

  describe("Test ipAssetClient.list", async function () {
    const ipAssetMock = {
      id: "1",
      name: "The Empire Strikes Back",
      ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
      owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
      metadataUrl: "https://arweave.net/R7-xPDAMqOhUSw3CM_UwXI7zdpQkzCCCUq3smzxyAaU",
      createdAt: "2023-11-14T00:29:13Z",
      txHash: "0x00a1a14e0193144e1d7024428ee242c44e5cacdbd7458c629d17c6366f6c5cb6",
    };

    const mockResponse = sinon.stub().returns({
      data: {
        ipAssets: [ipAssetMock],
      },
    });

    it("should return ipAssets on a successful query", async function () {
      axiosMock.post = mockResponse;
      const response = await ipAssetClient.list({
        ipOrgId: "7",
      });

      expect(response.ipAssets[0]).to.deep.equal(ipAssetMock);
    });

    it("should return ipAssets without the request object", async function () {
      axiosMock.post = mockResponse;
      const response = await ipAssetClient.list();

      expect(response.ipAssets[0]).to.deep.equal(ipAssetMock);
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(
        ipAssetClient.list({
          ipOrgId: "abc",
        }),
      ).to.be.rejectedWith("HTTP 500");
    });
  });
});
