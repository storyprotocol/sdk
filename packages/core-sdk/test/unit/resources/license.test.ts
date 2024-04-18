import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { LicenseClient } from "../../../src";
import { PublicClient, WalletClient, Account } from "viem";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("Test LicenseClient", function () {
  let licenseClient: LicenseClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    licenseClient = new LicenseClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test licenseClient.registerNonComSocialRemixingPIL", async function () {
    it("should return licenseTermsId when call registerNonComSocialRemixingPIL given licenseTermsId is registered", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerNonComSocialRemixingPIL();

      expect(result.licenseTermsId).to.equal("1");
    });

    it("should return txhash when call registerNonComSocialRemixingPIL given licenseTermsId is not registered", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      const result = await licenseClient.registerNonComSocialRemixingPIL();

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash when call registerNonComSocialRemixingPIL given licenseTermsId is not registered and waitForTransaction of true", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      sinon
        .stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent")
        .returns([
          {
            licenseTermsId: BigInt(1),
            licenseTemplate: "0x",
            licenseTerms: "0x",
          },
        ]);

      const result = await licenseClient.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal("1");
    });

    it("should return throw error when call registerNonComSocialRemixingPIL given request fail", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTerms")
        .throws(new Error("request fail."));
      try {
        await licenseClient.registerNonComSocialRemixingPIL({
          txOptions: {
            waitForTransaction: true,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register non commercial social remixing PIL: request fail.",
        );
      }
    });
  });

  describe("Test licenseClient.registerCommercialUsePIL", async function () {
    it("should return licenseTermsId when call registerCommercialUsePIL given licenseTermsId is registered", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerCommercialUsePIL({
        mintingFee: "1",
        currency: "0x",
      });

      expect(result.licenseTermsId).to.equal("1");
    });

    it("should return txhash when call registerCommercialUsePIL given licenseTermsId is not registered", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      const result = await licenseClient.registerCommercialUsePIL({
        mintingFee: "1",
        currency: "0x",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash when call registerCommercialUsePIL given licenseTermsId is not registered and waitForTransaction of true", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      sinon
        .stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent")
        .returns([
          {
            licenseTermsId: BigInt(1),
            licenseTemplate: "0x",
            licenseTerms: "0x",
          },
        ]);

      const result = await licenseClient.registerCommercialUsePIL({
        mintingFee: "1",
        currency: "0x",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal("1");
    });

    it("should return throw error when call registerCommercialUsePIL given request fail", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTerms")
        .throws(new Error("request fail."));

      try {
        await licenseClient.registerCommercialUsePIL({
          mintingFee: "1",
          currency: "0x",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial use PIL: request fail.",
        );
      }
    });
  });

  describe("Test licenseClient.registerCommercialRemixPIL", async function () {
    it("should return licenseTermsId when call registerCommercialRemixPIL given licenseTermsId is registered", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: "0x",
      });

      expect(result.licenseTermsId).to.equal("1");
    });

    it("should return txhash when call registerCommercialRemixPIL given licenseTermsId is not registered", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      const result = await licenseClient.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: "0x",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash when call registerCommercialRemixPIL given licenseTermsId is not registered and waitForTransaction of true", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      sinon
        .stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent")
        .returns([
          {
            licenseTermsId: BigInt(1),
            licenseTemplate: "0x",
            licenseTerms: "0x",
          },
        ]);

      const result = await licenseClient.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: "0x",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal("1");
    });

    it("should return throw error when call registerCommercialRemixPIL given request fail", async function () {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTerms")
        .throws(new Error("request fail."));
      try {
        await licenseClient.registerCommercialRemixPIL({
          mintingFee: "1",
          commercialRevShare: 100,
          currency: "0x",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial remix PIL: request fail.",
        );
      }
    });
  });

  describe("Test licenseClient.attachLicenseTerms", async function () {
    it("should throw ipId is not registered when call attachLicenseTerms given ipId is not registered", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: "0x",
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to attach license terms: The IP with id 0x is not registered.",
        );
      }
    });

    it("should throw licenseTermsId error when call attachLicenseTerms given licenseTermsId is not exist", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: "0x",
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to attach license terms: License terms id 1 do not exist.",
        );
      }
    });

    it("should throw attached error when call attachLicenseTerms given licenseTermsId is already attached", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: "0x",
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to attach license terms: License terms id 1 is already attached to the IP with id 0x.",
        );
      }
    });

    it("should return txHash when call attachLicenseTerms given args is correct", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      sinon.stub(licenseClient.licensingModuleClient, "attachLicenseTerms").resolves(txHash);

      const result = await licenseClient.attachLicenseTerms({
        ipId: "0x",
        licenseTermsId: "1",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call attachLicenseTerms given args is correct and waitForTransaction of true", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      sinon.stub(licenseClient.licensingModuleClient, "attachLicenseTerms").resolves(txHash);

      const result = await licenseClient.attachLicenseTerms({
        ipId: "0x",
        licenseTermsId: "1",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test licenseClient.mintLicenseTokens", async function () {
    it("should throw licensor ipId error when call mintLicenseTokens given licensorIpId is not registered", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: "0x",
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: The licensor IP with id 0x is not registered.",
        );
      }
    });

    it("should throw licenseTermsId error when call mintLicenseTokens given licenseTermsId is not exist", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: "0x",
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: License terms id 1 do not exist.",
        );
      }
    });

    it("should throw attached error when call mintLicenseTokens given licenseTermsId is not attached", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: "0x",
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: License terms id 1 is not attached to the IP with id 0x.",
        );
      }
    });

    it("should return txHash when call mintLicenseTokens given args is correct", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: "0x",
        licenseTermsId: "1",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call mintLicenseTokens given args is correct and waitForTransaction of true", async function () {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      sinon.stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
        {
          caller: "0x",
          licensorIpId: "0x",
          licenseTemplate: "0x",
          licenseTermsId: BigInt(1),
          amount: BigInt(1),
          receiver: "0x",
          startLicenseTokenId: BigInt(1),
        },
      ]);

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: "0x",
        licenseTermsId: "1",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTokenId).to.equal("1");
    });
  });
});
