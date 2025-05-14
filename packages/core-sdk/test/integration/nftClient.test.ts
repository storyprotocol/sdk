import { StoryClient } from "../../src";
import { getStoryClient, mintBySpg, publicClient, walletClient } from "./utils/util";
import { Address, maxUint256 } from "viem";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { erc20Address } from "../../src/abi/generated";
import { aeneid } from "../unit/mockData";
import { ERC20Client } from "../../src/utils/token";

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

  describe("set and get tokenURI", () => {
    it("should successfully set token URI", async () => {
      // Setup: Approve the contract for ERC20 transfers
      const erc20Client = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      const txHash = await erc20Client.approve(spgNftContract, maxUint256);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Mint a new token with initial metadata
      const tokenId = await mintBySpg(spgNftContract, "ipfs://QmTest/");
      expect(tokenId).to.not.be.undefined;

      // Update the token URI
      const updatedMetadata = "ipfs://QmUpdated/metadata.json";
      const result = await client.nftClient.setTokenURI({
        tokenId: tokenId!,
        tokenURI: updatedMetadata,
        spgNftContract,
        txOptions: {
          waitForTransaction: true,
        },
      });

      // Verify the transaction
      expect(result.txHash).to.be.a("string").and.not.empty;

      // Verification that the URI was updated
      const tokenURI = await client.nftClient.getTokenURI({
        tokenId: tokenId!,
        spgNftContract,
      });
      expect(tokenURI).to.equal(updatedMetadata);
    });

    it("updates URI for multiple tokens", async () => {
      const erc20Client = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      const txHash = await erc20Client.approve(spgNftContract, maxUint256);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      const tokenURIs = [
        "ipfs://QmTest/1",
        "iipfs://QmTest/2",
        "ipfs://QmTest/3"
      ];
  
      for (let i = 0; i < tokenURIs.length; i++) {
        const tokenId = await mintBySpg(spgNftContract, tokenURIs[i]);
        expect(tokenId).to.not.be.undefined;

        const updatedMetadata = "ipfs://QmUpdated/metadata.json";
        const result = await client.nftClient.setTokenURI({
          tokenId: tokenId!,
          tokenURI: updatedMetadata,
          spgNftContract,
          txOptions: {
            waitForTransaction: true,
          },
        });

        expect(result.txHash).to.be.a("string").and.not.empty;

        const tokenURI = await client.nftClient.getTokenURI({
          tokenId: tokenId!,
          spgNftContract,
        });
        expect(tokenURI).to.equal(updatedMetadata);
      }
    });
  });

  describe("Error Cases", () => {
    it("fails with invalid token ID", async () => {
      const erc20Client = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      const txHash = await erc20Client.approve(spgNftContract, maxUint256);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
  
      const invalidTokenId = 999999999999999n;
      const updatedMetadata = "ipfs://QmUpdated/metadata.json";
  
      await expect(
        client.nftClient.setTokenURI({
          tokenId: invalidTokenId!,
          tokenURI: updatedMetadata,
          spgNftContract,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).to.be.rejectedWith("Failed to set token URI"); 
    });
  })
});
