import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address, zeroAddress } from "viem";
import { aeneid, getStoryClient, mintBySpg } from "./utils/util";
import { LicenseTermsData, StoryClient, WIP_TOKEN_ADDRESS } from "../../src";
import {
  evenSplitGroupPoolAddress,
  piLicenseTemplateAddress,
  royaltyPolicyLrpAddress,
} from "../../src/abi/generated";
import { NativeRoyaltyPolicy } from "../../src/types/resources/royalty";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Group Functions", () => {
  let client: StoryClient;
  let spgNftContract: Address;
  let groupId: Address;
  let ipId: Address;
  let licenseTermsId: bigint;
  const groupPoolAddress = evenSplitGroupPoolAddress[aeneid];
  const licenseTermsData: LicenseTermsData[] = [
    {
      terms: {
        transferable: true,
        royaltyPolicy: royaltyPolicyLrpAddress[aeneid],
        defaultMintingFee: 0n,
        expiration: BigInt(1000),
        commercialUse: true,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCeiling: BigInt(0),
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: BigInt(0),
        currency: WIP_TOKEN_ADDRESS,
        uri: "test case",
      },
      licensingConfig: {
        isSet: true,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: groupPoolAddress,
      },
    },
  ];

  // Setup - create necessary contracts and initial IP
  before(async () => {
    client = getStoryClient();

    // Create NFT Collection
    spgNftContract = (
      await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: process.env.TEST_WALLET_ADDRESS! as Address,
        contractURI: "test-uri",
        txOptions: { waitForTransaction: true },
      })
    ).spgNftContract!;

    // Create initial IP with license terms
    const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract,
      allowDuplicates: false,
      licenseTermsData,
      txOptions: { waitForTransaction: true },
    });

    licenseTermsId = result.licenseTermsIds![0];
    ipId = result.ipId!;

    // Set licensing config
    await client.license.setLicensingConfig({
      ipId,
      licenseTermsId,
      licenseTemplate: piLicenseTemplateAddress[aeneid],
      licensingConfig: {
        isSet: true,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: groupPoolAddress,
      },
    });
  });

  describe("Basic Group Operations", () => {
    it("should successfully register a basic group", async () => {
      const result = await client.groupClient.registerGroup({
        groupPool: groupPoolAddress,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.groupId).to.be.a("string").and.not.empty;
    });

    it("should successfully register group with encoded transaction data", async () => {
      const result = await client.groupClient.registerGroup({
        groupPool: groupPoolAddress,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData).to.exist;
      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
      expect(result.encodedTxData?.to).to.be.a("string").and.not.empty;
    });
  });

  describe("Group with License Operations", () => {
    it("should successfully register group and attach license", async () => {
      const result = await client.groupClient.registerGroupAndAttachLicense({
        groupPool: groupPoolAddress,
        licenseData: {
          licenseTermsId,
          licensingConfig: {
            isSet: true,
            mintingFee: 0n,
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        },
        txOptions: { waitForTransaction: true },
      });

      groupId = result.groupId!;
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.groupId).to.be.a("string").and.not.empty;
    });

    it("should successfully mint, register IP, attach license and add to group", async () => {
      const result = await client.groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId,
        spgNftContract,
        licenseData: [
          {
            licenseTermsId,
            licensingConfig: {
              isSet: true,
              mintingFee: 0n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: groupPoolAddress,
            },
          },
        ],
        maxAllowedRewardShare: 5,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });
  });

  describe("Advanced Group Operations", () => {
    it("should successfully register existing IP with license and add to group", async () => {
      const tokenId = await mintBySpg(spgNftContract, "test-metadata");
      const result = await client.groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId,
        nftContract: spgNftContract,
        tokenId: tokenId!,
        maxAllowedRewardShare: 5,
        licenseData: [
          {
            licenseTermsId,
            licensingConfig: {
              isSet: true,
              mintingFee: 0n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: groupPoolAddress,
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });

    it("should successfully register group with license and add multiple IPs", async () => {
      const result = await client.groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: groupPoolAddress,
        maxAllowedRewardShare: 5,
        ipIds: [ipId],
        licenseData: {
          licenseTermsId,
          licensingConfig: {
            isSet: true,
            mintingFee: 0n,
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        },
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.groupId).to.be.a("string").and.not.empty;
    });

    it("should fail when trying to add unregistered IP to group", async () => {
      await expect(
        client.groupClient.registerGroupAndAttachLicenseAndAddIps({
          groupPool: groupPoolAddress,
          maxAllowedRewardShare: 5,
          ipIds: [zeroAddress], // Invalid IP address
          licenseData: {
            licenseTermsId,
            licensingConfig: {
              isSet: true,
              mintingFee: 0n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: zeroAddress,
            },
          },
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("Failed to register group and attach license and add ips");
    });
    describe("Add IPs to Group and Remove IPs from Group", () => {
      let ipIds: Address[];
      it("should successfully add multiple IPs to group", async () => {
        const registerResult = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms({
          args: [
            {
              spgNftContract,
              licenseTermsData,
            },
            {
              spgNftContract,
              licenseTermsData,
            },
            {
              spgNftContract,
              licenseTermsData,
            },
          ],
          txOptions: { waitForTransaction: true },
        });
        ipIds = registerResult.results?.map((result) => result.ipId) ?? [];

        const result = await client.groupClient.addIpsToGroup({
          groupIpId: groupId,
          ipIds: ipIds,
          maxAllowedRewardSharePercentage: 5,
          txOptions: { waitForTransaction: true },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });

      it("should successfully remove IPs from group", async () => {
        const result = await client.groupClient.removeIpsFromGroup({
          groupIpId: groupId,
          ipIds: ipIds,
          txOptions: { waitForTransaction: true },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });

      it("should fail when trying to remove IPs from a non-existent group", async () => {
        const registerResult = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract,
          licenseTermsData,
          txOptions: { waitForTransaction: true },
        });
        const testIpId = registerResult.ipId!;

        const nonExistentGroupId = zeroAddress;

        await expect(
          client.groupClient.removeIpsFromGroup({
            groupIpId: nonExistentGroupId,
            ipIds: [testIpId],
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejectedWith("Failed to remove IPs from group");
      });

      it("should fail when trying to remove non-existent IPs from a group", async () => {
        const groupResult = await client.groupClient.registerGroup({
          groupPool: groupPoolAddress,
          txOptions: { waitForTransaction: true },
        });
        const testGroupId = groupResult.groupId!;

        const nonExistentIpId = zeroAddress;

        await expect(
          client.groupClient.removeIpsFromGroup({
            groupIpId: testGroupId,
            ipIds: [nonExistentIpId],
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejectedWith("Failed to remove IPs from group");
      });
    });
  });

  describe("Collect Royalty and Claim Reward", () => {
    let ipId: Address;
    let groupIpId: Address;
    let licenseTermsId: bigint;

    // Use the same license terms data for all IP IDs
    const licenseTermsData: LicenseTermsData[] = [
      {
        terms: {
          commercialAttribution: true,
          commercialRevCeiling: 10n,
          commercialRevShare: 10,
          commercialUse: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          currency: WIP_TOKEN_ADDRESS,
          derivativeRevCeiling: 0n,
          derivativesAllowed: true,
          derivativesApproval: false,
          derivativesAttribution: true,
          derivativesReciprocal: true,
          expiration: 0n,
          defaultMintingFee: 0n,
          royaltyPolicy: royaltyPolicyLrpAddress[aeneid],
          transferable: true,
          uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
        },
        licensingConfig: {
          isSet: true,
          mintingFee: 0n,
          licensingHook: zeroAddress,
          hookData: "0x",
          commercialRevShare: 10,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: groupPoolAddress,
        },
      },
    ];

    /**
     * Helper to mint and register an IP asset with PIL terms
     */
    const mintAndRegisterIpAssetWithPilTermsHelper = async () => {
      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData,
        txOptions: { waitForTransaction: true },
      });
      return result;
    };

    /**
     * Helper to mint and register an IP and make it a derivative of another IP
     */
    const mintAndRegisterIpAndMakeDerivativeHelper = async (
      groupIpId: Address,
      licenseTermsId: bigint,
    ) => {
      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [groupIpId],
          licenseTermsIds: [licenseTermsId],
          licenseTemplate: piLicenseTemplateAddress[aeneid],
          maxMintingFee: 0,
          maxRts: 10,
          maxRevenueShare: 0,
        },
        txOptions: { waitForTransaction: true },
      });
      return result.ipId!;
    };

    /**
     * Helper to pay royalty on behalf and transfer to vault
     */
    const payRoyaltyAndTransferToVaultHelper = async (
      childIpId: Address,
      groupIpId: Address,
      token: Address,
      amount: bigint,
    ) => {
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: childIpId,
        payerIpId: groupIpId,
        token,
        amount,
        txOptions: { waitForTransaction: true },
      });
      await client.royalty.transferToVault({
        royaltyPolicy: NativeRoyaltyPolicy.LRP,
        ipId: childIpId,
        ancestorIpId: groupIpId,
        token,
        txOptions: { waitForTransaction: true },
      });
    };

    /**
     * Helper to register a group and attach license
     */
    const registerGroupAndAttachLicenseHelper = async (
      licenseTermsId: bigint,
      ipIds: Address[],
    ) => {
      const result = await client.groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: groupPoolAddress,
        maxAllowedRewardShare: 100,
        ipIds,
        licenseData: {
          licenseTermsId,
          licenseTemplate: piLicenseTemplateAddress[aeneid],
          licensingConfig: {
            ...licenseTermsData[0].licensingConfig,
            expectGroupRewardPool: zeroAddress,
          },
        },
        txOptions: { waitForTransaction: true },
      });
      return result.groupId!;
    };

    before(async () => {
      // Register IP id
      const result1 = await mintAndRegisterIpAssetWithPilTermsHelper();
      ipId = result1.ipId!;
      licenseTermsId = result1.licenseTermsIds![0];

      // Register group id
      groupIpId = await registerGroupAndAttachLicenseHelper(licenseTermsId, [ipId]);
    });

    it("should successfully collect royalties", async () => {
      // Mint and register child IP id
      const childIpId = await mintAndRegisterIpAndMakeDerivativeHelper(groupIpId, licenseTermsId);

      // Pay royalties from child IP id to group IP id and transfer to vault
      await payRoyaltyAndTransferToVaultHelper(childIpId, groupIpId, WIP_TOKEN_ADDRESS, 100n);

      // Collect royalties
      const result = await client.groupClient.collectRoyalties({
        groupIpId,
        currencyToken: WIP_TOKEN_ADDRESS,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.collectedRoyalties).to.equal(10n);
    });

    it("should successfully get claimable reward", async () => {
      const result = await client.groupClient.getClaimableReward({
        groupIpId: groupIpId,
        currencyToken: WIP_TOKEN_ADDRESS,
        memberIpIds: [ipId],
      });

      expect(result).to.deep.equal([10n]);
    });

    it("should successfully claim reward", async () => {
      // Mint license tokens to the IP id which doesn't have a royalty vault
      await client.license.mintLicenseTokens({
        licensorIpId: ipId,
        licenseTermsId,
        amount: 100,
        maxMintingFee: 1,
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true },
      });

      // Claim reward
      const result = await client.groupClient.claimReward({
        groupIpId: groupIpId,
        currencyToken: WIP_TOKEN_ADDRESS,
        memberIpIds: [ipId],
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.claimedReward?.[0].amount[0]).to.equal(10n);
    });

    it("should fail when trying to claim reward for a non-existent group", async () => {
      const nonExistentGroupId = zeroAddress;
      await expect(
        client.groupClient.claimReward({
          groupIpId: nonExistentGroupId,
          currencyToken: WIP_TOKEN_ADDRESS,
          memberIpIds: [ipId],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("Failed to claim reward");
    });

    it("should fail when trying to claim reward with invalid token address", async () => {
      const invalidTokenAddress = zeroAddress;
      await expect(
        client.groupClient.claimReward({
          groupIpId: groupIpId,
          currencyToken: invalidTokenAddress,
          memberIpIds: [ipId],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("Failed to claim reward");
    });

    it("should successfully collect royalties and claim reward in one transaction", async () => {
      const ipIds: Address[] = [];

      const result1 = await mintAndRegisterIpAssetWithPilTermsHelper();
      const result2 = await mintAndRegisterIpAssetWithPilTermsHelper();
      ipIds.push(result1.ipId!);
      ipIds.push(result2.ipId!);
      licenseTermsId = result1.licenseTermsIds![0];

      const groupIpId = await registerGroupAndAttachLicenseHelper(licenseTermsId, ipIds);
      const childIpId1 = await mintAndRegisterIpAndMakeDerivativeHelper(groupIpId, licenseTermsId);
      const childIpId2 = await mintAndRegisterIpAndMakeDerivativeHelper(groupIpId, licenseTermsId);

      await payRoyaltyAndTransferToVaultHelper(childIpId1, groupIpId, WIP_TOKEN_ADDRESS, 100n);
      await payRoyaltyAndTransferToVaultHelper(childIpId2, groupIpId, WIP_TOKEN_ADDRESS, 100n);

      const result = await client.groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: groupIpId,
        currencyTokens: [WIP_TOKEN_ADDRESS],
        memberIpIds: ipIds,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.collectedRoyalties?.[0].amount).to.equal(20n);
      expect(result.royaltiesDistributed?.[0].amount).to.equal(10n);
      expect(result.royaltiesDistributed?.[1].amount).to.equal(10n);
    });
  });
});
