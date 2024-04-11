export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "licenseTerms",
        type: "bytes",
      },
    ],
    name: "LicenseTermsRegistered",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "transferable",
            type: "bool",
          },
          {
            internalType: "address",
            name: "royaltyPolicy",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "mintingFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiration",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "commercialUse",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "commercialAttribution",
            type: "bool",
          },
          {
            internalType: "address",
            name: "commercializerChecker",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "commercializerCheckerData",
            type: "bytes",
          },
          {
            internalType: "uint32",
            name: "commercialRevShare",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "commercialRevCelling",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "derivativesAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativesAttribution",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativesApproval",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativesReciprocal",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "derivativeRevCelling",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "currency",
            type: "address",
          },
        ],
        internalType: "struct PILTerms",
        name: "terms",
        type: "tuple",
      },
    ],
    name: "getLicenseTermsId",
    outputs: [
      {
        internalType: "uint256",
        name: "selectedLicenseTermsId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "transferable",
            type: "bool",
          },
          {
            internalType: "address",
            name: "royaltyPolicy",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "mintingFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiration",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "commercialUse",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "commercialAttribution",
            type: "bool",
          },
          {
            internalType: "address",
            name: "commercializerChecker",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "commercializerCheckerData",
            type: "bytes",
          },
          {
            internalType: "uint32",
            name: "commercialRevShare",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "commercialRevCelling",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "derivativesAllowed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativesAttribution",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativesApproval",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "derivativesReciprocal",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "derivativeRevCelling",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "currency",
            type: "address",
          },
        ],
        internalType: "struct PILTerms",
        name: "terms",
        type: "tuple",
      },
    ],
    name: "registerLicenseTerms",
    outputs: [
      {
        internalType: "uint256",
        name: "selectedLicenseTermsId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
