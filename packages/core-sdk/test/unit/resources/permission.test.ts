import { expect } from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PermissionClient, AddressZero } from "../../../src";
import { PublicClient, WalletClient, LocalAccount } from "viem";
import { AccessPermission } from "../../../src/types/resources/permission";
const { IpAccountImplClient } = require("../../../src/abi/generated");

describe("Test Permission", () => {
  let permissionClient: PermissionClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<LocalAccount>();
    walletMock.account = accountMock;
    walletMock.signTypedData = sinon
      .stub()
      .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
    permissionClient = new PermissionClient(rpcMock, walletMock, "sepolia");
    IpAccountImplClient.prototype.state = sinon.stub().resolves(1n);
    walletMock.account.signTypedData = sinon
      .stub()
      .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
    (permissionClient.accessControllerClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
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
          permission: AccessPermission.ALLOW,
          txOptions: {
            waitForTransaction: false,
          },
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set permissions: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should return hash when call setPermission given ipId is registered ", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(permissionClient.accessControllerClient, "setPermission").resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: "function setAll(address,string,bytes32,bytes32)",
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setPermission given correct args and waitForTransaction of true", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(permissionClient.accessControllerClient, "setPermission").resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        permission: AccessPermission.ALLOW,
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
          permission: AccessPermission.ALLOW,
          txOptions: {
            waitForTransaction: false,
          },
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set all permissions: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should return hash when call setAllPermissions given ipId is registered ", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(permissionClient.accessControllerClient, "setAllPermissions").resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: AddressZero,
        signer: AddressZero,
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setAllPermissions given correct args and waitForTransaction of true", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(permissionClient.accessControllerClient, "setAllPermissions").resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: AddressZero,
        signer: AddressZero,
        permission: AccessPermission.ALLOW,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });
  });

  describe("Test permission.createSetPermissionSignature", async () => {
    it("should throw IpId error when call createSetPermissionSignature given ipId is not registered ", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.createSetPermissionSignature({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          permission: AccessPermission.ALLOW,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create set permission signature: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw deadline error when call createSetPermissionSignature given deadline is not number", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await permissionClient.createSetPermissionSignature({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          permission: AccessPermission.ALLOW,
          deadline: "error",
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create set permission signature: Invalid deadline value.",
        );
      }
    });

    it("should throw deadline error when call createSetPermissionSignature given deadline is less than 0", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await permissionClient.createSetPermissionSignature({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: "function setAll(address,string,bytes32,bytes32)",
          permission: AccessPermission.ALLOW,
          deadline: -2,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create set permission signature: Invalid deadline value.",
        );
      }
    });

    it("should account error when call createSetPermissionSignature given wallet has no signTypedData method", async () => {
      walletMock = createMock<WalletClient>();
      permissionClient = new PermissionClient(rpcMock, walletMock, "11155111");
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await permissionClient.createSetPermissionSignature({
          ipId: AddressZero,
          signer: AddressZero,
          to: AddressZero,
          func: "function setAll(address,string,bytes32,bytes32)",
          permission: AccessPermission.ALLOW,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create set permission signature: The wallet client does not support signTypedData, please try again.",
        );
      }
    });

    it("should return hash when call createSetPermissionSignature given correct args", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.executeWithSig = sinon.stub().resolves(txHash);

      const res = await permissionClient.createSetPermissionSignature({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: "function setAll(address,string,bytes32,bytes32)",
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(undefined);
    });

    it("should return txHash and success when call createSetPermissionSignature given correct args and waitForTransaction of true", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.executeWithSig = sinon.stub().resolves(txHash);

      const res = await permissionClient.createSetPermissionSignature({
        ipId: AddressZero,
        signer: AddressZero,
        to: AddressZero,
        func: "function setAll(address,string,bytes32,bytes32)",
        deadline: 2000,
        permission: AccessPermission.ALLOW,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });
  });

  describe("Test permission.setBatchPermissions", async () => {
    it("should throw IpId error when call setBatchPermissions given ipId is not registered ", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.setBatchPermissions({
          permissions: [
            {
              ipId: AddressZero,
              signer: AddressZero,
              to: AddressZero,
              permission: AccessPermission.ALLOW,
              func: "function setAll(address,string,bytes32,bytes32)",
            },
          ],
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set batch permissions: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should return hash when call setBatchPermissions given correct args", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(permissionClient.accessControllerClient, "setBatchPermissions").resolves(txHash);

      const res = await permissionClient.setBatchPermissions({
        permissions: [
          {
            ipId: AddressZero,
            signer: AddressZero,
            to: AddressZero,
            permission: AccessPermission.ALLOW,
          },
        ],
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setBatchPermissions given correct args and waitForTransaction of true", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(permissionClient.accessControllerClient, "setBatchPermissions").resolves(txHash);

      const res = await permissionClient.setBatchPermissions({
        permissions: [
          {
            ipId: AddressZero,
            signer: AddressZero,
            to: AddressZero,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });
  });

  describe("Test permission.createSetBatchPermissionsSignature", async () => {
    it("should throw IpId error when call createSetBatchPermissionsSignature given ipId is not registered ", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.createBatchPermissionSignature({
          ipId: AddressZero,
          permissions: [
            {
              ipId: AddressZero,
              signer: AddressZero,
              to: AddressZero,
              permission: AccessPermission.ALLOW,
              func: "function setAll(address,string,bytes32,bytes32)",
            },
          ],
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create batch permission signature: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should return hash when call createSetBatchPermissionsSignature given correct args", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.executeWithSig = sinon.stub().resolves(txHash);

      const res = await permissionClient.createBatchPermissionSignature({
        ipId: AddressZero,
        permissions: [
          {
            ipId: AddressZero,
            signer: AddressZero,
            to: AddressZero,
            permission: AccessPermission.ALLOW,
          },
        ],
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(undefined);
    });

    it("should return txHash and success when call createSetBatchPermissionsSignature given correct args and waitForTransaction of true", async () => {
      sinon.stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      IpAccountImplClient.prototype.executeWithSig = sinon.stub().resolves(txHash);

      const res = await permissionClient.createBatchPermissionSignature({
        ipId: AddressZero,
        deadline: 2000,
        permissions: [
          {
            ipId: AddressZero,
            signer: AddressZero,
            to: AddressZero,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });
  });
});
