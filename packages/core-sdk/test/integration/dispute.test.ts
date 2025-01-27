import chai from "chai";
import { StoryClient } from "../../src";
import { RaiseDisputeRequest } from "../../src/index";
import { mockERC721, getStoryClient, getTokenId, homer } from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address } from "viem";
import { MockERC20 } from "./utils/mockERC20";
import { arbitrationPolicyUmaAddress, erc20TokenAddress } from "../../src/abi/generated";
const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let ipIdB: Address;

  before(async () => {
    clientA = getStoryClient();
    clientB = getStoryClient();
    const mockERC20 = new MockERC20(erc20TokenAddress[homer]);
    await mockERC20.approve(arbitrationPolicyUmaAddress[homer]);
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
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 0,
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await clientA.dispute.raiseDispute(raiseDisputeRequest);
    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.disputeId).to.be.a("bigint");
  });

  it("should throw error when liveness is out of bounds", async () => {
    const minLiveness = await clientA.dispute.arbitrationPolicyUmaReadOnlyClient.minLiveness();
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: Number(minLiveness) - 1, // Below minimum
      bond: 0,
      txOptions: { waitForTransaction: true },
    };

    await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `Liveness must be between`,
    );
  });

  it("should throw error when bond exceeds maximum", async () => {
    const maxBonds = await clientA.dispute.arbitrationPolicyUmaReadOnlyClient.maxBonds({
      token: erc20TokenAddress[homer],
    });

    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 2000000000000000000,
      txOptions: {
        waitForTransaction: true,
      },
    };

    await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `Bonds must be less than`,
    );
  });

  it("should throw error for non-whitelisted dispute tag", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "INVALID_TAG",
      liveness: 2592000,
      bond: 0,
      txOptions: { waitForTransaction: true },
    };

    await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `The target tag INVALID_TAG is not whitelisted`,
    );
  });

  it("it should not cancel a dispute (yet)", async () => {
    // First raise a dispute
    const raiseResponse = await clientA.dispute.raiseDispute({
      targetIpId: ipIdB,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 0,
      txOptions: { waitForTransaction: true },
    });

    // Then you shouldnn't be able to cancel it
    expect(
      clientA.dispute.cancelDispute({
        disputeId: raiseResponse.disputeId!,
        txOptions: { waitForTransaction: true },
      }),
    ).to.be.rejected;
  });
});
