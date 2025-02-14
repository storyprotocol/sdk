import chai from "chai";
import { StoryClient } from "../../src";
import { RaiseDisputeRequest } from "../../src/index";
import {
  getStoryClient,
  aeneid,
  publicClient,
  walletClient,
  TEST_WALLET_ADDRESS,
  mockERC721,
  getTokenId,
  RPC,
} from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address, Hex, maxUint256, zeroAddress, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  arbitrationPolicyUmaAddress,
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  wrappedIpAddress,
  disputeModuleAbi,
} from "../../src/abi/generated";
import { WIPTokenClient } from "../../src/utils/token";
import { MockERC20 } from "./utils/mockERC20";
import { chainStringToViemChain } from "../../src/utils/utils";
import { CID } from "multiformats/cid";
import * as sha256 from "multiformats/hashes/sha2";

const expect = chai.expect;
chai.use(chaiAsPromised);

const DISPUTE_MODULE_ADDRESS = "0x9b7A9c70AFF961C799110954fc06F3093aeb94C5";
const SET_DISPUTE_JUDGEMENT_ABI = disputeModuleAbi.find(
  (item) => item.type === "function" && item.name === "setDisputeJudgement",
);

const generateCID = async () => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const hash = await sha256.sha256.digest(randomBytes);
  const cidv1 = CID.createV1(0x70, hash);
  return cidv1.toV0().toString();
};

describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let parentIpId: Hex;
  let childIpId: Hex;
  let ipIdB: Address;
  let nftContract: Address;
  let licenseTermsId: bigint;
  let disputeId: bigint;

  before(async () => {
    // Setup primary client
    clientA = getStoryClient();

    // Setup secondary client with new wallet
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const privateKey = `0x${Buffer.from(randomBytes).toString("hex")}` as `0x${string}`;
    const walletB = privateKeyToAccount(privateKey);

    // Fund secondary wallet
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

    // Setup token approvals
    const mockERC20 = new WIPTokenClient(publicClient, walletClient);
    await mockERC20.approve(arbitrationPolicyUmaAddress[aeneid], maxUint256);

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

    // Setup parent IP and license terms
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

    // Setup derivative IP
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

    // Setup IP for client B
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

  describe("Basic Dispute Operations", () => {
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
      disputeId = response.disputeId!;
      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.disputeId).to.be.a("bigint");
    });

    it("should throw error when liveness is out of bounds", async () => {
      const minLiveness = await clientA.dispute.arbitrationPolicyUmaReadOnlyClient.minLiveness();
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: ipIdB,
        cid: await generateCID(),
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
        cid: await generateCID(),
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
        cid: await generateCID(),
        targetTag: "INVALID_TAG",
        liveness: 2592000,
        bond: 0,
        txOptions: { waitForTransaction: true },
      };

      await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
        `The target tag INVALID_TAG is not whitelisted`,
      );
    });

    it("should not cancel a dispute (yet)", async () => {
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

    it("should tag infringing ip", async () => {
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
  });

  describe("Dispute Resolution", () => {
    let testDisputeId: bigint;

    before(function () {
      if (!process.env.JUDGE_PRIVATE_KEY) {
        this.skip();
      }
    });

    beforeEach(async () => {
      // Setup judge wallet client
      const judgeWalletClient = createWalletClient({
        chain: chainStringToViemChain("aeneid"),
        transport: http(RPC),
        account: privateKeyToAccount(process.env.JUDGE_PRIVATE_KEY as `0x${string}`),
      });

      // Raise a new dispute
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
      testDisputeId = response.disputeId!;

      // Set dispute judgement
      const { request } = await publicClient.simulateContract({
        address: DISPUTE_MODULE_ADDRESS,
        abi: [SET_DISPUTE_JUDGEMENT_ABI],
        functionName: "setDisputeJudgement",
        args: [testDisputeId, true, "0x"],
        account: judgeWalletClient.account!,
      });

      const txHash = await judgeWalletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    });

    it("should resolve a dispute successfully when initiated by dispute initiator", async () => {
      const response = await clientA.dispute.resolveDispute({
        disputeId: testDisputeId,
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
          disputeId: testDisputeId,
          data: "0x",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejectedWith("NotDisputeInitiator");
    });
  });
});
