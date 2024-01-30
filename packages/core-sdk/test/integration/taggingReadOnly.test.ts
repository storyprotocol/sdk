import { expect } from "chai";
import { StoryClient, StoryConfig, Client, ListTagRequest } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { GetTagRequest } from "../../src/types/resources/tagging";

describe("Tagging Indexer Functions", () => {
  let client: Client;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
  });

  describe("Tagging indexer", async function () {
    it("should be able to list tags", async () => {
      const response = await expect(client.tagging.list()).to.not.be.rejected;

      expect(response.data).to.be.an("array");
      expect(response.data[0]).to.have.property("id");
      expect(response.data[0]).to.have.property("ipId");
      expect(response.data[0]).to.have.property("tag");
      expect(response.data).to.not.be.empty;
    });

    it("should be able to get a tag by it's tag id", async () => {
      const getTagRequest: GetTagRequest = {
        id: "0xeae93c26ec1b50xc4-testTag",
      };
      const response = await client.tagging.get(getTagRequest);

      expect(response.data).to.be.an("object");
      expect(response.data).to.have.property("id");
      expect(response.data).to.have.property("ipId");
      expect(response.data).to.have.property("tag");
      expect(response.data).to.not.be.empty;
    });
  });
});
