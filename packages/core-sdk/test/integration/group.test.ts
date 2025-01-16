import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Address, zeroAddress, zeroHash } from "viem";
import { getStoryClient, odyssey, mintBySpg } from "./utils/util";
import { StoryClient } from "../../src";
import { MockERC20 } from "./utils/mockERC20";
import {
  evenSplitGroupPoolAddress,
  piLicenseTemplateAddress,
  royaltyPolicyLapAddress,
} from "../../src/abi/generated";

const groupPoolAddress = evenSplitGroupPoolAddress[odyssey];

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("Group Functions", () => {
  let groupId: Address;
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
      allowDuplicates: false,
      licenseTermsData: [
        {
          terms: {
            transferable: true,
            royaltyPolicy: royaltyPolicyLapAddress[odyssey],
            defaultMintingFee: 0n,
            expiration: BigInt(1000),
            commercialUse: true,
            commercialAttribution: false,
            commercializerChecker: zeroAddress,
            commercializerCheckerData: zeroAddress,
            commercialRevShare: 0,
            commercialRevCeiling: BigInt(0),
            derivativesAllowed: true,
            derivativesAttribution: true,
            derivativesApproval: false,
            derivativesReciprocal: true,
            derivativeRevCeiling: BigInt(0),
            currency: MockERC20.address,
            uri: "test case",
          },
          licensingConfig: {
            isSet: true,
            mintingFee: 0n,
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: groupPoolAddress,
          },
        },
      ],
      txOptions: {
        waitForTransaction: true,
      },
    });
    licenseTermsId = result.licenseTermsIds![0];

    ipId = result.ipId!;
    await client.license.setLicensingConfig({
      ipId: ipId,
      licenseTermsId: licenseTermsId,
      licenseTemplate: piLicenseTemplateAddress[odyssey],
      licensingConfig: {
        isSet: true,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: groupPoolAddress,
      },
    });
  });

  it("should success when register group", async () => {
    const result = await client.groupClient.registerGroup({
      groupPool: groupPoolAddress,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.groupId).to.be.a("string").and.not.empty;
  });
  it("should success when register group and attach license", async () => {
    const result = await client.groupClient.registerGroupAndAttachLicense({
      groupPool: groupPoolAddress,
      licenseData: {
        licenseTermsId: licenseTermsId!,
        licensingConfig: {
          isSet: true,
          mintingFee: 0n,
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
        },
      },
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
      licenseData: [
        {
          licenseTermsId: licenseTermsId!,
          licensingConfig: {
            isSet: true,
            mintingFee: 0n,
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: groupPoolAddress,
          },
        },
      ],
      allowDuplicates: true,
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
      licenseData: [
        {
          licenseTermsId: licenseTermsId!,
          licensingConfig: {
            isSet: true,
            mintingFee: 0n,
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: groupPoolAddress,
          },
        },
      ],
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.ipId).to.be.a("string").and.not.empty;
  });

  it("should success when register group and attach license and add ips", async () => {
    const result = await client.groupClient.registerGroupAndAttachLicenseAndAddIps({
      groupPool: groupPoolAddress,
      ipIds: [ipId],
      licenseData: {
        licenseTermsId: licenseTermsId!,
        licensingConfig: {
          isSet: true,
          mintingFee: 0n,
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
        },
      },
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.txHash).to.be.a("string").and.not.empty;
    expect(result.groupId).to.be.a("string").and.not.empty;
  });
});
