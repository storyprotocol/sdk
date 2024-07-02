import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { LicenseClient } from "../../../src";
import { PublicClient, WalletClient, Account, zeroAddress, Hex } from "viem";
import chaiAsPromised from "chai-as-promised";
import {
  PiLicenseTemplateGetLicenseTermsResponse,
  RoyaltyPolicyLapClient,
} from "../../../src/abi/generated";
chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("Test LicenseClient", () => {
  let licenseClient: LicenseClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    licenseClient = new LicenseClient(rpcMock, walletMock);
    licenseClient.royaltyPolicyLAPClient = new RoyaltyPolicyLapClient(
      rpcMock,
      walletMock,
      zeroAddress,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test licenseClient.registerNonComSocialRemixingPIL", async () => {
    it("should return licenseTermsId when call registerNonComSocialRemixingPIL given licenseTermsId is registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerNonComSocialRemixingPIL();

      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txhash when call registerNonComSocialRemixingPIL given licenseTermsId is not registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      const result = await licenseClient.registerNonComSocialRemixingPIL();

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash when call registerNonComSocialRemixingPIL given licenseTermsId is not registered and waitForTransaction of true", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      sinon
        .stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent")
        .returns([
          {
            licenseTermsId: BigInt(1),
            licenseTemplate: zeroAddress,
            licenseTerms: zeroAddress,
          },
        ]);

      const result = await licenseClient.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return throw error when call registerNonComSocialRemixingPIL given request fail", async () => {
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

  describe("Test licenseClient.registerCommercialUsePIL", async () => {
    it("should return licenseTermsId when call registerCommercialUsePIL given licenseTermsId is registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerCommercialUsePIL({
        mintingFee: 1,
        currency: zeroAddress,
      });

      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txhash when call registerCommercialUsePIL given licenseTermsId is not registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      const result = await licenseClient.registerCommercialUsePIL({
        mintingFee: "1",
        currency: zeroAddress,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash when call registerCommercialUsePIL given licenseTermsId is not registered and waitForTransaction of true", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      sinon
        .stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent")
        .returns([
          {
            licenseTermsId: BigInt(1),
            licenseTemplate: zeroAddress,
            licenseTerms: zeroAddress,
          },
        ]);

      const result = await licenseClient.registerCommercialUsePIL({
        mintingFee: "1",
        currency: zeroAddress,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return throw error when call registerCommercialUsePIL given request fail", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTerms")
        .throws(new Error("request fail."));

      try {
        await licenseClient.registerCommercialUsePIL({
          mintingFee: "1",
          currency: zeroAddress,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial use PIL: request fail.",
        );
      }
    });
  });

  describe("Test licenseClient.registerCommercialRemixPIL", async () => {
    it("should return licenseTermsId when call registerCommercialRemixPIL given licenseTermsId is registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: zeroAddress,
      });

      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txhash when call registerCommercialRemixPIL given licenseTermsId is not registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      const result = await licenseClient.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: zeroAddress,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash when call registerCommercialRemixPIL given licenseTermsId is not registered and waitForTransaction of true", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon.stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      sinon
        .stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent")
        .returns([
          {
            licenseTermsId: BigInt(1),
            licenseTemplate: zeroAddress,
            licenseTerms: zeroAddress,
          },
        ]);

      const result = await licenseClient.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: zeroAddress,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return throw error when call registerCommercialRemixPIL given request fail", async () => {
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
          currency: zeroAddress,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial remix PIL: request fail.",
        );
      }
    });
  });

  describe("Test licenseClient.attachLicenseTerms", async () => {
    it("should throw ipId is not registered when call attachLicenseTerms given ipId is not registered", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: zeroAddress,
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to attach license terms: The IP with id 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw licenseTermsId error when call attachLicenseTerms given licenseTermsId is not exist", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: zeroAddress,
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to attach license terms: License terms id 1 do not exist.",
        );
      }
    });

    it("should return txHash of empty and success of false when call attachLicenseTerms given licenseTermsId is already attached", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
      });
      expect(result).to.deep.equal({
        txHash: "",
        success: false,
      });
    });

    it("should return txHash when call attachLicenseTerms given args is correct", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      sinon.stub(licenseClient.licensingModuleClient, "attachLicenseTerms").resolves(txHash);

      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should throw invalid address when call when call attachLicenseTerms given a invalid licenseTemplate address", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: "invalid address" as Hex,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          `Failed to attach license terms: request.licenseTemplate address is invalid: invalid address, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });
    it("should return txHash when call attachLicenseTerms given args is correct and waitForTransaction of true", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      sinon.stub(licenseClient.licensingModuleClient, "attachLicenseTerms").resolves(txHash);

      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test licenseClient.mintLicenseTokens", async () => {
    it("should throw licensor ipId error when call mintLicenseTokens given licensorIpId is not registered", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: The licensor IP with id 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw invalid address when call mintLicenseTokens given invalid licenseTemplate address", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: "invalid address" as Hex,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          `Failed to mint license tokens: request.licenseTemplate address is invalid: invalid address, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should throw invalid address when call mintLicenseTokens given invalid receiver address", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          receiver: "invalid address" as Hex,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          `Failed to mint license tokens: request.receiver address is invalid: invalid address, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should throw licenseTermsId error when call mintLicenseTokens given licenseTermsId is not exist", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: License terms id 1 do not exist.",
        );
      }
    });

    it("should throw attached error when call mintLicenseTokens given licenseTermsId is not attached", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: License terms id 1 is not attached to the IP with id 0x0000000000000000000000000000000000000000.",
        );
      }
    });

    it("should return txHash when call mintLicenseTokens given args is correct", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: zeroAddress,
        licenseTermsId: "1",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call mintLicenseTokens given args is correct and waitForTransaction of true", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      sinon.stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
        {
          caller: zeroAddress,
          licensorIpId: zeroAddress,
          licenseTemplate: zeroAddress,
          licenseTermsId: BigInt(1),
          amount: BigInt(1),
          receiver: zeroAddress,
          startLicenseTokenId: BigInt(1),
        },
      ]);

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: zeroAddress,
        licenseTermsId: "1",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTokenIds).to.deep.equal([1n]);
    });

    it("should return txHash when call mintLicenseTokens given args is correct and waitForTransaction of true, amount of 5", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      sinon.stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
        {
          caller: zeroAddress,
          licensorIpId: zeroAddress,
          licenseTemplate: zeroAddress,
          licenseTermsId: BigInt(1),
          amount: BigInt(1),
          receiver: zeroAddress,
          startLicenseTokenId: BigInt(1),
        },
      ]);

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: zeroAddress,
        licenseTermsId: "1",
        amount: 5,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTokenIds).to.deep.equal([1n, 2n, 3n, 4n, 5n]);
    });
  });

  describe("Test licenseClient.getLicenseTerms", async () => {
    it("should return license terms when call getLicenseTerms given licenseTermsId is exist", async () => {
      const mockLicenseTermsResponse: PiLicenseTemplateGetLicenseTermsResponse = {
        terms: {
          transferable: true,
          royaltyPolicy: zeroAddress,
          mintingFee: BigInt(1),
          expiration: BigInt(1),
          commercialUse: true,
          commercialAttribution: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 100,
          commercialRevCelling: BigInt(1),
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: true,
          derivativesReciprocal: true,
          derivativeRevCelling: BigInt(1),
          currency: zeroAddress,
          uri: "string",
        },
      };
      sinon
        .stub(licenseClient.piLicenseTemplateReadOnlyClient, "getLicenseTerms")
        .resolves(mockLicenseTermsResponse);

      const result = await licenseClient.getLicenseTerms("1");

      expect(result).to.equal(mockLicenseTermsResponse);
    });

    it("should throw error when call getLicenseTerms given licenseTermsId is not exist", async () => {
      sinon
        .stub(licenseClient.piLicenseTemplateReadOnlyClient, "getLicenseTerms")
        .throws(new Error("Given licenseTermsId is not exist."));

      try {
        await licenseClient.getLicenseTerms("1");
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to get license terms: Given licenseTermsId is not exist.",
        );
      }
    });
  });
});
