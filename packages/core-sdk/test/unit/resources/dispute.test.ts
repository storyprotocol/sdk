import * as sinon from "sinon";
import { createMock, generateRandomHash } from "../testUtils";
import { ipId, mockAddress, txHash } from "../mockData";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Account, PublicClient, WalletClient } from "viem";
import { DisputeClient } from "../../../src";
import { IpAccountImplClient, WrappedIpClient } from "../../../src/abi/generated";

chai.use(chaiAsPromised);

describe("Test DisputeClient", () => {
  let disputeClient: DisputeClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    rpcMock.getBalance = sinon.stub().resolves(1000n);
    rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
    walletMock = createMock<WalletClient>();
    walletMock.writeContract = sinon.stub().resolves(txHash);
    const accountMock = createMock<Account>();
    accountMock.address = mockAddress;
    walletMock.account = accountMock;
    disputeClient = new DisputeClient(rpcMock, walletMock, "1315");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("raiseDispute", () => {
    it("throw address error when call raiseDispute with invalid targetIpId", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(1000n);
      sinon
        .stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag")
        .resolves({ allowed: true });
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: "tag",
          bond: 0,
          liveness: 2592000,
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to raise dispute: Invalid address: 0x.");
      }
    });

    it("throw liveness error when call raiseDispute given liveness out of range", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(100n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: "tag",
          bond: 0,
          liveness: 1,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to raise dispute: Liveness must be between 100 and 100000000000.",
        );
      }
    });

    it("throw bond error when call raiseDispute given bond more than max bonds", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(1000n);
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: "tag",
          bond: 100000000001,
          liveness: 2592000,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to raise dispute: Bonds must be less than 1000.",
        );
      }
    });

    it("should throw tag error when call raiseDispute given tag not whitelisted", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(1000n);
      sinon
        .stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag")
        .resolves({ allowed: false });
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: "tag",
          bond: 0,
          liveness: 2592000,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to raise dispute: The target tag tag is not whitelisted.",
        );
      }
    });
    it("should return txHash when call raiseDispute successfully", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      sinon
        .stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag")
        .resolves({ allowed: true });

      sinon.stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: "tag",
        bond: 0,
        liveness: 2592000,
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash and disputeId when call raiseDispute successfully with waitForTransaction", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      sinon
        .stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag")
        .resolves({ allowed: true });
      sinon.stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      sinon.stub(disputeClient.disputeModuleClient, "parseTxDisputeRaisedEvent").returns([
        {
          disputeId: 1n,
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          disputeInitiator: "0x",
          arbitrationPolicy: "0x",
          disputeEvidenceHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          targetTag: "0x",
          data: "0x",
          disputeTimestamp: 1715000000n,
        },
      ]);
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: "tag",
        bond: 0,
        liveness: 2592000,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equal(txHash);
      expect(result.disputeId).equal(1n);
    });

    it("should return encodedTxData when call raiseDispute successfully with encodedTxDataOnly", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      sinon
        .stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag")
        .resolves({ allowed: true });
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: "tag",
        bond: 0,
        liveness: 2592000,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should return txHash when call raiseDispute successfully given bond is 1000", async () => {
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      sinon
        .stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag")
        .resolves({ allowed: true });
      sinon.stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      sinon.stub(disputeClient.disputeModuleClient, "parseTxDisputeRaisedEvent").returns([
        {
          disputeId: 1n,
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          disputeInitiator: "0x",
          arbitrationPolicy: "0x",
          disputeEvidenceHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          targetTag: "0x",
          data: "0x",
          disputeTimestamp: 1715000000n,
        },
      ]);
      sinon.stub(WrappedIpClient.prototype, "balanceOf").resolves({ result: 0n });
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: "tag",
        bond: 1000,
        liveness: 2592000,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equal(txHash);
    });
  });

  describe("cancelDispute", () => {
    it("should throw error when call cancelDispute failed", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "cancelDispute").rejects(new Error("500"));
      try {
        await disputeClient.cancelDispute({
          disputeId: 1,
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to cancel dispute: 500");
      }
    });

    it("should return txHash when call cancelDispute successfully", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "cancelDispute").resolves(txHash);
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
        data: "0x",
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call cancelDispute successfully with waitForTransaction", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "cancelDispute").resolves(txHash);
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return encodedTxData when call cancelDispute successfully with encodedTxDataOnly", async () => {
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("resolveDispute", () => {
    it("should throw error when call resolveDispute failed", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "resolveDispute").rejects(new Error("500"));
      try {
        await disputeClient.resolveDispute({
          disputeId: 1,
          data: "0x",
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to resolve dispute: 500");
      }
    });

    it("should use default data when data is not provided", async () => {
      const resolveDisputeStub = sinon
        .stub(disputeClient.disputeModuleClient, "resolveDispute")
        .resolves(txHash);
      await disputeClient.resolveDispute({
        disputeId: 1,
      });

      expect(resolveDisputeStub.calledWith({ disputeId: 1n, data: "0x" })).to.be.true;
    });

    it("should return txHash when call resolveDispute successfully", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "resolveDispute").resolves(txHash);
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call resolveDispute successfully with waitForTransaction", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "resolveDispute").resolves(txHash);
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return encodedTxData when call resolveDispute successfully with encodedTxDataOnly", async () => {
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("tagIfRelatedIpInfringed", () => {
    let aggregate3Stub: sinon.SinonStub;
    let tagIfRelatedIpInfringedStub: sinon.SinonStub;
    beforeEach(() => {
      tagIfRelatedIpInfringedStub = sinon
        .stub(disputeClient.disputeModuleClient, "tagIfRelatedIpInfringed")
        .resolves(txHash);
    });
    it("should throw error when call tagIfRelatedIpInfringed failed", async () => {
      aggregate3Stub = sinon
        .stub(disputeClient.multicall3Client, "aggregate3")
        .rejects(new Error("failed"));
      try {
        await disputeClient.tagIfRelatedIpInfringed({
          infringementTags: [
            { ipId: ipId, disputeId: 1 },
            { ipId: ipId, disputeId: 1 },
          ],
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to tag related ip infringed: failed");
      }
    });
    it("should not call multicall3 when call tagIfRelatedIpInfringed give disable useMulticallWhenPossible", async () => {
      aggregate3Stub = sinon.stub(disputeClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await disputeClient.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: ipId,
            disputeId: 1,
          },
          {
            ipId: ipId,
            disputeId: 1,
          },
        ],
        options: { useMulticallWhenPossible: false },
      });

      expect(result.length).equal(2);
      expect(aggregate3Stub.called).to.be.false;
      expect(tagIfRelatedIpInfringedStub.callCount).equal(2);
    });

    it("should call multicall3 when call tagIfRelatedIpInfringed give more than one infringementTags", async () => {
      aggregate3Stub = sinon.stub(disputeClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await disputeClient.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: ipId,
            disputeId: 1,
          },
          {
            ipId: ipId,
            disputeId: 1,
          },
        ],
      });

      expect(result.length).equal(1);
      expect(aggregate3Stub.calledOnce).to.be.true;
      expect(tagIfRelatedIpInfringedStub.callCount).equal(0);
    });

    it("should not call multicall3 when call tagIfRelatedIpInfringed give only one infringementTags", async () => {
      aggregate3Stub = sinon.stub(disputeClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await disputeClient.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: ipId,
            disputeId: 1,
          },
        ],
      });

      expect(result.length).equal(1);
      expect(aggregate3Stub.called).to.be.false;
      expect(tagIfRelatedIpInfringedStub.calledOnce).to.be.true;
    });
  });

  describe("disputeAssertion", () => {
    beforeEach(() => {
      rpcMock.readContract = sinon.stub().resolves({ bond: 0n });
      disputeClient = new DisputeClient(rpcMock, walletMock, "1315");
      (disputeClient.arbitrationPolicyUmaClient as any).address = mockAddress;
    });

    it("should dispute assertion successfully", async () => {
      const accountExecuteMock = sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .resolves(txHash);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "oov3").resolves(mockAddress);
      const result = await disputeClient.disputeAssertion({
        ipId,
        assertionId: generateRandomHash(),
        counterEvidenceCID: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      });
      expect(result.txHash).equal(txHash);
      expect(accountExecuteMock.calledOnce).to.be.true;
    });
    it("should return txHash,receipt and disputeId when call disputeAssertion successfully with waitForTransaction", async () => {
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      sinon.stub(disputeClient.arbitrationPolicyUmaClient, "oov3").resolves(mockAddress);
      const result = await disputeClient.disputeAssertion({
        ipId,
        assertionId: generateRandomHash(),
        counterEvidenceCID: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).equal(txHash);
      expect(result.receipt).not.undefined;
    });
  });

  describe("disputeIdToAssertionId", () => {
    it("should return assertionId", async () => {
      const mockAssertionId = generateRandomHash();
      const mock = sinon
        .stub(disputeClient.arbitrationPolicyUmaClient, "disputeIdToAssertionId")
        .resolves(mockAssertionId);
      const disputeId = BigInt(10);
      const result = await disputeClient.disputeIdToAssertionId(disputeId);
      expect(result).equal(mockAssertionId);
      expect(mock.calledOnceWith({ disputeId })).to.be.true;
    });
  });
});
