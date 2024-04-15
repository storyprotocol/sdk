import {
  Address,
  Abi,
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  WriteContractParameters,
  WriteContractReturnType,
  PublicClient,
  Hex,
  decodeEventLog,
  WatchContractEventReturnType,
  TransactionReceipt,
} from "viem";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const accessControllerAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "AccessController__BothCallerAndRecipientAreNotRegisteredModule",
  },
  { type: "error", inputs: [], name: "AccessController__CallerIsNotIPAccount" },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessController__IPAccountIsNotValid",
  },
  {
    type: "error",
    inputs: [],
    name: "AccessController__IPAccountIsZeroAddress",
  },
  {
    type: "error",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "AccessController__PermissionDenied",
  },
  { type: "error", inputs: [], name: "AccessController__PermissionIsNotValid" },
  { type: "error", inputs: [], name: "AccessController__SignerIsZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  { type: "error", inputs: [], name: "Governance__ProtocolPaused" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipAccountOwner",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ipAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "signer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "func", internalType: "bytes4", type: "bytes4", indexed: false },
      {
        name: "permission",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "PermissionSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "checkPermission",
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "getPermission",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
    ],
    name: "setAddresses",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "permissions",
        internalType: "struct AccessPermission.Permission[]",
        type: "tuple[]",
        components: [
          { name: "ipAccount", internalType: "address", type: "address" },
          { name: "signer", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "func", internalType: "bytes4", type: "bytes4" },
          { name: "permission", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "setBatchPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
      { name: "permission", internalType: "uint8", type: "uint8" },
    ],
    name: "setGlobalPermission",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
      { name: "permission", internalType: "uint8", type: "uint8" },
    ],
    name: "setPermission",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const accessControllerAddress = {
  1513: "0x7e253Df9b0fC872746877Fa362b2cAf32712d770",
} as const;

/**
 *
 */
export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "controller", internalType: "address", type: "address" },
      { name: "assetRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  { type: "error", inputs: [], name: "DisputeModule__NotAbleToResolve" },
  { type: "error", inputs: [], name: "DisputeModule__NotDisputeInitiator" },
  { type: "error", inputs: [], name: "DisputeModule__NotInDisputeState" },
  { type: "error", inputs: [], name: "DisputeModule__NotRegisteredIpId" },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationRelayer",
  },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__NotWhitelistedDisputeTag",
  },
  { type: "error", inputs: [], name: "DisputeModule__ZeroArbitrationPolicy" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroArbitrationRelayer" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroDisputeTag" },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__ZeroLinkToDisputeEvidence",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [{ name: "str", internalType: "string", type: "string" }],
    name: "StringTooLong",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "ArbitrationPolicySet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ArbitrationPolicyWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "arbitrationRelayer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ArbitrationRelayerWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "DefaultArbitrationPolicyUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "DisputeCancelled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "decision", internalType: "bool", type: "bool", indexed: false },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "DisputeJudgementSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "targetIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "disputeInitiator",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "linkToDisputeEvidence",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "targetTag",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "DisputeRaised",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DisputeResolved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "tag", internalType: "bytes32", type: "bytes32", indexed: false },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "TagWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IN_DISPUTE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "arbitrationPolicies",
    outputs: [{ name: "policy", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseArbitrationPolicy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "disputeId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "cancelDispute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "disputeCounter",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "disputeId", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "targetIpId", internalType: "address", type: "address" },
      { name: "disputeInitiator", internalType: "address", type: "address" },
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      {
        name: "linkToDisputeEvidence",
        internalType: "bytes32",
        type: "bytes32",
      },
      { name: "targetTag", internalType: "bytes32", type: "bytes32" },
      { name: "currentTag", internalType: "bytes32", type: "bytes32" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governance", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "isIpTagged",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "arbitrationPolicy", internalType: "address", type: "address" }],
    name: "isWhitelistedArbitrationPolicy",
    outputs: [{ name: "allowed", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "arbitrationRelayer", internalType: "address", type: "address" },
    ],
    name: "isWhitelistedArbitrationRelayer",
    outputs: [{ name: "allowed", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tag", internalType: "bytes32", type: "bytes32" }],
    name: "isWhitelistedDisputeTag",
    outputs: [{ name: "allowed", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "targetIpId", internalType: "address", type: "address" },
      { name: "linkToDisputeEvidence", internalType: "string", type: "string" },
      { name: "targetTag", internalType: "bytes32", type: "bytes32" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "raiseDispute",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "disputeId", internalType: "uint256", type: "uint256" }],
    name: "resolveDispute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
    ],
    name: "setArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "arbitrationPolicy", internalType: "address", type: "address" }],
    name: "setBaseArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "disputeId", internalType: "uint256", type: "uint256" },
      { name: "decision", internalType: "bool", type: "bool" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "setDisputeJudgement",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "arbPolicyRelayer", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistArbitrationRelayer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tag", internalType: "bytes32", type: "bytes32" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistDisputeTag",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const disputeModuleAddress = {
  1513: "0x6d54456Ae5DCbDC0C9E2713cC8E650fE4f445c7C",
} as const;

/**
 *
 */
export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipAccountImplAbi = [
  {
    type: "constructor",
    inputs: [{ name: "accessController_", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "IPAccount__ExpiredSignature" },
  { type: "error", inputs: [], name: "IPAccount__InvalidAccessController" },
  { type: "error", inputs: [], name: "IPAccount__InvalidCalldata" },
  { type: "error", inputs: [], name: "IPAccount__InvalidSignature" },
  { type: "error", inputs: [], name: "IPAccount__InvalidSigner" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      {
        name: "nonce",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Executed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      {
        name: "nonce",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "signer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "ExecutedWithSig",
  },
  {
    type: "function",
    inputs: [],
    name: "accessController",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "addressData",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "boolData",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "bytes32Data",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "bytesData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "executeWithSig",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "getBytes",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "namespace", internalType: "bytes32", type: "bytes32" },
      { name: "key", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getBytes",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "namespace", internalType: "bytes32", type: "bytes32" },
      { name: "key", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getBytes32",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "getBytes32",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "signer", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSigner",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC1155BatchReceived",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC1155Received",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC721Received",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "bytes", type: "bytes" },
    ],
    name: "setBytes",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setBytes32",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "state",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "stringData",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "uint256Data",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 *
 */
export const ipAccountImplAddress = {
  1513: "0x38cAfD16502B1d61c6399A18d6Fa1Ea8CEca3678",
} as const;

/**
 *
 */
export const ipAccountImplConfig = {
  address: ipAccountImplAddress,
  abi: ipAccountImplAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipAssetRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "erc6551Registry", internalType: "address", type: "address" },
      { name: "ipAccountImpl", internalType: "address", type: "address" },
      { name: "governance", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "IPAccountRegistry_InvalidIpAccountImpl" },
  { type: "error", inputs: [], name: "IPAssetRegistry__AlreadyRegistered" },
  {
    type: "error",
    inputs: [
      { name: "contractAddress", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "IPAssetRegistry__InvalidToken",
  },
  {
    type: "error",
    inputs: [{ name: "contractAddress", internalType: "address", type: "address" }],
    name: "IPAssetRegistry__UnsupportedIERC721",
  },
  {
    type: "error",
    inputs: [{ name: "contractAddress", internalType: "address", type: "address" }],
    name: "IPAssetRegistry__UnsupportedIERC721Metadata",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "chainId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenContract",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IPAccountRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "chainId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "name", internalType: "string", type: "string", indexed: false },
      { name: "uri", internalType: "string", type: "string", indexed: false },
      {
        name: "registrationDate",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IPRegistered",
  },
  {
    type: "function",
    inputs: [],
    name: "ERC6551_PUBLIC_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_IMPL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_SALT",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getIPAccountImpl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipAccount",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "register",
    outputs: [{ name: "id", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "registerIpAccount",
    outputs: [{ name: "ipAccountAddress", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const ipAssetRegistryAddress = {
  1513: "0x862de97662a1231FFc14038eC1BE93aB129D2169",
} as const;

/**
 *
 */
export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IpRoyaltyVaultImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipRoyaltyVaultImplAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "royaltyPolicyLAP", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "IpRoyaltyVault__AlreadyClaimed" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ClaimerNotAnAncestor" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__IpTagged" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__NotRoyaltyPolicyLAP" },
  {
    type: "error",
    inputs: [],
    name: "IpRoyaltyVault__SnapshotIntervalTooShort",
  },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ZeroIpId" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ZeroRoyaltyPolicyLAP" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "claimer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RevenueTokenClaimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ancestorIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "royaltyTokensCollected",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RoyaltyTokensCollected",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "id", internalType: "uint256", type: "uint256", indexed: false }],
    name: "Snapshot",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "snapshotId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "snapshotTimestamp",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "unclaimedTokens",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
    ],
    name: "SnapshotCompleted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_POLICY_LAP",
    outputs: [{ name: "", internalType: "contract IRoyaltyPolicyLAP", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addIpRoyaltyVaultTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "ancestorsVaultAmount",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
    ],
    name: "balanceOfAt",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claimRevenueBySnapshotBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "tokens", internalType: "address[]", type: "address[]" },
    ],
    name: "claimRevenueByTokenBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "claimVaultAmount",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claimableAtSnapshot",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claimableRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ancestorIpId", internalType: "address", type: "address" }],
    name: "collectRoyaltyTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getVaultTokens",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "symbol", internalType: "string", type: "string" },
      { name: "supply", internalType: "uint32", type: "uint32" },
      { name: "unclaimedTokens", internalType: "uint32", type: "uint32" },
      { name: "ipIdAddress", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "ipId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "claimer", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "isClaimedAtSnapshot",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ancestorIpId", internalType: "address", type: "address" }],
    name: "isClaimedByAncestor",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastSnapshotTimestamp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "snapshot",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "snapshotId", internalType: "uint256", type: "uint256" }],
    name: "totalSupplyAt",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "snapshotId", internalType: "uint256", type: "uint256" }],
    name: "unclaimedAtSnapshot",
    outputs: [{ name: "tokenAmount", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unclaimedRoyaltyTokens",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const ipRoyaltyVaultImplAddress = {
  1513: "0x8Be22cc2D13ADF496a417D9C616dA4a253c68Af8",
} as const;

/**
 *
 */
export const ipRoyaltyVaultImplConfig = {
  address: ipRoyaltyVaultImplAddress,
  abi: ipRoyaltyVaultImplAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const licenseRegistryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  {
    type: "error",
    inputs: [],
    name: "LicenseRegistry__CallerNotLicensingModule",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeAlreadyRegistered",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeIpAlreadyHasLicense",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeIsParent",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__IndexOutOfBounds",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__IpExpired",
  },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__LicenseTermsNotExists",
  },
  { type: "error", inputs: [], name: "LicenseRegistry__NoParentIp" },
  {
    type: "error",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "LicenseRegistry__NotLicenseTemplate",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__ParentIpExpired",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__ParentIpHasNoLicenseTerms",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__ParentIpTagged",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
    ],
    name: "LicenseRegistry__ParentIpUnmachedLicenseTemplate",
  },
  {
    type: "error",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "LicenseRegistry__UnregisteredLicenseTemplate",
  },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroLicensingModule" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__DerivativesCannotAddLicenseTerms",
  },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicensingModule__LicenseTermsNotFound",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "expireTime",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ExpirationTimeSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "LicenseTemplateRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "mintingLicenseConfig",
        internalType: "struct Licensing.MintingLicenseConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          {
            name: "mintingFeeModule",
            internalType: "address",
            type: "address",
          },
          {
            name: "receiverCheckModule",
            internalType: "address",
            type: "address",
          },
          { name: "receiverCheckData", internalType: "bytes", type: "bytes" },
        ],
        indexed: false,
      },
    ],
    name: "MintingLicenseConfigSetForIP",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "MintingLicenseConfigSetLicense",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "EXPIRATION_TIME",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "attachLicenseTermsToIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "disputeModule",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "exists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getAttachedLicenseTerms",
    outputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getAttachedLicenseTermsCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDefaultLicenseTerms",
    outputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getDerivativeIp",
    outputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "parentIpId", internalType: "address", type: "address" }],
    name: "getDerivativeIpCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getExpireTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "getMintingLicenseConfig",
    outputs: [
      {
        name: "",
        internalType: "struct Licensing.MintingLicenseConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          {
            name: "mintingFeeModule",
            internalType: "address",
            type: "address",
          },
          {
            name: "receiverCheckModule",
            internalType: "address",
            type: "address",
          },
          { name: "receiverCheckData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getParentIp",
    outputs: [{ name: "parentIpId", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "getParentIpCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "parentIpId", internalType: "address", type: "address" }],
    name: "hasDerivativeIps",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "hasIpAttachedLicenseTerms",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "isDerivativeIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "isRegisteredLicenseTemplate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "licensingModule",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "registerDerivativeIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "registerLicenseTemplate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newLicenseTemplate", internalType: "address", type: "address" },
      { name: "newLicenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "setDefaultLicenseTerms",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newDisputeModule", internalType: "address", type: "address" }],
    name: "setDisputeModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "expireTime", internalType: "uint256", type: "uint256" },
    ],
    name: "setExpireTime",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLicensingModule", internalType: "address", type: "address" }],
    name: "setLicensingModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      {
        name: "mintingLicenseConfig",
        internalType: "struct Licensing.MintingLicenseConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          {
            name: "mintingFeeModule",
            internalType: "address",
            type: "address",
          },
          {
            name: "receiverCheckModule",
            internalType: "address",
            type: "address",
          },
          { name: "receiverCheckData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "setMintingLicenseConfigForIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      {
        name: "mintingLicenseConfig",
        internalType: "struct Licensing.MintingLicenseConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          {
            name: "mintingFeeModule",
            internalType: "address",
            type: "address",
          },
          {
            name: "receiverCheckModule",
            internalType: "address",
            type: "address",
          },
          { name: "receiverCheckData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "setMintingLicenseConfigForLicense",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "isMintedByIpOwner", internalType: "bool", type: "bool" },
    ],
    name: "verifyMintLicenseToken",
    outputs: [
      {
        name: "",
        internalType: "struct Licensing.MintingLicenseConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          {
            name: "mintingFeeModule",
            internalType: "address",
            type: "address",
          },
          {
            name: "receiverCheckModule",
            internalType: "address",
            type: "address",
          },
          { name: "receiverCheckData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const licenseRegistryAddress = {
  1513: "0x0c3D467537FAd845a78728CEdc3D9447338c5422",
} as const;

/**
 *
 */
export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicensingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const licensingModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "registry", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
      { name: "licenseToken", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "LicensingModule__DisputedIpId" },
  {
    type: "error",
    inputs: [
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      {
        name: "anotherRoyaltyPolicy",
        internalType: "address",
        type: "address",
      },
    ],
    name: "LicensingModule__IncompatibleRoyaltyPolicy",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicensingModule__LicenseNotCompatibleForDerivative",
  },
  {
    type: "error",
    inputs: [
      { name: "ipLength", internalType: "uint256", type: "uint256" },
      { name: "licenseTermsLength", internalType: "uint256", type: "uint256" },
    ],
    name: "LicensingModule__LicenseTermsLengthMismatch",
  },
  {
    type: "error",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "licenseTokenIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "LicensingModule__LicenseTokenNotCompatibleForDerivative",
  },
  { type: "error", inputs: [], name: "LicensingModule__MintAmountZero" },
  { type: "error", inputs: [], name: "LicensingModule__NoLicenseToken" },
  { type: "error", inputs: [], name: "LicensingModule__NoParentIp" },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "LicensingModule__ReceiverCheckFailed",
  },
  { type: "error", inputs: [], name: "LicensingModule__ReceiverZeroAddress" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "childIpId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTokenIds",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "parentIpIds",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
      {
        name: "licenseTermsIds",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "DerivativeRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LicenseTermsAttached",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licensorIpId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "startLicenseTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LicenseTokensMinted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_NFT",
    outputs: [{ name: "", internalType: "contract ILicenseToken", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract RoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "attachLicenseTerms",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "mintLicenseTokens",
    outputs: [{ name: "startLicenseTokenId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "registerDerivative",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "licenseTokenIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "registerDerivativeWithLicenseTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const licensingModuleAddress = {
  1513: "0xEeDDE5529122b621105798860F235c28FD3aBA40",
} as const;

/**
 *
 */
export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ModuleRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const moduleRegistryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "ModuleRegistry__InterfaceIdZero" },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleAddressNotContract",
  },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleAddressZeroAddress",
  },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleAlreadyRegistered",
  },
  { type: "error", inputs: [], name: "ModuleRegistry__ModuleNotRegistered" },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleNotSupportExpectedModuleTypeInterfaceId",
  },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleTypeAlreadyRegistered",
  },
  { type: "error", inputs: [], name: "ModuleRegistry__ModuleTypeEmptyString" },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleTypeNotRegistered",
  },
  { type: "error", inputs: [], name: "ModuleRegistry__NameAlreadyRegistered" },
  { type: "error", inputs: [], name: "ModuleRegistry__NameDoesNotMatch" },
  { type: "error", inputs: [], name: "ModuleRegistry__NameEmptyString" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "name", internalType: "string", type: "string", indexed: false },
      {
        name: "module",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "moduleTypeInterfaceId",
        internalType: "bytes4",
        type: "bytes4",
        indexed: true,
      },
      {
        name: "moduleType",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "ModuleAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "name", internalType: "string", type: "string", indexed: false },
      {
        name: "module",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ModuleRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "getModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "moduleAddress", internalType: "address", type: "address" }],
    name: "getModuleType",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "moduleType", internalType: "string", type: "string" }],
    name: "getModuleTypeInterfaceId",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "governance_", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "moduleAddress", internalType: "address", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "moduleAddress", internalType: "address", type: "address" },
    ],
    name: "registerModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "moduleAddress", internalType: "address", type: "address" },
      { name: "moduleType", internalType: "string", type: "string" },
    ],
    name: "registerModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "interfaceId", internalType: "bytes4", type: "bytes4" },
    ],
    name: "registerModuleType",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "removeModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "removeModuleType",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const moduleRegistryAddress = {
  1513: "0xf2965E3B6251905Dd1E8671077760D07b0408cf2",
} as const;

