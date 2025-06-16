import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SinonStub, stub } from "sinon";
import { Address, PublicClient, WalletClient } from "viem";

import { DisputeClient, DisputeTargetTag } from "../../../src";
import { IpAccountImplClient, WrappedIpClient } from "../../../src/abi/generated";
import { ipId, mockAddress, txHash } from "../mockData";
import { createMockPublicClient, createMockWalletClient, generateRandomHash } from "../testUtils";

use(chaiAsPromised);

describe("Test DisputeClient", () => {
  let disputeClient: DisputeClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    disputeClient = new DisputeClient(rpcMock, walletMock, 1315);
  });

  describe("raiseDispute", () => {
    const minimumBond: bigint = 10n;
    beforeEach(() => {
      // Mock the minimum bond to be 10
      rpcMock.readContract = stub().resolves(minimumBond);
    });
    it("throw address error when call raiseDispute with invalid targetIpId", async () => {
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(1000n);
      stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag").resolves({
        allowed: true,
      });
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
          bond: minimumBond + 1n,
          liveness: 2592000,
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to raise dispute: Invalid address: 0x.");
      }
    });

    it("throw liveness error when call raiseDispute given liveness out of range", async () => {
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(100n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
          bond: 15,
          liveness: 1,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to raise dispute: Liveness must be between 100 and 100000000000.",
        );
      }
    });

    it("throw bond error when call raiseDispute given bond more than max bonds", async () => {
      const maximumBond: bigint = 1000n;
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(maximumBond);
      const result = disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        bond: maximumBond + 1n,
        liveness: 2592000,
      });
      await expect(result).to.be.rejectedWith(
        `Bonds must be between ${minimumBond} and ${maximumBond}.`,
      );
    });

    it("throw bond error given bond less than min bonds", async () => {
      const maximumBond: bigint = 1000n;
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(maximumBond);
      const result = disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        bond: minimumBond - 1n,
        liveness: 2592000,
      });
      await expect(result).to.be.rejectedWith(
        `Bonds must be between ${minimumBond} and ${maximumBond}.`,
      );
    });

    it("should throw tag error when call raiseDispute given tag not whitelisted", async () => {
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(1000n);
      stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag").resolves({
        allowed: false,
      });
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          targetTag: "tag" as DisputeTargetTag,
          bond: minimumBond + 1n,
          liveness: 2592000,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to raise dispute: The target tag tag is not whitelisted.",
        );
      }
    });

    it("should return txHash and disputeId when call raiseDispute successfully", async () => {
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag").resolves({
        allowed: true,
      });
      stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      stub(disputeClient.disputeModuleClient, "parseTxDisputeRaisedEvent").returns([
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
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        bond: minimumBond + 1n,
        liveness: 2592000,
      });

      expect(result.txHash).equal(txHash);
      expect(result.disputeId).equal(1n);
    });

    it("should return encodedTxData when call raiseDispute successfully with encodedTxDataOnly", async () => {
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag").resolves({
        allowed: true,
      });
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        bond: minimumBond + 1n,
        liveness: 2592000,
        txOptions: { encodedTxDataOnly: true },
      });
      expect(result.encodedTxData?.data).to.be.a("string");
    });

    it("should return txHash when call raiseDispute successfully given bond is 1000", async () => {
      stub(disputeClient.arbitrationPolicyUmaClient, "minLiveness").resolves(0n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxLiveness").resolves(100000000000n);
      stub(disputeClient.arbitrationPolicyUmaClient, "maxBonds").resolves(100000000000n);
      stub(disputeClient.disputeModuleClient, "isWhitelistedDisputeTag").resolves({
        allowed: true,
      });
      stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      stub(disputeClient.disputeModuleClient, "parseTxDisputeRaisedEvent").returns([
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
      stub(WrappedIpClient.prototype, "balanceOf").resolves({ result: 0n });
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
        liveness: 2592000,
      });

      expect(result.txHash).equal(txHash);
    });
  });

  describe("cancelDispute", () => {
    it("should throw error when call cancelDispute failed", async () => {
      stub(disputeClient.disputeModuleClient, "cancelDispute").rejects(new Error("500"));
      try {
        await disputeClient.cancelDispute({
          disputeId: 1,
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to cancel dispute: 500");
      }
    });

    it("should return txHash when call cancelDispute successfully", async () => {
      stub(disputeClient.disputeModuleClient, "cancelDispute").resolves(txHash);
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
        data: "0x",
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call cancelDispute successfully", async () => {
      stub(disputeClient.disputeModuleClient, "cancelDispute").resolves(txHash);
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return encodedTxData when call cancelDispute successfully with encodedTxDataOnly", async () => {
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("resolveDispute", () => {
    it("should throw error when call resolveDispute failed", async () => {
      stub(disputeClient.disputeModuleClient, "resolveDispute").rejects(new Error("500"));
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
      const resolveDisputeStub = stub(disputeClient.disputeModuleClient, "resolveDispute").resolves(
        txHash,
      );
      await disputeClient.resolveDispute({
        disputeId: 1,
      });

      expect(resolveDisputeStub.args[0][0]).deep.equal({
        disputeId: 1n,
        data: "0x",
      });
    });

    it("should return txHash when call resolveDispute successfully", async () => {
      stub(disputeClient.disputeModuleClient, "resolveDispute").resolves(txHash);
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call resolveDispute successfully", async () => {
      stub(disputeClient.disputeModuleClient, "resolveDispute").resolves(txHash);
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return encodedTxData when call resolveDispute successfully with encodedTxDataOnly", async () => {
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("tagIfRelatedIpInfringed", () => {
    let aggregate3Stub: SinonStub;
    let tagIfRelatedIpInfringedStub: SinonStub;
    beforeEach(() => {
      tagIfRelatedIpInfringedStub = stub(
        disputeClient.disputeModuleClient,
        "tagIfRelatedIpInfringed",
      ).resolves(txHash);
    });
    it("should throw error when call tagIfRelatedIpInfringed failed", async () => {
      aggregate3Stub = stub(disputeClient.multicall3Client, "aggregate3").rejects(
        new Error("failed"),
      );
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
      aggregate3Stub = stub(disputeClient.multicall3Client, "aggregate3").resolves(txHash);
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
      expect(aggregate3Stub.callCount).equal(0);
      expect(tagIfRelatedIpInfringedStub.callCount).equal(2);
    });

    it("should call multicall3 when call tagIfRelatedIpInfringed give more than one infringementTags", async () => {
      aggregate3Stub = stub(disputeClient.multicall3Client, "aggregate3").resolves(txHash);
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
      expect(aggregate3Stub.callCount).equal(1);
      expect(tagIfRelatedIpInfringedStub.callCount).equal(0);
    });

    it("should not call multicall3 when call tagIfRelatedIpInfringed give only one infringementTags", async () => {
      aggregate3Stub = stub(disputeClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await disputeClient.tagIfRelatedIpInfringed({
        infringementTags: [
          {
            ipId: ipId,
            disputeId: 1,
          },
        ],
      });

      expect(result.length).equal(1);
      expect(aggregate3Stub.callCount).equal(0);
      expect(tagIfRelatedIpInfringedStub.callCount).equal(1);
    });
  });

  describe("disputeAssertion", () => {
    beforeEach(() => {
      rpcMock.readContract = stub().resolves({ bond: 0n });
      disputeClient = new DisputeClient(rpcMock, walletMock, 1315);
      (disputeClient.arbitrationPolicyUmaClient as { address: Address }).address = mockAddress;
    });

    it("should dispute assertion successfully", async () => {
      const accountExecuteMock = stub(IpAccountImplClient.prototype, "executeBatch").resolves(
        txHash,
      );
      stub(disputeClient.arbitrationPolicyUmaClient, "oov3").resolves(mockAddress);
      const result = await disputeClient.disputeAssertion({
        ipId,
        assertionId: generateRandomHash(),
        counterEvidenceCID: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      });
      expect(result.txHash).equal(txHash);
      expect(accountExecuteMock.callCount).equal(1);
    });
    it("should return txHash,receipt and disputeId when call disputeAssertion successfully", async () => {
      stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      stub(disputeClient.arbitrationPolicyUmaClient, "oov3").resolves(mockAddress);
      const result = await disputeClient.disputeAssertion({
        ipId,
        assertionId: generateRandomHash(),
        counterEvidenceCID: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      });
      expect(result.txHash).equal(txHash);
      expect(result.receipt).to.be.an("object");
    });
  });

  describe("disputeIdToAssertionId", () => {
    it("should return assertionId", async () => {
      const mockAssertionId = generateRandomHash();
      const mock = stub(
        disputeClient.arbitrationPolicyUmaClient,
        "disputeIdToAssertionId",
      ).resolves(mockAssertionId);
      const disputeId = BigInt(10);
      const result = await disputeClient.disputeIdToAssertionId(disputeId);
      expect(result).equal(mockAssertionId);
      expect(mock.args[0][0]).deep.equal({ disputeId });
    });
  });
});
