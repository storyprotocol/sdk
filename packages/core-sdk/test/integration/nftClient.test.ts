import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address, maxUint256 } from "viem";

import { StoryClient } from "../../src";
import {
  getStoryClient,
  mintBySpg,
  publicClient,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import { erc20Address } from "../../src/abi/generated";
import { ERC20Client } from "../../src/utils/token";
import { aeneid } from "../unit/mockData";

use(chaiAsPromised);

describe("nftClient Functions", () => {
  let client: StoryClient;
  let spgNftContract: Address;

  before(() => {
    client = getStoryClient();
  });

  describe("createNFTCollection", () => {
    it("should successfully create public nft collection with minimal params", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintOpen: true,
        contractURI: "test-uri",
      });
      expect(txData.spgNftContract).to.be.a("string");
      expect(txData.txHash).to.be.a("string");
    });

    it("should successfully create collection with custom mint fee", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "paid-collection",
        symbol: "PAID",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintOpen: true,
        contractURI: "test-uri",
        mintFee: 10000000,
        mintFeeToken: erc20Address[aeneid],
      });
      expect(txData.spgNftContract).to.be.a("string");
      spgNftContract = txData.spgNftContract!;
    });

    it("should successfully create private collection", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "private-collection",
        symbol: "PRIV",
        maxSupply: 100,
        isPublicMinting: false, // private minting
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintOpen: false, // starts closed
        contractURI: "test-uri",
      });
      expect(txData.spgNftContract).to.be.a("string");
    });

    it("should successfully create collection with baseURI", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "uri-collection",
        symbol: "URI",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintOpen: true,
        contractURI: "test-uri",
        baseURI: "ipfs://QmTest/",
      });
      expect(txData.spgNftContract).to.be.a("string");
    });

    it("should successfully create collection with custom owner", async () => {
      const txData = await client.nftClient.createNFTCollection({
        name: "owned-collection",
        symbol: "OWN",
        maxSupply: 100,
        isPublicMinting: true,
        mintFeeRecipient: TEST_WALLET_ADDRESS,
        mintOpen: true,
        contractURI: "test-uri",
        owner: TEST_WALLET_ADDRESS,
      });
      expect(txData.spgNftContract).to.be.a("string");
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

  describe("set and get tokenURI", () => {
    it("should successfully set token URI", async () => {
      // Setup: Approve the contract for ERC20 transfers
      const erc20Client = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      const txHash = await erc20Client.approve(spgNftContract, maxUint256);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Mint a new token with initial metadata
      const tokenId = await mintBySpg(spgNftContract, "ipfs://QmTest/");
      expect(tokenId).to.be.a("bigint");

      // Update the token URI
      const updatedMetadata = "ipfs://QmUpdated/metadata.json";
      const result = await client.nftClient.setTokenURI({
        tokenId: tokenId,
        tokenURI: updatedMetadata,
        spgNftContract,
      });

      // Verify the transaction
      expect(result.txHash).to.be.a("string");

      // Verification that the URI was updated
      const tokenURI = await client.nftClient.getTokenURI({
        tokenId,
        spgNftContract,
      });
      expect(tokenURI).to.equal(updatedMetadata);
    });
  });
});
