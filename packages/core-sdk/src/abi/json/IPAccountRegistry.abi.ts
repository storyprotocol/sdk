export default [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenContract_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "ipAccount",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
