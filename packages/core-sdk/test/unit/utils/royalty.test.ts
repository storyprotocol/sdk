import { expect } from "chai";

import {
  NativeRoyaltyPolicy,
  royaltyPolicyLapAddress,
  royaltyPolicyLrpAddress,
} from "../../../src";
import { royaltyPolicyInputToAddress } from "../../../src/utils/royalty";
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
