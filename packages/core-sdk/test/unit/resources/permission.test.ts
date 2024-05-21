import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PermissionClient, AddressZero } from "../../../src";
import * as utils from "../../../src/utils/utils";
import { PublicClient, WalletClient, Account } from "viem";
const { IpAccountImplClient } = require("../../../src/abi/generated");

describe("Test Permission", function () {
  let permissionClient: PermissionClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    permissionClient = new PermissionClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test permission.setPermission", async function () {
    it("should not throw error when setting permission", async function () {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: "0x00000000",
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

      const res = await permissionClient.setPermission({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: "0x00000000",
        permission: 0,
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(res.txHash).equal(txHash);
    });

    it("should throw waitTxAndFilterLog error if waitTxAndFilterLog throws an error", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTxAndFilterLog").rejects(new Error("waitTxAndFilterLog error"));
      try {
        const res = await permissionClient.setPermission({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: "0x00000000",
          permission: 0,
          txOptions: {
            waitForTransaction: true,
          },
        });
      } catch (err) {
        expect((err as Error).message.includes("waitTxAndFilterLog error"));
      }
    });

    it("should return txHash and success when txOptions.waitForTransaction is true", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTxAndFilterLog").resolves();

      const res = await permissionClient.setPermission({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        permission: 0,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });

    it("should throw error when request fails", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.readContract = sinon.stub().resolves();
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({});
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));

      try {
        await permissionClient.setPermission({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: "0x00000000",
          permission: 0,
          txOptions: {
            waitForTransaction: true,
          },
        });
      } catch (error) {
        expect((error as Error).message).to.equal("Failed to set permissions: http 500");
      }
    });
  });

  describe("Test permission.setAllPermissions", async () => {
    it("should throw IpId error when call setAllPermissions given ipId is not registered ", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.setAllPermissions({
          ipId: AddressZero,
          signer: AddressZero,
          permission: 0,
          txOptions: {
            waitForTransaction: false,
          },
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set all permissions: IP is not registered.",
        );
      }
    });

    it("should return hash when call setAllPermissions given ipId is registered ", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.execute = sinon.stub().resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: AddressZero,
        signer: AddressZero,
        permission: 0,
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setAllPermissions given correct args and waitForTransaction of true", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.execute = sinon.stub().resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: AddressZero,
        signer: AddressZero,
        permission: 0,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });
  });
});
