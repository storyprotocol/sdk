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
        internalType: "address",
        name: "policyFrameworkManager",
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
        internalType: "bytes",
        name: "policy",
        type: "bytes",
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
        internalType: "uint32",
        name: "minRoyalty",
        type: "uint32",
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
        name: "licensorIp",
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
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "isLicenseTransferable",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
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
