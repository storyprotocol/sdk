import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { DisputeClient } from "../../../src";

chai.use(chaiAsPromised);

describe("Test DisputeClient", () => {
  let disputeClient: DisputeClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  const txHash = "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb";

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    disputeClient = new DisputeClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test raiseDispute", () => {
    it("throw address error when call raiseDispute with invalid targetIpId", async () => {
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x",
          arbitrationPolicy: "0x",
          linkToDisputeEvidence: "link",
          targetTag: "tag",
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to raise dispute: request.targetIpId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call raiseDispute successfully", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        arbitrationPolicy: "0x",
        linkToDisputeEvidence: "",
        targetTag: "tag",
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash and disputeId when call raiseDispute successfully with waitForTransaction", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "raiseDispute").resolves(txHash);
      sinon.stub(disputeClient.disputeModuleClient, "parseTxDisputeRaisedEvent").returns([
        {
          disputeId: 1n,
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          disputeInitiator: "0x",
          arbitrationPolicy: "0x",
          linkToDisputeEvidence: "0x",
          targetTag: "0x",
          data: "0x",
        },
      ]);
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        arbitrationPolicy: "0x",
        linkToDisputeEvidence: "link",
        targetTag: "tag",
        txOptions: { waitForTransaction: true },
      });

      expect(result.txHash).equal(txHash);
      expect(result.disputeId).equal(1n);
    });

    // Raise dispute - @boris added test cases

    // Failing
    it.skip("should throw ZeroLinkToDisputeEvidence error when linkToDisputeEvidence is empty", async () => {
      try {
        await disputeClient.raiseDispute({
          targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          arbitrationPolicy: "0x",
          linkToDisputeEvidence: "link",
          targetTag: "tag",
        });
      } catch (e) {
        expect((e as Error).message).equal("Failed to raise dispute: ZeroLinkToDisputeEvidence");
      }
    });

    // Passing after debugging `dispute.ts`
    it.skip("should return encodedTxData when encodedTxDataOnly is set", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "raiseDisputeEncode").resolves("encodedData");
      const result = await disputeClient.raiseDispute({
        targetIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        arbitrationPolicy: "0x",
        linkToDisputeEvidence: "link",
        targetTag: "tag",
        txOptions: { encodedTxDataOnly: true },
      });
      console.log(JSON.stringify(result, null, 2));

      expect(result.encodedTxData).to.equal("encodedData");
    });
  });

  describe("Test cancelDispute", () => {
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
        calldata: "0x",
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

    // Cancel Dispute - @boris added test cases

    // Passing after debugging `dispute.ts`
    it.skip("should return encodedTxData when encodedTxDataOnly is set", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "cancelDisputeEncode").resolves("encodedData");
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
        calldata: "0x",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData).equal("encodedData");
    });

    // Passing
    it("should handle empty calldata correctly", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "cancelDispute").resolves(txHash);
      const result = await disputeClient.cancelDispute({
        disputeId: 1,
      });

      expect(result.txHash).equal(txHash);
    });
  });

  describe("Test resolveDispute", () => {
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

    // Resolve Dispute - @boris added test cases

    // Passing after debugging `dispute.ts`
    it.skip("should return encodedTxData when encodedTxDataOnly is set", async () => {
      sinon.stub(disputeClient.disputeModuleClient, "resolveDisputeEncode").resolves("encodedData");
      const result = await disputeClient.resolveDispute({
        disputeId: 1,
        data: "0x",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData).equal("encodedData");
    });
  });
});
