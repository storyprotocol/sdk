export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "ipAssetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ipOrg",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ipOrgAssetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: true,
        internalType: "uint8",
        name: "ipOrgAssetType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "mediaUrl",
        type: "string",
      },
    ],
    name: "IPAssetRegistered",
    type: "event",
  },
] as const;
