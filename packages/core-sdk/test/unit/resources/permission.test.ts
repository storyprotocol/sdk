import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PermissionClient, AddressZero } from "../../../src";
import { PublicClient, WalletClient, Account } from "viem";
const { IpAccountImplClient } = require("../../../src/abi/generated");

describe("Test Permission", () => {
  let permissionClient: PermissionClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    walletMock.account = accountMock;
    permissionClient = new PermissionClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test permission.setPermission", () => {
    it("should throw IpId error when call setPermission given ipId is not registered ", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.setPermission({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: "0x00000000",
          permission: 0,
          txOptions: {
            waitForTransaction: false,
          },
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set permissions: IP is not registered.",
        );
      }
    });

    it("should return hash when call setPermission given ipId is registered ", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.execute = sinon.stub().resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: "0x00000000",
        permission: 0,
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setPermission given correct args and waitForTransaction of true", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.execute = sinon.stub().resolves(txHash);

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
