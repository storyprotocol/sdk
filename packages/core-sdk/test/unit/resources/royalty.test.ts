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

describe("Test RoyaltyClient", function () {
  let royaltyClient: RoyaltyClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    royaltyClient = new RoyaltyClient(rpcMock, walletMock);
    sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test royaltyClient.collectRoyaltyTokens", async function () {
    it("should throw parentIpId error when call collectRoyaltyTokens given parentIpId is not registered", async function () {
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

    it("should throw royaltyVaultIpId error when call collectRoyaltyTokens given royaltyVaultIpId is not registered", async function () {
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

    it("should throw royaltyVaultAddress error when call collectRoyaltyTokens given royalty vault address is empty", async function () {
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

    it("should throw royaltyVaultAddress error when call collectRoyaltyTokens given royalty vault address is 0x", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x", 1, ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"], [1]]);

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

    it("should return txHash when call collectRoyaltyTokens given correct args", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "collectRoyaltyTokens").resolves(txHash);

      const result = await royaltyClient.collectRoyaltyTokens({
        parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call collectRoyaltyTokens given given correct args and waitForTransaction is true", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
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
  });

  describe("Test royaltyClient.payRoyaltyOnBehalf", async function () {
    it("should throw receiverIpId error when call payRoyaltyOnBehalf given receiverIpId is not registered", async function () {
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

    it("should throw payerIpId error when call payRoyaltyOnBehalf given payerIpId is not registered", async function () {
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

    it("should return txHash when call payRoyaltyOnBehalf given correct args", async function () {
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

    it("should return txHash when call payRoyaltyOnBehalf given given correct args and waitForTransaction is true", async function () {
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
  });

  describe("Test royaltyClient.claimableRevenue", async function () {
    it("should throw royaltyVaultIpId error when call claimableRevenue given royaltyVaultIpId is not registered", async function () {
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

    it("should throw royaltyVaultAddress error when call claimableRevenue given royalty vault address is 0x", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x", 1, ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"], [1]]);

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

    it("should return txHash when call claimableRevenue given correct args", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
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

  describe("Test royaltyClient.claimRevenue", async function () {
    it("should throw royaltyVaultIpId error when call claimRevenue given royaltyVaultIpId is not registered", async function () {
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

    it("should throw royaltyVaultAddress error when call claimRevenue given royalty vault address is 0x", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x", 1, ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"], [1]]);

      try {
        await royaltyClient.claimRevenue({
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotIds: [1],
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to claim revenue: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 address is not set.",
        );
      }
    });

    it("should return txHash when call claimRevenue given correct args", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
      sinon.stub(royaltyClient.ipAccountClient, "execute").resolves({ txHash });
      const result = await royaltyClient.claimRevenue({
        account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        snapshotIds: [1],
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call claimRevenue given correct args and waitForTransaction is true by ip account", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
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

    it("should return txHash when call claimRevenue given correct args and waitForTransaction is true by EOA", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
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
  });

  describe("Test royaltyClient.snapshot", async function () {
    it("should throw royaltyVaultIpId error when call snapshot given royaltyVaultIpId is not registered", async function () {
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

    it("should throw royaltyVaultAddress error when call snapshot given royalty vault address is 0x", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x", 1, ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"], [1]]);

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

    it("should return txHash when call snapshot given correct args", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "snapshot").resolves(txHash);

      const result = await royaltyClient.snapshot({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call snapshot given correct args and waitForTransaction is true", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([
          true,
          "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          1,
          ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
          [1],
        ]);
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
});
