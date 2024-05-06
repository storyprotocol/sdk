import chai from "chai";
import { StoryClient } from "../../src";
import { Hex } from "viem";
import chaiAsPromised from "chai-as-promised";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("License Functions", () => {
  let client: StoryClient;

  before(function () {
    client = getStoryClientInSepolia();
  });
  describe("registering license with different types", async function () {
    it("should not throw error when registering license with non commercial social remixing PIL", async function () {
      const result = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("string").and.not.empty;
    });

    it("should not throw error when registering license with commercial use", async function () {
      const result = await client.license.registerCommercialUsePIL({
        mintingFee: "1",
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("string").not.empty;
    });

    it("should not throw error when registering license with commercial Remix use", async function () {
      const result = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("string").and.not.empty;
    });
  });

  describe("attach License Terms and mint license tokens", async function () {
    let ipId: Hex;
    let licenseId: string;
    let tokenId;
    before(async function () {
      tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        tokenContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      ipId = registerResult.ipId!;

      const registerLicenseResult = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      licenseId = registerLicenseResult.licenseTermsId!;
    });

    it("should not throw error when attach License Terms", async function () {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when minting license tokens", async function () {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTokenId).to.be.a("string").and.not.empty;
    });

    it("should not throw error when get license terms", async function () {
      const result = await client.license.getLicenseTerms(licenseId);
      expect(result).not.empty;
    });
  });
});
