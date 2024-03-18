export default [
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
        indexed: false,
        internalType: "address[]",
        name: "parentIpIds",
        type: "address[]",
      },
    ],
    name: "IpIdLinkedToParents",
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
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isInherited",
        type: "bool",
      },
    ],
    name: "PolicyAddedToIpId",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "policyFrameworkManager",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "frameworkData",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "address",
        name: "royaltyPolicy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "royaltyData",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "mintingFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "mintingFeeToken",
        type: "address",
      },
    ],
    name: "PolicyRegistered",
    type: "event",
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
        components: [
          {
            internalType: "bool",
            name: "isLicenseTransferable",
            type: "bool",
          },
          {
            internalType: "address",
            name: "policyFramework",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "frameworkData",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "royaltyPolicy",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "royaltyData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "mintingFee",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "mintingFeeToken",
            type: "address",
          },
        ],
        internalType: "struct Licensing.Policy",
        name: "pol",
        type: "tuple",
      },
    ],
    name: "getPolicyId",
    outputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "licenseIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "royaltyContext",
        type: "bytes",
      },
    ],
    name: "linkIpToParents",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
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
      {
        internalType: "bytes",
        name: "royaltyContext",
        type: "bytes",
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
  {
    inputs: [
      {
        internalType: "bool",
        name: "isInherited",
        type: "bool",
      },
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "policyIdsForIp",
    outputs: [
      {
        internalType: "uint256[]",
        name: "policyIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "isLicenseTransferable",
            type: "bool",
          },
          {
            internalType: "address",
            name: "policyFramework",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "frameworkData",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "royaltyPolicy",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "royaltyData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "mintingFee",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "mintingFeeToken",
            type: "address",
          },
        ],
        internalType: "struct Licensing.Policy",
        name: "pol",
        type: "tuple",
      },
    ],
    name: "registerPolicy",
    outputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
