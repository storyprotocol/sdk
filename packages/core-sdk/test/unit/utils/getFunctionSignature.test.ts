import { expect } from "chai";

import { coreMetadataModuleAbi, groupingWorkflowsAbi } from "../../../src/abi/generated";
import { getFunctionSignature } from "../../../src/utils/getFunctionSignature";

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
      getFunctionSignature(
        [
          ...groupingWorkflowsAbi,
          {
            type: "function",
            inputs: [
              { name: "groupPool", internalType: "address", type: "address" },
              { name: "ipIds", internalType: "address[]", type: "address[]" },
              {
                name: "licenseData",
                internalType: "struct WorkflowStructs.LicenseData",
                type: "tuple",
                components: [
                  { name: "licenseTemplate", internalType: "address", type: "address" },
                  { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
                  {
                    name: "licensingConfig",
                    internalType: "struct Licensing.LicensingConfig",
                    type: "tuple",
                    components: [
                      { name: "isSet", internalType: "bool", type: "bool" },
                      { name: "mintingFee", internalType: "uint256", type: "uint256" },
                      {
                        name: "licensingHook",
                        internalType: "address",
                        type: "address",
                      },
                      { name: "hookData", internalType: "bytes", type: "bytes" },
                      {
                        name: "commercialRevShare",
                        internalType: "uint32",
                        type: "uint32",
                      },
                      { name: "disabled", internalType: "bool", type: "bool" },
                      {
                        name: "expectMinimumGroupRewardShare",
                        internalType: "uint32",
                        type: "uint32",
                      },
                      {
                        name: "expectGroupRewardPool",
                        internalType: "address",
                        type: "address",
                      },
                    ],
                  },
                ],
              },
            ],
            name: "registerGroupAndAttachLicenseAndAddIps",
            outputs: [{ name: "groupId", internalType: "address", type: "address" }],
            stateMutability: "nonpayable",
          },
        ],
        "registerGroupAndAttachLicenseAndAddIps",
      ),
    ).to.throw(
      "Method registerGroupAndAttachLicenseAndAddIps has 2 overloads. Please specify overloadIndex (0-1).",
    );
  });

  it("should return function signature when method has multiple overloads", () => {
    const signature = getFunctionSignature(
      [
        ...groupingWorkflowsAbi,
        {
          type: "function",
          inputs: [
            { name: "groupPool", internalType: "address", type: "address" },
            { name: "ipIds", internalType: "address[]", type: "address[]" },
            {
              name: "licenseData",
              internalType: "struct WorkflowStructs.LicenseData",
              type: "tuple",
              components: [
                { name: "licenseTemplate", internalType: "address", type: "address" },
                { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
                {
                  name: "licensingConfig",
                  internalType: "struct Licensing.LicensingConfig",
                  type: "tuple",
                  components: [
                    { name: "isSet", internalType: "bool", type: "bool" },
                    { name: "mintingFee", internalType: "uint256", type: "uint256" },
                    {
                      name: "licensingHook",
                      internalType: "address",
                      type: "address",
                    },
                    { name: "hookData", internalType: "bytes", type: "bytes" },
                    {
                      name: "commercialRevShare",
                      internalType: "uint32",
                      type: "uint32",
                    },
                    { name: "disabled", internalType: "bool", type: "bool" },
                    {
                      name: "expectMinimumGroupRewardShare",
                      internalType: "uint32",
                      type: "uint32",
                    },
                  ],
                },
              ],
            },
          ],
          name: "registerGroupAndAttachLicenseAndAddIps",
          outputs: [{ name: "groupId", internalType: "address", type: "address" }],
          stateMutability: "nonpayable",
        },
      ],
      "registerGroupAndAttachLicenseAndAddIps",
      1,
    );
    expect(signature).equal(
      "registerGroupAndAttachLicenseAndAddIps(address,address[],(address,uint256,(bool,uint256,address,bytes,uint32,bool,uint32)))",
    );
  });
});
