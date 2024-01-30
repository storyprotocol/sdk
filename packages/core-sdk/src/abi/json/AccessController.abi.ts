export default [
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
