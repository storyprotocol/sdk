import { expect } from "chai";
import { StoryClient, StoryConfig, Client, ListTagRequest } from "../../src";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { GetTagRequest } from "../../src/types/resources/tagging";

describe.only("Tagging Indexer Functions", () => {
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
        id: "3f00d5103788c499de7aa690f5f2c70f2cbef9840ceecf995da99ff4c24516d9a35db6bd0d0bbe86f1e6f9678d2e1865388a36d7f6f430b9cce462f8ecf5b4a719f9ede4fdfbacfd3e34c07e37702724",
      };
      const response = await expect(client.tagging.get(getTagRequest)).to.not.be.rejected;

      expect(response.data).to.be.an("object");
      expect(response.data).to.have.property("id");
      expect(response.data).to.have.property("ipId");
      expect(response.data).to.have.property("tag");
      expect(response.data).to.not.be.empty;
    });
  });
});
