import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address } from "viem";
import { getStoryClient, odyssey, mintBySpg } from "./utils/util";
import { PIL_TYPE, StoryClient } from "../../src";
import { MockERC20 } from "./utils/mockERC20";
import { evenSplitGroupPoolAddress } from "../../src/abi/generated";

const groupPoolAddress = evenSplitGroupPoolAddress[odyssey];

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("Group Functions", () => {
  let groupId: Address = "0xd275eCFe9b4754Ed7D80a6d667E15Ef5bb6F68e8";
  let client: StoryClient;
  let spgNftContract: Address;
  let licenseTermsId: bigint;
  let ipId: Address;
  before(async () => {
    client = getStoryClient();
    spgNftContract = (
      await client.nftClient.createNFTCollection({
        name: "test-collection",
        symbol: "TEST",
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: process.env.TEST_WALLET_ADDRESS! as Address,
        contractURI: "test-uri",
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).spgNftContract!;
    const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: spgNftContract,
      pilType: PIL_TYPE.COMMERCIAL_USE,
      commercialRevShare: 10,
      mintingFee: "0",
      currency: MockERC20.address,
      txOptions: {
        waitForTransaction: true,
      },
    });
    licenseTermsId = result.licenseTermsId!;
    ipId = result.ipId!;
  });

  it("should success when register group", async () => {
    const result = await client.groupClient.registerGroup({
      groupPool: groupPoolAddress,
      txOptions: {
        waitForTransaction: true,
      },
    });
    groupId = result.groupId!;
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.groupId).to.be.a("string").and.not.empty;
  });
  it("should success when mint and register ip and attach license and add to group", async () => {
    const result = await client.groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
      groupId,
      spgNftContract: spgNftContract,
      licenseTermsId: licenseTermsId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.ipId).to.be.a("string").and.not.empty;
  });
  it("should success when register ip and attach license and add to group", async () => {
    const tokenId = await mintBySpg(spgNftContract, "test-metadata");
    const result = await client.groupClient.registerIpAndAttachLicenseAndAddToGroup({
      groupId,
      nftContract: spgNftContract,
      tokenId: tokenId!,
      licenseTermsId: licenseTermsId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.ipId).to.be.a("string").and.not.empty;
  });

  it("should success when register group and attach license", async () => {
    const result = await client.groupClient.registerGroupAndAttachLicense({
      groupPool: groupPoolAddress,
      licenseTermsId: licenseTermsId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.groupId).to.be.a("string").and.not.empty;
  });

  it("should success when register group and attach license and add ips", async () => {
    const result = await client.groupClient.registerGroupAndAttachLicenseAndAddIps({
      groupPool: groupPoolAddress,
      ipIds: [ipId],
      licenseTermsId: licenseTermsId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.groupId).to.be.a("string").and.not.empty;
  });
});