/**
 *
 */
export const moduleRegistryConfig = {
  address: moduleRegistryAddress,
  abi: moduleRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PILicenseTemplate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const piLicenseTemplateAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "licenseToken", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddCommercializers",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddRevShare",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddRoyaltyPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialEnabled_RoyaltyPolicyRequired",
  },
  {
    type: "error",
    inputs: [{ name: "checker", internalType: "address", type: "address" }],
    name: "PILicenseTemplate__CommercializerCheckerDoesNotSupportHook",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CurrencyTokenNotWhitelisted",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddApproval",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddReciprocal",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__RoyaltyPolicyNotWhitelisted",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__RoyaltyPolicyRequiresCurrencyToken",
  },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "StringsInsufficientHexLength",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "DerivativeApproved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTerms",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "LicenseTermsRegistered",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_NFT",
    outputs: [{ name: "", internalType: "contract ILicenseToken", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "exists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "start", internalType: "uint256", type: "uint256" },
    ],
    name: "getEarlierExpireTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "start", internalType: "uint256", type: "uint256" },
    ],
    name: "getExpireTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCelling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCelling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "getLicenseTermsId",
    outputs: [
      {
        name: "selectedLicenseTermsId",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getMetadataURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "getRoyaltyPolicy",
    outputs: [
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "royaltyData", internalType: "bytes", type: "bytes" },
      { name: "mintingFee", internalType: "uint256", type: "uint256" },
      { name: "currency", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "metadataURI", internalType: "string", type: "string" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTokenId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isDerivativeApproved",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "isLicenseTransferable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCelling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCelling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "registerLicenseTerms",
    outputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTokenId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApproval",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "toJson",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalRegisteredLicenseTerms",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" }],
    name: "verifyCompatibleLicenses",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "licensee", internalType: "address", type: "address" },
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "verifyMintLicenseToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "licensee", internalType: "address", type: "address" },
    ],
    name: "verifyRegisterDerivative",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "childIpOwner", internalType: "address", type: "address" },
    ],
    name: "verifyRegisterDerivativeForAllParents",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const piLicenseTemplateAddress = {
  1513: "0xd0Be223ae9719bBD93447ecf5289319CCf8cA227",
} as const;

/**
 *
 */
