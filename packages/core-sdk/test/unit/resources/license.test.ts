import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SinonStub, stub } from "sinon";
import { Address, Hex, PublicClient, WalletClient, zeroAddress } from "viem";

import { LicenseClient, LicensingConfig, NativeRoyaltyPolicy } from "../../../src";
import {
  IpAccountImplClient,
  PiLicenseTemplateClient,
  PiLicenseTemplateGetLicenseTermsResponse,
  RoyaltyModuleReadOnlyClient,
  WrappedIpClient,
} from "../../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { LicenseTerms } from "../../../src/types/resources/license";
import { ipId, mockAddress, walletAddress } from "../mockData";
import {
  createMockPublicClient,
  createMockWalletClient,
  generateRandomAddress,
  generateRandomHash,
} from "../testUtils";

use(chaiAsPromised);

const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("Test LicenseClient", () => {
  let licenseClient: LicenseClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    licenseClient = new LicenseClient(rpcMock, walletMock, 1315);
    (licenseClient.licenseTemplateClient as { address: string }).address = generateRandomAddress();
    (licenseClient.licensingModuleClient as { address: string }).address = generateRandomAddress();
  });

  describe("Test licenseClient.registerPILTerms", () => {
    beforeEach(() => {
      stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyToken").resolves(true);

      stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyPolicy").resolves(true);
    });
    const licenseTerms: LicenseTerms = {
      defaultMintingFee: 1513n,
      currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      transferable: false,
      expiration: 0n,
      commercialUse: true,
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
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(1),
      });

      const result = await licenseClient.registerPILTerms(licenseTerms);

      expect(result.licenseTermsId).to.equal(1n);
      expect(result.txHash).to.equal(undefined);
    });

    it("should throw commercialRevShare error when call registerPILTerms given commercialRevShare is more than 100", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      await expect(
        licenseClient.registerPILTerms({
          ...licenseTerms,
          commercialUse: true,
          defaultMintingFee: 1,
          currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          commercialRevShare: 101,
          royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        }),
      ).to.be.rejectedWith(
        "Failed to register license terms: CommercialRevShare should be between 0 and 100.",
      );
    });
    it("should throw commercialRevShare error when call registerPILTerms given commercialRevShare is less than 0", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      await expect(
        licenseClient.registerPILTerms({
          ...licenseTerms,
          commercialUse: true,
          defaultMintingFee: 1,
          currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          commercialRevShare: -1,
          royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        }),
      ).to.be.rejectedWith(
        "Failed to register license terms: CommercialRevShare should be between 0 and 100.",
      );
    });
    it("should return encodedTxData when call registerPILTerms given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

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
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
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

    it("should return txHash when call registerPILTerms given args is correct ", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
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
        currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        commercialRevShare: 90,
        royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });
  });
  describe("Test licenseClient.registerNonComSocialRemixingPIL", () => {
    it("should return licenseTermsId when call registerNonComSocialRemixingPIL given licenseTermsId is registered", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(1),
      });

      const result = await licenseClient.registerNonComSocialRemixingPIL();

      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txhash when call registerNonComSocialRemixingPIL given licenseTermsId is not registered ", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
        {
          licenseTermsId: BigInt(1),
          licenseTemplate: zeroAddress,
          licenseTerms: zeroAddress,
        },
      ]);

      const result = await licenseClient.registerNonComSocialRemixingPIL();

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });
    it("should return throw error when call registerNonComSocialRemixingPIL given request fail", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").throws(
        new Error("request fail."),
      );
      try {
        await licenseClient.registerNonComSocialRemixingPIL();
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register non commercial social remixing PIL: request fail.",
        );
      }
    });

    it("should return encodedTxData when call registerNonComSocialRemixingPIL given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

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

  describe("Test licenseClient.registerCommercialUsePIL", () => {
    it("should return licenseTermsId when call registerCommercialUsePIL given licenseTermsId is registered", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(1),
      });

      const result = await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: 1,
        currency: mockAddress,
      });

      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txhash when call registerCommercialUsePIL given licenseTermsId is not registered ", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
        {
          licenseTermsId: BigInt(1),
          licenseTemplate: zeroAddress,
          licenseTerms: zeroAddress,
        },
      ]);
      const result = await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: "1",
        currency: mockAddress,
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return throw error when call registerCommercialUsePIL given request fail", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").throws(
        new Error("request fail."),
      );

      try {
        await licenseClient.registerCommercialUsePIL({
          defaultMintingFee: "1",
          currency: mockAddress,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial use PIL: request fail.",
        );
      }
    });

    it("should return encodedTxData when call registerCommercialUsePIL given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

      const result = await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: "1",
        currency: mockAddress,
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

  describe("Test licenseClient.registerCommercialRemixPIL", () => {
    it("should return licenseTermsId when call registerCommercialRemixPIL given licenseTermsId is registered", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(1),
      });

      const result = await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: "1",
        commercialRevShare: 100,
        currency: mockAddress,
      });

      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txhash when call registerCommercialRemixPIL given licenseTermsId is not registered", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
        {
          licenseTermsId: BigInt(1),
          licenseTemplate: zeroAddress,
          licenseTerms: zeroAddress,
        },
      ]);
      const result = await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: "1",
        commercialRevShare: 100,
        currency: mockAddress,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return throw error when call registerCommercialRemixPIL given request fail", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").throws(
        new Error("request fail."),
      );

      try {
        await licenseClient.registerCommercialRemixPIL({
          defaultMintingFee: "1",
          commercialRevShare: 100,
          currency: mockAddress,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to register commercial remix PIL: request fail.",
        );
      }
    });

    it("should return encodedTxData when call registerCommercialRemixPIL given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: BigInt(0),
      });

      stub(licenseClient.licenseTemplateClient, "registerLicenseTermsEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

      const result = await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: "1",
        commercialRevShare: 100,
        currency: mockAddress,
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

  describe("Test licenseClient.attachLicenseTerms", () => {
    it("should throw ipId is not registered when call attachLicenseTerms given ipId is not registered", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);

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
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);

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

    it("should success of false when call attachLicenseTerms given licenseTermsId is already attached", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
      });
      expect(result).to.deep.equal({
        success: false,
      });
    });

    it("should return txHash when call attachLicenseTerms given args is correct", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(
        false,
      );
      stub(licenseClient.licensingModuleClient, "attachLicenseTerms").resolves(txHash);

      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should throw invalid address when call when call attachLicenseTerms given a invalid licenseTemplate address", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      try {
        await licenseClient.attachLicenseTerms({
          ipId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: "invalid address" as Address,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          `Failed to attach license terms: Invalid address: invalid address.`,
        );
      }
    });
    it("should return txHash when call attachLicenseTerms given args is correct ", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(
        false,
      );
      stub(licenseClient.licensingModuleClient, "attachLicenseTerms").resolves(txHash);

      const result = await licenseClient.attachLicenseTerms({
        ipId: zeroAddress,
        licenseTermsId: "1",
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return encodedTxData when call attachLicenseTerms given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(
        false,
      );

      stub(licenseClient.licensingModuleClient, "attachLicenseTermsEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

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

  describe("Test licenseClient.mintLicenseTokens", () => {
    beforeEach(() => {
      // Mock `predictMintingLicenseFee` method
      rpcMock.readContract = stub().resolves([WIP_TOKEN_ADDRESS, 0n]);
    });
    it("should throw licensor ipId error when call mintLicenseTokens given licensorIpId is not registered", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          maxMintingFee: 1,
          maxRevenueShare: 1,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: The licensor IP with id 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw minting fee error when call mintLicenseTokens given minting fee is less than 0", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          maxMintingFee: -1,
          maxRevenueShare: 1,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: The maxMintingFee must be greater than 0.",
        );
      }
    });
    it("should throw invalid address when call mintLicenseTokens given invalid licenseTemplate address", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          licenseTemplate: "invalid address" as Hex,
          maxMintingFee: 1,
          maxRevenueShare: 1,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          `Failed to mint license tokens: Invalid address: invalid address.`,
        );
      }
    });

    it("should throw invalid address when call mintLicenseTokens given invalid receiver address", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          receiver: "invalid address" as Hex,
          maxMintingFee: 1,
          maxRevenueShare: 1,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          `Failed to mint license tokens: Invalid address: invalid address.`,
        );
      }
    });

    it("should throw licenseTermsId error when call mintLicenseTokens given licenseTermsId is not exist", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          maxMintingFee: 1,
          maxRevenueShare: 1,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: License terms id 1 do not exist.",
        );
      }
    });
    it("should not call attached license terms given licensorIpId is owned by the caller", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      const hasIpAttachedLicenseTermsStub = stub(
        licenseClient.licenseRegistryReadOnlyClient,
        "hasIpAttachedLicenseTerms",
      ).resolves(true);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
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
      await licenseClient.mintLicenseTokens({
        licensorIpId: ipId,
        licenseTermsId: "1",
        maxMintingFee: 1,
        maxRevenueShare: 1,
      });

      expect(hasIpAttachedLicenseTermsStub.notCalled).to.equal(true);
    });

    it("should call attached license terms given licensorIpId is not owned by the caller", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      const hasIpAttachedLicenseTermsStub = stub(
        licenseClient.licenseRegistryReadOnlyClient,
        "hasIpAttachedLicenseTerms",
      ).resolves(true);
      stub(IpAccountImplClient.prototype, "owner").resolves(mockAddress);
      stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
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
      await licenseClient.mintLicenseTokens({
        licensorIpId: ipId,
        licenseTermsId: "1",
        maxMintingFee: 1,
        maxRevenueShare: 1,
      });

      expect(hasIpAttachedLicenseTermsStub.calledOnce).to.equal(true);
    });

    it("should not call attached license terms given licensorIpId is owned by the caller and licenseTermsId is default", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.licenseRegistryReadOnlyClient, "getDefaultLicenseTerms").resolves({
        licenseTemplate: zeroAddress,
        licenseTermsId: BigInt(1),
      });
      const hasIpAttachedLicenseTermsStub = stub(
        licenseClient.licenseRegistryReadOnlyClient,
        "hasIpAttachedLicenseTerms",
      ).resolves(false);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
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
      await licenseClient.mintLicenseTokens({
        licensorIpId: ipId,
        licenseTermsId: "1",
        maxMintingFee: 1,
        maxRevenueShare: 1,
      });

      expect(hasIpAttachedLicenseTermsStub.notCalled).to.equal(true);
    });

    it("should throw attached error when call mintLicenseTokens given licenseTermsId is not attached", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(IpAccountImplClient.prototype, "owner").resolves(mockAddress);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(
        false,
      );

      try {
        await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          maxMintingFee: 1,
          maxRevenueShare: 1,
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to mint license tokens: License terms id 1 is not attached to the IP with id 0x0000000000000000000000000000000000000000.",
        );
      }
    });

    it("should return txHash when call mintLicenseTokens given args is correct ", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
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
        maxMintingFee: 1,
        maxRevenueShare: 1,
        licenseTemplate: zeroAddress,
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTokenIds).to.deep.equal([1n]);
    });

    it("should return txHash when call mintLicenseTokens given args is correct , amount of 5", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(licenseClient.licensingModuleClient, "mintLicenseTokens").resolves(txHash);
      stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
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
        maxMintingFee: 1,
        maxRevenueShare: 1,
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTokenIds).to.deep.equal([1n, 2n, 3n, 4n, 5n]);
    });

    it("should return encodedTxData when call mintLicenseTokens given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);

      stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      stub(licenseClient.licensingModuleClient, "mintLicenseTokensEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

      const result = await licenseClient.mintLicenseTokens({
        licensorIpId: zeroAddress,
        licenseTermsId: "1",
        txOptions: {
          encodedTxDataOnly: true,
        },
        maxMintingFee: 1,
        maxRevenueShare: 1,
      });

      expect(result.encodedTxData).to.deep.equal({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });

    describe("With Minting Fees", () => {
      let mintLicenseTokensStub: SinonStub;
      let balanceStub: SinonStub;
      let simulateContractStub: SinonStub;

      beforeEach(() => {
        // Mock predictMintingLicenseFee
        rpcMock.readContract = stub().resolves([WIP_TOKEN_ADDRESS, 100n]);
        stub(WrappedIpClient.prototype, "approve").resolves(txHash);
        stub(WrappedIpClient.prototype, "allowance").resolves({
          result: 50n,
        });
        stub(WrappedIpClient.prototype, "balanceOf").resolves({
          result: 0n,
        });
        balanceStub = stub().resolves(200n);
        rpcMock.getBalance = balanceStub;
        simulateContractStub = stub().resolves(generateRandomHash());
        rpcMock.simulateContract = simulateContractStub;
        walletMock.writeContract = stub().resolves(generateRandomHash());
        mintLicenseTokensStub = stub(
          licenseClient.licensingModuleClient,
          "mintLicenseTokens",
        ).resolves(txHash);
        stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
        stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);

        stub(licenseClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(
          true,
        );
        stub(IpAccountImplClient.prototype, "owner").resolves(walletAddress);
      });

      it("should auto convert IP to WIP", async () => {
        stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns([
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
          maxMintingFee: 1,
          maxRevenueShare: 1,
          options: {
            wipOptions: { useMulticallWhenPossible: false },
          },
        });
        expect(result.txHash).to.equal(txHash);
        expect(mintLicenseTokensStub.calledOnce).equal(true);
        expect((mintLicenseTokensStub.firstCall.args[0] as { receiver: string }).receiver).to.equal(
          walletMock.account!.address,
        );
        expect(simulateContractStub.callCount).to.equal(1);
        expect(
          (simulateContractStub.firstCall.args[0] as { functionName: string }).functionName,
          "deposit",
        );
      });

      it("should support multicall when converting IP to WIP", async () => {
        const mockLicenseTokenIds = [
          {
            caller: zeroAddress,
            licensorIpId: zeroAddress,
            licenseTemplate: zeroAddress,
            licenseTermsId: 1n,
            amount: 1n,
            receiver: zeroAddress,
            startLicenseTokenId: 1n,
          },
        ];

        stub(licenseClient.licensingModuleClient, "parseTxLicenseTokensMintedEvent").returns(
          mockLicenseTokenIds,
        );
        const {
          txHash: mintTxHash,
          receipt,
          licenseTokenIds,
        } = await licenseClient.mintLicenseTokens({
          licensorIpId: zeroAddress,
          licenseTermsId: "1",
          maxMintingFee: 1,
          maxRevenueShare: 1,
        });
        expect(licenseTokenIds![0]).to.equal(mockLicenseTokenIds[0].startLicenseTokenId);
        expect(mintTxHash).to.not.equal(undefined);
        expect(receipt).to.not.equal(undefined);
        expect(mintLicenseTokensStub.notCalled).to.equal(true);
        expect(simulateContractStub.calledOnce).to.equal(true);
      });
    });
  });

  describe("Test licenseClient.getLicenseTerms", () => {
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

      stub(licenseClient.piLicenseTemplateReadOnlyClient, "getLicenseTerms").resolves(
        mockLicenseTermsResponse,
      );

      const result = await licenseClient.getLicenseTerms("1");

      expect(result).to.equal(mockLicenseTermsResponse);
    });

    it("should throw error when call getLicenseTerms given licenseTermsId is not exist", async () => {
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "getLicenseTerms").throws(
        new Error("Given licenseTermsId is not exist."),
      );

      try {
        await licenseClient.getLicenseTerms("1");
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to get license terms: Given licenseTermsId is not exist.",
        );
      }
    });
  });

  describe("Test licenseClient.predictMintingLicenseFee", () => {
    it("should throw register error when call predictMintingLicenseFee given licenseTermsId is not registered", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);
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
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);
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
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      // Mock predictMintingLicenseFee
      rpcMock.readContract = stub().resolves([zeroAddress, 1n]);

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
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      // Mock predictMintingLicenseFee
      rpcMock.readContract = stub().resolves([zeroAddress, 1n]);

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

  describe("Test licenseClient.setLicensingConfig", () => {
    it("should throw ip registry error when call setLicensingConfig given ip id is not registered", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: 1,
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The licensor IP with id 0x0000000000000000000000000000000000000000 is not registered.",
        );
      }
    });

    it("should throw licenseTermsId error when call setLicensingConfig given licenseTermsId is not exist", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(false);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: 1,
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: License terms id 1 do not exist.",
        );
      }
    });

    it("should throw minting fee error when call setLicensingConfig given minting fee is less than 0", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.licensingModuleClient, "setLicensingConfig").resolves(txHash);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: 1,
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: -1,
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The mintingFee must be greater than 0.",
        );
      }
    });
    it("should throw license hook error when call setLicensingConfig given license hook is not registered", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(false);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: 1,
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The licensing hook is not registered.",
        );
      }
    });

    it("should throw license template and license terms mismatch error when call setLicensingConfig given license template is zero address and license terms id is not zero address", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: 1,
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 0,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The license template is zero address but license terms id is not zero.",
        );
      }
    });
    it("should throw license template cannot be zero address error when call setLicensingConfig given license template is zero address and commercial revenue share is not zero", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      try {
        await licenseClient.setLicensingConfig({
          ipId: zeroAddress,
          licenseTermsId: 1,
          licenseTemplate: zeroAddress,
          licensingConfig: {
            isSet: false,
            mintingFee: "",
            licensingHook: zeroAddress,
            hookData: zeroAddress,
            commercialRevShare: 1,
            disabled: false,
            expectMinimumGroupRewardShare: 0,
            expectGroupRewardPool: zeroAddress,
          },
        });
      } catch (error) {
        expect((error as Error).message).equal(
          "Failed to set licensing config: The license template cannot be zero address if commercial revenue share is not zero.",
        );
      }
    });
    it("should return encodedTxData when call setLicensingConfig given txOptions.encodedTxDataOnly of true and args is correct", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);

      stub(licenseClient.licensingModuleClient, "setLicensingConfigEncode").returns({
        to: zeroAddress,
        data: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

      const result = await licenseClient.setLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: 1,
        licenseTemplate: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        licensingConfig: {
          isSet: false,
          mintingFee: "",
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
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
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      stub(licenseClient.licensingModuleClient, "setLicensingConfig").resolves(txHash);

      const result = await licenseClient.setLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: 1,
        licenseTemplate: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        licensingConfig: {
          isSet: false,
          mintingFee: "",
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and success when call setLicensingConfig given args is correct ", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.moduleRegistryReadOnlyClient, "isRegistered").resolves(true);
      stub(licenseClient.licensingModuleClient, "setLicensingConfig").resolves(txHash);

      const result = await licenseClient.setLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: 1,
        licensingConfig: {
          isSet: false,
          mintingFee: "",
          licensingHook: zeroAddress,
          hookData: zeroAddress,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.success).to.equal(true);
    });
  });

  describe("Test licenseClient.getLicensingConfig", () => {
    it("should throw error given rpc error", async () => {
      stub(licenseClient.licenseRegistryReadOnlyClient, "getLicensingConfig").rejects(
        new Error("rpc error"),
      );
      const result = licenseClient.getLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: 1,
        licenseTemplate: zeroAddress,
      });
      await expect(result).to.rejectedWith("Failed to get licensing config: rpc error");
    });

    it("should return licensing config given args is correct", async () => {
      const mockLicensingConfig: LicensingConfig = {
        isSet: false,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: zeroAddress,
      };

      stub(licenseClient.licenseRegistryReadOnlyClient, "getLicensingConfig").resolves(
        mockLicensingConfig,
      );
      const result = await licenseClient.getLicensingConfig({
        ipId: zeroAddress,
        licenseTermsId: 1,
      });
      expect(result).to.deep.equal(mockLicensingConfig);
    });
  });

  describe("Test licenseClient.registerCreativeCommonsAttributionPIL", () => {
    it("should throw error given rpc error", async () => {
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").rejects(
        new Error("rpc error"),
      );
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 0n,
      });
      const result = licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
      });
      await expect(result).to.rejectedWith(
        "Failed to register creative commons attribution PIL: rpc error",
      );
    });
    it("should return licenseTermsId when call given args is registered", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 1n,
      });
      const result = await licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
      });
      expect(result.licenseTermsId).to.equal(1n);
      expect(result.txHash).to.equal(undefined);
    });

    it("should return txHash when call given args is correct", async () => {
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 0n,
      });
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
        {
          licenseTermsId: 1n,
          licenseTemplate: zeroAddress,
          licenseTerms: zeroAddress,
        },
      ]);
      const result = await licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
      });
      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });

    it("should return txHash and success when call given args is correct ", async () => {
      stub(licenseClient.licenseTemplateClient, "registerLicenseTerms").resolves(txHash);
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 0n,
      });

      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
        {
          licenseTermsId: 1n,
          licenseTemplate: zeroAddress,
          licenseTerms: zeroAddress,
        },
      ]);
      const result = await licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
      });
      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(1n);
    });
  });

  describe("Test licenseClient.setMaxLicenseTokens", () => {
    it("should throw error giving query licensing config failed", async () => {
      stub(licenseClient.licenseRegistryReadOnlyClient, "getLicensingConfig").rejects(
        new Error("rpc error"),
      );
      const result = licenseClient.setMaxLicenseTokens({
        ipId: zeroAddress,
        licenseTermsId: 1,
        maxLicenseTokens: 100,
      });
      await expect(result).to.rejectedWith(
        "Failed to set max license tokens: Failed to get licensing config: rpc error",
      );
    });

    it("should throw error given max license tokens is less than 0", async () => {
      const result = licenseClient.setMaxLicenseTokens({
        ipId: zeroAddress,
        licenseTermsId: 1,
        maxLicenseTokens: -1,
      });
      await expect(result).to.rejectedWith(
        "Failed to set max license tokens: The max license tokens must be greater than 0.",
      );
    });

    it("should return txHash when call given args is correct", async () => {
      stub(licenseClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(licenseClient.piLicenseTemplateReadOnlyClient, "exists").resolves(true);
      stub(licenseClient.licensingModuleClient, "setLicensingConfig").resolves(txHash);
      stub(licenseClient.licenseRegistryReadOnlyClient, "getLicensingConfig").resolves({
        isSet: false,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: zeroAddress,
      });

      stub(licenseClient.totalLicenseTokenLimitHookClient, "setTotalLicenseTokenLimit").resolves(
        txHash,
      );
      const result = await licenseClient.setMaxLicenseTokens({
        ipId: zeroAddress,
        licenseTermsId: 1,
        maxLicenseTokens: 100,
      });
      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test deprecated fields of royaltyPolicyAddress", () => {
    let registerStub: SinonStub;
    beforeEach(() => {
      registerStub = stub(PiLicenseTemplateClient.prototype, "registerLicenseTerms").resolves(
        txHash,
      );
      stub(licenseClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 0n,
      });
      stub(licenseClient.licenseTemplateClient, "parseTxLicenseTermsRegisteredEvent").returns([
        {
          licenseTermsId: BigInt(1),
          licenseTemplate: zeroAddress,
          licenseTerms: zeroAddress,
        },
      ]);
    });

    it("should call registerPILTerms with royaltyPolicyAddress if supported", async () => {
      await licenseClient.registerPILTerms({
        defaultMintingFee: 1513n,
        currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        transferable: false,
        expiration: 0n,
        commercialUse: true,
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
        uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });

    it("should call registerPILTerms with royaltyPolicy if royaltyPolicy and royaltyPolicyAddress are provided", async () => {
      await licenseClient.registerPILTerms({
        defaultMintingFee: 1513n,
        currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        transferable: false,
        expiration: 0n,
        commercialUse: true,
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
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });

    it("should call registerPILTerms if royaltyPolicy and royaltyPolicyAddress are not provided", async () => {
      await licenseClient.registerPILTerms({
        defaultMintingFee: 1513n,
        currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        transferable: false,
        expiration: 0n,
        commercialUse: true,
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
        uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });

    it("should call registerCommercialUsePIL with royaltyPolicyAddress if supported and royaltyPolicy is not provided", async () => {
      await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: 0,
        currency: mockAddress,
        royaltyPolicyAddress: mockAddress,
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        mockAddress,
      );
    });

    it("should call registerCommercialUsePIL with royaltyPolicy if royaltyPolicy and royaltyPolicyAddress are provided and royaltyPolicyAddress is not provided", async () => {
      await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: 0,
        currency: mockAddress,
        royaltyPolicy: mockAddress,
        royaltyPolicyAddress: "0x0000000000000000000000000000000000000000",
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        mockAddress,
      );
    });

    it("should call registerCommercialUsePIL if royaltyPolicy and royaltyPolicyAddress are not provided and royaltyPolicyAddress is not provided", async () => {
      await licenseClient.registerCommercialUsePIL({
        defaultMintingFee: 0,
        currency: mockAddress,
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });

    it("should call registerCommercialRemixPIL with royaltyPolicyAddress if supported", async () => {
      await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: 0,
        currency: mockAddress,
        royaltyPolicyAddress: mockAddress,
        commercialRevShare: 0,
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        mockAddress,
      );
    });

    it("should call registerCommercialRemixPIL with royaltyPolicy if royaltyPolicy and royaltyPolicyAddress are provided", async () => {
      await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: 0,
        currency: mockAddress,
        commercialRevShare: 0,
        royaltyPolicy: NativeRoyaltyPolicy.LRP,
        royaltyPolicyAddress: "0x0000000000000000000000000000000000000000",
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0x9156e603C949481883B1d3355c6f1132D191fC41",
      );
    });

    it("should call registerCommercialRemixPIL if royaltyPolicy and royaltyPolicyAddress are not provided", async () => {
      await licenseClient.registerCommercialRemixPIL({
        defaultMintingFee: 0,
        currency: mockAddress,
        commercialRevShare: 0,
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });

    it("should call registerCreativeCommonsAttributionPIL with royaltyPolicyAddress if supported", async () => {
      await licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
        royaltyPolicyAddress: mockAddress,
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        mockAddress,
      );
    });

    it("should call registerCreativeCommonsAttributionPIL with royaltyPolicy if royaltyPolicy and royaltyPolicyAddress are provided", async () => {
      await licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        royaltyPolicyAddress: "0x0000000000000000000000000000000000000000",
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });
    it("should call registerCreativeCommonsAttributionPIL if royaltyPolicy and royaltyPolicyAddress are not provided", async () => {
      await licenseClient.registerCreativeCommonsAttributionPIL({
        currency: mockAddress,
      });
      expect((registerStub.firstCall.args[0] as { terms: LicenseTerms }).terms).to.have.property(
        "royaltyPolicy",
        "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      );
    });
  });
});
