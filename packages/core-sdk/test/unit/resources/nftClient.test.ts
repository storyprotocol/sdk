import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { PublicClient, WalletClient } from "viem";

import { NftClient } from "../../../src";
import { createMock } from "../testUtils";
import { mockAddress, mockERC20 } from "../mockData";
import { SpgnftImplClient, SpgnftImplReadOnlyClient } from "../../../src/abi/generated";

chai.use(chaiAsPromised);

describe("Test NftClient", () => {
  let nftClient: NftClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash = "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb";
  const mintFeeToken = "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>({ account: { address: mockAddress } });
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
          isPublicMinting: true,
          mintOpen: true,
          mintFeeRecipient: "0x",
          contractURI: "test-uri",
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to create an SPG NFT collection: Invalid mint fee token address, mint fee is greater than 0.",
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
          isPublicMinting: true,
          mintOpen: true,
          mintFeeRecipient: "0x",
          contractURI: "test-uri",
        });
      } catch (e) {
        expect((e as Error).message).equal(
          "Failed to create an SPG NFT collection: Invalid mint fee token address, mint fee is greater than 0.",
        );
      }
    });

    it("should return txHash when call createNFTCollection successfully", async () => {
      const spgNftContract = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
      sinon.stub(nftClient.registrationWorkflowsClient, "createCollection").resolves(txHash);
      sinon
        .stub(nftClient.registrationWorkflowsClient, "parseTxCollectionCreatedEvent")
        .returns([{ spgNftContract }]);
      const result = await nftClient.createNFTCollection({
        name: "name",
        symbol: "symbol",
        owner: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "test-uri",
        mintFeeRecipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });

      expect(result.txHash).equal(txHash);
      expect(result.spgNftContract).equal(spgNftContract);
    });

    it("should return encodedTxData when call createNFTCollection successfully with encodedTxDataOnly", async () => {
      sinon.stub(nftClient.registrationWorkflowsClient, "createCollectionEncode").returns({
        data: "0x",
        to: "0x",
      });

      const result = await nftClient.createNFTCollection({
        name: "name",
        symbol: "symbol",
        maxSupply: 1,
        mintFee: 1n,
        mintFeeToken: mintFeeToken,
        isPublicMinting: true,
        contractURI: "test-uri",
        mintOpen: true,
        mintFeeRecipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("test for getMintFeeToken", () => {
    it("should successfully get mint fee token", async () => {
      sinon.stub(SpgnftImplReadOnlyClient.prototype, "mintFeeToken").resolves(mockERC20);
      const mintFeeToken = await nftClient.getMintFeeToken(mockERC20);
      expect(mintFeeToken).equal(mockERC20);
    });
  });

  describe("test for getMintFee", () => {
    it("should successfully get mint fee", async () => {
      sinon.stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(1n);
      const mintFee = await nftClient.getMintFee(mockERC20);
      expect(mintFee).equal(1n);
    });
  });

  describe("test for setTokenURI", () => {
    it("should throw error when call setTokenURI fail", async () => {
      sinon.stub(SpgnftImplClient.prototype, "setTokenUri").throws(new Error("rpc error"));
      await expect(
        nftClient.setTokenURI({
          tokenId: 1n,
          tokenURI: "test-uri",
          spgNftContract: mockERC20,
        }),
      ).to.be.rejectedWith("Failed to set token URI: rpc error");
    });
    it("should successfully set token URI", async () => {
      sinon.stub(SpgnftImplClient.prototype, "setTokenUri").resolves(txHash);
      const result = await nftClient.setTokenURI({
        tokenId: 1n,
        tokenURI: "test-uri",
        spgNftContract: mockERC20,
      });
      expect(result.txHash).equal(txHash);
    });
  });

  describe("test for getTokenURI", () => {
    it("should successfully get token URI", async () => {
      sinon.stub(SpgnftImplReadOnlyClient.prototype, "tokenUri").resolves("test-uri");
      const tokenURI = await nftClient.getTokenURI({ tokenId: 1n, spgNftContract: mockERC20 });
      expect(tokenURI).equal("test-uri");
    });
  });
});
