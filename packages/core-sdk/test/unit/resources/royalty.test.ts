import chai from "chai";
import { createMock, generateRandomAddress } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient, WalletClient, Account, Hex } from "viem";
import chaiAsPromised from "chai-as-promised";
import { RoyaltyClient } from "../../../src/resources/royalty";
import {
  IpAccountImplClient,
  IpRoyaltyVaultImplReadOnlyClient,
  erc20Address,
} from "../../../src/abi/generated";
import { aeneid } from "../../integration/utils/util";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { ipId, mockAddress, walletAddress } from "../mockData";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { NativeRoyaltyPolicy } from "../../../src/types/resources/royalty";
chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("Test RoyaltyClient", () => {
  let royaltyClient: RoyaltyClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    royaltyClient = new RoyaltyClient(rpcMock, walletMock, "1315");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test royaltyClient.payRoyaltyOnBehalf", async () => {
    beforeEach(() => {
      sinon.stub(ERC20Client.prototype, "balanceOf").resolves(1n);
      sinon.stub(ERC20Client.prototype, "allowance").resolves(10000n);
      sinon.stub(ERC20Client.prototype, "approve").resolves(txHash);
      sinon.stub(WipTokenClient.prototype, "balanceOf").resolves(1n);
      sinon.stub(WipTokenClient.prototype, "allowance").resolves(1n);
      sinon.stub(WipTokenClient.prototype, "approve").resolves(txHash);
      sinon.stub(WipTokenClient.prototype, "address").get(() => WIP_TOKEN_ADDRESS);
    });

    it("should throw receiverIpId error when call payRoyaltyOnBehalf given receiverIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

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
      sinon
        .stub(royaltyClient.ipAssetRegistryClient, "isRegistered")
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
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").resolves(txHash);
      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: erc20Address[aeneid],
        amount: 1,
      });

      expect(result.txHash).equals(txHash);
    });
    it("should convert IP to WIP when paying WIP via payRoyaltyOnBehalf", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      rpcMock.getBalance = sinon.stub().resolves(150n);
      const simulateContractStub = sinon.stub().resolves({ request: {} });
      rpcMock.simulateContract = simulateContractStub;
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: WIP_TOKEN_ADDRESS,
        amount: 100n,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(simulateContractStub.calledOnce).to.be.true;
      const calls = simulateContractStub.firstCall.args[0].args[0];
      expect(calls.length).to.equal(2); // deposit and payRoyaltyOnBehalf
    });

    it("should return encodedData when call payRoyaltyOnBehalf given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalfEncode").returns({
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

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test royaltyClient.claimableRevenue", async () => {
    it("should throw royaltyVaultIpId error when call claimableRevenue given royaltyVaultIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
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
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x",
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
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon.stub(IpRoyaltyVaultImplReadOnlyClient.prototype, "claimableRevenue").resolves(1n);

      const result = await royaltyClient.claimableRevenue({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result).equals(1n);
    });
  });

  describe("Test royaltyClient.claimAllRevenue", async () => {
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
    it("should not return `claimedTokens` when call claimAllRevenue given claimer is neither an IP owned by the wallet nor the wallet address itself", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(mockAddress);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
      });
      expect(result.claimedTokens).to.be.undefined;
      expect(result.txHashes).to.be.an("array").and.lengthOf(1);
      expect(result.receipt).to.be.an("object");
    });

    it("should call transfer and unwrap method when call claimAllRevenue given claimer is an IP owned by the wallet", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            token: WIP_TOKEN_ADDRESS,
            amount: 1n,
            claimer: ipId,
          },
        ]);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);
      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
      });
      expect(executeBatchStub.calledOnce).to.be.true;
      expect(withdrawStub.calledOnce).to.be.true;
      expect(result.txHashes).to.be.an("array").and.lengthOf(3);
    });

    it("should only unwrap token when call claimAllRevenue given autoTransfer is false", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            token: WIP_TOKEN_ADDRESS,
            amount: 1n,
            claimer: ipId,
          },
        ]);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
        claimOptions: { autoTransferAllClaimedTokensFromIp: false },
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(executeBatchStub.calledOnce).to.be.false;
      expect(withdrawStub.calledOnce).to.be.true;
    });

    it("should not unwrap token when call claimAllRevenue given autoUnwrapIpTokens is false", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            token: WIP_TOKEN_ADDRESS,
            amount: 1n,
            claimer: ipId,
          },
        ]);
      const executeBatchStub = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      const result = await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [WIP_TOKEN_ADDRESS],
        claimOptions: { autoTransferAllClaimedTokensFromIp: true, autoUnwrapIpTokens: false },
      });
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(withdrawStub.calledOnce).to.be.false;
      expect(executeBatchStub.calledOnce).to.be.true;
    });

    it("should not call unwrap when call claimAllRevenue given token is not wip", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            token: mockAddress,
            amount: 1n,
            claimer: ipId,
          },
        ]);
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

      await royaltyClient.claimAllRevenue({
        ancestorIpId: ipId,
        claimer: ipId,
        childIpIds: [ipId],
        royaltyPolicies: [mockAddress],
        currencyTokens: [mockAddress],
      });
      expect(withdrawStub.calledOnce).to.be.false;
    });

    it("should throw error when call claimAllRevenue given multiple wip tokens", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
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
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);
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

  describe("Test royaltyClient.batchClaimAllRevenue", async () => {
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
      const claimAllRevenueStub = sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue")
        .resolves(txHash);
      const multicallStub = sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "multicall")
        .resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            token: WIP_TOKEN_ADDRESS,
            amount: 1n,
            claimer: ipId,
          },
        ]);
      sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

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
      expect(claimAllRevenueStub.calledOnce).to.be.true;
      expect(multicallStub.calledOnce).to.be.false;
    });

    it("should directly call claimAllRevenue when call batchClaimAllRevenue given useMulticallWhenPossible is false", async () => {
      const claimAllRevenueStub = sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue")
        .resolves(txHash);
      const multicallStub = sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "multicall")
        .resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            token: WIP_TOKEN_ADDRESS,
            amount: 1n,
            claimer: ipId,
          },
        ]);
      sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

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
      expect(claimAllRevenueStub.calledTwice).to.be.true;
      expect(multicallStub.calledOnce).to.be.false;
    });

    it("should not return claimedTokens when call batchClaimAllRevenue given claimer is neither an IP owned by the wallet nor the wallet address itself", async () => {
      const claimAllRevenueStub = sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "claimAllRevenue")
        .resolves(txHash);
      const multicallStub = sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "multicall")
        .resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(mockAddress);
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([{ token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: ipId }]);
      sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

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
      expect(claimAllRevenueStub.calledOnce).to.be.false;
      expect(multicallStub.calledOnce).to.be.true;
    });

    it("should not call transfer when call batchClaimAllRevenue given autoTransferAllClaimedTokensFromIp is false", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([{ token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: ipId }]);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

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
        { token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: ipId },
      ]);
      expect(executeBatchStub.calledOnce).to.be.false;
      expect(withdrawStub.calledOnce).to.be.true;
    });

    it("should not unwrap token when call batchClaimAllRevenue given autoUnwrapIpTokens is false", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          { token: WIP_TOKEN_ADDRESS, amount: 1n, claimer: ipId },
          { token: mockAddress, amount: 0n, claimer: ipId },
          { token: mockAddress, amount: 1n, claimer: walletAddress },
        ]);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

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
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(result.receipts).to.be.an("array").and.lengthOf(1);
      expect(executeBatchStub.calledOnce).to.be.true;
      expect(withdrawStub.calledOnce).to.be.false;
    });

    it("should return claimedTokens when call batchClaimAllRevenue", async () => {
      sinon.stub(royaltyClient.royaltyWorkflowsClient, "multicall").resolves(txHash);
      sinon.stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      const executeBatchStub = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          { token: mockAddress, amount: 1n, claimer: walletAddress },
          { token: WIP_TOKEN_ADDRESS, amount: 0n, claimer: walletAddress },
          { token: mockAddress, amount: 1n, claimer: walletAddress },
        ]);
      const withdrawStub = sinon.stub(royaltyClient.wrappedIpClient, "withdraw").resolves(txHash);

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
        { token: mockAddress, amount: 2n, claimer: walletAddress },
        { token: WIP_TOKEN_ADDRESS, amount: 0n, claimer: walletAddress },
      ]);
      expect(executeBatchStub.calledOnce).to.be.true;
      // withdraw is not called because amount is 0
      expect(withdrawStub.calledOnce).to.be.false;
      expect(result.txHashes).to.be.an("array").and.lengthOf(2);
      expect(result.receipts).to.be.an("array").and.lengthOf(1);
    });
  });

  describe("Test royaltyClient.transferToVault", async () => {
    it("returns txHash when successful", async () => {
      const simulateContractStub = sinon.stub().resolves({ request: {} });
      rpcMock.simulateContract = simulateContractStub;
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const result = await royaltyClient.transferToVault({
        ipId,
        ancestorIpId: generateRandomAddress(),
        token: WIP_TOKEN_ADDRESS,
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.equal(txHash);
    });

    it("throws if invalid input addresses", async () => {
      const invalidAddress: Hex = "0x123";
      const validAddress: Hex = ipId;
      const validPolicy = NativeRoyaltyPolicy.LAP;
      const testCases = [
        { ipId: invalidAddress, ancestorIpId: validAddress, token: validAddress },
        { ipId: validAddress, ancestorIpId: invalidAddress, token: validAddress },
        { ipId: validAddress, ancestorIpId: validAddress, token: invalidAddress },
      ];

      for (const { ipId, ancestorIpId, token } of testCases) {
        await expect(
          royaltyClient.transferToVault({ ipId, ancestorIpId, token, royaltyPolicy: validPolicy }),
        ).to.be.rejectedWith(`Invalid address: ${invalidAddress}`);
      }
    });
  });
});
