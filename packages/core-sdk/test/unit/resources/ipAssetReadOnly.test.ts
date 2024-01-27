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
    it("should return Account when the ipId is valid", async function () {
      const expectedAccount = {
        id: "0x6c4c9e252ed8196a261f7c1c4258f707f5268045",
        ipId: "0x6c4c9e252ed8196a261f7c1c4258f707f5268045",
        chainId: "11155111",
        tokenContract: "0x1daae3197bc469cb97b917aa460a12dd95c6627c",
        tokenId: "3",
        metadataResolverAddress: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
      };
      axiosMock.get = sinon.stub().returns({
        data: expectedAccount,
      });

      const response = await ipAssetClient.get({
        ipId: "0x6c4c9e252ed8196a261f7c1c4258f707f5268045",
      });
      expect(response).to.deep.equal(expectedAccount);
    });

    it("should throw error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAssetClient.get({
          ipId: "0x6c4c9e252ed8196a261f7c1c4258f707f5268045",
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error if Account id is invalid", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAssetClient.get({
          ipId: "fake ip Account id",
        }),
      ).to.be.rejectedWith("fake ip Account id");
    });
  });

  describe("Test ipAssetClient.list", async function () {
    const ipAssetMock = {
      id: "0x6c4c9e252ed8196a261f7c1c4258f707f5268045",
      ipId: "0x6c4c9e252ed8196a261f7c1c4258f707f5268045",
      chainId: "11155111",
      tokenContract: "0x1daae3197bc469cb97b917aa460a12dd95c6627c",
      tokenId: "3",
      metadataResolverAddress: "0x6c88f438cbfd9866dcd067ffe18b951f19b968da",
    };

    const mockResponse = sinon.stub().returns({
      data: { data: [ipAssetMock] },
    });

    it("should return ipAsset on a successful query", async function () {
      axiosMock.post = mockResponse;
      const response = await ipAssetClient.list();

      expect(response.data[0]).to.deep.equal(ipAssetMock);
    });

    it("should return ipAsset without the request object", async function () {
      axiosMock.post = mockResponse;
      const response = await ipAssetClient.list();

      expect(response.data[0]).to.deep.equal(ipAssetMock);
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(ipAssetClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
