import { StoryClient } from "../../src";
import { getStoryClient } from "./utils/util";
import { Address } from "viem";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { erc20Address } from "../../src/abi/generated";
import { aeneid } from "../unit/mockData";

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("nftClient Functions", () => {
  let client: StoryClient;
  let testWalletAddress: Address;
  let spgNftContract: Address;

  before(async () => {
    client = getStoryClient();
    testWalletAddress = process.env.TEST_WALLET_ADDRESS as Address;
  });

  describe("createNFTCollection", () => {
    it("should successfully create public nft collection with minimal params", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: testWalletAddress,
        mintOpen: true,
        contractURI: "test-uri",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.spgNftContract).to.be.a("string").and.not.empty;
      expect(txData.txHash).to.be.a("string").and.not.empty;
    });

    it("should successfully create collection with custom mint fee", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "paid-collection",
        symbol: "PAID",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: testWalletAddress,
        mintOpen: true,
        contractURI: "test-uri",
        mintFee: 10000000n,
        mintFeeToken: erc20Address[aeneid],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.spgNftContract).to.be.a("string").and.not.empty;
      spgNftContract = txData.spgNftContract!;
    });

    it("should successfully create private collection", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "private-collection",
        symbol: "PRIV",
        maxSupply: 100,
        isPublicMinting: false, // private minting
        mintFeeRecipient: testWalletAddress,
        mintOpen: false, // starts closed
        contractURI: "test-uri",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.spgNftContract).to.be.a("string").and.not.empty;
    });

    it("should successfully create collection with baseURI", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "uri-collection",
        symbol: "URI",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: testWalletAddress,
        mintOpen: true,
        contractURI: "test-uri",
        baseURI: "ipfs://QmTest/",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.spgNftContract).to.be.a("string").and.not.empty;
    });

    it("should successfully create collection with custom owner", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "owned-collection",
        symbol: "OWN",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: testWalletAddress,
        mintOpen: true,
        contractURI: "test-uri",
        owner: testWalletAddress,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(txData.spgNftContract).to.be.a("string").and.not.empty;
    });

    it("should successfully get encoded transaction data", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "encoded-collection",
        symbol: "ENC",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: testWalletAddress,
        mintOpen: true,
        contractURI: "test-uri",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(txData.encodedTxData).to.exist;
      expect(txData.encodedTxData?.data).to.be.a("string").and.not.empty;
      expect(txData.encodedTxData?.to).to.be.a("string").and.not.empty;
    });

    it("should fail with invalid mint fee token", async () => {
      await expect(
        client.nftClient.createNFTCollection({
          name: "invalid-fee-collection",
          symbol: "INV",
          maxSupply: 100,
          isPublicMinting: true,
          mintFeeRecipient: testWalletAddress,
          mintOpen: true,
          contractURI: "test-uri",
          mintFee: 1000000000000000000n,
          mintFeeToken: "0x0000000000000000000000000000000000000000",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejectedWith("Invalid mint fee token address");
    });
  });

  describe("Mint Fee", () => {
    it("should successfully get mint fee token", async () => {
      const mintFeeToken = await client.nftClient.getMintFeeToken(spgNftContract);
      expect(mintFeeToken).to.equal(erc20Address[aeneid]);
    });

    it("should successfully get mint fee", async () => {
      const mintFee = await client.nftClient.getMintFee(spgNftContract);
      expect(mintFee).to.equal(10000000n);
    });
  });
});
