import { PublicClient, zeroAddress } from "viem";
import { PILTermsInput } from "../../../src/types/resources/license";
import { getRevenueShare, validateLicenseTerms } from "../../../src/utils/licenseTermsHelper";
import { expect } from "chai";
import { MockERC20 } from "../../integration/utils/mockERC20";
import sinon from "sinon";
import { createMock } from "../testUtils";
const { RoyaltyModuleReadOnlyClient } = require("../../../src/abi/generated");

describe("License Terms Helper", () => {
  describe("validateLicenseTerms", () => {
    let rpcMock: PublicClient;
    beforeEach(() => {
      rpcMock = createMock<PublicClient>();
    });
    const licenseTerms: PILTermsInput = {
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

  describe("getRevenueShare", () => {
    it("should throw error when call getRevenueShare given revShare is not a number", async () => {
      expect(() => getRevenueShare("not a number")).to.throw(
        "CommercialRevShare must be a valid number.",
      );
    });

    it("should throw error when call getRevenueShare given revShare is less than 0", async () => {
      expect(() => getRevenueShare(-1)).to.throw("CommercialRevShare should be between 0 and 100.");
    });

    it("should throw error when call getRevenueShare given revShare is greater than 100", async () => {
      expect(() => getRevenueShare(101)).to.throw(
        "CommercialRevShare should be between 0 and 100.",
      );
    });

    it("should return correct value when call getRevenueShare given revShare is 10", async () => {
      expect(getRevenueShare(10)).to.equal(10000000);
    });
  });
});
