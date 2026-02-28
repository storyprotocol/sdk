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

const createParentIpAndLicenseTerms = async (
  client: StoryClient,
  token: Address,
): Promise<{ parentIpId: Address; licenseTermsId: bigint }> => {
  const tokenId = await getTokenId();
  const result = await client.ipAsset.registerIpAsset({
    nft: { type: "minted", nftContract: mockERC721, tokenId: tokenId! },
    licenseTermsData: [
      {
        terms: PILFlavor.commercialUse({
          defaultMintingFee: 10n,
          currency: token,
          override: { derivativesAllowed: true },
        }),
      },
    ],
  });
  return { parentIpId: result.ipId!, licenseTermsId: result.licenseTermsIds![0] };
};

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
        maxRevenueShare: 0.32423,
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
        maxRevenueShare: 10,
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
        maxRevenueShare: 0.9999999999,
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
              percentage: 0.00020302,
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
              percentage: 12.232131,
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
              percentage: 43.000301,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 17.0003011,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 2.000301,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 32.0003012,
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
              percentage: 10.2,
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
              percentage: 10.434,
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
              percentage: 4.000301,
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
              percentage: 0.34343234234,
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
              percentage: 10.434,
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
              percentage: 10.434,
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

  describe("Batch Register IP Assets With Optimized Workflows", () => {
    let spgNftContractWithPublicMintingWithWip: Address;
    let spgNftContractWithPrivateMintingWithErc20: Address;
    let parentIpId1: Hex;
    let parentIpId2: Hex;
    let licenseTermsIdWithWIP: bigint;
    let licenseTermsIdWithErc20: bigint;
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
      spgNftContractWithPublicMintingWithWip = publicMintingCollectionResult.spgNftContract!;

      // Create a private minting NFT collection
      const privateMintingCollectionResult = await client.nftClient.createNFTCollection({
        name: "Private Minting Collection",
        symbol: "PRC",
        isPublicMinting: false,
        mintOpen: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintFee: 10n,
        mintFeeToken: erc20Address[aeneid],
        contractURI: "",
      });
      spgNftContractWithPrivateMintingWithErc20 = privateMintingCollectionResult.spgNftContract!;

      // Register a commercial remix PIL license
      const commercialRemixPILResult = await client.license.registerPILTerms(
        PILFlavor.commercialRemix({
          defaultMintingFee: 10n,
          commercialRevShare: 10,
          currency: WIP_TOKEN_ADDRESS,
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
        }),
      );
      licenseTermsIdWithWIP = commercialRemixPILResult.licenseTermsId!;

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
        currency: erc20Address[aeneid],
        uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
      });
      licenseTermsIdWithErc20 = commercialUsePILResult.licenseTermsId!;

      // Mint and register IP with public minting contract
      const publicMintingIpResult = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: spgNftContractWithPublicMintingWithWip,
      });
      parentIpId1 = publicMintingIpResult.ipId!;

      // Attach license terms to the first IP
      await client.license.attachLicenseTerms({
        ipId: parentIpId1,
        licenseTermsId: licenseTermsIdWithWIP,
      });

      // Mint and register IP with private minting contract
      const privateMintingIpResult = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: spgNftContractWithPrivateMintingWithErc20,
      });
      parentIpId2 = privateMintingIpResult.ipId!;

      // Attach license terms to the second IP
      await client.license.attachLicenseTerms({
        ipId: parentIpId2,
        licenseTermsId: licenseTermsIdWithErc20,
      });
    });

    it("should successfully batch register multiple IP assets with SPG NFT contracts", async () => {
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 10 WIP tokens + 10 ERC20 tokens
         * - Uses `derivativeWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsIdWithWIP],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 15 WIP tokens + 5 ERC20 tokens
         * - Uses `derivativeWorkflowsClient` multicall due to the ERC20 token is used
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAssetWithPilTerms workflow
         * - Total fees: 0 WIP tokens + 10 ERC20 tokens
         * - Uses `licenseAttachmentWorkflowsClient` multicall due to the private minting
         * - Two license terms
         * - `maxLicenseTokens` is set to 1000n for first license terms
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
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
         * - One license terms
         * - `maxLicenseTokens` is set to 100n for license terms
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
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
          spgNftContract: spgNftContractWithPublicMintingWithWip,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsIdWithWIP],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 3.000301,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 10 ERC20 tokens +5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.434,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 10(10+0) WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the mint tokens is given `msg.sender` as the recipient
         * - Two license terms
         * - `maxLicenseTokens` is set to 80n and 10n for license terms
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
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
              percentage: 1.211,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 0 WIP tokens + 10 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the mint tokens is given `msg.sender` as the recipient
         * - One license terms
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
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
              percentage: 1.231,
            },
          ],
        },
      ];
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
      });

      /**
       * Transaction breakdown:
       *
       * 1. derivativeWorkflowsClient: 2 args
       *    - First arg:
       *      - 10WIP tokens +10 ERC20 tokens
       *    - Second arg:
       *      - 15WIP tokens + 5 ERC20 tokens
       *
       * 2. licenseAttachmentWorkflowsClient: 1 args
       *    - 10 ERC20 tokens
       *    - Two license terms attached
       *    - First license terms: maxLicenseTokens: 1000n
       *
       * 3. multicall3Client: 2 args
       *    - First arg:
       *      - 10 WIP tokens
       *      - One license terms
       *      - First license terms: maxLicenseTokens: 100n
       *    - Second arg:
       *      - 20 WIP tokens
       *
       * 3. multicall3Client: 2 args
       *    - First arg:
       *      - 10 WIP tokens
       *      - One license terms
       *      - First license terms: maxLicenseTokens: 100n
       *    - Second arg:
       *      - 20 WIP tokens
       *
       * 4. royaltyTokenDistributionWorkflowsClient: 3 args
       *    - First arg:
       *      - 10 ERC20+ 5 ERC20 tokens
       *    - Second arg:
       *      - 15 WIP tokens
       *      - Two license terms
       *      - First license terms: maxLicenseTokens: 80n
       *      - Second license terms: maxLicenseTokens: 10n
       *    - Third arg:
       *      - 10 ERC20 tokens
       *      - One license terms
       *
       * Summary:
       * - Total transactions: 4 (4 unique transaction hashes)
       * - Total IP assets registered: 8
       */

      const totalFeesForWIP = 10 + 15 + 10 + 20 + 15;
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(Number(userBalanceAfter)).lessThan(
        Number(userBalanceBefore - BigInt(totalFeesForWIP)),
      );
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(result.registrationResults.length).equal(4);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes).equal(undefined);
      // Derivative workflow
      // First arg
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(2);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
      // Second arg
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
      // license attachment workflow
      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      // multicall3 workflow
      // First arg
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms.length).equal(2);
      // First arg
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      // Second arg
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
      // royalty token distribution workflow
      expect(result.registrationResults[3].ipAssetsWithLicenseTerms.length).equal(3);
      // First arg
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
      // Second arg
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes?.length,
      ).equal(2);
      // Third arg
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[2].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[3].ipAssetsWithLicenseTerms[2].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
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
            licenseTermsIds: [licenseTermsIdWithWIP],
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
         * - Total fees: 5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId2!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
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
         * - Two license terms
         * - `maxLicenseTokens` is set to 100n for second license terms
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
         * - Two license terms
         * - Need to distribute royalty tokens
         * - `maxLicenseTokens` is set to 10n for first license terms
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
              percentage: 43.000301,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 17.0003011,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 2.000301,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 30.0003012,
            },
          ],
        },
        /**
         * registerDerivativeIp workflow
         * - Total fees: 5 ERC20 tokens
         * - Uses `derivativeWorkflowsClient` multicall
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId5!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
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
            licenseTermsIds: [licenseTermsIdWithWIP],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId7!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.434,
            },
          ],
        },
      ];

      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
      });

      /**
       * Transaction breakdown:
       * 1. royaltyTokenDistributionWorkflowsClient: 4 args
       *  - First arg:
       *    - 10 WIP tokens
       *    - Need to distribute royalty tokens
       *  - Second arg:
       *    - 5 ERC20 tokens
       *    - Need to distribute royalty tokens
       *  - Third arg:
       *    - 0 WIP tokens
       *    - Two license terms
       *    - First license terms: maxLicenseTokens: 10n
       *    - Need to distribute royalty tokens
       *  - Fourth arg:
       *    - 5 ERC20 tokens
       *    - Need to distribute royalty tokens
       * 2. licenseAttachmentWorkflowsClient: 1 arg
       *  - 0 WIP tokens
       *  - Two license terms
       *  - Second license terms: maxLicenseTokens: 100n
       * 3. derivativeWorkflowsClient: 2 args
       *  - First arg:
       *    - 5 ERC20 tokens
       *  - Second arg:
       *    - 10 WIP tokens
       *
       * Summary:
       * - Total transactions: 3 (3 unique transaction hashes)
       * - Total IP assets registered: 7
       */
      const totalFees = 10 + 10;
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - BigInt(totalFees)));
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(result.registrationResults.length).equal(3);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes?.length).equal(1);
      // royaltyTokenDistributionWorkflowsClient
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(4);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[2].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[2].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      expect(result.registrationResults[0].ipRoyaltyVault?.length).equal(4);

      // licenseAttachmentWorkflowsClient
      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      expect(result.registrationResults[1].ipRoyaltyVault?.length).equal(0);

      //derivativeWorkflowsClient
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms.length).equal(2);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].licenseTermsIds?.length,
      ).equal(undefined);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[1].maxLicenseTokensTxHashes?.length,
      ).equal(undefined);
      expect(result.registrationResults[2].ipRoyaltyVault?.length).equal(0);
    });

    it("should successfully register IP assets using a combination of NFT contracts and SPG NFT contracts", async () => {
      const tokenId1 = await getTokenId();
      const tokenId2 = await getTokenId();
      const tokenId3 = await getTokenId();
      const tokenId4 = await getTokenId();
      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 10 WIP tokens +5 ERC20 tokens
         * - Uses `derivativeWorkflowsClient` multicall3 due to contains ERC20 token
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 10 ERC20 tokens+ 5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.434,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens workflow
         * - Total fees: 20(10+10) WIP tokens
         * - Uses `multicall3Client` multicall3 due to the public minting
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsIdWithWIP],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.4341111111,
            },
          ],
        },
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 10 ERC20 tokens+10 WIP tokens
         * - Uses `derivativeWorkflowsClient` multicall due to the private minting
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
          derivData: {
            parentIpIds: [parentIpId1],
            licenseTermsIds: [licenseTermsIdWithWIP],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId1!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.2312332,
            },
          ],
        },
        /**
         * registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 0 WIP tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient` multicall
         * - Need to distribute royalty tokens
         * - One license terms
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
              percentage: 43.000301,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 17.0003011,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 2.000301,
            },
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 30.0003012,
            },
          ],
        },
        /**
         * registerIpAndAttachPilTerms  workflow
         * - Total fees: 0 WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` multicall
         * - Two license terms
         * - The second request has `maxLicenseTokens` set to 10n
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
            licenseTermsIds: [licenseTermsIdWithWIP],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
      ];

      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
      });
      /**
       * Transaction breakdown:
       * 1. derivativeWorkflowsClient:3 args
       * - First arg
       *   - 10 WIP tokens+ 5 ERC20 tokens
       * - Second arg
       *   - 10 ERC20 + 10 WIP tokens
       * - Third arg
       *   - 10 WIP tokens
       *
       * 2. royaltyTokenDistributionWorkflowsClient: 3 args
       *  - First arg
       *    - 15 ERC20 tokens
       *  - Second arg
       *    - 5 ERC20 tokens
       *    - Need to distribute royalty tokens
       *  - Third arg
       *    - 0 WIP tokens
       *    - One license terms
       *    - First license terms: maxLicenseTokens: 10n
       *    - Need to distribute royalty tokens
       *
       * 3. licenseAttachmentWorkflowsClient: 1 arg
       * - 0 WIP tokens
       * - Two license terms
       * - Second license terms: maxLicenseTokens: 100n
       *
       * Summary:
       * - Total transactions: 4 (4 unique transaction hashes)
       * - Total IP assets registered: 8
       */
      const totalFeesWithWIP = 10 + 10 + 10;
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(Number(userBalanceAfter)).lessThan(
        Number(userBalanceBefore - BigInt(totalFeesWithWIP)),
      );
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(result.registrationResults.length).equal(4);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes?.length).equal(1);
      // derivativeWorkflowsClient
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(3);
      expect(result.registrationResults[0].ipRoyaltyVault?.length).equal(0);

      // royaltyTokenDistributionWorkflowsClient
      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(3);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[2].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[2].maxLicenseTokensTxHashes?.length,
      ).equal(1);
      expect(result.registrationResults[1].ipRoyaltyVault?.length).equal(2);

      //licenseAttachmentWorkflowsClient
      expect(result.registrationResults[2].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[2].ipRoyaltyVault?.length).equal(0);
    });

    it("should successfully register IP assets with multicall disabled", async function () {
      this.retries(2);
      const tokenId1 = await getTokenId();
      const tokenId2 = await getTokenId();

      const requests: IpRegistrationWorkflowRequest[] = [
        /**
         * mintAndRegisterIpAndMakeDerivative workflow
         * - Total fees: 15(10+5) WIP tokens
         * - Uses `derivativeWorkflowsClient` to call the this method
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        /**
         * mintAndRegisterIpAssetWithPilTerms workflow
         * - Total fees: 0 WIP tokens
         * - Uses `licenseAttachmentWorkflowsClient` to call the this method
         * - One license terms
         */
        {
          spgNftContract: spgNftContractWithPrivateMintingWithErc20,
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
         * - Two license terms
         * - The first request has `maxLicenseTokens` set to 10n
         */
        {
          spgNftContract: spgNftContractWithPublicMintingWithWip,
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
         * - Total fees: 5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient`to call the this method
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId1!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.4341212321,
            },
          ],
        },
        /**
         * registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens workflow
         * - Total fees: 5 ERC20 tokens
         * - Uses `royaltyTokenDistributionWorkflowsClient`to call the this method
         * - Need to distribute royalty tokens
         */
        {
          nftContract: mockERC721,
          tokenId: tokenId2!,
          derivData: {
            parentIpIds: [parentIpId2],
            licenseTermsIds: [licenseTermsIdWithErc20],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 3.000301,
            },
          ],
        },
      ];
      const userBalanceBefore = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);

      const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: requests,
        options: {
          wipOptions: {
            useMulticallWhenPossible: false,
          },
        },
      });
      /**
       * Transaction breakdown:
       *  1. derivativeWorkflowsClient:1 arg
       *    - 15 WIP
       * 2. licenseAttachmentWorkflowsClient: 2 args
       *    - First arg
       *      - 0 WIP tokens
       *      - One license terms
       *    - Second arg
       *      - 10  WIP tokens
       *      - Two license terms
       *      - First license terms: maxLicenseTokens: 10n
       * 3. royaltyTokenDistributionWorkflowsClient: 2 args
       *    - First arg
       *      - 5 ERC20 tokens
       *      - Need to distribute royalty tokens
       *    - Second arg
       *      - 5 ERC20 tokens
       *      - Need to distribute royalty tokens
       * Summary:
       * - Total transactions: 5 (5 unique transaction hashes) due to the multicall disabled
       * - Total IP assets registered: 5
       * - Two distribute royalty tokens transactions
       */
      const totalFees = 15 + 10;
      const userBalanceAfter = await client.getBalance(TEST_WALLET_ADDRESS);
      const wipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);

      expect(Number(userBalanceAfter)).lessThan(Number(userBalanceBefore - BigInt(totalFees)));
      expect(wipBalanceAfter).equal(wipBalanceBefore);
      expect(result.registrationResults.length).equal(requests.length);
      expect(
        result.registrationResults.reduce((a, b) => a + b.ipAssetsWithLicenseTerms.length, 0),
      ).equal(requests.length);
      expect(result.distributeRoyaltyTokensTxHashes?.length).equal(2);

      //derivativeWorkflowsClient
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[0].ipAssetsWithLicenseTerms[0].licenseTermsIds).equal(
        undefined,
      );
      expect(
        result.registrationResults[0].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
      expect(result.registrationResults[0].ipRoyaltyVault?.length).equal(0);

      //licenseAttachmentWorkflowsClient
      //First arg
      expect(result.registrationResults[1].ipAssetsWithLicenseTerms.length).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(1);
      expect(
        result.registrationResults[1].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes,
      ).equal(undefined);
      //Second arg
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].licenseTermsIds?.length,
      ).equal(2);
      expect(
        result.registrationResults[2].ipAssetsWithLicenseTerms[0].maxLicenseTokensTxHashes?.length,
      ).equal(1);

      //royaltyTokenDistributionWorkflowsClient
      expect(result.registrationResults[3].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[3].ipRoyaltyVault?.length).equal(1);
      expect(result.registrationResults[4].ipAssetsWithLicenseTerms.length).equal(1);
      expect(result.registrationResults[4].ipRoyaltyVault?.length).equal(1);
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
        mintFeeToken: erc20Address[aeneid],
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
              percentage: 2.000000001,
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
              percentage: 0.000001,
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
              percentage: 10.232132,
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
              percentage: 1.23,
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
    it("should successfully when give childIpId and licenseTokenIds", async () => {
      // register a child ip
      const tokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
        })
      ).ipId!;
      const { parentIpId, licenseTermsId } = await createParentIpAndLicenseTerms(
        client,
        WIP_TOKEN_ADDRESS,
      );
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
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
    describe("parentIpId and licenseTermsId", () => {
      it("should successfully give ERC20 token", async () => {
        // 1. register a child ip
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        // 2. create parent ip and license terms for ERC20
        const parentIpIdAndLicenseTermsIdForERC20 = await createParentIpAndLicenseTerms(
          client,
          erc20Address[aeneid],
        );
        // 3. link derivative
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [parentIpIdAndLicenseTermsIdForERC20.parentIpId],
          licenseTermsIds: [parentIpIdAndLicenseTermsIdForERC20.licenseTermsId],
        });

        expect(result.txHash).to.be.a("string");
      });
      it("should successfully give sufficient WIP token", async () => {
        // 1. deposit 100 WIP token
        await client.wipClient.deposit({
          amount: 100n,
        });
        // 2. register a child ip
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        // 3. create parent ip and license terms for WIP
        const parentIpIdAndLicenseTermsIdForWIP = await createParentIpAndLicenseTerms(
          client,
          WIP_TOKEN_ADDRESS,
        );
        // 4. link derivative
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [parentIpIdAndLicenseTermsIdForWIP.parentIpId],
          licenseTermsIds: [parentIpIdAndLicenseTermsIdForWIP.licenseTermsId],
        });
        expect(result.txHash).to.be.a("string");
        // 5. withdraw all WIP token
        const wipBalance = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
        await client.wipClient.withdraw({
          amount: wipBalance,
        });
      });

      it("should successfully give insufficient WIP token", async () => {
        // 1. register a child ip
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        // 2. create parent ip and license terms for WIP
        const parentIpIdAndLicenseTermsIdForWIP = await createParentIpAndLicenseTerms(
          client,
          WIP_TOKEN_ADDRESS,
        );
        // 3. link derivative
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [parentIpIdAndLicenseTermsIdForWIP.parentIpId],
          licenseTermsIds: [parentIpIdAndLicenseTermsIdForWIP.licenseTermsId],
        });
        expect(result.txHash).to.be.a("string");
      });

      it("should successfully give wip token with insufficient balance and sufficient erc20 token", async () => {
        //1. register a child ip
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        // 2. create parent ip and license terms for WIP
        const parentIpIdAndLicenseTermsIdForWIP1 = await createParentIpAndLicenseTerms(
          client,
          WIP_TOKEN_ADDRESS,
        );
        const parentIpIdAndLicenseTermsIdForERC20 = await createParentIpAndLicenseTerms(
          client,
          erc20Address[aeneid],
        );
        // 3. link derivative
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [
            parentIpIdAndLicenseTermsIdForWIP1.parentIpId,
            parentIpIdAndLicenseTermsIdForERC20.parentIpId,
          ],
          licenseTermsIds: [
            parentIpIdAndLicenseTermsIdForWIP1.licenseTermsId,
            parentIpIdAndLicenseTermsIdForERC20.licenseTermsId,
          ],
        });
        expect(result.txHash).to.be.a("string");
      });
      it("should successfully give wip token with sufficient balance and sufficient erc20 token", async () => {
        // 1. deposit 100 WIP token
        await client.wipClient.deposit({
          amount: 100n,
        });
        // 2. register a child ip
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        // 3. create parent ip and license terms for WIP
        const parentIpIdAndLicenseTermsIdForWIP1 = await createParentIpAndLicenseTerms(
          client,
          WIP_TOKEN_ADDRESS,
        );
        // 4. create parent ip and license terms for ERC20
        const parentIpIdAndLicenseTermsIdForERC20 = await createParentIpAndLicenseTerms(
          client,
          erc20Address[aeneid],
        );
        // 5. link derivative
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [
            parentIpIdAndLicenseTermsIdForWIP1.parentIpId,
            parentIpIdAndLicenseTermsIdForERC20.parentIpId,
          ],
          licenseTermsIds: [
            parentIpIdAndLicenseTermsIdForWIP1.licenseTermsId,
            parentIpIdAndLicenseTermsIdForERC20.licenseTermsId,
          ],
        });
        expect(result.txHash).to.be.a("string");
        // 6. withdraw all WIP token
        const wipBalance = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
        await client.wipClient.withdraw({
          amount: wipBalance,
        });
      });

      it("should successfully give wip token with insufficient balance and sufficient erc20 token and useMulticallWhenPossible is false", async () => {
        // 1. register a child ip
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        // 2. create parent ip and license terms for WIP
        const parentIpIdAndLicenseTermsIdForWIP1 = await createParentIpAndLicenseTerms(
          client,
          WIP_TOKEN_ADDRESS,
        );
        // 3. create parent ip and license terms for ERC20
        const parentIpIdAndLicenseTermsIdForERC20 = await createParentIpAndLicenseTerms(
          client,
          erc20Address[aeneid],
        );
        // 4. link derivative
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [
            parentIpIdAndLicenseTermsIdForWIP1.parentIpId,
            parentIpIdAndLicenseTermsIdForERC20.parentIpId,
          ],
          licenseTermsIds: [
            parentIpIdAndLicenseTermsIdForWIP1.licenseTermsId,
            parentIpIdAndLicenseTermsIdForERC20.licenseTermsId,
          ],
          options: {
            wipOptions: {
              useMulticallWhenPossible: false,
            },
          },
        });
        expect(result.txHash).to.be.a("string");
      });
    });
  });

  describe("with ERC20 and WIP token fee", () => {
    let licenseTermsIdFor100WIP: bigint;
    let licenseTermsIdFor10ERC20: bigint;
    let spgContractWith100WIP: Address;
    let spgContractWith10ERC20: Address;
    let parentIpIdForWIP: Address;
    let parentIpIdForERC20: Address;
    before(async () => {
      spgContractWith100WIP = (
        await client.nftClient.createNFTCollection({
          name: "100 WIP",
          symbol: "100WIP",
          isPublicMinting: true,
          mintOpen: true,
          mintFeeRecipient: TEST_WALLET_ADDRESS,
          mintFee: 100n,
          mintFeeToken: WIP_TOKEN_ADDRESS,
          contractURI: "",
        })
      ).spgNftContract!;
      spgContractWith10ERC20 = (
        await client.nftClient.createNFTCollection({
          name: "10 ERC20",
          symbol: "10ERC20",
          isPublicMinting: true,
          mintOpen: true,
          mintFeeRecipient: TEST_WALLET_ADDRESS,
          mintFee: 100n,
          mintFeeToken: erc20Address[aeneid],
          contractURI: "",
        })
      ).spgNftContract!;
      const result1 = await client.ipAsset.registerIpAsset({
        nft: { type: "mint", spgNftContract: spgContractWith100WIP },
        licenseTermsData: [
          {
            terms: PILFlavor.commercialRemix({
              defaultMintingFee: 10n,
              commercialRevShare: 10,
              currency: WIP_TOKEN_ADDRESS,
            }),
          },
        ],
      });
      parentIpIdForWIP = result1.ipId!;
      licenseTermsIdFor100WIP = result1.licenseTermsIds![0];
      const result2 = await client.ipAsset.registerIpAsset({
        nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
        licenseTermsData: [
          {
            terms: PILFlavor.commercialRemix({
              defaultMintingFee: 10n,
              commercialRevShare: 10,
              currency: erc20Address[aeneid],
            }),
          },
        ],
      });
      parentIpIdForERC20 = result2.ipId!;
      licenseTermsIdFor10ERC20 = result2.licenseTermsIds![0];
    });
    describe("SpgNftContract with ERC20 token", () => {
      it("should successfully when register ip with license terms data and royalty shares for ERC20", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                defaultMintingFee: 100n,
                commercialRevShare: 10,
                currency: WIP_TOKEN_ADDRESS,
              }),
              licenseTermsId: licenseTermsIdFor10ERC20,
            },
            {
              licenseTermsId: licenseTermsIdFor10ERC20,
            },
          ],
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.232132,
            },
          ],
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register ip with license terms data", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          licenseTermsData: [
            {
              licenseTermsId: licenseTermsIdFor10ERC20,
            },
          ],
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register ip with spgNftContract", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with derivData and royalty shares for ERC20", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          derivData: {
            parentIpIds: [parentIpIdForERC20],
            licenseTermsIds: [licenseTermsIdFor10ERC20],
            maxMintingFee: 10000n,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.232132,
            },
          ],
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with license token ids and derivData", async () => {
        const { licenseTokenIds } = await client.license.mintLicenseTokens({
          licenseTermsId: licenseTermsIdFor10ERC20,
          licensorIpId: parentIpIdForERC20,
          maxMintingFee: 0,
          maxRevenueShare: 100,
        });
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          derivData: {
            parentIpIds: [parentIpIdForERC20],
            licenseTermsIds: [licenseTermsIdFor10ERC20],
          },
          licenseTokenIds: licenseTokenIds,
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with derivData", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          derivData: {
            parentIpIds: [parentIpIdForERC20],
            licenseTermsIds: [licenseTermsIdFor10ERC20],
          },
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when link derivative ip given childIpId and license token ids", async () => {
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [parentIpIdForERC20],
          licenseTermsIds: [licenseTermsIdFor10ERC20],
        });
        expect(result.txHash).to.be.a("string");
      });

      it("should successfully when batch register derivatives", async () => {
        const tokenId1 = await getTokenId();
        const tokenId2 = await getTokenId();
        const childIpId1 = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId1!,
          })
        ).ipId!;
        const childIpId2 = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId2!,
          })
        ).ipId!;
        const { parentIpId: parentIpId1, licenseTermsId: licenseTermsId1 } =
          await createParentIpAndLicenseTerms(client, erc20Address[aeneid]);
        const { parentIpId: parentIpId2, licenseTermsId: licenseTermsId2 } =
          await createParentIpAndLicenseTerms(client, erc20Address[aeneid]);
        const result = await client.ipAsset.batchRegisterDerivatives({
          requests: [
            {
              childIpId: childIpId1,
              parentIpIds: [parentIpId1, parentIpId2],
              licenseTermsIds: [licenseTermsId1, licenseTermsId2],
            },
            {
              childIpId: childIpId2,
              parentIpIds: [parentIpIdForERC20],
              licenseTermsIds: [licenseTermsIdFor10ERC20],
            },
          ],
        });
        expect(result.length).to.equal(2);
        expect(result[0]).to.be.a("string");
      });
    });

    describe("SpgNftContract with WIP token", () => {
      it("should successfully when register ip with license terms data and royalty shares for WIP", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith100WIP },
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                defaultMintingFee: 100n,
                commercialRevShare: 10,
                currency: WIP_TOKEN_ADDRESS,
              }),
            },
            {
              licenseTermsId: licenseTermsIdFor100WIP,
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
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register ip with license terms data", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith100WIP },
          licenseTermsData: [
            {
              terms: PILFlavor.commercialRemix({
                defaultMintingFee: 100n,
                commercialRevShare: 10,
                currency: WIP_TOKEN_ADDRESS,
              }),
            },
          ],
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register ip with spgNftContract", async () => {
        const result = await client.ipAsset.registerIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith100WIP },
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with derivData and royalty shares for WIP", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith100WIP },
          derivData: {
            parentIpIds: [parentIpIdForWIP],
            licenseTermsIds: [licenseTermsIdFor100WIP],
            maxMintingFee: 10000n,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 10.232132,
            },
          ],
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with license token ids and derivData", async () => {
        const { licenseTokenIds } = await client.license.mintLicenseTokens({
          licenseTermsId: licenseTermsIdFor100WIP,
          licensorIpId: parentIpIdForWIP,
          maxMintingFee: 0,
          maxRevenueShare: 100,
        });
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith100WIP },
          derivData: {
            parentIpIds: [parentIpIdForWIP],
            licenseTermsIds: [licenseTermsIdFor100WIP],
          },
          licenseTokenIds: licenseTokenIds,
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with derivData", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith100WIP },
          derivData: {
            parentIpIds: [parentIpIdForWIP],
            licenseTermsIds: [licenseTermsIdFor100WIP],
          },
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when link derivative ip given childIpId and license token ids", async () => {
        const tokenId = await getTokenId();
        const childIpId = (
          await client.ipAsset.register({
            nftContract: mockERC721,
            tokenId: tokenId!,
          })
        ).ipId!;
        const result = await client.ipAsset.linkDerivative({
          childIpId: childIpId,
          parentIpIds: [parentIpIdForWIP],
          licenseTermsIds: [licenseTermsIdFor100WIP],
        });
        expect(result.txHash).to.be.a("string");
      });

      it("should successfully when batch register derivatives", async () => {
        const tokenId1 = await getTokenId();
        const tokenId2 = await getTokenId();
        const registerResponse = await client.ipAsset.batchRegister({
          args: [
            {
              nftContract: mockERC721,
              tokenId: tokenId1!,
            },
            {
              nftContract: mockERC721,
              tokenId: tokenId2!,
            },
          ],
        });
        const childIpId1 = registerResponse.results![0]?.ipId;
        const childIpId2 = registerResponse.results![1]?.ipId;
        const { parentIpId: parentIpId1, licenseTermsId: licenseTermsId1 } =
          await createParentIpAndLicenseTerms(client, WIP_TOKEN_ADDRESS);
        const { parentIpId: parentIpId2, licenseTermsId: licenseTermsId2 } =
          await createParentIpAndLicenseTerms(client, WIP_TOKEN_ADDRESS);
        const result = await client.ipAsset.batchRegisterDerivatives({
          requests: [
            {
              childIpId: childIpId1,
              parentIpIds: [parentIpId1, parentIpId2],
              licenseTermsIds: [licenseTermsId1, licenseTermsId2],
            },
            {
              childIpId: childIpId2,
              parentIpIds: [parentIpIdForWIP],
              licenseTermsIds: [licenseTermsIdFor100WIP],
            },
          ],
        });
        expect(result.length).to.equal(2);
        expect(result[0]).to.be.a("string");
        expect(result[1]).to.be.a("string");
      });
    });

    describe("Mixed ERC20 and WIP token", () => {
      it("should successfully when register derivative ip with derivData and royalty shares for mixed ERC20 and WIP", async () => {
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          derivData: {
            parentIpIds: [parentIpIdForWIP],
            licenseTermsIds: [licenseTermsIdFor100WIP],
          },
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });
      it("should successfully when register derivative ip with license token ids and derivData", async () => {
        const { licenseTokenIds } = await client.license.mintLicenseTokens({
          licenseTermsId: licenseTermsIdFor100WIP,
          licensorIpId: parentIpIdForWIP,
          maxMintingFee: 0,
          maxRevenueShare: 100,
        });
        const result = await client.ipAsset.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: spgContractWith10ERC20 },
          derivData: {
            parentIpIds: [parentIpIdForWIP],
            licenseTermsIds: [licenseTermsIdFor100WIP],
          },
          licenseTokenIds: licenseTokenIds,
        });
        expect(result.txHash).to.be.a("string");
        expect(result.ipId).to.be.a("string");
        expect(result.tokenId).to.be.a("bigint");
      });

      it("should successfully when batch register derivatives", async () => {
        const tokenId1 = await getTokenId();
        const tokenId2 = await getTokenId();
        const tokenId3 = await getTokenId();
        const registerResponse = await client.ipAsset.batchRegister({
          args: [
            {
              nftContract: mockERC721,
              tokenId: tokenId1!,
            },
            {
              nftContract: mockERC721,
              tokenId: tokenId2!,
            },
            {
              nftContract: mockERC721,
              tokenId: tokenId3!,
            },
          ],
        });
        const childIpId1 = registerResponse.results![0]?.ipId;
        const childIpId2 = registerResponse.results![1]?.ipId;
        const childIpId3 = registerResponse.results![2]?.ipId;
        const { parentIpId: parentIpId1, licenseTermsId: licenseTermsId1 } =
          await createParentIpAndLicenseTerms(client, erc20Address[aeneid]);
        const { parentIpId: parentIpId2, licenseTermsId: licenseTermsId2 } =
          await createParentIpAndLicenseTerms(client, WIP_TOKEN_ADDRESS);
        const result = await client.ipAsset.batchRegisterDerivatives({
          requests: [
            {
              childIpId: childIpId1,
              parentIpIds: [parentIpId1, parentIpId2],
              licenseTermsIds: [licenseTermsId1, licenseTermsId2],
            },
            {
              childIpId: childIpId2,
              parentIpIds: [parentIpIdForWIP],
              licenseTermsIds: [licenseTermsIdFor100WIP],
            },
            {
              childIpId: childIpId3,
              parentIpIds: [parentIpIdForWIP],
              licenseTermsIds: [licenseTermsIdFor100WIP],
            },
          ],
        });
        expect(result.length).to.equal(3);
      });
    });
  });
});
