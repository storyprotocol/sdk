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
            internalType: "string[]",
            name: "commercializers",
            type: "string[]",
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
            internalType: "uint32",
            name: "derivativesRevShare",
            type: "uint32",
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
          {
            internalType: "address",
            name: "royaltyPolicy",
            type: "address",
          },
        ],
        internalType: "struct UMLPolicy",
        name: "umlPolicy",
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
