import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import { Address, Hex, toHex, zeroAddress } from "viem";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  mintBySpg,
  approveForLicenseToken,
  homer,
} from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import {
  evenSplitGroupPoolAddress,
  mockErc20Address,
  piLicenseTemplateAddress,
  royaltyPolicyLapAddress,
  derivativeWorkflowsAddress,
  royaltyTokenDistributionWorkflowsAddress,
} from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

const pool = evenSplitGroupPoolAddress[homer];

describe("IP Asset Functions", () => {
  let client: StoryClient;
  let noCommercialLicenseTermsId: bigint;
  let parentIpId: Hex;

  before(async () => {
    client = getStoryClient();
    const res = await client.license.registerNonComSocialRemixingPIL({
      txOptions: { waitForTransaction: true },
    });
    noCommercialLicenseTermsId = res.licenseTermsId!;
  });

  describe("Basic IP Asset Operations", () => {
    let childIpId: Hex;

    it("should register an IP Asset", async () => {
      const tokenId = await getTokenId();
      const response = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: { waitForTransaction: true },
      });

      expect(response.ipId).to.be.a("string").and.not.empty;
      if (!response.ipId) {
        throw new Error("IP ID not returned from registration");
      }
      childIpId = response.ipId;
    });

    it("should register derivative", async () => {
      const tokenId = await getTokenId();
      parentIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: { waitForTransaction: true },
      });

      const response = await client.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: [parentIpId],
        licenseTermsIds: [noCommercialLicenseTermsId],
        maxMintingFee: "0",
        maxRts: 5 * 10 ** 6,
        maxRevenueShare: "0",
        txOptions: { waitForTransaction: true },
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should register derivative with license tokens", async () => {
      const tokenId = await getTokenId();
      const ipId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: noCommercialLicenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: "0",
        maxRevenueShare: 1,
        txOptions: { waitForTransaction: true },
      });

      const response = await client.ipAsset.registerDerivativeWithLicenseTokens({
        childIpId: ipId,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        maxRts: 5 * 10 ** 6,
        txOptions: { waitForTransaction: true },
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should return true if IP asset is registered", async () => {
      const isRegistered = await client.ipAsset.isRegistered(parentIpId);
      expect(isRegistered).to.be.true;
    });

    it("should return false if IP asset is not registered", async () => {
      const isRegistered = await client.ipAsset.isRegistered(
        "0x1234567890123456789012345678901234567890",
      );
      expect(isRegistered).to.be.false;
    });
  });

  describe("SPG NFT Operations", () => {
    let nftContract: Hex;
    let licenseTermsId: bigint;

    before(async () => {
      // Setup NFT collection
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: process.env.TEST_WALLET_ADDRESS! as Address,
        txOptions: { waitForTransaction: true },
      });
      nftContract = txData.spgNftContract!;

      // Setup license terms
      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: nftContract,
        allowDuplicates: false,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[homer],
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
              currency: mockErc20Address[homer],
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
              expectGroupRewardPool: pool,
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });

      parentIpId = result.ipId!;
      licenseTermsId = result.licenseTermsIds![0];

      // Setup ERC20
      const mockERC20 = new MockERC20();
      await mockERC20.approve(derivativeWorkflowsAddress[homer]);
      await mockERC20.approve(royaltyTokenDistributionWorkflowsAddress[homer]);
      await mockERC20.mint();
    });

    it("should register IP Asset with metadata", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const response = await client.ipAsset.register({
        nftContract,
        tokenId: tokenId!,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        deadline: 1000n,
        txOptions: { waitForTransaction: true },
      });
      expect(response.ipId).to.be.a("string").and.not.empty;
    });

    it("should register derivative IP", async () => {
      const tokenChildId = await mintBySpg(nftContract);
      const result = await client.ipAsset.registerDerivativeIp({
        nftContract: nftContract,
        tokenId: tokenChildId!,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: "0",
          maxRts: 5 * 10 ** 6,
          maxRevenueShare: "0",
        },
        deadline: 1000n,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });
    it("should register IP and attach PIL terms", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: nftContract,
        tokenId: tokenId!,
        deadline: 1000n,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: zeroAddress,
              defaultMintingFee: 0n,
              expiration: 0n,
              commercialUse: false,
              commercialAttribution: false,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: zeroAddress,
              commercialRevShare: 0,
              commercialRevCeiling: 0n,
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              derivativeRevCeiling: 0n,
              currency: mockErc20Address[homer],
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
              expectGroupRewardPool: zeroAddress,
            },
          },
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[homer],
              defaultMintingFee: 10000n,
              expiration: 1000n,
              commercialUse: true,
              commercialAttribution: false,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: zeroAddress,
              commercialRevShare: 0,
              commercialRevCeiling: 0n,
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              derivativeRevCeiling: 0n,
              currency: mockErc20Address[homer],
              uri: "test case",
            },
            licensingConfig: {
              isSet: true,
              mintingFee: 10000n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: zeroAddress,
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
      expect(result.licenseTermsIds).to.be.an("array").and.not.empty;
    });

    it("should mint and register IP and make derivative", async () => {
      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
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
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.childIpId).to.be.a("string").and.not.empty;
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should mint and register IP", async () => {
      const result = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: nftContract,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        allowDuplicates: false,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });

    it("should register PIL terms and attach", async () => {
      const result = await client.ipAsset.registerPilTermsAndAttach({
        ipId: parentIpId,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: zeroAddress,
              defaultMintingFee: 0n,
              expiration: 0n,
              commercialUse: false,
              commercialAttribution: false,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: zeroAddress,
              commercialRevShare: 0,
              commercialRevCeiling: 0n,
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              derivativeRevCeiling: 0n,
              currency: mockErc20Address[homer],
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
              expectGroupRewardPool: zeroAddress,
            },
          },
        ],
        deadline: 1000n,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTermsIds).to.be.an("array").and.not.empty;
    });

    it("should mint and register IP and make derivative with license tokens", async () => {
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: "0",
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true },
      });

      await approveForLicenseToken(
        derivativeWorkflowsAddress[homer],
        mintLicenseTokensResult.licenseTokenIds![0],
      );

      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract: nftContract,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        maxRts: 5 * 10 ** 6,
        allowDuplicates: true,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should register IP and make derivative with license tokens", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: "0",
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true },
      });

      await approveForLicenseToken(
        derivativeWorkflowsAddress[homer],
        mintLicenseTokensResult.licenseTokenIds![0],
      );

      const result = await client.ipAsset.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: nftContract,
        tokenId: tokenId!,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        maxRts: 5 * 10 ** 6,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        deadline: 1000n,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });

    it("should register IP and attach license terms and distribute royalty tokens", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
        {
          nftContract: nftContract,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[homer],
                defaultMintingFee: 0n,
                expiration: 1000n,
                commercialUse: true,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: mockErc20Address[homer],
                uri: "test case",
              },
              licensingConfig: {
                isSet: true,
                mintingFee: 1n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
            },
          ],
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          royaltyShares: [
            {
              recipient: process.env.TEST_WALLET_ADDRESS! as Address,
              percentage: 1,
            },
          ],
          txOptions: { waitForTransaction: true },
        },
      );

      expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string").and
        .not.empty;
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
      expect(result.licenseTermsIds).to.be.an("array").and.not.empty;
    });

    it("should register derivative and attach license terms and distribute royalty tokens", async () => {
      const tokenId = await getTokenId();
      const result =
        await client.ipAsset.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: mockERC721,
          tokenId: tokenId!,
          derivData: {
            parentIpIds: [parentIpId!],
            licenseTermsIds: [licenseTermsId],
            maxMintingFee: "0",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
          },
          royaltyShares: [
            {
              recipient: process.env.TEST_WALLET_ADDRESS! as Address,
              percentage: 10, // 100%
            },
          ],
        });

      expect(
        result.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash,
      ).to.be.a("string");
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should mint and register IP and attach PIL terms and distribute royalty tokens", async () => {
      const result =
        await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract: nftContract,
          allowDuplicates: true,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[homer],
                defaultMintingFee: 10000n,
                expiration: 1000n,
                commercialUse: true,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: mockErc20Address[homer],
                uri: "test case",
              },
              licensingConfig: {
                isSet: true,
                mintingFee: 10000n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
            },
          ],
          royaltyShares: [
            {
              recipient: process.env.TEST_WALLET_ADDRESS! as Address,
              percentage: 10, // 100%
            },
          ],
          txOptions: { waitForTransaction: true },
        });

      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array").and.not.empty;
      expect(result.tokenId).to.be.a("bigint");
    });
  });

  describe("Batch Operations", () => {
    let nftContract: Hex;

    beforeEach(async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: process.env.TEST_WALLET_ADDRESS! as Address,
        txOptions: { waitForTransaction: true },
      });
      nftContract = txData.spgNftContract!;
    });

    it("should batch register derivative", async () => {
      const childTokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      const childTokenId2 = await getTokenId();
      const childIpId2 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId2!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: { waitForTransaction: true },
      });

      const result = await client.ipAsset.batchRegisterDerivative({
        args: [
          {
            childIpId: childIpId,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId],
            maxMintingFee: "0",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
          },
          {
            childIpId: childIpId2,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId],
            maxMintingFee: "0",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should batch mint and register IP asset with PIL terms", async () => {
      const result = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract: nftContract,
            licenseTermsData: [
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLapAddress[homer],
                  defaultMintingFee: 8n,
                  expiration: 0n,
                  commercialUse: true,
                  commercialAttribution: false,
                  commercializerChecker: zeroAddress,
                  commercializerCheckerData: zeroAddress,
                  commercialRevShare: 0,
                  commercialRevCeiling: 0n,
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesApproval: false,
                  derivativesReciprocal: true,
                  derivativeRevCeiling: 0n,
                  currency: mockErc20Address[homer],
                  uri: "",
                },
                licensingConfig: {
                  isSet: true,
                  mintingFee: 8n,
                  licensingHook: zeroAddress,
                  hookData: zeroAddress,
                  commercialRevShare: 0,
                  disabled: false,
                  expectMinimumGroupRewardShare: 0,
                  expectGroupRewardPool: zeroAddress,
                },
              },
            ],
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLapAddress[homer],
                  defaultMintingFee: 8n,
                  expiration: 0n,
                  commercialUse: true,
                  commercialAttribution: false,
                  commercializerChecker: zeroAddress,
                  commercializerCheckerData: zeroAddress,
                  commercialRevShare: 0,
                  commercialRevCeiling: 0n,
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesApproval: false,
                  derivativesReciprocal: true,
                  derivativeRevCeiling: 0n,
                  currency: mockErc20Address[homer],
                  uri: "",
                },
                licensingConfig: {
                  isSet: true,
                  mintingFee: 8n,
                  licensingHook: zeroAddress,
                  hookData: zeroAddress,
                  commercialRevShare: 0,
                  disabled: false,
                  expectMinimumGroupRewardShare: 0,
                  expectGroupRewardPool: zeroAddress,
                },
              },
            ],
            allowDuplicates: true,
          },
        ],
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").and.not.empty;
      expect(result.results![0].licenseTermsIds).to.be.an("array").and.length(1);
      expect(result.results![1].licenseTermsIds).to.be.an("array").and.length(1);
    });

    it("should batch mint and register IP asset and make derivative", async () => {
      const result = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract: nftContract,
            derivData: {
              parentIpIds: [parentIpId!],
              licenseTermsIds: [noCommercialLicenseTermsId!],
              maxMintingFee: "0",
              maxRts: 5 * 10 ** 6,
              maxRevenueShare: "0",
            },
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            derivData: {
              parentIpIds: [parentIpId!],
              licenseTermsIds: [noCommercialLicenseTermsId!],
              maxMintingFee: "0",
              maxRts: 5 * 10 ** 6,
              maxRevenueShare: "0",
            },
            allowDuplicates: true,
          },
        ],
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").and.not.empty;
    });

    it("should batch register giving parameters without ipMetadata", async () => {
      const tokenId = await getTokenId();
      const tokenId2 = await getTokenId();
      const spgTokenId1 = await mintBySpg(nftContract, "test-metadata");
      const spgTokenId2 = await mintBySpg(nftContract, "test-metadata");

      const result = await client.ipAsset.batchRegister({
        args: [
          {
            nftContract: mockERC721,
            tokenId: tokenId!,
          },
          {
            nftContract: mockERC721,
            tokenId: tokenId2!,
          },
          {
            nftContract,
            tokenId: spgTokenId1!,
            ipMetadata: {
              ipMetadataURI: "test-uri2",
              ipMetadataHash: toHex("test-metadata-hash2", { size: 32 }),
              nftMetadataHash: toHex("test-nft-metadata-hash2", { size: 32 }),
            },
          },
          {
            nftContract,
            tokenId: spgTokenId2!,
            ipMetadata: {
              ipMetadataURI: "test-uri",
              ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
              nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });

      expect(result.results).to.be.an("array").and.not.empty;
      expect(result.txHash).to.be.a("string").and.not.empty;
    });
  });

  describe("Error Cases", () => {
    let nftContract: Hex;

    before(async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: process.env.TEST_WALLET_ADDRESS! as Address,
        txOptions: { waitForTransaction: true },
      });
      nftContract = txData.spgNftContract!;
    });

    it("should fail with invalid license terms config", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      await expect(
        client.ipAsset.registerIpAndAttachPilTerms({
          nftContract: nftContract,
          tokenId: tokenId!,
          deadline: 1000n,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: zeroAddress,
                defaultMintingFee: -1n, // Invalid fee
                expiration: 0n,
                commercialUse: false,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: mockErc20Address[homer],
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
                expectGroupRewardPool: zeroAddress,
              },
            },
          ],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
    });

    it("should fail with invalid royalty shares", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      await expect(
        client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: nftContract,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[homer],
                defaultMintingFee: 10000n,
                expiration: 1000n,
                commercialUse: true,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: mockErc20Address[homer],
                uri: "test case",
              },
              licensingConfig: {
                isSet: true,
                mintingFee: 1n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
            },
          ],
          royaltyShares: [
            {
              recipient: process.env.TEST_WALLET_ADDRESS! as Address,
              percentage: 101, // Invalid percentage > 100
            },
          ],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith(
        "The percentage of the royalty shares must be less than or equal to 100",
      );
    });

    it("should fail to register unowned NFT", async () => {
      const tokenId = await getTokenId();
      await expect(
        client.ipAsset.register({
          nftContract: nftContract,
          tokenId: 999999n, // Non-existent token
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
    });

    it("should fail with invalid derivative parameters", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      await expect(
        client.ipAsset.registerDerivativeIp({
          nftContract: nftContract,
          tokenId: tokenId!,
          derivData: {
            parentIpIds: [], // Empty parent IPs
            licenseTermsIds: [],
            maxMintingFee: "0",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
          },
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("The parent IP IDs must be provided");
    });
  });
});
