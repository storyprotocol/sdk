import { expect } from "chai";
import { Account, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { StoryClient, StoryConfig } from "../../src";
import {
  CancelDisputeRequest,
  RaiseDisputeRequest,
  ResolveDisputeRequest,
  SetDisputeJudgementRequest,
} from "../../src/types/resources/dispute";
import { sepolia as sepoliaAddr } from "../../src/utils/env";
import { MockAssetClient } from "../mock/mockUtils";

describe.only("Dispute Functions", () => {
  let client: StoryClient;
  let mockAsset: MockAssetClient;
  let account: Account;

  before(function () {
    console.log(process.env.RPC_PROVIDER_URL);
    account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex);
    const config: StoryConfig = {
      transport: http(process.env.RPC_PROVIDER_URL),
      account,
    };

    client = StoryClient.newClient(config);

    mockAsset = new MockAssetClient(config);
  });

  describe("Should be able to", async function () {
    it.only("raise a dispute", async () => {
      const currentAllowance = await mockAsset.erc20Allowance({
        owner: account.address,
        spender: sepoliaAddr.ArbitrationPolicySP as Hex,
      });

      // First, approve the ArbitrationPolicy to transfer on behalf of the requester
      if (currentAllowance < 1_000_000) {
        await mockAsset.erc20Approve({
          spender: sepoliaAddr.ArbitrationPolicySP as Hex,
          amount: "1000000000",
        });
      }

      const raiseDisputeRequest: RaiseDisputeRequest = {
        // targetIpId: "0x004e38104adc39cbf4cea9bd8876440a969e3d0b",
        // arbitrationPolicy: "0xb41BC78478878B338336C5E7a34292213779cd6F",
        targetIpId: "0x4fA1B684c4cf334C8dd225a74b1535Ca328F29A5",
        arbitrationPolicy: sepoliaAddr.ArbitrationPolicySP as Hex,
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
    });

    it("resolve a dispute", async () => {
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

    it("cancel a dispute", async () => {
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
  });
});
