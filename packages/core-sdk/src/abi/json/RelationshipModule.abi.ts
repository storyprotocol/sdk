export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "relationshipId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "relType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "srcAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "srcId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "dstAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dstId",
        type: "uint256",
      },
    ],
    name: "RelationshipCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "relType",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ipOrg",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum LibRelationship.Relatables",
        name: "srcRelatable",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "srcSubtypesMask",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum LibRelationship.Relatables",
        name: "dstRelatable",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dstSubtypesMask",
        type: "uint256",
      },
    ],
    name: "RelationshipTypeSet",
    type: "event",
  },
] as const;
