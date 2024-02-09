import { expect } from "chai";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { StoryClient, StoryConfig } from "../../src";
import {
  CancelDisputeRequest,
  RaiseDisputeRequest,
  ResolveDisputeRequest,
  SetDisputeJudgementRequest,
} from "../../src/types/resources/dispute";

describe("Dispute Functions", () => {
  let client: StoryClient;

  before(function () {
    const config: StoryConfig = {
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
    };

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
});
