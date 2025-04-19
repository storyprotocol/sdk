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
import {mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens
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

    it.only("should verify royalty token ownership after batch distribution", async () => {
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