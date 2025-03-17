import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAccountClient } from "../../../src/resources/ipAccount";
import {
  IPAccountExecuteRequest,
  IPAccountExecuteWithSigRequest,
  WIP_TOKEN_ADDRESS,
} from "../../../src";
import * as utils from "../../../src/utils/utils";
import { Account, PublicClient, toHex, WalletClient, zeroAddress } from "viem";
import { aeneid, ipId, txHash } from "../mockData";
import { IpAccountImplClient } from "../../../src/abi/generated";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("Test IPAccountClient", () => {
  let ipAccountClient: IPAccountClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    walletMock.account = accountMock;
    ipAccountClient = new IPAccountClient(rpcMock, walletMock, aeneid);
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
          "Failed to execute the IP Account transaction: Invalid address: 0x123.",
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
          "Failed to execute with signature for the IP Account transaction: Invalid address: 0x123.",
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
          "Failed to get the IP Account nonce: Invalid address: 0x123.",
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
        expect((err as Error).message).equal("Failed to get the token: Invalid address: 0x123.");
      }
    });

    it("should return the token information when call getToken with correct args", async () => {
      sinon.stub(IpAccountImplClient.prototype, "token").resolves([1513n, zeroAddress, 1n]);
      const token = await ipAccountClient.getToken("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      expect(token).to.deep.equal({ chainId: 1513n, tokenContract: zeroAddress, tokenId: 1n });
    });
  });

  describe("Test setIpMetadata", () => {
    it("should throw error when call setIpMetadata given wrong ipId", async () => {
      try {
        await ipAccountClient.setIpMetadata({
          ipId: "0x",
          metadataURI: "https://example.com",
          metadataHash: toHex("test", { size: 32 }),
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to set the IP metadata: Invalid address: 0x.");
      }
    });
    it("should return txHash when call setIpMetadata successfully", async () => {
      const result = await ipAccountClient.setIpMetadata({
        ipId: ipId,
        metadataURI: "https://example.com",
        metadataHash: toHex("test", { size: 32 }),
      });
      expect(result).to.equal(txHash);
    });
  });

  describe("Test transferErc20", () => {
    it("should throw error when call transferErc20 failed", async () => {
      sinon
        .stub(IpAccountImplClient.prototype, "executeBatch")
        .rejects(new Error("Failed to transfer ERC20 tokens"));
      const result = ipAccountClient.transferErc20({
        ipId: ipId,
        tokens: [{ address: zeroAddress, target: zeroAddress, amount: 1n }],
      });
      await expect(result).to.be.rejectedWith(
        "Failed to transfer Erc20: Failed to transfer ERC20 tokens",
      );
    });

    it("should throw error when call transferErc20 given wrong token address", async () => {
      const result = ipAccountClient.transferErc20({
        ipId: ipId,
        tokens: [{ address: "0x123", target: zeroAddress, amount: 1n }],
      });
      await expect(result).to.be.rejectedWith("Failed to transfer Erc20: Invalid address: 0x123.");
    });
    it("should return txHash when call transferErc20 successfully", async () => {
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      const result = await ipAccountClient.transferErc20({
        ipId: ipId,
        tokens: [{ address: zeroAddress, target: zeroAddress, amount: 1n }],
      });
      expect(result.txHash).to.equal(txHash);
      expect(result.receipt).to.be.undefined;
    });

    it("should return txHash when call transferErc20 successfully with waitForTransaction", async () => {
      sinon.stub(IpAccountImplClient.prototype, "executeBatch").resolves(txHash);
      const result = await ipAccountClient.transferErc20({
        ipId: ipId,
        tokens: [{ address: WIP_TOKEN_ADDRESS, target: zeroAddress, amount: 1n }],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.equal(txHash);
      expect(result.receipt).to.not.be.undefined;
    });
  });
});
