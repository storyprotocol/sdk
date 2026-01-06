import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { describe } from "mocha";
import { Address, encodeFunctionData, erc20Abi, maxUint256, parseEther, zeroAddress } from "viem";

import { NativeRoyaltyPolicy, PILFlavor, StoryClient } from "../../src";
import { getDerivedStoryClient } from "./utils/BIP32";
import {
  aeneid,
  getStoryClient,
  getTokenId,
  mockERC721,
  publicClient,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import {
  erc20Address,
  royaltyModuleAddress,
  royaltyPolicyLapAddress,
  royaltyPolicyLrpAddress,
} from "../../src/abi/generated";
import { MAX_ROYALTY_TOKEN, WIP_TOKEN_ADDRESS } from "../../src/constants/common";
import { ERC20Client } from "../../src/utils/token";

use(chaiAsPromised);

describe("Royalty Functions", () => {
  let client: StoryClient;
  let parentIpId: Address;
  let childIpId: Address;
  let licenseTermsId: bigint;
  let mockERC20: ERC20Client;

  // Helper functions
  const getIpId = async (): Promise<Address> => {
    const tokenId = await getTokenId();
    const response = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
    });
    if (!response.ipId) {
      throw new Error("Failed to register IP");
    }
    return response.ipId;
  };

  const getCommercialPolicyId = async (): Promise<bigint> => {
    const response = await client.license.registerPILTerms(
      PILFlavor.commercialRemix({
        defaultMintingFee: 100000,
        currency: erc20Address[aeneid],
        commercialRevShare: 10,
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
      }),
    );
    return response.licenseTermsId!;
  };

  const attachLicenseTerms = async (ipId: Address, licenseId: bigint): Promise<void> => {
    await client.license.attachLicenseTerms({
      ipId,
      licenseTermsId: licenseId,
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
    await mockERC20.mint(TEST_WALLET_ADDRESS, parseEther("10"));
    await mockERC20.approve(royaltyModuleAddress[aeneid], maxUint256);

    // Register derivative
    await client.ipAsset.registerDerivative({
      childIpId: childIpId,
      parentIpIds: [parentIpId],
      licenseTermsIds: [licenseTermsId],
      maxMintingFee: 0,
      maxRts: 0,
      maxRevenueShare: 0,
    });
  });

  describe("Royalty Payments", () => {
    it("should successfully pay royalty on behalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: erc20Address[aeneid],
        amount: 1,
      });
      expect(response.txHash).to.be.a("string");
    });

    it("should auto convert IP to WIP when paying WIP on behalf", async () => {
      const balanceBefore = await client.getWalletBalance();
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: WIP_TOKEN_ADDRESS,
        amount: 100n,
      });
      expect(response.txHash).to.be.a("string");
      const balanceAfter = await client.getWalletBalance();
      expect(Number(balanceAfter)).lessThan(Number(balanceBefore - 100n));
    });

    it("should allow the royalty vault to transfer its native tokens to a wallet address", async () => {
      const royaltyVaultAddress = await client.royalty.getRoyaltyVaultAddress(parentIpId);

      const royaltyVaultToken = new ERC20Client(publicClient, walletClient, royaltyVaultAddress);

      const transferAmount = BigInt(10 * 10 ** 6); // 10 million tokens

      // Check initial balances of the vault token
      const initialTargetBalance = await royaltyVaultToken.balanceOf(TEST_WALLET_ADDRESS);
      const initialParentBalance = await royaltyVaultToken.balanceOf(parentIpId);

      expect(Number(initialParentBalance)).greaterThanOrEqual(Number(transferAmount));

      const transferResult = await client.ipAccount.execute({
        to: royaltyVaultAddress,
        value: 0,
        ipId: parentIpId,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [TEST_WALLET_ADDRESS, transferAmount],
        }),
      });

      expect(transferResult.txHash).to.be.a("string");

      // Check final balances to confirm the transfer worked
      const finalTargetBalance = await royaltyVaultToken.balanceOf(TEST_WALLET_ADDRESS);
      const finalParentBalance = await royaltyVaultToken.balanceOf(parentIpId);

      expect(finalTargetBalance).to.equal(
        initialTargetBalance + transferAmount,
        "Target wallet balance should increase by the transfer amount",
      );

      expect(Number(finalParentBalance)).equal(Number(initialParentBalance - transferAmount));
    });
  });

  it("should return claimable revenue amount", async () => {
    const response = await client.royalty.claimableRevenue({
      ipId: parentIpId,
      claimer: TEST_WALLET_ADDRESS,
      token: erc20Address[aeneid],
    });

    expect(response).to.be.a("bigint");
  });

  describe("ClaimAllRevenue With WIP", () => {
    let ipA: Address;
    let ipB: Address;
    let ipC: Address;
    let spgNftContract: Address;
    let licenseId: bigint;

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
      });
      ipA = retA.ipId!;
      licenseId = retA.licenseTermsIds![0]!;

      const retB = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipA!],
          licenseTermsIds: [licenseId],
          maxMintingFee: 0n,
          maxRts: MAX_ROYALTY_TOKEN,
          maxRevenueShare: 100,
        },
      });
      ipB = retB.ipId!;

      const retC = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipB!],
          licenseTermsIds: [licenseId],
          maxMintingFee: 0n,
          maxRts: MAX_ROYALTY_TOKEN,
          maxRevenueShare: 100,
        },
      });
      ipC = retC.ipId!;

      await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: [ipC!],
          licenseTermsIds: [licenseId],
          maxMintingFee: 0n,
          maxRts: MAX_ROYALTY_TOKEN,
          maxRevenueShare: 100,
        },
      });
    });

    it("should claim all revenue", async () => {
      const ret = await client.royalty.claimAllRevenue({
        ancestorIpId: ipA,
        claimer: ipA,
        childIpIds: [ipB, ipC],
        royaltyPolicies: [royaltyPolicyLapAddress[aeneid], royaltyPolicyLapAddress[aeneid]],
        currencyTokens: [WIP_TOKEN_ADDRESS, WIP_TOKEN_ADDRESS],
      });
      expect(ret.txHashes).to.be.an("array");
      expect(ret.claimedTokens[0].amount).to.equal(120n);
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
    let spgNftContract: Address;
    let licenseId: bigint;
    let licenseId1: bigint;
    let anotherAddress: Address;
    before(async () => {
      const derivedClient = await getDerivedStoryClient();
      anotherAddress = derivedClient.address;
      await client.wipClient.deposit({
        amount: parseEther("5"),
      });
      /**
       * Asset Hierarchy Setup for Revenue Collection Tests
       *
       * Overview:
       * This test setup creates two distinct IP asset hierarchies (IpA and IpB) to demonstrate
       * different revenue collection scenarios using LAP (Licensing Agreement Policy) and LRP
       * (Licensing Revenue Policy) respectively.
       *
       * IpA Hierarchy (LAP - Licensing Agreement Policy):                           IpB Hierarchy (LRP - Licensing Revenue Policy):
       * ┌─────────────────────────────────────────────────────────────┐          ┌─────────────────────────────────────────────────────────────┐
       * │ IpA (Parent) - Total Expected Revenue: 130 WIP              │          │ IpB (Parent) - Total Expected Revenue: 330 WIP              │
       * ├─────────────────────────────────────────────────────────────┤          ├─────────────────────────────────────────────────────────────┤
       * │ Revenue Sources:                                            │          │ Revenue Sources:                                            │
       * │ ├── Minting Fee: 100 WIP                                    │          │ ├── Minting Fee: 150 WIP                                    │
       * │ ├── Revenue Share (ipA2->ipA1): 10 WIP (10% LAP)            │          │ ├── LRP Revenue Share: 10%                                  │
       * │ ├── Revenue Share (ipA3->ipA2): 10 WIP (10% LAP)            │          │ ├── Total Revenue: 330 WIP                                  │
       * │ └── Direct Payment (ipA3): 10 WIP (10% LAP)                 │          │    └── From ipB1: 150 WIP + 10% revenue share               │
       * │                                                             │          │    └── From ipB2: 150 WIP + 10% revenue share               │
       * │                                                             │          │                                                             │
       * | Ownership Distribution:                                     │          |                                                             │
       * │ ├── Wallet Address: 50%  65 WIP                             │          │ Revenue Flow:                                               │
       * │ └── Another Address: 50% 65 WIP                             │          │ ipB3                                                        │
       * │                                                             │          │ ├── ipB1 ─┐                                                 │
       * │ Revenue Flow:                                               │          │ └── ipB2 ─┴──> ipB (collects 330 WIP)                       │
       * │ ipA3                                                        │          │                                                             │
       * │  └──> ipA2 (20% LAP) ──> ipA1 (10% LAP) ──> ipA             │          │                                                             │
       * │       └──> Direct Payment: 100 WIP                          │          │                                                             │
       * └─────────────────────────────────────────────────────────────┘          └─────────────────────────────────────────────────────────────┘
       */

      const txData = await client.nftClient.createNFTCollection({
        name: "free-collection",
        symbol: "FREE",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: zeroAddress,
      });
      spgNftContract = txData.spgNftContract!;
      // 1. Register ipA
      const ret1A =
        await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
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
          royaltyShares: [
            {
              recipient: TEST_WALLET_ADDRESS,
              percentage: 50,
            },
            {
              recipient: anotherAddress,
              percentage: 50,
            },
          ],
        });
      ipA = ret1A.ipId!;
      licenseId = ret1A.licenseTermsIds![0]!;
      // 2. Register ipB
      const ret1B = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
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
      });
      ipB = ret1B.ipId!;
      licenseId1 = ret1B.licenseTermsIds![0]!;
      // 3. Register ipA1 from ipA and ipB1 from ipB
      const { results: ret2 } = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipA],
              licenseTermsIds: [licenseId],
            },
          },
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipB],
              licenseTermsIds: [licenseId1],
            },
          },
        ],
      });
      ipA1 = ret2![0].ipId;
      ipB1 = ret2![1].ipId;
      // 4. Register ipA2 from ipA1 and ipB2 from ipB
      const { results: ret3 } = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipA1],
              licenseTermsIds: [licenseId],
            },
          },
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipB],
              licenseTermsIds: [licenseId1],
            },
          },
        ],
      });
      ipA2 = ret3![0].ipId;
      ipB2 = ret3![1].ipId;
      // 5. Register ipA3 from ipA2 and ipB3 from ipB1 and ipB2
      const { results: ret4 } = await client.ipAsset.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipA2],
              licenseTermsIds: [licenseId],
            },
          },
          {
            spgNftContract,
            derivData: {
              parentIpIds: [ipB1, ipB2],
              licenseTermsIds: [licenseId1, licenseId1],
            },
          },
        ],
      });
      ipA3 = ret4![0].ipId!;
      // 6. Pay royalty on behalf of ipA2 to ipA3
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: ipA2,
        payerIpId: ipA3,
        token: WIP_TOKEN_ADDRESS,
        amount: 100n,
      });
      const balance = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      await client.wipClient.withdraw({
        amount: balance,
      });
    });

    it("should batch claim all revenue", async () => {
      const anotherAddressWipBalanceBefore = await client.wipClient.balanceOf(anotherAddress);
      const result = await client.royalty.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId: ipA,
            claimer: TEST_WALLET_ADDRESS,
            childIpIds: [ipA1, ipA2],
            royaltyPolicies: [royaltyPolicyLapAddress[aeneid], royaltyPolicyLapAddress[aeneid]],
            currencyTokens: [WIP_TOKEN_ADDRESS, WIP_TOKEN_ADDRESS],
          },
          {
            ipId: ipA,
            claimer: anotherAddress,
            childIpIds: [],
            royaltyPolicies: [],
            currencyTokens: [WIP_TOKEN_ADDRESS],
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
      const anotherAddressWipBalanceAfter = await client.wipClient.balanceOf(anotherAddress);
      const walletWipBalanceAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);

      expect(result.txHashes).to.be.an("array");
      expect(result.claimedTokens![0].amount).to.equal(65n);
      expect(result.claimedTokens![1].amount).to.equal(65n);
      expect(result.claimedTokens![2].amount).to.equal(330n);
      expect(walletWipBalanceAfter).to.equal(0n);
      expect(anotherAddressWipBalanceAfter).to.equal(anotherAddressWipBalanceBefore + 65n);
      // Note: The final wallet balance cannot be precisely calculated because:
      // The test involves multiple transactions (claimAllRevenue, token transfers, etc.)
      // batchClaimAllRevenue only returns receipts for claimAllRevenue calls
      // Additional gas costs and token transfers occur outside the returned receipts
    });
  });
});
