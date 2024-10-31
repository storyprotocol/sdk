import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { LicenseClient } from "../../../src";
import { PublicClient, WalletClient, Account, zeroAddress, Hex } from "viem";
import chaiAsPromised from "chai-as-promised";
import { PiLicenseTemplateGetLicenseTermsResponse } from "../../../src/abi/generated";
import { LicenseTerms } from "../../../src/types/resources/license";
import { MockERC20 } from "../../integration/utils/mockERC20";
const { RoyaltyModuleReadOnlyClient } = require("../../../src/abi/generated");

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
    licenseClient = new LicenseClient(rpcMock, walletMock, "1516");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test licenseClient.registerPILTerms", async () => {
    beforeEach(() => {
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
        .stub()
        .resolves(true);
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon.stub().resolves(true);
    });
    const licenseTerms: LicenseTerms = {
      defaultMintingFee: 1513n,
      currency: MockERC20.address,
      royaltyPolicy: zeroAddress,
      transferable: false,
      expiration: 0n,
      commercialUse: false,
      commercialAttribution: false,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: false,
      derivativesAttribution: false,
      derivativesApproval: false,
      derivativesReciprocal: false,
      derivativeRevCeiling: 0n,
      uri: "",
    };
    it("should return directly licenseTermsId when call registerPILTerms given request have already registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerPILTerms(licenseTerms);

      expect(result.licenseTermsId).to.equal(1n);
      expect(result.txHash).to.equal(undefined);
    });

    it("should throw commercialRevShare error when call registerPILTerms given commercialRevShare is more than 100", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      await expect(
        licenseClient.registerPILTerms({
          ...licenseTerms,
          commercialUse: true,
          defaultMintingFee: 1,
          currency: MockERC20.address,
          commercialRevShare: 101,
          royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        }),
      ).to.be.rejectedWith(
        "Failed to register license terms: CommercialRevShare should be between 0 and 100.",
      );
    });
    it("should throw commercialRevShare error when call registerPILTerms given commercialRevShare is less than 0", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      await expect(
        licenseClient.registerPILTerms({
          ...licenseTerms,
          commercialUse: true,
          defaultMintingFee: 1,
          currency: MockERC20.address,
          commercialRevShare: -1,
          royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        }),
      ).to.be.rejectedWith(
        "Failed to register license terms: CommercialRevShare should be between 0 and 100.",
      );
    });
    it("should return encodedTxData when call registerPILTerms given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.registerPILTerms({
        ...licenseTerms,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });

    it("should return txHash when call registerPILTerms given args is correct", async () => {
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

      const result = await licenseClient.registerPILTerms({
        ...licenseTerms,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when call registerPILTerms given args is correct and waitForTransaction of true", async () => {
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

      const result = await licenseClient.registerPILTerms({
        ...licenseTerms,
        commercialUse: true,
        defaultMintingFee: 1,
        currency: MockERC20.address,
        commercialRevShare: 90,
        royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });
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

    it("should return encodedTxData when call registerNonComSocialRemixingPIL given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.registerNonComSocialRemixingPIL({
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });
  });

  describe("Test licenseClient.registerCommercialUsePIL", async () => {
    it("should return licenseTermsId when call registerCommercialUsePIL given licenseTermsId is registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: 1,
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
        defaultMintingFee: "1",
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
        defaultMintingFee: "1",
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
          defaultMintingFee: "1",
          currency: zeroAddress,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial use PIL: request fail.",
        );
      }
    });

    it("should return encodedTxData when call registerCommercialUsePIL given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: "1",
        currency: zeroAddress,
        royaltyPolicyAddress: zeroAddress,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });
  });

  describe("Test licenseClient.registerCommercialRemixPIL", async () => {
    it("should return licenseTermsId when call registerCommercialRemixPIL given licenseTermsId is registered", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(1) });

      const result = await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: "1",
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
        defaultMintingFee: "1",
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
        defaultMintingFee: "1",
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
          defaultMintingFee: "1",
          commercialRevShare: 100,
          currency: zeroAddress,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial remix PIL: request fail.",
        );
      }
    });

    it("should return encodedTxData when call registerCommercialRemixPIL given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon
        .stub(licenseClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: BigInt(0) });
      sinon
        .stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: "1",
        commercialRevShare: 100,
        currency: zeroAddress,
        royaltyPolicyAddress: zeroAddress,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
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

    it("should return encodedTxData when call attachLicenseTerms given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      sinon
        .stub(licenseClient.licensingModuleClient, "attachLicenseTermsEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
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

    it("should return encodedTxData when call mintLicenseTokens given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon
        .stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(licenseClient.licensingModuleClient, "mintLicenseTokensEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: zeroAddress,
        licenseTermsId: "1",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });
  });

  describe("Test licenseClient.getLicenseTerms", async () => {
    it("should return license terms when call getLicenseTerms given licenseTermsId is exist", async () => {
      const mockLicenseTermsResponse: PiLicenseTemplateGetLicenseTermsResponse = {
        terms: {
          transferable: true,
          royaltyPolicy: zeroAddress,
          defaultMintingFee: BigInt(1),
          expiration: BigInt(1),
          commercialUse: true,
          commercialAttribution: true,
          commercializerChecker: zeroAddress,
          commercializerCheckerData: zeroAddress,
          commercialRevShare: 100,
          commercialRevCeiling: BigInt(1),
          derivativesAllowed: true,
          derivativesAttribution: true,
          derivativesApproval: true,
          derivativesReciprocal: true,
          derivativeRevCeiling: BigInt(1),
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

  describe("Test licenseClient.predictMintingLicenseFee", async () => {
    it("should throw register error when call predictMintingLicenseFee given licenseTermsId is not registered", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await licenseClient.predictMintingLicenseFee({
          licenseTermsId: "1",
          licensorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: "",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to predict minting license fee: The licensor IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should throw licenseTermsId error when call predictMintingLicenseFee given licenseTermsId is not exist", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);
      try {
        await licenseClient.predictMintingLicenseFee({
          licenseTermsId: "1",
          licensorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: "",
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to predict minting license fee: License terms id 1 do not exist.",
        );
      }
    });

    it("should return currency token and token amount when call predictMintingLicenseFee given licenseTemplate and receiver", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "predictMintingLicenseFee").resolves({
        currencyToken: zeroAddress,
        tokenAmount: 1n,
      });
      const result = await licenseClient.predictMintingLicenseFee({
        licenseTermsId: "1",
        licensorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: "",
        licenseTemplate: zeroAddress,
        receiver: zeroAddress,
      });

      expect(result).to.deep.equal({
        currencyToken: zeroAddress,
        tokenAmount: 1n,
      });
    });
    it("should return currency token and token amount when call predictMintingLicenseFee given correct args ", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "predictMintingLicenseFee").resolves({
        currencyToken: zeroAddress,
        tokenAmount: 1n,
      });
      const result = await licenseClient.predictMintingLicenseFee({
        licenseTermsId: "1",
        licensorIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: "",
      });

      expect(result).to.deep.equal({
        currencyToken: zeroAddress,
        tokenAmount: 1n,
      });
    });
  });

  describe("Test licenseClient.setLicensingConfig", async () => {
    it("should throw ip registry error when call setLicensingConfig given ip id is not registered", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The licensor IP with id 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw licenseTermsId error when call setLicensingConfig given licenseTermsId is not exist", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: License terms id 1 do not exist.",
        );
      }
    });

    it("should throw license hook error when call setLicensingConfig given license hook is not registered", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(false);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            hookData: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The licensing hook is not registered.",
        );
      }
    });

    it("should throw license template and license terms mismatch error when call setLicensingConfig given license template is zero address and license terms id is not zero address", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: licenseTemplate is zero address but licenseTermsId is zero.",
        );
      }
    });

    it("should return encodedTxData when call setLicensingConfig given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      sinon
        .stub(licenseClient.licensingModuleClient, "setLicensingConfigEncode")
        .returns({ to: zeroAddress, data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" });

      const result = await licenseClient.setLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: "1",
        licenseTemplate: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        licensingConfig: {
          isSet: false,
          mintingFee: "",
          licensingHook: zeroAddress,
          hookData: zeroAddress,
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });

    it("should return txHash when call setLicensingConfig given args is correct", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "setLicensingConfig").resolves(txHash);

      const result = await licenseClient.setLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: "1",
        licenseTemplate: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        licensingConfig: {
          isSet: false,
          mintingFee: "",
          licensingHook: zeroAddress,
          hookData: zeroAddress,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setLicensingConfig given args is correct and waitForTransaction of true", async () => {
      sinon.stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      sinon.stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      sinon.stub(licenseClient.licensingModuleClient, "setLicensingConfig").resolves(txHash);

      const result = await licenseClient.setLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: "1",
        licenseTemplate: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        licensingConfig: {
          isSet: false,
          mintingFee: "",
          licensingHook: zeroAddress,
          hookData: zeroAddress,
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.success).to.equal(true);
    });
  });
});
