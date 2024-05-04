import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { Hex, PublicClient, WalletClient } from "viem";

import { CreateSPGNFTCollectionRequest, SPGClient } from "../../../src";
import { createMock } from "../testUtils";

chai.use(chaiAsPromised);

describe("Test SPGClient", function () {
  let spgClient: SPGClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  const mock = {
    txHash: "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb",
    nftContract: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
  };

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    spgClient = new SPGClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("test for createSPGNFTCollection", () => {
    const reqBody: CreateSPGNFTCollectionRequest = {
      name: "test-collection",
      symbol: "TEST",
      maxSupply: 100,
      mintCost: 0n,
      owner: "0x0000000000000000000000000000000000000001" as Hex,
      txOptions: {
        waitForTransaction: false,
      },
    };

    it("should throw simulateContract error if simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      try {
        await spgClient.createSPGNFTCollection(reqBody);
      } catch (err) {
        expect((err as Error).message.includes("simulateContract error"));
      }
    });

    it("should throw writeContract error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));

      try {
        await spgClient.createSPGNFTCollection(reqBody);
      } catch (err) {
        expect((err as Error).message.includes("writeContract error"));
      }
    });

    it("should return txHash and nftContract if txOptions.waitForTransaction is truthy", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      sinon.stub(spgClient.spgClient, "parseTxCollectionCreatedEvent").returns([
        {
          nftContract: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        },
      ]);

      const result = await spgClient.createSPGNFTCollection({
        ...reqBody,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.equal(mock.txHash);
      expect(result.nftContract).to.equal(mock.nftContract);
    });

    it("should return txHash if txOptions.waitForTransaction is falsy", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      const result = await spgClient.createSPGNFTCollection(reqBody);
      expect(result.txHash).to.equal(mock.txHash);
    });
  });
});
