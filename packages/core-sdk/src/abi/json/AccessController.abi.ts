export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "PermissionSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount_",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer_",
        type: "address",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func_",
        type: "bytes4",
      },
      {
        internalType: "uint8",
        name: "permission_",
        type: "uint8",
      },
    ],
    name: "setPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
