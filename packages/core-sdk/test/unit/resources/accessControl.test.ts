import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { AccessControlClient, AddressZero } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient, Account } from "viem";

chai.use(chaiAsPromised);

describe("Test AccessControl", function () {
  let accessControlClient: AccessControlClient;
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
    accessControlClient = new AccessControlClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test accessControl.setPermission", async function () {
    it("should not throw error when setting permission", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await accessControlClient.setPermission({
        ipAccount: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: AddressZero,
        permission: 0,
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

      const res = await accessControlClient.setPermission({
        ipAccount: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: AddressZero,
        permission: 0,
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(res.txHash).equal(txHash);
    });

    it.skip("should not throw error when setting permission and wait for transaction confirmed", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        // logs: [
        //   {
        //     address: "0x12054FC0F26F979b271dE691358FeDCF5a1DAe65",
        //     topics: [
        //       "0x5be70b68c8361762980ec7d425d79fd33f6d49cac8a498e6ddf514f995b987f7",
        //       "0x0000000000000000000000005ef1ac0e6b9f3b99bb9c3040cc5bd3eeec0e909a",
        //       "0x00000000000000000000000097527bb0435b28836489ac3e1577ca1e2a099371",
        //       "0x0000000000000000000000000000000000000000000000000000000000aa36a7",
        //     ],
        //     data: "0x000000000000000000000000e2a7213762caddb7438f21f82cefbb49311674630000000000000000000000000000000000000000000000000000000000000002",
        //     blockNumber: 4738934n,
        //     transactionHash: "0x3600464c4f0794de350e55a484d67cdb6ed4a89917274709b9bb48246935c891",
        //     transactionIndex: 106,
        //     blockHash: "0x8d431865dbcfa54988f48b18c0a07fea503ca38c387b6326f513aa6f238faddc",
        //     logIndex: 52,
        //     removed: false,
        //   },
        // ],
      });

      // const res = await accessControlClient.setPermission({
      //   ipAccount: AddressZero,
      //   signer: AddressZero,
      //   to: AddressZero,
      //   func: AddressZero,
      //   permission: 0,
      //   txOptions: {
      //     waitForTransaction: false,
      //   },
      // });
      // expect(response.txHash).equal(txHash);
      // expect(response.ipAccountId).equals("0x5Ef1Ac0e6b9f3b99BB9c3040Cc5BD3EEeC0E909A");
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      await expect(
        accessControlClient.setPermission({
          ipAccount: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: AddressZero,
          permission: 0,
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
        accessControlClient.setPermission({
          ipAccount: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: AddressZero,
          permission: 0,
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to set permissions");
    });
  });
});
