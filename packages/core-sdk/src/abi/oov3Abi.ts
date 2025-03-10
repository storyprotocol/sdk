import { Abi } from "viem";

export const ASSERTION_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "assertionId",
        type: "bytes32",
      },
    ],
    name: "getAssertion",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "bool",
                name: "arbitrateViaEscalationManager",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "discardOracle",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "validateDisputers",
                type: "bool",
              },
              {
                internalType: "address",
                name: "assertingCaller",
                type: "address",
              },
              {
                internalType: "address",
                name: "escalationManager",
                type: "address",
              },
            ],
            internalType: "struct OptimisticOracleV3Interface.EscalationManagerSettings",
            name: "escalationManagerSettings",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "asserter",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "assertionTime",
            type: "uint64",
          },
          {
            internalType: "bool",
            name: "settled",
            type: "bool",
          },
          {
            internalType: "contract IERC20",
            name: "currency",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "expirationTime",
            type: "uint64",
          },
          {
            internalType: "bool",
            name: "settlementResolution",
            type: "bool",
          },
          {
            internalType: "bytes32",
            name: "domainId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "identifier",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "bond",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "callbackRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "disputer",
            type: "address",
          },
        ],
        internalType: "struct OptimisticOracleV3Interface.Assertion",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;
