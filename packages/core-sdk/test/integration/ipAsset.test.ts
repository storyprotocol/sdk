import chai from "chai";
import { StoryClient } from "../../src";
import { Hex, toBytes, toHex } from "viem";
import chaiAsPromised from "chai-as-promised";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./utils/util";
import { PIL_TYPE } from "../../src/types/resources/license";

chai.use(chaiAsPromised);
const expect = chai.expect;

let parentIpId: Hex;
let childIpId: Hex;
let noCommercialLicenseTermsId: string;
describe("IP Asset Functions ", () => {
  let client: StoryClient;
  before(async function () {
    client = getStoryClientInSepolia();
    const registerResult = await client.license.registerNonComSocialRemixingPIL({
      txOptions: {
        waitForTransaction: true,
      },
    });
    noCommercialLicenseTermsId = registerResult.licenseTermsId!;
  });

  describe.skip("Create IP Asset", async function () {
    it("should not throw error when registering a IP Asset", async () => {
      const tokenId = await getTokenId();
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.register({
          tokenContract: MockERC721,
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
          tokenContract: MockERC721,
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
      const response = await expect(
        client.ipAsset.registerDerivative({
          childIpId: childIpId,
          parentIpIds: [parentIpId],
          licenseTermsIds: [noCommercialLicenseTermsId],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when registering derivative with license tokens", async () => {
      const tokenId = await getTokenId();
      const ipId = (
        await client.ipAsset.register({
          tokenContract: MockERC721,
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
      const response = await expect(
        client.ipAsset.registerDerivativeWithLicenseTokens({
          childIpId: ipId,
          licenseTokenIds: [mintLicenseTokensResult.licenseTokenId!],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
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
        mintCost: 0n,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(txData.nftContract).to.be.a("string").and.not.empty;
      nftContract = txData.nftContract;
    });

    describe("should not throw error when mint and register ip and attach pil terms", async () => {
      it("Non-Commercial Remix", async () => {
        const txHash = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
        });
        expect(txHash).to.be.a("string").and.not.empty;
      });

      it("Commercial Use", async () => {
        const txHash = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_USE,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: "0xB132A6B7AE652c974EE1557A3521D53d18F6739f",
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
        });
        expect(txHash).to.be.a("string").and.not.empty;
      });

      it("Commercial Remix", async () => {
        const txHash = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: "0xB132A6B7AE652c974EE1557A3521D53d18F6739f",
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
        });
        expect(txHash).to.be.a("string").and.not.empty;
      });
    });
  });
  // describe("SPG", () => {
  //   it("should not throw error when mint and register ip and attach pil terms", async () => {
  //     const txHash = await client.ipAsset.mintAndRegisterIpAndAttachPilTerms({
  //       nftContract: "0x861554A6C750E0442f5e750B90Ca7eb80cbaED3F",
  //       pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
  //       metadata: {
  //         metadataURI: "test-uri",
  //         metadata: "test-metadata-hash",
  //         nftMetadata: "test-nft-metadata-hash",
  //       },
  //     });
  //     console.log("txHash: ", txHash);
  //     expect(txHash).to.be.a("string").and.not.empty;
  //   });

  //   it.skip("should not throw error when register derivative ip", async () => {
  //     const tokenId = await getTokenId();
  //     const txHash = await client.ipAsset.registerDerivativeIp({
  //       nftContract: MockERC721,
  //       tokenId: tokenId!,
  //       derivData: {
  //         parentIpIds: [parentIpId],
  //         licenseTermsIds: [noCommercialLicenseTermsId],
  //       },
  //       sigRegister: {
  //         signature: toHex(toBytes("test-signature")),
  //         signer: "0x861554A6C750E0442f5e750B90Ca7eb80cbaED3F",
  //         deadline: "2022-12-12",
  //       },
  //     });
  //     console.log("txHash: ", txHash);
  //     expect(txHash).to.be.a("string").and.not.empty;
  //   });
  // });
});
