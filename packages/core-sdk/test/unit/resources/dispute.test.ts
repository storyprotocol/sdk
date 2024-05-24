import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { CancelDisputeRequest, DisputeClient, ResolveDisputeRequest } from "../../../src";
import { DisputeModuleClient } from "../../../src/abi/generated";

chai.use(chaiAsPromised);

describe("Test DisputeClient", () => {
  let disputeClient: DisputeClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  const mock = {
    txHash: "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb",
  };

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    disputeClient = new DisputeClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Should be able to", async () => {
    const targetIpId =
      "0xa3028b46ff4aeba585ebfa1c241ad4a453b6f10dc7bc3d3ebaa9cecc680a6f71" as `0x${string}`;
    const arbitrationPolicy = "0xC6A1c49BCeeE2E512167d5c03e4753776477730b" as `0x${string}`;
    const linkToDisputeEvidence = "foo";
    const targetTag = "bar";

    it("should throw simulateContract error if simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      const raiseDisputeRequest = {
        targetIpId,
        arbitrationPolicy,
        linkToDisputeEvidence,
        targetTag,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await disputeClient.raiseDispute(raiseDisputeRequest);
      } catch (err) {
        expect((err as Error).message).includes("simulateContract error");
      }
    });

    it("should throw writeContract error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const raiseDisputeRequest = {
        targetIpId,
        arbitrationPolicy,
        linkToDisputeEvidence,
        targetTag,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await disputeClient.raiseDispute(raiseDisputeRequest);
      } catch (err) {
        expect((err as Error).message).includes("writeContract error");
      }
    });

    it("should return txHash only if request.txOptions is missing", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);
      disputeClient.disputeModuleClient.parseTxDisputeRaisedEvent = sinon.stub().resolves([
        {
          disputeId: "7",
        },
      ]);
      const raiseDisputeRequest = {
        targetIpId,
        arbitrationPolicy,
        linkToDisputeEvidence,
        targetTag,
      };

      const result = await disputeClient.raiseDispute(raiseDisputeRequest);
      expect(Object.keys(result).length).to.equal(1);
      expect(Object.keys(result)[0]).to.equal("txHash");
      expect(result.txHash).to.equal(mock.txHash);
    });

    it("should return txHash and disputeId if request.txOptions is present", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});

      disputeClient.disputeModuleClient = createMock<DisputeModuleClient>();
      disputeClient.disputeModuleClient.raiseDispute = sinon.stub().resolves(mock.txHash);
      disputeClient.disputeModuleClient.parseTxDisputeRaisedEvent = sinon.stub().returns([
        {
          disputeId: "7",
        },
      ]);
      const raiseDisputeRequest = {
        targetIpId,
        arbitrationPolicy,
        linkToDisputeEvidence,
        targetTag,
        txOptions: {
          waitForTransaction: true,
        },
      };

      const result = await disputeClient.raiseDispute(raiseDisputeRequest);
      expect(result.txHash).to.equal(mock.txHash);
      expect(result.disputeId).to.equal(BigInt(7).toString());
    });
  });

  describe("test for cancelDispute", () => {
    it("should throw simulateContract error if simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      const cancelDisputeRequest: CancelDisputeRequest = {
        disputeId: 1,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await disputeClient.cancelDispute(cancelDisputeRequest);
      } catch (err) {
        expect((err as Error).message.includes("simulateContract error"));
      }
    });

    it("should throw writeContract error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const cancelDisputeRequest: CancelDisputeRequest = {
        disputeId: 1,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await disputeClient.cancelDispute(cancelDisputeRequest);
      } catch (err) {
        expect((err as Error).message.includes("writeContract error"));
      }
    });

    it("should return txHash", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);
      const cancelDisputeRequest: CancelDisputeRequest = {
        disputeId: 1,
        txOptions: {
          waitForTransaction: true,
        },
      };

      const result = await disputeClient.cancelDispute(cancelDisputeRequest);
      expect(result.txHash).to.equal(mock.txHash);
    });
    it("should return txHash if txOptions.waitForTransaction is falsy", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);
      const cancelDisputeRequest: CancelDisputeRequest = {
        disputeId: 1,
        calldata: "0x1111",
        txOptions: {
          waitForTransaction: false,
        },
      };

      const result = await disputeClient.cancelDispute(cancelDisputeRequest);
      expect(result.txHash).to.equal(mock.txHash);
    });
  });

  describe("test for resolveDispute", () => {
    it("should throw simulateContract error if simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 1,
        data: "0x1111",
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await disputeClient.resolveDispute(resolveDisputeRequest);
      } catch (err) {
        expect((err as Error).message.includes("simulateContract error"));
      }
    });

    it("should throw writeContract error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 1,
        data: "0x1111",
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await disputeClient.resolveDispute(resolveDisputeRequest);
      } catch (err) {
        expect((err as Error).message.includes("writeContract error"));
      }
    });

    it("should return txHash", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);
      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 1,
        data: "0x1111",
        txOptions: {
          waitForTransaction: true,
        },
      };

      const result = await disputeClient.resolveDispute(resolveDisputeRequest);
      expect(result.txHash).to.equal(mock.txHash);
    });
    it("should return txHash if txOptions.waitForTransaction is falsy", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);
      const resolveDisputeRequest: ResolveDisputeRequest = {
        disputeId: 1,
        data: "0x1111",
        txOptions: {
          waitForTransaction: false,
        },
      };

      const result = await disputeClient.resolveDispute(resolveDisputeRequest);
      expect(result.txHash).to.equal(mock.txHash);
    });
  });
});
