import chai from "chai";
import { PIL_TYPE, StoryClient } from "../../src";
import { Hex, zeroAddress } from "viem";
import chaiAsPromised from "chai-as-promised";
import { mockERC721, getStoryClient, getTokenId, odyssey } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import { licensingModuleAddress, royaltyPolicyLapAddress } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("License Functions", () => {
  let client: StoryClient;
  let licenseId: bigint;

  before(() => {
    client = getStoryClient();
  });

  it("should not throw error when register license ", async () => {
    const result = await client.license.registerPILTerms({
      terms: {
        defaultMintingFee: "1",
        currency: MockERC20.address,
        transferable: false,
        royaltyPolicy: royaltyPolicyLapAddress[odyssey],
        commercialUse: true,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x",
        commercialRevShare: 0,
        derivativesAllowed: false,
        derivativesAttribution: false,
        derivativesApproval: false,
        derivativesReciprocal: false,
        uri: "",
        expiration: "",
        commercialRevCeiling: "",
        derivativeRevCeiling: "",
      },
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(result.licenseTermsId).to.be.a("bigint");
    licenseId = result.licenseTermsId!;
  });
  describe("attach License Terms and mint license tokens", async () => {
    let ipId: Hex;
    let tokenId;
    before(async () => {
      tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const mockERC20 = new MockERC20();
      await mockERC20.approve(licensingModuleAddress[odyssey]);
      ipId = registerResult.ipId!;
    });

    it("should not throw error when attach License Terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when mint license tokens", async () => {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        maxMintingFee: "1",
        maxRevenueShare: "100",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTokenIds).to.be.a("array").and.not.empty;
    });

    it("should not throw error when get license terms", async () => {
      const result = await client.license.getLicenseTerms(licenseId);
      expect(result).not.empty;
    });

    it("should not throw error when predict minting license fee", async () => {
      const result = await client.license.predictMintingLicenseFee({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        amount: 1,
      });
      expect(result.currencyToken).to.be.a("string").and.not.empty;
      expect(result.tokenAmount).to.be.a("bigint");
    });

    it("should not throw error when set licensing config", async () => {
      const result = await client.license.setLicensingConfig({
        ipId: ipId,
        licenseTermsId: 0n,
        licenseTemplate: zeroAddress,
        licensingConfig: {
          mintingFee: "1",
          isSet: true,
          licensingHook: zeroAddress,
          hookData: "0xFcd3243590d29B131a26B1554B0b21a5B43e622e",
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: "1",
          expectGroupRewardPool: zeroAddress,
        },
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.success).to.be.true;
    });
  });
});