export const piLicenseTemplateConfig = {
  address: piLicenseTemplateAddress,
  abi: piLicenseTemplateAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const royaltyModuleAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__CanOnlyMintSelectedPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__IncompatibleRoyaltyPolicy",
  },
  { type: "error", inputs: [], name: "RoyaltyModule__IpIsTagged" },
  { type: "error", inputs: [], name: "RoyaltyModule__NoParentsOnLinking" },
  { type: "error", inputs: [], name: "RoyaltyModule__NoRoyaltyPolicySet" },
  { type: "error", inputs: [], name: "RoyaltyModule__NotAllowedCaller" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__NotWhitelistedRoyaltyPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__NotWhitelistedRoyaltyToken",
  },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroLicensingModule" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroRoyaltyPolicy" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroRoyaltyToken" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "receiverIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "payerAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LicenseMintingFeePaid",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "receiverIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "payerIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RoyaltyPaid",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "royaltyPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "RoyaltyPolicyWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "RoyaltyTokenWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "disputeModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governance", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "royaltyPolicy", internalType: "address", type: "address" }],
    name: "isWhitelistedRoyaltyPolicy",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isWhitelistedRoyaltyToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "licensingModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "licenseData", internalType: "bytes", type: "bytes" },
      { name: "externalData", internalType: "bytes", type: "bytes" },
    ],
    name: "onLicenseMinting",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseData", internalType: "bytes[]", type: "bytes[]" },
      { name: "externalData", internalType: "bytes", type: "bytes" },
    ],
    name: "onLinkToParents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiverIpId", internalType: "address", type: "address" },
      { name: "payerAddress", internalType: "address", type: "address" },
      {
        name: "licenseRoyaltyPolicy",
        internalType: "address",
        type: "address",
      },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "payLicenseMintingFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiverIpId", internalType: "address", type: "address" },
      { name: "payerIpId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "payRoyaltyOnBehalf",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "royaltyPolicies",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "dispute", internalType: "address", type: "address" }],
    name: "setDisputeModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "licensing", internalType: "address", type: "address" }],
    name: "setLicensingModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistRoyaltyPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistRoyaltyToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const royaltyModuleAddress = {
  1513: "0x551AD8CD7893003cE00500aC2aCF1E327763D9f6",
} as const;

/**
 *
 */
export const royaltyModuleConfig = {
  address: royaltyModuleAddress,
  abi: royaltyModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyPolicyLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const royaltyPolicyLapAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__AboveAncestorsLimit" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__AboveParentLimit" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__AboveRoyaltyStackLimit",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__InvalidParentRoyaltiesLength",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__LastPositionNotAbleToMintLicense",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__NotRoyaltyModule" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__UnlinkableToParents" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroIpRoyaltyVaultBeacon",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroLicensingModule" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroRoyaltyModule" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGovernance",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ipRoyaltyVault",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "royaltyStack",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "targetAncestors",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
      {
        name: "targetRoyaltyAmount",
        internalType: "uint32[]",
        type: "uint32[]",
        indexed: false,
      },
    ],
    name: "PolicyInitialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_ANCESTORS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_PARENTS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "TOTAL_RT_SUPPLY",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getIpRoyaltyVaultBeacon",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getRoyaltyData",
    outputs: [
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint32", type: "uint32" },
      { name: "", internalType: "address[]", type: "address[]" },
      { name: "", internalType: "uint32[]", type: "uint32[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getSnapshotInterval",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseData", internalType: "bytes", type: "bytes" },
      { name: "externalData", internalType: "bytes", type: "bytes" },
    ],
    name: "onLicenseMinting",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseData", internalType: "bytes[]", type: "bytes[]" },
      { name: "externalData", internalType: "bytes", type: "bytes" },
    ],
    name: "onLinkToParents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "onRoyaltyPayment",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "beacon", internalType: "address", type: "address" }],
    name: "setIpRoyaltyVaultBeacon",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "timestampInterval", internalType: "uint256", type: "uint256" }],
    name: "setSnapshotInterval",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const royaltyPolicyLapAddress = {
  1513: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
} as const;

/**
 *
 */
