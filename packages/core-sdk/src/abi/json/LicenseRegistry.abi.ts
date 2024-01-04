export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "enum Licensing.LicenseStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "derivativesAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isReciprocal",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativeNeedsApproval",
            type: "bool",
          },
          {
            internalType: "address",
            name: "revoker",
            type: "address",
          },
          {
            internalType: "address",
            name: "licensor",
            type: "address",
          },
          {
            internalType: "address",
            name: "ipOrg",
            type: "address",
          },
          {
            internalType: "ShortString",
            name: "frameworkId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "ipaId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "parentLicenseId",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Licensing.LicenseData",
        name: "licenseData",
        type: "tuple",
      },
    ],
    name: "LicenseRegistered",
    type: "event",
  },
] as const;
