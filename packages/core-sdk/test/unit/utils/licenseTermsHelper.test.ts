import { Hex, PublicClient, zeroAddress } from "viem";
import { LicenseTerms, PIL_TYPE } from "../../../src/types/resources/license";
import {
  getLicenseTermByType,
  getRevenueShare,
  validateLicenseTerms,
} from "../../../src/utils/licenseTermsHelper";
import chai from "chai";
import sinon from "sinon";
import { createMock } from "../testUtils";
import chaiAsPromised from "chai-as-promised";
import { RoyaltyModuleReadOnlyClient } from "../../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("License Terms Helper", () => {
  let isWhitelistedRoyaltyTokenStub: sinon.SinonStub;
  let isWhitelistedRoyaltyPolicyStub: sinon.SinonStub;
  beforeEach(() => {
    isWhitelistedRoyaltyTokenStub = sinon
      .stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyToken")
      .resolves(true);
    isWhitelistedRoyaltyPolicyStub = sinon
      .stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyPolicy")
      .resolves(true);
  });

  afterEach(() => {
    sinon.restore();
  });

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
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
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
          uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
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
          uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
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
        ).to.throw(`CommercialRevShare must be between 0 and 100.`);
      });

      it("it throw commercialRevShare error  when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is greater than 100", async () => {
        expect(() =>
          getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
            royaltyPolicyAddress: zeroAddress,
            defaultMintingFee: "1",
            currency: zeroAddress,
            commercialRevShare: 105,
          }),
        ).to.throw(`CommercialRevShare must be between 0 and 100.`);
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
      currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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

    it("should throw royalty error when call validateLicenseTerms with invalid royalty policy address", async () => {
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            royaltyPolicy: "0x",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("Invalid address: 0x");
    });
    it("should throw defaultMintingFee error when call validateLicenseTerms given defaultMintingFee is less than 0", async () => {
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            defaultMintingFee: -1n,
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("DefaultMintingFee should be greater than or equal to 0.");
    });

    it("should throw defaultMintingFee and royalty error when call validateLicenseTerms given defaultMintingFee is 0 and royaltyPolicy is zero address", async () => {
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            defaultMintingFee: 1n,
            royaltyPolicy: zeroAddress,
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("Royalty policy is required when defaultMintingFee is greater than 0.");
    });
    it("should throw royalty whitelist error when call validateLicenseTerms with invalid royalty whitelist address", async () => {
      isWhitelistedRoyaltyPolicyStub.resolves(false);
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

    it("should throw currency error when call validateLicenseTerms with invalid currency address", async () => {
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            currency: "0x",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("Invalid address: 0x");
    });

    it("should throw currency whitelist error when call validateLicenseTerms with invalid currency whitelist address", async () => {
      isWhitelistedRoyaltyTokenStub.resolves(false);
      await expect(
        validateLicenseTerms(
          {
            ...licenseTerms,
            currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
          rpcMock,
        ),
      ).to.be.rejectedWith("The currency token is not whitelisted.");
    });

    it("should throw royalty policy requires currency token error when call validateLicenseTerms given royaltyPolicy is not zero address and current is zero address", async () => {
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
      it("should throw commercialAttribution error when call validateLicenseTerms given commercialUse is false and commercialAttribution is true", async () => {
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

      it("should throw commercializerChecker error when call validateLicenseTerms given commercialUse is false and commercialChecker is not zero address", async () => {
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
      it("should throw commercialRevShare error when call validateLicenseTerms given commercialUse is false and commercialRevShare is more than 0 ", async () => {
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

      it("should throw commercialRevCeiling error when call validateLicenseTerms given commercialUse is false and commercialRevCeiling is more than 0", async () => {
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

      it("should throw derivativeRevCeiling error when call validateLicenseTerms given commercialUse is false and derivativeRevCeiling is more than 0", async () => {
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

      it("should throw royaltyPolicy error when call validateLicenseTerms given commercialUse is false and royaltyPolicy is not zero address", async () => {
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

      it("should throw royaltyPolicy error when call validateLicenseTerms given commercialUse is true and royaltyPolicy is zero address", async () => {
        await expect(
          validateLicenseTerms(
            {
              ...licenseTerms,
              commercialUse: true,
              royaltyPolicy: zeroAddress,
              defaultMintingFee: 0n,
            },
            rpcMock,
          ),
        ).to.be.rejectedWith("Royalty policy is required when commercial use is enabled.");
      });
    });

    describe("verify derivatives", () => {
      it("should throw derivativesAttribution error when call validateLicenseTerms given derivativesAllowed is false and derivativesAttribution is true", async () => {
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

      it("should throw derivativesApproval error when call validateLicenseTerms given derivativesAllowed is false and derivativesApproval is true", async () => {
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

      it("should throw derivativesReciprocal error when call validateLicenseTerms given derivativesAllowed is false and derivativesReciprocal is true", async () => {
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

      it("should throw derivativeRevCeiling error when call validateLicenseTerms given derivativesAllowed is false and derivativeRevCeiling is more than 0", async () => {
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
      expect(() => getRevenueShare(-1)).to.throw("CommercialRevShare must be between 0 and 100.");
    });

    it("should throw error when call getRevenueShare given revShare is greater than 100", async () => {
      expect(() => getRevenueShare(101)).to.throw("CommercialRevShare must be between 0 and 100.");
    });

    it("should return correct value when call getRevenueShare given revShare is 10", async () => {
      expect(getRevenueShare(10)).to.equal(10000000);
    });
  });
});
