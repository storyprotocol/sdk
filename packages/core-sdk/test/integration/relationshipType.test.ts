import { expect } from "chai";
import {
  StoryClient,
  StoryConfig,
  Client,
  RegisterRelationshipTypeRequest,
  Relatables,
} from "../../src";
import { privateKeyToAccount } from "viem/accounts";
import { Hex, http } from "viem";

describe("Relationship Type Functions", function () {
  let client: Client;

  before(function () {
    const config: StoryConfig = {
      chainId: "sepolia",
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    client = StoryClient.newClient(config);
  });

  describe("RegisterType", async function () {
    it("should create a relationship type and return txHash", async function () {
      const waitForTransaction: boolean = true;
      const mockRegisterTypeRequest: RegisterRelationshipTypeRequest = {
        ipOrgId: process.env.TEST_IPORG_ID as string,
        relType: process.env.TEST_RELATIONSHIP_TYPE as string,
        relatedElements: {
          src: Relatables.IPA,
          dst: Relatables.IPA,
        },
        allowedSrcIpAssetTypes: [1],
        allowedDstIpAssetTypes: [1],
        txOptions: {
          waitForTransaction: waitForTransaction,
        },
      };
      const response = await expect(client.relationshipType.register(mockRegisterTypeRequest)).to
        .not.be.rejected;

      expect(response.txHash).to.exist.and.be.a("string").and.not.be.empty;
      if (waitForTransaction) {
        expect(response.success).to.exist.and.be.true;
      }
    });
  });
});
