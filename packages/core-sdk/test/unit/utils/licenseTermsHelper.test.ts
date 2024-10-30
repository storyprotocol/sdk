import { Hex, PublicClient, zeroAddress } from "viem";
import { LicenseTerms, PIL_TYPE } from "../../../src/types/resources/license";
import { getLicenseTermByType, validateLicenseTerms } from "../../../src/utils/licenseTermsHelper";
import { expect } from "chai";
import { MockERC20 } from "../../integration/utils/mockERC20";
import sinon from "sinon";
import { createMock } from "../testUtils";
const { RoyaltyModuleReadOnlyClient } = require("../../../src/abi/generated");

describe("License Terms Helper", () => {
  describe("getLicenseTermByType", () => {
    it("it should return no commercial license terms when call getLicenseTermByType given NON_COMMERCIAL_REMIX", async () => {
      const result = getLicenseTermByType(PIL_TYPE.NON_COMMERCIAL_REMIX);
      expect(result).to.deep.include({
        transferable: true,
        commercialAttribution: false,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: false,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x",
        currency: "0x0000000000000000000000000000000000000000",
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 0n,
        royaltyPolicy: "0x0000000000000000000000000000000000000000",
        uri: "",
      });
    });

    describe("Get Commercial License Terms", () => {
      it("it should throw when call getLicenseTermByType given COMMERCIAL_USE without terms", async () => {
        expect(() => getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE)).to.throw(
          "DefaultMintingFee, currency are required for commercial use PIL.",
        );
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_USE without mintFee", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
            currency: zeroAddress,
            royaltyPolicyAddress: zeroAddress,
          }),
        ).to.throw("DefaultMintingFee, currency are required for commercial use PIL.");
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_USE without currency", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
            royaltyPolicyAddress: zeroAddress,
            defaultMintingFee: "1",
          }),
        ).to.throw("DefaultMintingFee, currency are required for commercial use PIL.");
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_USE and wrong royaltyAddress", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
            royaltyPolicyAddress: "wrong" as Hex,
            defaultMintingFee: "1",
            currency: zeroAddress,
          }),
        ).to.throw(
          `term.royaltyPolicyLAPAddress address is invalid: wrong, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      });

      it("it should return commercial license terms when call getLicenseTermByType given COMMERCIAL_USE and correct args", async () => {
        const result = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
          royaltyPolicyAddress: zeroAddress,
          defaultMintingFee: "1",
          currency: zeroAddress,
        });
        expect(result).to.deep.contain({
          commercialAttribution: true,
          commercialRevCeiling: 0n,
          commercialRevShare: 0,
          commercialUse: true,
          commercializerChecker: "0x0000000000000000000000000000000000000000",
          commercializerCheckerData: "0x0000000000000000000000000000000000000000",
          currency: "0x0000000000000000000000000000000000000000",
          derivativeRevCeiling: 0n,
          derivativesAllowed: true,
          derivativesApproval: false,
          derivativesAttribution: true,
          derivativesReciprocal: false,
          expiration: 0n,
          defaultMintingFee: 1n,
          royaltyPolicy: "0x0000000000000000000000000000000000000000",
          transferable: true,
          uri: "",
        });
      });
    });

    describe("Get Commercial remix License Terms", () => {
      it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without terms", async () => {
        expect(() => getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX)).to.throw(
          "MintingFee, currency and commercialRevShare are required for commercial remix PIL.",
        );
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without mintFee", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            currency: zeroAddress,
            royaltyPolicyAddress: zeroAddress,
            commercialRevShare: 100,
          }),
        ).to.throw(
          "MintingFee, currency and commercialRevShare are required for commercial remix PIL.",
        );
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without currency", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            royaltyPolicyAddress: zeroAddress,
            defaultMintingFee: "1",
            commercialRevShare: 100,
          }),
        ).to.throw(
          "MintingFee, currency and commercialRevShare are required for commercial remix PIL.",
        );
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX and wrong royaltyAddress", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            royaltyPolicyAddress: "wrong" as Hex,
            defaultMintingFee: "1",
            currency: zeroAddress,
            commercialRevShare: 100,
          }),
        ).to.throw(
          `term.royaltyPolicyLAPAddress address is invalid: wrong, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      });

      it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without commercialRevShare ", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            royaltyPolicyAddress: "wrong" as Hex,
            defaultMintingFee: "1",
            currency: zeroAddress,
          }),
        ).to.throw(
          `MintingFee, currency and commercialRevShare are required for commercial remix PIL.`,
        );
      });

      it("it should return commercial license terms when call getLicenseTermByType given COMMERCIAL_REMIX and correct args", async () => {
        const result = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyAddress: zeroAddress,
          defaultMintingFee: "1",
          currency: zeroAddress,
          commercialRevShare: 100,
        });
        expect(result).to.deep.contain({
          commercialAttribution: true,
          commercialRevCeiling: 0n,
          commercialRevShare: 100000000,
          commercialUse: true,
          commercializerChecker: "0x0000000000000000000000000000000000000000",
          commercializerCheckerData: "0x0000000000000000000000000000000000000000",
          currency: "0x0000000000000000000000000000000000000000",
          derivativeRevCeiling: 0n,
          derivativesAllowed: true,
          derivativesApproval: false,
          derivativesAttribution: true,
          derivativesReciprocal: true,
          expiration: 0n,
          defaultMintingFee: 1n,
          royaltyPolicy: "0x0000000000000000000000000000000000000000",
          transferable: true,
          uri: "",
        });
      });
      it("it throw commercialRevShare error when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is less than 0 ", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            royaltyPolicyAddress: zeroAddress,
            defaultMintingFee: "1",
            currency: zeroAddress,
            commercialRevShare: -8,
          }),
        ).to.throw(`CommercialRevShare should be between 0 and 100.`);
      });

      it("it throw commercialRevShare error  when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is greater than 100", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            royaltyPolicyAddress: zeroAddress,
            defaultMintingFee: "1",
            currency: zeroAddress,
            commercialRevShare: 105,
          }),
        ).to.throw(`CommercialRevShare should be between 0 and 100.`);
      });

      it("it get commercialRevShare correct value when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is 10", async () => {
        const result = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyAddress: zeroAddress,
          defaultMintingFee: "1",
          currency: zeroAddress,
          commercialRevShare: 10,
        });
        expect(result).to.contains({
          commercialRevShare: 10000000,
        });
      });
    });
  });

  describe("validateLicenseTerms", () => {
    let rpcMock: PublicClient;
    beforeEach(() => {
      rpcMock = createMock<PublicClient>();
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

    it("should throw royalty error when call registerRILTerms with invalid royalty policy address", async () => {
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            royaltyPolicy: "0x",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith(
        "params.royaltyPolicy address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
      );
    });

    it("should throw royalty whitelist error when call registerRILTerms with invalid royalty whitelist address", async () => {
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
        .stub()
        .resolves(false);
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("The royalty policy is not whitelisted.");
    });

    it("should throw currency error when call registerRILTerms with invalid currency address", async () => {
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
        .stub()
        .resolves(false);
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            currency: "0x",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith(
        "params.currency address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
      );
    });

    it("should throw currency whitelist error when call registerRILTerms with invalid currency whitelist address", async () => {
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
        .stub()
        .resolves(false);
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon
        .stub()
        .resolves(false);
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            currency: MockERC20.address,
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("The currency token is not whitelisted.");
    });

    it("should throw royalty policy requires currency token error when call registerRILTerms given royaltyPolicy is not zero address and current is zero address", async () => {
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
        .stub()
        .resolves(true);
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon.stub().resolves(true);
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            currency: zeroAddress,
            royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("Royalty policy requires currency token.");
    });

    describe("verify commercial use", () => {
      beforeEach(() => {
        RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
          .stub()
          .resolves(true);
        RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon
          .stub()
          .resolves(true);
      });
      it("should throw commercialAttribution error when call registerRILTerms given commercialUse is false and commercialAttribution is true", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: false,
              commercialAttribution: true,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Cannot add commercial attribution when commercial use is disabled.");
      });

      it("should throw commercializerChecker error when call registerRILTerms given commercialUse is false and commercialChecker is not zero address", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: false,
              commercializerChecker: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Cannot add commercializerChecker when commercial use is disabled.");
      });
      it("should throw commercialRevShare error when call registerRILTerms given commercialUse is false and commercialRevShare is more than 0 ", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: false,
              commercializerChecker: zeroAddress,
              commercialRevShare: 1,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith(
          "Cannot add commercial revenue share when commercial use is disabled.",
        );
      });

      it("should throw commercialRevCeiling error when call registerRILTerms given commercialUse is false and commercialRevCeiling is more than 0", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: false,
              commercialRevCeiling: 1,
              commercializerChecker: zeroAddress,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith(
          "Cannot add commercial revenue ceiling when commercial use is disabled.",
        );
      });

      it("should throw derivativeRevCeiling error when call registerRILTerms given commercialUse is false and derivativeRevCeiling is more than 0", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: false,
              derivativeRevCeiling: 1,
              commercializerChecker: zeroAddress,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith(
          "Cannot add derivative revenue ceiling share when commercial use is disabled.",
        );
      });

      it("should throw royaltyPolicy error when call registerRILTerms given commercialUse is false and royaltyPolicy is not zero address", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: false,
              royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
              commercializerChecker: zeroAddress,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith(
          "Cannot add commercial royalty policy when commercial use is disabled.",
        );
      });

      it("should throw royaltyPolicy error when call registerRILTerms given commercialUse is true and royaltyPolicy is zero address", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: true,
              royaltyPolicy: zeroAddress,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Royalty policy is required when commercial use is enabled.");
      });
    });

    describe("verify derivatives", () => {
      beforeEach(() => {
        RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
          .stub()
          .resolves(true);
        RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon
          .stub()
          .resolves(true);
      });
      it("should throw derivativesAttribution error when call registerRILTerms given derivativesAllowed is false and derivativesAttribution is true", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: true,
              derivativesAllowed: false,
              derivativesAttribution: true,
              royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Cannot add derivative attribution when derivative use is disabled.");
      });

      it("should throw derivativesApproval error when call registerRILTerms given derivativesAllowed is false and derivativesApproval is true", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: true,
              derivativesAllowed: false,
              derivativesApproval: true,
              royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Cannot add derivative approval when derivative use is disabled.");
      });

      it("should throw derivativesReciprocal error when call registerRILTerms given derivativesAllowed is false and derivativesReciprocal is true", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: true,
              derivativesAllowed: false,
              derivativesReciprocal: true,
              royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Cannot add derivative reciprocal when derivative use is disabled.");
      });

      it("should throw derivativeRevCeiling error when call registerRILTerms given derivativesAllowed is false and derivativeRevCeiling is more than 0", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: true,
              derivativesAllowed: false,
              derivativeRevCeiling: 1,
              royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            },
            rpcMock,
          ),
        ).to.be.rejectedWith(
          "Cannot add derivative revenue ceiling when derivative use is disabled.",
        );
      });
    });
  });
});
