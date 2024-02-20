import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAssetClient, AddressZero } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient, Account } from "viem";
import { AxiosInstance } from "axios";
import { StoryAPIClient } from "../../../src/clients/storyAPI";

chai.use(chaiAsPromised);

describe("Test IpAssetClient", function () {
  let ipAccountClient: IPAssetClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  let storyClientMock: StoryAPIClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    storyClientMock = createMock<StoryAPIClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    ipAccountClient = new IPAssetClient(rpcMock, walletMock, storyClientMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipAccountClient.registerRootIp", async function () {
    it("should not throw error when registering a root IP", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerRootIp({
        policyId: "0",
        tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when registering a root IP without policy ID", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerRootIp({
        policyId: "0",
        tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when creating a root IP and wait for transaction confirmed", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x12054FC0F26F979b271dE691358FeDCF5a1DAe65",
            topics: [
              "0xa3028b46ff4aeba585ebfa1c241ad4a453b6f10dc7bc3d3ebaa9cecc680a6f71",
              "0x0000000000000000000000005ef1ac0e6b9f3b99bb9c3040cc5bd3eeec0e909a",
              "0x00000000000000000000000097527bb0435b28836489ac3e1577ca1e2a099371",
              "0x0000000000000000000000000000000000000000000000000000000000aa36a7",
            ],
            data: "0x0000000000000000000000008c61b7fc58e5d4d6b43ef31f69c3ab8db8fd6d9e00000000000000000000000038a8630a1594ee1f49798924109438c0ca6e9e6e000000000000000000000000ecc7004863545a415db29dd8f8dee0413017627b00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a0736f6d65206f66207468652062657374206465736372697074696f6e000000000000000000000000000000000000000000000000000000000000000065bc56b4000000000000000000000000b6288e57bf7406b35ab4f70fd1135e907107e38600000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000a49504163636f756e743400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b68747470733a2f2f6578616d706c652e636f6d2f746573742d69700000000000",
            blockNumber: 4738934n,
            transactionHash: "0x3600464c4f0794de350e55a484d67cdb6ed4a89917274709b9bb48246935c891",
            transactionIndex: 106,
            blockHash: "0x8d431865dbcfa54988f48b18c0a07fea503ca38c387b6326f513aa6f238faddc",
            logIndex: 52,
            removed: false,
          },
        ],
      });

      const response = await ipAccountClient.registerRootIp({
        policyId: "0",
        tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0x8C61b7fc58E5d4d6b43Ef31F69c3AB8Db8fD6D9E");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAccountClient.registerRootIp({
          policyId: "0",
          tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error when invalid policy ID is provided", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().rejects();
      walletMock.writeContract = sinon.stub().resolves(txHash);

      await expect(
        ipAccountClient.registerRootIp({
          policyId: "0",
          tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to register root IP: Error");
    });
  });

  describe("Test ipAccountClient.registerDerivativeIp", async function () {
    it("should not throw error when registering a derivative IP", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerDerivativeIp({
        licenseIds: ["2"],
        tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        ipName: "Test IP",
        uri: "This is a test IP description",
        contentHash: AddressZero,
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when creating a derivative IP and wait for transaction confirmed", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x12054FC0F26F979b271dE691358FeDCF5a1DAe65",
            topics: [
              "0xa3028b46ff4aeba585ebfa1c241ad4a453b6f10dc7bc3d3ebaa9cecc680a6f71",
              "0x0000000000000000000000005ef1ac0e6b9f3b99bb9c3040cc5bd3eeec0e909a",
              "0x00000000000000000000000097527bb0435b28836489ac3e1577ca1e2a099371",
              "0x0000000000000000000000000000000000000000000000000000000000aa36a7",
            ],
            data: "0x0000000000000000000000008c61b7fc58e5d4d6b43ef31f69c3ab8db8fd6d9e00000000000000000000000038a8630a1594ee1f49798924109438c0ca6e9e6e000000000000000000000000ecc7004863545a415db29dd8f8dee0413017627b00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a0736f6d65206f66207468652062657374206465736372697074696f6e000000000000000000000000000000000000000000000000000000000000000065bc56b4000000000000000000000000b6288e57bf7406b35ab4f70fd1135e907107e38600000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000a49504163636f756e743400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b68747470733a2f2f6578616d706c652e636f6d2f746573742d69700000000000",
            blockNumber: 4738934n,
            transactionHash: "0x3600464c4f0794de350e55a484d67cdb6ed4a89917274709b9bb48246935c891",
            transactionIndex: 106,
            blockHash: "0x8d431865dbcfa54988f48b18c0a07fea503ca38c387b6326f513aa6f238faddc",
            logIndex: 52,
            removed: false,
          },
        ],
      });

      const response = await ipAccountClient.registerDerivativeIp({
        licenseIds: ["2"],
        tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        ipName: "Test IP",
        uri: "This is a test IP description",
        contentHash: AddressZero,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0x8C61b7fc58E5d4d6b43Ef31F69c3AB8Db8fD6D9E");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAccountClient.registerDerivativeIp({
          licenseIds: ["2"],
          tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          ipName: "Test IP",
          uri: "This is a test IP description",
          contentHash: AddressZero,
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error when invalid licenseId is provided", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().rejects();
      walletMock.writeContract = sinon.stub().resolves(txHash);

      await expect(
        ipAccountClient.registerDerivativeIp({
          licenseIds: ["2"],
          tokenContractAddress: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          ipName: "Test IP",
          uri: "This is a test IP description",
          contentHash: AddressZero,
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to register derivative IP: Error");
    });
  });
});
