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
  describe("Should be able to", async function () {
    it.skip("raise a dispute", async () => {
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: "0xcd3a91675b990f27eb544b85cdb6844573b66a43",
        arbitrationPolicy: "0x61eb3DBc2c60Cf6aFde43a9286D89Da264899003",
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
