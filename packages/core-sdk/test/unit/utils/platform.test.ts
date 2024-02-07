import * as sinon from "sinon";
import { PlatformClient } from "../../../src";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createMock, createFileReaderMock } from "../testUtils";
import { PublicClient, WalletClient } from "viem";
import { AxiosInstance } from "axios";

chai.use(chaiAsPromised);

describe("Test PlatformClient", function () {
  let platformClient: PlatformClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  let mockFile = new File([""], "test.png", { type: "image/png" });
  let mockBuffer = Buffer.from("test");
  this.beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    platformClient = new PlatformClient(axiosMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test platform.uploadFile", function () {
    before(() => {
      const onLoadEvent = new Event("load") as unknown as ProgressEvent<FileReader>;
      global.FileReader = createFileReaderMock(
        "data:base64,dGVzdCBzdHJpbmcgYmxvYg==",
        onLoadEvent,
      ) as any;
    });

    it("should return url when the upload file transaction is successful on the client", async function () {
      const mockPreSignUrlResp = {
        data: {
          url: "https://example.com/upload",
          key: "file-key",
        },
      };
      const mockArweaveUrl = "https://arweave.net/SVBYzNCI8-GdUCe1_N9eA2Nol0rYi_AH-CBw1vo2YUM";
      const mockUploadConfirmResp = {
        data: {
          uri: mockArweaveUrl,
        },
      };
      axiosMock.post = sinon
        .stub()
        .withArgs("/platform/file-upload/request")
        .resolves(mockPreSignUrlResp)
        .withArgs("/platform/file-upload/confirm")
        .resolves(mockUploadConfirmResp);
      axiosMock.put = sinon.stub().resolves({ status: 200 });

      const response = await platformClient.uploadFile(mockFile, "image/png");
      expect(response.uri).to.equal(mockArweaveUrl);
    });

    it("should return url when the upload file transaction is successful on the server", async function () {
      const mockPreSignUrlResp = {
        data: {
          url: "https://example.com/upload",
          key: "file-key",
        },
      };
      const mockArweaveUrl = "https://arweave.net/SVBYzNCI8-GdUCe1_N9eA2Nol0rYi_AH-CBw1vo2YUM";
      const mockUploadConfirmResp = {
        data: {
          uri: mockArweaveUrl,
        },
      };
      axiosMock.post = sinon
        .stub()
        .withArgs("/platform/file-upload/request")
        .resolves(mockPreSignUrlResp)
        .withArgs("/platform/file-upload/confirm")
        .resolves(mockUploadConfirmResp);
      axiosMock.put = sinon.stub().resolves({ status: 200 });

      const response = await platformClient.uploadFile(mockBuffer, "image/png");
      expect(response.uri).to.equal(mockArweaveUrl);
    });

    it("should throw error when it failed to upload files to s3", async function () {
      const mockPreSignUrlResp = {
        data: {
          url: "https://example.com/upload",
          key: "file-key",
        },
      };
      const mockArweaveUrl = "https://arweave.net/SVBYzNCI8-GdUCe1_N9eA2Nol0rYi_AH-CBw1vo2YUM";
      const mockUploadConfirmResp = {
        data: {
          uri: mockArweaveUrl,
        },
      };
      axiosMock.post = sinon
        .stub()
        .withArgs("/platform/file-upload/request")
        .resolves(mockPreSignUrlResp)
        .withArgs("/platform/file-upload/confirm")
        .resolves(mockUploadConfirmResp);
      axiosMock.put = sinon.stub().resolves({ status: 400 });

      await expect(platformClient.uploadFile(mockBuffer, "image/png")).to.be.rejectedWith(
        "Failed to upload file: Failed to upload file to s3. Status: 400",
      );
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("revert"));
      await expect(platformClient.uploadFile(mockFile, "image/png")).to.be.rejectedWith("revert");
    });
  });
});
