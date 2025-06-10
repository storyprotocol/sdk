import { expect } from "chai";
import { stub } from "sinon";
import { PublicClient, WalletClient, zeroAddress } from "viem";

import { PermissionClient } from "../../../src";
import { IpAccountImplClient } from "../../../src/abi/generated";
import { AccessPermission } from "../../../src/types/resources/permission";
import { createMockPublicClient, createMockWalletClient } from "../testUtils";

describe("Test Permission", () => {
  let permissionClient: PermissionClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

  beforeEach(function () {
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    permissionClient = new PermissionClient(rpcMock, walletMock, 1315);

    stub(IpAccountImplClient.prototype, "state").resolves({
      result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a5e",
    });
    stub(IpAccountImplClient.prototype, "executeWithSig").resolves(txHash);
    stub(IpAccountImplClient.prototype, "executeWithSigEncode").returns({
      data: "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      to: "0x",
    });
    (permissionClient.accessControllerClient as { address: string }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
  });

  describe("Test permission.setPermission", () => {
    it("should throw IpId error when call setPermission given ipId is not registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.setPermission({
          ipId: zeroAddress,
          signer: zeroAddress,
          to: zeroAddress,
          permission: AccessPermission.ALLOW,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set permissions: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should return hash when call setPermission given ipId is registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setPermission").resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: zeroAddress,
        signer: zeroAddress,
        to: zeroAddress,
        func: "function setAll(address,string,bytes32,bytes32)",
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setPermission given correct args ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setPermission").resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: zeroAddress,
        signer: zeroAddress,
        to: zeroAddress,
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });

    it("should return encodedTxData when call setPermission given correct args and encodedTxDataOnly of true", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setPermission").resolves(txHash);

      const res = await permissionClient.setPermission({
        ipId: zeroAddress,
        signer: zeroAddress,
        to: zeroAddress,
        permission: AccessPermission.ALLOW,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(res.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("Test permission.setAllPermissions", () => {
    it("should throw IpId error when call setAllPermissions given ipId is not registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.setAllPermissions({
          ipId: zeroAddress,
          signer: zeroAddress,
          permission: AccessPermission.ALLOW,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to set all permissions: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should return hash when call setAllPermissions given ipId is registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setAllPermissions").resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: zeroAddress,
        signer: zeroAddress,
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setAllPermissions given correct args ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setAllPermissions").resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: zeroAddress,
        signer: zeroAddress,
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });

    it("should return encodedTxData when call setAllPermissions given correct args and encodedTxDataOnly of true", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setAllPermissions").resolves(txHash);

      const res = await permissionClient.setAllPermissions({
        ipId: zeroAddress,
        signer: zeroAddress,
        permission: AccessPermission.ALLOW,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(res.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("Test permission.createSetPermissionSignature", () => {
    it("should throw IpId error when call createSetPermissionSignature given ipId is not registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.createSetPermissionSignature({
          ipId: zeroAddress,
          signer: zeroAddress,
          to: zeroAddress,
          permission: AccessPermission.ALLOW,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create set permission signature: IP id with 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw deadline error when call createSetPermissionSignature given deadline is not number", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await permissionClient.createSetPermissionSignature({
          ipId: zeroAddress,
          signer: zeroAddress,
          to: zeroAddress,
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
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await permissionClient.createSetPermissionSignature({
          ipId: zeroAddress,
          signer: zeroAddress,
          to: zeroAddress,
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

    it("should wallet error when call createSetPermissionSignature given wallet has no signTypedData method", async () => {
      walletMock = createMockWalletClient();
      permissionClient = new PermissionClient(rpcMock, walletMock, 1315);
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      (permissionClient.accessControllerClient as { address: string }).address =
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";

      try {
        await permissionClient.createSetPermissionSignature({
          ipId: zeroAddress,
          signer: zeroAddress,
          to: zeroAddress,
          func: "function setAll(address,string,bytes32,bytes32)",
          permission: AccessPermission.ALLOW,
        });
      } catch (error) {
        expect((error as Error).message).to.equal(
          "Failed to create set permission signature: The wallet client does not support signTypedData, please try again.",
        );
      }
    });

    it("should return txHash and success when call createSetPermissionSignature given correct args ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      const res = await permissionClient.createSetPermissionSignature({
        ipId: zeroAddress,
        signer: zeroAddress,
        to: zeroAddress,
        func: "function setAll(address,string,bytes32,bytes32)",
        deadline: 2000,
        permission: AccessPermission.ALLOW,
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });

    it("should return encodedTxData when call createSetPermissionSignature given correct args and encodedTxDataOnly of true", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      const res = await permissionClient.createSetPermissionSignature({
        ipId: zeroAddress,
        signer: zeroAddress,
        to: zeroAddress,
        permission: AccessPermission.ALLOW,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(res.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("Test permission.setBatchPermissions", () => {
    it("should throw IpId error when call setBatchPermissions given ipId is not registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.setBatchPermissions({
          permissions: [
            {
              ipId: zeroAddress,
              signer: zeroAddress,
              to: zeroAddress,
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
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setBatchPermissions").resolves(txHash);

      const res = await permissionClient.setBatchPermissions({
        permissions: [
          {
            ipId: zeroAddress,
            signer: zeroAddress,
            to: zeroAddress,
            permission: AccessPermission.ALLOW,
          },
        ],
      });
      expect(res.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setBatchPermissions given correct args ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setBatchPermissions").resolves(txHash);

      const res = await permissionClient.setBatchPermissions({
        permissions: [
          {
            ipId: zeroAddress,
            signer: zeroAddress,
            to: zeroAddress,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });

    it("should return encodedTxData when call setBatchPermissions given correct args and encodedTxDataOnly of true", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(permissionClient.accessControllerClient, "setBatchPermissions").resolves(txHash);

      const res = await permissionClient.setBatchPermissions({
        permissions: [
          {
            ipId: zeroAddress,
            signer: zeroAddress,
            to: zeroAddress,
            permission: AccessPermission.ALLOW,
          },
        ],
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(res.encodedTxData?.data).to.be.a("string");
    });
  });

  describe("Test permission.createSetBatchPermissionsSignature", () => {
    it("should throw IpId error when call createSetBatchPermissionsSignature given ipId is not registered ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await permissionClient.createBatchPermissionSignature({
          ipId: zeroAddress,
          permissions: [
            {
              ipId: zeroAddress,
              signer: zeroAddress,
              to: zeroAddress,
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

    it("should return txHash and success when call createSetBatchPermissionsSignature given correct args ", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const res = await permissionClient.createBatchPermissionSignature({
        ipId: zeroAddress,
        deadline: 2000,
        permissions: [
          {
            ipId: zeroAddress,
            signer: zeroAddress,
            to: zeroAddress,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
      });
      expect(res.txHash).to.equal(txHash);
      expect(res.success).to.equal(true);
    });

    it("should return encodedTxData when call createSetBatchPermissionsSignature given correct args and encodedTxDataOnly of true", async () => {
      stub(permissionClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const res = await permissionClient.createBatchPermissionSignature({
        ipId: zeroAddress,
        permissions: [
          {
            ipId: zeroAddress,
            signer: zeroAddress,
            to: zeroAddress,
            permission: AccessPermission.ALLOW,
          },
        ],
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(res.encodedTxData?.data).to.be.a("string");
    });
  });
});
