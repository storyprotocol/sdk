import { expect } from "chai";
import { StoryClient, StoryConfig, Client, AddressZero } from "../../src";
import { Hex, http, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe.only("Dispute Functions", () => {
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

  it("should be able to whitelist dispute tags and wait for transaction", async () => {
    const response = await expect(
      client.dispute.whitelistDisputeTags({
        tag: "testTag",
        allowed: true,
        txOptions: {
          waitForTransaction: false,
        },
      }),
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string");
    expect(response.txHash).not.empty;
  });

  it("should be able to whitelist arbitration policy and wait for transaction", async () => {
    const response = await expect(
      client.dispute.whitelistArbitrationPolicy({
        arbitrationPolicy: "0x90B53D67250c45973E81a6F832d6c4496108ac39",
        allowed: true,
        txOptions: {
          waitForTransaction: false,
        },
      }),
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string");
    expect(response.txHash).not.empty;
  });

  it("should be able to whitelist arbitration relayer and wait for transaction", async () => {
    await client.dispute.whitelistArbitrationPolicy({
      arbitrationPolicy: "0x90B53D67250c45973E81a6F832d6c4496108ac39",
      allowed: true,
      txOptions: {
        waitForTransaction: true,
      },
    });

    const response = await expect(
      client.dispute.whitelistArbitrationRelayer({
        arbitrationPolicy: "0x90B53D67250c45973E81a6F832d6c4496108ac39",
        arbitrationRelayer: "0x90B53D67250c45973E81a6F832d6c4496108ac31",
        allowed: true,
        txOptions: {
          waitForTransaction: false,
        },
      }),
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string");
    expect(response.txHash).not.empty;
  });

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

  it.skip("should be able to set dispute judgement and wait for transaction", async () => {
    // Need to set up Dispute memory dispute = disputes[_disputeId];

    await client.dispute.whitelistArbitrationRelayer({
      arbitrationPolicy: "0x90B53D67250c45973E81a6F832d6c4496108ac39",
      arbitrationRelayer: "0x90B53D67250c45973E81a6F832d6c4496108ac31",
      allowed: true,
      txOptions: {
        waitForTransaction: false,
      },
    });

    const response = await expect(
      client.dispute.setDisputeJudgement({
        disputeId: 1,
        decision: true,
        calldata: "0x",
        txOptions: {
          waitForTransaction: false,
        },
      }),
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string");
    expect(response.txHash).not.empty;
  });
});
