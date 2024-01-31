export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "licenseId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "policyId",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "licensorIpIds",
            type: "address[]",
          },
        ],
        indexed: false,
        internalType: "struct Licensing.License",
        name: "licenseData",
        type: "tuple",
      },
    ],
    name: "LicenseMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
    ],
    name: "PolicyAddedToIpId",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "frameworkId",
            type: "uint256",
          },
          {
            internalType: "bytes[]",
            name: "mintingParamValues",
            type: "bytes[]",
          },
          {
            internalType: "bytes[]",
            name: "activationParamValues",
            type: "bytes[]",
          },
          {
            internalType: "bool",
            name: "needsActivation",
            type: "bool",
          },
          {
            internalType: "bytes[]",
            name: "linkParentParamValues",
            type: "bytes[]",
          },
        ],
        internalType: "struct Licensing.Policy",
        name: "pol",
        type: "tuple",
      },
    ],
    name: "addPolicy",
    outputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isNew",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "polId",
        type: "uint256",
      },
    ],
    name: "addPolicyToIp",
    outputs: [
      {
        internalType: "uint256",
        name: "indexOnIpId",
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
        name: "ipId",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "frameworkId",
            type: "uint256",
          },
          {
            internalType: "bytes[]",
            name: "mintingParamValues",
            type: "bytes[]",
          },
          {
            internalType: "bytes[]",
            name: "activationParamValues",
            type: "bytes[]",
          },
          {
            internalType: "bool",
            name: "needsActivation",
            type: "bool",
          },
          {
            internalType: "bytes[]",
            name: "linkParentParamValues",
            type: "bytes[]",
          },
        ],
        internalType: "struct Licensing.Policy",
        name: "pol",
        type: "tuple",
      },
    ],
    name: "addPolicyToIp",
    outputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isNew",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "indexOnIpId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
    ],
    name: "linkIpToParent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "policyId",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "licensorIpIds",
            type: "address[]",
          },
        ],
        internalType: "struct Licensing.License",
        name: "licenseData",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "mintLicense",
    outputs: [
      {
        internalType: "uint256",
        name: "licenseId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
