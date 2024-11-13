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
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    walletMock.account = accountMock;
    ipAccountClient = new IPAccountClient(rpcMock, walletMock);
    sinon.stub(IpAccountImplClient.prototype, "execute").resolves(txHash);
    sinon.stub(IpAccountImplClient.prototype, "executeEncode").returns({ data: "0x", to: "0x" });
    sinon.stub(IpAccountImplClient.prototype, "executeWithSig").resolves(txHash);
    sinon
      .stub(IpAccountImplClient.prototype, "state")
      .resolves({ result: "0x73fcb515cee99e4991465ef586cfe2b072ebb512" });
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
      const result = await ipAccountClient.execute({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call execute successfully with waitForTransaction", async () => {
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

    it("should return encodedTxData when call execute successfully with encodedTxDataOnly", async () => {
      const result = await ipAccountClient.execute({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
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
      const result = await ipAccountClient.executeWithSig({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call executeWithSig successfully with waitForTransaction", async () => {
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

    it("should return encodedTxData when call executeWithSig successfully with encodedTxDataOnly", async () => {
      const result = await ipAccountClient.executeWithSig({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        to: zeroAddress,
        value: 2,
        data: "0x11111111111111111111111111111",
        signer: zeroAddress,
        deadline: 20,
        signature: zeroAddress,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test getIpAccountNonce", () => {
    it("should throw invalid address error when call getIpAccountNonce given a wrong ipId", async () => {
      try {
        await ipAccountClient.getIpAccountNonce("0x123");
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to get the IP Account nonce: ipId address is invalid: 0x123, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });
    it("should return the state of the IP Account", async () => {
      const state = await ipAccountClient.getIpAccountNonce(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );
      expect(state).to.equal("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
    });
  });

  describe("Test getToken", () => {
    it("should invalid address error error when call getToken given a wrong ipId", async () => {
      try {
        await ipAccountClient.getToken("0x123");
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to get the token: ipId address is invalid: 0x123, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return the token information when call getToken with correct args", async () => {
      sinon.stub(IpAccountImplClient.prototype, "token").resolves([1513n, zeroAddress, 1n]);
      const token = await ipAccountClient.getToken("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      expect(token).to.deep.equal({ chainId: 1513n, tokenContract: zeroAddress, tokenId: 1n });
    });
  });
});
