import chai from "chai";
import { StoryClient } from "../../src";
import { CancelDisputeRequest, RaiseDisputeRequest } from "../../src/index";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address } from "viem";
import { MockERC20 } from "./utils/mockERC20";

chai.use(chaiAsPromised);
const expect = chai.expect;

const arbitrationPolicyAddress = "0xc07Bc791CF55E718BA7D70cE650B3152BbE3325e";
describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let disputeId: number;
  let ipIdB: Address;

  before(async () => {
    clientA = getStoryClientInSepolia();
    clientB = getStoryClientInSepolia();
    const mockERC20 = new MockERC20();
    await mockERC20.approve(arbitrationPolicyAddress);
    const tokenId = await getTokenId();
    ipIdB = (
      await clientB.ipAsset.register({
        nftContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).ipId!;
  });

  it("raise a dispute", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      arbitrationPolicy: arbitrationPolicyAddress,
      linkToDisputeEvidence: "foo",
      targetTag: "PLAGIARISM",
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.not.be
      .rejected;
    disputeId = response.disputeId;
    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.disputeId).to.be.a("bigint");
  });

  it("cancel a dispute", async () => {
    const cancelDispute: CancelDisputeRequest = {
      disputeId: disputeId,
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await expect(clientA.dispute.cancelDispute(cancelDispute)).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
  });
});
