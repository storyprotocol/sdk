import { expect } from "chai";

import {
  NativeRoyaltyPolicy,
  royaltyPolicyLapAddress,
  royaltyPolicyLrpAddress,
} from "../../../src";
import { getRevenueShare, royaltyPolicyInputToAddress } from "../../../src/utils/royalty";
import { aeneid, mockAddress } from "../mockData";

describe("royaltyPolicyInputToAddress", () => {
  it("should return LAP address if no input is provided", () => {
    const address = royaltyPolicyInputToAddress();
    expect(address).to.equal(royaltyPolicyLapAddress[aeneid]);
  });

  it("should return the correct address for a native LAP", () => {
    const address = royaltyPolicyInputToAddress(NativeRoyaltyPolicy.LAP);
    expect(address).to.equal(royaltyPolicyLapAddress[aeneid]);
  });
  it("should return the correct address for a native LRP", () => {
    const address = royaltyPolicyInputToAddress(NativeRoyaltyPolicy.LRP);
    expect(address).to.equal(royaltyPolicyLrpAddress[aeneid]);
  });
  it("should return the correct address for a custom royalty policy address", () => {
    const address = royaltyPolicyInputToAddress(mockAddress);
    expect(address).to.equal(mockAddress);
  });
  it("should return the correct address for a native LAP with a chainId", () => {
    const address = royaltyPolicyInputToAddress(NativeRoyaltyPolicy.LAP, "aeneid");
    expect(address).to.equal(royaltyPolicyLapAddress[aeneid]);
  });
  it("should return the correct address for a native LRP with a chainId", () => {
    const address = royaltyPolicyInputToAddress(NativeRoyaltyPolicy.LRP, "aeneid");
    expect(address).to.equal(royaltyPolicyLrpAddress[aeneid]);
  });
});

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
