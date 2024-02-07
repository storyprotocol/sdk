export default [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_disputeId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "cancelDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_targetIpId",
        type: "address",
      },
      {
        internalType: "string",
        name: "_linkToDisputeEvidence",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "_targetTag",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "raiseDispute",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_disputeId",
        type: "uint256",
      },
    ],
    name: "resolveDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_disputeId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_decision",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "setDisputeJudgement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_arbitrationPolicy",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_allowed",
        type: "bool",
      },
    ],
    name: "whitelistArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_arbitrationPolicy",
        type: "address",
      },
      {
        internalType: "address",
        name: "_arbPolicyRelayer",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_allowed",
        type: "bool",
      },
    ],
    name: "whitelistArbitrationRelayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
