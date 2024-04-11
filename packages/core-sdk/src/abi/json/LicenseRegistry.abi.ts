export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "parentIpIds",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "licenseTermsIds",
        type: "uint256[]",
      },
    ],
    name: "registerDerivativeIp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
