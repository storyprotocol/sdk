import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address, Hex, maxUint256, toHex, zeroAddress, zeroHash } from "viem";

import {
  IpRegistrationWorkflowRequest,
  NativeRoyaltyPolicy,
  PILFlavor,
  StoryClient,
} from "../../src";
import { getDerivedStoryClient } from "./utils/BIP32";
import {
  aeneid,
  approveForLicenseToken,
  getStoryClient,
  getTokenId,
  mintBySpg,
  mockERC721,
  publicClient,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import {
  derivativeWorkflowsAddress,
  erc20Address,
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  royaltyPolicyLrpAddress,
  royaltyTokenDistributionWorkflowsAddress,
} from "../../src/abi/generated";
import { MAX_ROYALTY_TOKEN, WIP_TOKEN_ADDRESS } from "../../src/constants/common";
import { ERC20Client } from "../../src/utils/token";

use(chaiAsPromised);

const pool = evenSplitGroupPoolAddress[aeneid];

describe("IP Asset Functions", () => {
  let client: StoryClient;
  let noCommercialLicenseTermsId: bigint;

  before(async () => {
    client = getStoryClient();
    const res = await client.license.registerPILTerms(PILFlavor.nonCommercialSocialRemixing());
    noCommercialLicenseTermsId = res.licenseTermsId!;
  });

  describe("Basic IP Asset Operations", () => {
    let childIpId: Hex;
    let childIpId2: Address;
    let parentIpId: Address;

    it("should register an IP Asset", async () => {
      const tokenId = await getTokenId();
      const response = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      childIpId = response.ipId!;
      expect(childIpId).to.be.a("string");
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
      });
      childIpId2 = response.ipId!;

      expect(response.ipId).to.be.a("string");
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
        }),
      ).to.be.rejected;
    });

    it("should not register with non-existent token ID", async () => {
      await expect(
        client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: BigInt(Number.MAX_SAFE_INTEGER),
        }),
      ).to.be.rejected;
    });

    it("should register derivative with Non-Commercial Remix PIL", async () => {
      const tokenId = await getTokenId();
      parentIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;

      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
      });

      const response = await client.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: [parentIpId],
        licenseTermsIds: [noCommercialLicenseTermsId],
        maxMintingFee: 0,
        maxRts: 5 * 10 ** 6,
        maxRevenueShare: 0,
      });
      expect(response.txHash).to.be.a("string");
    });

    it("should register derivative with Commercial Remix PIL", async () => {
      // Register commercial remix PIL
      const licenseResponse = await client.license.registerPILTerms(
        PILFlavor.commercialRemix({
          defaultMintingFee: 10n,
          commercialRevShare: 10,
          currency: WIP_TOKEN_ADDRESS,
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
        }),
      );

      // Register parent IP
      const tokenId = await getTokenId();
      const commercialParentIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;

      // Attach license terms to parent IP
      await client.license.attachLicenseTerms({
        ipId: commercialParentIpId,
        licenseTermsId: licenseResponse.licenseTermsId!,
      });

      const response = await client.ipAsset.registerDerivative({
        childIpId: childIpId2,
        parentIpIds: [commercialParentIpId],
        licenseTermsIds: [licenseResponse.licenseTermsId!],
        maxMintingFee: 100,
        maxRts: 5 * 10 ** 6,
        maxRevenueShare: 100,
      });
      expect(response.txHash).to.be.a("string");
    });

    it("should register derivative with multiple parent IPs", async () => {
      // Create first parent IP
      const tokenId1 = await getTokenId();
      const parentIpId1 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId1!,
        })
      ).ipId!;

      // Create second parent IP
      const tokenId2 = await getTokenId();
      const parentIpId2 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId2!,
        })
      ).ipId!;

      // Attach license terms to both parents
      await client.license.attachLicenseTerms({
        ipId: parentIpId1,
        licenseTermsId: noCommercialLicenseTermsId,
      });

      await client.license.attachLicenseTerms({
        ipId: parentIpId2,
        licenseTermsId: noCommercialLicenseTermsId,
      });

      // Create child IP
      const childTokenId = await getTokenId();
      const newChildIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId!,
        })
      ).ipId!;

      // Register derivative with multiple parents
      const response = await client.ipAsset.registerDerivative({
        childIpId: newChildIpId,
        parentIpIds: [parentIpId1, parentIpId2],
        licenseTermsIds: [noCommercialLicenseTermsId, noCommercialLicenseTermsId],
        maxMintingFee: 0,
        maxRts: 5 * 10 ** 6,
        maxRevenueShare: 0,
      });

      expect(response.txHash).to.be.a("string");
    });

    it("should register derivative with license tokens", async () => {
      const tokenId = await getTokenId();
      const ipId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;

      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: noCommercialLicenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: 0,
        maxRevenueShare: 1,
      });

      const response = await client.ipAsset.registerDerivativeWithLicenseTokens({
        childIpId: ipId,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
      });
      expect(response.txHash).to.be.a("string");
    });

    it("should return true if IP asset is registered", async () => {
      const isRegistered = await client.ipAsset.isRegistered(parentIpId);
      expect(isRegistered).to.equal(true);
    });

    it("should return false if IP asset is not registered", async () => {
      const isRegistered = await client.ipAsset.isRegistered(
        "0x1234567890123456789012345678901234567890",
      );
      expect(isRegistered).to.equal(false);
    });
  });

  describe("SPG NFT Operations", () => {
    let nftContract: Hex;
    let licenseTermsId: bigint;
    let parentIpId: Address;

    before(async () => {
      // Setup NFT collection
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
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
              expectGroupRewardPool: pool,
            },
          },
        ],
      });

      parentIpId = result.ipId!;
      licenseTermsId = result.licenseTermsIds![0];

      // Setup ERC20
      const mockERC20 = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      await mockERC20.approve(derivativeWorkflowsAddress[aeneid], maxUint256);
      await mockERC20.approve(royaltyTokenDistributionWorkflowsAddress[aeneid], maxUint256);
      await mockERC20.mint(TEST_WALLET_ADDRESS, 100000n);
    });

    it("should register IP Asset with metadata", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const response = await client.ipAsset.register({
        nftContract,
        tokenId,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        deadline: 1000n,
      });
      expect(response.ipId).to.be.a("string");
    });

    it("should register derivative IP", async () => {
      const tokenChildId = await mintBySpg(nftContract);
      const result = await client.ipAsset.registerDerivativeIp({
        nftContract: nftContract,
        tokenId: tokenChildId,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 0,
          maxRts: 5 * 10 ** 6,
          maxRevenueShare: 0,
        },
        deadline: 1000n,
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
    });
    it("should register IP and attach PIL terms", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: nftContract,
        tokenId,
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
              expectGroupRewardPool: zeroAddress,
            },
          },
          {
            terms: PILFlavor.commercialUse({
              defaultMintingFee: 10000n,
              currency: WIP_TOKEN_ADDRESS,
            }),
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
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes).to.be.an("undefined");
    });

    it("should register IP and attach PIL terms with license terms max limit", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: nftContract,
        tokenId,
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
              expectGroupRewardPool: zeroAddress,
            },
            maxLicenseTokens: 100,
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
              currency: WIP_TOKEN_ADDRESS,
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
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
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
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
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
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
    });

    it("should mint and register IP and make derivative with license tokens", async () => {
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: 0,
        maxRevenueShare: 100,
      });

      await approveForLicenseToken(
        derivativeWorkflowsAddress[aeneid],
        mintLicenseTokensResult.licenseTokenIds![0],
      );

      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract: nftContract,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
      });

      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should register IP and make derivative with license tokens", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: 0,
        maxRevenueShare: 100,
      });

      await approveForLicenseToken(
        derivativeWorkflowsAddress[aeneid],
        mintLicenseTokensResult.licenseTokenIds![0],
      );

      const result = await client.ipAsset.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: nftContract,
        tokenId,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        maxRts: 5 * 10 ** 6,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        deadline: 1000n,
      });

      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
    });

    it("should register IP and attach license terms and distribute royalty tokens", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
        {
          nftContract: nftContract,
          tokenId,
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
                currency: WIP_TOKEN_ADDRESS,
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
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 10,
            },
          ],
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 1,
            },
          ],
        },
      );
      expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string");
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds?.length).to.be.equal(2);
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
    });

    it("should register IP and attach license terms and distribute royalty tokens with license terms max limit", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
        {
          nftContract: nftContract,
          tokenId,
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
                currency: WIP_TOKEN_ADDRESS,
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
              maxLicenseTokens: 100,
            },
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
                currency: WIP_TOKEN_ADDRESS,
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
              maxLicenseTokens: 100,
            },
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
                currency: WIP_TOKEN_ADDRESS,
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
              recipient: TEST_WALLET_ADDRESS,
              percentage: 1,
            },
          ],
        },
      );
      expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string");
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(2);
    });

    it("should register IP and attach license terms and distribute royalty tokens with complex royalty shares", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
        {
          nftContract: nftContract,
          tokenId,
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
                currency: erc20Address[aeneid],
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
              recipient: TEST_WALLET_ADDRESS,
              percentage: 43,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 17,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 2,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 38,
            },
          ],
        },
      );

      expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string");
      expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes).to.be.an("undefined");
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
            maxMintingFee: 0,
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: 0,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
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

    it("should mint and register IP and attach PIL terms and distribute royalty tokens without licensing config", async () => {
      const result =
        await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract: nftContract,
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
                currency: WIP_TOKEN_ADDRESS,
                uri: "test case",
              },
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array");
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should mint and register IP and attach PIL terms and distribute royalty tokens with license terms max limit", async () => {
      const result =
        await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract: nftContract,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                defaultMintingFee: 10n,
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
                currency: WIP_TOKEN_ADDRESS,
                uri: "test case",
              },
              maxLicenseTokens: 100,
              licensingConfig: {
                isSet: true,
                mintingFee: 11n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
            },
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
            },
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
                expectGroupRewardPool: zeroAddress,
              },
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        });

      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds?.length).to.be.equal(3);
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
    });
  });

  describe("SPG With Minting Fees with Public Minting SPG NFT Contract", () => {
    let parentIpId: Address;
    let licenseTermsId: bigint;
    let nftContractWithMintingFee: Hex;

    before(async () => {
      // ensure we start with no wip since we will be wrapping them
      const wipBalance = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      if (wipBalance > 0n) {
        await client.wipClient.withdraw({
          amount: wipBalance,
        });
      }

      // create a nft collection that requires minting fee
      const rsp = await client.nftClient.createNFTCollection({
        name: "Premium Collection",
        symbol: "PC",
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        contractURI: "test-uri",
        mintFee: 100n,
        mintFeeToken: WIP_TOKEN_ADDRESS,
      });
      nftContractWithMintingFee = rsp.spgNftContract!;

      // create parent ip with minting fee
      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: nftContractWithMintingFee,
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
      });
      expect(rsp.txHash).to.be.a("string");
      expect(rsp.ipId).to.be.a("string");

      const userBalanceAfter = await client.getWalletBalance();
      const cost = 150n + 100n;
      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - cost));

      // user should not have any WIP tokens since we swap the exact amount
      const wipBalance = await client.ipAsset.wipClient.balanceOf({
        owner: TEST_WALLET_ADDRESS,
      });
      expect(wipBalance.result).to.be.equal(0n);
    });

    it("should auto wrap ip when mint and register derivative with license tokens", async () => {
      const { licenseTokenIds } = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: 0n,
        maxRevenueShare: 100,
      });
      await approveForLicenseToken(derivativeWorkflowsAddress[aeneid], licenseTokenIds![0]);
      expect(licenseTokenIds).to.be.an("array");
      const { txHash, ipId } =
        await client.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
          spgNftContract: nftContractWithMintingFee,
          licenseTokenIds: licenseTokenIds!,
          maxRts: 0,
          ipMetadata: {
            ipMetadataURI: "test",
            ipMetadataHash: zeroHash,
            nftMetadataURI: "test",
            nftMetadataHash: zeroHash,
          },
        });
      expect(txHash).to.be.a("string");
      expect(ipId).to.be.a("string");
      const isRegistered = await client.ipAsset.isRegistered(ipId!);
      expect(isRegistered).to.equal(true);
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
      });
      expect(rsp.txHash).to.be.a("string");
      expect(rsp.ipId).to.be.a("string");
      const balanceAfter = await client.getWalletBalance();
      expect(Number(balanceAfter)).lessThan(Number(balanceBefore - 150n));
    });

    it("should spend existing wip when register derivative and distribute loyalty tokens", async () => {
      const tokenId = await getTokenId();
      await client.wipClient.deposit({
        amount: 150n,
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
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        });
      expect(rsp.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash).to.be.a(
        "string",
      );
      expect(rsp.ipRoyaltyVault).to.be.a("string");
      expect(rsp.distributeRoyaltyTokensTxHash).to.be.a("string");
      expect(rsp.ipId).to.be.a("string");
      const wipAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipAfter).to.be.equal(0n);
    });

    it("should auto wrap ip when mint and register derivative and distribute loyalty tokens", async () => {
      const rsp = await client.ipAsset.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
        {
          spgNftContract: nftContractWithMintingFee,
          derivData: {
            parentIpIds: [parentIpId],
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
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
      );
      expect(rsp.txHash).to.be.a("string");
      expect(rsp.ipId).to.be.a("string");
    });
  });

  describe("IP Asset Registration with Private Minting SPG NFT Contracts", () => {
    let spgNftContractWithPrivateMinting: Address;
    let licenseTermsId: bigint;
    let parentIpId: Address;
    before(async () => {
      const privateMintingCollectionResult = await client.nftClient.createNFTCollection({
        name: "Private Minting Collection",
        symbol: "PMC",
        isPublicMinting: false,
        mintOpen: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintFee: 3n,
        mintFeeToken: WIP_TOKEN_ADDRESS,
        contractURI: "",
      });
      spgNftContractWithPrivateMinting = privateMintingCollectionResult.spgNftContract!;
    });

    it("should successfully when call mint and register ip asset with pil terms", async () => {
      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: spgNftContractWithPrivateMinting,
        allowDuplicates: false,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 6n,
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
              mintingFee: 6n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: pool,
            },
          },
          {
            terms: PILFlavor.commercialRemix({
              defaultMintingFee: 6n,
              currency: WIP_TOKEN_ADDRESS,
              commercialRevShare: 90,
            }),
            maxLicenseTokens: 100,
          },
        ],
      });
      expect(result.ipId).to.be.a("string");
      expect(result.tokenId).to.be.a("bigint");
      expect(result.txHash).to.be.a("string");
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.licenseTermsIds?.length).to.be.equal(2);
      parentIpId = result.ipId!;
      licenseTermsId = result.licenseTermsIds![0];
    });

    it("should successfully when call mint and register ip asset with pil terms with license terms max limit", async () => {
      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: spgNftContractWithPrivateMinting,
        allowDuplicates: false,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 6n,
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
              mintingFee: 6n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: pool,
            },
            maxLicenseTokens: 100,
          },
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 5n,
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
              mintingFee: 6n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: pool,
            },
            maxLicenseTokens: 100,
          },
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 5n,
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
              mintingFee: 6n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: pool,
            },
          },
        ],
        ipMetadata: {
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
      });
      expect(result.txHash).to.be.a("string");
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(2);
    });
    it("should successfully when call mint and register ip and make derivative", async () => {
      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: spgNftContractWithPrivateMinting,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 100n,
          maxRts: 5 * 10 ** 6,
          maxRevenueShare: 100,
        },
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.tokenId).to.be.a("bigint");
    });
    it("should successfully when call mint and register ip", async () => {
      const result = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: spgNftContractWithPrivateMinting,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        allowDuplicates: false,
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
    });
    it("should successfully when call mint and register ip and make derivative with license tokens", async () => {
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: 0,
        maxRevenueShare: 100,
      });
      const licenseTokenId = mintLicenseTokensResult.licenseTokenIds![0];
      await approveForLicenseToken(derivativeWorkflowsAddress[aeneid], licenseTokenId);
      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract: spgNftContractWithPrivateMinting,
        licenseTokenIds: [licenseTokenId],
        maxRts: 5 * 10 ** 6,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
      });
      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should successfully when call mint and register ip and attach pil terms and distribute royalty tokens", async () => {
      const result =
        await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract: spgNftContractWithPrivateMinting,
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
                currency: WIP_TOKEN_ADDRESS,
                uri: "test case",
              },
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        });

      expect(result.txHash).to.be.a("string");
      expect(result.ipId).to.be.a("string");
      expect(result.licenseTermsIds).to.be.an("array");
      expect(result.tokenId).to.be.a("bigint");
    });
    it("should succeed when call mint and register ip and make derivative and distribute royalty tokens", async () => {
      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: spgNftContractWithPrivateMinting,
        allowDuplicates: true,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 6n,
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
              mintingFee: 6n,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: pool,
            },
          },
        ],
      });
      const newParentIpId = result.ipId!;
      const licenseId = result.licenseTermsIds![0];
      const rsp = await client.ipAsset.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          derivData: {
            parentIpIds: [newParentIpId],
            licenseTermsIds: [licenseId],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
      );
      expect(rsp.txHash).to.be.a("string");
      expect(rsp.ipId).to.be.a("string");
    });
  });

  describe("Batch Operations", () => {
    let nftContract: Hex;
    let parentIpId: Address;

    before(async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
      });
      nftContract = txData.spgNftContract!;

      const tokenId = await getTokenId();
      parentIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;
    });

    it("should batch register derivative", async () => {
      const childTokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId!,
        })
      ).ipId!;

      const childTokenId2 = await getTokenId();
      const childIpId2 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId2!,
        })
      ).ipId!;

      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
      });

      const result = await client.ipAsset.batchRegisterDerivative({
        args: [
          {
            childIpId: childIpId,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId],
          },
          {
            childIpId: childIpId2,
            parentIpIds: [parentIpId],
            licenseTermsIds: [noCommercialLicenseTermsId],
            maxMintingFee: 10000000,
            maxRts: 5 * 10 ** 6,
            maxRevenueShare: 0,
          },
        ],
      });
      expect(result.txHash).to.be.a("string");
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
                  currency: WIP_TOKEN_ADDRESS,
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
                maxLicenseTokens: 100,
              },
              {
                terms: PILFlavor.commercialRemix({
                  defaultMintingFee: 100n,
                  commercialRevShare: 10,
                  currency: WIP_TOKEN_ADDRESS,
                }),
                licensingConfig: {
                  isSet: true,
                  mintingFee: 100n,
                  licensingHook: zeroAddress,
                  hookData: zeroAddress,
                  commercialRevShare: 0,
                  disabled: false,
                  expectMinimumGroupRewardShare: 0,
                  expectGroupRewardPool: zeroAddress,
                },
              },
            ],
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
                  currency: WIP_TOKEN_ADDRESS,
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
                maxLicenseTokens: 100,
              },
            ],
          },
        ],
      });

      expect(result.txHash).to.be.a("string");
      expect(result.results).to.be.an("array");
      expect(result.results![0].licenseTermsIds).to.be.an("array").and.length(2);
      expect(result.results![0].maxLicenseTokensTxHashes).to.be.an("array").and.length(1);
      expect(result.results![1].licenseTermsIds).to.be.an("array").and.length(1);
      expect(result.results![1].maxLicenseTokensTxHashes).to.be.an("array").and.length(1);
    });

    it("should batch mint and register IP asset and make derivative", async () => {
      const result = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract: nftContract,
            derivData: {
              parentIpIds: [parentIpId!],
              licenseTermsIds: [noCommercialLicenseTermsId!],
              maxMintingFee: 0,
              maxRts: 5 * 10 ** 6,
              maxRevenueShare: 0,
            },
          },
          {
            spgNftContract: nftContract,
            derivData: {
              parentIpIds: [parentIpId!],
              licenseTermsIds: [noCommercialLicenseTermsId!],
              maxMintingFee: 0,
              maxRts: 5 * 10 ** 6,
              maxRevenueShare: 0,
            },
          },
        ],
      });

      expect(result.txHash).to.be.a("string");
      expect(result.results).to.be.an("array");
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
            tokenId: spgTokenId1,
            ipMetadata: {
              ipMetadataURI: "test-uri2",
              ipMetadataHash: toHex("test-metadata-hash2", { size: 32 }),
              nftMetadataHash: toHex("test-nft-metadata-hash2", { size: 32 }),
            },
          },
          {
            nftContract,
            tokenId: spgTokenId2,
            ipMetadata: {
              ipMetadataURI: "test-uri",
              ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
              nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
            },
          },
        ],
      });
      expect(result.results).to.be.an("array");
      expect(result.txHash).to.be.a("string");
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
        mintFeeRecipient: TEST_WALLET_ADDRESS,
      });
      nftContract = txData.spgNftContract!;
    });

    it("should fail to register unowned NFT", async () => {
      await expect(
        client.ipAsset.register({
          nftContract: nftContract,
          tokenId: 999999n, // Non-existent token
        }),
      ).to.be.rejected;
    });
  });

  describe("Other Edge Cases", () => {
    let parentIpId: Hex;

    before(async () => {
      client = getStoryClient();

      const tokenId = await getTokenId();
      const parentIpResponse = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      parentIpId = parentIpResponse.ipId!;

      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
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
              })
            ).ipId!,
            licenseTokenIds: [BigInt(999999)], // Non-existent token
            maxRts: 5 * 10 ** 6,
          }),
        ).to.be.rejected;
      });

      it("should fail when trying to use same license token twice", async () => {
        const mintLicenseTokensResult = await client.license.mintLicenseTokens({
          licenseTermsId: noCommercialLicenseTermsId,
          licensorIpId: parentIpId,
          maxMintingFee: 0,
          maxRevenueShare: 1,
        });

        const tokenId1 = await getTokenId();
        await client.ipAsset.registerDerivativeWithLicenseTokens({
          childIpId: (
            await client.ipAsset.register({
              nftContract: mockERC721,
              tokenId: tokenId1!,
            })
          ).ipId!,
          licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
          maxRts: 0,
        });

        const tokenId2 = await getTokenId();
        await expect(
          client.ipAsset.registerDerivativeWithLicenseTokens({
            childIpId: (
              await client.ipAsset.register({
                nftContract: mockERC721,
                tokenId: tokenId2!,
              })
            ).ipId!,
            licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
            maxRts: 5 * 10 ** 6,
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
          }),
        ).to.be.rejected;
      });
    });
  });

  describe("Batch Register IP Assets With Optimized Workflows", () => {
    let spgNftContractWithPublicMinting: Address;
    let spgNftContractWithPrivateMinting: Address;
    let parentIpId1: Hex;
    let parentIpId2: Hex;
    let licenseTermsId1: bigint;
    let licenseTermsId2: bigint;
    before(async () => {
      // Create a public minting NFT collection
      const publicMintingCollectionResult = await client.nftClient.createNFTCollection({
        name: "Public Minting Collection",
        symbol: "PMC",
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintFee: 10n,
        mintFeeToken: WIP_TOKEN_ADDRESS,
        contractURI: "",
      });
      spgNftContractWithPublicMinting = publicMintingCollectionResult.spgNftContract!;

      // Create a private minting NFT collection
      const privateMintingCollectionResult = await client.nftClient.createNFTCollection({
        name: "Private Minting Collection",
        symbol: "PRC",
        isPublicMinting: false,
        mintOpen: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        contractURI: "",
      });
      spgNftContractWithPrivateMinting = privateMintingCollectionResult.spgNftContract!;

      // Register a commercial remix PIL license
      const commercialRemixPILResult = await client.license.registerPILTerms(
        PILFlavor.commercialRemix({
          defaultMintingFee: 10n,
          commercialRevShare: 10,
          currency: WIP_TOKEN_ADDRESS,
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
        }),
      );
      licenseTermsId1 = commercialRemixPILResult.licenseTermsId!;

      // Register a commercial use PIL license
      const commercialUsePILResult = await client.license.registerPILTerms({
        transferable: true,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        defaultMintingFee: 5n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 10,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: WIP_TOKEN_ADDRESS,
        uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
      });
      licenseTermsId2 = commercialUsePILResult.licenseTermsId!;

      // Mint and register IP with public minting contract
      const publicMintingIpResult = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: spgNftContractWithPublicMinting,
      });
      parentIpId1 = publicMintingIpResult.ipId!;

      // Attach license terms to the first IP
      await client.license.attachLicenseTerms({
        ipId: parentIpId1,
        licenseTermsId: licenseTermsId1,
      });

      // Mint and register IP with private minting contract
      const privateMintingIpResult = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: spgNftContractWithPrivateMinting,
      });
      parentIpId2 = privateMintingIpResult.ipId!;

      // Attach license terms to the second IP
      await client.license.attachLicenseTerms({
        ipId: parentIpId2,
        licenseTermsId: licenseTermsId2,
      });
    });

    it("should successfully batch register multiple IP assets with SPG NFT contracts", async () => {
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 10(10+0) WIP tokens
         * - Uses `derivativeWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 15(10+5) WIP tokens
         * - Uses `multicall3Client` multicall3 due to the public minting
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAssetWithPilTerms workflow
         * - Total fees: 0 WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` multicall due to the private minting
         * - `maxLicenseTokens` is set to 1000n for first license terms
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          allowDuplicates: true,
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
                expectGroupRewardPool: pool,
              },
              maxLicenseTokens: 1000n,
            },
            {
              terms: PILFlavor.commercialUse({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: NativeRoyaltyPolicy.LAP,
                defaultMintingFee: 3n,
                override: {
                  commercialRevShare: 90,
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesReciprocal: true,
                  commercialAttribution: false,
                },
              }),
              licensingConfig: {
                isSet: true,
                mintingFee: 3n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: pool,
              },
            },
          ],
        },
        /**
         * mintAndRegisterIpAssetWithPilTerms workflow
         * - Total fees: 10(10+0) WIP tokens
         * - Uses `multicall3Client` multicall3 due to the public minting
         * - `maxLicenseTokens` is set to 100n for license terms
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          allowDuplicates: true,
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: NativeRoyaltyPolicy.LAP,
                defaultMintingFee: 0n,
                commercialRevShare: 90,
                override: {
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesReciprocal: true,
                  commercialAttribution: false,
                },
              }),
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
              maxLicenseTokens: 100n,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 20(10+10) WIP tokens
         * - Uses `multicall3Client` multicall3 due to the public minting
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 5(0+5) WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 10(10+0) WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the mint tokens is given `msg.sender` as the recipient
         * - `maxLicenseTokens` is set to 80n and 10n for license terms
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
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
                currency: WIP_TOKEN_ADDRESS,
                uri: "test case",
              },
              maxLicenseTokens: 80n,
            },
            {
              terms: PILFlavor.commercialRemix({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: NativeRoyaltyPolicy.LAP,
                defaultMintingFee: 100n,
                commercialRevShare: 0,
                override: {
                  derivativesReciprocal: true,
                  commercialAttribution: false,
                  expiration: 1000n,
                },
              }),
              maxLicenseTokens: 10n,
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 0 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the mint tokens is given `msg.sender` as the recipient
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                override: {
                  defaultMintingFee: 10000n,
                },
              }),
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        },
      ];
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
      });
      const totalFees = 10 + 15 + 0 + 10 + 20 + 5 + 10 + 0;
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - BigInt(totalFees)));
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      /**
       * Transaction breakdown:
       *
       * 1. derivativeWorkflowsClient: 1 transaction
       *    - No license terms attached
       *
       * 2. multicall3Client: 3 transactions
       *    - Second transaction includes license terms with maxLicenseTokens: 1000n
       *
       * 3. licenseAttachmentWorkflowsClient: 1 transaction
       *    - Two license terms attached
       *    - First license terms: maxLicenseTokens: 1000n
       *
       * 4. royaltyTokenDistributionWorkflowsClient: 3 transactions
       *    - Second transaction includes two license terms:
       *    -  First license terms: maxLicenseTokens: 80n
       *    - Second license terms: maxLicenseTokens: 10n
       *   - Third transaction includes a license terms
       *
       * Summary:
       * - Total transactions: 4 (4 unique transaction hashes)
       * - Total IP assets registered: 8
       */
      expect(result.registrationResults.length).equal(4);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes).equal(undefined);
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(3);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      expect(result.registrationResults[3].ipAssetsWithLicenseTerms.length).equal(3);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes?.length,
      ).equal(2);
    });

    it("should successfully batch register multiple IP assets with NFT contracts", async () => {
      const tokenId1 = await getTokenId();
      const tokenId2 = await getTokenId();
      const tokenId3 = await getTokenId();
      const tokenId4 = await getTokenId();
      const tokenId5 = await getTokenId();
      const tokenId6 = await getTokenId();
      const tokenId7 = await getTokenId();
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 10 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId1!,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId2!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * registerIpAndAttachPilTerms  workflow
         * - Total fees: 0 WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` multicall
         * - `maxLicenseTokens` is set to 100n
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId3!,
          deadline: 1000n,
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: NativeRoyaltyPolicy.LAP,
                defaultMintingFee: 0n,
                commercialRevShare: 100,
              }),
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
                currency: WIP_TOKEN_ADDRESS,
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
              maxLicenseTokens: 100n,
            },
          ],
        },
        /**
         * registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 0 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         * - `maxLicenseTokens` is set to 10n
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId4!,
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
                currency: erc20Address[aeneid],
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
              maxLicenseTokens: 10n,
            },
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: erc20Address[aeneid],
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              licensingConfig: {
                isSet: true,
                mintingFee: 6n,
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
              recipient: TEST_WALLET_ADDRESS,
              percentage: 43,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 17,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 2,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 38,
            },
          ],
        },
        /**
         * registerDerivativeIp workflow
         * - Total fees: 5 WIP tokens
         * - Uses `derivativeWorkflowsClient` multicall
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId5!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * registerDerivativeIp workflow
         * - Total fees: 10 WIP tokens
         * - Uses `derivativeWorkflowsClient` multicall
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId6!,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId7!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        },
      ];
      const totalFees = 10 + 5 + 0 + 0 + 5 + 10 + 5;
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
      });
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - BigInt(totalFees)));
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      /**
       * Transaction breakdown:
       * 1. royaltyTokenDistributionWorkflowsClient: 4 args
       *  - The third request has two license terms, first one has `maxLicenseTokens` set to 10n
       *
       * 2.licenseAttachmentWorkflowsClient: 1 arg
       *  - The first request have two license terms, second one has `maxLicenseTokens` set to 100n
       *
       * 3.derivativeWorkflowsClient: 2 args
       *  - None license terms and no `maxLicenseTokens` set
       *
       * Summary:
       * - Total transactions: 3 (3 unique transaction hashes)
       * - Total IP assets registered: 7
       */
      expect(result.registrationResults.length).equal(3);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes?.length).greaterThan(0);

      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(4);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[2].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[2].maxLicenseTokensTxHashes?.length,
      ).equal(1);

      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);

      expect(result.registrationResults[2].ipAssetsWithLicenseTerms.length).equal(2);
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes,
      ).equal(undefined);
    });

    it("should successfully register IP assets using a combination of NFT contracts and SPG NFT contracts", async () => {
      const tokenId1 = await getTokenId();
      const tokenId2 = await getTokenId();
      const tokenId3 = await getTokenId();
      const tokenId4 = await getTokenId();
      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 15(10+5) WIP tokens
         * - Uses `multicall3Client` multicall3 due to the public minting
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 5(0+5) WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 20(10+10) WIP tokens
         * - Uses `multicall3Client` multicall3 due to the public minting
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 10(10+0) WIP tokens
         * - Uses `derivativeWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId1!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        },
        /**
         * registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 0 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         * - `maxLicenseTokens` is set to 10n
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId2!,
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
                currency: erc20Address[aeneid],
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
              maxLicenseTokens: 10n,
            },
          ],
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 43,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 17,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 2,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 38,
            },
          ],
        },
        /**
         * registerIpAndAttachPilTerms  workflow
         * - Total fees: 0 WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` multicall
         * - the second request has `maxLicenseTokens` set to 10n
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId3!,
          deadline: 1000n,
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: NativeRoyaltyPolicy.LAP,
                defaultMintingFee: 0n,
                commercialRevShare: 100,
              }),
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
                currency: WIP_TOKEN_ADDRESS,
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
              maxLicenseTokens: 10n,
            },
          ],
        },
        /**
         * registerDerivativeIp workflow
         * - Total fees: 10 WIP tokens
         * - Uses `derivativeWorkflowsClient` multicall
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId4!,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsId1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
      ];
      const totalFees = 15 + 5 + 20 + 10 + 5 + 0 + 0 + 10;
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
      });
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - BigInt(totalFees)));
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      /**
       * Transaction breakdown:
       * 1. multicall3Client: 2 args
       *  - No license terms and no `maxLicenseTokens` set
       *
       * 2. royaltyTokenDistributionWorkflowsClient: 3 args
       *  - The third request has a license terms and `maxLicenseTokens` set to 10n
       *
       * 3. derivativeWorkflowsClient: 2 args
       *  - None license terms and no `maxLicenseTokens` set
       *
       * 4. licenseAttachmentWorkflowsClient: 1 arg
       *  - The first request have two license terms, second one has `maxLicenseTokens` set to 10n
       *
       * Summary:
       * - Total transactions: 4 (4 unique transaction hashes)
       * - Total IP assets registered: 8
       */
      expect(result.registrationResults.length).equal(4);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes?.length).greaterThan(0);

      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(2);
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms[1].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes,
      ).equal(undefined);

      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(3);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[2].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[2].maxLicenseTokensTxHashes?.length,
      ).equal(1);

      expect(result.registrationResults[2].ipAssetsWithLicenseTerms.length).equal(2);
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms[1].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes,
      ).equal(undefined);

      expect(result.registrationResults[3].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);
    });

    it("should successfully register IP assets with multicall disabled", async () => {
      const tokenId1 = await getTokenId();
      const tokenId2 = await getTokenId();

      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 15(10+5) WIP tokens
         * - Uses `derivativeWorkflowsClient` to call the this method
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAssetWithPilTerms workflow
         * - Total fees: 0 WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` to call the this method
         */
        {
          spgNftContract: spgNftContractWithPrivateMinting,
          allowDuplicates: true,
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
                expectGroupRewardPool: pool,
              },
            },
          ],
        },
        /**
         * mintAndRegisterIpAssetWithPilTerms workflow
         * - Total fees: 10(10+0) WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` to call the this method
         * - the first request has `maxLicenseTokens` set to 10n
         */
        {
          spgNftContract: spgNftContractWithPublicMinting,
          allowDuplicates: true,
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
                expectGroupRewardPool: pool,
              },
              maxLicenseTokens: 10n,
            },
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
                expectGroupRewardPool: pool,
              },
            },
          ],
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient`to call the this method
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId1!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient`to call the this method
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId2!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsId2],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        },
      ];
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const totalFees = 15 + 0 + 10 + 5 + 5;
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
        options: {
          wipOptions: {
            useMulticallWhenPossible: false,
          },
        },
      });
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);

      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - BigInt(totalFees)));
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      /**
       * Transaction breakdown:
       * 1. None license terms and no `maxLicenseTokens` set
       * 2. The request have one license terms and no `maxLicenseTokens` set
       * 3. The request have two license terms, first one has `maxLicenseTokens` set to 10n
       * 4. The requests have no license terms and no `maxLicenseTokens` set
       * 5. The requests have no license terms and no `maxLicenseTokens` set
       * Summary:
       * - Total transactions: 5 (5 unique transaction hashes)
       * - Total IP assets registered: 5
       */
      expect(result.registrationResults.length).equal(requests.length);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes?.length).equal(2);

      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);

      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);

      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);

      expect(result.registrationResults[3].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[3].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);

      expect(result.registrationResults[4].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[4].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[4].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
    });
  });

  describe("Batch Mint and Register IP Asset", () => {
    let spgNftContractWithPublicMinting: Address;
    let spgNftContractWithPrivateMinting: Address;
    let anotherWalletAddress: Address;
    before(async () => {
      const publicMintingCollectionResult = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintFee: 10n,
        mintFeeToken: WIP_TOKEN_ADDRESS,
      });
      spgNftContractWithPublicMinting = publicMintingCollectionResult.spgNftContract!;

      const privateMintingCollectionResult = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: false,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintFee: 20n,
        mintFeeToken: WIP_TOKEN_ADDRESS,
      });
      spgNftContractWithPrivateMinting = privateMintingCollectionResult.spgNftContract!;

      const { address } = await getDerivedStoryClient();
      anotherWalletAddress = address;
    });
    it("should successfully when public minting of spgNftContract", async () => {
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const { registrationResults } = await client.ipAsset.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: spgNftContractWithPublicMinting },
          { spgNftContract: spgNftContractWithPublicMinting, recipient: anotherWalletAddress },
          { spgNftContract: spgNftContractWithPublicMinting, allowDuplicates: false },
        ],
      });
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(registrationResults.length).equal(1);
      expect(registrationResults[0].ipIdsAndTokenIds.length).equal(3);
    });

    it("should successfully when private minting of spgNftContract", async () => {
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const { registrationResults } = await client.ipAsset.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: spgNftContractWithPrivateMinting },
          { spgNftContract: spgNftContractWithPrivateMinting, recipient: anotherWalletAddress },
          {
            spgNftContract: spgNftContractWithPrivateMinting,
            allowDuplicates: false,
            recipient: anotherWalletAddress,
          },
        ],
      });
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(registrationResults.length).equal(1);
      expect(registrationResults[0].ipIdsAndTokenIds.length).equal(3);
    });

    it("should successfully when hybrid private minting and public minting of spgNftContract", async () => {
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const { registrationResults } = await client.ipAsset.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: spgNftContractWithPublicMinting },
          { spgNftContract: spgNftContractWithPrivateMinting, recipient: anotherWalletAddress },
          { spgNftContract: spgNftContractWithPrivateMinting, allowDuplicates: false },
          { spgNftContract: spgNftContractWithPublicMinting, recipient: anotherWalletAddress },
        ],
      });
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(registrationResults.length).equal(2);
      expect(registrationResults[0].ipIdsAndTokenIds.length).equal(2);
      expect(registrationResults[1].ipIdsAndTokenIds.length).equal(2);
    });

    it("should fail when private minting of spgNftContract but caller does not have the minter role", async () => {
      // Register a new SPG NFT contract with private minting with clientB
      const { address, clientB } = await getDerivedStoryClient();
      const { spgNftContract: privateMintingContractOfClientB } =
        await clientB.nftClient.createNFTCollection({
          name: "test-collection",
          symbol: "TEST",
          maxSupply: 100,
          isPublicMinting: false,
          mintOpen: true,
          mintFeeRecipient: address,
          contractURI: "test-uri",
        });
      await expect(
        client.ipAsset.batchMintAndRegisterIp({
          requests: [{ spgNftContract: privateMintingContractOfClientB! }],
        }),
      ).to.be.rejectedWith("does not have the minter role");
    });
  });

  describe("Register ip asset with minted and mint nft", () => {
    describe("Register IP Asset with Minted NFT", () => {
      it("should successfully when give license terms data and royalty shares", async () => {
        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
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
              maxLicenseTokens: 100,
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
          deadline: 1000n,
        });
        expect(result.ipId).to.be.a("string");
        expect(result.licenseTermsIds.length).to.be.equal(1);
        expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.be.a("string");
        expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
        expect(result.ipRoyaltyVault).to.be.a("string");
        expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
      });

      it("should successfully when give license terms data without royalty shares", async () => {
        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                defaultMintingFee: 10000n,
                commercialRevShare: 100,
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
        });
        expect(result.ipId).to.be.a("string");
        expect(result.txHash).to.be.a("string");
        expect(result.licenseTermsIds).to.be.an("array");
        expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
        expect(result.tokenId).to.be.a("bigint");
      });

      it("should successfully when without license terms data, royalty shares, ip metadata", async () => {
        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
        });
        expect(result.ipId).to.be.a("string");
        expect(result.txHash).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });

      it("should successfully when without license terms data and royalty shares, with ip metadata", async () => {
        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
            nftMetadataURI: "test-nft-uri",
          },
        });
        expect(result.ipId).to.be.a("string");
        expect(result.txHash).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
    });

    describe("Register IP Asset by minting a new NFT", () => {
      let spgNftContract: Address;
      before(async () => {
        const txData = await client.nftClient.createNFTCollection({
          name: "test-collection",
          symbol: "TEST_FOR_MINT",
          maxSupply: 100,
          isPublicMinting: false,
          mintOpen: true,
          mintFeeRecipient: TEST_WALLET_ADDRESS,
          contractURI: "test-uri",
          mintFee: 10n,
          mintFeeToken: WIP_TOKEN_ADDRESS,
        });
        spgNftContract = txData.spgNftContract!;
      });

      it("should successfully when give license terms data and royalty shares", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgNftContract },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
            },
            {
              terms: PILFlavor.commercialRemix({
                defaultMintingFee: 10000n,
                commercialRevShare: 100,
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLrpAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10,
            },
          ],
        });

        expect(result.ipId).to.be.a("string");
        expect(result.licenseTermsIds?.length).to.be.equal(2);
        expect(result.ipRoyaltyVault).to.be.a("string");
        expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
        expect(result.tokenId).to.be.a("bigint");
      });

      it("should successfully when give license terms data without royalty shares", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgNftContract },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
            {
              terms: PILFlavor.commercialRemix({
                defaultMintingFee: 10000n,
                commercialRevShare: 100,
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLrpAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
        expect(result.licenseTermsIds?.length).to.be.equal(2);
        expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(2);
      });

      it("should successfully when without license terms data and royalty shares", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgNftContract },
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
            nftMetadataURI: "test-nft-uri",
          },
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
    });
  });

  describe("Register derivative IP Asset", () => {
    let parentIpId: Address;
    let commercialRemixLicenseTermsId: bigint;
    before(async () => {
      const tokenId = await getTokenId();
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: mockERC721,
        tokenId: tokenId!,
        licenseTermsData: [
          {
            terms: PILFlavor.commercialRemix({
              defaultMintingFee: 10000n,
              commercialRevShare: 100,
              currency: WIP_TOKEN_ADDRESS,
            }),
          },
        ],
      });
      parentIpId = result.ipId!;
      commercialRemixLicenseTermsId = result.licenseTermsIds![0];
    });
    describe("Register derivative IP Asset with Minted NFT", () => {
      it("should successfully when give derivData and royalty shares", async () => {
        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
          derivData: {
            parentIpIds: [parentIpId!],
            licenseTermsIds: [commercialRemixLicenseTermsId],
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        });
        expect(
          result.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash,
        ).to.be.a("string");
        expect(result.distributeRoyaltyTokensTxHash).to.be.a("string");
        expect(result.ipRoyaltyVault).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.equal(BigInt(tokenId!));
      });

      it("should successfully given derivData", async () => {
        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
          derivData: {
            parentIpIds: [parentIpId!],
            licenseTermsIds: [commercialRemixLicenseTermsId],
            maxMintingFee: 10000n,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });

        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.equal(BigInt(tokenId!));
        expect(result.txHash).to.be.a("string");
      });

      it("should successfully given licenseTokenIds and maxRts", async () => {
        const { licenseTokenIds } = await client.license.mintLicenseTokens({
          licenseTermsId: commercialRemixLicenseTermsId,
          licensorIpId: parentIpId,
          maxMintingFee: 0n,
          maxRevenueShare: 100,
        });
        await approveForLicenseToken(derivativeWorkflowsAddress[aeneid], licenseTokenIds![0]);

        const tokenId = await getTokenId();
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
          licenseTokenIds: licenseTokenIds!,
          maxRts: 100,
          maxMintingFee: 10000n,
        });

        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.equal(BigInt(tokenId!));
        expect(result.txHash).to.be.a("string");
      });
    });

    describe("Register derivative IP Asset by minting a new NFT", () => {
      let spgNftContract: Address;
      before(async () => {
        const txData = await client.nftClient.createNFTCollection({
          name: "test-collection",
          symbol: "TEST_FOR_MINT",
          maxSupply: 100,
          isPublicMinting: false,
          mintOpen: true,
          mintFeeRecipient: TEST_WALLET_ADDRESS,
          contractURI: "test-uri",
          mintFee: 10n,
          mintFeeToken: WIP_TOKEN_ADDRESS,
        });
        spgNftContract = txData.spgNftContract!;
      });
      it("should successfully when give derivData and royalty shares", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract },
          derivData: {
            parentIpIds: [parentIpId!],
            licenseTermsIds: [commercialRemixLicenseTermsId],
            maxMintingFee: 10000n,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 100,
            },
          ],
        });

        expect(result.ipId).to.be.a("string");
        expect(result.txHash).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });

      it("should successfully when give licenseTokenIds and maxRts", async () => {
        const { licenseTokenIds } = await client.license.mintLicenseTokens({
          licenseTermsId: commercialRemixLicenseTermsId,
          licensorIpId: parentIpId,
          maxMintingFee: 0n,
          maxRevenueShare: 100,
        });
        await approveForLicenseToken(derivativeWorkflowsAddress[aeneid], licenseTokenIds![0]);
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract },
          licenseTokenIds: licenseTokenIds!,
          maxRts: 100,
        });

        expect(result.ipId).to.be.a("string");
        expect(result.txHash).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });

      it("should successfully when give derivData", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract },
          derivData: {
            parentIpIds: [parentIpId!],
            licenseTermsIds: [commercialRemixLicenseTermsId],
            maxMintingFee: 10000n,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });

        expect(result.ipId).to.be.a("string");
        expect(result.txHash).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
    });
  });

  describe("Link Derivative", () => {
    let parentIpId: Address;
    let commercialRemixLicenseTermsId: bigint;
    before(async () => {
      const tokenId = await getTokenId();
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: mockERC721,
        tokenId: tokenId!,
        licenseTermsData: [
          {
            terms: PILFlavor.commercialRemix({
              defaultMintingFee: 10000n,
              commercialRevShare: 100,
              currency: WIP_TOKEN_ADDRESS,
            }),
          },
        ],
      });
      parentIpId = result.ipId!;
      commercialRemixLicenseTermsId = result.licenseTermsIds![0];
    });
    it("should successfully when give childIpId and licenseTokenIds", async () => {
      // register a child ip
      const tokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: commercialRemixLicenseTermsId,
        licensorIpId: parentIpId,
        maxMintingFee: 0,
        maxRevenueShare: 100,
      });
      const result = await client.ipAsset.linkDerivative({
        childIpId: childIpId,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        maxRts: 5 * 10 ** 6,
      });
      expect(result.txHash).to.be.a("string");
    });

    it("should successfully when give parentIpId and licenseTokenIds", async () => {
      const tokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;

      const result = await client.ipAsset.linkDerivative({
        childIpId: childIpId,
        parentIpIds: [parentIpId],
        licenseTermsIds: [commercialRemixLicenseTermsId],
        maxMintingFee: 0,
        maxRts: 5 * 10 ** 6,
        maxRevenueShare: 0,
      });

      expect(result.txHash).to.be.a("string");
    });
  });
});