export const royaltyPolicyLapConfig = {
  address: royaltyPolicyLapAddress,
  abi: royaltyPolicyLapAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// COMMON =============================================================

function getAddress(address: Record<number, Address>, chainId?: number): Address {
  return address[chainId || 0] || "0x";
}

export type SimpleWalletClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = {
  account?: TAccount;
  writeContract: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "payable" | "nonpayable">,
    args extends ContractFunctionArgs<abi, "payable" | "nonpayable", functionName>,
    TChainOverride extends Chain | undefined = undefined,
  >(
    args: WriteContractParameters<abi, functionName, args, TChain, TAccount, TChainOverride>,
  ) => Promise<WriteContractReturnType>;
};

// Contract AccessController =============================================================

/**
 * AccessControllerPermissionSetEvent
 *
 * @param ipAccountOwner address
 * @param ipAccount address
 * @param signer address
 * @param to address
 * @param func bytes4
 * @param permission uint8
 */
export type AccessControllerPermissionSetEvent = {
  ipAccountOwner: Address;
  ipAccount: Address;
  signer: Address;
  to: Address;
  func: Hex;
  permission: number;
};

/**
 * AccessControllerSetPermissionRequest
 *
 * @param ipAccount address
 * @param signer address
 * @param to address
 * @param func bytes4
 * @param permission uint8
 */
export type AccessControllerSetPermissionRequest = {
  ipAccount: Address;
  signer: Address;
  to: Address;
  func: Hex;
  permission: number;
};

/**
 * contract AccessController event
 */
export class AccessControllerEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(accessControllerAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event PermissionSet for contract AccessController
   */
  public watchPermissionSetEvent(
    onLogs: (txHash: Hex, ev: Partial<AccessControllerPermissionSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: accessControllerAbi,
      address: this.address,
      eventName: "PermissionSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event PermissionSet for contract AccessController
   */
  public parseTxPermissionSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<AccessControllerPermissionSetEvent> {
    const targetLogs: Array<AccessControllerPermissionSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: accessControllerAbi,
          eventName: "PermissionSet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "PermissionSet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract AccessController write method
 */
export class AccessControllerClient extends AccessControllerEventClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method setPermission for contract AccessController
   *
   * @param request AccessControllerSetPermissionRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setPermission(
    request: AccessControllerSetPermissionRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "setPermission",
      account: this.wallet.account,
      args: [request.ipAccount, request.signer, request.to, request.func, request.permission],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract DisputeModule =============================================================

/**
 * DisputeModuleDisputeCancelledEvent
 *
 * @param disputeId uint256
 * @param data bytes
 */
export type DisputeModuleDisputeCancelledEvent = {
  disputeId: bigint;
  data: Hex;
};

/**
 * DisputeModuleDisputeRaisedEvent
 *
 * @param disputeId uint256
 * @param targetIpId address
 * @param disputeInitiator address
 * @param arbitrationPolicy address
 * @param linkToDisputeEvidence bytes32
 * @param targetTag bytes32
 * @param data bytes
 */
export type DisputeModuleDisputeRaisedEvent = {
  disputeId: bigint;
  targetIpId: Address;
  disputeInitiator: Address;
  arbitrationPolicy: Address;
  linkToDisputeEvidence: Hex;
  targetTag: Hex;
  data: Hex;
};

/**
 * DisputeModuleDisputeResolvedEvent
 *
 * @param disputeId uint256
 */
export type DisputeModuleDisputeResolvedEvent = {
  disputeId: bigint;
};

/**
 * DisputeModuleCancelDisputeRequest
 *
 * @param disputeId uint256
 * @param data bytes
 */
export type DisputeModuleCancelDisputeRequest = {
  disputeId: bigint;
  data: Hex;
};

/**
 * DisputeModuleRaiseDisputeRequest
 *
 * @param targetIpId address
 * @param linkToDisputeEvidence string
 * @param targetTag bytes32
 * @param data bytes
 */
export type DisputeModuleRaiseDisputeRequest = {
  targetIpId: Address;
  linkToDisputeEvidence: string;
  targetTag: Hex;
  data: Hex;
};

/**
 * DisputeModuleResolveDisputeRequest
 *
 * @param disputeId uint256
 */
export type DisputeModuleResolveDisputeRequest = {
  disputeId: bigint;
};

/**
 * contract DisputeModule event
 */
export class DisputeModuleEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(disputeModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event DisputeCancelled for contract DisputeModule
   */
  public watchDisputeCancelledEvent(
    onLogs: (txHash: Hex, ev: Partial<DisputeModuleDisputeCancelledEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DisputeCancelled",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DisputeCancelled for contract DisputeModule
   */
  public parseTxDisputeCancelledEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeCancelledEvent> {
    const targetLogs: Array<DisputeModuleDisputeCancelledEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: "DisputeCancelled",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DisputeCancelled") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event DisputeRaised for contract DisputeModule
   */
  public watchDisputeRaisedEvent(
    onLogs: (txHash: Hex, ev: Partial<DisputeModuleDisputeRaisedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DisputeRaised",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DisputeRaised for contract DisputeModule
   */
  public parseTxDisputeRaisedEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeRaisedEvent> {
    const targetLogs: Array<DisputeModuleDisputeRaisedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: "DisputeRaised",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DisputeRaised") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event DisputeResolved for contract DisputeModule
   */
  public watchDisputeResolvedEvent(
    onLogs: (txHash: Hex, ev: Partial<DisputeModuleDisputeResolvedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DisputeResolved",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DisputeResolved for contract DisputeModule
   */
  public parseTxDisputeResolvedEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeResolvedEvent> {
    const targetLogs: Array<DisputeModuleDisputeResolvedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: "DisputeResolved",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DisputeResolved") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract DisputeModule write method
 */
export class DisputeModuleClient extends DisputeModuleEventClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method cancelDispute for contract DisputeModule
   *
   * @param request DisputeModuleCancelDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async cancelDispute(
    request: DisputeModuleCancelDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "cancelDispute",
      account: this.wallet.account,
      args: [request.disputeId, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method raiseDispute for contract DisputeModule
   *
   * @param request DisputeModuleRaiseDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async raiseDispute(
    request: DisputeModuleRaiseDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "raiseDispute",
      account: this.wallet.account,
      args: [request.targetIpId, request.linkToDisputeEvidence, request.targetTag, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method resolveDispute for contract DisputeModule
   *
   * @param request DisputeModuleResolveDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async resolveDispute(
    request: DisputeModuleResolveDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "resolveDispute",
      account: this.wallet.account,
      args: [request.disputeId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract IPAccountImpl =============================================================

/**
 * IpAccountImplExecuteRequest
 *
 * @param to address
 * @param value uint256
 * @param data bytes
 */
export type IpAccountImplExecuteRequest = {
  to: Address;
  value: bigint;
  data: Hex;
};

/**
 * IpAccountImplExecuteWithSigRequest
 *
 * @param to address
 * @param value uint256
 * @param data bytes
 * @param signer address
 * @param deadline uint256
 * @param signature bytes
 */
export type IpAccountImplExecuteWithSigRequest = {
  to: Address;
  value: bigint;
  data: Hex;
  signer: Address;
  deadline: bigint;
  signature: Hex;
};

/**
 * contract IPAccountImpl write method
 */
export class IpAccountImplClient {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(ipAccountImplAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method execute for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteRequest
   * @return Promise<WriteContractReturnType>
   */
  public async execute(request: IpAccountImplExecuteRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "execute",
      account: this.wallet.account,
      args: [request.to, request.value, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method executeWithSig for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteWithSigRequest
   * @return Promise<WriteContractReturnType>
   */
  public async executeWithSig(
    request: IpAccountImplExecuteWithSigRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "executeWithSig",
      account: this.wallet.account,
      args: [
        request.to,
        request.value,
        request.data,
        request.signer,
        request.deadline,
        request.signature,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract IPAssetRegistry =============================================================

/**
 * IpAssetRegistryIpRegisteredEvent
 *
 * @param ipId address
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 * @param name string
 * @param uri string
 * @param registrationDate uint256
 */
export type IpAssetRegistryIpRegisteredEvent = {
  ipId: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  name: string;
  uri: string;
  registrationDate: bigint;
};

/**
 * IpAssetRegistryIpIdRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryIpIdRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

export type IpAssetRegistryIpIdResponse = Address;

/**
 * IpAssetRegistryIsRegisteredRequest
 *
 * @param id address
 */
export type IpAssetRegistryIsRegisteredRequest = {
  id: Address;
};

export type IpAssetRegistryIsRegisteredResponse = boolean;

/**
 * IpAssetRegistryRegisterRequest
 *
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryRegisterRequest = {
  tokenContract: Address;
  tokenId: bigint;
};

/**
 * contract IPAssetRegistry event
 */
export class IpAssetRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(ipAssetRegistryAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event IPRegistered for contract IPAssetRegistry
   */
  public watchIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<IpAssetRegistryIpRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "IPRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event IPRegistered for contract IPAssetRegistry
   */
  public parseTxIpRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpAssetRegistryIpRegisteredEvent> {
    const targetLogs: Array<IpAssetRegistryIpRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipAssetRegistryAbi,
          eventName: "IPRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "IPRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract IPAssetRegistry readonly method
 */
export class IpAssetRegistryReadOnlyClient extends IpAssetRegistryEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method ipId for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIpIdRequest
   * @return Promise<IpAssetRegistryIpIdResponse>
   */
  public async ipId(request: IpAssetRegistryIpIdRequest): Promise<IpAssetRegistryIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "ipId",
      args: [request.chainId, request.tokenContract, request.tokenId],
    });
  }

  /**
   * method isRegistered for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIsRegisteredRequest
   * @return Promise<IpAssetRegistryIsRegisteredResponse>
   */
  public async isRegistered(
    request: IpAssetRegistryIsRegisteredRequest,
  ): Promise<IpAssetRegistryIsRegisteredResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "isRegistered",
      args: [request.id],
    });
  }
}

/**
 * contract IPAssetRegistry write method
 */
export class IpAssetRegistryClient extends IpAssetRegistryReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method register for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegisterRequest
   * @return Promise<WriteContractReturnType>
   */
  public async register(request: IpAssetRegistryRegisterRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "register",
      account: this.wallet.account,
      args: [request.tokenContract, request.tokenId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract IpRoyaltyVaultImpl =============================================================

/**
 * IpRoyaltyVaultImplRoyaltyTokensCollectedEvent
 *
 * @param ancestorIpId address
 * @param royaltyTokensCollected uint256
 */
export type IpRoyaltyVaultImplRoyaltyTokensCollectedEvent = {
  ancestorIpId: Address;
  royaltyTokensCollected: bigint;
};

/**
 * IpRoyaltyVaultImplSnapshotCompletedEvent
 *
 * @param snapshotId uint256
 * @param snapshotTimestamp uint256
 * @param unclaimedTokens uint32
 */
export type IpRoyaltyVaultImplSnapshotCompletedEvent = {
  snapshotId: bigint;
  snapshotTimestamp: bigint;
  unclaimedTokens: number;
};

/**
 * IpRoyaltyVaultImplClaimableRevenueRequest
 *
 * @param account address
 * @param snapshotId uint256
 * @param token address
 */
export type IpRoyaltyVaultImplClaimableRevenueRequest = {
  account: Address;
  snapshotId: bigint;
  token: Address;
};

export type IpRoyaltyVaultImplClaimableRevenueResponse = bigint;

export type IpRoyaltyVaultImplIpIdResponse = Address;

/**
 * IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest
 *
 * @param snapshotIds uint256[]
 * @param token address
 */
export type IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest = {
  snapshotIds: readonly bigint[];
  token: Address;
};

/**
 * IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest
 *
 * @param snapshotId uint256
 * @param tokens address[]
 */
export type IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest = {
  snapshotId: bigint;
  tokens: readonly Address[];
};

/**
 * IpRoyaltyVaultImplCollectRoyaltyTokensRequest
 *
 * @param ancestorIpId address
 */
export type IpRoyaltyVaultImplCollectRoyaltyTokensRequest = {
  ancestorIpId: Address;
};

/**
 * contract IpRoyaltyVaultImpl event
 */
export class IpRoyaltyVaultImplEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(ipRoyaltyVaultImplAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event RoyaltyTokensCollected for contract IpRoyaltyVaultImpl
   */
  public watchRoyaltyTokensCollectedEvent(
    onLogs: (txHash: Hex, ev: Partial<IpRoyaltyVaultImplRoyaltyTokensCollectedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: "RoyaltyTokensCollected",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RoyaltyTokensCollected for contract IpRoyaltyVaultImpl
   */
  public parseTxRoyaltyTokensCollectedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplRoyaltyTokensCollectedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplRoyaltyTokensCollectedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: "RoyaltyTokensCollected",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RoyaltyTokensCollected") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event SnapshotCompleted for contract IpRoyaltyVaultImpl
   */
  public watchSnapshotCompletedEvent(
    onLogs: (txHash: Hex, ev: Partial<IpRoyaltyVaultImplSnapshotCompletedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: "SnapshotCompleted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event SnapshotCompleted for contract IpRoyaltyVaultImpl
   */
  public parseTxSnapshotCompletedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplSnapshotCompletedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplSnapshotCompletedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: "SnapshotCompleted",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "SnapshotCompleted") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract IpRoyaltyVaultImpl readonly method
 */
export class IpRoyaltyVaultImplReadOnlyClient extends IpRoyaltyVaultImplEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method claimableRevenue for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimableRevenueRequest
   * @return Promise<IpRoyaltyVaultImplClaimableRevenueResponse>
   */
  public async claimableRevenue(
    request: IpRoyaltyVaultImplClaimableRevenueRequest,
  ): Promise<IpRoyaltyVaultImplClaimableRevenueResponse> {
    return await this.rpcClient.readContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "claimableRevenue",
      args: [request.account, request.snapshotId, request.token],
    });
  }

  /**
   * method ipId for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplIpIdRequest
   * @return Promise<IpRoyaltyVaultImplIpIdResponse>
   */
  public async ipId(): Promise<IpRoyaltyVaultImplIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "ipId",
    });
  }
}

/**
 * contract IpRoyaltyVaultImpl write method
 */
export class IpRoyaltyVaultImplClient extends IpRoyaltyVaultImplReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method claimRevenueBySnapshotBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueBySnapshotBatch(
    request: IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "claimRevenueBySnapshotBatch",
      account: this.wallet.account,
      args: [request.snapshotIds, request.token],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method claimRevenueByTokenBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueByTokenBatch(
    request: IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "claimRevenueByTokenBatch",
      account: this.wallet.account,
      args: [request.snapshotId, request.tokens],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method collectRoyaltyTokens for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplCollectRoyaltyTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async collectRoyaltyTokens(
    request: IpRoyaltyVaultImplCollectRoyaltyTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "collectRoyaltyTokens",
      account: this.wallet.account,
      args: [request.ancestorIpId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method snapshot for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplSnapshotRequest
   * @return Promise<WriteContractReturnType>
   */
  public async snapshot(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "snapshot",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract LicenseRegistry =============================================================

/**
 * LicenseRegistryExpirationTimeSetEvent
 *
 * @param ipId address
 * @param expireTime uint256
 */
export type LicenseRegistryExpirationTimeSetEvent = {
  ipId: Address;
  expireTime: bigint;
};

/**
 * LicenseRegistryGovernanceUpdatedEvent
 *
 * @param newGovernance address
 */
export type LicenseRegistryGovernanceUpdatedEvent = {
  newGovernance: Address;
};

/**
 * LicenseRegistryInitializedEvent
 *
 * @param version uint64
 */
export type LicenseRegistryInitializedEvent = {
  version: bigint;
};

/**
 * LicenseRegistryLicenseTemplateRegisteredEvent
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryLicenseTemplateRegisteredEvent = {
  licenseTemplate: Address;
};

/**
 * LicenseRegistryMintingLicenseConfigSetForIpEvent
 *
 * @param ipId address
 * @param mintingLicenseConfig tuple
 */
export type LicenseRegistryMintingLicenseConfigSetForIpEvent = {
  ipId: Address;
  mintingLicenseConfig: {
    isSet: boolean;
    mintingFee: bigint;
    mintingFeeModule: Address;
    receiverCheckModule: Address;
    receiverCheckData: Hex;
  };
};

/**
 * LicenseRegistryMintingLicenseConfigSetLicenseEvent
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryMintingLicenseConfigSetLicenseEvent = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryUpgradedEvent
 *
 * @param implementation address
 */
export type LicenseRegistryUpgradedEvent = {
  implementation: Address;
};

export type LicenseRegistryExpirationTimeResponse = Hex;

export type LicenseRegistryUpgradeInterfaceVersionResponse = string;

export type LicenseRegistryDisputeModuleResponse = Address;

/**
 * LicenseRegistryExistsRequest
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryExistsRequest = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

export type LicenseRegistryExistsResponse = boolean;

/**
 * LicenseRegistryGetAttachedLicenseTermsRequest
 *
 * @param ipId address
 * @param index uint256
 */
export type LicenseRegistryGetAttachedLicenseTermsRequest = {
  ipId: Address;
  index: bigint;
};

/**
 * LicenseRegistryGetAttachedLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetAttachedLicenseTermsResponse = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryGetAttachedLicenseTermsCountRequest
 *
 * @param ipId address
 */
export type LicenseRegistryGetAttachedLicenseTermsCountRequest = {
  ipId: Address;
};

export type LicenseRegistryGetAttachedLicenseTermsCountResponse = bigint;

/**
 * LicenseRegistryGetDefaultLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetDefaultLicenseTermsResponse = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryGetDerivativeIpRequest
 *
 * @param parentIpId address
 * @param index uint256
 */
export type LicenseRegistryGetDerivativeIpRequest = {
  parentIpId: Address;
  index: bigint;
};

/**
 * LicenseRegistryGetDerivativeIpResponse
 *
 * @param childIpId address
 */
export type LicenseRegistryGetDerivativeIpResponse = {
  childIpId: Address;
};

/**
 * LicenseRegistryGetDerivativeIpCountRequest
 *
 * @param parentIpId address
 */
export type LicenseRegistryGetDerivativeIpCountRequest = {
  parentIpId: Address;
};

export type LicenseRegistryGetDerivativeIpCountResponse = bigint;

/**
 * LicenseRegistryGetExpireTimeRequest
 *
 * @param ipId address
 */
export type LicenseRegistryGetExpireTimeRequest = {
  ipId: Address;
};

export type LicenseRegistryGetExpireTimeResponse = bigint;

export type LicenseRegistryGetGovernanceResponse = Address;

/**
 * LicenseRegistryGetMintingLicenseConfigRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetMintingLicenseConfigRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

export type LicenseRegistryGetMintingLicenseConfigResponse = {
  isSet: boolean;
  mintingFee: bigint;
  mintingFeeModule: Address;
  receiverCheckModule: Address;
  receiverCheckData: Hex;
};

/**
 * LicenseRegistryGetParentIpRequest
 *
 * @param childIpId address
 * @param index uint256
 */
export type LicenseRegistryGetParentIpRequest = {
  childIpId: Address;
  index: bigint;
};

/**
 * LicenseRegistryGetParentIpResponse
 *
 * @param parentIpId address
 */
export type LicenseRegistryGetParentIpResponse = {
  parentIpId: Address;
};

/**
 * LicenseRegistryGetParentIpCountRequest
 *
 * @param childIpId address
 */
export type LicenseRegistryGetParentIpCountRequest = {
  childIpId: Address;
};

export type LicenseRegistryGetParentIpCountResponse = bigint;

/**
 * LicenseRegistryHasDerivativeIpsRequest
 *
 * @param parentIpId address
 */
export type LicenseRegistryHasDerivativeIpsRequest = {
  parentIpId: Address;
};

export type LicenseRegistryHasDerivativeIpsResponse = boolean;

/**
 * LicenseRegistryHasIpAttachedLicenseTermsRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryHasIpAttachedLicenseTermsRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

export type LicenseRegistryHasIpAttachedLicenseTermsResponse = boolean;

/**
 * LicenseRegistryIsDerivativeIpRequest
 *
 * @param childIpId address
 */
export type LicenseRegistryIsDerivativeIpRequest = {
  childIpId: Address;
};

export type LicenseRegistryIsDerivativeIpResponse = boolean;

/**
 * LicenseRegistryIsRegisteredLicenseTemplateRequest
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryIsRegisteredLicenseTemplateRequest = {
  licenseTemplate: Address;
};

export type LicenseRegistryIsRegisteredLicenseTemplateResponse = boolean;

export type LicenseRegistryLicensingModuleResponse = Address;

export type LicenseRegistryProxiableUuidResponse = Hex;

/**
 * LicenseRegistryVerifyMintLicenseTokenRequest
 *
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param isMintedByIpOwner bool
 */
export type LicenseRegistryVerifyMintLicenseTokenRequest = {
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  isMintedByIpOwner: boolean;
};

export type LicenseRegistryVerifyMintLicenseTokenResponse = {
  isSet: boolean;
  mintingFee: bigint;
  mintingFeeModule: Address;
  receiverCheckModule: Address;
  receiverCheckData: Hex;
};

/**
 * LicenseRegistryAttachLicenseTermsToIpRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryAttachLicenseTermsToIpRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryInitializeRequest
 *
 * @param governance address
 */
export type LicenseRegistryInitializeRequest = {
  governance: Address;
};

/**
 * LicenseRegistryRegisterDerivativeIpRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTemplate address
 * @param licenseTermsIds uint256[]
 */
export type LicenseRegistryRegisterDerivativeIpRequest = {
  childIpId: Address;
  parentIpIds: readonly Address[];
  licenseTemplate: Address;
  licenseTermsIds: readonly bigint[];
};

/**
 * LicenseRegistryRegisterLicenseTemplateRequest
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryRegisterLicenseTemplateRequest = {
  licenseTemplate: Address;
};

/**
 * LicenseRegistrySetDefaultLicenseTermsRequest
 *
 * @param newLicenseTemplate address
 * @param newLicenseTermsId uint256
 */
export type LicenseRegistrySetDefaultLicenseTermsRequest = {
  newLicenseTemplate: Address;
  newLicenseTermsId: bigint;
};

/**
 * LicenseRegistrySetDisputeModuleRequest
 *
 * @param newDisputeModule address
 */
export type LicenseRegistrySetDisputeModuleRequest = {
  newDisputeModule: Address;
};

/**
 * LicenseRegistrySetExpireTimeRequest
 *
 * @param ipId address
 * @param expireTime uint256
 */
export type LicenseRegistrySetExpireTimeRequest = {
  ipId: Address;
  expireTime: bigint;
};

/**
 * LicenseRegistrySetGovernanceRequest
 *
 * @param newGovernance address
 */
export type LicenseRegistrySetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * LicenseRegistrySetLicensingModuleRequest
 *
 * @param newLicensingModule address
 */
export type LicenseRegistrySetLicensingModuleRequest = {
  newLicensingModule: Address;
};

/**
 * LicenseRegistrySetMintingLicenseConfigForIpRequest
 *
 * @param ipId address
 * @param mintingLicenseConfig tuple
 */
export type LicenseRegistrySetMintingLicenseConfigForIpRequest = {
  ipId: Address;
  mintingLicenseConfig: {
    isSet: boolean;
    mintingFee: bigint;
    mintingFeeModule: Address;
    receiverCheckModule: Address;
    receiverCheckData: Hex;
  };
};

/**
 * LicenseRegistrySetMintingLicenseConfigForLicenseRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param mintingLicenseConfig tuple
 */
export type LicenseRegistrySetMintingLicenseConfigForLicenseRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  mintingLicenseConfig: {
    isSet: boolean;
    mintingFee: bigint;
    mintingFeeModule: Address;
    receiverCheckModule: Address;
    receiverCheckData: Hex;
  };
};

/**
 * LicenseRegistryUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type LicenseRegistryUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

/**
 * contract LicenseRegistry event
 */
export class LicenseRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(licenseRegistryAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event ExpirationTimeSet for contract LicenseRegistry
   */
  public watchExpirationTimeSetEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryExpirationTimeSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "ExpirationTimeSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event ExpirationTimeSet for contract LicenseRegistry
   */
  public parseTxExpirationTimeSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryExpirationTimeSetEvent> {
    const targetLogs: Array<LicenseRegistryExpirationTimeSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "ExpirationTimeSet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "ExpirationTimeSet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event GovernanceUpdated for contract LicenseRegistry
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryGovernanceUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event GovernanceUpdated for contract LicenseRegistry
   */
  public parseTxGovernanceUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryGovernanceUpdatedEvent> {
    const targetLogs: Array<LicenseRegistryGovernanceUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "GovernanceUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "GovernanceUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract LicenseRegistry
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract LicenseRegistry
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryInitializedEvent> {
    const targetLogs: Array<LicenseRegistryInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicenseTemplateRegistered for contract LicenseRegistry
   */
  public watchLicenseTemplateRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryLicenseTemplateRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "LicenseTemplateRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTemplateRegistered for contract LicenseRegistry
   */
  public parseTxLicenseTemplateRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicenseTemplateRegisteredEvent> {
    const targetLogs: Array<LicenseRegistryLicenseTemplateRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "LicenseTemplateRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTemplateRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event MintingLicenseConfigSetForIP for contract LicenseRegistry
   */
  public watchMintingLicenseConfigSetForIpEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryMintingLicenseConfigSetForIpEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "MintingLicenseConfigSetForIP",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event MintingLicenseConfigSetForIP for contract LicenseRegistry
   */
  public parseTxMintingLicenseConfigSetForIpEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryMintingLicenseConfigSetForIpEvent> {
    const targetLogs: Array<LicenseRegistryMintingLicenseConfigSetForIpEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "MintingLicenseConfigSetForIP",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "MintingLicenseConfigSetForIP") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event MintingLicenseConfigSetLicense for contract LicenseRegistry
   */
  public watchMintingLicenseConfigSetLicenseEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryMintingLicenseConfigSetLicenseEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "MintingLicenseConfigSetLicense",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event MintingLicenseConfigSetLicense for contract LicenseRegistry
   */
  public parseTxMintingLicenseConfigSetLicenseEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryMintingLicenseConfigSetLicenseEvent> {
    const targetLogs: Array<LicenseRegistryMintingLicenseConfigSetLicenseEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "MintingLicenseConfigSetLicense",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "MintingLicenseConfigSetLicense") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Upgraded for contract LicenseRegistry
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract LicenseRegistry
   */
  public parseTxUpgradedEvent(txReceipt: TransactionReceipt): Array<LicenseRegistryUpgradedEvent> {
    const targetLogs: Array<LicenseRegistryUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract LicenseRegistry readonly method
 */
export class LicenseRegistryReadOnlyClient extends LicenseRegistryEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method EXPIRATION_TIME for contract LicenseRegistry
   *
   * @param request LicenseRegistryExpirationTimeRequest
   * @return Promise<LicenseRegistryExpirationTimeResponse>
   */
  public async expirationTime(): Promise<LicenseRegistryExpirationTimeResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "EXPIRATION_TIME",
    });
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract LicenseRegistry
   *
   * @param request LicenseRegistryUpgradeInterfaceVersionRequest
   * @return Promise<LicenseRegistryUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<LicenseRegistryUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
  }

  /**
   * method disputeModule for contract LicenseRegistry
   *
   * @param request LicenseRegistryDisputeModuleRequest
   * @return Promise<LicenseRegistryDisputeModuleResponse>
   */
  public async disputeModule(): Promise<LicenseRegistryDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "disputeModule",
    });
  }

  /**
   * method exists for contract LicenseRegistry
   *
   * @param request LicenseRegistryExistsRequest
   * @return Promise<LicenseRegistryExistsResponse>
   */
  public async exists(
    request: LicenseRegistryExistsRequest,
  ): Promise<LicenseRegistryExistsResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "exists",
      args: [request.licenseTemplate, request.licenseTermsId],
    });
  }

  /**
   * method getAttachedLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetAttachedLicenseTermsRequest
   * @return Promise<LicenseRegistryGetAttachedLicenseTermsResponse>
   */
  public async getAttachedLicenseTerms(
    request: LicenseRegistryGetAttachedLicenseTermsRequest,
  ): Promise<LicenseRegistryGetAttachedLicenseTermsResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getAttachedLicenseTerms",
      args: [request.ipId, request.index],
    });
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    };
  }

  /**
   * method getAttachedLicenseTermsCount for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetAttachedLicenseTermsCountRequest
   * @return Promise<LicenseRegistryGetAttachedLicenseTermsCountResponse>
   */
  public async getAttachedLicenseTermsCount(
    request: LicenseRegistryGetAttachedLicenseTermsCountRequest,
  ): Promise<LicenseRegistryGetAttachedLicenseTermsCountResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getAttachedLicenseTermsCount",
      args: [request.ipId],
    });
  }

  /**
   * method getDefaultLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetDefaultLicenseTermsRequest
   * @return Promise<LicenseRegistryGetDefaultLicenseTermsResponse>
   */
  public async getDefaultLicenseTerms(): Promise<LicenseRegistryGetDefaultLicenseTermsResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getDefaultLicenseTerms",
    });
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    };
  }

  /**
   * method getDerivativeIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetDerivativeIpRequest
   * @return Promise<LicenseRegistryGetDerivativeIpResponse>
   */
  public async getDerivativeIp(
    request: LicenseRegistryGetDerivativeIpRequest,
  ): Promise<LicenseRegistryGetDerivativeIpResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getDerivativeIp",
      args: [request.parentIpId, request.index],
    });
    return {
      childIpId: result,
    };
  }

  /**
   * method getDerivativeIpCount for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetDerivativeIpCountRequest
   * @return Promise<LicenseRegistryGetDerivativeIpCountResponse>
   */
  public async getDerivativeIpCount(
    request: LicenseRegistryGetDerivativeIpCountRequest,
  ): Promise<LicenseRegistryGetDerivativeIpCountResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getDerivativeIpCount",
      args: [request.parentIpId],
    });
  }

  /**
   * method getExpireTime for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetExpireTimeRequest
   * @return Promise<LicenseRegistryGetExpireTimeResponse>
   */
  public async getExpireTime(
    request: LicenseRegistryGetExpireTimeRequest,
  ): Promise<LicenseRegistryGetExpireTimeResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getExpireTime",
      args: [request.ipId],
    });
  }

  /**
   * method getGovernance for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetGovernanceRequest
   * @return Promise<LicenseRegistryGetGovernanceResponse>
   */
  public async getGovernance(): Promise<LicenseRegistryGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method getMintingLicenseConfig for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetMintingLicenseConfigRequest
   * @return Promise<LicenseRegistryGetMintingLicenseConfigResponse>
   */
  public async getMintingLicenseConfig(
    request: LicenseRegistryGetMintingLicenseConfigRequest,
  ): Promise<LicenseRegistryGetMintingLicenseConfigResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getMintingLicenseConfig",
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
  }

  /**
   * method getParentIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetParentIpRequest
   * @return Promise<LicenseRegistryGetParentIpResponse>
   */
  public async getParentIp(
    request: LicenseRegistryGetParentIpRequest,
  ): Promise<LicenseRegistryGetParentIpResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getParentIp",
      args: [request.childIpId, request.index],
    });
    return {
      parentIpId: result,
    };
  }

  /**
   * method getParentIpCount for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetParentIpCountRequest
   * @return Promise<LicenseRegistryGetParentIpCountResponse>
   */
  public async getParentIpCount(
    request: LicenseRegistryGetParentIpCountRequest,
  ): Promise<LicenseRegistryGetParentIpCountResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getParentIpCount",
      args: [request.childIpId],
    });
  }

  /**
   * method hasDerivativeIps for contract LicenseRegistry
   *
   * @param request LicenseRegistryHasDerivativeIpsRequest
   * @return Promise<LicenseRegistryHasDerivativeIpsResponse>
   */
  public async hasDerivativeIps(
    request: LicenseRegistryHasDerivativeIpsRequest,
  ): Promise<LicenseRegistryHasDerivativeIpsResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "hasDerivativeIps",
      args: [request.parentIpId],
    });
  }

  /**
   * method hasIpAttachedLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryHasIpAttachedLicenseTermsRequest
   * @return Promise<LicenseRegistryHasIpAttachedLicenseTermsResponse>
   */
  public async hasIpAttachedLicenseTerms(
    request: LicenseRegistryHasIpAttachedLicenseTermsRequest,
  ): Promise<LicenseRegistryHasIpAttachedLicenseTermsResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "hasIpAttachedLicenseTerms",
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
  }

  /**
   * method isDerivativeIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsDerivativeIpRequest
   * @return Promise<LicenseRegistryIsDerivativeIpResponse>
   */
  public async isDerivativeIp(
    request: LicenseRegistryIsDerivativeIpRequest,
  ): Promise<LicenseRegistryIsDerivativeIpResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "isDerivativeIp",
      args: [request.childIpId],
    });
  }

  /**
   * method isRegisteredLicenseTemplate for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsRegisteredLicenseTemplateRequest
   * @return Promise<LicenseRegistryIsRegisteredLicenseTemplateResponse>
   */
  public async isRegisteredLicenseTemplate(
    request: LicenseRegistryIsRegisteredLicenseTemplateRequest,
  ): Promise<LicenseRegistryIsRegisteredLicenseTemplateResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "isRegisteredLicenseTemplate",
      args: [request.licenseTemplate],
    });
  }

  /**
   * method licensingModule for contract LicenseRegistry
   *
   * @param request LicenseRegistryLicensingModuleRequest
   * @return Promise<LicenseRegistryLicensingModuleResponse>
   */
  public async licensingModule(): Promise<LicenseRegistryLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "licensingModule",
    });
  }

  /**
   * method proxiableUUID for contract LicenseRegistry
   *
   * @param request LicenseRegistryProxiableUuidRequest
   * @return Promise<LicenseRegistryProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<LicenseRegistryProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "proxiableUUID",
    });
  }

  /**
   * method verifyMintLicenseToken for contract LicenseRegistry
   *
   * @param request LicenseRegistryVerifyMintLicenseTokenRequest
   * @return Promise<LicenseRegistryVerifyMintLicenseTokenResponse>
   */
  public async verifyMintLicenseToken(
    request: LicenseRegistryVerifyMintLicenseTokenRequest,
  ): Promise<LicenseRegistryVerifyMintLicenseTokenResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "verifyMintLicenseToken",
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.isMintedByIpOwner,
      ],
    });
  }
}

