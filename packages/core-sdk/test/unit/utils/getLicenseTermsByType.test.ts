import { Hex, zeroAddress } from "viem";
import { PIL_TYPE } from "../../../src/types/resources/license";
import { getLicenseTermByType } from "../../../src/utils/getLicenseTermsByType";
import { expect } from "chai";

describe("Get License Terms By Type", () => {
  it("it should return no commercial license terms when call getLicenseTermByType given NON_COMMERCIAL_REMIX", async () => {
    const result = getLicenseTermByType(PIL_TYPE.NON_COMMERCIAL_REMIX);
    expect(result).to.deep.include({
      transferable: true,
      commercialAttribution: false,
      commercialRevCeiling: 0n,
      commercialRevShare: 0,
      commercialUse: false,
      commercializerChecker: "0x0000000000000000000000000000000000000000",
      commercializerCheckerData: "0x0000000000000000000000000000000000000000",
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
        "mintingFee currency are required for commercial use PIL.",
      );
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_USE without mintFee", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
          currency: zeroAddress,
          royaltyPolicyLAPAddress: zeroAddress,
        }),
      ).to.throw("mintingFee currency are required for commercial use PIL.");
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_USE without currency", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
          royaltyPolicyLAPAddress: zeroAddress,
          defaultMintingFee: "1",
        }),
      ).to.throw("mintingFee currency are required for commercial use PIL.");
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_USE and wrong royaltyAddress", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
          royaltyPolicyLAPAddress: "wrong" as Hex,
          defaultMintingFee: "1",
          currency: zeroAddress,
        }),
      ).to.throw(`Address "wrong" is invalid.`);
    });

    it("it should return commercial license terms when call getLicenseTermByType given COMMERCIAL_USE and correct args", async () => {
      const result = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
        royaltyPolicyLAPAddress: zeroAddress,
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
        "mintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without mintFee", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          currency: zeroAddress,
          royaltyPolicyLAPAddress: zeroAddress,
          commercialRevShare: 100,
        }),
      ).to.throw(
        "mintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without currency", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyLAPAddress: zeroAddress,
          defaultMintingFee: "1",
          commercialRevShare: 100,
        }),
      ).to.throw(
        "mintingFee, currency and commercialRevShare are required for commercial remix PIL.",
      );
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX and wrong royaltyAddress", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyLAPAddress: "wrong" as Hex,
          defaultMintingFee: "1",
          currency: zeroAddress,
          commercialRevShare: 100,
        }),
      ).to.throw(`Address "wrong" is invalid.`);
    });

    it("it should throw when call getLicenseTermByType given COMMERCIAL_REMIX without commercialRevShare ", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyLAPAddress: "wrong" as Hex,
          defaultMintingFee: "1",
          currency: zeroAddress,
        }),
      ).to.throw(
        `mintingFee, currency and commercialRevShare are required for commercial remix PIL.`,
      );
    });

    it("it should return commercial license terms when call getLicenseTermByType given COMMERCIAL_REMIX and correct args", async () => {
      const result = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
        royaltyPolicyLAPAddress: zeroAddress,
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
    it("it throw commercialRevShare error  when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is less than 0 ", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyLAPAddress: zeroAddress,
          defaultMintingFee: "1",
          currency: zeroAddress,
          commercialRevShare: -8,
        }),
      ).to.throw(`commercialRevShare should be between 0 and 100.`);
    });

    it("it throw commercialRevShare error  when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is greater than 100", async () => {
      expect(() =>
        getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
          royaltyPolicyLAPAddress: zeroAddress,
          defaultMintingFee: "1",
          currency: zeroAddress,
          commercialRevShare: 105,
        }),
      ).to.throw(`commercialRevShare should be between 0 and 100.`);
    });

    it("it get commercialRevShare correct value when call getLicenseTermByType given COMMERCIAL_REMIX and commercialRevShare is 10", async () => {
      const result = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
        royaltyPolicyLAPAddress: zeroAddress,
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
