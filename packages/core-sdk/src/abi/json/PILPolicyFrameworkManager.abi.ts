export default [
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
            internalType: "address",
            name: "mintingFeeToken",
            type: "address",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "attribution",
                type: "bool",
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
                internalType: "string[]",
                name: "territories",
                type: "string[]",
              },
              {
                internalType: "string[]",
                name: "distributionChannels",
                type: "string[]",
              },
              {
                internalType: "string[]",
                name: "contentRestrictions",
                type: "string[]",
              },
            ],
            internalType: "struct PILPolicy",
            name: "policy",
            type: "tuple",
          },
        ],
        internalType: "struct RegisterPILPolicyParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "registerPolicy",
    outputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
