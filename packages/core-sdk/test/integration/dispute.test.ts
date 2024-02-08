import { expect } from "chai";
import { StoryClient, StoryConfig, Client, AddressZero } from "../../src";
import { Hex, http, stringToHex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  CancelDisputeRequest,
  RaiseDisputeRequest,
  ResolveDisputeRequest,
  SetDisputeJudgementRequest,
} from "../../src/types/resources/dispute";

describe("Dispute Functions", () => {
  let client: Client;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
  });
  describe("[Write Functions] Should be able to", async function () {
    it.skip("raise a dispute", async () => {
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: "0xa3028b46ff4aeba585ebfa1c241ad4a453b6f10dc7bc3d3ebaa9cecc680a6f71",
        arbitrationPolicy: "0xC6A1c49BCeeE2E512167d5c03e4753776477730b",
        linkToDisputeEvidence: "foo",
        targetTag: "bar",
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.raiseDispute(raiseDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it.skip("resolve a dispute", async () => {
      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 5,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.resolveDispute(resolveDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it.skip("cancel a dispute", async () => {
      const cancelDispute: CancelDisputeRequest = {
        disputeId: 5,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.cancelDispute(cancelDispute)).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });

    it.skip("set a dispute judgement", async () => {
      const setDisputeJudgementRequest: SetDisputeJudgementRequest = {
        disputeId: 5,
        decision: true,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(client.dispute.setDisputeJudgement(setDisputeJudgementRequest))
        .to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });

  describe("[Read Functions] Should be able to", async function () {
    //
    /** Should test reading:
     * Module key
     * disputeId
     * baseArbitrationPolicy
     * isWhitelistedDisputeTag
     * isWhitelistedArbitrationPolicy
     **/

    it.only("read name", async () => {
      const response = await client.dispute.readName();
      expect(response).to.be.equal("DISPUTE_MODULE");
    });

    it.only("read disputeId", async () => {
      const response = await client.dispute.readDisputeId();
      expect(response.toString()).to.be.equal("2");
    });

    it.only("read baseArbitrationPolicy", async () => {
      const response = await client.dispute.readBaseArbitrationPolicy();
      expect(response.toString()).to.be.equal("0xC6A1c49BCeeE2E512167d5c03e4753776477730b");
    });
    it.only("read isWhitelistedDisputeTag", async () => {
      const response = await client.dispute.readIsWhitelistedDisputeTag({ tag: "testTag" });
      expect(response).to.be.equal(false);
    });
    it.only("read isWhitelistedArbitrationPolicy", async () => {
      const response = await client.dispute.readIsWhitelistedArbitrationPolicy({
        arbitrationPolicy: AddressZero,
      });
      expect(response).to.be.equal(false);
    });
  });
  /*
  it.skip("should be able to raise dispute and wait for transaction", async () => {
    // Contract not complete

    const whitelistTag = "testTag";
    await client.dispute.whitelistDisputeTags({
      tag: whitelistTag,
      allowed: true,
      txOptions: {
        waitForTransaction: true,
      },
    });

    const arbPolicy = "0x90B53D67250c45973E81a6F832d6c4496108ac39";
    await client.dispute.whitelistArbitrationPolicy({
      arbitrationPolicy: arbPolicy,
      allowed: true,
      txOptions: {
        waitForTransaction: true,
      },
    });

    const response = await expect(
      client.dispute.raiseDispute({
        arbitrationPolicy: arbPolicy,
        targetIpId: "0x90B53D67250c45973E81a6F832d6c4496108ac31",
        linkToDisputeEvidence: "https://example.com",
        targetTag: whitelistTag,
        txOptions: {
          waitForTransaction: false,
        },
      }),
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string");
    expect(response.txHash).not.empty;
  });
*/
});