/**
 * contract LicenseRegistry write method
 */
export class LicenseRegistryClient extends LicenseRegistryReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method attachLicenseTermsToIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryAttachLicenseTermsToIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async attachLicenseTermsToIp(
    request: LicenseRegistryAttachLicenseTermsToIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "attachLicenseTermsToIp",
      account: this.wallet.account,
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract LicenseRegistry
   *
   * @param request LicenseRegistryInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: LicenseRegistryInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.governance],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerDerivativeIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryRegisterDerivativeIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivativeIp(
    request: LicenseRegistryRegisterDerivativeIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "registerDerivativeIp",
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTemplate,
        request.licenseTermsIds,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerLicenseTemplate for contract LicenseRegistry
   *
   * @param request LicenseRegistryRegisterLicenseTemplateRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerLicenseTemplate(
    request: LicenseRegistryRegisterLicenseTemplateRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "registerLicenseTemplate",
      account: this.wallet.account,
      args: [request.licenseTemplate],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setDefaultLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetDefaultLicenseTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setDefaultLicenseTerms(
    request: LicenseRegistrySetDefaultLicenseTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setDefaultLicenseTerms",
      account: this.wallet.account,
      args: [request.newLicenseTemplate, request.newLicenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setDisputeModule for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetDisputeModuleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setDisputeModule(
    request: LicenseRegistrySetDisputeModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setDisputeModule",
      account: this.wallet.account,
      args: [request.newDisputeModule],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setExpireTime for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetExpireTimeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setExpireTime(
    request: LicenseRegistrySetExpireTimeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setExpireTime",
      account: this.wallet.account,
      args: [request.ipId, request.expireTime],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setGovernance for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: LicenseRegistrySetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setLicensingModule for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetLicensingModuleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setLicensingModule(
    request: LicenseRegistrySetLicensingModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setLicensingModule",
      account: this.wallet.account,
      args: [request.newLicensingModule],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMintingLicenseConfigForIp for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetMintingLicenseConfigForIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintingLicenseConfigForIp(
    request: LicenseRegistrySetMintingLicenseConfigForIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setMintingLicenseConfigForIp",
      account: this.wallet.account,
      args: [request.ipId, request.mintingLicenseConfig],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMintingLicenseConfigForLicense for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetMintingLicenseConfigForLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintingLicenseConfigForLicense(
    request: LicenseRegistrySetMintingLicenseConfigForLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setMintingLicenseConfigForLicense",
      account: this.wallet.account,
      args: [
        request.ipId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.mintingLicenseConfig,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract LicenseRegistry
   *
   * @param request LicenseRegistryUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: LicenseRegistryUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract LicensingModule =============================================================

/**
 * LicensingModuleLicenseTokensMintedEvent
 *
 * @param caller address
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param amount uint256
 * @param receiver address
 * @param startLicenseTokenId uint256
 */
export type LicensingModuleLicenseTokensMintedEvent = {
  caller: Address;
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  amount: bigint;
  receiver: Address;
  startLicenseTokenId: bigint;
};

/**
 * LicensingModuleAttachLicenseTermsRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicensingModuleAttachLicenseTermsRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicensingModuleMintLicenseTokensRequest
 *
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param amount uint256
 * @param receiver address
 * @param royaltyContext bytes
 */
export type LicensingModuleMintLicenseTokensRequest = {
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  amount: bigint;
  receiver: Address;
  royaltyContext: Hex;
};

/**
 * LicensingModuleRegisterDerivativeRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTermsIds uint256[]
 * @param licenseTemplate address
 * @param royaltyContext bytes
 */
export type LicensingModuleRegisterDerivativeRequest = {
  childIpId: Address;
  parentIpIds: readonly Address[];
  licenseTermsIds: readonly bigint[];
  licenseTemplate: Address;
  royaltyContext: Hex;
};

/**
 * LicensingModuleRegisterDerivativeWithLicenseTokensRequest
 *
 * @param childIpId address
 * @param licenseTokenIds uint256[]
 * @param royaltyContext bytes
 */
export type LicensingModuleRegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Address;
  licenseTokenIds: readonly bigint[];
  royaltyContext: Hex;
};

/**
 * contract LicensingModule event
 */
export class LicensingModuleEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(licensingModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event LicenseTokensMinted for contract LicensingModule
   */
  public watchLicenseTokensMintedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicensingModuleLicenseTokensMintedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "LicenseTokensMinted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTokensMinted for contract LicensingModule
   */
  public parseTxLicenseTokensMintedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicensingModuleLicenseTokensMintedEvent> {
    const targetLogs: Array<LicensingModuleLicenseTokensMintedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licensingModuleAbi,
          eventName: "LicenseTokensMinted",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTokensMinted") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract LicensingModule write method
 */
export class LicensingModuleClient extends LicensingModuleEventClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method attachLicenseTerms for contract LicensingModule
   *
   * @param request LicensingModuleAttachLicenseTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async attachLicenseTerms(
    request: LicensingModuleAttachLicenseTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "attachLicenseTerms",
      account: this.wallet.account,
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintLicenseTokens for contract LicensingModule
   *
   * @param request LicensingModuleMintLicenseTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicenseTokens(
    request: LicensingModuleMintLicenseTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "mintLicenseTokens",
      account: this.wallet.account,
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.amount,
        request.receiver,
        request.royaltyContext,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerDerivative for contract LicensingModule
   *
   * @param request LicensingModuleRegisterDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivative(
    request: LicensingModuleRegisterDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "registerDerivative",
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTermsIds,
        request.licenseTemplate,
        request.royaltyContext,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerDerivativeWithLicenseTokens for contract LicensingModule
   *
   * @param request LicensingModuleRegisterDerivativeWithLicenseTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivativeWithLicenseTokens(
    request: LicensingModuleRegisterDerivativeWithLicenseTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "registerDerivativeWithLicenseTokens",
      account: this.wallet.account,
      args: [request.childIpId, request.licenseTokenIds, request.royaltyContext],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract ModuleRegistry =============================================================

/**
 * ModuleRegistryIsRegisteredRequest
 *
 * @param moduleAddress address
 */
export type ModuleRegistryIsRegisteredRequest = {
  moduleAddress: Address;
};

export type ModuleRegistryIsRegisteredResponse = boolean;

/**
 * contract ModuleRegistry readonly method
 */
export class ModuleRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(moduleRegistryAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * method isRegistered for contract ModuleRegistry
   *
   * @param request ModuleRegistryIsRegisteredRequest
   * @return Promise<ModuleRegistryIsRegisteredResponse>
   */
  public async isRegistered(
    request: ModuleRegistryIsRegisteredRequest,
  ): Promise<ModuleRegistryIsRegisteredResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "isRegistered",
      args: [request.moduleAddress],
    });
  }
}

// Contract PILicenseTemplate =============================================================

/**
 * PiLicenseTemplateDerivativeApprovedEvent
 *
 * @param licenseTokenId uint256
 * @param ipId address
 * @param caller address
 * @param approved bool
 */
export type PiLicenseTemplateDerivativeApprovedEvent = {
  licenseTokenId: bigint;
  ipId: Address;
  caller: Address;
  approved: boolean;
};

/**
 * PiLicenseTemplateInitializedEvent
 *
 * @param version uint64
 */
export type PiLicenseTemplateInitializedEvent = {
  version: bigint;
};

/**
 * PiLicenseTemplateLicenseTermsRegisteredEvent
 *
 * @param licenseTermsId uint256
 * @param licenseTemplate address
 * @param licenseTerms bytes
 */
export type PiLicenseTemplateLicenseTermsRegisteredEvent = {
  licenseTermsId: bigint;
  licenseTemplate: Address;
  licenseTerms: Hex;
};

export type PiLicenseTemplateAccessControllerResponse = Address;

export type PiLicenseTemplateIpAccountRegistryResponse = Address;

export type PiLicenseTemplateLicenseNftResponse = Address;

export type PiLicenseTemplateLicenseRegistryResponse = Address;

export type PiLicenseTemplateRoyaltyModuleResponse = Address;

/**
 * PiLicenseTemplateExistsRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateExistsRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateExistsResponse = boolean;

/**
 * PiLicenseTemplateGetEarlierExpireTimeRequest
 *
 * @param licenseTermsIds uint256[]
 * @param start uint256
 */
export type PiLicenseTemplateGetEarlierExpireTimeRequest = {
  licenseTermsIds: readonly bigint[];
  start: bigint;
};

export type PiLicenseTemplateGetEarlierExpireTimeResponse = bigint;

/**
 * PiLicenseTemplateGetExpireTimeRequest
 *
 * @param licenseTermsId uint256
 * @param start uint256
 */
export type PiLicenseTemplateGetExpireTimeRequest = {
  licenseTermsId: bigint;
  start: bigint;
};

export type PiLicenseTemplateGetExpireTimeResponse = bigint;

/**
 * PiLicenseTemplateGetLicenseTermsIdRequest
 *
 * @param terms tuple
 */
export type PiLicenseTemplateGetLicenseTermsIdRequest = {
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    mintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCelling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCelling: bigint;
    currency: Address;
  };
};

/**
 * PiLicenseTemplateGetLicenseTermsIdResponse
 *
 * @param selectedLicenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsIdResponse = {
  selectedLicenseTermsId: bigint;
};

export type PiLicenseTemplateGetMetadataUriResponse = string;

/**
 * PiLicenseTemplateGetRoyaltyPolicyRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateGetRoyaltyPolicyRequest = {
  licenseTermsId: bigint;
};

/**
 * PiLicenseTemplateGetRoyaltyPolicyResponse
 *
 * @param royaltyPolicy address
 * @param royaltyData bytes
 * @param mintingFee uint256
 * @param currency address
 */
export type PiLicenseTemplateGetRoyaltyPolicyResponse = {
  royaltyPolicy: Address;
  royaltyData: Hex;
  mintingFee: bigint;
  currency: Address;
};

/**
 * PiLicenseTemplateIsDerivativeApprovedRequest
 *
 * @param licenseTokenId uint256
 * @param childIpId address
 */
export type PiLicenseTemplateIsDerivativeApprovedRequest = {
  licenseTokenId: bigint;
  childIpId: Address;
};

export type PiLicenseTemplateIsDerivativeApprovedResponse = boolean;

/**
 * PiLicenseTemplateIsLicenseTransferableRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateIsLicenseTransferableRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateIsLicenseTransferableResponse = boolean;

export type PiLicenseTemplateNameResponse = string;

/**
 * PiLicenseTemplateSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type PiLicenseTemplateSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type PiLicenseTemplateSupportsInterfaceResponse = boolean;

/**
 * PiLicenseTemplateToJsonRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateToJsonRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateToJsonResponse = string;

export type PiLicenseTemplateTotalRegisteredLicenseTermsResponse = bigint;

/**
 * PiLicenseTemplateVerifyCompatibleLicensesRequest
 *
 * @param licenseTermsIds uint256[]
 */
export type PiLicenseTemplateVerifyCompatibleLicensesRequest = {
  licenseTermsIds: readonly bigint[];
};

export type PiLicenseTemplateVerifyCompatibleLicensesResponse = boolean;

/**
 * PiLicenseTemplateInitializeRequest
 *
 * @param name string
 * @param metadataURI string
 */
export type PiLicenseTemplateInitializeRequest = {
  name: string;
  metadataURI: string;
};

/**
 * PiLicenseTemplateRegisterLicenseTermsRequest
 *
 * @param terms tuple
 */
export type PiLicenseTemplateRegisterLicenseTermsRequest = {
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    mintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCelling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCelling: bigint;
    currency: Address;
  };
};

/**
 * PiLicenseTemplateSetApprovalRequest
 *
 * @param licenseTokenId uint256
 * @param childIpId address
 * @param approved bool
 */
export type PiLicenseTemplateSetApprovalRequest = {
  licenseTokenId: bigint;
  childIpId: Address;
  approved: boolean;
};

/**
 * PiLicenseTemplateVerifyMintLicenseTokenRequest
 *
 * @param 0 uint256
 * @param 1 address
 * @param 2 address
 * @param 3 uint256
 */
export type PiLicenseTemplateVerifyMintLicenseTokenRequest = readonly [
  bigint,
  Address,
  Address,
  bigint,
];

/**
 * PiLicenseTemplateVerifyRegisterDerivativeRequest
 *
 * @param childIpId address
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param licensee address
 */
export type PiLicenseTemplateVerifyRegisterDerivativeRequest = {
  childIpId: Address;
  parentIpId: Address;
  licenseTermsId: bigint;
  licensee: Address;
};

/**
 * PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTermsIds uint256[]
 * @param childIpOwner address
 */
export type PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest = {
  childIpId: Address;
  parentIpIds: readonly Address[];
  licenseTermsIds: readonly bigint[];
  childIpOwner: Address;
};

/**
 * contract PILicenseTemplate event
 */
export class PiLicenseTemplateEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(piLicenseTemplateAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event DerivativeApproved for contract PILicenseTemplate
   */
  public watchDerivativeApprovedEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateDerivativeApprovedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "DerivativeApproved",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DerivativeApproved for contract PILicenseTemplate
   */
  public parseTxDerivativeApprovedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateDerivativeApprovedEvent> {
    const targetLogs: Array<PiLicenseTemplateDerivativeApprovedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "DerivativeApproved",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DerivativeApproved") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract PILicenseTemplate
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract PILicenseTemplate
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateInitializedEvent> {
    const targetLogs: Array<PiLicenseTemplateInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicenseTermsRegistered for contract PILicenseTemplate
   */
  public watchLicenseTermsRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateLicenseTermsRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "LicenseTermsRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTermsRegistered for contract PILicenseTemplate
   */
  public parseTxLicenseTermsRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateLicenseTermsRegisteredEvent> {
    const targetLogs: Array<PiLicenseTemplateLicenseTermsRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "LicenseTermsRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTermsRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract PILicenseTemplate readonly method
 */
export class PiLicenseTemplateReadOnlyClient extends PiLicenseTemplateEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method ACCESS_CONTROLLER for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateAccessControllerRequest
   * @return Promise<PiLicenseTemplateAccessControllerResponse>
   */
  public async accessController(): Promise<PiLicenseTemplateAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIpAccountRegistryRequest
   * @return Promise<PiLicenseTemplateIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<PiLicenseTemplateIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method LICENSE_NFT for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateLicenseNftRequest
   * @return Promise<PiLicenseTemplateLicenseNftResponse>
   */
  public async licenseNft(): Promise<PiLicenseTemplateLicenseNftResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "LICENSE_NFT",
    });
  }

  /**
   * method LICENSE_REGISTRY for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateLicenseRegistryRequest
   * @return Promise<PiLicenseTemplateLicenseRegistryResponse>
   */
  public async licenseRegistry(): Promise<PiLicenseTemplateLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "LICENSE_REGISTRY",
    });
  }

  /**
   * method ROYALTY_MODULE for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateRoyaltyModuleRequest
   * @return Promise<PiLicenseTemplateRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<PiLicenseTemplateRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method exists for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateExistsRequest
   * @return Promise<PiLicenseTemplateExistsResponse>
   */
  public async exists(
    request: PiLicenseTemplateExistsRequest,
  ): Promise<PiLicenseTemplateExistsResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "exists",
      args: [request.licenseTermsId],
    });
  }

  /**
   * method getEarlierExpireTime for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetEarlierExpireTimeRequest
   * @return Promise<PiLicenseTemplateGetEarlierExpireTimeResponse>
   */
  public async getEarlierExpireTime(
    request: PiLicenseTemplateGetEarlierExpireTimeRequest,
  ): Promise<PiLicenseTemplateGetEarlierExpireTimeResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "getEarlierExpireTime",
      args: [request.licenseTermsIds, request.start],
    });
  }

  /**
   * method getExpireTime for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetExpireTimeRequest
   * @return Promise<PiLicenseTemplateGetExpireTimeResponse>
   */
  public async getExpireTime(
    request: PiLicenseTemplateGetExpireTimeRequest,
  ): Promise<PiLicenseTemplateGetExpireTimeResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "getExpireTime",
      args: [request.licenseTermsId, request.start],
    });
  }

  /**
   * method getLicenseTermsId for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetLicenseTermsIdRequest
   * @return Promise<PiLicenseTemplateGetLicenseTermsIdResponse>
   */
  public async getLicenseTermsId(
    request: PiLicenseTemplateGetLicenseTermsIdRequest,
  ): Promise<PiLicenseTemplateGetLicenseTermsIdResponse> {
    const result = await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "getLicenseTermsId",
      args: [request.terms],
    });
    return {
      selectedLicenseTermsId: result,
    };
  }

  /**
   * method getMetadataURI for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetMetadataUriRequest
   * @return Promise<PiLicenseTemplateGetMetadataUriResponse>
   */
  public async getMetadataUri(): Promise<PiLicenseTemplateGetMetadataUriResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "getMetadataURI",
    });
  }

  /**
   * method getRoyaltyPolicy for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetRoyaltyPolicyRequest
   * @return Promise<PiLicenseTemplateGetRoyaltyPolicyResponse>
   */
  public async getRoyaltyPolicy(
    request: PiLicenseTemplateGetRoyaltyPolicyRequest,
  ): Promise<PiLicenseTemplateGetRoyaltyPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "getRoyaltyPolicy",
      args: [request.licenseTermsId],
    });
    return {
      royaltyPolicy: result[0],
      royaltyData: result[1],
      mintingFee: result[2],
      currency: result[3],
    };
  }

  /**
   * method isDerivativeApproved for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIsDerivativeApprovedRequest
   * @return Promise<PiLicenseTemplateIsDerivativeApprovedResponse>
   */
  public async isDerivativeApproved(
    request: PiLicenseTemplateIsDerivativeApprovedRequest,
  ): Promise<PiLicenseTemplateIsDerivativeApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "isDerivativeApproved",
      args: [request.licenseTokenId, request.childIpId],
    });
  }

  /**
   * method isLicenseTransferable for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIsLicenseTransferableRequest
   * @return Promise<PiLicenseTemplateIsLicenseTransferableResponse>
   */
  public async isLicenseTransferable(
    request: PiLicenseTemplateIsLicenseTransferableRequest,
  ): Promise<PiLicenseTemplateIsLicenseTransferableResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "isLicenseTransferable",
      args: [request.licenseTermsId],
    });
  }

  /**
   * method name for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateNameRequest
   * @return Promise<PiLicenseTemplateNameResponse>
   */
  public async name(): Promise<PiLicenseTemplateNameResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method supportsInterface for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateSupportsInterfaceRequest
   * @return Promise<PiLicenseTemplateSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: PiLicenseTemplateSupportsInterfaceRequest,
  ): Promise<PiLicenseTemplateSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }

  /**
   * method toJson for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateToJsonRequest
   * @return Promise<PiLicenseTemplateToJsonResponse>
   */
  public async toJson(
    request: PiLicenseTemplateToJsonRequest,
  ): Promise<PiLicenseTemplateToJsonResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "toJson",
      args: [request.licenseTermsId],
    });
  }

  /**
   * method totalRegisteredLicenseTerms for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateTotalRegisteredLicenseTermsRequest
   * @return Promise<PiLicenseTemplateTotalRegisteredLicenseTermsResponse>
   */
  public async totalRegisteredLicenseTerms(): Promise<PiLicenseTemplateTotalRegisteredLicenseTermsResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "totalRegisteredLicenseTerms",
    });
  }

  /**
   * method verifyCompatibleLicenses for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyCompatibleLicensesRequest
   * @return Promise<PiLicenseTemplateVerifyCompatibleLicensesResponse>
   */
  public async verifyCompatibleLicenses(
    request: PiLicenseTemplateVerifyCompatibleLicensesRequest,
  ): Promise<PiLicenseTemplateVerifyCompatibleLicensesResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "verifyCompatibleLicenses",
      args: [request.licenseTermsIds],
    });
  }
}

