import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAccountClient } from "../../../src/resources/ipAccount";
import { IPAccountExecuteRequest, IPAccountExecuteWithSigRequest } from "../../../src";
import * as utils from "../../../src/utils/utils";
import { Account, PublicClient, WalletClient, zeroAddress, parseUnits } from "viem";
const { IpAccountImplClient } = require("../../../src/abi/generated");

describe("Test IPAccountClient", () => {
  let ipAccountClient: IPAccountClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

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
        ipId: "0x123", // invalid address
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: {
          waitForTransaction: true,
          maxFeePerGas: parseUnits("100", 9),
        },
      };
      try {
        await ipAccountClient.execute(request);
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to execute the IP Account transaction: request.ipId address is invalid: 0x123, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call execute successfully", async () => {
      sinon.stub(IpAccountImplClient.prototype, "execute").resolves(txHash);
      const result = await ipAccountClient.execute({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call execute successfully with waitForTransaction", async () => {
      sinon.stub(IpAccountImplClient.prototype, "execute").resolves(txHash);
      sinon.stub(utils, "waitTx").resolves();
      const result = await ipAccountClient.execute({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should handle timeout when executing IP account transaction", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(IpAccountImplClient.prototype, "execute").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        throw new Error("Timeout");
      });

      const executePromise = ipAccountClient.execute({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: { waitForTransaction: true, timeout: 2000 },
      });

      clock.tick(3000);

      await expect(executePromise).to.be.rejectedWith("Timeout");

      clock.restore();
    });

    it("should not raise a timeout error when executing IP account transaction completes within the timeout", async () => {
      const clock = sinon.useFakeTimers();
      sinon.stub(IpAccountImplClient.prototype, "execute").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          blockHash: "0xmockBlockHash",
          blockNumber: BigInt(12345),
          contractAddress: null,
          cumulativeGasUsed: BigInt(21000),
          from: "0xmockFromAddress",
          gasUsed: BigInt(21000),
          logs: [],
          logsBloom: "0xmockLogsBloom",
          status: "success",
          to: "0xmockToAddress",
          transactionHash: "0xmockTransactionHash",
          transactionIndex: 1,
          type: "0x0",
          effectiveGasPrice: BigInt(1000000000),
        };
      });

      const executePromise = ipAccountClient.execute({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: { waitForTransaction: true, timeout: 2000 },
      });

      clock.tick(1000);

      await expect(executePromise).to.not.be.rejectedWith("Timeout");

      clock.restore();
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
        expect((err as Error).message).equal(
          "Failed to execute with signature for the IP Account transaction: request.ipId address is invalid: 0x123, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call executeWithSig successfully", async () => {
      sinon.stub(IpAccountImplClient.prototype, "executeWithSig").resolves(txHash);
      const result = await ipAccountClient.executeWithSig({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call executeWithSig successfully with waitForTransaction", async () => {
      sinon.stub(IpAccountImplClient.prototype, "executeWithSig").resolves(txHash);
      sinon.stub(utils, "waitTx").resolves();
      const result = await ipAccountClient.executeWithSig({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should handle timeout when executing IP account transaction with signature", async () => {
      const clock = sinon.useFakeTimers();

      sinon.stub(IpAccountImplClient.prototype, "executeWithSig").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        throw new Error("Timeout");
      });

      const executeWithSigPromise = ipAccountClient.executeWithSig({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: { waitForTransaction: true, timeout: 2000 },
      });

      clock.tick(3000);

      await expect(executeWithSigPromise).to.be.rejectedWith("Timeout");

      clock.restore();
    });

    it("should not raise a timeout error when executing IP account transaction with signature completes within the timeout", async () => {
      const clock = sinon.useFakeTimers();

      sinon.stub(IpAccountImplClient.prototype, "executeWithSig").callsFake(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          blockHash: "0xmockBlockHash",
          blockNumber: BigInt(12345),
          contractAddress: null,
          cumulativeGasUsed: BigInt(21000),
          from: "0xmockFromAddress",
          gasUsed: BigInt(21000),
          logs: [],
          logsBloom: "0xmockLogsBloom",
          status: "success",
          to: "0xmockToAddress",
          transactionHash: "0xmockTransactionHash",
          transactionIndex: 1,
          type: "0x0",
          effectiveGasPrice: BigInt(1000000000),
        };
      });

      const executeWithSigPromise = ipAccountClient.executeWithSig({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: { waitForTransaction: true, timeout: 2000 },
      });

      clock.tick(1000);

      await expect(executeWithSigPromise).to.not.be.rejectedWith("Timeout");

      clock.restore();
    });
  });

  describe("Test getIpAccountNonce", () => {
    it("should return the state of the IP Account", async () => {
      sinon
        .stub(IpAccountImplClient.prototype, "state")
        .resolves({ result: "0x73fcb515cee99e4991465ef586cfe2b072ebb512" });
      const state = await ipAccountClient.getIpAccountNonce(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );
      expect(state).to.equal("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
    });
  });
});
