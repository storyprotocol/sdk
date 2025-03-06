import chai from "chai";
import { StoryClient } from "../../src";
import { Address, Hex, encodeFunctionData, erc20Abi, parseEther, zeroAddress } from "viem";
import chaiAsPromised from "chai-as-promised";
import {
  mockERC721,
  getTokenId,
  getStoryClient,
  aeneid,
  publicClient,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import {
  erc20Address,
  royaltyPolicyLapAddress,
  royaltyPolicyLrpAddress,
} from "../../src/abi/generated";
import { MAX_ROYALTY_TOKEN, WIP_TOKEN_ADDRESS } from "../../src/constants/common";
import { describe } from "mocha";
import { ERC20Client } from "../../src/utils/token";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Royalty Functions", () => {
  let client: StoryClient;
  let parentIpId: Hex;
  let childIpId: Hex;
  let licenseTermsId: bigint;
  let mockERC20: ERC20Client;

  // Helper functions
  const getIpId = async (): Promise<Hex> => {
    const tokenId = await getTokenId();
    const response = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
      txOptions: { waitForTransaction: true },
    });
    if (!response.ipId) {
      throw new Error("Failed to register IP");
    }
    return response.ipId as Hex;
  };

  const getCommercialPolicyId = async (): Promise<bigint> => {
    const response = await client.license.registerCommercialRemixPIL({
      defaultMintingFee: "100000",
      currency: erc20Address[aeneid],
      commercialRevShare: 10,
      txOptions: { waitForTransaction: true },
    });
    return response.licenseTermsId!;
  };

  const attachLicenseTerms = async (ipId: Hex, licenseTermsId: bigint) => {
    await client.license.attachLicenseTerms({
      ipId,
      licenseTermsId: licenseTermsId,
      txOptions: { waitForTransaction: true },
    });
  };

  before(async () => {
    client = getStoryClient();
    mockERC20 = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);

    // Setup initial state
    parentIpId = await getIpId();
    childIpId = await getIpId();
    licenseTermsId = await getCommercialPolicyId();

    // Setup relationships and approvals
    await attachLicenseTerms(parentIpId, licenseTermsId);
    await mockERC20.mint(TEST_WALLET_ADDRESS, 1000n);

    // Register derivative
    await client.ipAsset.registerDerivative({
      childIpId: childIpId,
      parentIpIds: [parentIpId],
      licenseTermsIds: [licenseTermsId],
      maxMintingFee: "0",
      maxRts: "0",
      maxRevenueShare: "0",
      txOptions: { waitForTransaction: true },
    });
  });

  describe("Royalty Payments", () => {
    it("should successfully pay royalty on behalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: erc20Address[aeneid],
        amount: 1,
        txOptions: { waitForTransaction: true },
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should auto convert IP to WIP when paying WIP on behalf", async () => {
      const balanceBefore = await client.getWalletBalance();
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: WIP_TOKEN_ADDRESS,
        amount: 100n,
        txOptions: { waitForTransaction: true },
      });
      expect(response.txHash).to.be.a("string");
      const balanceAfter = await client.getWalletBalance();
      expect(balanceAfter < balanceBefore - 100n).to.be.true;
    });

    it("should return encoded transaction data for payRoyaltyOnBehalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: erc20Address[aeneid],
        amount: 10 * 10 ** 2,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should fail to pay royalty with unregistered receiver", async () => {
      const unregisteredIpId = "0x1234567890123456789012345678901234567890" as Hex;
      await expect(
        client.royalty.payRoyaltyOnBehalf({
          receiverIpId: unregisteredIpId,
          payerIpId: childIpId,
          token: erc20Address[aeneid],
          amount: 10 * 10 ** 2,
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith(`The receiver IP with id ${unregisteredIpId} is not registered.`);
    });

    it("should allow the royalty vault to transfer its native tokens to a wallet address", async () => {
      const royaltyVaultAddress = await client.royalty.getRoyaltyVaultAddress(parentIpId);

      const royaltyVaultToken = new ERC20Client(publicClient, walletClient, royaltyVaultAddress);

      const targetWalletAddress = TEST_WALLET_ADDRESS as Hex;
      const transferAmount = BigInt(10 * 10 ** 6); // 10 million tokens

      // Check initial balances of the vault token
      const initialTargetBalance = await royaltyVaultToken.balanceOf(targetWalletAddress);
      const initialParentBalance = await royaltyVaultToken.balanceOf(parentIpId);

      expect(initialParentBalance >= transferAmount).to.be.true;

      const transferResult = await client.ipAccount.execute({
        to: royaltyVaultAddress,
        value: 0,
        ipId: parentIpId,
        txOptions: { waitForTransaction: true },
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [targetWalletAddress, transferAmount],
        }),
      });

      expect(transferResult.txHash).to.be.a("string").and.not.empty;

      // Check final balances to confirm the transfer worked
      const finalTargetBalance = await royaltyVaultToken.balanceOf(targetWalletAddress);
      const finalParentBalance = await royaltyVaultToken.balanceOf(parentIpId);

      expect(finalTargetBalance).to.equal(
        initialTargetBalance + transferAmount,
        "Target wallet balance should increase by the transfer amount",
      );

      expect(finalParentBalance).to.equal(
        initialParentBalance - transferAmount,
        "Parent's vault token balance should decrease by the transfer amount",
      );
    });
  });

  describe("Revenue Queries", () => {
    it("should return claimable revenue amount", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: parentIpId,
        claimer: process.env.TEST_WALLET_ADDRESS as Address,
        token: erc20Address[aeneid],
      });

      expect(response).to.be.a("bigint");
    });

    it("should fail to get royalty vault address for unregistered IP", async () => {
      const unregisteredIpId = "0x1234567890123456789012345678901234567890" as Hex;
      await expect(client.royalty.getRoyaltyVaultAddress(unregisteredIpId)).to.be.rejectedWith(
        `The royalty vault IP with id ${unregisteredIpId} is not registered.`,
      );
    });
  });

  describe("Error Cases", () => {
    it("should fail to pay royalty with invalid amount", async () => {
      await expect(
        client.royalty.payRoyaltyOnBehalf({
          receiverIpId: parentIpId,
          payerIpId: childIpId,
          token: erc20Address[aeneid],
          amount: -1,
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
    });

    it("should return zero for claimable revenue with invalid token", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: parentIpId,
        claimer: process.env.TEST_WALLET_ADDRESS as Address,
        token: "0x0000000000000000000000000000000000000000" as Address,
      });

      expect(response).to.equal(0n);
    });
  });

  describe("ClaimAllRevenue With WIP", () => {
    let ipA: Address;
    let ipB: Address;
    let ipC: Address;
    let ipD: Address;
    let spgNftContract: Address;
    let licenseTermsId: bigint;

    before(async () => {
      // set up
      // minting Fee: 100, 10% LAP rev share, A expect to get 120 WIP
      // A -> B -> C -> D
      const txData = await client.nftClient.createNFTCollection({
        name: "free-collection",
        symbol: "FREE",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: zeroAddress,
        txOptions: { waitForTransaction: true },
      });
      spgNftContract = txData.spgNftContract!;

      const retA = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              defaultMintingFee: 100n,
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
              uri: "",
            },
            licensingConfig: {
              isSet: false,
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
        txOptions: { waitForTransaction: true },
      });
      ipA = retA.ipId!;
      licenseTermsId = retA.licenseTermsIds![0];

      const retB = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipA!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 0n,
          maxRts: MAX_ROYALTY_TOKEN,
          maxRevenueShare: 100,
        },
        txOptions: { waitForTransaction: true },
      });
      ipB = retB.ipId!;

      const retC = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipB!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 0n,
          maxRts: MAX_ROYALTY_TOKEN,
          maxRevenueShare: 100,
        },
        txOptions: { waitForTransaction: true },
      });
      ipC = retC.ipId!;

      const retD = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipC!],
          licenseTermsIds: [licenseTermsId!],
          maxMintingFee: 0n,
          maxRts: MAX_ROYALTY_TOKEN,
          maxRevenueShare: 100,
        },
        txOptions: { waitForTransaction: true },
      });
      ipD = retD.ipId!;
    });

    it("should claim all revenue", async () => {
      const ret = await client.royalty.claimAllRevenue({
        ancestorIpId: ipA,
        claimer: ipA,
        childIpIds: [ipB, ipC],
        royaltyPolicies: [royaltyPolicyLapAddress[aeneid], royaltyPolicyLapAddress[aeneid]],
        currencyTokens: [WIP_TOKEN_ADDRESS, WIP_TOKEN_ADDRESS],
      });
      expect(ret.txHashes).to.be.an("array").and.not.empty;
      expect(ret.claimedTokens![0].amount).to.equal(120n);
    });
  });

  describe("BatchClaimAllRevenue With WIP", () => {
    let ipA: Address;
    let ipA1: Address;
    let ipA2: Address;
    let ipA3: Address;
    let ipB: Address;
    let ipB1: Address;
    let ipB2: Address;
    let ipB3: Address;
    let spgNftContract: Address;
    let licenseTermsId: bigint;
    let licenseTermsId1: bigint;
    before(async () => {
      await client.wipClient.deposit({
        amount: parseEther("5"),
        txOptions: { waitForTransaction: true },
      });
      // set up
      // ipA ->ipA1->ipA2->ipA3 minting Fee: 100, 10% LAP rev share, A expect to get 120 WIP
      // ipB->ipB1,ipB2
      // ipB1,ipB2->ipB3 minting Fee: 150, 10% Lrp rev share, B expect to get 330 WIP
      const txData = await client.nftClient.createNFTCollection({
        name: "free-collection",
        symbol: "FREE",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: zeroAddress,
        txOptions: { waitForTransaction: true },
      });
      spgNftContract = txData.spgNftContract!;
      const { results: ret1 } = await client.ipAsset.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract,
            licenseTermsData: [
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                  defaultMintingFee: 100n,
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
                  uri: "",
                },
                licensingConfig: {
                  isSet: false,
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
            spgNftContract,
            licenseTermsData: [
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLrpAddress[aeneid],
                  defaultMintingFee: 150n,
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
                  uri: "",
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
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      ipA = ret1?.[0].ipId!;
      licenseTermsId = ret1?.[0].licenseTermsIds![0]!;
      ipB = ret1?.[1].ipId!;
      licenseTermsId1 = ret1?.[1].licenseTermsIds![0]!;

      const { results: ret2 } = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipA],
              licenseTermsIds: [licenseTermsId],
            },
          },
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipB],
              licenseTermsIds: [licenseTermsId1],
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      ipA1 = ret2?.[0].ipId!;
      ipB1 = ret2?.[1].ipId!;
      const { results: ret3 } = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipA1],
              licenseTermsIds: [licenseTermsId],
            },
          },
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipB],
              licenseTermsIds: [licenseTermsId1],
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      ipA2 = ret3?.[0].ipId!;
      ipB2 = ret3?.[1].ipId!;
      const ret4 = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipA2],
          licenseTermsIds: [licenseTermsId],
        },
        txOptions: { waitForTransaction: true },
      });
      ipA3 = ret4.ipId!;

      const { results: ret5 } = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipB1, ipB2],
              licenseTermsIds: [licenseTermsId1, licenseTermsId1],
            },
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      ipB3 = ret5?.[0].ipId!;
      const balance = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      await client.wipClient.withdraw({
        amount: balance,
        txOptions: { waitForTransaction: true },
      });
    });

    it("should batch claim all revenue", async () => {
      const result = await client.royalty.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId: ipA,
            claimer: ipA,
            childIpIds: [ipA1, ipA2],
            royaltyPolicies: [royaltyPolicyLapAddress[aeneid], royaltyPolicyLapAddress[aeneid]],
            currencyTokens: [WIP_TOKEN_ADDRESS, WIP_TOKEN_ADDRESS],
          },
          {
            ipId: ipB,
            claimer: ipB,
            childIpIds: [ipB1, ipB2],
            royaltyPolicies: [royaltyPolicyLrpAddress[aeneid], royaltyPolicyLrpAddress[aeneid]],
            currencyTokens: [WIP_TOKEN_ADDRESS, WIP_TOKEN_ADDRESS],
          },
        ],
      });
      expect(result.txHashes).to.be.an("array").and.not.empty;
      expect(result.claimedTokens![0].amount).to.equal(120n);
      expect(result.claimedTokens![1].amount).to.equal(330n);
    });
  });
});
