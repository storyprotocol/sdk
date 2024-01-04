import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAssetClient, AddressZero } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient, Account } from "viem";

chai.use(chaiAsPromised);

describe("Test IpAssetClient", function () {
  let ipAssetClient: IPAssetClient;
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
    ipAssetClient = new IPAssetClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipAssetClient.create", async function () {
    it("should not throw error when creating a IP asset", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAssetClient.create({
        name: "The Empire Strikes Back",
        typeIndex: 0,
        ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
        owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        preHookData: [
          {
            interface: "address",
            data: ["0xf398C12A45Bc409b6C652E25bb0a3e702492A4ab"],
          },
        ],
        postHookData: [
          {
            interface: "address",
            data: ["0xf398C12A45Bc409b6C652E25bb0a3e702492A4ab"],
          },
        ],
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when creating a IP asset without owner field", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipAssetClient.create({
        name: "The Empire Strikes Back",
        typeIndex: 0,
        ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(res.txHash).equal(txHash);
    });

    it("should not throw error when creating a IP asset and wait for transaction confirmed", async function () {
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

      const response = await ipAssetClient.create({
        name: "The Empire Strikes Back",
        typeIndex: 0,
        ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
        owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).equal(txHash);
      expect(response.ipAssetId).equals("6");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        ipAssetClient.create({
          name: "The Empire Strikes Back",
          typeIndex: 0,
          ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
          owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error when invalid IP asset ID is provided", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().rejects();
      walletMock.writeContract = sinon.stub().resolves(txHash);

      await expect(
        ipAssetClient.create({
          name: "The Empire Strikes Back",
          typeIndex: 0,
          ipOrgId: "0xB32BdE3fBfddAd30a8d824178F00F0adB43DF2e7",
          owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to create IP Asset: Error");
    });
  });
});
