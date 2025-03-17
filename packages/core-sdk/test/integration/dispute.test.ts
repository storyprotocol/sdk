import chai from "chai";
import { StoryClient } from "../../src";
import { RaiseDisputeRequest } from "../../src/index";
import {
  getStoryClient,
  publicClient,
  aeneid,
  RPC,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import { getPrivateKeyFromXprv, getXprvFromPrivateKey } from "./utils/BIP32";
import chaiAsPromised from "chai-as-promised";
import { Address, createWalletClient, http, parseEther, zeroAddress, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  disputeModuleAddress,
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  wrappedIpAddress,
} from "../../src/abi/generated";
import { chainStringToViemChain } from "../../src/utils/utils";
import { disputeModuleAbi } from "../../src/abi/generated";
import { CID } from "multiformats/cid";
import * as sha256 from "multiformats/hashes/sha2";
import { ASSERTION_ABI } from "../../src/abi/oov3Abi";
import { ArbitrationPolicyUmaClient } from "../../src/abi/generated";

const expect = chai.expect;
chai.use(chaiAsPromised);

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

/**
 * Settles an assertion associated with a dispute in the UMA arbitration protocol.
 *
 * This function takes a dispute ID, resolves it to an assertion ID, and then calls
 * the settleAssertion function on the Optimistic Oracle V3 contract to finalize
 * the arbitration outcome.
 *
 * @see https://docs.story.foundation/docs/uma-arbitration-policy#/
 *
 * @param client - The StoryClient instance used to interact with the Story Protocol
 * @param disputeId - The ID of the dispute to be settled
 * @returns A promise that resolves to the transaction hash of the settlement transaction
 */
const settleAssertion = async (client: StoryClient, disputeId: bigint): Promise<Hex> => {
  // Initialize the UMA arbitration policy client
  const arbitrationPolicyUmaClient = new ArbitrationPolicyUmaClient(publicClient, walletClient);

  // Get the address of the Optimistic Oracle V3 contract
  const oov3Address = await arbitrationPolicyUmaClient.oov3();

  // Convert the disputeId to the corresponding assertionId
  const assertionId = await client.dispute.disputeIdToAssertionId(disputeId);

  // Simulate the settleAssertion contract call to ensure it will succeed
  const { request } = await publicClient.simulateContract({
    address: oov3Address,
    abi: ASSERTION_ABI,
    functionName: "settleAssertion",
    args: [assertionId],
    account: walletClient.account,
  });

  // Execute the actual transaction to try to settle the assertion
  const txHash = await walletClient.writeContract(request);
  expect(txHash).to.be.a("string");

  // Wait for the transaction to be mined and verify it was successful
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  expect(receipt.status).to.equal("success");

  // Return the transaction hash for reference or further processing
  return txHash;
};

describe("Dispute Functions", () => {
  let clientA: StoryClient;
  let clientB: StoryClient;
  let ipIdB: Address;

  before(async () => {
    const xprv = getXprvFromPrivateKey(process.env.WALLET_PRIVATE_KEY as string);
    const privateKey = getPrivateKeyFromXprv(xprv);

    clientA = getStoryClient();
    clientB = getStoryClient(privateKey);
    const walletB = privateKeyToAccount(privateKey);

    // ClientA transfer some funds to walletB
    const clientAWalletClient = createWalletClient({
      chain: chainStringToViemChain("aeneid"),
      transport: http(RPC),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
    });

    const clientBBalance = await publicClient.getBalance({
      address: walletB.address,
    });

    if (clientBBalance < parseEther("5")) {
      // Less than 5 tokens (assuming 1 token = 0.01 ETH)
      const txHash = await clientAWalletClient.sendTransaction({
        to: walletB.address,
        value: parseEther("5"),
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    }

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
    const nftContract = txData.spgNftContract!;
    ipIdB = (
      await clientB.ipAsset.mintAndRegisterIp({
        spgNftContract: nftContract,
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).ipId!;
  });

  describe("raiseDispute and counter dispute", () => {
    let disputeId: bigint | undefined;
    it("should raise a dispute", async () => {
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: ipIdB,
        cid: await generateCID(),
        targetTag: "IMPROPER_REGISTRATION",
        liveness: 2592000,
        bond: 1,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await clientA.dispute.raiseDispute(raiseDisputeRequest);
      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.disputeId).to.be.a("bigint");
      disputeId = response.disputeId;
    });

    it("should be able to counter existing dispute once", async () => {
      const assertionId = await clientB.dispute.disputeIdToAssertionId(disputeId!);
      const counterEvidenceCID = await generateCID();
      const ret = await clientB.dispute.disputeAssertion({
        ipId: ipIdB,
        assertionId,
        counterEvidenceCID,
      });
      expect(ret.txHash).to.be.a("string").and.not.empty;

      // should throw error if attempting to dispute assertion again
      const secondDispute = await clientB.dispute.disputeAssertion({
        ipId: ipIdB,
        assertionId,
        counterEvidenceCID,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(secondDispute.receipt?.status).to.equal("reverted");
    });

    it("should throw error when liveness is out of bounds", async () => {
      const minLiveness = await clientA.dispute.arbitrationPolicyUmaClient.minLiveness();
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
   * directly set dispute judgments. The process creates a wallet client with the
   * whitelisted judge account, after which a user raises a dispute through the dispute
   * module. The judge account then sets the dispute judgment (simulating UMA's role),
   * and finally the dispute can be resolved based on this judgment.
   */
  describe("Dispute resolution", () => {
    let disputeId: bigint;
    let nftContract: Address;
    let parentIpId: Address;
    let licenseTermsId: bigint;
    let childIpId: Address;
    let childIpId2: Address;

    beforeEach(async function (this: Mocha.Context) {
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
      const derivativeIpIdResponse1 = await clientA.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: nftContract,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 1n,
          maxRts: 5 * 10 ** 6,
          maxRevenueShare: 100,
        },
        txOptions: { waitForTransaction: true },
      });
      childIpId = derivativeIpIdResponse1.ipId!;

      // Create a second derivative ip
      const derivativeIpIdResponse2 = await clientA.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: nftContract,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 1n,
          maxRts: 5 * 10 ** 6,
          maxRevenueShare: 100,
        },
        txOptions: { waitForTransaction: true },
      });
      childIpId2 = derivativeIpIdResponse2.ipId!;

      // Raise a dispute
      const response = await clientA.dispute.raiseDispute({
        targetIpId: parentIpId,
        cid: await generateCID(),
        targetTag: "IMPROPER_REGISTRATION",
        liveness: 1,
        bond: 0,
        txOptions: {
          waitForTransaction: true,
        },
      });
      disputeId = response.disputeId!;

      // This timeout guarantees that the assertion is expired
      // its intended to be longer than the current blocktime
      // so it won't be included in the same block
      await new Promise((resolve) => setTimeout(resolve, 3000));
    });

    it("should tag infringing ip", async () => {
      await settleAssertion(clientA, disputeId);

      // Tag derivative IP as infringing
      const results = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: childIpId,
            disputeId: disputeId,
          },
          {
            ipId: childIpId2,
            disputeId: disputeId,
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      expect(results[0].txHash).to.be.a("string").and.not.empty;
    });

    it("should tag a single IP as infringing without using multicall", async () => {
      /**
       * Test Flow:
       * 1. Set judgment on an existing dispute to mark it as valid (did in `before each` block)
       * 2. Verify the dispute state changed correctly after judgment
       * 3. Try to tag a derivative IP using the judged dispute
       */

      // Step 1: Set judgment on an existing dispute to mark it as valid
      await settleAssertion(clientA, disputeId);

      // Step 2: Verify dispute state
      // The disputes() function returns multiple values about the dispute:
      // - targetTag: the tag we wanted to apply when raising the dispute
      // - currentTag: the current state of the dispute after judgment
      // After a successful judgment, currentTag should equal targetTag
      const [
        _targetIpId, // IP being disputed
        _disputeInitiator, // Address that raised the dispute
        _disputeTimestamp, // When dispute was raised
        _arbitrationPolicy, // Policy used for arbitration
        _disputeEvidenceHash, // Evidence hash for dispute
        targetTag, // Tag we want to apply (e.g. "IMPROPER_REGISTRATION")
        currentTag, // Current state of dispute
        _infringerDisputeId, // Related dispute ID if this is a propagated tag
      ] = await publicClient.readContract({
        address: disputeModuleAddress[aeneid],
        abi: disputeModuleAbi,
        functionName: "disputes",
        args: [disputeId],
      });
      expect(currentTag).to.equal(targetTag); // Verify judgment was recorded correctly

      // Step 3: Attempt to tag a derivative IP
      // This will fail if:
      // - The dispute is not in a valid state (still IN_DISPUTE or cleared)
      // - The IP we're trying to tag is not actually a derivative of the disputed IP
      // - The dispute has already been used to tag this IP
      const response = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: childIpId, // The derivative IP to tag
            disputeId: disputeId, // Using the judged dispute as basis for tagging
          },
        ],
        options: {
          useMulticallWhenPossible: false, // Force single transaction instead of batch
        },
        txOptions: { waitForTransaction: true },
      });

      // Verify we got the expected response
      expect(response).to.have.lengthOf(1);
      expect(response[0].txHash).to.be.a("string").and.not.empty;
    });

    it("should tag multiple IPs as infringing using multicall", async () => {
      const disputeResponse = await clientA.dispute.raiseDispute({
        targetIpId: parentIpId,
        cid: await generateCID(),
        targetTag: "IMPROPER_REGISTRATION",
        liveness: 1,
        bond: 0,
        txOptions: { waitForTransaction: true },
      });
      const testDisputeId = disputeResponse.disputeId!;

      const derivativeResponse2 = await clientA.ipAsset.mintAndRegisterIpAndMakeDerivative({
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
      const childIpId2 = derivativeResponse2.ipId!;

      await settleAssertion(clientA, testDisputeId);

      // This timeout guarantees that the assertion is expired
      // its intended to be longer than the current blocktime
      // so it won't be included in the same block
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const disputeState = await publicClient.readContract({
        address: disputeModuleAddress[aeneid],
        abi: disputeModuleAbi,
        functionName: "disputes",
        args: [testDisputeId],
      });
      expect(disputeState[6]).to.equal(disputeState[5]);

      const response = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: childIpId,
            disputeId: testDisputeId,
          },
          {
            ipId: childIpId2,
            disputeId: testDisputeId,
          },
        ],
        options: {
          useMulticallWhenPossible: true,
        },
        txOptions: { waitForTransaction: true },
      });

      expect(response).to.have.lengthOf(1);
      expect(response[0].txHash).to.be.a("string").and.not.empty;
    });

    it("should tag multiple IPs without multicall when specified", async () => {
      // Create two new derivative IPs sequentially
      const derivativeResponse3 = await clientA.ipAsset.mintAndRegisterIpAndMakeDerivative({
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

      const derivativeResponse4 = await clientA.ipAsset.mintAndRegisterIpAndMakeDerivative({
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

      await settleAssertion(clientA, disputeId);

      const disputeState = await publicClient.readContract({
        address: disputeModuleAddress[aeneid],
        abi: disputeModuleAbi,
        functionName: "disputes",
        args: [disputeId],
      });
      expect(disputeState[6]).to.equal(disputeState[5]);

      const response1 = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: derivativeResponse3.ipId!,
            disputeId: disputeId,
          },
        ],
        options: {
          useMulticallWhenPossible: false,
        },
        txOptions: { waitForTransaction: true },
      });

      const response2 = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: derivativeResponse4.ipId!,
            disputeId: disputeId,
          },
        ],
        options: {
          useMulticallWhenPossible: false,
        },
        txOptions: { waitForTransaction: true },
      });

      const responses = [...response1, ...response2];
      expect(responses).to.have.lengthOf(2);
      expect(responses[0].txHash).to.be.a("string").and.not.empty;
      expect(responses[1].txHash).to.be.a("string").and.not.empty;
    });

    it("should fail when trying to tag with invalid dispute ID", async () => {
      await expect(
        clientA.dispute.tagIfRelatedIpInfringed({
          infringementTags: [
            {
              ipId: childIpId,
              disputeId: 999999n,
            },
          ],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
    });

    it("should resolve a dispute successfully when initiated by dispute initiator", async () => {
      await settleAssertion(clientA, disputeId);

      const disputeState = await publicClient.readContract({
        address: disputeModuleAddress[aeneid],
        abi: disputeModuleAbi,
        functionName: "disputes",
        args: [disputeId],
      });
      expect(disputeState[6]).to.equal(disputeState[5]);

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
