import chai from "chai";
import { StoryClient, PIL_TYPE } from "../../src";
import { Address, Hex, toHex, zeroAddress } from "viem";
import chaiAsPromised from "chai-as-promised";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  mintBySpg,
  odyssey,
  approveForLicenseToken,
} from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import { derivativeWorkflowsAddress } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("IP Asset Functions ", () => {
  let client: StoryClient;
  let noCommercialLicenseTermsId: bigint;
  let parentIpId: Hex;
  before(async () => {
    client = getStoryClient();
    const res = await client.license.registerNonComSocialRemixingPIL({
      txOptions: {
        waitForTransaction: true,
      },
    });
    noCommercialLicenseTermsId = res.licenseTermsId!;
  });

  describe("Create IP Asset", async () => {
    let childIpId: Hex;
    it("should not throw error when register a IP Asset", async () => {
      const tokenId = await getTokenId();
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;
      if (waitForTransaction) {
        expect(response.ipId).to.be.a("string").and.not.empty;
        childIpId = response.ipId;
      }
    });

    it("should not throw error when register derivative", async () => {
      const tokenId = await getTokenId();
      parentIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const response = await client.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: [parentIpId],
        licenseTermsIds: [noCommercialLicenseTermsId],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when register derivative with license tokens", async () => {
      const tokenId = await getTokenId();
      const ipId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: noCommercialLicenseTermsId,
        licensorIpId: parentIpId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const response = await client.ipAsset.registerDerivativeWithLicenseTokens({
        childIpId: ipId,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });

    it("should return true if IP asset is registered", async () => {
      const isRegistered = await client.ipAsset.isRegistered(parentIpId);
      expect(isRegistered).to.be.true;
    });

    it("should return false if IP asset is not registered", async () => {
      const unregisteredIpId = "0x1234567890123456789012345678901234567890";
      const isRegistered = await client.ipAsset.isRegistered(unregisteredIpId);
      expect(isRegistered).to.be.false;
    });
  });

  describe("NFT Client (SPG)", () => {
    let nftContract: Hex;
    let parentIpId: Hex;
    let licenseTermsId: bigint;
    before(async () => {
      // Create a NFT collection for this test-suite
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: process.env.TEST_WALLET_ADDRESS! as Address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.spgNftContract).to.be.a("string").and.not.empty;
      nftContract = txData.spgNftContract!;

      const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: nftContract,
        pilType: PIL_TYPE.COMMERCIAL_REMIX,
        commercialRevShare: 10,
        mintingFee: "100",
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      parentIpId = result.ipId!;
      licenseTermsId = result.licenseTermsId!;
      const mockERC20 = new MockERC20();
      await mockERC20.approve(derivativeWorkflowsAddress[odyssey]);
      await mockERC20.mint();
    });

    describe("should not throw error when mint and register ip and attach pil terms", async () => {
      it("Non-Commercial Remix", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: nftContract,
          pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
            nftMetadataURI: "test-nft-uri",
          },
          txOptions: { waitForTransaction: true },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });
      it("Commercial Use", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: nftContract,
          pilType: PIL_TYPE.COMMERCIAL_USE,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });

      it("Commercial Remix", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });
      it("should get the related log when createIpAssetWithPilTerms given waitForTransaction is true ", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
        expect(result.ipId).to.be.a("string").and.not.empty;
        expect(result.tokenId).to.be.a("bigint");
        expect(result.licenseTermsId).to.be.a("bigint");
      });
    });
    it("should not throw error when register a IP Asset given metadata", async () => {
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
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.ipId).to.be.a("string").and.not.empty;
    });
    it("should not throw error when register derivative ip", async () => {
      const tokenChildId = await mintBySpg(nftContract, "test-metadata");
      const result = await client.ipAsset.registerDerivativeIp({
        nftContract: nftContract,
        tokenId: tokenChildId!,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
        },
        deadline: 1000n,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });

    it("should not throw error when register ip and attach pil terms", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const deadline = 1000n;
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: nftContract,
        tokenId: tokenId!,
        deadline,
        pilType: PIL_TYPE.COMMERCIAL_USE,
        mintingFee: "100",
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should not throw error when mint and register ip and make derivative", async () => {
      const result = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: nftContract,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
        },
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.childIpId).to.be.a("string").and.not.empty;
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should not throw error when mint and register ip", async () => {
      const result = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: nftContract,
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });
    it("should not throw error when call register pil terms and attach", async () => {
      const tokenId = await getTokenId();
      const ipId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const result = await client.ipAsset.registerPilTermsAndAttach({
        ipId: parentIpId,
        terms: {
          transferable: true,
          royaltyPolicy: zeroAddress,
          defaultMintingFee: BigInt(1),
          expiration: BigInt(0),
          commercialUse: false,
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
          currency: MockERC20.address,
          uri: "",
        },
        deadline: 1000n,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when call mint and register ip and make derivative with license tokens", async () => {
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: noCommercialLicenseTermsId,
        licensorIpId: parentIpId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      await approveForLicenseToken(
        derivativeWorkflowsAddress[odyssey],
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
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
      expect(result.tokenId).to.be.a("bigint");
    });

    it("should not throw error when call register ip and make derivative with license tokens", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: noCommercialLicenseTermsId,
        licensorIpId: parentIpId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      await approveForLicenseToken(
        derivativeWorkflowsAddress[odyssey],
        mintLicenseTokensResult.licenseTokenIds![0],
      );
      const result = await client.ipAsset.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: nftContract,
        tokenId: tokenId!,
        licenseTokenIds: [mintLicenseTokensResult.licenseTokenIds![0]],
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        deadline: 1000n,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });
  });

  describe("Multicall", () => {
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
        txOptions: {
          waitForTransaction: true,
        },
      });
      nftContract = txData.spgNftContract!;
    });
    it("should not throw error when call batch register derivative", async () => {
      const childTokenId = await getTokenId();
      const childIpId = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const childTokenId2 = await getTokenId();
      const childIpId2 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: childTokenId2!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
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
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });
    it("should not throw error when call batch mint and register ip asset with pil terms", async () => {
      const result = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract: nftContract,
            pilType: PIL_TYPE.COMMERCIAL_REMIX,
            commercialRevShare: 10,
            mintingFee: "100",
            currency: MockERC20.address,
          },
          {
            spgNftContract: nftContract,
            pilType: PIL_TYPE.COMMERCIAL_REMIX,
            commercialRevShare: 10,
            mintingFee: "100",
            currency: MockERC20.address,
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").and.not.empty;
    });

    it("should not throw error when call batch mint and register ip asset and make derivative", async () => {
      const tokenId2 = await getTokenId();
      const parentIpId2 = (
        await client.ipAsset.register({
          nftContract: mockERC721,
          tokenId: tokenId2!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const result = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract: nftContract,
            derivData: {
              parentIpIds: [parentIpId!],
              licenseTermsIds: [noCommercialLicenseTermsId!],
            },
          },
          {
            spgNftContract: nftContract,
            derivData: {
              parentIpIds: [parentIpId2!],
              licenseTermsIds: [noCommercialLicenseTermsId!],
            },
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").and.not.empty;
    });

    it("should not throw error when call batch register giving parameters without ipMetadata", async () => {
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
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.results).to.be.an("array").and.not.empty;
      expect(result.txHash).to.be.a("string").and.not.empty;
    });
  });
});
