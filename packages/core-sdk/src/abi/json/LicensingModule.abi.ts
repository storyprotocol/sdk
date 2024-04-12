export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "licenseTokenIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "parentIpIds",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "licenseTermsIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
    ],
    name: "DerivativeRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startLicenseTokenId",
        type: "uint256",
      },
    ],
    name: "LicenseTokensMinted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
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
    ],
    name: "attachLicenseTerms",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "receiver",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "royaltyContext",
        type: "bytes",
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
        internalType: "uint256[]",
        name: "licenseTermsIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "royaltyContext",
        type: "bytes",
      },
    ],
    name: "registerDerivative",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "licenseTokenIds",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "royaltyContext",
        type: "bytes",
      },
    ],
    name: "registerDerivativeWithLicenseTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
