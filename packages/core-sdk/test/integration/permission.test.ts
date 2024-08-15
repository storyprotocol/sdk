import chai from "chai";
import { StoryClient } from "../../src";
import { mockERC721, getStoryClient, getTokenId, storyTestChainId } from "./utils/util";
import { Address } from "viem";
import { AccessPermission } from "../../src/types/resources/permission";
import chaiAsPromised from "chai-as-promised";
import { coreMetadataModuleAddress } from "../../src/abi/generated";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Permission Functions", () => {
  let client: StoryClient;
  let ipId: Address;
  const coreMetadataModule = coreMetadataModuleAddress[storyTestChainId];

  before(async () => {
    client = getStoryClient();
    const tokenId = await getTokenId();
    ipId = (
      await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).ipId!;
  });
  it("should not throw error when call setPermission", async () => {
    const response = await client.permission.setPermission({
      ipId: ipId,
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
      to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
      permission: 1,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(response.txHash).to.be.a("string").not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when call setAllPermissions", async () => {
    const response = await client.permission.setAllPermissions({
      ipId: ipId,
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
      permission: AccessPermission.ALLOW,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when call createSetPermissionSignature", async () => {
    const response = await client.permission.createSetPermissionSignature({
      ipId,
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
      to: coreMetadataModule,
      func: "function setAll(address,string,bytes32,bytes32)",
      permission: AccessPermission.ALLOW,
      deadline: 60000n,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when call setBatchPermissions", async () => {
    const response = await client.permission.setBatchPermissions({
      permissions: [
        {
          ipId: ipId,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.DENY,
          func: "function setAll(address,string,bytes32,bytes32)",
        },
        {
          ipId: ipId,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.DENY,
          func: "function freezeMetadata(address)",
        },
      ],
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when call createBatchPermissionSignature", async () => {
    const response = await client.permission.createBatchPermissionSignature({
      ipId: ipId,
      permissions: [
        {
          ipId: ipId,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.DENY,
          func: "function setAll(address,string,bytes32,bytes32)",
        },
        {
          ipId: ipId,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.DENY,
          func: "function freezeMetadata(address)",
        },
      ],
      deadline: 60000n,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });
});
