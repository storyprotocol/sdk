import chai from "chai";
import { StoryClient } from "../../src";
import { Address, Hex, encodeFunctionData, getAddress } from "viem";
import chaiAsPromised from "chai-as-promised";
import { MockERC721, getDeadline, getStoryClientInSepolia, getTokenId } from "./utils/util";
import { PIL_TYPE } from "../../src/types/resources/license";
import { MockERC20 } from "./utils/mockERC20";
import { privateKeyToAccount } from "viem/accounts";
import {
  accessControllerAbi,
  accessControllerAddress,
  licensingModuleAddress,
  spgAddress,
} from "../../src/abi/generated";
const sepoliaChainId = 11155111;

chai.use(chaiAsPromised);
const expect = chai.expect;

let parentIpId: Hex;
let childIpId: Hex;
let noCommercialLicenseTermsId: bigint;
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

  describe("NFT Client (SPG)", () => {
    const permissionAddress = accessControllerAddress[sepoliaChainId];
    const spContractAddress = spgAddress[sepoliaChainId];
    const licensingContractModuleAddress = licensingModuleAddress[sepoliaChainId];
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
        const result = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });

      it("Commercial Use", async () => {
        const result = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_USE,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });

      it("Commercial Remix", async () => {
        const result = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
        });
        expect(result.txHash).to.be.a("string").and.not.empty;
      });
      it("should get the related log when createIpAssetWithPilTerms given waitForTransaction is true ", async () => {
        const result = await client.ipAsset.createIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          metadata: {
            metadataURI: "test-uri",
            metadata: "test-metadata-hash",
            nftMetadata: "test-nft-metadata-hash",
          },
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

    it.skip("should not throw error when register registerDerivativeIp", async () => {
      const tokenChildId = await getTokenId(nftContract);
      const tokenParentId = await getTokenId(nftContract);
      const noCommercialLicenseTermsId = (
        await client.license.registerNonComSocialRemixingPIL({
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).licenseTermsId!;
      const parentIpId = (
        await client.ipAsset.register({
          tokenContract: nftContract,
          tokenId: tokenParentId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const childIpId = (
        await client.ipAsset.register({
          tokenContract: nftContract,
          tokenId: tokenChildId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const account = privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex);
      const deadline = await getDeadline();
      const sigMetadata = await account.signTypedData({
        domain: {
          name: "Story Protocol IP Account",
          version: "1",
          chainId: sepoliaChainId,
          verifyingContract: childIpId,
        },
        types: {
          Execute: [
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Execute",
        message: {
          to: permissionAddress,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: accessControllerAbi,
            functionName: "setPermission",
            args: [
              getAddress(childIpId),
              getAddress(spContractAddress),
              getAddress("0x2ac240293f12032E103458451dE8A8096c5A72E8"),
              "0x00000000" as Hex,
              1,
            ],
          }),
          nonce: 1n,
          deadline: BigInt(deadline),
        },
      });
      const sigRegister = await account.signTypedData({
        domain: {
          name: "Story Protocol IP Account",
          version: "1",
          chainId: sepoliaChainId,
          verifyingContract: childIpId,
        },
        types: {
          Execute: [
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Execute",
        message: {
          to: permissionAddress,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: accessControllerAbi,
            functionName: "setPermission",
            args: [
              getAddress(childIpId),
              getAddress(spContractAddress),
              getAddress(licensingContractModuleAddress),
              "0x00000000" as Hex,
              1,
            ],
          }),
          nonce: 2n,
          deadline: BigInt(deadline),
        },
      });
      const txHash = await client.ipAsset.registerDerivativeIp({
        nftContract: nftContract,
        tokenId: tokenChildId!,
        derivData: {
          parentIpIds: [parentIpId],
          licenseTermsIds: [noCommercialLicenseTermsId],
        },
        metadata: {
          metadataURI: "test-uri",
          metadata: "test-metadata-hash",
          nftMetadata: "test-nft-metadata-hash",
        },
        sigMetadata: {
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
          deadline: deadline,
          signature: sigMetadata,
        },
        sigRegister: {
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
          deadline: deadline,
          signature: sigRegister,
        },
      });
      expect(txHash).to.be.a("string").and.not.empty;
    });
  });
});
