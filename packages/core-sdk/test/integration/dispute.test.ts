import chai from "chai";
import { StoryClient } from "../../src";
import { RaiseDisputeRequest } from "../../src/index";
import { getStoryClient, aeneid, TEST_WALLET_ADDRESS } from "./utils/util";
import chaiAsPromised from "chai-as-promised";
import { Address, Hex, zeroAddress } from "viem";
import { MockERC20 } from "./utils/mockERC20";
import {
  arbitrationPolicyUmaAddress,
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  wrappedIpAddress,
} from "../../src/abi/generated";
const expect = chai.expect;
chai.use(chaiAsPromised);

describe("Dispute Functions", () => {
  let client: StoryClient;
  let parentIpId: Hex;
  let childIpId: Hex;
  let nftContract: Address;
  let licenseTermsId: bigint;
  let disputeId: bigint;

  before(async () => {
    client = getStoryClient();
    const mockERC20 = new MockERC20(wrappedIpAddress[aeneid]);
    await mockERC20.approve(arbitrationPolicyUmaAddress[aeneid]);
    // Setup NFT collection
    const txData = await client.nftClient.createNFTCollection({
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
    const ipIdAndLicenseResponse = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
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

    // Create a derivative ip
    const derivativeIpIdResponse = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
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
    console.log("parentIpId", childIpId);
  });

  it("should raise a dispute", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: parentIpId,
      cid: "QmeyFm6gj1jMdfVYbnyFwZfm9FC1jYLLnFYqre48xKYLHd",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 0,
      txOptions: {
        waitForTransaction: true,
      },
    };
    const response = await client.dispute.raiseDispute(raiseDisputeRequest);
    disputeId = response.disputeId!;
    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.disputeId).to.be.a("bigint");
  });

  it.skip("should throw error when liveness is out of bounds", async () => {
    const minLiveness = await client.dispute.arbitrationPolicyUmaReadOnlyClient.minLiveness();
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: parentIpId,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: Number(minLiveness) - 1, // Below minimum
      bond: 0,
      txOptions: { waitForTransaction: true },
    };

    await expect(client.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `Liveness must be between`,
    );
  });

  it.skip("should throw error when bond exceeds maximum", async () => {
    const maxBonds = await client.dispute.arbitrationPolicyUmaReadOnlyClient.maxBonds({
      token: wrappedIpAddress[aeneid],
    });

    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: parentIpId,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 2000000000000000000,
      txOptions: {
        waitForTransaction: true,
      },
    };

    await expect(client.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `Bonds must be less than`,
    );
  });

  it.skip("should throw error for non-whitelisted dispute tag", async () => {
    const raiseDisputeRequest: RaiseDisputeRequest = {
      targetIpId: parentIpId,
      cid: "QmXqqsXNQkdDS1TiMgZADze23BLHAAEkcS2mMQ1XLQjmWs",
      targetTag: "INVALID_TAG",
      liveness: 2592000,
      bond: 0,
      txOptions: { waitForTransaction: true },
    };

    await expect(client.dispute.raiseDispute(raiseDisputeRequest)).to.be.rejectedWith(
      `The target tag INVALID_TAG is not whitelisted`,
    );
  });

  it.skip("it should not cancel a dispute (yet)", async () => {
    // First raise a dispute
    const raiseResponse = await client.dispute.raiseDispute({
      targetIpId: parentIpId,
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      targetTag: "IMPROPER_REGISTRATION",
      liveness: 2592000,
      bond: 0,
      txOptions: { waitForTransaction: true },
    });

    // Then you shouldn't be able to cancel it
    expect(
      client.dispute.cancelDispute({
        disputeId: raiseResponse.disputeId!,
        txOptions: { waitForTransaction: true },
      }),
    ).to.be.rejected;
  });

  it("should tag infringing ip", async () => {
    const tagResponse = await client.dispute.tagIfRelatedIpInfringed({
      args: [
        {
          ipIdToTag: childIpId,
          infringerDisputeId: disputeId,
        },
      ],
      txOptions: { waitForTransaction: true },
      useMulticallWhenPossible: true,
    });
  });
});
