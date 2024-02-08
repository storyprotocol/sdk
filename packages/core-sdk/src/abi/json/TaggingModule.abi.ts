export default [
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
        internalType: "string",
        name: "tag",
        type: "string",
      },
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "removeTag",
    outputs: [
      {
        internalType: "bool",
        name: "removed",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tag",
        type: "string",
      },
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "setTag",
    outputs: [
      {
        internalType: "bool",
        name: "added",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
