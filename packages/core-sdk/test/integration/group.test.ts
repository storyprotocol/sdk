import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address, zeroAddress } from "viem";
import { homer, getStoryClient, mintBySpg } from "./utils/util";
import { StoryClient } from "../../src";
import {
  evenSplitGroupPoolAddress,
  mockErc20Address,
  piLicenseTemplateAddress,
  royaltyPolicyLrpAddress,
} from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Group Functions", () => {
  let client: StoryClient;
  let spgNftContract: Address;
  let groupId: Address;
  let ipId: Address;
  let licenseTermsId: bigint;
  const groupPoolAddress = evenSplitGroupPoolAddress[homer];

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
      licenseTermsData: [
        {
          terms: {
            transferable: true,
            royaltyPolicy: royaltyPolicyLrpAddress[homer],
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
            currency: mockErc20Address[homer],
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
      ],
      txOptions: { waitForTransaction: true },
    });

    licenseTermsId = result.licenseTermsIds![0];
    ipId = result.ipId!;

    // Set licensing config
    await client.license.setLicensingConfig({
      ipId,
      licenseTermsId,
      licenseTemplate: piLicenseTemplateAddress[homer],
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
        allowDuplicates: true,
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
  });
});
