import chai from "chai";
import { StoryClient } from "../../src";
import { mockERC721, getStoryClient, getTokenId, odyssey } from "./utils/util";
import { Address } from "viem";
import { AccessPermission } from "../../src/types/resources/permission";
import chaiAsPromised from "chai-as-promised";
import { coreMetadataModuleAddress } from "../../src/abi/generated";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Permission Functions", () => {
  let client: StoryClient;
  let ipId: Address;
  const coreMetadataModule = coreMetadataModuleAddress[odyssey];

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
  it("should not throw error when set permission", async () => {
    const response = await client.permission.setPermission({
      ipId: ipId,
      signer: process.env.TEST_WALLET_ADDRESS as Address,
      to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
      permission: 1,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(response.txHash).to.be.a("string").not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when set all permissions", async () => {
    const response = await client.permission.setAllPermissions({
      ipId: ipId,
      signer: process.env.TEST_WALLET_ADDRESS as Address,
      permission: AccessPermission.ALLOW,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when create set permission signature", async () => {
    const response = await client.permission.createSetPermissionSignature({
      ipId: "0xE54028E60070223a9b77097D9385933340D10691",
      signer: process.env.TEST_WALLET_ADDRESS as Address,
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

  it("should not throw error when set batch permissions", async () => {
    const response = await client.permission.setBatchPermissions({
      permissions: [
        {
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.DENY,
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
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it("should not throw error when create batch permission signature", async () => {
    const response = await client.permission.createBatchPermissionSignature({
      ipId: ipId,
      permissions: [
        {
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          to: coreMetadataModule,
          permission: AccessPermission.DENY,
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
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });
});
