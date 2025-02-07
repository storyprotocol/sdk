import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import { Address, Hex, toHex, zeroAddress, zeroHash } from "viem";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  mintBySpg,
  approveForLicenseToken,
  aeneid,
} from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import {
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  derivativeWorkflowsAddress,
  royaltyTokenDistributionWorkflowsAddress,
  wrappedIpAddress,
} from "../../src/abi/generated";
import { MAX_ROYALTY_TOKEN, WIP_TOKEN_ADDRESS } from "../../src/constants/common";

chai.use(chaiAsPromised);
const expect = chai.expect;

const pool = evenSplitGroupPoolAddress[aeneid];
const walletAddress = process.env.TEST_WALLET_ADDRESS! as Address;

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

    it("should register an IP Asset with multiple metadata fields", async () => {
      const tokenId = await getTokenId();
      const response = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        ipMetadata: {
          ipMetadataURI: "ipfs://test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataURI: "ipfs://test-nft-uri",
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        txOptions: { waitForTransaction: true },
      });

      expect(response.ipId).to.be.a("string").and.not.empty;
      expect(response.tokenId).to.be.a("bigint");
    });

    it("should not register with invalid metadata hash length", async () => {
      const tokenId = await getTokenId();
      await expect(
        client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          ipMetadata: {
            ipMetadataHash: "0x123", // Invalid length hash
            nftMetadataHash: toHex("valid-hash", { size: 32 }),
          },
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
    });

    it("should not register with non-existent token ID", async () => {
      await expect(
        client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: BigInt(Number.MAX_SAFE_INTEGER),
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
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

    it("should register derivative with multiple parent IPs", async () => {
      // Create first parent IP
      const tokenId1 = await getTokenId();
      const parentIpId1 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId1!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      // Create second parent IP
      const tokenId2 = await getTokenId();
      const parentIpId2 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId2!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      // Attach license terms to both parents
      await client.license.attachLicenseTerms({
        ipId: parentIpId1,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: { waitForTransaction: true },
      });

      await client.license.attachLicenseTerms({
        ipId: parentIpId2,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: { waitForTransaction: true },
      });

      // Create child IP
      const childTokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId!,
          txOptions: { waitForTransaction: true },
        })
      ).ipId!;

      // Register derivative with multiple parents
      const response = await client.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: [parentIpId1, parentIpId2],
        licenseTermsIds: [noCommercialLicenseTermsId, noCommercialLicenseTermsId],
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
    let nftContractWithMintingFee: Hex;
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
        mintFeeRecipient: walletAddress,
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
      await mockERC20.approve(derivativeWorkflowsAddress[aeneid]);
      await mockERC20.approve(royaltyTokenDistributionWorkflowsAddress[aeneid]);
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
              expectGroupRewardPool: zeroAddress,
            },
          },
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
              currency: wrappedIpAddress[aeneid],
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
      expect(result.ipId).to.be.a("string").and.not.empty;
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
        derivativeWorkflowsAddress[aeneid],
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
        derivativeWorkflowsAddress[aeneid],
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
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: wrappedIpAddress[aeneid],
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
              recipient: walletAddress,
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

    it("should register IP and attach license terms and distribute royalty tokens with complex royalty shares", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
        {
          nftContract: nftContract,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: mockErc20Address[aeneid],
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
              recipient: walletAddress,
              percentage: 43,
            },
            {
              recipient: walletAddress,
              percentage: 17,
            },
            {
              recipient: walletAddress,
              percentage: 2,
            },
            {
              recipient: walletAddress,
              percentage: 38,
            },
          ],
          txOptions: { waitForTransaction: true },
        },
      );

      expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string");
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array").and.not.empty;
    });

    it("should handle boundary conditions for royalty shares", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
        {
          nftContract: nftContract,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: mockErc20Address[aeneid],
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
              recipient: walletAddress,
              percentage: 1, // Test minimum valid percentage
            },
            {
              recipient: walletAddress,
              percentage: 99, // Test maximum valid percentage that sums to 100
            },
          ],
          txOptions: { waitForTransaction: true },
        },
      );

      expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string");
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array").and.not.empty;
    });

    it("should fail when total royalty shares exceed 100%", async () => {
      const tokenId = await getTokenId();
      await expect(
        client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: mockERC721,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: mockErc20Address[aeneid],
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
              recipient: walletAddress,
              percentage: 60,
            },
            {
              recipient: walletAddress,
              percentage: 45, // Total will be 105%
            },
          ],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("The sum of the royalty shares cannot exceeds 100");
    });

    it("should fail with non-commercial license terms for royalty distributio", async () => {
      const tokenId = await getTokenId();
      await expect(
        client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: mockERC721,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                defaultMintingFee: 10000n,
                expiration: 1000n,
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
                currency: mockErc20Address[aeneid],
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
              recipient: walletAddress,
              percentage: 60,
            },
            {
              recipient: walletAddress,
              percentage: 45, // Total will be 105%
            },
          ],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("The sum of the royalty shares cannot exceeds 100");
    });

    it("should fail with zero percentage royalty share", async () => {
      const tokenId = await getTokenId();
      await expect(
        client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: mockERC721,
          tokenId: tokenId!,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: mockErc20Address[aeneid],
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
              recipient: walletAddress,
              percentage: 0,
            },
          ],
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith("The percentage of the royalty shares must be greater than 0");
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
              recipient: walletAddress,
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
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: wrappedIpAddress[aeneid],
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
              recipient: walletAddress,
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

    describe("SPG With Minting Fees", () => {
      let parentIpId: Address;
      let licenseTermsId: bigint;
      let nftContractWithMintingFee: Hex;

      before(async () => {
        // ensure we start with no wip since we will be wrapping them
        const wipBalance = await client.wipClient.balanceOf(walletAddress);
        if (wipBalance > 0n) {
          await client.wipClient.withdraw({
            amount: wipBalance,
            txOptions: { waitForTransaction: true },
          });
        }

        // create a nft collection that requires minting fee
        const rsp = await client.nftClient.createNFTCollection({
          name: "Premium Collection",
          symbol: "PC",
          isPublicMinting: true,
          mintOpen: true,
          mintFeeRecipient: walletAddress,
          contractURI: "test-uri",
          mintFee: 100n,
          mintFeeToken: WIP_TOKEN_ADDRESS,
          txOptions: { waitForTransaction: true },
        });
        nftContractWithMintingFee = rsp.spgNftContract!;

        // create parent ip with minting fee
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: nftContractWithMintingFee,
          allowDuplicates: true,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                defaultMintingFee: 150n,
                expiration: 0n,
                commercialUse: true,
                commercialAttribution: true,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 10,
                commercialRevCeiling: BigInt(0),
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: BigInt(0),
                currency: WIP_TOKEN_ADDRESS,
                uri: "test",
              },
              licensingConfig: {
                isSet: false,
                mintingFee: 150n,
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
        parentIpId = result.ipId!;
        licenseTermsId = result.licenseTermsIds![0];
      });

      it("should auto wrap ip when mint and register derivative", async () => {
        const userBalanceBefore = await client.getWalletBalance();
        const rsp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
          spgNftContract: nftContractWithMintingFee, // pay 100 here
          derivData: {
            parentIpIds: [parentIpId], // pay 150 here
            licenseTermsIds: [licenseTermsId],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          ipMetadata: {
            ipMetadataURI: "test",
            ipMetadataHash: zeroHash,
            nftMetadataURI: "test",
            nftMetadataHash: zeroHash,
          },
          allowDuplicates: true,
          txOptions: { waitForTransaction: true },
        });
        expect(rsp.txHash).to.be.a("string").and.not.empty;
        expect(rsp.ipId).to.be.a("string").and.not.empty;

        const userBalanceAfter = await client.getWalletBalance();
        const cost = 150n + 100n;
        expect(userBalanceAfter < userBalanceBefore - cost).to.be.true;

        // user should not have any WIP tokens since we swap the exact amount
        const wipBalance = await client.ipAsset.wipClient.balanceOf({
          owner: walletAddress,
        });
        expect(wipBalance.result).to.be.equal(0n);
      });

      it("should auto wrap ip when mint and register derivative with license tokens", async () => {
        const { licenseTokenIds } = await client.license.mintLicenseTokens({
          licenseTermsId: licenseTermsId,
          licensorIpId: parentIpId,
          maxMintingFee: 0n,
          maxRevenueShare: 100,
          txOptions: { waitForTransaction: true },
        });
        await approveForLicenseToken(derivativeWorkflowsAddress[aeneid], licenseTokenIds![0]);
        expect(licenseTokenIds).to.be.an("array").and.not.empty;
        const { txHash, ipId } =
          await client.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
            spgNftContract: nftContractWithMintingFee,
            licenseTokenIds: licenseTokenIds!,
            maxRts: MAX_ROYALTY_TOKEN,
            allowDuplicates: true,
            ipMetadata: {
              ipMetadataURI: "test",
              ipMetadataHash: zeroHash,
              nftMetadataURI: "test",
              nftMetadataHash: zeroHash,
            },
            txOptions: { waitForTransaction: true },
          });
        expect(txHash).to.be.a("string").and.not.empty;
        expect(ipId).to.be.a("string").and.not.empty;
        const isRegistered = await client.ipAsset.isRegistered(ipId!);
        expect(isRegistered).to.be.true;
      });

      it("should auto wrap ip when registering derivative", async () => {
        const tokenId = await getTokenId();
        const balanceBefore = await client.getWalletBalance();
        const rsp = await client.ipAsset.registerDerivativeIp({
          nftContract: mockERC721,
          tokenId: tokenId!,
          derivData: {
            parentIpIds: [parentIpId],
            licenseTermsIds: [licenseTermsId],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          txOptions: { waitForTransaction: true },
        });
        expect(rsp.txHash).to.be.a("string").and.not.empty;
        expect(rsp.ipId).to.be.a("string").and.not.empty;
        const balanceAfter = await client.getWalletBalance();
        expect(balanceAfter < balanceBefore - 150n).to.be.true;
      });

      it("errors if minting fees are required but auto wrap is disabled", async () => {
        const rsp = client.ipAsset.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract: nftContractWithMintingFee,
          derivData: {
            parentIpIds: [parentIpId],
            licenseTermsIds: [licenseTermsId],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          allowDuplicates: true,
          ipMetadata: {
            ipMetadataURI: "test",
            ipMetadataHash: zeroHash,
            nftMetadataURI: "test",
            nftMetadataHash: zeroHash,
          },
          royaltyShares: [
            {
              recipient: walletAddress,
              percentage: 100,
            },
          ],
          wipOptions: {
            enableAutoWrapIp: false,
          },
          txOptions: { waitForTransaction: true },
        });
        await expect(rsp).to.be.rejectedWith(/^Wallet does not have enough WIP to pay for fees./);
      });

      it("should spend existing wip when register derivative and distribute loyalty tokens", async () => {
        const tokenId = await getTokenId();
        await client.wipClient.deposit({
          amount: 150n,
          txOptions: { waitForTransaction: true },
        });
        const rsp =
          await client.ipAsset.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
            nftContract: mockERC721,
            tokenId: tokenId!,
            derivData: {
              parentIpIds: [parentIpId],
              licenseTermsIds: [licenseTermsId],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
            royaltyShares: [
              {
                recipient: walletAddress,
                percentage: 100,
              },
            ],
            txOptions: { waitForTransaction: true },
          });
        expect(
          rsp.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash,
        ).to.be.a("string").and.not.empty;
        expect(rsp.ipRoyaltyVault).to.be.a("string").and.not.empty;
        expect(rsp.distributeRoyaltyTokensTxHash).to.be.a("string").and.not.empty;
        expect(rsp.ipId).to.be.a("string").and.not.empty;
        const wipAfter = await client.wipClient.balanceOf(walletAddress);
        expect(wipAfter).to.be.equal(0n);
      });

      it("should auto wrap ip when mint and register derivative and distribute loyalty tokens", async () => {
        const rsp =
          await client.ipAsset.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
            spgNftContract: nftContractWithMintingFee,
            derivData: {
              parentIpIds: [parentIpId],
              licenseTermsIds: [licenseTermsId],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
            allowDuplicates: true,
            ipMetadata: {
              ipMetadataURI: "test",
              ipMetadataHash: zeroHash,
              nftMetadataURI: "test",
              nftMetadataHash: zeroHash,
            },
            royaltyShares: [
              {
                recipient: walletAddress,
                percentage: 100,
              },
            ],
            txOptions: { waitForTransaction: true },
          });
        expect(rsp.txHash).to.be.a("string").and.not.empty;
        expect(rsp.ipId).to.be.a("string").and.not.empty;
      });
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
        mintFeeRecipient: walletAddress,
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
                  royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                  currency: wrappedIpAddress[aeneid],
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
                  royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                  currency: wrappedIpAddress[aeneid],
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

    it("should batch register giving parameters", async () => {
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
        mintFeeRecipient: walletAddress,
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
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
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
                currency: wrappedIpAddress[aeneid],
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
              recipient: walletAddress,
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

  describe("Other Edge Cases", () => {
    let client: StoryClient;
    let noCommercialLicenseTermsId: bigint;
    let parentIpId: Hex;

    before(async () => {
      client = getStoryClient();
      const res = await client.license.registerNonComSocialRemixingPIL({
        txOptions: { waitForTransaction: true },
      });
      noCommercialLicenseTermsId = res.licenseTermsId!;

      const tokenId = await getTokenId();
      const parentIpResponse = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: { waitForTransaction: true },
      });
      parentIpId = parentIpResponse.ipId!;

      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: { waitForTransaction: true },
      });
    });

    describe("Derivative Registration Edge Cases", () => {
      let childIpId: Hex;

      beforeEach(async () => {
        const tokenId = await getTokenId();
        const response = await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: { waitForTransaction: true },
        });
        childIpId = response.ipId!;
      });

      it("should fail when parent IP does not exist", async () => {
        await expect(
          client.ipAsset.registerDerivative({
            childIpId,
            parentIpIds: ["0x1234567890123456789012345678901234567890"],
            licenseTermsIds: [noCommercialLicenseTermsId],
            maxMintingFee: "0",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejectedWith(/not registered/);
      });

      it("should fail with mismatched parentIpIds and licenseTermsIds lengths", async () => {
        await expect(
          client.ipAsset.registerDerivative({
            childIpId,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId, noCommercialLicenseTermsId], // More license terms than parents
            maxMintingFee: "0",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejectedWith(/must match/);
      });

      it("should fail with negative maxMintingFee", async () => {
        await expect(
          client.ipAsset.registerDerivative({
            childIpId,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId],
            maxMintingFee: "-1",
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: "0",
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejectedWith(/must be greater than 0/);
      });

      it("should fail with maxRts exceeding maximum allowed", async () => {
        await expect(
          client.ipAsset.registerDerivative({
            childIpId,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId],
            maxMintingFee: "0",
            maxRts: 100_000_001, // Exceeds maximum
            maxRevenueShare: "0",
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejectedWith(/must be.*less than/);
      });
    });

    describe("License Token Edge Cases", () => {
      it("should fail when trying to use non-existent license token", async () => {
        const tokenId = await getTokenId();
        await expect(
          client.ipAsset.registerDerivativeWithLicenseTokens({
            childIpId: (
              await client.ipAsset.register({
                nftContract: mockERC721,
                tokenId: tokenId!,
                txOptions: { waitForTransaction: true },
              })
            ).ipId!,
            licenseTokenIds: [BigInt(999999)], // Non-existent token
            maxRts: 5 * 10 ** 6,
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejected;
      });

      it("should fail when trying to use same license token twice", async () => {
        const mintLicenseTokensResult = await client.license.mintLicenseTokens({
          licenseTermsId: noCommercialLicenseTermsId,
          licensorIpId: parentIpId,
          maxMintingFee: "0",
          maxRevenueShare: 1,
          txOptions: { waitForTransaction: true },
        });

        const tokenId1 = await getTokenId();
        await client.ipAsset.registerDerivativeWithLicenseTokens({
          childIpId: (
            await client.ipAsset.register({
              nftContract: mockERC721,
              tokenId: tokenId1!,
              txOptions: { waitForTransaction: true },
            })
          ).ipId!,
          licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
          maxRts: 5 * 10 ** 6,
          txOptions: { waitForTransaction: true },
        });

        const tokenId2 = await getTokenId();
        await expect(
          client.ipAsset.registerDerivativeWithLicenseTokens({
            childIpId: (
              await client.ipAsset.register({
                nftContract: mockERC721,
                tokenId: tokenId2!,
                txOptions: { waitForTransaction: true },
              })
            ).ipId!,
            licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
            maxRts: 5 * 10 ** 6,
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejected; // Should fail as token already used
      });
    });

    describe("Batch Operation Edge Cases", () => {
      it("should handle partial failures in batch registration", async () => {
        const tokenId1 = await getTokenId();
        const tokenId2 = await getTokenId();

        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId1!,
          txOptions: { waitForTransaction: true },
        });

        await expect(
          client.ipAsset.batchRegister({
            args: [
              {
                nftContract: mockERC721,
                tokenId: tokenId1!, // Already registered
              },
              {
                nftContract: mockERC721,
                tokenId: tokenId2!, // New registration
              },
            ],
            txOptions: { waitForTransaction: true },
          }),
        ).to.be.rejected;
      });
    });
  });
});
