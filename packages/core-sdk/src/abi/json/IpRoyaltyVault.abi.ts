export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "ancestorIpId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "royaltyTokensCollected",
        type: "uint256",
      },
    ],
    name: "RoyaltyTokensCollected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "snapshotTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "unclaimedTokens",
        type: "uint32",
      },
    ],
    name: "SnapshotCompleted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "snapshotIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "claimRevenueBySnapshotBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    name: "claimRevenueByTokenBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "claimableRevenue",
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
        name: "ancestorIpId",
        type: "address",
      },
    ],
    name: "collectRoyaltyTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ipId",
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
    inputs: [],
    name: "snapshot",
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
] as const;
