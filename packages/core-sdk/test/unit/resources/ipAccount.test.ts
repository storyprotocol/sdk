import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAccountClient, AddressZero } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient, Account } from "viem";

chai.use(chaiAsPromised);

describe("Test IpAccountClient", function () {
  let ipAccountClient: IPAccountClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    ipAccountClient = new IPAccountClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipAccountClient.registerRootIp", async function () {
    it("should not throw error when registering a derivative IP", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerRootIp({
        policyId: "1",
        tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        tokenId: "1",
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when registering a derivative IP without policy ID", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerRootIp({
        policyId: "1",
        tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        tokenId: "1",
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
            address: "0x091e5f55135155bb8cb5868adb39e5c34eb32cfd",
            topics: [
              "0xd051b12b5a18291aec9a26b17774a4be2d10dce167cbdc5944c7942c78f901c1",
              "0x000000000000000000000000b422e54932c1dae83e78267a4dd2805aa64a8061",
              "0x00000000000000000000000077cbcc0e29e10f1eea24e0d109aab26c5b2abd88",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
            data: "0x0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000454657374000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
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
        policyId: "1",
        tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        tokenId: "1",
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(response.txHash).equal(txHash);
      expect(response.ipAccountId).equals("6");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAccountClient.registerRootIp({
          policyId: "1",
          tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          tokenId: "1",
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
          policyId: "1",
          tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          tokenId: "1",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to create IP Account: Error");
    });
  });

  describe("Test ipAccountClient.registerDerivativeIp", async function () {
    it("should not throw error when registering a derivative IP", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerDerivativeIp({
        licenseId: "string",
        tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        tokenId: "1",
        ipName: "Test IP",
        ipDescription: "This is a test IP description",
        hash: "",
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when registering a derivative IP without policy ID", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAccountClient.registerDerivativeIp({
        licenseId: "string",
        tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        tokenId: "1",
        ipName: "Test IP",
        ipDescription: "This is a test IP description",
        hash: "0x0000000",
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
            address: "0x091e5f55135155bb8cb5868adb39e5c34eb32cfd",
            topics: [
              "0xd051b12b5a18291aec9a26b17774a4be2d10dce167cbdc5944c7942c78f901c1",
              "0x000000000000000000000000b422e54932c1dae83e78267a4dd2805aa64a8061",
              "0x00000000000000000000000077cbcc0e29e10f1eea24e0d109aab26c5b2abd88",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
            data: "0x0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000454657374000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
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
        licenseId: "string",
        tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        tokenId: "1",
        ipName: "Test IP",
        ipDescription: "This is a test IP description",
        hash: "0x0000000",
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(response.txHash).equal(txHash);
      expect(response.ipAccountId).equals("6");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAccountClient.registerDerivativeIp({
          licenseId: "string",
          tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          tokenId: "1",
          ipName: "Test IP",
          ipDescription: "This is a test IP description",
          hash: "0x0000000",
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
        ipAccountClient.registerDerivativeIp({
          licenseId: "string",
          tokenContractAddress: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          tokenId: "1",
          ipName: "Test IP",
          ipDescription: "This is a test IP description",
          hash: "0x0000000",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to create IP Account: Error");
    });
  });
});
