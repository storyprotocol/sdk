export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "disputeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "DisputeCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "disputeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "decision",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "DisputeJudgementSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "disputeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "targetIpId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "disputeInitiator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "arbitrationPolicy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "linkToDisputeEvidence",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "targetTag",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "DisputeRaised",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "disputeId",
        type: "uint256",
      },
    ],
    name: "DisputeResolved",
    type: "event",
  },
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
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
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
