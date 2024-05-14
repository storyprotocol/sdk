import chai from "chai";
import { StoryClient } from "../../src";
import { CancelDisputeRequest, RaiseDisputeRequest, ResolveDisputeRequest } from "../../src/index";
import {
  MockERC721,
  getStoryClientInSepolia,
  getTokenId,
  publicClient,
  sepoliaChainId,
  walletClient,
} from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address, Hex } from "viem";
import { MockERC20 } from "./utils/mockERC20";
import { privateKeyToAccount } from "viem/accounts";
import { disputeModuleAddress } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

const arbitrationPolicyAddress = "0xc07Bc791CF55E718BA7D70cE650B3152BbE3325e";
describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let disputeId: number;
  let ipIdB: Address;
  async function setDisputeJudgement(
    WALLET_PRIVATE_KEY: Hex,
    disputeId: bigint,
    decision: boolean,
    data: Hex,
  ) {
    try {
      const account = privateKeyToAccount(WALLET_PRIVATE_KEY);
      const contractAbi = {
        inputs: [
          { internalType: "uint256", name: "disputeId", type: "uint256" },
          { internalType: "bool", name: "decision", type: "bool" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "setDisputeJudgement",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      };

      const requestArgs = {
        address: disputeModuleAddress[sepoliaChainId],
        functionName: "setDisputeJudgement",
        args: [disputeId, decision, data],
        abi: [contractAbi],
        account: account,
      };

      await publicClient.simulateContract(requestArgs);
      const hash = await walletClient.writeContract(requestArgs);
      await publicClient.waitForTransactionReceipt({
        hash: hash,
      });
    } catch (error) {
      console.error(error);
    }
  }
  before(async function () {
    clientA = getStoryClientInSepolia();
    clientB = getStoryClientInSepolia(process.env.SEPOLIA_WALLET_PRIVATE_KEY2 as Address);
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

  it("resolve a dispute", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: ipIdB,
      arbitrationPolicy: arbitrationPolicyAddress,
      linkToDisputeEvidence: "foo",
      targetTag: "PLAGIARISM",
      txOptions: {
        waitForTransaction: true,
      },
    };
    const otherDisputeId = (await clientA.dispute.raiseDispute(raiseDisputeRequest)).disputeId!;
    await setDisputeJudgement(
      process.env.SEPOLIA_WALLET_PRIVATE_KEY3 as Hex,
      otherDisputeId,
      true,
      "0x",
    );
    const resolveDisputeRequest: ResolveDisputeRequest = {
      disputeId: otherDisputeId!,
      data: "0x",
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await expect(clientA.dispute.resolveDispute(resolveDisputeRequest)).to.not.be
      .rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
  });
});
