export default [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getLicenseTermsId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "minter",
        type: "address",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "mintLicenseTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "startLicenseTokenId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
