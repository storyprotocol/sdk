import { coreMetadataModuleAbi, groupingWorkflowsAbi } from "../../../src/abi/generated";
import { getFunctionSignature } from "../../../src/utils/getFunctionSignature";

import { expect } from "chai";

describe("Test getFunctionSignature", () => {
  it("should return function signature", () => {
    const signature = getFunctionSignature(coreMetadataModuleAbi, "setAll");
    expect(signature).equal("setAll(address,string,bytes32,bytes32)");
  });

  it("should throw error when method not found", () => {
    expect(() => getFunctionSignature(coreMetadataModuleAbi, "notFound")).to.throw(
      "Method notFound not found in ABI.",
    );
  });

  it("should throw error when method has multiple overloads", () => {
    expect(() =>
      getFunctionSignature(groupingWorkflowsAbi, "registerGroupAndAttachLicenseAndAddIps"),
    ).to.throw(
      "Method registerGroupAndAttachLicenseAndAddIps has 2 overloads. Please specify overloadIndex (0-1).",
    );
  });

  it("should return function signature when method has multiple overloads", () => {
    const signature = getFunctionSignature(
      groupingWorkflowsAbi,
      "registerGroupAndAttachLicenseAndAddIps",
      1,
    );
    expect(signature).equal(
      "registerGroupAndAttachLicenseAndAddIps(address,address[],address,uint256)",
    );
  });
});
