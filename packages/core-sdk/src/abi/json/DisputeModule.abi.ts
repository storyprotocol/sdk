export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "arbitrationPolicies",
    outputs: [
      {
        internalType: "address",
        name: "arbitrationPolicy",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseArbitrationPolicy",
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
    name: "disputeId",
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
        internalType: "uint256",
        name: "disputeId",
        type: "uint256",
      },
    ],
    name: "disputes",
    outputs: [
      {
        internalType: "address",
        name: "targetIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "disputeInitiator",
        type: "address",
      },
      {
        internalType: "address",
        name: "arbitrationPolicy",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "linkToDisputeEvidence",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "targetTag",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "currentTag",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "arbitrationPolicy",
        type: "address",
      },
    ],
    name: "isWhitelistedArbitrationPolicy",
    outputs: [
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "arbitrationPolicy",
        type: "address",
      },
      {
        internalType: "address",
        name: "arbitrationRelayer",
        type: "address",
      },
    ],
    name: "isWhitelistedArbitrationRelayer",
    outputs: [
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "tag",
        type: "bytes32",
      },
    ],
    name: "isWhitelistedDisputeTag",
    outputs: [
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "_ipId",
        type: "address",
      },
      {
        internalType: "address",
        name: "_arbitrationPolicy",
        type: "address",
      },
    ],
    name: "setArbitrationPolicy",
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
    inputs: [],
    name: "ArbitrationPolicySP__NotDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "ArbitrationPolicySP__ZeroDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "ArbitrationPolicySP__ZeroPaymentToken",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotAbleToResolve",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotDisputeInitiator",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotInDisputeState",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotRegisteredIpId",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationRelayer",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotWhitelistedDisputeTag",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__UnauthorizedAccess",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroArbitrationPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroArbitrationRelayer",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroDisputeTag",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroLinkToDisputeEvidence",
    type: "error",
  },
] as const;
