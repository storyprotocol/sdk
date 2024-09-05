import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient, WalletClient, Account } from "viem";
import chaiAsPromised from "chai-as-promised";
import { RoyaltyClient } from "../../../src/resources/royalty";
import { RoyaltyPolicyLapGetRoyaltyDataResponse } from "../../../src/abi/generated";
const { IpRoyaltyVaultImplClient } = require("../../../src/abi/generated");
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
    royaltyClient = new RoyaltyClient(rpcMock, walletMock);
    sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test royaltyClient.collectRoyaltyTokens", async () => {
    it("should throw parentIpId error when call collectRoyaltyTokens given parentIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The parent IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultIpId error when call collectRoyaltyTokens given royaltyVaultIpId is not registered", async () => {
      sinon
        .stub(royaltyClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call collectRoyaltyTokens given royalty vault address is empty", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([] as unknown as RoyaltyPolicyLapGetRoyaltyDataResponse);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 address is not set.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call collectRoyaltyTokens given royalty vault address is 0x", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData").resolves([true, "0x", 1]);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 address is not set.",
        );
      }
    });

    it("should return txHash when call collectRoyaltyTokens given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "collectRoyaltyTokens").resolves(txHash);

      const result = await royaltyClient.collectRoyaltyTokens({
        parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call collectRoyaltyTokens given given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "collectRoyaltyTokens").resolves(txHash);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "parseTxRoyaltyTokensCollectedEvent").returns([
        {
          ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyTokensCollected: 1,
        },
      ]);
      const result = await royaltyClient.collectRoyaltyTokens({
        parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.royaltyTokensCollected).equals(1);
    });

    it("should handle timeout error when collectRoyaltyTokens transaction exceeds the timeout", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient, "getRoyaltyVaultAddress").resolves("0xproxyAddress");
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "collectRoyaltyTokens").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        throw new Error("Timeout");
      });

      const executePromise = royaltyClient.collectRoyaltyTokens({
        parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: {
          waitForTransaction: true,
          timeout: 2000,
        },
      });

      clock.tick(3000);
      await clock.runAllAsync();
      await expect(executePromise).to.be.rejectedWith("Timeout");
      clock.restore();
    });

    it("should not raise a timeout error when collectRoyaltyTokens completes within the timeout transaction", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "collectRoyaltyTokens").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {};
      });

      const executePromise = royaltyClient.collectRoyaltyTokens({
        parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: txHash,
        txOptions: {
          waitForTransaction: true,
          timeout: 2000,
        },
      });

      clock.tick(1000);
      await clock.runAllAsync();
      await expect(executePromise).to.not.be.rejectedWith("Timeout");
      clock.restore();
    });
  });

  describe("Test royaltyClient.payRoyaltyOnBehalf", async () => {
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

    it("should return txHash when call payRoyaltyOnBehalf given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").resolves(txHash);

      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: 1,
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call payRoyaltyOnBehalf given given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").resolves(txHash);

      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: 1,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
    });

    it("should handle timeout error when payRoyaltyOnBehalf transaction exceeds the timeout", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        throw new Error("Timeout");
      });

      const executePromise = royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: 1,
        txOptions: {
          waitForTransaction: true,
          timeout: 2000,
        },
      });

      clock.tick(3000);
      await clock.runAllAsync();
      await expect(executePromise).to.be.rejectedWith("Timeout");
      clock.restore();
    });

    it("should not raise a timeout error when payRoyaltyOnBehalf completes within the timeout transaction", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(royaltyClient, "getRoyaltyVaultAddress").resolves("0xproxyAddress");
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return txHash;
      });

      const executePromise = royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: 1,
        txOptions: {
          waitForTransaction: true,
          timeout: 2000,
        },
      });

      clock.tick(1000);
      await clock.runAllAsync();
      await expect(executePromise).to.not.be.rejectedWith("Timeout");
      clock.restore();
    });
  });

  describe("Test royaltyClient.claimableRevenue", async () => {
    it("should throw royaltyVaultIpId error when call claimableRevenue given royaltyVaultIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotId: 1,
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call claimableRevenue given royalty vault address is 0x", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData").resolves([true, "0x", 1]);
      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotId: 1,
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 address is not set.",
        );
      }
    });

    it("should return txHash when call claimableRevenue given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "claimableRevenue").resolves(1);

      const result = await royaltyClient.claimableRevenue({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        snapshotId: 1,
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result).equals(1);
    });
  });

  describe("Test royaltyClient.claimRevenue", async () => {
    it("should throw royaltyVaultIpId error when call claimRevenue given royaltyVaultIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.claimRevenue({
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotIds: [1],
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to claim revenue: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call claimRevenue given royalty vault address is 0x", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient, "claimRevenue").resolves({ txHash: txHash });
      try {
        await royaltyClient.claimRevenue({
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotIds: [1],
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to claim revenue: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 address is not set.",
        );
      }
    });

    it("should return txHash when call claimRevenue given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon.stub(royaltyClient.ipAccountClient, "execute").resolves({ txHash });
      const result = await royaltyClient.claimRevenue({
        account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        snapshotIds: [1],
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call claimRevenue given correct args and waitForTransaction is true by ip account", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueBySnapshotBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAccountClient, "execute").resolves({ txHash });
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "parseTxRevenueTokenClaimedEvent").returns([
        {
          claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 1,
        },
      ]);

      const result = await royaltyClient.claimRevenue({
        account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        snapshotIds: [1],
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.claimableToken).equals(1);
    });

    it("should return txHash when call claimRevenue given correct args and waitForTransaction is true by EOA", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueBySnapshotBatch")
        .resolves(txHash);
      sinon.stub(royaltyClient.ipAccountClient, "execute").resolves({ txHash });
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "parseTxRevenueTokenClaimedEvent").returns([
        {
          claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 1,
        },
      ]);

      const result = await royaltyClient.claimRevenue({
        snapshotIds: [1],
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.claimableToken).equals(1);
    });

    it("should handle timeout error when claimRevenue transaction exceeds the timeout", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(royaltyClient, "getRoyaltyVaultAddress").resolves("0xproxyAddress");
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueBySnapshotBatch")
        .callsFake(async () => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          throw new Error("Timeout");
        });

      const executePromise = royaltyClient.claimRevenue({
        snapshotIds: ["1", "2"],
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: {
          waitForTransaction: true,
          timeout: 2000,
        },
      });

      clock.tick(3000);
      await clock.runAllAsync();
      await expect(executePromise).to.be.rejectedWith("Timeout");
      clock.restore();
    });

    it("should not raise a timeout error when claimRevenue completes within the timeout transaction", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(royaltyClient, "getRoyaltyVaultAddress").resolves("0xproxyAddress");
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueBySnapshotBatch")
        .callsFake(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return txHash;
        });

      const executePromise = royaltyClient.claimRevenue({
        snapshotIds: ["1", "2"],
        royaltyVaultIpId: "0xvaultIpId",
        token: "0xtoken",
        txOptions: {
          waitForTransaction: true,
          timeout: 2000,
        },
      });

      clock.tick(1000);
      await clock.runAllAsync();
      await expect(executePromise).to.not.be.rejectedWith("Timeout");
      clock.restore();
    });
  });

  describe("Test royaltyClient.snapshot", async () => {
    it("should throw royaltyVaultIpId error when call snapshot given royaltyVaultIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.snapshot({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to snapshot: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call snapshot given royalty vault address is 0x", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData").resolves([true, "0x", 1]);
      try {
        await royaltyClient.snapshot({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to snapshot: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 address is not set.",
        );
      }
    });

    it("should return txHash when call snapshot given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "snapshot").resolves(txHash);

      const result = await royaltyClient.snapshot({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call snapshot given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x73fcb515cee99e4991465ef586cfe2b072ebb512", 1]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "snapshot").resolves(txHash);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "parseTxSnapshotCompletedEvent").returns([
        {
          snapshotId: 1,
          snapshotTimestamp: 1,
          unclaimedTokens: 1,
        },
      ]);

      const result = await royaltyClient.snapshot({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.snapshotId).equals(1);
    });
  });

  it("should handle timeout error when snapShot transaction exceeds the timeout", async () => {
    const clock = sinon.useFakeTimers();
    sinon.stub(royaltyClient, "getRoyaltyVaultAddress").resolves("0xproxyAddress");
    sinon.stub(IpRoyaltyVaultImplClient.prototype, "snapshot").callsFake(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      throw new Error("Timeout");
    });

    const executePromise = royaltyClient.snapshot({
      royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      txOptions: {
        waitForTransaction: true,
        timeout: 2000,
      },
    });

    clock.tick(3000);
    await clock.runAllAsync();
    await expect(executePromise).to.be.rejectedWith("Timeout");
    clock.restore();
  });

  it("should not raise a timeout error when snapShot completes within the timeout transaction", async () => {
    const clock = sinon.useFakeTimers();
    sinon.stub(royaltyClient, "getRoyaltyVaultAddress").resolves("0xproxyAddress");
    sinon.stub(IpRoyaltyVaultImplClient.prototype, "snapshot").callsFake(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return txHash;
    });

    const executePromise = royaltyClient.snapshot({
      royaltyVaultIpId: "0xvaultIpId",
      txOptions: {
        waitForTransaction: true,
        timeout: 2000,
      },
    });

    clock.tick(1000);
    await clock.runAllAsync();
    await expect(executePromise).to.not.be.rejectedWith("Timeout");
    clock.restore();
  });
});
