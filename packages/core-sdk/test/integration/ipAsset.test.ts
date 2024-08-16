import chai from "chai";
import { StoryClient, PIL_TYPE } from "../../src";
import { Hex, toHex } from "viem";
import chaiAsPromised from "chai-as-promised";
import { mockERC721, getStoryClient, getTokenId, mintBySpg } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("IP Asset Functions ", () => {
  let client: StoryClient;
  before(async () => {
    client = getStoryClient();
  });

  describe("Create IP Asset", async () => {
    let parentIpId: Hex;
    let childIpId: Hex;
    let noCommercialLicenseTermsId: bigint;
    before(async () => {
      const res = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      noCommercialLicenseTermsId = res.licenseTermsId!;
    });
    it("should not throw error when registering a IP Asset", async () => {
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

    it("should not throw error when registering derivative", async () => {
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

    it("should not throw error when registering derivative with license tokens", async () => {
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
  });

  describe("NFT Client (SPG)", () => {
    let nftContract: Hex;

    before(async () => {
      // Create a NFT collection for this test-suite
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.nftContract).to.be.a("string").and.not.empty;
      nftContract = txData.nftContract!;
    });

    describe("should not throw error when mint and register ip and attach pil terms", async () => {
      it("Non-Commercial Remix", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
          ipMetadata: {
            metadataURI: "test-uri",
            metadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });
      it("Commercial Use", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_USE,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          ipMetadata: {
            metadataURI: "test-uri",
            metadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });

      it("Commercial Remix", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          ipMetadata: {
            metadataURI: "test-uri",
            metadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });
      it("should get the related log when createIpAssetWithPilTerms given waitForTransaction is true ", async () => {
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
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
    it.skip("should not throw error when registering a IP Asset given metadata", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const response = await client.ipAsset.register({
        nftContract,
        tokenId: tokenId!,
        ipMetadata: {
          metadataURI: "test-uri",
          metadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        deadline: 1000n,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.ipId).to.be.a("string").and.not.empty;
    });
    it.skip("should not throw error when register registerDerivativeIp", async () => {
      const tokenChildId = await mintBySpg(nftContract, "test-metadata");
      const { ipId: parentIpId, licenseTermsId } =
        await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          txOptions: {
            waitForTransaction: true,
          },
        });
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

    it.skip("should not throw error when register registerIpAndAttachPilTerms", async () => {
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
  });
});
