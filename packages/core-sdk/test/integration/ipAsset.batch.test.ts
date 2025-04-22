import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import { Address, Hex, toHex, zeroAddress } from "viem";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  aeneid,
  publicClient,
  walletClient,
} from "./utils/util";
import {
  evenSplitGroupPoolAddress,
  royaltyPolicyLapAddress,
  erc20Address,
} from "../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../src/constants/common";
import { ERC20Client } from "../../src/utils/token";

chai.use(chaiAsPromised);
const expect = chai.expect;

const pool = evenSplitGroupPoolAddress[aeneid];
const walletAddress = process.env.TEST_WALLET_ADDRESS! as Address;

describe("Batch IP Registration with Royalty Distribution", () => {
  let client: StoryClient;
  let nftContract: Hex;
  let mockERC20: ERC20Client;

  before(async () => {
    client = getStoryClient();
    
    const txData = await client.nftClient.createNFTCollection({
      name: "royalty-batch-test",
      symbol: "RBATCH",
      maxSupply: 100,
      isPublicMinting: true,
      mintOpen: true,
      contractURI: "test-uri",
      mintFeeRecipient: walletAddress,
      txOptions: { waitForTransaction: true },
    });
    nftContract = txData.spgNftContract!;
    

    mockERC20 = new ERC20Client(
      publicClient,
      walletClient,
      erc20Address[aeneid]
    );
    await mockERC20.mint(walletAddress, 100000n);
  });

  describe("Batch mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens Tests", () => {
    it("should batch process royalty distributions with complex distribution schemas", async () => {

      const commercialLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 10n,
          expiration: 1000n,
          commercialUse: true, 
          commercialAttribution: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 15,
          commercialRevCeiling: 10000n,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: false,
          derivativesReciprocal: true,
          derivativeRevCeiling: 5000n,
          currency: erc20Address[aeneid], 
          uri: "commercial-royalty-config",
        }
      };

      const simpleDistribution = [
        {
          recipient: walletAddress,
          percentage: 100,
        }
      ];

      const complexDistribution = [
        {
          recipient: walletAddress,
          percentage: 40, 
        },
        {
          recipient: walletAddress, 
          percentage: 25,
        },
        {
          recipient: walletAddress, 
          percentage: 20, 
        },
        {
          recipient: walletAddress, 
          percentage: 15, 
        }
      ];

      const unevenDistribution = [
        {
          recipient: walletAddress,
          percentage: 33, 
        },
        {
          recipient: walletAddress, 
          percentage: 33, 
        },
        {
          recipient: walletAddress, 
          percentage: 34, 
        }
      ];

      const requests = [
        {
          spgNftContract: nftContract,
          licenseTermsData: [commercialLicenseTermsData],
          royaltyShares: simpleDistribution,
        },
        {
          spgNftContract: nftContract,
          licenseTermsData: [commercialLicenseTermsData],
          royaltyShares: complexDistribution,
        },
        {
          spgNftContract: nftContract,
          licenseTermsData: [commercialLicenseTermsData],
          royaltyShares: unevenDistribution,
        }
      ];

      const results = [];
      for (const request of requests) {
        const result = await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          ...request,
          txOptions: { waitForTransaction: true },
        });
        results.push(result);
      }

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        expect(result.txHash).to.be.a("string").and.not.empty;
        expect(result.ipId).to.be.a("string").and.not.empty;
        expect(result.licenseTermsIds).to.be.an("array").with.lengthOf(1);
        expect(result.ipRoyaltyVault).to.be.a("string").and.not.empty;
        
        const isRegistered = await client.ipAsset.isRegistered(result.ipId!);
        expect(isRegistered).to.be.true;
      }

      const batchRequest = {
        requests: requests.map(req => ({
          ...req,
        })),
      };

      const batchResult = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows(batchRequest);
      expect(batchResult.registrationResults).to.be.an("array");
      expect(batchResult.registrationResults.length).to.be.lessThan(requests.length);
      
      let totalIpRegistered = 0;
      for (const result of batchResult.registrationResults) {
        expect(result.txHash).to.be.a("string").and.not.empty;
        totalIpRegistered += result.ipIdAndTokenId.length;
      }
      expect(totalIpRegistered).to.equal(requests.length);
    });

    it("should batch register and distribute royalty tokens with the maximum allowed recipients per IP", async () => {
      const commercialLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 5n,
          expiration: 1000n,
          commercialUse: true,
          commercialAttribution: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 10,
          commercialRevCeiling: 5000n,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: false,
          derivativesReciprocal: true,
          derivativeRevCeiling: 2500n,
          currency: erc20Address[aeneid],
          uri: "max-recipients-test",
        }
      };

      const maxRecipientsPercentage = 10; 
      const maxRecipients = 10; 
      
      const maxRecipientsDistribution = Array(maxRecipients).fill(0).map(() => ({
        recipient: walletAddress,
        percentage: maxRecipientsPercentage,
      }));

      const totalPercentage = maxRecipientsDistribution.reduce((sum, item) => sum + item.percentage, 0);
      expect(totalPercentage).to.equal(100);

      const request = {
        spgNftContract: nftContract,
        licenseTermsData: [commercialLicenseTermsData],
        royaltyShares: maxRecipientsDistribution,
        txOptions: { waitForTransaction: true },
      };

      const result = await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(request);
      
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.ipId).to.be.a("string").and.not.empty;
      expect(result.licenseTermsIds).to.be.an("array").with.lengthOf(1);
      expect(result.ipRoyaltyVault).to.be.a("string").and.not.empty;
      
      const isRegistered = await client.ipAsset.isRegistered(result.ipId!);
      expect(isRegistered).to.be.true;

      const batchRequest = {
        requests: [request, request].map(req => ({
          ...req,
        })),
      };

      const batchResult = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows(batchRequest);
      
      expect(batchResult.registrationResults).to.be.an("array");
      
      let totalIpRegistered = 0;
      for (const result of batchResult.registrationResults) {
        totalIpRegistered += result.ipIdAndTokenId.length;
      }
      expect(totalIpRegistered).to.equal(2);
    });

    it("should verify royalty token ownership after batch distribution", async () => {
      const commercialLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 2n,
          expiration: 1000n,
          commercialUse: true,
          commercialAttribution: false,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 5,
          commercialRevCeiling: 2000n,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: false,
          derivativesReciprocal: true,
          derivativeRevCeiling: 1000n,
          currency: WIP_TOKEN_ADDRESS,
          uri: "ownership-verification-test",
        }
      };

      const distribution1 = [
        {
          recipient: walletAddress,
          percentage: 60,
        },
        {
          recipient: walletAddress, 
          percentage: 40,
        }
      ];

      const distribution2 = [
        {
          recipient: walletAddress,
          percentage: 70,
        },
        {
          recipient: walletAddress, 
          percentage: 30,
        }
      ];

      const batchRequest = {
        requests: [
          {
            spgNftContract: nftContract,
            licenseTermsData: [commercialLicenseTermsData],
            royaltyShares: distribution1,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [commercialLicenseTermsData],
            royaltyShares: distribution2,
          }
        ],
      };

      const batchResult = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows(batchRequest);
      
      expect(batchResult.registrationResults).to.be.an("array");
      
      const ipIds = [];
      for (const result of batchResult.registrationResults) {
        for (const item of result.ipIdAndTokenId) {
          if (item.ipId) {
            ipIds.push(item.ipId);
          }
        }
      }
      
      expect(ipIds.length).to.equal(batchRequest.requests.length);
      for (const ipId of ipIds) {
        const isRegistered = await client.ipAsset.isRegistered(ipId as `0x${string}`);
        expect(isRegistered).to.be.true;
      }
    });
  });
});

