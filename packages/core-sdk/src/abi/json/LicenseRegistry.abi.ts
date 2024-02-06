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
            internalType: "address",
            name: "licensorIpId",
            type: "address",
          },
          {
            internalType: "bool",
            name: "transferable",
            type: "bool",
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
        internalType: "bool",
        name: "transferable",
        type: "bool",
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
