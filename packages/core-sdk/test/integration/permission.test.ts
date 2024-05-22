import chai from "chai";
import { StoryClient } from "../../src";
import { MockERC721, getStoryClientInSepolia, getTokenId, sepoliaChainId } from "./utils/util";
import { Address } from "viem";
import { AccessPermission } from "../../src/types/resources/permission";
import chaiAsPromised from "chai-as-promised";
import { coreMetadataModuleAddress } from "../../src/abi/generated";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Permission Functions", () => {
  let client: StoryClient;
  let ipId: Address;
  const coreMetadataModule = coreMetadataModuleAddress[sepoliaChainId];
  before(async () => {
    client = getStoryClientInSepolia();
    const tokenId = await getTokenId();
    ipId = (
      await client.ipAsset.register({
        nftContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).ipId!;
  });
  it.skip("should not throw error when setting permission", async () => {
    const response = await client.permission.setPermission({
      ipId: ipId,
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
      to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
      func: "0x00000000",
      permission: 1,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(response.txHash).to.be.a("string").not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });

  it.skip("should not throw error when setting all permissions", async () => {
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

  it("should not throw error when createSetPermissionSignature", async () => {
    const response = await client.permission.createSetPermissionSignature({
      ipId,
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Address,
      to: coreMetadataModule,
      func: "function setAll(address,string,bytes32,bytes32)",
      permission: AccessPermission.ALLOW,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.success).to.be.a("boolean").and.to.equal(true);
  });
});
