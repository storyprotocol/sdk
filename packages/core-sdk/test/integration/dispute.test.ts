import chai from "chai";
import { StoryClient } from "../../src";
import { RaiseDisputeRequest } from "../../src/index";
import { mockERC721, getStoryClient, getTokenId, publicClient, aeneid, RPC } from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { MockERC20 } from "./utils/mockERC20";
import { arbitrationPolicyUmaAddress, wrappedIpAddress } from "../../src/abi/generated";
import { chainStringToViemChain } from "../../src/utils/utils";
import { disputeModuleAbi } from "../../src/abi/generated";

import {} from "viem/accounts";
import {} from "viem";

import { CID } from "multiformats/cid";
import * as sha256 from "multiformats/hashes/sha2";

const expect = chai.expect;
chai.use(chaiAsPromised);

const DISPUTE_MODULE_ADDRESS = "0x9b7A9c70AFF961C799110954fc06F3093aeb94C5";
const SET_DISPUTE_JUDGEMENT_ABI = disputeModuleAbi.find(
  (item) => item.type === "function" && item.name === "setDisputeJudgement",
);

const generateCID = async () => {
  // Generate a random 32-byte buffer
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  // Hash the bytes using SHA-256
  const hash = await sha256.sha256.digest(randomBytes);
  // Create a CIDv1 in dag-pb format
  const cidv1 = CID.createV1(0x70, hash); // 0x70 = dag-pb codec
  // Convert CIDv1 to CIDv0 (Base58-encoded)
  return cidv1.toV0().toString();
};

describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let ipIdB: Address;

  before(async () => {
    clientA = getStoryClient();

    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const privateKey = `0x${Buffer.from(randomBytes).toString("hex")}` as `0x${string}`;
    const walletB = privateKeyToAccount(privateKey);

    const mainWalletClient = createWalletClient({
      chain: chainStringToViemChain("aeneid"),
      transport: http(RPC),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`),
    });
    const txHash = await mainWalletClient.sendTransaction({
      to: walletB.address,
      value: parseEther("0.25"),
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    clientB = getStoryClient(privateKey);

    const mockERC20 = new MockERC20(wrappedIpAddress[aeneid]);
    await mockERC20.approve(arbitrationPolicyUmaAddress[aeneid]);
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

  it("should raise a dispute", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      cid: await generateCID(),
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
      liveness: Number(minLiveness) - 1,
      bond: 0,
      txOptions: { waitForTransaction: true },
    };

    await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `Liveness must be between`,
    );
  });

  it("should throw error when bond exceeds maximum", async () => {
    const maxBonds = await clientA.dispute.arbitrationPolicyUmaReadOnlyClient.maxBonds({
      token: wrappedIpAddress[aeneid],
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
    const raiseResponse = await clientA.dispute.raiseDispute({
      targetIpId: ipIdB,
      cid: await generateCID(),
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 0,
      txOptions: { waitForTransaction: true },
    });

    expect(
      clientA.dispute.cancelDispute({
        disputeId: raiseResponse.disputeId!,
        txOptions: { waitForTransaction: true },
      }),
    ).to.be.rejected;
  });

  describe("resolveDispute", () => {
    let disputeId: bigint;

    before(function (this: Mocha.Context) {
      if (!process.env.JUDGE_PRIVATE_KEY) {
        this.skip();
      }
    });

    beforeEach(async () => {
      const judgeWalletClient = createWalletClient({
        chain: chainStringToViemChain("aeneid"),
        transport: http(RPC),
        account: privateKeyToAccount(process.env.JUDGE_PRIVATE_KEY as `0x${string}`),
      });

      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: ipIdB,
        cid: await generateCID(),
        targetTag: "IMPROPER_REGISTRATION",
        liveness: 2592000,
        bond: 0,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await clientA.dispute.raiseDispute(raiseDisputeRequest);
      disputeId = response.disputeId!;

      // Setting dispute judgement directly through contract
      const { request } = await publicClient.simulateContract({
        address: DISPUTE_MODULE_ADDRESS,
        abi: [SET_DISPUTE_JUDGEMENT_ABI],
        functionName: "setDisputeJudgement",
        args: [disputeId, true, "0x"],
        account: judgeWalletClient.account!,
      });

      const txHash = await judgeWalletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    });

    it("should resolve a dispute successfully when initiated by dispute initiator", async () => {
      const response = await clientA.dispute.resolveDispute({
        disputeId: disputeId,
        data: "0x",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should fail when non-initiator tries to resolve the dispute", async () => {
      await expect(
        clientB.dispute.resolveDispute({
          disputeId: disputeId,
          data: "0x",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejectedWith("NotDisputeInitiator");
    });
  });
});
