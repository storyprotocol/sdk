export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "moduleAddress",
        type: "address",
      },
    ],
    name: "isRegistered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "address",
        name: "moduleAddress",
        type: "address",
      },
    ],
    name: "registerModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
