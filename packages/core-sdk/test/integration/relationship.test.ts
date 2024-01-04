import { expect } from "chai";
import { StoryClient, StoryConfig, Client, RegisterRelationshipRequest } from "../../src";
import { privateKeyToAccount } from "viem/accounts";
import { Hex, http } from "viem";
import { sepolia } from "viem/chains";

describe("Relationship Functions", function () {
  let client: Client;

  before(function () {
    const config: StoryConfig = {
      chain: sepolia,
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    client = StoryClient.newClient(config);
  });

  describe("Register", async function () {
    it("should create a relationship and return txHash", async function () {
      const waitForTransaction: boolean = true;
      const mockRegisterRequest: RegisterRelationshipRequest = {
        ipOrgId: process.env.TEST_IPORG_ID as string,
        relType: process.env.TEST_RELATIONSHIP_TYPE as string,
        srcContract: process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT as string,
        srcTokenId: process.env.TEST_IPASSET_ID1 as string,
        dstContract: process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT as string,
        dstTokenId: process.env.TEST_IPASSET_ID2 as string,
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: waitForTransaction,
        },
      };

      const response = await expect(client.relationship.register(mockRegisterRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.exist.and.be.a("string").and.not.be.empty;
      if (waitForTransaction) {
        expect(response.relationshipId).to.exist.and.be.a("string");
      }
    });
  });
});
