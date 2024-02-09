export default [
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "licenseIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "tokenContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ipName",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "externalURL",
        type: "string",
      },
      {
        internalType: "uint32",
        name: "minRoyalty",
        type: "uint32",
      },
    ],
    name: "registerDerivativeIp",
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
        name: "tokenContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ipName",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "externalURL",
        type: "string",
      },
    ],
    name: "registerRootIp",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
