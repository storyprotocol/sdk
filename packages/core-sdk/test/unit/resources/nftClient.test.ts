import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { Hex, PublicClient, WalletClient } from "viem";

import { CreateNFTCollectionRequest, NftClient } from "../../../src";
import { createMock } from "../testUtils";

chai.use(chaiAsPromised);

describe("Test NftClient", function () {
  let nftClient: NftClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  const mock = {
    txHash: "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb",
    nftContract: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
  };

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>({ account: { address: "0x" } });
    nftClient = new NftClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("test for CreateNFTCollection", () => {
    const reqBody: CreateNFTCollectionRequest = {
      name: "test-collection",
      symbol: "TEST",
      maxSupply: 100,
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
        await nftClient.createNFTCollection(reqBody);
      } catch (err) {
        expect((err as Error).message.includes("simulateContract error"));
      }
    });

    it("should throw writeContract error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));

      try {
        await nftClient.createNFTCollection(reqBody);
      } catch (err) {
        expect((err as Error).message.includes("writeContract error"));
      }
    });

    it("should throw Invalid mintFee and mintFeeToken error if mintFee is 0", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      try {
        await nftClient.createNFTCollection({ ...reqBody, mintFee: 0n });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to create a SPG NFT collection: Invalid mint fee token address, mint fee is greater than 0.",
        );
      }
    });

    it("should return txHash and nftContract if txOptions.waitForTransaction is truthy", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      sinon.stub(nftClient.spgClient, "parseTxCollectionCreatedEvent").returns([
        {
          nftContract: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        },
      ]);

      const result = await nftClient.createNFTCollection({
        ...reqBody,
        owner: undefined,
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

      const result = await nftClient.createNFTCollection({
        ...reqBody,
        maxSupply: undefined,
        mintCost: undefined,
        mintToken: undefined,
      });
      expect(result.txHash).to.equal(mock.txHash);
    });
  });
});
