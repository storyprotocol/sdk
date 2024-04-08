export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "receiverIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "payerIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "payRoyaltyOnBehalf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
