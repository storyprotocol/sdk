import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address, zeroAddress } from "viem";
import { aeneid, getStoryClient, mintBySpgWithoutMintFee } from "./utils/util";
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
      const tokenId = await mintBySpgWithoutMintFee(spgNftContract, "test-metadata");
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
      const ipIds = registerResult.results?.map((result) => result.ipId);

      const result = await client.groupClient.addIpsToGroup({
        groupIpId: groupId,
        ipIds: ipIds!,
        maxAllowedRewardSharePercentage: 5,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });
  });

  describe("Collect Royalty and Claim Reward", () => {
    const ipIds: Address[] = [];
    let groupIpId: Address;
    //1. Use the same license terms data for all IP IDs
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

    before(async () => {
      // 2. Get IP IDs
      const result1 = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData,
        txOptions: { waitForTransaction: true },
      });
      const result2 = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData,
        txOptions: { waitForTransaction: true },
      });
      ipIds.push(result1.ipId!);
      ipIds.push(result2.ipId!);
      const licenseTermsId = result1.licenseTermsIds![0];

      //3. Register group id
      const result3 = await client.groupClient.registerGroupAndAttachLicenseAndAddIps({
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
      groupIpId = result3.groupId!;

      //3. Mint and register child ip id
      const result4 = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
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
      const childIpId1 = result4.ipId!;
      const result5 = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
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
      const childIpId2 = result5.ipId!;

      //4. Pay royalties from child IPs to group IP ID
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: childIpId1,
        payerIpId: groupIpId,
        token: WIP_TOKEN_ADDRESS,
        amount: 100,
        txOptions: { waitForTransaction: true },
      });
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: childIpId2,
        payerIpId: groupIpId,
        token: WIP_TOKEN_ADDRESS,
        amount: 100,
        txOptions: { waitForTransaction: true },
      });

      //5. Transfer to vault
      const transferToVault = async (childIpId: Address, groupIpId: Address, token: Address) => {
        await client.royalty.transferToVault({
          royaltyPolicy: NativeRoyaltyPolicy.LRP,
          ipId: childIpId,
          ancestorIpId: groupIpId,
          token,
          txOptions: { waitForTransaction: true },
        });
      };
      await transferToVault(childIpId1, groupIpId, WIP_TOKEN_ADDRESS);
      await transferToVault(childIpId2, groupIpId, WIP_TOKEN_ADDRESS);
    });
    it("should successfully collect royalties and claim reward", async () => {
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
