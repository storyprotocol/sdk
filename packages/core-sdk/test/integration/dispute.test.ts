import { expect } from "chai";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { StoryClient, StoryConfig } from "../../src";
import {
  CancelDisputeRequest,
  RaiseDisputeRequest,
  ResolveDisputeRequest,
} from "../../src/types/resources/dispute";
import { getDisputeModuleConfig } from "../config";

describe("Dispute Functions", () => {
  let client: StoryClient;

  before(function () {
    const config: StoryConfig = {
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
    };

    client = StoryClient.newClient(config);
    client.dispute.disputeModuleConfig = getDisputeModuleConfig("sepolia");
  });

  describe("Should be able to", async function () {
    it("raise a dispute", async () => {
      const waitForTransaction = true;
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
        arbitrationPolicy: "0xb41BC78478878B338336C5E7a34292213779cd6F",
        linkToDisputeEvidence: "foo",
        targetTag: "PLAGIARISM",
        txOptions: {
          waitForTransaction: waitForTransaction,
        },
      };
      const response = await expect(client.dispute.raiseDispute(raiseDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;

      if (waitForTransaction) {
        expect(response.disputeId).to.be.a("string");
        expect(response.disputeId).not.empty;
      }
    });

    it.skip("resolve a dispute", async () => {
      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 3,
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
