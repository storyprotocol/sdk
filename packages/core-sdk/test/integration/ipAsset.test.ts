import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Hex } from "viem";

import { StoryClient } from "../../src";
import { PIL_TYPE } from "../../src/types/resources/license";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./util";

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

  describe("Create IP Asset", async function () {
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

  describe("SPG", () => {
    let nftContract: Hex;

    before(async () => {
      // Create a SPG NFT collection for this test-suite
      const txData = await client.spg.createSPGNFTCollection({
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

    it("should not throw error when mint and register ip and attach pil terms", async () => {
      const txHash = await client.ipAsset.mintAndRegisterIpAndAttachPilTerms({
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
  });
});