/**
 * contract PILicenseTemplate write method
 */
export class PiLicenseTemplateClient extends PiLicenseTemplateReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method initialize for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: PiLicenseTemplateInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.name, request.metadataURI],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerLicenseTerms for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateRegisterLicenseTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerLicenseTerms(
    request: PiLicenseTemplateRegisterLicenseTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "registerLicenseTerms",
      account: this.wallet.account,
      args: [request.terms],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setApproval for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateSetApprovalRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApproval(
    request: PiLicenseTemplateSetApprovalRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "setApproval",
      account: this.wallet.account,
      args: [request.licenseTokenId, request.childIpId, request.approved],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method verifyMintLicenseToken for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyMintLicenseTokenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyMintLicenseToken(
    request: PiLicenseTemplateVerifyMintLicenseTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "verifyMintLicenseToken",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3]],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method verifyRegisterDerivative for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyRegisterDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyRegisterDerivative(
    request: PiLicenseTemplateVerifyRegisterDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "verifyRegisterDerivative",
      account: this.wallet.account,
      args: [request.childIpId, request.parentIpId, request.licenseTermsId, request.licensee],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method verifyRegisterDerivativeForAllParents for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyRegisterDerivativeForAllParents(
    request: PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "verifyRegisterDerivativeForAllParents",
      account: this.wallet.account,
      args: [request.childIpId, request.parentIpIds, request.licenseTermsIds, request.childIpOwner],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract RoyaltyModule =============================================================

/**
 * RoyaltyModulePayRoyaltyOnBehalfRequest
 *
 * @param receiverIpId address
 * @param payerIpId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyModulePayRoyaltyOnBehalfRequest = {
  receiverIpId: Address;
  payerIpId: Address;
  token: Address;
  amount: bigint;
};

/**
 * contract RoyaltyModule write method
 */
export class RoyaltyModuleClient {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(royaltyModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method payRoyaltyOnBehalf for contract RoyaltyModule
   *
   * @param request RoyaltyModulePayRoyaltyOnBehalfRequest
   * @return Promise<WriteContractReturnType>
   */
  public async payRoyaltyOnBehalf(
    request: RoyaltyModulePayRoyaltyOnBehalfRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "payRoyaltyOnBehalf",
      account: this.wallet.account,
      args: [request.receiverIpId, request.payerIpId, request.token, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}

// Contract RoyaltyPolicyLAP =============================================================

/**
 * RoyaltyPolicyLapGetRoyaltyDataRequest
 *
 * @param ipId address
 */
export type RoyaltyPolicyLapGetRoyaltyDataRequest = {
  ipId: Address;
};

/**
 * RoyaltyPolicyLapGetRoyaltyDataResponse
 *
 * @param 0 bool
 * @param 1 address
 * @param 2 uint32
 * @param 3 address[]
 * @param 4 uint32[]
 */
export type RoyaltyPolicyLapGetRoyaltyDataResponse = readonly [
  boolean,
  Address,
  number,
  readonly Address[],
  readonly number[],
];

/**
 * RoyaltyPolicyLapOnRoyaltyPaymentRequest
 *
 * @param caller address
 * @param ipId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyPolicyLapOnRoyaltyPaymentRequest = {
  caller: Address;
  ipId: Address;
  token: Address;
  amount: bigint;
};

/**
 * contract RoyaltyPolicyLAP readonly method
 */
export class RoyaltyPolicyLapReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(royaltyPolicyLapAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * method getRoyaltyData for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapGetRoyaltyDataRequest
   * @return Promise<RoyaltyPolicyLapGetRoyaltyDataResponse>
   */
  public async getRoyaltyData(
    request: RoyaltyPolicyLapGetRoyaltyDataRequest,
  ): Promise<RoyaltyPolicyLapGetRoyaltyDataResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "getRoyaltyData",
      args: [request.ipId],
    });
  }
}

/**
 * contract RoyaltyPolicyLAP write method
 */
export class RoyaltyPolicyLapClient extends RoyaltyPolicyLapReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method onRoyaltyPayment for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnRoyaltyPaymentRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onRoyaltyPayment(
    request: RoyaltyPolicyLapOnRoyaltyPaymentRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "onRoyaltyPayment",
      account: this.wallet.account,
      args: [request.caller, request.ipId, request.token, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }
}
