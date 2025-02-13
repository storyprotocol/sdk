import chai from "chai";
import { StoryClient } from "../../src";
import { RaiseDisputeRequest } from "../../src/index";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  publicClient,
  aeneid,
  RPC,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import {
  Address,
  WalletClient,
  createWalletClient,
  http,
  maxUint256,
  parseEther,
  zeroAddress,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { MockERC20 } from "./utils/mockERC20";
import {
  arbitrationPolicyUmaAddress,
  disputeModuleAddress,
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  wrappedIpAddress,
} from "../../src/abi/generated";
import { chainStringToViemChain } from "../../src/utils/utils";
import { disputeModuleAbi } from "../../src/abi/generated";
import { CID } from "multiformats/cid";
import * as sha256 from "multiformats/hashes/sha2";
import { WIPTokenClient } from "../../src/utils/token";

const expect = chai.expect;
chai.use(chaiAsPromised);

const DISPUTE_MODULE_ADDRESS = disputeModuleAddress[aeneid];
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

  before(async () => {
    const privateKey = generatePrivateKey();
    clientA = getStoryClient();
    clientB = getStoryClient(privateKey);
    const walletB = privateKeyToAccount(privateKey);

    // ClientA transfer some funds to walletB
    const clientAWalletClient = createWalletClient({
      chain: chainStringToViemChain("aeneid"),
      transport: http(RPC),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`),
    });
    const txHash = await clientAWalletClient.sendTransaction({
      to: walletB.address,
      value: parseEther("0.25"),
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    // clientA approves the arbitration policyUma module to spend the some tokens
    const mockERC20 = new WIPTokenClient(publicClient, walletClient);
    await mockERC20.approve(arbitrationPolicyUmaAddress[aeneid], maxUint256);
  });

  describe("raiseDispute", () => {
    let ipIdB: Address;
    before(async () => {
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

  /**
   * Setup for dispute resolution testing
   *
   * On mainnet, disputes are judged by UMA's optimistic oracle. For testing purposes,
   * we simulate this process by setting up a whitelisted judge account that can
   * directly set dispute judgements. The process creates a wallet client with the
   * whitelisted judge account, after which a user raises a dispute through the dispute
   * module. The judge account then sets the dispute judgement (simulating UMA's role),
   * and finally the dispute can be resolved based on this judgement.
   */
  describe("Dispute resolution", () => {
    let disputeId: bigint;
    let nftContract: Address;
    let parentIpId: Address;
    let licenseTermsId: bigint;
    let childIpId: Address;
    let judgeWalletClient: WalletClient;

    before(async function (this: Mocha.Context) {
      // Skip tests if whitelisted judge private key is not configured
      if (!process.env.JUDGE_PRIVATE_KEY) {
        this.skip();
      }
      // Set up judge wallet client using whitelisted account
       judgeWalletClient = createWalletClient({
        chain: chainStringToViemChain("aeneid"),
        transport: http(RPC),
        account: privateKeyToAccount(process.env.JUDGE_PRIVATE_KEY as Address),
      });

      // Setup NFT collection
      const txData = await clientA.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        txOptions: { waitForTransaction: true },
      });
      nftContract = txData.spgNftContract!;

      // Get parent IP ID and license terms ID
      const ipIdAndLicenseResponse = await clientA.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: nftContract,
        allowDuplicates: false,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 0n,
              expiration: 0n,
              commercialUse: true,
              commercialAttribution: false,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: zeroAddress,
              commercialRevShare: 90,
              commercialRevCeiling: 0n,
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              derivativeRevCeiling: 0n,
              currency: wrappedIpAddress[aeneid],
              uri: "",
            },
            licensingConfig: {
              isSet: true,
              mintingFee: 0n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: evenSplitGroupPoolAddress[aeneid],
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      parentIpId = ipIdAndLicenseResponse.ipId!;
      licenseTermsId = ipIdAndLicenseResponse.licenseTermsIds![0];

      //Create a derivative ip
      const derivativeIpIdResponse = await clientA.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: nftContract,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 1n,
          maxRts: 5 * 10 ** 6,
          maxRevenueShare: 100,
        },
        allowDuplicates: true,
        txOptions: { waitForTransaction: true },
      });
      childIpId = derivativeIpIdResponse.ipId!;
    });

    it("should raise a dispute", async () => {
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: parentIpId,
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
      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.disputeId).to.be.a("bigint");
    });

    it("should tag infringing ip", async () => {
      // Step 1: Judge sets dispute judgement
      // This simulates UMA's role on mainnet by directly setting the judgement
      const { request } = await publicClient.simulateContract({
        address: DISPUTE_MODULE_ADDRESS,
        abi: [SET_DISPUTE_JUDGEMENT_ABI],
        functionName: "setDisputeJudgement",
        args: [disputeId, true, "0x"],
        account: judgeWalletClient.account!,
      });
      const txHash = await judgeWalletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Step 2: Tag derivative IP as infringing
      const results = await clientA.dispute.tagIfRelatedIpInfringed({
        args: [
          {
            ipIdToTag: childIpId,
            infringerDisputeId: disputeId,
          },
        ],
        txOptions: { waitForTransaction: true },
        useMulticallWhenPossible: true,
      });
      expect(results[0].txHash).to.be.a("string").and.not.empty;
    });

  // Test that dispute initiator can resolve the dispute after judgement
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

  // Test that non-initiators cannot resolve the dispute
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
