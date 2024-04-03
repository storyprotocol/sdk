import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAssetClient } from "../../../src";
import { PublicClient, WalletClient, Account } from "viem";
import { getIPAssetRegistryConfig } from "../../config";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Test IpAssetClient", function () {
  let ipAssetClient: IPAssetClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    ipAssetClient = new IPAssetClient(rpcMock, walletMock, "sepolia");
    ipAssetClient.ipAssetRegistryConfig = getIPAssetRegistryConfig("sepolia");
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipAssetClient.register", async function () {
    it("should throw readContract error if readContract throws an error", async () => {
      rpcMock.readContract = sinon.stub().rejects(new Error("readContract error"));
      try {
        await ipAssetClient.register({
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: false,
          },
        });
      } catch (err) {
        expect((err as Error).message).includes("readContract error");
      }
    });
    it("should not throw error when register", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves();
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAssetClient.register({
        tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return ipId if contract is successful read", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(txHash);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAssetClient.register({
        tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.ipId).equal(txHash);
    });

    it("should not throw error when creating a IP and wait for transaction confirmed", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves();
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x30c89bcb41277f09b18df0375b9438909e193bf0",
            topics: [
              "0x02ad3a2e0356b65fdfe4a73c825b78071ae469db35162978518b8c258abb3767",
              "0x00000000000000000000000000000000000000000000000000000000000005e9",
              "0x0000000000000000000000007c0004c6d352bc0a0531aad46d33a03d9d51ab1d",
              "0x000000000000000000000000000000000000000000000000000000000000000d",
            ],
            data: "0x000000000000000000000000d142822dc1674154eaf4ddf38bbf7ef8f0d8ece4000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000660cc2100000000000000000000000000000000000000000000000000000000000000014313531333a204d6f636b45524337323120233133000000000000000000000000000000000000000000000000000000000000000000000000000000000000002368747470733a2f2f73746f727970726f746f636f6c2e78797a2f6572633732312f31330000000000000000000000000000000000000000000000000000000000",
            blockNumber: 478104n,
            transactionHash: "0x10b563fc5722b9648ad95389280e71a16e10fab8cbd0aff1da18516c35704562",
            transactionIndex: 1,
            blockHash: "0xe9a24656b3c6c4ea66ad467300e39b63ae89af97481744d737d63ebe91857e34",
            logIndex: 2,
            removed: false,
          },
        ],
      });

      const response = await ipAssetClient.register({
        tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");

      const response2 = await ipAssetClient.register({
        tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response2.txHash).equal(txHash);
      expect(response2.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.readContract = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAssetClient.register({
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejectedWith("http 500");
    });
  });
});
