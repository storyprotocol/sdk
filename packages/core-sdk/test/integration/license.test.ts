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

  before(() => {
    client = getStoryClientInSepolia();
  });
  describe("registering license with different types", async () => {
    it("should not throw error when registering license with commercial use", async () => {
      const result = await client.license.registerCommercialUsePIL({
        mintingFee: "1",
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });

    it("should not throw error when registering license with commercial Remix use", async () => {
      const result = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
  });

  describe("attach License Terms and mint license tokens", async () => {
    let ipId: Hex;
    let licenseId: bigint;
    let tokenId;
    before(async () => {
      tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      ipId = registerResult.ipId!;

      const registerLicenseResult = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      licenseId = registerLicenseResult.licenseTermsId!;
    });

    it.skip("should not throw error when attach License Terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when minting license tokens", async () => {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
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
  });
});
