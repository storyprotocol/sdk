import chai from "chai";
import { StoryClient } from "../../src";
import { CancelDisputeRequest, RaiseDisputeRequest } from "../../src/index";
import { mockERC721, getStoryClient, getTokenId, iliadChainId } from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address } from "viem";
import { MockERC20 } from "./utils/mockERC20";
import { arbitrationPolicySpAddress } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

const arbitrationPolicyAddress = arbitrationPolicySpAddress[iliadChainId];
describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let disputeId: bigint;
  let ipIdB: Address;

  before(async () => {
    clientA = getStoryClient();
    clientB = getStoryClient();
    const mockERC20 = new MockERC20();
    await mockERC20.mint();
    await mockERC20.approve(arbitrationPolicyAddress);
    const tokenId = await getTokenId();
    ipIdB = (
      await clientB.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).ipId!;
  });

  it("should not throw error when raise a dispute", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      disputeEvidenceHash: "0xb7b94ecbd1f9f8cb209909e5785fb2858c9a8c4b220c017995a75346ad1b5db5",
      targetTag: "PLAGIARISM",
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await clientA.dispute.raiseDispute(raiseDisputeRequest);
    disputeId = response.disputeId!;
    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.disputeId).to.be.a("bigint");
  });

  it("should not throw error when cancel a dispute", async () => {
    const cancelDispute: CancelDisputeRequest = {
      disputeId: disputeId,
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await clientA.dispute.cancelDispute(cancelDispute);
    expect(response.txHash).to.be.a("string").and.not.empty;
  });
});
