import chai from "chai";
import { StoryClient } from "../../src";
import {
  CancelDisputeRequest,
  RaiseDisputeRequest,
  ResolveDisputeRequest,
} from "../../src/types/resources/dispute";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./utils/util";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.skip("Dispute Functions", () => {
  let client: StoryClient;

  before(function () {
    client = getStoryClientInSepolia();
  });

  describe("Should be able to", async function () {
    it("raise a dispute", async () => {
      const tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        tokenContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: registerResult.ipId!,
        arbitrationPolicy: "0xb41BC78478878B338336C5E7a34292213779cd6F",
        linkToDisputeEvidence: "foo",
        targetTag: "PLAGIARISM",
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.raiseDispute(raiseDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (true) {
        expect(response.disputeId).to.be.a("string");
        expect(response.disputeId).not.empty;
      }
    });

    it.skip("resolve a dispute", async () => {
      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 3,
        data: "0x",
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.resolveDispute(resolveDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it("cancel a dispute", async () => {
      const cancelDispute: CancelDisputeRequest = {
        disputeId: 3,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.cancelDispute(cancelDispute)).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });
});
