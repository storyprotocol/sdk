import chai from "chai";
import { StoryClient } from "../../src";
import { Hex, encodeFunctionData, getAddress, toFunctionSelector, Address, toHex } from "viem";
import chaiAsPromised from "chai-as-promised";
import { MockERC721, getBlockTimestamp, getStoryClientInSepolia, getTokenId } from "./utils/util";
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

describe("IP Asset Functions ", () => {
  let client: StoryClient;
  before(async function () {
    client = getStoryClientInSepolia();
  });

  describe("Create IP Asset", async function () {
    let parentIpId: Hex;
    let childIpId: Hex;
    let noCommercialLicenseTermsId: bigint;
    before(async () => {
      const registerResult = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      noCommercialLicenseTermsId = registerResult.licenseTermsId!;
    });
    it("should not throw error when registering a IP Asset", async () => {
      const tokenId = await getTokenId();
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.register({
          nftContract: MockERC721,
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
          nftContract: MockERC721,
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
          nftContract: MockERC721,
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
    const licensingContractModuleAddress = licensingModuleAddress[sepoliaChainId];
    const coreMetadataModuleAddress = "0xDa498A3f7c8a88cb72201138C366bE3778dB9575";
    const getPermissionSignatureForSpg = async (params: {
      ipId: Address;
      moduleAddress: Address;
      deadline: bigint;
      nonce: bigint;
      selectorHash: Hex;
    }) => {
      const { ipId, moduleAddress, deadline, nonce, selectorHash } = params;
      const permissionAddress = accessControllerAddress[sepoliaChainId];
      const spContractAddress = spgAddress[sepoliaChainId];
      const account = privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Address);
      return await account.signTypedData({
        domain: {
          name: "Story Protocol IP Account",
          version: "1",
          chainId: sepoliaChainId,
          verifyingContract: ipId,
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
              getAddress(ipId),
              getAddress(spContractAddress),
              getAddress(moduleAddress),
              selectorHash,
              1,
            ],
          }),
          nonce,
          deadline,
        },
      });
    };
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
        const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
          metadata: {
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
          metadata: {
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
          metadata: {
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
          metadata: {
            metadataURI: "test-uri",
            metadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
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

    it("should not throw error when register registerDerivativeIp", async () => {
      const tokenChildId = await getTokenId(nftContract);
      const { ipId: parentIpId, licenseTermsId } =
        await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          nftContract,
          pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
          commercialRevShare: 10,
          mintingFee: "100",
          currency: MockERC20.address,
          metadata: {
            metadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          txOptions: {
            waitForTransaction: true,
          },
        });
      const childIpId = await client.ipAsset.getIpIdAddress(nftContract, tokenChildId!);
      const deadline = (await getBlockTimestamp()) + 1000n;
      const sigMetadata = await getPermissionSignatureForSpg({
        ipId: childIpId,
        moduleAddress: coreMetadataModuleAddress,
        deadline,
        nonce: 1n,
        selectorHash: toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
      });
      const sigRegister = await getPermissionSignatureForSpg({
        ipId: childIpId,
        moduleAddress: licensingContractModuleAddress,
        deadline,
        nonce: 2n,
        selectorHash: toFunctionSelector(
          "function registerDerivative(address,address[],uint256[],address,bytes)",
        ),
      });
      const result = await client.ipAsset.registerDerivativeIp({
        nftContract: nftContract,
        tokenId: tokenChildId!,
        derivData: {
          parentIpIds: [parentIpId!],
          licenseTermsIds: [licenseTermsId!],
        },
        metadata: {
          metadataURI: "test-uri",
          metadataHash: toHex("test-metadata-hash", { size: 32 }),
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
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
    });

    it("should not throw error when register registerIpAndAttachPilTerms", async () => {
      const tokenId = await getTokenId(nftContract);
      const ipId = await client.ipAsset.getIpIdAddress(nftContract, tokenId!);
      const deadline = (await getBlockTimestamp()) + 1000n;
      const sigMetadata = await getPermissionSignatureForSpg({
        ipId,
        moduleAddress: coreMetadataModuleAddress,
        deadline,
        nonce: 1n,
        selectorHash: toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
      });
      const sigAttach = await getPermissionSignatureForSpg({
        ipId,
        moduleAddress: licensingModuleAddress[sepoliaChainId],
        deadline,
        nonce: 2n,
        selectorHash: toFunctionSelector("function attachLicenseTerms(address,address,uint256)"),
      });
      const result = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: nftContract,
        tokenId: tokenId!,
        metadata: {
          metadataURI: "test-uri",
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
        },
        sigMetadata: {
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
          deadline,
          signature: sigMetadata,
        },
        sigAttach: {
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
          deadline,
          signature: sigAttach,
        },
        pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
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