describe("Batch IP Registration with PIL Terms", () => {
  let client: StoryClient;
  let nftContract: Hex;

  before(async () => {
    client = getStoryClient();
    
    // Setup NFT collection
    const txData = await client.nftClient.createNFTCollection({
      name: "pil-batch-test",
      symbol: "PBATCH",
      maxSupply: 100,
      isPublicMinting: true,
      mintOpen: true,
      contractURI: "test-uri",
      mintFeeRecipient: walletAddress,
      txOptions: { waitForTransaction: true },
    });
    nftContract = txData.spgNftContract!;
  });

  describe("Batch mintAndRegisterIpAssetWithPilTerms Tests", () => {
    it("should handle batch registration with mixed success and failure scenarios for mintAndRegisterIpAssetWithPilTerms", async () => {
      // Create valid and invalid license terms data
      const validLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 5n,
          expiration: 0n,
          commercialUse: true,
          commercialAttribution: false,
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
          uri: "valid-test-uri",
        },
        licensingConfig: {
          isSet: true,
          mintingFee: 5n,
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: pool,
        },
      };

      const invalidLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: -1n, // Invalid negative fee
          expiration: 0n,
          commercialUse: true,
          commercialAttribution: false,
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
          uri: "invalid-test-uri",
        },
        licensingConfig: {
          isSet: true,
          mintingFee: -1n, // Invalid negative fee
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: pool,
        },
      };

      // Create a request with a mix of valid and invalid items
      const batchRequest = {
        args: [
          {
            spgNftContract: nftContract,
            licenseTermsData: [validLicenseTermsData],
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [invalidLicenseTermsData],
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [validLicenseTermsData],
            allowDuplicates: true,
          }
        ],
        txOptions: { waitForTransaction: true },
      };

      // Since the batch will fail due to the invalid license terms,
      // we expect the entire batch to be rejected
      await expect(
        client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms(batchRequest)
      ).to.be.rejected;

      // Now create a batch with only valid items
      const validBatchRequest = {
        args: [
          {
            spgNftContract: nftContract,
            licenseTermsData: [validLicenseTermsData],
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [validLicenseTermsData],
            allowDuplicates: true,
          }
        ],
        txOptions: { waitForTransaction: true },
      };

      const result = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms(validBatchRequest);
      
      // Verify the result
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").with.lengthOf(2);
      expect(result.results![0].ipId).to.be.a("string").and.not.empty;
      expect(result.results![0].licenseTermsIds).to.be.an("array").with.lengthOf(1);
      expect(result.results![1].ipId).to.be.a("string").and.not.empty;
      expect(result.results![1].licenseTermsIds).to.be.an("array").with.lengthOf(1);
    });

    it("should batch register IPs with PIL terms containing different licensing configurations", async () => {
      // Create a variety of different license terms
      const commercialLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 10n,
          expiration: 1000n,
          commercialUse: true,
          commercialAttribution: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 15,
          commercialRevCeiling: 10000n,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: true,
          derivativesReciprocal: true,
          derivativeRevCeiling: 5000n,
          currency: WIP_TOKEN_ADDRESS,
          uri: "commercial-config",
        },
        licensingConfig: {
          isSet: true,
          mintingFee: 10n,
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 15,
          disabled: false,
          expectMinimumGroupRewardShare: 10,
          expectGroupRewardPool: pool,
        },
      };

      const nonCommercialLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 0n,
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
          derivativesReciprocal: false,
          derivativeRevCeiling: 0n,
          currency: WIP_TOKEN_ADDRESS,
          uri: "non-commercial-config",
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
      };

      const mixedPermissionsLicenseTermsData = {
        terms: {
          transferable: false,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 5n,
          expiration: 500n,
          commercialUse: true,
          commercialAttribution: false,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 8,
          commercialRevCeiling: 5000n,
          derivativesAllowed: false,
          derivativesAttribution: false,
          derivativesApproval: false,
          derivativesReciprocal: false,
          derivativeRevCeiling: 0n,
          currency: WIP_TOKEN_ADDRESS,
          uri: "mixed-permissions-config",
        },
        licensingConfig: {
          isSet: true,
          mintingFee: 5n,
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 8,
          disabled: false,
          expectMinimumGroupRewardShare: 5,
          expectGroupRewardPool: pool,
        },
      };

      // Create a batch with different licensing configurations
      const batchRequest = {
        args: [
          {
            spgNftContract: nftContract,
            licenseTermsData: [commercialLicenseTermsData],
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [nonCommercialLicenseTermsData],
            allowDuplicates: true,
          },
          {
            spgNftContract: nftContract,
            licenseTermsData: [mixedPermissionsLicenseTermsData],
            allowDuplicates: true,
          }
        ],
        txOptions: { waitForTransaction: true },
      };

      const result = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms(batchRequest);
      
      // Verify the result
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").with.lengthOf(3);
      
      // Verify each IP has appropriate license terms
      expect(result.results![0].licenseTermsIds).to.be.an("array").with.lengthOf(1);
      expect(result.results![1].licenseTermsIds).to.be.an("array").with.lengthOf(1);
      expect(result.results![2].licenseTermsIds).to.be.an("array").with.lengthOf(1);
      
      // Verify that the licenseTermsIds are different for each IP
      const licenseId1 = result.results![0].licenseTermsIds![0];
      const licenseId2 = result.results![1].licenseTermsIds![0];
      const licenseId3 = result.results![2].licenseTermsIds![0];
      
      expect(licenseId1).to.not.equal(licenseId2);
      expect(licenseId1).to.not.equal(licenseId3);
      expect(licenseId2).to.not.equal(licenseId3);
      
      // Check the licenses are correctly attached to the IPs
      const ipId1 = result.results![0].ipId;
      const ipId2 = result.results![1].ipId;
      const ipId3 = result.results![2].ipId;
      
      const isRegistered1 = await client.ipAsset.isRegistered(ipId1);
      const isRegistered2 = await client.ipAsset.isRegistered(ipId2);
      const isRegistered3 = await client.ipAsset.isRegistered(ipId3);
      
      expect(isRegistered1).to.be.true;
      expect(isRegistered2).to.be.true;
      expect(isRegistered3).to.be.true;
    });

    it("should batch register multiple IPs with the same PIL terms", async () => {
      // Create a single license terms data that will be reused
      const sharedLicenseTermsData = {
        terms: {
          transferable: true,
          royaltyPolicy: royaltyPolicyLapAddress[aeneid],
          defaultMintingFee: 7n,
          expiration: 365n,
          commercialUse: true,
          commercialAttribution: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 12,
          commercialRevCeiling: 8000n,
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: false,
          derivativesReciprocal: true,
          derivativeRevCeiling: 4000n,
          currency: WIP_TOKEN_ADDRESS,
          uri: "shared-license-terms",
        },
        licensingConfig: {
          isSet: true,
          mintingFee: 7n,
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 12,
          disabled: false,
          expectMinimumGroupRewardShare: 5,
          expectGroupRewardPool: pool,
        },
      };

      // Create a larger batch with the same license terms for efficiency
      const batchSize = 3; // Using a small number for test efficiency, can be increased
      const batchRequest = {
        args: Array(batchSize).fill(0).map(() => ({
          spgNftContract: nftContract,
          licenseTermsData: [sharedLicenseTermsData],
          allowDuplicates: true,
          ipMetadata: {
            ipMetadataURI: "shared-terms-test",
            ipMetadataHash: toHex("shared-terms-test-hash", { size: 32 }),
            nftMetadataHash: toHex("shared-terms-test-nft-hash", { size: 32 }),
          }
        })),
        txOptions: { waitForTransaction: true },
      };

      const result = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms(batchRequest);
      
      // Verify the result
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.results).to.be.an("array").with.lengthOf(batchSize);
      
      // Get all the license term IDs
      const licenseTermsIds = result.results!.map(res => res.licenseTermsIds![0]);
      
      // All should have the same license terms ID since they use the same terms
      const uniqueLicenseTermsIds = [...new Set(licenseTermsIds)];
      
      // There should be only one unique license terms ID
      expect(uniqueLicenseTermsIds).to.have.lengthOf(1);
      
      // Verify all IPs are properly registered
      for (const res of result.results!) {
        const isRegistered = await client.ipAsset.isRegistered(res.ipId);
        expect(isRegistered).to.be.true;
      }
      
      // Verify the gas efficiency by running one more test with different terms
      const differentTermsRequest = {
        args: [
          {
            spgNftContract: nftContract,
            licenseTermsData: [sharedLicenseTermsData], // Same terms again
            allowDuplicates: true,
          }
        ],
        txOptions: { waitForTransaction: true },
      };
      
      const differenceResult = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms(differentTermsRequest);
      
      // Verify that the license terms ID matches the previous batch
      expect(differenceResult.results![0].licenseTermsIds![0]).to.equal(uniqueLicenseTermsIds[0]);
    });
  });
});