import { AxiosInstance } from "axios";
import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { ResourceType, ActionType, TaggingReadOnlyClient } from "../../../src";
import { TaggingClient } from "../../../src/resources/tagging";
import { GetTagRequest } from "../../../src/types/resources/tagging";

chai.use(chaiAsPromised);

describe("Test TaggingReadOnlyClient", function () {
  let taggingClient: TaggingReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    taggingClient = new TaggingClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test TaggingReadOnlyClient.list", function () {
    const tagMock1 = {
      id: "0xef425fd7c8d9f1719d09d83c5a751f9cd62f4cb5-authentic",
      ipId: "0xef425fd7c8d9f1719d09d83c5a751f9cd62f4cb5",
      tag: "authentic",
    };
    const tagMock2 = {
      id: "0xabcc2421f927c128b9f5a94b612f4541c8e624b6-premium",
      ipId: "0xabcc2421f927c128b9f5a94b612f4541c8e624b6",
      tag: "premium",
    };
    it("list() should return an array of tags", async function () {
      axiosMock.post = sinon.stub().resolves({
        data: {
          tags: [tagMock1, tagMock2],
        },
      });

      const response = await taggingClient.list();
      const tags = response.tags;

      expect(tags[0]).to.be.deep.equal(tagMock1);
      expect(tags[1]).to.be.deep.equal(tagMock2);
    });
    it("get(id) should return a tag", async function () {
      axiosMock.get = sinon.stub().resolves({
        data: {
          tag: tagMock1,
        },
      });
      const getTagRequest: GetTagRequest = {
        id: tagMock1.id,
      };
      const response = await taggingClient.get(getTagRequest);
      const tag = response.tag;

      expect(tag).to.be.deep.equal(tagMock1);
    });

    it("list() should be able to throw an error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(taggingClient.list()).to.be.rejectedWith("HTTP 500");
    });
    it("get(id) should be able to throw an error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(taggingClient.get({ id: "foo" })).to.be.rejectedWith("HTTP 500");
    });
  });
});
