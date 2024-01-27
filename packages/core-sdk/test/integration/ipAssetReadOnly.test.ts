import { expect } from "chai";
import { StoryClient, StoryReadOnlyConfig, ReadOnlyClient } from "../../src";
import { IpAsset, ListIpAssetRequest } from "../../src/types/resources/ipAsset";

describe("IPAsset client integration tests", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("List IPAssets", async function () {
    it("should return array of IPAssets", async function () {
      const req = {
        options: {
          limit: 10,
          offset: 0,
        },
      } as ListIpAssetRequest;

      const response = await client.ipAsset.list(req);
      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectIPAssetFields(response.data[0]);
    });

    it("should return a list of ipAssets successfully without options", async function () {
      const response = await client.ipAsset.list();

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectIPAssetFields(response.data[0]);
    });

    it("should return a list of ipAssets if the options are invalid", async function () {
      const options = {
        options: {},
      } as ListIpAssetRequest;
      const response = await client.ipAsset.list(options);

      expect(response).to.have.property("data");
      expect(response.data).to.be.an("array");
      expect(response.data.length).to.gt(0);
      expectIPAssetFields(response.data[0]);
    });
  });

  describe("Get IPAsset", async function () {
    it("should return IP Asset from request ipId", async function () {
      const response = await client.ipAsset.get({
        ipId: (process.env.TEST_IP_ID as string) || "0x06cb17d43f16ad5cc3cd7757296fa87ce7ac741d",
      });

      expect(response).to.have.property("data");
      expectIPAssetFields(response.data);
    });
  });

  function expectIPAssetFields(ipAsset: IpAsset) {
    expect(ipAsset).to.have.property("id");
    expect(ipAsset).to.have.property("ipId");
    expect(ipAsset).to.have.property("chainId");
    expect(ipAsset).to.have.property("tokenContract");
    expect(ipAsset).to.have.property("tokenId");
    expect(ipAsset).to.have.property("metadataResolverAddress");
  }
});
