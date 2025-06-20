import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { CID } from "multiformats/cid";
import * as sha256 from "multiformats/hashes/sha2";
import { Address, Hex, toHex, zeroAddress } from "viem";

import { getDerivedStoryClient } from "./utils/BIP32";
import {
  aeneid,
  getStoryClient,
  publicClient,
  TEST_PRIVATE_KEY,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import { DisputeTargetTag, RaiseDisputeRequest, StoryClient, WIP_TOKEN_ADDRESS } from "../../src";
import {
  ArbitrationPolicyUmaClient,
  disputeModuleAbi,
  disputeModuleAddress,
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
} from "../../src/abi/generated";
import { getMinimumBond, settleAssertion } from "../../src/utils/oov3";

use(chaiAsPromised);

const generateCID = async (): Promise<string> => {
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
  let minimumBond: bigint;
  before(async () => {
    clientA = getStoryClient();
    const derivedClient = await getDerivedStoryClient();
    clientB = derivedClient.clientB;

    minimumBond = await getMinimumBond(
      publicClient,
      new ArbitrationPolicyUmaClient(publicClient, walletClient),
      WIP_TOKEN_ADDRESS,
    );

    const txData = await clientA.nftClient.createNFTCollection({
      name: "test-collection",
      symbol: "TEST",
      maxSupply: 100,
      isPublicMinting: true,
      mintOpen: true,
      contractURI: "test-uri",
      mintFeeRecipient: TEST_WALLET_ADDRESS,
    });
    const nftContract = txData.spgNftContract!;

    ipIdB = (
      await clientB.ipAsset.mintAndRegisterIp({
        spgNftContract: nftContract,
      })
    ).ipId!;
  });

  describe("raiseDispute and counter dispute", () => {
    let disputeId: bigint;
    it("should raise a dispute", async () => {
      const raiseDisputeRequest: RaiseDisputeRequest = {
        targetIpId: ipIdB,
        cid: await generateCID(),
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        liveness: 2592000,
        bond: minimumBond,
      };
      const response = await clientA.dispute.raiseDispute(raiseDisputeRequest);

      expect(response.txHash).to.be.a("string");
      expect(response.disputeId).to.be.a("bigint");
      disputeId = response.disputeId!;
    });

    it("should validate all enum values defined in DisputeTargetTag", async () => {
      const allTags = Object.values(DisputeTargetTag);

      for (const tag of allTags) {
        const tagHex: Hex = toHex(tag, { size: 32 });
        const { allowed } = await clientA.dispute.disputeModuleClient.isWhitelistedDisputeTag({
          tag: tagHex,
        });
        if (tag === DisputeTargetTag.IN_DISPUTE) {
          expect(allowed).equal(false);
        } else {
          expect(allowed).equal(true);
        }
      }
    });

    it("should raise disputes with different DisputeTargetTag enum values", async () => {
      const allTags = Object.values(DisputeTargetTag);

      for (const tag of allTags) {
        const raiseDisputeRequest: RaiseDisputeRequest = {
          targetIpId: ipIdB,
          cid: await generateCID(),
          targetTag: tag,
          liveness: 2592000,
          bond: minimumBond,
        };

        if (tag === DisputeTargetTag.IN_DISPUTE) {
          await expect(clientA.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
            "The target tag IN_DISPUTE is not whitelisted",
          );
        } else {
          const response = await clientA.dispute.raiseDispute(raiseDisputeRequest);
          expect(response.txHash).to.be.a("string");
          expect(response.disputeId).to.be.a("bigint");
        }
      }
    });

    it("should reject a dispute with an invalid tag not defined in the enum", async () => {
      await expect(
        clientA.dispute.raiseDispute({
          targetIpId: ipIdB,
          cid: await generateCID(),
          targetTag: "INVALID_TAG" as DisputeTargetTag,
          liveness: 2592000,
          bond: minimumBond,
        }),
      ).to.be.rejectedWith("The target tag INVALID_TAG is not whitelisted");
    });

    it("should be able to counter existing dispute once", async () => {
      const assertionId = await clientB.dispute.disputeIdToAssertionId(disputeId!);
      const counterEvidenceCID = await generateCID();
      const ret = await clientB.dispute.disputeAssertion({
        ipId: ipIdB,
        assertionId,
        counterEvidenceCID,
      });
      expect(ret.txHash).to.be.a("string");

      // should throw error if attempting to dispute assertion again
      await expect(
        clientB.dispute.disputeAssertion({
          ipId: ipIdB,
          assertionId,
          counterEvidenceCID,
        }),
      ).to.be.rejected;
    });
  });

  it("it should not cancel a dispute (yet)", async () => {
    const raiseResponse = await clientA.dispute.raiseDispute({
      targetIpId: ipIdB,
      cid: await generateCID(),
      targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
      liveness: 2592000,
      bond: minimumBond,
    });

    await expect(
      clientA.dispute.cancelDispute({
        disputeId: raiseResponse.disputeId!,
      }),
    ).to.be.rejected;
  });

  const getDisputeState = async (
    disputeId: bigint,
  ): Promise<{ targetTag: Hex; currentTag: Hex }> => {
    const dispute = await publicClient.readContract({
      address: disputeModuleAddress[aeneid],
      abi: disputeModuleAbi,
      functionName: "disputes",
      args: [disputeId],
    });

    return {
      targetTag: dispute[5],
      currentTag: dispute[6],
    };
  };

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

    beforeEach(async () => {
      // Setup NFT collection
      const txData = await clientA.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
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
              currency: WIP_TOKEN_ADDRESS,
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
      });
      childIpId2 = derivativeIpIdResponse2.ipId!;

      // Raise a dispute
      const response = await clientA.dispute.raiseDispute({
        targetIpId: parentIpId,
        cid: await generateCID(),
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        liveness: 1,
        bond: minimumBond,
      });
      disputeId = response.disputeId!;

      // This timeout guarantees that the assertion is expired
      // its intended to be longer than the current block time
      // so it won't be included in the same block
      await new Promise((resolve) => setTimeout(resolve, 3000));
    });

    it("should tag infringing ip", async () => {
      await settleAssertion(TEST_PRIVATE_KEY, disputeId);

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
      });
      expect(results[0].txHash).to.be.a("string");
    });

    it("should tag a single IP as infringing without using multicall", async () => {
      /**
       * Test Flow:
       * 1. Set judgment on an existing dispute to mark it as valid (did in `before each` block)
       * 2. Verify the dispute state changed correctly after judgment
       * 3. Try to tag a derivative IP using the judged dispute
       */

      // Step 1: Set judgment on an existing dispute to mark it as valid
      await settleAssertion(TEST_PRIVATE_KEY, disputeId);

      // Step 2: Verify dispute state
      // The disputes() function returns multiple values about the dispute:
      // - targetTag: the tag we wanted to apply when raising the dispute
      // - currentTag: the current state of the dispute after judgment
      // After a successful judgment, currentTag should equal targetTag

      const { currentTag, targetTag } = await getDisputeState(disputeId);

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
      });

      // Verify we got the expected response
      expect(response).to.have.lengthOf(1);
      expect(response[0].txHash).to.be.a("string");
    });

    it("should tag multiple IPs as infringing using multicall", async () => {
      const disputeResponse = await clientA.dispute.raiseDispute({
        targetIpId: parentIpId,
        cid: await generateCID(),
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        liveness: 1,
        bond: minimumBond,
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
      });
      const newChildIpId = derivativeResponse2.ipId!;

      await settleAssertion(TEST_PRIVATE_KEY, testDisputeId);

      // This timeout guarantees that the assertion is expired
      // its intended to be longer than the current block time
      // so it won't be included in the same block
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const { currentTag, targetTag } = await getDisputeState(testDisputeId);
      expect(currentTag).to.equal(targetTag);

      const response = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: childIpId,
            disputeId: testDisputeId,
          },
          {
            ipId: newChildIpId,
            disputeId: testDisputeId,
          },
        ],
        options: {
          useMulticallWhenPossible: true,
        },
      });

      expect(response).to.have.lengthOf(1);
      expect(response[0].txHash).to.be.a("string");
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
      });

      await settleAssertion(TEST_PRIVATE_KEY, disputeId);

      const { currentTag, targetTag } = await getDisputeState(disputeId);
      expect(currentTag).to.equal(targetTag);

      const responses = await clientA.dispute.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: derivativeResponse3.ipId!,
            disputeId: disputeId,
          },
          {
            ipId: derivativeResponse4.ipId!,
            disputeId: disputeId,
          },
        ],
        options: {
          useMulticallWhenPossible: false,
        },
      });

      expect(responses).to.have.lengthOf(2);
      expect(responses[0].txHash).to.be.a("string");
      expect(responses[1].txHash).to.be.a("string");
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
        }),
      ).to.be.rejected;
    });

    it("should resolve a dispute successfully when initiated by dispute initiator", async () => {
      await settleAssertion(TEST_PRIVATE_KEY, disputeId);

      const { currentTag, targetTag } = await getDisputeState(disputeId);
      expect(currentTag).to.equal(targetTag);

      const response = await clientA.dispute.resolveDispute({
        disputeId: disputeId,
        data: "0x",
      });
      expect(response.txHash).to.be.a("string");
    });

    it("should fail when non-initiator tries to resolve the dispute", async () => {
      await expect(
        clientB.dispute.resolveDispute({
          disputeId: disputeId,
          data: "0x",
        }),
      ).to.be.rejectedWith("NotDisputeInitiator");
    });

    it("should propagate IMPROPER_REGISTRATION tag to derivative IPs", async () => {
      await settleAssertion(TEST_PRIVATE_KEY, disputeId);

      // Verify the dispute state changed correctly
      const { currentTag: parentCurrentTag, targetTag: parentTargetTag } = await getDisputeState(
        disputeId,
      );
      expect(parentCurrentTag).to.equal(parentTargetTag);

      // Propagate the tag to both derivative IPs
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
      });

      const logData = results[0].receipt?.logs[0].data;
      const firstWord = logData.slice(0, 66);
      const childDisputeId = BigInt(firstWord);

      // Verify successful tagging
      expect(results[0].txHash).to.be.a("string");

      const { currentTag: childCurrentTag } = await getDisputeState(childDisputeId);
      // Convert the IMPROPER_USAGE tag to hex for comparison
      const improperUsageTagHex = toHex(DisputeTargetTag.IMPROPER_REGISTRATION, { size: 32 });

      // Verify both child IPs have the IMPROPER_USAGE tag by
      // fetching and comparing their dispute tags
      expect(parentCurrentTag).to.equal(parentTargetTag);
      expect(childCurrentTag).to.equal(improperUsageTagHex);
    });
  });
});
