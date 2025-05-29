import chai from "chai";
import { StoryClient } from "../../src";
import { mockERC721, getStoryClient, getTokenId, aeneid } from "./utils/util";
import { Address } from "viem";
import { AccessPermission } from "../../src/types/resources/permission";
import chaiAsPromised from "chai-as-promised";
import { coreMetadataModuleAddress } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Permission Functions", () => {
  let client: StoryClient;
  let ipId: Address;
  const coreMetadataModule = coreMetadataModuleAddress[aeneid];

  before(async () => {
    client = getStoryClient();
    const tokenId = await getTokenId();
    const response = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
    });

    if (!response.ipId) {
      throw new Error("Failed to register IP");
    }
    ipId = response.ipId;
  });

  describe("Single Permission Operations", () => {
    it("should set permission successfully", async () => {
      const response = await client.permission.setPermission({
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Address,
        to: coreMetadataModule,
        permission: AccessPermission.ALLOW,
        func: "function setAll(address,string,bytes32,bytes32)",
      });

      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.success).to.be.true;
    });

    it("should get encoded data for setPermission", async () => {
      const response = await client.permission.setPermission({
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Address,
        to: coreMetadataModule,
        permission: AccessPermission.ALLOW,
        func: "function setAll(address,string,bytes32,bytes32)",
        txOptions: { encodedTxDataOnly: true },
      });

      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should set all permissions successfully", async () => {
      const response = await client.permission.setAllPermissions({
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Address,
        permission: AccessPermission.ALLOW,
      });

      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.success).to.be.true;
    });

    it("should get encoded data for setAllPermissions", async () => {
      const response = await client.permission.setAllPermissions({
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Address,
        permission: AccessPermission.ALLOW,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Permission Signatures", () => {
    it("should create set permission signature", async () => {
      const response = await client.permission.createSetPermissionSignature({
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Address,
        to: coreMetadataModule,
        func: "function setAll(address,string,bytes32,bytes32)",
        permission: AccessPermission.ALLOW,
        deadline: 60000n,
      });

      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.success).to.be.true;
    });

    it("should get encoded data for createSetPermissionSignature", async () => {
      const response = await client.permission.createSetPermissionSignature({
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Address,
        to: coreMetadataModule,
        func: "function setAll(address,string,bytes32,bytes32)",
        permission: AccessPermission.ALLOW,
        deadline: 60000n,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Batch Operations", () => {
    it("should set batch permissions successfully", async () => {
      const response = await client.permission.setBatchPermissions({
        permissions: [
          {
            ipId: ipId,
            signer: process.env.TEST_WALLET_ADDRESS as Address,
            to: coreMetadataModule,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
          {
            ipId: ipId,
            signer: process.env.TEST_WALLET_ADDRESS as Address,
            to: coreMetadataModule,
            permission: AccessPermission.DENY,
            func: "function freezeMetadata(address)",
          },
        ],
      });

      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.success).to.be.true;
    });

    it("should get encoded data for setBatchPermissions", async () => {
      const response = await client.permission.setBatchPermissions({
        permissions: [
          {
            ipId: ipId,
            signer: process.env.TEST_WALLET_ADDRESS as Address,
            to: coreMetadataModule,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
        txOptions: { encodedTxDataOnly: true },
      });

      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should create batch permission signature", async () => {
      const response = await client.permission.createBatchPermissionSignature({
        ipId: ipId,
        permissions: [
          {
            ipId: ipId,
            signer: process.env.TEST_WALLET_ADDRESS as Address,
            to: coreMetadataModule,
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
          {
            ipId: ipId,
            signer: process.env.TEST_WALLET_ADDRESS as Address,
            to: coreMetadataModule,
            permission: AccessPermission.DENY,
            func: "function freezeMetadata(address)",
          },
        ],
        deadline: 60000n,
      });

      expect(response.txHash).to.be.a("string").and.not.empty;
      expect(response.success).to.be.true;
    });
  });

  describe("Error Cases", () => {
    it("should fail when setting permission for unregistered IP", async () => {
      const unregisteredIpId = "0x1234567890123456789012345678901234567890";
      await expect(
        client.permission.setPermission({
          ipId: unregisteredIpId as Address,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.ALLOW,
        }),
      ).to.be.rejectedWith(`IP id with ${unregisteredIpId} is not registered.`);
    });

    it("should fail with invalid function signature", async () => {
      await expect(
        client.permission.setPermission({
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.ALLOW,
          func: "invalid_function_signature",
        }),
      ).to.be.rejected;
    });
  });
});
