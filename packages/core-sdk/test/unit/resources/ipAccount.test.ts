import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAccountClient } from "../../../src/resources/ipAccount";
import { IPAccountExecuteRequest, IPAccountExecuteWithSigRequest } from "../../../src";
import * as utils from "../../../src/utils/utils";
import { Account, PublicClient, WalletClient, zeroAddress } from "viem";
const { IpAccountImplClient } = require("../../../src/abi/generated");

describe("Test IPAccountClient", () => {
  let ipAccountClient: IPAccountClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    walletMock.account = accountMock;
    ipAccountClient = new IPAccountClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test execute", async () => {
    it("should throw invalid address error when accountAddress is invalid", async () => {
      const request: IPAccountExecuteRequest = {
        accountAddress: "0x123", // invalid address
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
      };
      try {
        await ipAccountClient.execute(request);
      } catch (err) {
        expect((err as Error).message).includes('Address "0x123" is invalid');
      }
    });
    it("should throw simulateContract error when simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().rejects(new Error("simulateContract error"));
      const request: IPAccountExecuteRequest = {
        accountAddress: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
      };
      try {
        await ipAccountClient.execute(request);
      } catch (err) {
        expect((err as Error).message).includes("simulateContract error");
      }
    });

    it("should throw writeContract error when writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("writeContract error"));
      const request: IPAccountExecuteRequest = {
        accountAddress: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
      };
      try {
        await ipAccountClient.execute(request);
      } catch (err) {
        expect((err as Error).message).includes("writeContract error");
      }
    });

    it("should throw waitTx error when waitTx throws an error", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTx").rejects(new Error("waitTx error"));
      const request: IPAccountExecuteRequest = {
        accountAddress: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await ipAccountClient.execute(request);
      } catch (err) {
        expect((err as Error).message).includes("waitTx error");
      }
    });

    it("should return txHash if waitTx succeeds", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTx").resolves();
      const request: IPAccountExecuteRequest = {
        accountAddress: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: {
          waitForTransaction: true,
        },
      };

      const result = await ipAccountClient.execute(request);
      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash if txOptions is falsy", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTx").rejects(new Error("waitTx error"));
      const request: IPAccountExecuteRequest = {
        accountAddress: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: {
          waitForTransaction: false,
        },
      };

      const result = await ipAccountClient.execute(request);
      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test executeWithSig", () => {
    it("should throw invalid address error when accountAddress is invalid", async () => {
      const request: IPAccountExecuteWithSigRequest = {
        ipId: "0x123", // invalid address
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
      };
      try {
        await ipAccountClient.executeWithSig(request);
      } catch (err) {
        expect((err as Error).message).includes('Address "0x123" is invalid');
      }
    });

    it("should throw simulateContract error when simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().rejects(new Error("simulateContract error"));
      const request: IPAccountExecuteWithSigRequest = {
        ipId: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
      };
      try {
        await ipAccountClient.executeWithSig(request);
      } catch (err) {
        expect((err as Error).message).includes("simulateContract error");
      }
    });

    it("should throw writeContract error when writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("writeContract error"));
      const request: IPAccountExecuteWithSigRequest = {
        ipId: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
      };
      try {
        await ipAccountClient.executeWithSig(request);
      } catch (err) {
        expect((err as Error).message).includes("writeContract error");
      }
    });

    it("should throw waitTx error when waitTx throws an error", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTx").rejects(new Error("waitTx error"));
      const request: IPAccountExecuteWithSigRequest = {
        ipId: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await ipAccountClient.executeWithSig(request);
      } catch (err) {
        expect((err as Error).message).includes("waitTx error");
      }
    });

    it("should return txHash when waitTx succeeds", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTx").resolves();
      const request: IPAccountExecuteWithSigRequest = {
        ipId: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const result = await ipAccountClient.executeWithSig(request);
      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash if txOptions is falsy", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTx").rejects(new Error("waitTx error"));
      const request: IPAccountExecuteWithSigRequest = {
        ipId: zeroAddress,
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: {
          waitForTransaction: false,
        },
      };

      const result = await ipAccountClient.executeWithSig(request);
      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test getIpAccountNonce", () => {
    it("should return the state of the IP Account", async () => {
      sinon.stub(IpAccountImplClient.prototype, "state").resolves(1n);
      const state = await ipAccountClient.getIpAccountNonce(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );
      expect(state).to.equal(1n);
    });
  });
});
