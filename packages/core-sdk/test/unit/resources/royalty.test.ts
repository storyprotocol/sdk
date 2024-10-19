import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient, WalletClient, Account } from "viem";
import chaiAsPromised from "chai-as-promised";
import { RoyaltyClient } from "../../../src/resources/royalty";
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
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x",
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotId: 1,
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: request.royaltyVaultIpId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call claimableRevenue given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
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
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      try {
        await royaltyClient.claimRevenue({
          account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          snapshotIds: [1],
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to claim revenue: request.royaltyVaultIpId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });
    it("should return encodedData when call claimRevenue given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(royaltyClient.ipAccountClient, "execute")
        .resolves({ encodedTxData: { data: "0x", to: "0x" } });

      const result = await royaltyClient.claimRevenue({
        account: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        snapshotIds: [1],
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
    it("should return txHash when call claimRevenue given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
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
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueOnBehalfBySnapshotBatch")
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
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueOnBehalfBySnapshotBatch")
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
    it("should return encodedData when call claimRevenue given correct args and encodedTxDataOnly is true by EOA", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "claimRevenueOnBehalfBySnapshotBatchEncode")
        .returns({ data: "0x", to: "0x" });

      const result = await royaltyClient.claimRevenue({
        snapshotIds: [1],
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
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
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      try {
        await royaltyClient.snapshot({
          royaltyVaultIpId: "0x",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to snapshot: request.royaltyVaultIpId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call snapshot given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon.stub(IpRoyaltyVaultImplClient.prototype, "snapshot").resolves(txHash);

      const result = await royaltyClient.snapshot({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call snapshot given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
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

    it("should return encodedData when call snapshot given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(IpRoyaltyVaultImplClient.prototype, "snapshotEncode")
        .returns({ data: "0x", to: "0x" });

      const result = await royaltyClient.snapshot({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test royaltyClient.snapshotAndClaimBySnapshotBatch", async () => {
    it("it should throw royaltyVaultIpId error when call snapshotAndClaimBySnapshotBatch given royaltyVaultIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.snapshotAndClaimBySnapshotBatch({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          unclaimedSnapshotIds: [1],
          currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to snapshot and claim by snapshot batch: The royalty vault IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });
    it("should return encodedData when call snapshotAndClaimBySnapshotBatch given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon.stub(royaltyClient.ipAccountClient, "execute").resolves({ txHash });

      const result = await royaltyClient.snapshotAndClaimBySnapshotBatch({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        unclaimedSnapshotIds: [1],
        currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
    it("should return txHash when call snapshotAndClaimBySnapshotBatch given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "snapshotAndClaimBySnapshotBatch")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await royaltyClient.snapshotAndClaimBySnapshotBatch({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        unclaimedSnapshotIds: [1],
        currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call snapshotAndClaimBySnapshotBatch given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "snapshotAndClaimBySnapshotBatch")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1n,
          },
        ]);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxSnapshotCompletedEvent")
        .returns([
          {
            snapshotId: 1n,
            snapshotTimestamp: 1n,
          },
        ]);

      const result = await royaltyClient.snapshotAndClaimBySnapshotBatch({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        unclaimedSnapshotIds: [1],
        currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.snapshotId).equals(1n);
      expect(result.amountsClaimed).equals(1n);
    });
  });

  describe("Test royaltyClient.transferToVaultAndSnapshotAndClaimByTokenBatch", async () => {
    it("should throw royaltyClaimDetails error when call transferToVaultAndSnapshotAndClaimByTokenBatch given royaltyClaimDetails is empty", async () => {
      try {
        await royaltyClient.transferToVaultAndSnapshotAndClaimByTokenBatch({
          royaltyClaimDetails: [],
          ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to transfer to vault and snapshot and claim by token batch: The royaltyClaimDetails must provide at least one item.",
        );
      }
    });

    it("should throw ancestorIpId error when call transferToVaultAndSnapshotAndClaimByTokenBatch given ancestorIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.transferToVaultAndSnapshotAndClaimByTokenBatch({
          royaltyClaimDetails: [
            {
              childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              amount: 1,
            },
          ],
          ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to transfer to vault and snapshot and claim by token batch: The ancestor IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should return encodedData when call transferToVaultAndSnapshotAndClaimByTokenBatch given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          royaltyClient.royaltyWorkflowsClient,
          "transferToVaultAndSnapshotAndClaimByTokenBatchEncode",
        )
        .returns({ data: "0x", to: "0x" });
      const result = await royaltyClient.transferToVaultAndSnapshotAndClaimByTokenBatch({
        royaltyClaimDetails: [
          {
            childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1,
          },
        ],
        ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).equals("0x");
    });

    it("should return txHash when call transferToVaultAndSnapshotAndClaimByTokenBatch given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          royaltyClient.royaltyWorkflowsClient,
          "transferToVaultAndSnapshotAndClaimByTokenBatch",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await royaltyClient.transferToVaultAndSnapshotAndClaimByTokenBatch({
        royaltyClaimDetails: [
          {
            childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1,
          },
        ],
        ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call transferToVaultAndSnapshotAndClaimByTokenBatch given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          royaltyClient.royaltyWorkflowsClient,
          "transferToVaultAndSnapshotAndClaimByTokenBatch",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1n,
          },
        ]);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxSnapshotCompletedEvent")
        .returns([
          {
            snapshotId: 1n,
            snapshotTimestamp: 1n,
          },
        ]);
      const result = await royaltyClient.transferToVaultAndSnapshotAndClaimByTokenBatch({
        royaltyClaimDetails: [
          {
            childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1,
          },
        ],
        ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.snapshotId).equals(1n);
      expect(result.amountsClaimed).equals(1n);
    });
  });

  describe("Test royaltyClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch", async () => {
    it("should throw royaltyClaimDetails error when call transferToVaultAndSnapshotAndClaimBySnapshotBatch given royaltyClaimDetails is empty", async () => {
      try {
        await royaltyClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch({
          royaltyClaimDetails: [],
          ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          unclaimedSnapshotIds: [1],
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to transfer to vault and snapshot and claim by snapshot batch: The royaltyClaimDetails must provide at least one item.",
        );
      }
    });

    it("should throw ancestorIpId error when call transferToVaultAndSnapshotAndClaimBySnapshotBatch given ancestorIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch({
          royaltyClaimDetails: [
            {
              childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              amount: 1,
            },
          ],
          ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          unclaimedSnapshotIds: [1],
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to transfer to vault and snapshot and claim by snapshot batch: The ancestor IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should return encodedData when call transferToVaultAndSnapshotAndClaimBySnapshotBatch given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          royaltyClient.royaltyWorkflowsClient,
          "transferToVaultAndSnapshotAndClaimBySnapshotBatchEncode",
        )
        .returns({ data: "0x", to: "0x" });
      const result = await royaltyClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch({
        royaltyClaimDetails: [
          {
            childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1,
          },
        ],
        ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        unclaimedSnapshotIds: [1],
        txOptions: { encodedTxDataOnly: true },
      });
      expect(result.encodedTxData?.data).equals("0x");
    });

    it("should return txHash when call transferToVaultAndSnapshotAndClaimBySnapshotBatch given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          royaltyClient.royaltyWorkflowsClient,
          "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await royaltyClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch({
        royaltyClaimDetails: [
          {
            childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1,
          },
        ],
        ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        unclaimedSnapshotIds: [1],
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call transferToVaultAndSnapshotAndClaimBySnapshotBatch given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          royaltyClient.royaltyWorkflowsClient,
          "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1n,
          },
        ]);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxSnapshotCompletedEvent")
        .returns([
          {
            snapshotId: 1n,
            snapshotTimestamp: 1n,
          },
        ]);

      const result = await royaltyClient.transferToVaultAndSnapshotAndClaimBySnapshotBatch({
        royaltyClaimDetails: [
          {
            childIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            royaltyPolicy: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            currencyToken: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1,
          },
        ],
        ancestorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        unclaimedSnapshotIds: [1],
        txOptions: { waitForTransaction: true },
      });
    });
  });

  describe("Test royaltyClient.snapshotAndClaimByTokenBatch", async () => {
    it("should throw ip register error when call snapshotAndClaimByTokenBatch given ip is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.snapshotAndClaimByTokenBatch({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to snapshot and claim by token batch: The royalty vault IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should return txHash when call snapshotAndClaimByTokenBatch given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "snapshotAndClaimByTokenBatch")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await royaltyClient.snapshotAndClaimByTokenBatch({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
      });

      expect(result.txHash).equals(txHash);
    });

    it("should return txHash when call snapshotAndClaimByTokenBatch given correct args and waitForTransaction is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "snapshotAndClaimByTokenBatch")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxRevenueTokenClaimedEvent")
        .returns([
          {
            claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            amount: 1n,
          },
        ]);
      sinon
        .stub(royaltyClient.ipRoyaltyVaultImplEventClient, "parseTxSnapshotCompletedEvent")
        .returns([
          {
            snapshotId: 1n,
            snapshotTimestamp: 1n,
          },
        ]);

      const result = await royaltyClient.snapshotAndClaimByTokenBatch({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equals(txHash);
      expect(result.snapshotId).equals(1n);
      expect(result.amountsClaimed).equals(1n);
    });

    it("should return encodedData when call snapshotAndClaimByTokenBatch given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyWorkflowsClient, "snapshotAndClaimByTokenBatchEncode")
        .returns({ data: "0x", to: "0x" });
      const result = await royaltyClient.snapshotAndClaimByTokenBatch({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        currencyTokens: ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"],
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).equals("0x");
    });
  });
});
