import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

import { getRevenueShare } from "../../../src/utils/licenseTermsHelper";

use(chaiAsPromised);

describe("License Terms Helper", () => {
  describe("getRevenueShare", () => {
    it("should throw error when call getRevenueShare given revShare is not a number", () => {
      expect(() => getRevenueShare("not a number")).to.throw(
        "CommercialRevShare must be a valid number.",
      );
    });

    it("should throw error when call getRevenueShare given revShare is less than 0", () => {
      expect(() => getRevenueShare(-1)).to.throw("CommercialRevShare must be between 0 and 100.");
    });

    it("should throw error when call getRevenueShare given revShare is greater than 100", () => {
      expect(() => getRevenueShare(101)).to.throw("CommercialRevShare must be between 0 and 100.");
    });

    it("should return correct value when call getRevenueShare given revShare is 10", () => {
      expect(getRevenueShare(10)).to.equal(10000000);
    });
  });
});
