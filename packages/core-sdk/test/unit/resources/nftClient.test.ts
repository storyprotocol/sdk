import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { Hex, PublicClient, WalletClient } from "viem";

import { CreateNFTCollectionRequest, NftClient } from "../../../src";
import { createMock } from "../testUtils";

chai.use(chaiAsPromised);

describe("Test NftClient", () => {
  let nftClient: NftClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash = "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb";
  const mintFeeToken = "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>({ account: { address: "0x" } });
    nftClient = new NftClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("test for CreateNFTCollection", () => {
    it("should throw mint fee error when call createNFTCollection given mintFee less than 0", async () => {
      try {
        await nftClient.createNFTCollection({
          name: "name",
          symbol: "symbol",
          maxSupply: 1,
          mintFee: -1n,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to create a SPG NFT collection: Invalid mint fee token address, mint fee is greater than 0.",
        );
      }
    });

    it("should throw mint fee error when call createNFTCollection given mintFeeToken is invalid", async () => {
      try {
        await nftClient.createNFTCollection({
          name: "name",
          symbol: "symbol",
          maxSupply: 1,
          mintFee: 1n,
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to create a SPG NFT collection: Invalid mint fee token address, mint fee is greater than 0.",
        );
      }
    });

    it("should return txHash when call createNFTCollection successfully", async () => {
      sinon.stub(nftClient.spgClient, "createCollection").resolves(txHash);
      const result = await nftClient.createNFTCollection({
        name: "name",
        symbol: "symbol",
        maxSupply: 1,
        mintFee: 1n,
        mintFeeToken: mintFeeToken,
      });

      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call createNFTCollection successfully with waitForTransaction", async () => {
      const nftContract = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
      sinon.stub(nftClient.spgClient, "createCollection").resolves(txHash);
      sinon.stub(nftClient.spgClient, "parseTxCollectionCreatedEvent").returns([{ nftContract }]);
      const result = await nftClient.createNFTCollection({
        name: "name",
        symbol: "symbol",
        owner: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).equal(txHash);
      expect(result.nftContract).equal(nftContract);
    });
  });

  // Test createNFTCollection - @boris added test cases

  it("should return encoded transaction data when txOptions.encodedTxDataOnly is true", async () => {
    type EncodedTxData = { to: Hex; data: Hex };
    const encodedTxData: EncodedTxData = {
      to: "0x0E61B0679673Ed99EA1e71E62aFf62BDcDFc70E9",
      data: "0x1234",
    };
    sinon.stub(nftClient.spgClient, "createCollectionEncode").returns(encodedTxData);

    const result = await nftClient.createNFTCollection({
      name: "Encoded Only",
      symbol: "ENC",
      mintFee: 1n,
      mintFeeToken: mintFeeToken,
      txOptions: {
        encodedTxDataOnly: true,
      },
    });

    expect(result.encodedTxData).to.deep.equal(encodedTxData);
  });

  it("should throw error when createNFTCollection is called with a negative mint fee and valid mintFeeToken", async () => {
    try {
      await nftClient.createNFTCollection({
        name: "Negative Mint Fee",
        symbol: "NEG",
        mintFee: -1n,
        mintFeeToken: mintFeeToken,
      });
    } catch (e) {
      expect((e as Error).message).equal(
        "Failed to create a SPG NFT collection: Invalid mint fee token address, mint fee is greater than 0.",
      );
    }
  });

  it("should return txHash when createNFTCollection is called with a large maxSupply", async () => {
    sinon.stub(nftClient.spgClient, "createCollection").resolves(txHash);
    const maxUint32: number = 2 ** 32 - 1;

    const result = await nftClient.createNFTCollection({
      name: "Large Supply",
      symbol: "LGS",
      maxSupply: Number(maxUint32) - 1,
      mintFee: 1n,
      mintFeeToken: mintFeeToken,
    });

    expect(result.txHash).equal(txHash);
  });

  it("should return encoded transaction data and not wait for transaction when both encodedTxDataOnly and waitForTransaction are true", async () => {
    type EncodedTxData = { to: Hex; data: Hex };
    const encodedTxData: EncodedTxData = {
      to: "0x0E61B0679673Ed99EA1e71E62aFf62BDcDFc70E9",
      data: "0x1234",
    };
    sinon.stub(nftClient.spgClient, "createCollectionEncode").returns(encodedTxData);

    const result = await nftClient.createNFTCollection({
      name: "Encoded and Wait",
      symbol: "ENW",
      mintFee: 1n,
      mintFeeToken: "0x0E61B0679673Ed99EA1e71E62aFf62BDcDFc70E9",
      txOptions: {
        encodedTxDataOnly: true,
        waitForTransaction: true, // This should be ignored since encodedTxDataOnly is true
      },
    });

    expect(result.encodedTxData).to.deep.equal(encodedTxData);
    expect(result.txHash).to.be.undefined;
  });

  it("should throw an error if createCollection transaction fails", async () => {
    sinon.stub(nftClient.spgClient, "createCollection").throws(new Error("Transaction failed"));

    try {
      await nftClient.createNFTCollection({
        name: "Failed Transaction",
        symbol: "FAIL",
        mintFee: 1n,
        mintFeeToken: mintFeeToken,
      });
    } catch (e) {
      expect((e as Error).message).equal(
        "Failed to create a SPG NFT collection: Transaction failed",
      );
    }
  });
});
