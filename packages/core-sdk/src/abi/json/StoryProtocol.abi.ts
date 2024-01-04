export default [
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "relType",
            type: "string",
          },
          {
            internalType: "address",
            name: "ipOrg",
            type: "address",
          },
          {
            components: [
              {
                internalType: "enum LibRelationship.Relatables",
                name: "src",
                type: "uint8",
              },
              {
                internalType: "enum LibRelationship.Relatables",
                name: "dst",
                type: "uint8",
              },
            ],
            internalType: "struct LibRelationship.RelatedElements",
            name: "allowedElements",
            type: "tuple",
          },
          {
            internalType: "uint8[]",
            name: "allowedSrcs",
            type: "uint8[]",
          },
          {
            internalType: "uint8[]",
            name: "allowedDsts",
            type: "uint8[]",
          },
        ],
        internalType: "struct LibRelationship.AddRelationshipTypeParams",
        name: "params_",
        type: "tuple",
      },
    ],
    name: "addRelationshipType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipOrg_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "frameworkId",
            type: "string",
          },
          {
            components: [
              {
                internalType: "ShortString",
                name: "tag",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "value",
                type: "bytes",
              },
            ],
            internalType: "struct Licensing.ParamValue[]",
            name: "params",
            type: "tuple[]",
          },
          {
            internalType: "enum Licensing.LicensorConfig",
            name: "licensor",
            type: "uint8",
          },
        ],
        internalType: "struct Licensing.LicensingConfig",
        name: "config_",
        type: "tuple",
      },
    ],
    name: "configureIpOrgLicensing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipOrg_",
        type: "address",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "ShortString",
                name: "tag",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "value",
                type: "bytes",
              },
            ],
            internalType: "struct Licensing.ParamValue[]",
            name: "params",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "parentLicenseId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "ipaId",
            type: "uint256",
          },
        ],
        internalType: "struct Licensing.LicenseCreation",
        name: "params_",
        type: "tuple",
      },
      {
        internalType: "bytes[]",
        name: "preHooksData_",
        type: "bytes[]",
      },
      {
        internalType: "bytes[]",
        name: "postHooksData_",
        type: "bytes[]",
      },
    ],
    name: "createLicense",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipOrg_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "relType",
            type: "string",
          },
          {
            internalType: "address",
            name: "srcAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "srcId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "dstAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "dstId",
            type: "uint256",
          },
        ],
        internalType: "struct LibRelationship.CreateRelationshipParams",
        name: "params_",
        type: "tuple",
      },
      {
        internalType: "bytes[]",
        name: "preHooksData_",
        type: "bytes[]",
      },
      {
        internalType: "bytes[]",
        name: "postHooksData_",
        type: "bytes[]",
      },
    ],
    name: "createRelationship",
    outputs: [
      {
        internalType: "uint256",
        name: "relId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipOrg_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "ipOrgAssetType",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "bytes32",
            name: "hash",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "mediaUrl",
            type: "string",
          },
        ],
        internalType: "struct Registration.RegisterIPAssetParams",
        name: "params_",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "licenseId_",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "preHooksData_",
        type: "bytes[]",
      },
      {
        internalType: "bytes[]",
        name: "postHooksData_",
        type: "bytes[]",
      },
    ],
    name: "registerIPAsset",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "ipAssetTypes_",
        type: "string[]",
      },
    ],
    name: "registerIpOrg",
    outputs: [
      {
        internalType: "address",
        name: "ipOrg_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
