import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { stub } from "sinon";
import { Address, PublicClient, WalletClient } from "viem";

import {
  erc20Address,
  IpAccountImplClient,
  IpRoyaltyVaultImplReadOnlyClient,
} from "../../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { RoyaltyClient } from "../../../src/resources/royalty";
import { NativeRoyaltyPolicy } from "../../../src/types/resources/royalty";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { aeneid } from "../../integration/utils/util";
import { ipId, mockAddress, mockERC20, txHash, walletAddress } from "../mockData";
import {
  createMockPublicClient,
  createMockWalletClient,
  generateRandomAddress,
} from "../testUtils";

use(chaiAsPromised);

describe("Test RoyaltyClient", () => {
  let royaltyClient: RoyaltyClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    royaltyClient = new RoyaltyClient(rpcMock, walletMock, 1315);
  });

  describe("Test royaltyClient.payRoyaltyOnBehalf", () => {
    beforeEach(() => {
      stub(ERC20Client.prototype, "balanceOf").resolves(1n);
      stub(ERC20Client.prototype, "allowance").resolves(10000n);
      stub(ERC20Client.prototype, "approve").resolves(txHash);
      stub(WipTokenClient.prototype, "balanceOf").resolves(1n);
      stub(WipTokenClient.prototype, "allowance").resolves(1n);
      stub(WipTokenClient.prototype, "approve").resolves(txHash);
      stub(WipTokenClient.prototype, "address").get(() => WIP_TOKEN_ADDRESS);
    });

    it("should throw receiverIpId error when call payRoyaltyOnBehalf given receiverIpId is not registered", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.payRoyaltyOnBehalf({
          receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 1,
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to pay royalty on behalf: The receiver IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });
    it("should throw error when call payRoyaltyOnBehalf given amount is 0", async () => {
      try {
        await royaltyClient.payRoyaltyOnBehalf({
          receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 0,
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to pay royalty on behalf: The amount to pay must be number greater than 0.",
        );
      }
    });
    it("should throw payerIpId error when call payRoyaltyOnBehalf given payerIpId is not registered", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      try {
        await royaltyClient.payRoyaltyOnBehalf({
          receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 1,
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to pay royalty on behalf: The payer IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should return txHash when call payRoyaltyOnBehalf given correct args with erc20", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").resolves(txHash);
      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: erc20Address[aeneid],
        amount: 1,
      });

      expect(result.txHash).equals(txHash);
    });
    it("should convert IP to WIP when paying WIP via payRoyaltyOnBehalf", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      rpcMock.getBalance = stub().resolves(150n);
      const simulateContractStub = stub().resolves({ request: {} });
      rpcMock.simulateContract = simulateContractStub;
      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: WIP_TOKEN_ADDRESS,
        amount: 100n,
      });
      expect(result.txHash).equals(txHash);
      expect(simulateContractStub.callCount).equals(1);
      const calls = (simulateContractStub.firstCall.args[0] as { args: unknown[] }).args[0];
      expect(calls).to.have.length(3); // deposit, approve and payRoyaltyOnBehalf
    });

    it("should return encodedData when call payRoyaltyOnBehalf given correct args and encodedTxDataOnly is true", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalfEncode").returns({
        data: "0x",
        to: "0x",
      });

      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: 1,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("Test royaltyClient.claimableRevenue", () => {
    it("should throw ipId error when call claimableRevenue given ipId is not registered", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.claimableRevenue({
          ipId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: The royalty vault IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call claimableRevenue given royalty vault address is 0x", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );
      try {
        await royaltyClient.claimableRevenue({
          ipId: "0x",
          claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: Invalid address: 0x.",
        );
      }
    });

    it("should return txHash when call claimableRevenue given correct args", async () => {
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );
      stub(IpRoyaltyVaultImplReadOnlyClient.prototype, "claimableRevenue").resolves(1n);

      const result = await royaltyClient.claimableRevenue({
        ipId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result).equals(1n);
    });
  });

  describe("Test royaltyClient.claimAllRevenue", () => {
    it("should throw error when call claimAllRevenue given claimer address is wrong", async () => {
      try {
        await royaltyClient.claimAllRevenue({
          ancestorIpId: ipId,
          claimer: "0x",
          childIpIds: [ipId],
          royaltyPolicies: [mockAddress],
          currencyTokens: [WIP_TOKEN_ADDRESS],
        });
      } catch (err) {
        expect((err as Error).message).equals("Failed to claim all revenue: Invalid address: 0x.");
      }
    });

    it("should call transfer and unwrap method when call claimAllRevenue given claimer is an IP owned by the wallet", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);
      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
      });
      expect(executeBatchStub.callCount).equals(1);
      expect(withdrawStub.callCount).equals(1);
      expect(result.txHashes).to.be.an("array").and.lengthOf(3);
    });

    it("should only unwrap token when call claimAllRevenue given autoTransfer is false", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
        claimOptions: { autoTransferAllClaimedTokensFromIp: false },
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(executeBatchStub.callCount).equals(0);
      expect(withdrawStub.callCount).equals(1);
    });

    it("should not unwrap token when call claimAllRevenue given autoUnwrapIpTokens is false", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      const executeBatchStub = stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
        claimOptions: { autoTransferAllClaimedTokensFromIp: true, autoUnwrapIpTokens: false },
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(withdrawStub.callCount).equals(0);
      expect(executeBatchStub.callCount).equals(1);
    });

    it("should not call unwrap when call claimAllRevenue given token is not wip", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: mockERC20,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [mockERC20],
      });
      expect(withdrawStub.callCount).equals(0);
    });

    it("should throw error when call claimAllRevenue given multiple wip tokens", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);
      try {
        await royaltyClient.claimAllRevenue({
          ancestorIpId: ipId,
          claimer: ipId,
          childIpIds: [ipId],
          royaltyPolicies: [mockAddress],
          currencyTokens: [WIP_TOKEN_ADDRESS],
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to claim all revenue: Multiple WIP tokens found in the claimed tokens.",
        );
      }
    });
  });

  describe("Test royaltyClient.batchClaimAllRevenue", () => {
    it("should throw error when call batchClaimAllRevenue given claimer address is wrong", async () => {
      try {
        await royaltyClient.batchClaimAllRevenue({
          ancestorIps: [
            {
              ipId,
              claimer: "0x",
              childIpIds: [ipId],
              royaltyPolicies: [mockAddress],
              currencyTokens: [WIP_TOKEN_ADDRESS],
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to batch claim all revenue: Invalid address: 0x.",
        );
      }
    });

    it("should directly call claimAllRevenue when call batchClaimAllRevenue given only one ancestorIp", async () => {
      const claimAllRevenueStub = stub(
        royaltyClient.royaltyWorkflowsClient,
        "claimAllRevenue",
      ).resolves(txHash);
      const multicallStub = stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(
        txHash,
      );
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      await royaltyClient.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
        ],
      });
      expect(claimAllRevenueStub.callCount).equals(1);
      expect(multicallStub.callCount).equals(0);
    });

    it("should directly call claimAllRevenue when call batchClaimAllRevenue given useMulticallWhenPossible is false", async () => {
      const claimAllRevenueStub = stub(
        royaltyClient.royaltyWorkflowsClient,
        "claimAllRevenue",
      ).resolves(txHash);
      const multicallStub = stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(
        txHash,
      );
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        {
          token: WIP_TOKEN_ADDRESS,
          amount: 1n,
          claimer: ipId,
        },
      ]);
      stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      await royaltyClient.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
        ],
        options: { useMulticallWhenPossible: false },
      });
      expect(claimAllRevenueStub.callCount).equals(2);
      expect(multicallStub.callCount).equals(0);
    });

    it("should not return claimedTokens when call batchClaimAllRevenue given claimer is neither an IP owned by the wallet nor the wallet address itself", async () => {
      const claimAllRevenueStub = stub(
        royaltyClient.royaltyWorkflowsClient,
        "claimAllRevenue",
      ).resolves(txHash);
      const multicallStub = stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(
        txHash,
      );
      stub(IpAccountImplClient.prototype, "owner").resolves(mockAddress);
      stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        { token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: ipId },
      ]);
      stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
        ],
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(1);
      expect(result.receipts).to.be.an("array").and.lengthOf(1);
      expect(claimAllRevenueStub.callCount).equals(0);
      expect(multicallStub.callCount).equals(1);
    });

    it("should not call transfer when call batchClaimAllRevenue given autoTransferAllClaimedTokensFromIp is false", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        { token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: walletAddress },
      ]);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
        ],
        claimOptions: { autoTransferAllClaimedTokensFromIp: false },
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(result.receipts).to.be.an("array").and.lengthOf(1);
      expect(result.claimedTokens).to.be.deep.equal([
        { token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: walletAddress },
      ]);
      expect(executeBatchStub.callCount).equals(0);
      expect(withdrawStub.callCount).equals(1);
    });

    it("should not unwrap token when call batchClaimAllRevenue given autoUnwrapIpTokens is false", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        { token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: ipId },
        { token: mockAddress, amount: 0n, claimer: ipId },
        { token: mockAddress, amount: 1n, claimer: walletAddress },
      ]);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: ipId,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
        ],
        claimOptions: { autoUnwrapIpTokens: false },
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(3);
      expect(result.receipts).to.be.an("array").and.lengthOf(1);
      expect(executeBatchStub.callCount).equals(2);
      expect(withdrawStub.callCount).equals(0);
    });

    it("should return claimedTokens when call batchClaimAllRevenue", async () => {
      stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(txHash);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent").returns([
        { token: mockERC20, amount: 1n, claimer: walletAddress },
        { token: WIP_TOKEN_ADDRESS, amount: 0n, claimer: walletAddress },
        { token: mockERC20, amount: 1n, claimer: walletAddress },
      ]);
      const withdrawStub = stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.batchClaimAllRevenue({
        ancestorIps: [
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
          {
            ipId,
            claimer: walletAddress,
            childIpIds: [ipId],
            royaltyPolicies: [mockAddress],
            currencyTokens: [WIP_TOKEN_ADDRESS],
          },
        ],
      });
      expect(result.claimedTokens).to.be.deep.equal([
        { token: mockERC20, amount: 2n, claimer: walletAddress },
        { token: WIP_TOKEN_ADDRESS, amount: 0n, claimer: walletAddress },
      ]);
      expect(executeBatchStub.callCount).equals(1);
      expect(withdrawStub.callCount).equals(0);
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(result.receipts).to.be.an("array").and.lengthOf(1);
    });
  });

  describe("Test royaltyClient.transferToVault", () => {
    it("returns txHash when successful", async () => {
      const simulateContractStub = stub().resolves({ request: {} });
      rpcMock.simulateContract = simulateContractStub;
      walletMock.writeContract = stub().resolves(txHash);
      const result = await royaltyClient.transferToVault({
        ipId,
        ancestorIpId: generateRandomAddress(),
        token: WIP_TOKEN_ADDRESS,
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
      });
      expect(result.txHash).to.equal(txHash);
    });

    it("throws if invalid input addresses", async () => {
      const invalidAddress: Address = "0x123" as Address;
      const validAddress: Address = ipId;
      const validPolicy = NativeRoyaltyPolicy.LAP;
      const testCases = [
        { testIpId: invalidAddress, testAncestorIpId: validAddress, testToken: validAddress },
        { testIpId: validAddress, testAncestorIpId: invalidAddress, testToken: validAddress },
        { testIpId: validAddress, testAncestorIpId: validAddress, testToken: invalidAddress },
      ];

      for (const { testIpId, testAncestorIpId, testToken } of testCases) {
        await expect(
          royaltyClient.transferToVault({
            ipId: testIpId,
            ancestorIpId: testAncestorIpId,
            token: testToken,
            royaltyPolicy: validPolicy,
          }),
        ).to.be.rejectedWith(`Invalid address: ${invalidAddress}`);
      }
    });
  });
});
