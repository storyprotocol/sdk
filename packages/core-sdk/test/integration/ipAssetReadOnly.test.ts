import { expect } from "chai";
import { StoryClient, StoryReadOnlyConfig, ListIpAssetRequest } from "../../src";
import { ReadOnlyClient } from "../../src";

describe("IP Asset Read Only Functions", () => {
  let client: ReadOnlyClient;

  before(function () {
    const config: StoryReadOnlyConfig = {};

    client = StoryClient.newReadOnlyClient(config);
  });

  describe("Get IP Asset", async function () {
    it("should return asset when the asset id is valid", async () => {
      const response = await client.ipAsset.get({
        ipAssetId: "1",
      });
      expect(response.ipAsset).is.not.null;
    });
  });

  describe("List IP assets", async function () {
    it("should return a list of IP assets successfully upon query", async () => {
      const response = await client.ipAsset.list({
        ipOrgId: process.env.TEST_IPORG_ID as string,
        options: {
          pagination: {
            limit: 10,
            offset: 0,
          },
        },
      });
      expect(response).is.not.null;
    });

    it("should return a list of IP assets with pagination", async () => {
      const response = await client.ipAsset.list({
        ipOrgId: process.env.TEST_IPORG_ID as string,
        options: {
          pagination: {
            limit: 1,
            offset: 0,
          },
        },
      });

      expect(response).is.not.null;
      expect(response.ipAssets.length).to.equal(1);
    });

    it("should return a list of ipAssets successfully without options", async () => {
      const response = await client.ipAsset.list();
      expect(response).is.not.null;
      expect(response.ipAssets.length).to.gt(0);
    });

    it("should return a list of ipAssets if the options are invalid", async () => {
      const options = {
        options: {},
      } as ListIpAssetRequest;
      const response = await client.ipAsset.list(options);
      expect(response).is.not.null;
      expect(response.ipAssets.length).to.gt(0);
    });
  });
});
