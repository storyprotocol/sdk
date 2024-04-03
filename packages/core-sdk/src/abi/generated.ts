import {
  Address,
  PublicClient,
  WalletClient,
  WatchContractEventReturnType,
  WriteContractReturnType,
  Hex,
} from "viem";
import { AbiTypeToPrimitiveType, AbiParameterToPrimitiveType } from "abitype";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accessControllerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
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
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  { type: "error", inputs: [], name: "Governance__ProtocolPaused" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
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
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MODULE_REGISTRY",
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
    ],
    name: "initialize",
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
] as const;

export const accessControllerAddress = "0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3" as const;

export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AncestorsVaultLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ancestorsVaultLapAbi = [
  {
    type: "constructor",
    inputs: [{ name: "royaltyPolicyLAP", internalType: "address", type: "address" }],
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
  { type: "error", inputs: [], name: "AncestorsVaultLAP__AlreadyClaimed" },
  {
    type: "error",
    inputs: [],
    name: "AncestorsVaultLAP__ClaimerNotAnAncestor",
  },
  { type: "error", inputs: [], name: "AncestorsVaultLAP__ERC20BalanceNotZero" },
  { type: "error", inputs: [], name: "AncestorsVaultLAP__ETHBalanceNotZero" },
  {
    type: "error",
    inputs: [],
    name: "AncestorsVaultLAP__InvalidAncestorsHash",
  },
  { type: "error", inputs: [], name: "AncestorsVaultLAP__InvalidClaimer" },
  { type: "error", inputs: [], name: "AncestorsVaultLAP__TransferFailed" },
  {
    type: "error",
    inputs: [],
    name: "AncestorsVaultLAP__ZeroRoyaltyPolicyLAP",
  },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
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
        name: "claimerIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "withdrawETH",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      {
        name: "tokens",
        internalType: "contract ERC20[]",
        type: "address[]",
        indexed: false,
      },
    ],
    name: "Claimed",
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
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "claimerIpId", internalType: "address", type: "address" },
      { name: "ancestors", internalType: "address[]", type: "address[]" },
      {
        name: "ancestorsRoyalties",
        internalType: "uint32[]",
        type: "uint32[]",
      },
      { name: "withdrawETH", internalType: "bool", type: "bool" },
      { name: "tokens", internalType: "contract ERC20[]", type: "address[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "claimerIpId", internalType: "address", type: "address" },
    ],
    name: "isClaimed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    stateMutability: "nonpayable",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const ancestorsVaultLapAddress = "0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c" as const;

export const ancestorsVaultLapConfig = {
  address: ancestorsVaultLapAddress,
  abi: ancestorsVaultLapAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbitrationPolicySP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const arbitrationPolicySpAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_disputeModule", internalType: "address", type: "address" },
      { name: "_paymentToken", internalType: "address", type: "address" },
      { name: "_arbitrationPrice", internalType: "uint256", type: "uint256" },
      { name: "_governable", internalType: "address", type: "address" },
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
  { type: "error", inputs: [], name: "ArbitrationPolicySP__NotDisputeModule" },
  { type: "error", inputs: [], name: "ArbitrationPolicySP__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "ArbitrationPolicySP__ZeroPaymentToken" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "GovernanceWithdrew",
  },
  {
    type: "function",
    inputs: [],
    name: "ARBITRATION_PRICE",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "PAYMENT_TOKEN",
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governanceWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "disputeId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "onDisputeCancel",
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
    name: "onDisputeJudgement",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "onRaiseDispute",
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
] as const;

export const arbitrationPolicySpAddress = "0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3" as const;

export const arbitrationPolicySpConfig = {
  address: arbitrationPolicySpAddress,
  abi: arbitrationPolicySpAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const disputeModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_controller", internalType: "address", type: "address" },
      { name: "_assetRegistry", internalType: "address", type: "address" },
      { name: "_governance", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
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
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [{ name: "str", internalType: "string", type: "string" }],
    name: "StringTooLong",
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
      { name: "tag", internalType: "bytes32", type: "bytes32", indexed: false },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "TagWhitelistUpdated",
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "arbitrationPolicies",
    outputs: [{ name: "arbitrationPolicy", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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

export const disputeModuleAddress = "0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb" as const;

export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Governance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const governanceAbi = [
  {
    type: "constructor",
    inputs: [{ name: "admin", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "AccessControlBadConfirmation" },
  {
    type: "error",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "neededRole", internalType: "bytes32", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
  },
  {
    type: "error",
    inputs: [],
    name: "Governance__NewStateIsTheSameWithOldState",
  },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "previousAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RoleAdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleGranted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleRevoked",
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
        name: "prevState",
        internalType: "enum GovernanceLib.ProtocolState",
        type: "uint8",
        indexed: false,
      },
      {
        name: "newState",
        internalType: "enum GovernanceLib.ProtocolState",
        type: "uint8",
        indexed: false,
      },
      {
        name: "timestamp",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StateSet",
  },
  {
    type: "function",
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getState",
    outputs: [
      {
        name: "",
        internalType: "enum GovernanceLib.ProtocolState",
        type: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "callerConfirmation", internalType: "address", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newState",
        internalType: "enum GovernanceLib.ProtocolState",
        type: "uint8",
      },
    ],
    name: "setState",
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
] as const;

export const governanceAddress = "0x6D8070F7726769bEd136bc7007B3deA695f7047A" as const;

export const governanceConfig = {
  address: governanceAddress,
  abi: governanceAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    inputs: [],
    name: "state",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "pure",
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
  { type: "receive", stateMutability: "payable" },
] as const;

export const ipAccountImplAddress = "0xddcBD4309f0545fa8cC99137bC621620e017bdBe" as const;

export const ipAccountImplConfig = {
  address: ipAccountImplAddress,
  abi: ipAccountImplAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAccountRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "erc6551Registry", internalType: "address", type: "address" },
      { name: "ipAccountImpl", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "IPAccountRegistry_InvalidIpAccountImpl" },
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
    name: "getIPAccountImpl",
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
    name: "registerIpAccount",
    outputs: [{ name: "ipAccountAddress", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
] as const;

export const ipAccountRegistryAddress = "0x16129393444e5BEb435501Dea41D5ECfB10b76F0" as const;

export const ipAccountRegistryConfig = {
  address: ipAccountRegistryAddress,
  abi: ipAccountRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAssetRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "erc6551Registry", internalType: "address", type: "address" },
      { name: "ipAccountImpl", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
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
  { type: "error", inputs: [], name: "IPAssetRegistry__InvalidAccount" },
  { type: "error", inputs: [], name: "IPAssetRegistry__NotYetRegistered" },
  {
    type: "error",
    inputs: [],
    name: "IPAssetRegistry__RegistrantUnauthorized",
  },
  { type: "error", inputs: [], name: "IPAssetRegistry__Unauthorized" },
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
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
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
      {
        name: "resolver",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "provider",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "metadata",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "IPRegistered",
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
        name: "resolver",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "IPResolverSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "metadataProvider",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "metadata",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "MetadataSet",
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
    name: "MODULE_REGISTRY",
    outputs: [{ name: "", internalType: "contract IModuleRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "REGISTRATION_MODULE",
    outputs: [
      {
        name: "",
        internalType: "contract IRegistrationModule",
        type: "address",
      },
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
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "metadata",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "metadataProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metadataProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "resolverAddr", internalType: "address", type: "address" },
      { name: "createAccount", internalType: "bool", type: "bool" },
      { name: "metadata_", internalType: "bytes", type: "bytes" },
    ],
    name: "register",
    outputs: [{ name: "ipId_", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "resolverAddr", internalType: "address", type: "address" },
      { name: "createAccount", internalType: "bool", type: "bool" },
      { name: "metadata_", internalType: "bytes", type: "bytes" },
    ],
    name: "register",
    outputs: [{ name: "ipId_", internalType: "address", type: "address" }],
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
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "resolver",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
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
      { name: "id", internalType: "address", type: "address" },
      { name: "provider", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "setMetadata",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newMetadataProvider", internalType: "address", type: "address" }],
    name: "setMetadataProvider",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "registrationModule", internalType: "address", type: "address" }],
    name: "setRegistrationModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "id", internalType: "address", type: "address" },
      { name: "resolverAddr", internalType: "address", type: "address" },
    ],
    name: "setResolver",
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

export const ipAssetRegistryAddress = "0xAAe9e83F8cE8832270AF033c609e233686f0E0eB" as const;

export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRenderer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAssetRendererAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "assetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "StringsInsufficientHexLength",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract LicenseRegistry", type: "address" }],
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "description",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "hash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "registrant",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "registrationDate",
    outputs: [{ name: "", internalType: "uint64", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "uri",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

export const ipAssetRendererAddress = "0x39cCE13916e7bfdeFa462D360d551aEcc6D82311" as const;

export const ipAssetRendererConfig = {
  address: ipAssetRendererAddress,
  abi: ipAssetRendererAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPMetadataProvider
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipMetadataProviderAbi = [
  {
    type: "constructor",
    inputs: [{ name: "ipAssetRegistry", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "MetadataProvider__IPAssetOwnerInvalid" },
  {
    type: "error",
    inputs: [],
    name: "MetadataProvider__MetadataNotCompatible",
  },
  { type: "error", inputs: [], name: "MetadataProvider__RegistrantInvalid" },
  { type: "error", inputs: [], name: "MetadataProvider__Unauthorized" },
  {
    type: "error",
    inputs: [],
    name: "MetadataProvider__UpgradeProviderInvalid",
  },
  { type: "error", inputs: [], name: "MetadataProvider__UpgradeUnavailable" },
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
        name: "metadata",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "MetadataSet",
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getMetadata",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "hash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "metadata",
    outputs: [
      {
        name: "",
        internalType: "struct IP.MetadataV1",
        type: "tuple",
        components: [
          { name: "name", internalType: "string", type: "string" },
          { name: "hash", internalType: "bytes32", type: "bytes32" },
          { name: "registrationDate", internalType: "uint64", type: "uint64" },
          { name: "registrant", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "registrant",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "registrationDate",
    outputs: [{ name: "", internalType: "uint64", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "metadata", internalType: "bytes", type: "bytes" },
    ],
    name: "setMetadata",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "provider", internalType: "address", type: "address" }],
    name: "setUpgradeProvider",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address payable", type: "address" },
      { name: "metadata", internalType: "bytes", type: "bytes" },
    ],
    name: "upgrade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "upgradeProvider",
    outputs: [{ name: "", internalType: "contract IMetadataProvider", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "uri",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

export const ipMetadataProviderAddress = "0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB" as const;

export const ipMetadataProviderConfig = {
  address: ipMetadataProviderAddress,
  abi: ipMetadataProviderAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPResolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipResolverAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "key", internalType: "string", type: "string", indexed: true },
      { name: "value", internalType: "string", type: "string", indexed: false },
    ],
    name: "KeyValueSet",
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
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "key", internalType: "string", type: "string" },
      { name: "val", internalType: "string", type: "string" },
    ],
    name: "setValue",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "key", internalType: "string", type: "string" },
    ],
    name: "value",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

export const ipResolverAddress = "0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78" as const;

export const ipResolverConfig = {
  address: ipResolverAddress,
  abi: ipResolverAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const licenseRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "governance", internalType: "address", type: "address" },
      { name: "url", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC1155InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC1155InvalidApprover",
  },
  {
    type: "error",
    inputs: [
      { name: "idsLength", internalType: "uint256", type: "uint256" },
      { name: "valuesLength", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC1155InvalidArrayLength",
  },
  {
    type: "error",
    inputs: [{ name: "operator", internalType: "address", type: "address" }],
    name: "ERC1155InvalidOperator",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC1155InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC1155InvalidSender",
  },
  {
    type: "error",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "ERC1155MissingApprovalForAll",
  },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
  {
    type: "error",
    inputs: [],
    name: "LicenseRegistry__CallerNotLicensingModule",
  },
  { type: "error", inputs: [], name: "LicenseRegistry__NotTransferable" },
  { type: "error", inputs: [], name: "LicenseRegistry__RevokedLicense" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroLicensingModule" },
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
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_fromTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_toTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "BatchMetadataUpdate",
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
        name: "creator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseId",
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
        name: "licenseData",
        internalType: "struct Licensing.License",
        type: "tuple",
        components: [
          { name: "policyId", internalType: "uint256", type: "uint256" },
          { name: "licensorIpId", internalType: "address", type: "address" },
          { name: "transferable", internalType: "bool", type: "bool" },
        ],
        indexed: false,
      },
    ],
    name: "LicenseMinted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "ids",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "values",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "TransferBatch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "id", internalType: "uint256", type: "uint256", indexed: false },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TransferSingle",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "value", internalType: "string", type: "string", indexed: false },
      { name: "id", internalType: "uint256", type: "uint256", indexed: true },
    ],
    name: "URI",
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
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "id", internalType: "uint256", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "accounts", internalType: "address[]", type: "address[]" },
      { name: "ids", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "balanceOfBatch",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "holder", internalType: "address", type: "address" },
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "burnLicenses",
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "imageUrl",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    name: "isLicenseRevoked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "holder", internalType: "address", type: "address" },
    ],
    name: "isLicensee",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    name: "license",
    outputs: [
      {
        name: "",
        internalType: "struct Licensing.License",
        type: "tuple",
        components: [
          { name: "policyId", internalType: "uint256", type: "uint256" },
          { name: "licensorIpId", internalType: "address", type: "address" },
          { name: "transferable", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    name: "licensorIpId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "policyId", internalType: "uint256", type: "uint256" },
      { name: "licensorIpId_", internalType: "address", type: "address" },
      { name: "transferable", internalType: "bool", type: "bool" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mintLicense",
    outputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "mintedLicenses",
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
    inputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    name: "policyIdForLicense",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "ids", internalType: "uint256[]", type: "uint256[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeBatchTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "id", internalType: "uint256", type: "uint256" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
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
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "url", internalType: "string", type: "string" }],
    name: "setLicensingImageUrl",
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
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    inputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    name: "uri",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

export const licenseRegistryAddress = "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba" as const;

export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicensingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const licensingModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "registry", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
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
    inputs: [],
    name: "LicensingModule__CallerNotLicensorAndPolicyNotSet",
  },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__DerivativesCannotAddPolicy",
  },
  { type: "error", inputs: [], name: "LicensingModule__DisputedIpId" },
  { type: "error", inputs: [], name: "LicensingModule__EmptyLicenseUrl" },
  { type: "error", inputs: [], name: "LicensingModule__FrameworkNotFound" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__IncompatibleLicensorCommercialPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__InvalidPolicyFramework",
  },
  { type: "error", inputs: [], name: "LicensingModule__LicensorNotRegistered" },
  { type: "error", inputs: [], name: "LicensingModule__LinkParentParamFailed" },
  { type: "error", inputs: [], name: "LicensingModule__LinkingRevokedLicense" },
  { type: "error", inputs: [], name: "LicensingModule__MintAmountZero" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__MintLicenseParamFailed",
  },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__MintingFeeTokenNotWhitelisted",
  },
  { type: "error", inputs: [], name: "LicensingModule__NotLicensee" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__ParentIdEqualThanChild",
  },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__PolicyAlreadySetForIpId",
  },
  { type: "error", inputs: [], name: "LicensingModule__PolicyNotFound" },
  { type: "error", inputs: [], name: "LicensingModule__ReceiverZeroAddress" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__RegisterPolicyFrameworkMismatch",
  },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__RoyaltyPolicyNotWhitelisted",
  },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
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
        name: "parentIpIds",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
    ],
    name: "IpIdLinkedToParents",
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
        name: "policyId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "index",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "isInherited",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "PolicyAddedToIpId",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "framework",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "name", internalType: "string", type: "string", indexed: false },
      {
        name: "licenseTextUrl",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "PolicyFrameworkRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "policyId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "policyFrameworkManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "frameworkData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
      {
        name: "royaltyPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "royaltyData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
      {
        name: "mintingFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "mintingFeeToken",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "PolicyRegistered",
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
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "polId", internalType: "uint256", type: "uint256" },
    ],
    name: "addPolicyToIp",
    outputs: [{ name: "indexOnIpId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pol",
        internalType: "struct Licensing.Policy",
        type: "tuple",
        components: [
          { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
          { name: "policyFramework", internalType: "address", type: "address" },
          { name: "frameworkData", internalType: "bytes", type: "bytes" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "royaltyData", internalType: "bytes", type: "bytes" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "mintingFeeToken", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "getPolicyId",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "policyFramework", internalType: "address", type: "address" }],
    name: "isFrameworkRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isParent",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "isPolicyDefined",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "policyId", internalType: "uint256", type: "uint256" },
    ],
    name: "isPolicyIdSetForIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "policyId", internalType: "uint256", type: "uint256" },
    ],
    name: "isPolicyInherited",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "linkIpToParents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "policyId", internalType: "uint256", type: "uint256" },
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "mintLicense",
    outputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "parentIpIds",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "policy",
    outputs: [
      {
        name: "pol",
        internalType: "struct Licensing.Policy",
        type: "tuple",
        components: [
          { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
          { name: "policyFramework", internalType: "address", type: "address" },
          { name: "frameworkData", internalType: "bytes", type: "bytes" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "royaltyData", internalType: "bytes", type: "bytes" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "mintingFeeToken", internalType: "address", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "framework", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "policyAggregatorData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "policyForIpAtIndex",
    outputs: [
      {
        name: "",
        internalType: "struct Licensing.Policy",
        type: "tuple",
        components: [
          { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
          { name: "policyFramework", internalType: "address", type: "address" },
          { name: "frameworkData", internalType: "bytes", type: "bytes" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "royaltyData", internalType: "bytes", type: "bytes" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "mintingFeeToken", internalType: "address", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "policyIdForIpAtIndex",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "policyIdsForIp",
    outputs: [{ name: "policyIds", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "policyId", internalType: "uint256", type: "uint256" },
    ],
    name: "policyStatus",
    outputs: [
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "active", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pol",
        internalType: "struct Licensing.Policy",
        type: "tuple",
        components: [
          { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
          { name: "policyFramework", internalType: "address", type: "address" },
          { name: "frameworkData", internalType: "bytes", type: "bytes" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "royaltyData", internalType: "bytes", type: "bytes" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "mintingFeeToken", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "registerPolicy",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "manager", internalType: "address", type: "address" }],
    name: "registerPolicyFrameworkManager",
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "totalParentsForIpId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalPolicies",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "totalPoliciesForIp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const licensingModuleAddress = "0x2A88056985814dcBb72aFA50B95893359B6262f5" as const;

export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockErc20Abi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
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
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
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
      { name: "from", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
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
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
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
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
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
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export const mockErc20Address = "0x3271778AdE44EfeC9e11b7160827921b6d614AF1" as const;

export const mockErc20Config = {
  address: mockErc20Address,
  abi: mockErc20Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockErc721Abi = [
  {
    type: "constructor",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "ERC721IncorrectOwner",
  },
  {
    type: "error",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC721InsufficientApproval",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC721InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "operator", internalType: "address", type: "address" }],
    name: "ERC721InvalidOperator",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "ERC721InvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC721InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC721InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ERC721NonexistentToken",
  },
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
        name: "approved",
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
    ],
    name: "Approval",
  },
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
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "mint",
    outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "mintId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
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
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const mockErc721Address = "0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f" as const;

export const mockErc721Config = {
  address: mockErc721Address,
  abi: mockErc721Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockTokenGatedHook
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockTokenGatedHookAbi = [
  {
    type: "function",
    inputs: [],
    name: "name",
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
    inputs: [{ name: "configData", internalType: "bytes", type: "bytes" }],
    name: "validateConfig",
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "verify",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const mockTokenGatedHookAddress = "0x008B5D8Db85100E143729453784e9F077B2279fA" as const;

export const mockTokenGatedHookConfig = {
  address: mockTokenGatedHookAddress,
  abi: mockTokenGatedHookAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ModuleRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const moduleRegistryAbi = [
  {
    type: "constructor",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
] as const;

export const moduleRegistryAddress = "0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d" as const;

export const moduleRegistryConfig = {
  address: moduleRegistryAddress,
  abi: moduleRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PILPolicyFrameworkManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pilPolicyFrameworkManagerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "licensing", internalType: "address", type: "address" },
      { name: "name_", internalType: "string", type: "string" },
      { name: "licenseUrl_", internalType: "string", type: "string" },
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
    inputs: [],
    name: "LicensingModuleAware__CallerNotLicensingModule",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialDisabled_CantAddCommercializers",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialDisabled_CantAddMintingFee",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialDisabled_CantAddMintingFeeToken",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialDisabled_CantAddRevShare",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialDisabled_CantAddRoyaltyPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialEnabled_RoyaltyPolicyRequired",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__CommercialValueMismatch",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__DerivativesDisabled_CantAddApproval",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__DerivativesDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__DerivativesDisabled_CantAddReciprocal",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__ReciprocalButDifferentPolicyIds",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__ReciprocalValueMismatch",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__RightsNotFound",
  },
  {
    type: "error",
    inputs: [],
    name: "PILPolicyFrameworkManager__StringArrayMismatch",
  },
  {
    type: "error",
    inputs: [{ name: "commercializer", internalType: "address", type: "address" }],
    name: "PolicyFrameworkManager__CommercializerCheckerDoesNotSupportHook",
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
        name: "licenseId",
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
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getAggregator",
    outputs: [
      {
        name: "rights",
        internalType: "struct PILAggregator",
        type: "tuple",
        components: [
          { name: "commercial", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "lastPolicyId", internalType: "uint256", type: "uint256" },
          { name: "territoriesAcc", internalType: "bytes32", type: "bytes32" },
          {
            name: "distributionChannelsAcc",
            internalType: "bytes32",
            type: "bytes32",
          },
          {
            name: "contentRestrictionsAcc",
            internalType: "bytes32",
            type: "bytes32",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "getPILPolicy",
    outputs: [
      {
        name: "policy",
        internalType: "struct PILPolicy",
        type: "tuple",
        components: [
          { name: "attribution", internalType: "bool", type: "bool" },
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
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "territories", internalType: "string[]", type: "string[]" },
          {
            name: "distributionChannels",
            internalType: "string[]",
            type: "string[]",
          },
          {
            name: "contentRestrictions",
            internalType: "string[]",
            type: "string[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isDerivativeApproved",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "licenseTextUrl",
    outputs: [{ name: "", internalType: "string", type: "string" }],
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
    inputs: [{ name: "policyData", internalType: "bytes", type: "bytes" }],
    name: "policyToJson",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "aggregator", internalType: "bytes", type: "bytes" },
      { name: "policyId", internalType: "uint256", type: "uint256" },
      { name: "policy", internalType: "bytes", type: "bytes" },
    ],
    name: "processInheritedPolicies",
    outputs: [
      { name: "changedAgg", internalType: "bool", type: "bool" },
      { name: "newAggregator", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct RegisterPILPolicyParams",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "mintingFeeToken", internalType: "address", type: "address" },
          {
            name: "policy",
            internalType: "struct PILPolicy",
            type: "tuple",
            components: [
              { name: "attribution", internalType: "bool", type: "bool" },
              { name: "commercialUse", internalType: "bool", type: "bool" },
              {
                name: "commercialAttribution",
                internalType: "bool",
                type: "bool",
              },
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
                name: "derivativesAllowed",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "derivativesAttribution",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "derivativesApproval",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "derivativesReciprocal",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "territories",
                internalType: "string[]",
                type: "string[]",
              },
              {
                name: "distributionChannels",
                internalType: "string[]",
                type: "string[]",
              },
              {
                name: "contentRestrictions",
                internalType: "string[]",
                type: "string[]",
              },
            ],
          },
        ],
      },
    ],
    name: "registerPolicy",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "licensee", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "policyData", internalType: "bytes", type: "bytes" },
    ],
    name: "verifyLink",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "licensee", internalType: "address", type: "address" },
      { name: "mintingFromADerivative", internalType: "bool", type: "bool" },
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "mintAmount", internalType: "uint256", type: "uint256" },
      { name: "policyData", internalType: "bytes", type: "bytes" },
    ],
    name: "verifyMint",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export const pilPolicyFrameworkManagerAddress =
  "0xAc2C50Af31501370366D243FaeC56F89128f6d96" as const;

export const pilPolicyFrameworkManagerConfig = {
  address: pilPolicyFrameworkManagerAddress,
  abi: pilPolicyFrameworkManagerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RegistrationModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const registrationModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "assetRegistry", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "resolverAddr", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "RegistrationModule__InvalidOwner" },
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
        name: "licenseIds",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "DerivativeIPRegistered",
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
        name: "policyId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "RootIPRegistered",
  },
  {
    type: "function",
    inputs: [],
    name: "ipResolver",
    outputs: [{ name: "", internalType: "contract IPResolver", type: "address" }],
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
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "ipName", internalType: "string", type: "string" },
      { name: "contentHash", internalType: "bytes32", type: "bytes32" },
      { name: "externalURL", internalType: "string", type: "string" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "registerDerivativeIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "policyId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "ipName", internalType: "string", type: "string" },
      { name: "contentHash", internalType: "bytes32", type: "bytes32" },
      { name: "externalURL", internalType: "string", type: "string" },
    ],
    name: "registerRootIp",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const registrationModuleAddress = "0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694" as const;

export const registrationModuleConfig = {
  address: registrationModuleAddress,
  abi: registrationModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const royaltyModuleAbi = [
  {
    type: "constructor",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
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
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroLicensingModule" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroRoyaltyPolicy" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroRoyaltyToken" },
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
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "royaltyPolicy", internalType: "address", type: "address" }],
    name: "isWhitelistedRoyaltyPolicy",
    outputs: [{ name: "isWhitelisted", internalType: "bool", type: "bool" }],
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "royaltyPolicies",
    outputs: [{ name: "royaltyPolicy", internalType: "address", type: "address" }],
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
    inputs: [{ name: "licensingModule", internalType: "address", type: "address" }],
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

export const royaltyModuleAddress = "0xE1a667ccc38540b38d8579c499bE22e51390a308" as const;

export const royaltyModuleConfig = {
  address: royaltyModuleAddress,
  abi: royaltyModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyPolicyLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const royaltyPolicyLapAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "liquidSplitFactory", internalType: "address", type: "address" },
      { name: "liquidSplitMain", internalType: "address", type: "address" },
      { name: "governance", internalType: "address", type: "address" },
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
  { type: "error", inputs: [], name: "ERC1167FailedCreateClone" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "Governance__InconsistentState" },
  { type: "error", inputs: [], name: "Governance__OnlyProtocolAdmin" },
  {
    type: "error",
    inputs: [{ name: "interfaceName", internalType: "string", type: "string" }],
    name: "Governance__UnsupportedInterface",
  },
  { type: "error", inputs: [], name: "Governance__ZeroAddress" },
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
    name: "RoyaltyPolicyLAP__ImplementationAlreadySet",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__InvalidAncestors" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__InvalidAncestorsHash" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__InvalidAncestorsLength",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__InvalidAncestorsRoyalty",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__InvalidParentRoyaltiesLength",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__InvalidRoyaltyAmountLength",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__LastPositionNotAbleToMintLicense",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__NotFullOwnership" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__NotRoyaltyModule" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__TransferFailed" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__UnlinkableToParents" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroAncestorsVaultImpl",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroLicensingModule" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroLiquidSplitFactory",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroLiquidSplitMain" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroRoyaltyModule" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
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
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "splitClone",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ancestorsVault",
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
    type: "function",
    inputs: [],
    name: "ANCESTORS_VAULT_IMPL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    name: "LIQUID_SPLIT_FACTORY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LIQUID_SPLIT_MAIN",
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
    name: "TOTAL_RNFT_SUPPLY",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "claimerIpId", internalType: "address", type: "address" },
      { name: "ancestors", internalType: "address[]", type: "address[]" },
      {
        name: "ancestorsRoyalties",
        internalType: "uint32[]",
        type: "uint32[]",
      },
      { name: "withdrawETH", internalType: "bool", type: "bool" },
      { name: "tokens", internalType: "contract ERC20[]", type: "address[]" },
    ],
    name: "claimFromAncestorsVault",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "withdrawETH", internalType: "uint256", type: "uint256" },
      { name: "tokens", internalType: "contract ERC20[]", type: "address[]" },
    ],
    name: "claimFromIpPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "withdrawETH", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claimFromIpPoolAsTotalRnftOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "accounts", internalType: "address[]", type: "address[]" },
      { name: "distributorAddress", internalType: "address", type: "address" },
    ],
    name: "distributeIpPoolFunds",
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
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    stateMutability: "nonpayable",
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
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "royaltyData",
    outputs: [
      { name: "isUnlinkableToParents", internalType: "bool", type: "bool" },
      { name: "splitClone", internalType: "address", type: "address" },
      { name: "ancestorsVault", internalType: "address", type: "address" },
      { name: "royaltyStack", internalType: "uint32", type: "uint32" },
      { name: "ancestorsHash", internalType: "bytes32", type: "bytes32" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ancestorsVaultImpl", internalType: "address", type: "address" }],
    name: "setAncestorsVaultImplementation",
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
  { type: "receive", stateMutability: "payable" },
] as const;

export const royaltyPolicyLapAddress = "0x265C21b34e0E92d63C678425478C42aa8D727B79" as const;

export const royaltyPolicyLapConfig = {
  address: royaltyPolicyLapAddress,
  abi: royaltyPolicyLapAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenWithdrawalModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenWithdrawalModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
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
    name: "name",
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
    inputs: [
      { name: "ipAccount", internalType: "address payable", type: "address" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawERC1155",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address payable", type: "address" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawERC20",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address payable", type: "address" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawERC721",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const tokenWithdrawalModuleAddress = "0x5f62d238B3022bA5881e5e443B014cac6999a4f2" as const;

export const tokenWithdrawalModuleConfig = {
  address: tokenWithdrawalModuleAddress,
  abi: tokenWithdrawalModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Contract AccessController =============================================================

export type AccessControllerIpAccountRegistryResponse = Address;

export type AccessControllerModuleRegistryResponse = Address;

/**
 * AccessControllerCheckPermissionRequest
 *
 * @param ipAccount address
 * @param signer address
 * @param to address
 * @param func bytes4
 */
export type AccessControllerCheckPermissionRequest = {
  ipAccount: Address;
  signer: Address;
  to: Address;
  func: Hex;
};

export type AccessControllerGetGovernanceResponse = Address;

/**
 * AccessControllerGetPermissionRequest
 *
 * @param ipAccount address
 * @param signer address
 * @param to address
 * @param func bytes4
 */
export type AccessControllerGetPermissionRequest = {
  ipAccount: Address;
  signer: Address;
  to: Address;
  func: Hex;
};

export type AccessControllerGetPermissionResponse = number;

export type AccessControllerGovernanceResponse = Address;

/**
 * AccessControllerInitializeRequest
 *
 * @param ipAccountRegistry address
 * @param moduleRegistry address
 */
export type AccessControllerInitializeRequest = {
  ipAccountRegistry: Address;
  moduleRegistry: Address;
};

/**
 * AccessControllerSetBatchPermissionsRequest
 *
 * @param permissions tuple[]
 */
export type AccessControllerSetBatchPermissionsRequest = {
  permissions: {
    ipAccount: Address;
    signer: Address;
    to: Address;
    func: Hex;
    permission: number;
  }[];
};

/**
 * AccessControllerSetGlobalPermissionRequest
 *
 * @param signer address
 * @param to address
 * @param func bytes4
 * @param permission uint8
 */
export type AccessControllerSetGlobalPermissionRequest = {
  signer: Address;
  to: Address;
  func: Hex;
  permission: number;
};

/**
 * AccessControllerSetGovernanceRequest
 *
 * @param newGovernance address
 */
export type AccessControllerSetGovernanceRequest = {
  newGovernance: Address;
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
 * AccessControllerGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type AccessControllerGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * AccessControllerPermissionSetEvent
 *
 * @param ipAccountOwner address (optional)
 * @param ipAccount address (optional)
 * @param signer address (optional)
 * @param to address (optional)
 * @param func bytes4 (optional)
 * @param permission uint8 (optional)
 */
export type AccessControllerPermissionSetEvent = {
  ipAccountOwner?: Address;
  ipAccount?: Address;
  signer?: Address;
  to?: Address;
  func?: Hex;
  permission?: number;
};

/**
 * contract AccessController readonly method
 */
export class AccessControllerReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract AccessController
   *
   * @param request AccessControllerIpAccountRegistryRequest
   * @return Promise<AccessControllerIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<AccessControllerIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method MODULE_REGISTRY for contract AccessController
   *
   * @param request AccessControllerModuleRegistryRequest
   * @return Promise<AccessControllerModuleRegistryResponse>
   */
  public async moduleRegistry(): Promise<AccessControllerModuleRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "MODULE_REGISTRY",
    });
  }

  /**
   * method checkPermission for contract AccessController
   *
   * @param request AccessControllerCheckPermissionRequest
   * @return Promise<void>
   */
  public async checkPermission(request: AccessControllerCheckPermissionRequest): Promise<void> {
    await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "checkPermission",
      args: [request.ipAccount, request.signer, request.to, request.func],
    });
  }

  /**
   * method getGovernance for contract AccessController
   *
   * @param request AccessControllerGetGovernanceRequest
   * @return Promise<AccessControllerGetGovernanceResponse>
   */
  public async getGovernance(): Promise<AccessControllerGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method getPermission for contract AccessController
   *
   * @param request AccessControllerGetPermissionRequest
   * @return Promise<AccessControllerGetPermissionResponse>
   */
  public async getPermission(
    request: AccessControllerGetPermissionRequest,
  ): Promise<AccessControllerGetPermissionResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "getPermission",
      args: [request.ipAccount, request.signer, request.to, request.func],
    });
  }

  /**
   * method governance for contract AccessController
   *
   * @param request AccessControllerGovernanceRequest
   * @return Promise<AccessControllerGovernanceResponse>
   */
  public async governance(): Promise<AccessControllerGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "governance",
    });
  }
}

/**
 * contract AccessController write method
 */
export class AccessControllerClient extends AccessControllerReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method initialize for contract AccessController
   *
   * @param request AccessControllerInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: AccessControllerInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.ipAccountRegistry, request.moduleRegistry],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setBatchPermissions for contract AccessController
   *
   * @param request AccessControllerSetBatchPermissionsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setBatchPermissions(
    request: AccessControllerSetBatchPermissionsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "setBatchPermissions",
      account: this.wallet.account,
      args: [request.permissions],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGlobalPermission for contract AccessController
   *
   * @param request AccessControllerSetGlobalPermissionRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGlobalPermission(
    request: AccessControllerSetGlobalPermissionRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "setGlobalPermission",
      account: this.wallet.account,
      args: [request.signer, request.to, request.func, request.permission],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract AccessController
   *
   * @param request AccessControllerSetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: AccessControllerSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract AccessController event
 */
export class AccessControllerEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event GovernanceUpdated for contract AccessController
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: AccessControllerGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: accessControllerAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event PermissionSet for contract AccessController
   */
  public watchPermissionSetEvent(
    onLogs: (txHash: Hex, ev: AccessControllerPermissionSetEvent) => void,
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
}

// Contract AncestorsVaultLAP =============================================================

export type AncestorsVaultLapRoyaltyPolicyLapResponse = Address;

/**
 * AncestorsVaultLapIsClaimedRequest
 *
 * @param ipId address
 * @param claimerIpId address
 */
export type AncestorsVaultLapIsClaimedRequest = {
  ipId: Address;
  claimerIpId: Address;
};

export type AncestorsVaultLapIsClaimedResponse = boolean;

/**
 * AncestorsVaultLapSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type AncestorsVaultLapSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type AncestorsVaultLapSupportsInterfaceResponse = boolean;

/**
 * AncestorsVaultLapClaimRequest
 *
 * @param ipId address
 * @param claimerIpId address
 * @param ancestors address[]
 * @param ancestorsRoyalties uint32[]
 * @param withdrawETH bool
 * @param tokens address[]
 */
export type AncestorsVaultLapClaimRequest = {
  ipId: Address;
  claimerIpId: Address;
  ancestors: readonly Address[];
  ancestorsRoyalties: readonly number[];
  withdrawETH: boolean;
  tokens: readonly Address[];
};

/**
 * AncestorsVaultLapOnErc1155BatchReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256[]
 * @param 3 uint256[]
 * @param 4 bytes
 */
export type AncestorsVaultLapOnErc1155BatchReceivedRequest = readonly [
  Address,
  Address,
  readonly bigint[],
  readonly bigint[],
  Hex,
];

/**
 * AncestorsVaultLapOnErc1155ReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256
 * @param 3 uint256
 * @param 4 bytes
 */
export type AncestorsVaultLapOnErc1155ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  bigint,
  Hex,
];

/**
 * AncestorsVaultLapClaimedEvent
 *
 * @param ipId address (optional)
 * @param claimerIpId address (optional)
 * @param withdrawETH bool (optional)
 * @param tokens address[] (optional)
 */
export type AncestorsVaultLapClaimedEvent = {
  ipId?: Address;
  claimerIpId?: Address;
  withdrawETH?: boolean;
  tokens?: readonly Address[];
};

/**
 * contract AncestorsVaultLAP readonly method
 */
export class AncestorsVaultLapReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ROYALTY_POLICY_LAP for contract AncestorsVaultLAP
   *
   * @param request AncestorsVaultLapRoyaltyPolicyLapRequest
   * @return Promise<AncestorsVaultLapRoyaltyPolicyLapResponse>
   */
  public async royaltyPolicyLap(): Promise<AncestorsVaultLapRoyaltyPolicyLapResponse> {
    return await this.rpcClient.readContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: "ROYALTY_POLICY_LAP",
    });
  }

  /**
   * method isClaimed for contract AncestorsVaultLAP
   *
   * @param request AncestorsVaultLapIsClaimedRequest
   * @return Promise<AncestorsVaultLapIsClaimedResponse>
   */
  public async isClaimed(
    request: AncestorsVaultLapIsClaimedRequest,
  ): Promise<AncestorsVaultLapIsClaimedResponse> {
    return await this.rpcClient.readContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: "isClaimed",
      args: [request.ipId, request.claimerIpId],
    });
  }

  /**
   * method supportsInterface for contract AncestorsVaultLAP
   *
   * @param request AncestorsVaultLapSupportsInterfaceRequest
   * @return Promise<AncestorsVaultLapSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: AncestorsVaultLapSupportsInterfaceRequest,
  ): Promise<AncestorsVaultLapSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract AncestorsVaultLAP write method
 */
export class AncestorsVaultLapClient extends AncestorsVaultLapReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method claim for contract AncestorsVaultLAP
   *
   * @param request AncestorsVaultLapClaimRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claim(request: AncestorsVaultLapClaimRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: "claim",
      account: this.wallet.account,
      args: [
        request.ipId,
        request.claimerIpId,
        request.ancestors,
        request.ancestorsRoyalties,
        request.withdrawETH,
        request.tokens,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onERC1155BatchReceived for contract AncestorsVaultLAP
   *
   * @param request AncestorsVaultLapOnErc1155BatchReceivedRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onErc1155BatchReceived(
    request: AncestorsVaultLapOnErc1155BatchReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: "onERC1155BatchReceived",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onERC1155Received for contract AncestorsVaultLAP
   *
   * @param request AncestorsVaultLapOnErc1155ReceivedRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onErc1155Received(
    request: AncestorsVaultLapOnErc1155ReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: "onERC1155Received",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract AncestorsVaultLAP event
 */
export class AncestorsVaultLapEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event Claimed for contract AncestorsVaultLAP
   */
  public watchClaimedEvent(
    onLogs: (txHash: Hex, ev: AncestorsVaultLapClaimedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      eventName: "Claimed",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract ArbitrationPolicySP =============================================================

export type ArbitrationPolicySpArbitrationPriceResponse = bigint;

export type ArbitrationPolicySpDisputeModuleResponse = Address;

export type ArbitrationPolicySpPaymentTokenResponse = Address;

export type ArbitrationPolicySpGetGovernanceResponse = Address;

export type ArbitrationPolicySpGovernanceResponse = Address;

/**
 * ArbitrationPolicySpOnDisputeCancelRequest
 *
 * @param caller address
 * @param disputeId uint256
 * @param data bytes
 */
export type ArbitrationPolicySpOnDisputeCancelRequest = {
  caller: Address;
  disputeId: bigint;
  data: Hex;
};

/**
 * ArbitrationPolicySpOnDisputeJudgementRequest
 *
 * @param disputeId uint256
 * @param decision bool
 * @param data bytes
 */
export type ArbitrationPolicySpOnDisputeJudgementRequest = {
  disputeId: bigint;
  decision: boolean;
  data: Hex;
};

/**
 * ArbitrationPolicySpOnRaiseDisputeRequest
 *
 * @param caller address
 * @param data bytes
 */
export type ArbitrationPolicySpOnRaiseDisputeRequest = {
  caller: Address;
  data: Hex;
};

/**
 * ArbitrationPolicySpSetGovernanceRequest
 *
 * @param newGovernance address
 */
export type ArbitrationPolicySpSetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * ArbitrationPolicySpGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type ArbitrationPolicySpGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * ArbitrationPolicySpGovernanceWithdrewEvent
 *
 * @param amount uint256 (optional)
 */
export type ArbitrationPolicySpGovernanceWithdrewEvent = {
  amount?: bigint;
};

/**
 * contract ArbitrationPolicySP readonly method
 */
export class ArbitrationPolicySpReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ARBITRATION_PRICE for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpArbitrationPriceRequest
   * @return Promise<ArbitrationPolicySpArbitrationPriceResponse>
   */
  public async arbitrationPrice(): Promise<ArbitrationPolicySpArbitrationPriceResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "ARBITRATION_PRICE",
    });
  }

  /**
   * method DISPUTE_MODULE for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpDisputeModuleRequest
   * @return Promise<ArbitrationPolicySpDisputeModuleResponse>
   */
  public async disputeModule(): Promise<ArbitrationPolicySpDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "DISPUTE_MODULE",
    });
  }

  /**
   * method PAYMENT_TOKEN for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpPaymentTokenRequest
   * @return Promise<ArbitrationPolicySpPaymentTokenResponse>
   */
  public async paymentToken(): Promise<ArbitrationPolicySpPaymentTokenResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "PAYMENT_TOKEN",
    });
  }

  /**
   * method getGovernance for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpGetGovernanceRequest
   * @return Promise<ArbitrationPolicySpGetGovernanceResponse>
   */
  public async getGovernance(): Promise<ArbitrationPolicySpGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method governance for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpGovernanceRequest
   * @return Promise<ArbitrationPolicySpGovernanceResponse>
   */
  public async governance(): Promise<ArbitrationPolicySpGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "governance",
    });
  }
}

/**
 * contract ArbitrationPolicySP write method
 */
export class ArbitrationPolicySpClient extends ArbitrationPolicySpReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method governanceWithdraw for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpGovernanceWithdrawRequest
   * @return Promise<WriteContractReturnType>
   */
  public async governanceWithdraw(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "governanceWithdraw",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onDisputeCancel for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpOnDisputeCancelRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onDisputeCancel(
    request: ArbitrationPolicySpOnDisputeCancelRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "onDisputeCancel",
      account: this.wallet.account,
      args: [request.caller, request.disputeId, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onDisputeJudgement for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpOnDisputeJudgementRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onDisputeJudgement(
    request: ArbitrationPolicySpOnDisputeJudgementRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "onDisputeJudgement",
      account: this.wallet.account,
      args: [request.disputeId, request.decision, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onRaiseDispute for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpOnRaiseDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onRaiseDispute(
    request: ArbitrationPolicySpOnRaiseDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "onRaiseDispute",
      account: this.wallet.account,
      args: [request.caller, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract ArbitrationPolicySP
   *
   * @param request ArbitrationPolicySpSetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: ArbitrationPolicySpSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract ArbitrationPolicySP event
 */
export class ArbitrationPolicySpEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event GovernanceUpdated for contract ArbitrationPolicySP
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: ArbitrationPolicySpGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event GovernanceWithdrew for contract ArbitrationPolicySP
   */
  public watchGovernanceWithdrewEvent(
    onLogs: (txHash: Hex, ev: ArbitrationPolicySpGovernanceWithdrewEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      eventName: "GovernanceWithdrew",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract DisputeModule =============================================================

export type DisputeModuleAccessControllerResponse = Address;

export type DisputeModuleInDisputeResponse = Hex;

export type DisputeModuleIpAccountRegistryResponse = Address;

export type DisputeModuleIpAssetRegistryResponse = Address;

/**
 * DisputeModuleArbitrationPoliciesRequest
 *
 * @param ipId address
 */
export type DisputeModuleArbitrationPoliciesRequest = {
  ipId: Address;
};

/**
 * DisputeModuleArbitrationPoliciesResponse
 *
 * @param arbitrationPolicy address
 */
export type DisputeModuleArbitrationPoliciesResponse = {
  arbitrationPolicy: Address;
};

export type DisputeModuleBaseArbitrationPolicyResponse = Address;

export type DisputeModuleDisputeCounterResponse = bigint;

/**
 * DisputeModuleDisputesRequest
 *
 * @param disputeId uint256
 */
export type DisputeModuleDisputesRequest = {
  disputeId: bigint;
};

/**
 * DisputeModuleDisputesResponse
 *
 * @param targetIpId address
 * @param disputeInitiator address
 * @param arbitrationPolicy address
 * @param linkToDisputeEvidence bytes32
 * @param targetTag bytes32
 * @param currentTag bytes32
 */
export type DisputeModuleDisputesResponse = {
  targetIpId: Address;
  disputeInitiator: Address;
  arbitrationPolicy: Address;
  linkToDisputeEvidence: Hex;
  targetTag: Hex;
  currentTag: Hex;
};

export type DisputeModuleGetGovernanceResponse = Address;

export type DisputeModuleGovernanceResponse = Address;

/**
 * DisputeModuleIsIpTaggedRequest
 *
 * @param ipId address
 */
export type DisputeModuleIsIpTaggedRequest = {
  ipId: Address;
};

export type DisputeModuleIsIpTaggedResponse = boolean;

/**
 * DisputeModuleIsWhitelistedArbitrationPolicyRequest
 *
 * @param arbitrationPolicy address
 */
export type DisputeModuleIsWhitelistedArbitrationPolicyRequest = {
  arbitrationPolicy: Address;
};

/**
 * DisputeModuleIsWhitelistedArbitrationPolicyResponse
 *
 * @param allowed bool
 */
export type DisputeModuleIsWhitelistedArbitrationPolicyResponse = {
  allowed: boolean;
};

/**
 * DisputeModuleIsWhitelistedArbitrationRelayerRequest
 *
 * @param arbitrationPolicy address
 * @param arbitrationRelayer address
 */
export type DisputeModuleIsWhitelistedArbitrationRelayerRequest = {
  arbitrationPolicy: Address;
  arbitrationRelayer: Address;
};

/**
 * DisputeModuleIsWhitelistedArbitrationRelayerResponse
 *
 * @param allowed bool
 */
export type DisputeModuleIsWhitelistedArbitrationRelayerResponse = {
  allowed: boolean;
};

/**
 * DisputeModuleIsWhitelistedDisputeTagRequest
 *
 * @param tag bytes32
 */
export type DisputeModuleIsWhitelistedDisputeTagRequest = {
  tag: Hex;
};

/**
 * DisputeModuleIsWhitelistedDisputeTagResponse
 *
 * @param allowed bool
 */
export type DisputeModuleIsWhitelistedDisputeTagResponse = {
  allowed: boolean;
};

export type DisputeModuleNameResponse = string;

/**
 * DisputeModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type DisputeModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type DisputeModuleSupportsInterfaceResponse = boolean;

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
 * DisputeModuleSetArbitrationPolicyRequest
 *
 * @param ipId address
 * @param arbitrationPolicy address
 */
export type DisputeModuleSetArbitrationPolicyRequest = {
  ipId: Address;
  arbitrationPolicy: Address;
};

/**
 * DisputeModuleSetBaseArbitrationPolicyRequest
 *
 * @param arbitrationPolicy address
 */
export type DisputeModuleSetBaseArbitrationPolicyRequest = {
  arbitrationPolicy: Address;
};

/**
 * DisputeModuleSetDisputeJudgementRequest
 *
 * @param disputeId uint256
 * @param decision bool
 * @param data bytes
 */
export type DisputeModuleSetDisputeJudgementRequest = {
  disputeId: bigint;
  decision: boolean;
  data: Hex;
};

/**
 * DisputeModuleSetGovernanceRequest
 *
 * @param newGovernance address
 */
export type DisputeModuleSetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * DisputeModuleWhitelistArbitrationPolicyRequest
 *
 * @param arbitrationPolicy address
 * @param allowed bool
 */
export type DisputeModuleWhitelistArbitrationPolicyRequest = {
  arbitrationPolicy: Address;
  allowed: boolean;
};

/**
 * DisputeModuleWhitelistArbitrationRelayerRequest
 *
 * @param arbitrationPolicy address
 * @param arbPolicyRelayer address
 * @param allowed bool
 */
export type DisputeModuleWhitelistArbitrationRelayerRequest = {
  arbitrationPolicy: Address;
  arbPolicyRelayer: Address;
  allowed: boolean;
};

/**
 * DisputeModuleWhitelistDisputeTagRequest
 *
 * @param tag bytes32
 * @param allowed bool
 */
export type DisputeModuleWhitelistDisputeTagRequest = {
  tag: Hex;
  allowed: boolean;
};

/**
 * DisputeModuleArbitrationPolicySetEvent
 *
 * @param ipId address (optional)
 * @param arbitrationPolicy address (optional)
 */
export type DisputeModuleArbitrationPolicySetEvent = {
  ipId?: Address;
  arbitrationPolicy?: Address;
};

/**
 * DisputeModuleArbitrationPolicyWhitelistUpdatedEvent
 *
 * @param arbitrationPolicy address (optional)
 * @param allowed bool (optional)
 */
export type DisputeModuleArbitrationPolicyWhitelistUpdatedEvent = {
  arbitrationPolicy?: Address;
  allowed?: boolean;
};

/**
 * DisputeModuleArbitrationRelayerWhitelistUpdatedEvent
 *
 * @param arbitrationPolicy address (optional)
 * @param arbitrationRelayer address (optional)
 * @param allowed bool (optional)
 */
export type DisputeModuleArbitrationRelayerWhitelistUpdatedEvent = {
  arbitrationPolicy?: Address;
  arbitrationRelayer?: Address;
  allowed?: boolean;
};

/**
 * DisputeModuleDefaultArbitrationPolicyUpdatedEvent
 *
 * @param arbitrationPolicy address (optional)
 */
export type DisputeModuleDefaultArbitrationPolicyUpdatedEvent = {
  arbitrationPolicy?: Address;
};

/**
 * DisputeModuleDisputeCancelledEvent
 *
 * @param disputeId uint256 (optional)
 * @param data bytes (optional)
 */
export type DisputeModuleDisputeCancelledEvent = {
  disputeId?: bigint;
  data?: Hex;
};

/**
 * DisputeModuleDisputeJudgementSetEvent
 *
 * @param disputeId uint256 (optional)
 * @param decision bool (optional)
 * @param data bytes (optional)
 */
export type DisputeModuleDisputeJudgementSetEvent = {
  disputeId?: bigint;
  decision?: boolean;
  data?: Hex;
};

/**
 * DisputeModuleDisputeRaisedEvent
 *
 * @param disputeId uint256 (optional)
 * @param targetIpId address (optional)
 * @param disputeInitiator address (optional)
 * @param arbitrationPolicy address (optional)
 * @param linkToDisputeEvidence bytes32 (optional)
 * @param targetTag bytes32 (optional)
 * @param data bytes (optional)
 */
export type DisputeModuleDisputeRaisedEvent = {
  disputeId?: bigint;
  targetIpId?: Address;
  disputeInitiator?: Address;
  arbitrationPolicy?: Address;
  linkToDisputeEvidence?: Hex;
  targetTag?: Hex;
  data?: Hex;
};

/**
 * DisputeModuleDisputeResolvedEvent
 *
 * @param disputeId uint256 (optional)
 */
export type DisputeModuleDisputeResolvedEvent = {
  disputeId?: bigint;
};

/**
 * DisputeModuleGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type DisputeModuleGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * DisputeModuleTagWhitelistUpdatedEvent
 *
 * @param tag bytes32 (optional)
 * @param allowed bool (optional)
 */
export type DisputeModuleTagWhitelistUpdatedEvent = {
  tag?: Hex;
  allowed?: boolean;
};

/**
 * contract DisputeModule readonly method
 */
export class DisputeModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ACCESS_CONTROLLER for contract DisputeModule
   *
   * @param request DisputeModuleAccessControllerRequest
   * @return Promise<DisputeModuleAccessControllerResponse>
   */
  public async accessController(): Promise<DisputeModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method IN_DISPUTE for contract DisputeModule
   *
   * @param request DisputeModuleInDisputeRequest
   * @return Promise<DisputeModuleInDisputeResponse>
   */
  public async inDispute(): Promise<DisputeModuleInDisputeResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "IN_DISPUTE",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract DisputeModule
   *
   * @param request DisputeModuleIpAccountRegistryRequest
   * @return Promise<DisputeModuleIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<DisputeModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method IP_ASSET_REGISTRY for contract DisputeModule
   *
   * @param request DisputeModuleIpAssetRegistryRequest
   * @return Promise<DisputeModuleIpAssetRegistryResponse>
   */
  public async ipAssetRegistry(): Promise<DisputeModuleIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "IP_ASSET_REGISTRY",
    });
  }

  /**
   * method arbitrationPolicies for contract DisputeModule
   *
   * @param request DisputeModuleArbitrationPoliciesRequest
   * @return Promise<DisputeModuleArbitrationPoliciesResponse>
   */
  public async arbitrationPolicies(
    request: DisputeModuleArbitrationPoliciesRequest,
  ): Promise<DisputeModuleArbitrationPoliciesResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "arbitrationPolicies",
      args: [request.ipId],
    });
    return {
      arbitrationPolicy: result,
    };
  }

  /**
   * method baseArbitrationPolicy for contract DisputeModule
   *
   * @param request DisputeModuleBaseArbitrationPolicyRequest
   * @return Promise<DisputeModuleBaseArbitrationPolicyResponse>
   */
  public async baseArbitrationPolicy(): Promise<DisputeModuleBaseArbitrationPolicyResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "baseArbitrationPolicy",
    });
  }

  /**
   * method disputeCounter for contract DisputeModule
   *
   * @param request DisputeModuleDisputeCounterRequest
   * @return Promise<DisputeModuleDisputeCounterResponse>
   */
  public async disputeCounter(): Promise<DisputeModuleDisputeCounterResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "disputeCounter",
    });
  }

  /**
   * method disputes for contract DisputeModule
   *
   * @param request DisputeModuleDisputesRequest
   * @return Promise<DisputeModuleDisputesResponse>
   */
  public async disputes(
    request: DisputeModuleDisputesRequest,
  ): Promise<DisputeModuleDisputesResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "disputes",
      args: [request.disputeId],
    });
    return {
      targetIpId: result[0],
      disputeInitiator: result[1],
      arbitrationPolicy: result[2],
      linkToDisputeEvidence: result[3],
      targetTag: result[4],
      currentTag: result[5],
    };
  }

  /**
   * method getGovernance for contract DisputeModule
   *
   * @param request DisputeModuleGetGovernanceRequest
   * @return Promise<DisputeModuleGetGovernanceResponse>
   */
  public async getGovernance(): Promise<DisputeModuleGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method governance for contract DisputeModule
   *
   * @param request DisputeModuleGovernanceRequest
   * @return Promise<DisputeModuleGovernanceResponse>
   */
  public async governance(): Promise<DisputeModuleGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "governance",
    });
  }

  /**
   * method isIpTagged for contract DisputeModule
   *
   * @param request DisputeModuleIsIpTaggedRequest
   * @return Promise<DisputeModuleIsIpTaggedResponse>
   */
  public async isIpTagged(
    request: DisputeModuleIsIpTaggedRequest,
  ): Promise<DisputeModuleIsIpTaggedResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "isIpTagged",
      args: [request.ipId],
    });
  }

  /**
   * method isWhitelistedArbitrationPolicy for contract DisputeModule
   *
   * @param request DisputeModuleIsWhitelistedArbitrationPolicyRequest
   * @return Promise<DisputeModuleIsWhitelistedArbitrationPolicyResponse>
   */
  public async isWhitelistedArbitrationPolicy(
    request: DisputeModuleIsWhitelistedArbitrationPolicyRequest,
  ): Promise<DisputeModuleIsWhitelistedArbitrationPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "isWhitelistedArbitrationPolicy",
      args: [request.arbitrationPolicy],
    });
    return {
      allowed: result,
    };
  }

  /**
   * method isWhitelistedArbitrationRelayer for contract DisputeModule
   *
   * @param request DisputeModuleIsWhitelistedArbitrationRelayerRequest
   * @return Promise<DisputeModuleIsWhitelistedArbitrationRelayerResponse>
   */
  public async isWhitelistedArbitrationRelayer(
    request: DisputeModuleIsWhitelistedArbitrationRelayerRequest,
  ): Promise<DisputeModuleIsWhitelistedArbitrationRelayerResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "isWhitelistedArbitrationRelayer",
      args: [request.arbitrationPolicy, request.arbitrationRelayer],
    });
    return {
      allowed: result,
    };
  }

  /**
   * method isWhitelistedDisputeTag for contract DisputeModule
   *
   * @param request DisputeModuleIsWhitelistedDisputeTagRequest
   * @return Promise<DisputeModuleIsWhitelistedDisputeTagResponse>
   */
  public async isWhitelistedDisputeTag(
    request: DisputeModuleIsWhitelistedDisputeTagRequest,
  ): Promise<DisputeModuleIsWhitelistedDisputeTagResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "isWhitelistedDisputeTag",
      args: [request.tag],
    });
    return {
      allowed: result,
    };
  }

  /**
   * method name for contract DisputeModule
   *
   * @param request DisputeModuleNameRequest
   * @return Promise<DisputeModuleNameResponse>
   */
  public async name(): Promise<DisputeModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method supportsInterface for contract DisputeModule
   *
   * @param request DisputeModuleSupportsInterfaceRequest
   * @return Promise<DisputeModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: DisputeModuleSupportsInterfaceRequest,
  ): Promise<DisputeModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract DisputeModule write method
 */
export class DisputeModuleClient extends DisputeModuleReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb",
  ) {
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
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }

  /**
   * method setArbitrationPolicy for contract DisputeModule
   *
   * @param request DisputeModuleSetArbitrationPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setArbitrationPolicy(
    request: DisputeModuleSetArbitrationPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "setArbitrationPolicy",
      account: this.wallet.account,
      args: [request.ipId, request.arbitrationPolicy],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setBaseArbitrationPolicy for contract DisputeModule
   *
   * @param request DisputeModuleSetBaseArbitrationPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setBaseArbitrationPolicy(
    request: DisputeModuleSetBaseArbitrationPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "setBaseArbitrationPolicy",
      account: this.wallet.account,
      args: [request.arbitrationPolicy],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setDisputeJudgement for contract DisputeModule
   *
   * @param request DisputeModuleSetDisputeJudgementRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setDisputeJudgement(
    request: DisputeModuleSetDisputeJudgementRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "setDisputeJudgement",
      account: this.wallet.account,
      args: [request.disputeId, request.decision, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract DisputeModule
   *
   * @param request DisputeModuleSetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: DisputeModuleSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method whitelistArbitrationPolicy for contract DisputeModule
   *
   * @param request DisputeModuleWhitelistArbitrationPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async whitelistArbitrationPolicy(
    request: DisputeModuleWhitelistArbitrationPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "whitelistArbitrationPolicy",
      account: this.wallet.account,
      args: [request.arbitrationPolicy, request.allowed],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method whitelistArbitrationRelayer for contract DisputeModule
   *
   * @param request DisputeModuleWhitelistArbitrationRelayerRequest
   * @return Promise<WriteContractReturnType>
   */
  public async whitelistArbitrationRelayer(
    request: DisputeModuleWhitelistArbitrationRelayerRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "whitelistArbitrationRelayer",
      account: this.wallet.account,
      args: [request.arbitrationPolicy, request.arbPolicyRelayer, request.allowed],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method whitelistDisputeTag for contract DisputeModule
   *
   * @param request DisputeModuleWhitelistDisputeTagRequest
   * @return Promise<WriteContractReturnType>
   */
  public async whitelistDisputeTag(
    request: DisputeModuleWhitelistDisputeTagRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: "whitelistDisputeTag",
      account: this.wallet.account,
      args: [request.tag, request.allowed],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract DisputeModule event
 */
export class DisputeModuleEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event ArbitrationPolicySet for contract DisputeModule
   */
  public watchArbitrationPolicySetEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleArbitrationPolicySetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "ArbitrationPolicySet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event ArbitrationPolicyWhitelistUpdated for contract DisputeModule
   */
  public watchArbitrationPolicyWhitelistUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleArbitrationPolicyWhitelistUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "ArbitrationPolicyWhitelistUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event ArbitrationRelayerWhitelistUpdated for contract DisputeModule
   */
  public watchArbitrationRelayerWhitelistUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleArbitrationRelayerWhitelistUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "ArbitrationRelayerWhitelistUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event DefaultArbitrationPolicyUpdated for contract DisputeModule
   */
  public watchDefaultArbitrationPolicyUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDefaultArbitrationPolicyUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DefaultArbitrationPolicyUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event DisputeCancelled for contract DisputeModule
   */
  public watchDisputeCancelledEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeCancelledEvent) => void,
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
   * event DisputeJudgementSet for contract DisputeModule
   */
  public watchDisputeJudgementSetEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeJudgementSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DisputeJudgementSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event DisputeRaised for contract DisputeModule
   */
  public watchDisputeRaisedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeRaisedEvent) => void,
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
   * event DisputeResolved for contract DisputeModule
   */
  public watchDisputeResolvedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeResolvedEvent) => void,
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
   * event GovernanceUpdated for contract DisputeModule
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event TagWhitelistUpdated for contract DisputeModule
   */
  public watchTagWhitelistUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleTagWhitelistUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "TagWhitelistUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract Governance =============================================================

export type GovernanceDefaultAdminRoleResponse = Hex;

/**
 * GovernanceGetRoleAdminRequest
 *
 * @param role bytes32
 */
export type GovernanceGetRoleAdminRequest = {
  role: Hex;
};

export type GovernanceGetRoleAdminResponse = Hex;

export type GovernanceGetStateResponse = number;

/**
 * GovernanceHasRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type GovernanceHasRoleRequest = {
  role: Hex;
  account: Address;
};

export type GovernanceHasRoleResponse = boolean;

/**
 * GovernanceSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type GovernanceSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type GovernanceSupportsInterfaceResponse = boolean;

/**
 * GovernanceGrantRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type GovernanceGrantRoleRequest = {
  role: Hex;
  account: Address;
};

/**
 * GovernanceRenounceRoleRequest
 *
 * @param role bytes32
 * @param callerConfirmation address
 */
export type GovernanceRenounceRoleRequest = {
  role: Hex;
  callerConfirmation: Address;
};

/**
 * GovernanceRevokeRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type GovernanceRevokeRoleRequest = {
  role: Hex;
  account: Address;
};

/**
 * GovernanceSetStateRequest
 *
 * @param newState uint8
 */
export type GovernanceSetStateRequest = {
  newState: number;
};

/**
 * GovernanceRoleAdminChangedEvent
 *
 * @param role bytes32 (optional)
 * @param previousAdminRole bytes32 (optional)
 * @param newAdminRole bytes32 (optional)
 */
export type GovernanceRoleAdminChangedEvent = {
  role?: Hex;
  previousAdminRole?: Hex;
  newAdminRole?: Hex;
};

/**
 * GovernanceRoleGrantedEvent
 *
 * @param role bytes32 (optional)
 * @param account address (optional)
 * @param sender address (optional)
 */
export type GovernanceRoleGrantedEvent = {
  role?: Hex;
  account?: Address;
  sender?: Address;
};

/**
 * GovernanceRoleRevokedEvent
 *
 * @param role bytes32 (optional)
 * @param account address (optional)
 * @param sender address (optional)
 */
export type GovernanceRoleRevokedEvent = {
  role?: Hex;
  account?: Address;
  sender?: Address;
};

/**
 * GovernanceStateSetEvent
 *
 * @param account address (optional)
 * @param prevState uint8 (optional)
 * @param newState uint8 (optional)
 * @param timestamp uint256 (optional)
 */
export type GovernanceStateSetEvent = {
  account?: Address;
  prevState?: number;
  newState?: number;
  timestamp?: bigint;
};

/**
 * contract Governance readonly method
 */
export class GovernanceReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x6D8070F7726769bEd136bc7007B3deA695f7047A",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method DEFAULT_ADMIN_ROLE for contract Governance
   *
   * @param request GovernanceDefaultAdminRoleRequest
   * @return Promise<GovernanceDefaultAdminRoleResponse>
   */
  public async defaultAdminRole(): Promise<GovernanceDefaultAdminRoleResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "DEFAULT_ADMIN_ROLE",
    });
  }

  /**
   * method getRoleAdmin for contract Governance
   *
   * @param request GovernanceGetRoleAdminRequest
   * @return Promise<GovernanceGetRoleAdminResponse>
   */
  public async getRoleAdmin(
    request: GovernanceGetRoleAdminRequest,
  ): Promise<GovernanceGetRoleAdminResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "getRoleAdmin",
      args: [request.role],
    });
  }

  /**
   * method getState for contract Governance
   *
   * @param request GovernanceGetStateRequest
   * @return Promise<GovernanceGetStateResponse>
   */
  public async getState(): Promise<GovernanceGetStateResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "getState",
    });
  }

  /**
   * method hasRole for contract Governance
   *
   * @param request GovernanceHasRoleRequest
   * @return Promise<GovernanceHasRoleResponse>
   */
  public async hasRole(request: GovernanceHasRoleRequest): Promise<GovernanceHasRoleResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "hasRole",
      args: [request.role, request.account],
    });
  }

  /**
   * method supportsInterface for contract Governance
   *
   * @param request GovernanceSupportsInterfaceRequest
   * @return Promise<GovernanceSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: GovernanceSupportsInterfaceRequest,
  ): Promise<GovernanceSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract Governance write method
 */
export class GovernanceClient extends GovernanceReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x6D8070F7726769bEd136bc7007B3deA695f7047A",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method grantRole for contract Governance
   *
   * @param request GovernanceGrantRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async grantRole(request: GovernanceGrantRoleRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "grantRole",
      account: this.wallet.account,
      args: [request.role, request.account],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method renounceRole for contract Governance
   *
   * @param request GovernanceRenounceRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async renounceRole(
    request: GovernanceRenounceRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "renounceRole",
      account: this.wallet.account,
      args: [request.role, request.callerConfirmation],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method revokeRole for contract Governance
   *
   * @param request GovernanceRevokeRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async revokeRole(request: GovernanceRevokeRoleRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "revokeRole",
      account: this.wallet.account,
      args: [request.role, request.account],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setState for contract Governance
   *
   * @param request GovernanceSetStateRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setState(request: GovernanceSetStateRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: "setState",
      account: this.wallet.account,
      args: [request.newState],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract Governance event
 */
export class GovernanceEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x6D8070F7726769bEd136bc7007B3deA695f7047A",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event RoleAdminChanged for contract Governance
   */
  public watchRoleAdminChangedEvent(
    onLogs: (txHash: Hex, ev: GovernanceRoleAdminChangedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: "RoleAdminChanged",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event RoleGranted for contract Governance
   */
  public watchRoleGrantedEvent(
    onLogs: (txHash: Hex, ev: GovernanceRoleGrantedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: "RoleGranted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event RoleRevoked for contract Governance
   */
  public watchRoleRevokedEvent(
    onLogs: (txHash: Hex, ev: GovernanceRoleRevokedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: "RoleRevoked",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event StateSet for contract Governance
   */
  public watchStateSetEvent(
    onLogs: (txHash: Hex, ev: GovernanceStateSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: "StateSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract IPAccountImpl =============================================================

export type IpAccountImplAccessControllerResponse = Address;

/**
 * IpAccountImplIsValidSignerRequest
 *
 * @param signer address
 * @param data bytes
 */
export type IpAccountImplIsValidSignerRequest = {
  signer: Address;
  data: Hex;
};

export type IpAccountImplIsValidSignerResponse = Hex;

/**
 * IpAccountImplOnErc1155BatchReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256[]
 * @param 3 uint256[]
 * @param 4 bytes
 */
export type IpAccountImplOnErc1155BatchReceivedRequest = readonly [
  Address,
  Address,
  readonly bigint[],
  readonly bigint[],
  Hex,
];

export type IpAccountImplOnErc1155BatchReceivedResponse = Hex;

/**
 * IpAccountImplOnErc1155ReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256
 * @param 3 uint256
 * @param 4 bytes
 */
export type IpAccountImplOnErc1155ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  bigint,
  Hex,
];

export type IpAccountImplOnErc1155ReceivedResponse = Hex;

/**
 * IpAccountImplOnErc721ReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256
 * @param 3 bytes
 */
export type IpAccountImplOnErc721ReceivedRequest = readonly [Address, Address, bigint, Hex];

export type IpAccountImplOnErc721ReceivedResponse = Hex;

export type IpAccountImplOwnerResponse = Address;

export type IpAccountImplStateResponse = bigint;

/**
 * IpAccountImplSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type IpAccountImplSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type IpAccountImplSupportsInterfaceResponse = boolean;

/**
 * IpAccountImplTokenResponse
 *
 * @param 0 uint256
 * @param 1 address
 * @param 2 uint256
 */
export type IpAccountImplTokenResponse = readonly [bigint, Address, bigint];

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
 * IpAccountImplExecutedEvent
 *
 * @param to address (optional)
 * @param value uint256 (optional)
 * @param data bytes (optional)
 * @param nonce uint256 (optional)
 */
export type IpAccountImplExecutedEvent = {
  to?: Address;
  value?: bigint;
  data?: Hex;
  nonce?: bigint;
};

/**
 * IpAccountImplExecutedWithSigEvent
 *
 * @param to address (optional)
 * @param value uint256 (optional)
 * @param data bytes (optional)
 * @param nonce uint256 (optional)
 * @param deadline uint256 (optional)
 * @param signer address (optional)
 * @param signature bytes (optional)
 */
export type IpAccountImplExecutedWithSigEvent = {
  to?: Address;
  value?: bigint;
  data?: Hex;
  nonce?: bigint;
  deadline?: bigint;
  signer?: Address;
  signature?: Hex;
};

/**
 * contract IPAccountImpl readonly method
 */
export class IpAccountImplReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xddcBD4309f0545fa8cC99137bC621620e017bdBe",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method accessController for contract IPAccountImpl
   *
   * @param request IpAccountImplAccessControllerRequest
   * @return Promise<IpAccountImplAccessControllerResponse>
   */
  public async accessController(): Promise<IpAccountImplAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "accessController",
    });
  }

  /**
   * method isValidSigner for contract IPAccountImpl
   *
   * @param request IpAccountImplIsValidSignerRequest
   * @return Promise<IpAccountImplIsValidSignerResponse>
   */
  public async isValidSigner(
    request: IpAccountImplIsValidSignerRequest,
  ): Promise<IpAccountImplIsValidSignerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "isValidSigner",
      args: [request.signer, request.data],
    });
  }

  /**
   * method onERC1155BatchReceived for contract IPAccountImpl
   *
   * @param request IpAccountImplOnErc1155BatchReceivedRequest
   * @return Promise<IpAccountImplOnErc1155BatchReceivedResponse>
   */
  public async onErc1155BatchReceived(
    request: IpAccountImplOnErc1155BatchReceivedRequest,
  ): Promise<IpAccountImplOnErc1155BatchReceivedResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "onERC1155BatchReceived",
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
  }

  /**
   * method onERC1155Received for contract IPAccountImpl
   *
   * @param request IpAccountImplOnErc1155ReceivedRequest
   * @return Promise<IpAccountImplOnErc1155ReceivedResponse>
   */
  public async onErc1155Received(
    request: IpAccountImplOnErc1155ReceivedRequest,
  ): Promise<IpAccountImplOnErc1155ReceivedResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "onERC1155Received",
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
  }

  /**
   * method onERC721Received for contract IPAccountImpl
   *
   * @param request IpAccountImplOnErc721ReceivedRequest
   * @return Promise<IpAccountImplOnErc721ReceivedResponse>
   */
  public async onErc721Received(
    request: IpAccountImplOnErc721ReceivedRequest,
  ): Promise<IpAccountImplOnErc721ReceivedResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "onERC721Received",
      args: [request[0], request[1], request[2], request[3]],
    });
  }

  /**
   * method owner for contract IPAccountImpl
   *
   * @param request IpAccountImplOwnerRequest
   * @return Promise<IpAccountImplOwnerResponse>
   */
  public async owner(): Promise<IpAccountImplOwnerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "owner",
    });
  }

  /**
   * method state for contract IPAccountImpl
   *
   * @param request IpAccountImplStateRequest
   * @return Promise<IpAccountImplStateResponse>
   */
  public async state(): Promise<IpAccountImplStateResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "state",
    });
  }

  /**
   * method supportsInterface for contract IPAccountImpl
   *
   * @param request IpAccountImplSupportsInterfaceRequest
   * @return Promise<IpAccountImplSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: IpAccountImplSupportsInterfaceRequest,
  ): Promise<IpAccountImplSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }

  /**
   * method token for contract IPAccountImpl
   *
   * @param request IpAccountImplTokenRequest
   * @return Promise<IpAccountImplTokenResponse>
   */
  public async token(): Promise<IpAccountImplTokenResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "token",
    });
  }
}

/**
 * contract IPAccountImpl write method
 */
export class IpAccountImplClient extends IpAccountImplReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xddcBD4309f0545fa8cC99137bC621620e017bdBe",
  ) {
    super(rpcClient, address);
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
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract IPAccountImpl event
 */
export class IpAccountImplEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xddcBD4309f0545fa8cC99137bC621620e017bdBe",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event Executed for contract IPAccountImpl
   */
  public watchExecutedEvent(
    onLogs: (txHash: Hex, ev: IpAccountImplExecutedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAccountImplAbi,
      address: this.address,
      eventName: "Executed",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event ExecutedWithSig for contract IPAccountImpl
   */
  public watchExecutedWithSigEvent(
    onLogs: (txHash: Hex, ev: IpAccountImplExecutedWithSigEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAccountImplAbi,
      address: this.address,
      eventName: "ExecutedWithSig",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract IPAccountRegistry =============================================================

export type IpAccountRegistryErc6551PublicRegistryResponse = Address;

export type IpAccountRegistryIpAccountImplResponse = Address;

export type IpAccountRegistryIpAccountSaltResponse = Hex;

export type IpAccountRegistryGetIpAccountImplResponse = Address;

/**
 * IpAccountRegistryIpAccountRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAccountRegistryIpAccountRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

export type IpAccountRegistryIpAccountResponse = Address;

/**
 * IpAccountRegistryRegisterIpAccountRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAccountRegistryRegisterIpAccountRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

/**
 * IpAccountRegistryIpAccountRegisteredEvent
 *
 * @param account address (optional)
 * @param implementation address (optional)
 * @param chainId uint256 (optional)
 * @param tokenContract address (optional)
 * @param tokenId uint256 (optional)
 */
export type IpAccountRegistryIpAccountRegisteredEvent = {
  account?: Address;
  implementation?: Address;
  chainId?: bigint;
  tokenContract?: Address;
  tokenId?: bigint;
};

/**
 * contract IPAccountRegistry readonly method
 */
export class IpAccountRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x16129393444e5BEb435501Dea41D5ECfB10b76F0",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ERC6551_PUBLIC_REGISTRY for contract IPAccountRegistry
   *
   * @param request IpAccountRegistryErc6551PublicRegistryRequest
   * @return Promise<IpAccountRegistryErc6551PublicRegistryResponse>
   */
  public async erc6551PublicRegistry(): Promise<IpAccountRegistryErc6551PublicRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: "ERC6551_PUBLIC_REGISTRY",
    });
  }

  /**
   * method IP_ACCOUNT_IMPL for contract IPAccountRegistry
   *
   * @param request IpAccountRegistryIpAccountImplRequest
   * @return Promise<IpAccountRegistryIpAccountImplResponse>
   */
  public async ipAccountImpl(): Promise<IpAccountRegistryIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_IMPL",
    });
  }

  /**
   * method IP_ACCOUNT_SALT for contract IPAccountRegistry
   *
   * @param request IpAccountRegistryIpAccountSaltRequest
   * @return Promise<IpAccountRegistryIpAccountSaltResponse>
   */
  public async ipAccountSalt(): Promise<IpAccountRegistryIpAccountSaltResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_SALT",
    });
  }

  /**
   * method getIPAccountImpl for contract IPAccountRegistry
   *
   * @param request IpAccountRegistryGetIpAccountImplRequest
   * @return Promise<IpAccountRegistryGetIpAccountImplResponse>
   */
  public async getIpAccountImpl(): Promise<IpAccountRegistryGetIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: "getIPAccountImpl",
    });
  }

  /**
   * method ipAccount for contract IPAccountRegistry
   *
   * @param request IpAccountRegistryIpAccountRequest
   * @return Promise<IpAccountRegistryIpAccountResponse>
   */
  public async ipAccount(
    request: IpAccountRegistryIpAccountRequest,
  ): Promise<IpAccountRegistryIpAccountResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: "ipAccount",
      args: [request.chainId, request.tokenContract, request.tokenId],
    });
  }
}

/**
 * contract IPAccountRegistry write method
 */
export class IpAccountRegistryClient extends IpAccountRegistryReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x16129393444e5BEb435501Dea41D5ECfB10b76F0",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method registerIpAccount for contract IPAccountRegistry
   *
   * @param request IpAccountRegistryRegisterIpAccountRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAccount(
    request: IpAccountRegistryRegisterIpAccountRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: "registerIpAccount",
      account: this.wallet.account,
      args: [request.chainId, request.tokenContract, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract IPAccountRegistry event
 */
export class IpAccountRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x16129393444e5BEb435501Dea41D5ECfB10b76F0",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event IPAccountRegistered for contract IPAccountRegistry
   */
  public watchIpAccountRegisteredEvent(
    onLogs: (txHash: Hex, ev: IpAccountRegistryIpAccountRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAccountRegistryAbi,
      address: this.address,
      eventName: "IPAccountRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract IPAssetRegistry =============================================================

export type IpAssetRegistryErc6551PublicRegistryResponse = Address;

export type IpAssetRegistryIpAccountImplResponse = Address;

export type IpAssetRegistryIpAccountSaltResponse = Hex;

export type IpAssetRegistryModuleRegistryResponse = Address;

export type IpAssetRegistryRegistrationModuleResponse = Address;

export type IpAssetRegistryGetGovernanceResponse = Address;

export type IpAssetRegistryGetIpAccountImplResponse = Address;

export type IpAssetRegistryGovernanceResponse = Address;

/**
 * IpAssetRegistryIpAccountRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryIpAccountRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

export type IpAssetRegistryIpAccountResponse = Address;

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
 * IpAssetRegistryIsApprovedForAllRequest
 *
 * @param owner address
 * @param operator address
 */
export type IpAssetRegistryIsApprovedForAllRequest = {
  owner: Address;
  operator: Address;
};

export type IpAssetRegistryIsApprovedForAllResponse = boolean;

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
 * IpAssetRegistryMetadataRequest
 *
 * @param id address
 */
export type IpAssetRegistryMetadataRequest = {
  id: Address;
};

export type IpAssetRegistryMetadataResponse = Hex;

/**
 * IpAssetRegistryMetadataProviderRequest
 *
 * @param id address
 */
export type IpAssetRegistryMetadataProviderRequest = {
  id: Address;
};

export type IpAssetRegistryMetadataProviderResponse = Address;

export type IpAssetRegistryMetadataProvider2Response = Address;

/**
 * IpAssetRegistryResolverRequest
 *
 * @param id address
 */
export type IpAssetRegistryResolverRequest = {
  id: Address;
};

export type IpAssetRegistryResolverResponse = Address;

export type IpAssetRegistryTotalSupplyResponse = bigint;

/**
 * IpAssetRegistryRegisterRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 * @param resolverAddr address
 * @param createAccount bool
 * @param metadata_ bytes
 */
export type IpAssetRegistryRegisterRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  resolverAddr: Address;
  createAccount: boolean;
  metadata_: Hex;
};

/**
 * IpAssetRegistryRegister2Request
 *
 * @param licenseIds uint256[]
 * @param royaltyContext bytes
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 * @param resolverAddr address
 * @param createAccount bool
 * @param metadata_ bytes
 */
export type IpAssetRegistryRegister2Request = {
  licenseIds: readonly bigint[];
  royaltyContext: Hex;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  resolverAddr: Address;
  createAccount: boolean;
  metadata_: Hex;
};

/**
 * IpAssetRegistryRegisterIpAccountRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryRegisterIpAccountRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

/**
 * IpAssetRegistrySetApprovalForAllRequest
 *
 * @param operator address
 * @param approved bool
 */
export type IpAssetRegistrySetApprovalForAllRequest = {
  operator: Address;
  approved: boolean;
};

/**
 * IpAssetRegistrySetGovernanceRequest
 *
 * @param newGovernance address
 */
export type IpAssetRegistrySetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * IpAssetRegistrySetMetadataRequest
 *
 * @param id address
 * @param provider address
 * @param data bytes
 */
export type IpAssetRegistrySetMetadataRequest = {
  id: Address;
  provider: Address;
  data: Hex;
};

/**
 * IpAssetRegistrySetMetadataProviderRequest
 *
 * @param newMetadataProvider address
 */
export type IpAssetRegistrySetMetadataProviderRequest = {
  newMetadataProvider: Address;
};

/**
 * IpAssetRegistrySetRegistrationModuleRequest
 *
 * @param registrationModule address
 */
export type IpAssetRegistrySetRegistrationModuleRequest = {
  registrationModule: Address;
};

/**
 * IpAssetRegistrySetResolverRequest
 *
 * @param id address
 * @param resolverAddr address
 */
export type IpAssetRegistrySetResolverRequest = {
  id: Address;
  resolverAddr: Address;
};

/**
 * IpAssetRegistryApprovalForAllEvent
 *
 * @param owner address (optional)
 * @param operator address (optional)
 * @param approved bool (optional)
 */
export type IpAssetRegistryApprovalForAllEvent = {
  owner?: Address;
  operator?: Address;
  approved?: boolean;
};

/**
 * IpAssetRegistryGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type IpAssetRegistryGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * IpAssetRegistryIpAccountRegisteredEvent
 *
 * @param account address (optional)
 * @param implementation address (optional)
 * @param chainId uint256 (optional)
 * @param tokenContract address (optional)
 * @param tokenId uint256 (optional)
 */
export type IpAssetRegistryIpAccountRegisteredEvent = {
  account?: Address;
  implementation?: Address;
  chainId?: bigint;
  tokenContract?: Address;
  tokenId?: bigint;
};

/**
 * IpAssetRegistryIpRegisteredEvent
 *
 * @param ipId address (optional)
 * @param chainId uint256 (optional)
 * @param tokenContract address (optional)
 * @param tokenId uint256 (optional)
 * @param resolver address (optional)
 * @param provider address (optional)
 * @param metadata bytes (optional)
 */
export type IpAssetRegistryIpRegisteredEvent = {
  ipId?: Address;
  chainId?: bigint;
  tokenContract?: Address;
  tokenId?: bigint;
  resolver?: Address;
  provider?: Address;
  metadata?: Hex;
};

/**
 * IpAssetRegistryIpResolverSetEvent
 *
 * @param ipId address (optional)
 * @param resolver address (optional)
 */
export type IpAssetRegistryIpResolverSetEvent = {
  ipId?: Address;
  resolver?: Address;
};

/**
 * IpAssetRegistryMetadataSetEvent
 *
 * @param ipId address (optional)
 * @param metadataProvider address (optional)
 * @param metadata bytes (optional)
 */
export type IpAssetRegistryMetadataSetEvent = {
  ipId?: Address;
  metadataProvider?: Address;
  metadata?: Hex;
};

/**
 * contract IPAssetRegistry readonly method
 */
export class IpAssetRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xAAe9e83F8cE8832270AF033c609e233686f0E0eB",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ERC6551_PUBLIC_REGISTRY for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryErc6551PublicRegistryRequest
   * @return Promise<IpAssetRegistryErc6551PublicRegistryResponse>
   */
  public async erc6551PublicRegistry(): Promise<IpAssetRegistryErc6551PublicRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "ERC6551_PUBLIC_REGISTRY",
    });
  }

  /**
   * method IP_ACCOUNT_IMPL for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIpAccountImplRequest
   * @return Promise<IpAssetRegistryIpAccountImplResponse>
   */
  public async ipAccountImpl(): Promise<IpAssetRegistryIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_IMPL",
    });
  }

  /**
   * method IP_ACCOUNT_SALT for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIpAccountSaltRequest
   * @return Promise<IpAssetRegistryIpAccountSaltResponse>
   */
  public async ipAccountSalt(): Promise<IpAssetRegistryIpAccountSaltResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_SALT",
    });
  }

  /**
   * method MODULE_REGISTRY for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryModuleRegistryRequest
   * @return Promise<IpAssetRegistryModuleRegistryResponse>
   */
  public async moduleRegistry(): Promise<IpAssetRegistryModuleRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "MODULE_REGISTRY",
    });
  }

  /**
   * method REGISTRATION_MODULE for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegistrationModuleRequest
   * @return Promise<IpAssetRegistryRegistrationModuleResponse>
   */
  public async registrationModule(): Promise<IpAssetRegistryRegistrationModuleResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "REGISTRATION_MODULE",
    });
  }

  /**
   * method getGovernance for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryGetGovernanceRequest
   * @return Promise<IpAssetRegistryGetGovernanceResponse>
   */
  public async getGovernance(): Promise<IpAssetRegistryGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method getIPAccountImpl for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryGetIpAccountImplRequest
   * @return Promise<IpAssetRegistryGetIpAccountImplResponse>
   */
  public async getIpAccountImpl(): Promise<IpAssetRegistryGetIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "getIPAccountImpl",
    });
  }

  /**
   * method governance for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryGovernanceRequest
   * @return Promise<IpAssetRegistryGovernanceResponse>
   */
  public async governance(): Promise<IpAssetRegistryGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "governance",
    });
  }

  /**
   * method ipAccount for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIpAccountRequest
   * @return Promise<IpAssetRegistryIpAccountResponse>
   */
  public async ipAccount(
    request: IpAssetRegistryIpAccountRequest,
  ): Promise<IpAssetRegistryIpAccountResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "ipAccount",
      args: [request.chainId, request.tokenContract, request.tokenId],
    });
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
   * method isApprovedForAll for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIsApprovedForAllRequest
   * @return Promise<IpAssetRegistryIsApprovedForAllResponse>
   */
  public async isApprovedForAll(
    request: IpAssetRegistryIsApprovedForAllRequest,
  ): Promise<IpAssetRegistryIsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "isApprovedForAll",
      args: [request.owner, request.operator],
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

  /**
   * method metadata for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryMetadataRequest
   * @return Promise<IpAssetRegistryMetadataResponse>
   */
  public async metadata(
    request: IpAssetRegistryMetadataRequest,
  ): Promise<IpAssetRegistryMetadataResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "metadata",
      args: [request.id],
    });
  }

  /**
   * method metadataProvider for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryMetadataProviderRequest
   * @return Promise<IpAssetRegistryMetadataProviderResponse>
   */
  public async metadataProvider(
    request: IpAssetRegistryMetadataProviderRequest,
  ): Promise<IpAssetRegistryMetadataProviderResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "metadataProvider",
      args: [request.id],
    });
  }

  /**
   * method metadataProvider for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryMetadataProvider2Request
   * @return Promise<IpAssetRegistryMetadataProvider2Response>
   */
  public async metadataProvider2(): Promise<IpAssetRegistryMetadataProvider2Response> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "metadataProvider",
    });
  }

  /**
   * method resolver for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryResolverRequest
   * @return Promise<IpAssetRegistryResolverResponse>
   */
  public async resolver(
    request: IpAssetRegistryResolverRequest,
  ): Promise<IpAssetRegistryResolverResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "resolver",
      args: [request.id],
    });
  }

  /**
   * method totalSupply for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryTotalSupplyRequest
   * @return Promise<IpAssetRegistryTotalSupplyResponse>
   */
  public async totalSupply(): Promise<IpAssetRegistryTotalSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "totalSupply",
    });
  }
}

/**
 * contract IPAssetRegistry write method
 */
export class IpAssetRegistryClient extends IpAssetRegistryReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xAAe9e83F8cE8832270AF033c609e233686f0E0eB",
  ) {
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
      args: [
        request.chainId,
        request.tokenContract,
        request.tokenId,
        request.resolverAddr,
        request.createAccount,
        request.metadata_,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method register for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegister2Request
   * @return Promise<WriteContractReturnType>
   */
  public async register2(
    request: IpAssetRegistryRegister2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "register",
      account: this.wallet.account,
      args: [
        request.licenseIds,
        request.royaltyContext,
        request.chainId,
        request.tokenContract,
        request.tokenId,
        request.resolverAddr,
        request.createAccount,
        request.metadata_,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method registerIpAccount for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegisterIpAccountRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAccount(
    request: IpAssetRegistryRegisterIpAccountRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "registerIpAccount",
      account: this.wallet.account,
      args: [request.chainId, request.tokenContract, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setApprovalForAll for contract IPAssetRegistry
   *
   * @param request IpAssetRegistrySetApprovalForAllRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApprovalForAll(
    request: IpAssetRegistrySetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "setApprovalForAll",
      account: this.wallet.account,
      args: [request.operator, request.approved],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract IPAssetRegistry
   *
   * @param request IpAssetRegistrySetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: IpAssetRegistrySetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setMetadata for contract IPAssetRegistry
   *
   * @param request IpAssetRegistrySetMetadataRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMetadata(
    request: IpAssetRegistrySetMetadataRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "setMetadata",
      account: this.wallet.account,
      args: [request.id, request.provider, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setMetadataProvider for contract IPAssetRegistry
   *
   * @param request IpAssetRegistrySetMetadataProviderRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMetadataProvider(
    request: IpAssetRegistrySetMetadataProviderRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "setMetadataProvider",
      account: this.wallet.account,
      args: [request.newMetadataProvider],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setRegistrationModule for contract IPAssetRegistry
   *
   * @param request IpAssetRegistrySetRegistrationModuleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setRegistrationModule(
    request: IpAssetRegistrySetRegistrationModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "setRegistrationModule",
      account: this.wallet.account,
      args: [request.registrationModule],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setResolver for contract IPAssetRegistry
   *
   * @param request IpAssetRegistrySetResolverRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setResolver(
    request: IpAssetRegistrySetResolverRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "setResolver",
      account: this.wallet.account,
      args: [request.id, request.resolverAddr],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract IPAssetRegistry event
 */
export class IpAssetRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xAAe9e83F8cE8832270AF033c609e233686f0E0eB",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event ApprovalForAll for contract IPAssetRegistry
   */
  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryApprovalForAllEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "ApprovalForAll",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event GovernanceUpdated for contract IPAssetRegistry
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event IPAccountRegistered for contract IPAssetRegistry
   */
  public watchIpAccountRegisteredEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryIpAccountRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "IPAccountRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event IPRegistered for contract IPAssetRegistry
   */
  public watchIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryIpRegisteredEvent) => void,
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
   * event IPResolverSet for contract IPAssetRegistry
   */
  public watchIpResolverSetEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryIpResolverSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "IPResolverSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event MetadataSet for contract IPAssetRegistry
   */
  public watchMetadataSetEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryMetadataSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "MetadataSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract IPAssetRenderer =============================================================

export type IpAssetRendererIpAssetRegistryResponse = Address;

export type IpAssetRendererLicenseRegistryResponse = Address;

export type IpAssetRendererRoyaltyModuleResponse = Address;

/**
 * IpAssetRendererDescriptionRequest
 *
 * @param ipId address
 */
export type IpAssetRendererDescriptionRequest = {
  ipId: Address;
};

export type IpAssetRendererDescriptionResponse = string;

/**
 * IpAssetRendererHashRequest
 *
 * @param ipId address
 */
export type IpAssetRendererHashRequest = {
  ipId: Address;
};

export type IpAssetRendererHashResponse = Hex;

/**
 * IpAssetRendererNameRequest
 *
 * @param ipId address
 */
export type IpAssetRendererNameRequest = {
  ipId: Address;
};

export type IpAssetRendererNameResponse = string;

/**
 * IpAssetRendererOwnerRequest
 *
 * @param ipId address
 */
export type IpAssetRendererOwnerRequest = {
  ipId: Address;
};

export type IpAssetRendererOwnerResponse = Address;

/**
 * IpAssetRendererRegistrantRequest
 *
 * @param ipId address
 */
export type IpAssetRendererRegistrantRequest = {
  ipId: Address;
};

export type IpAssetRendererRegistrantResponse = Address;

/**
 * IpAssetRendererRegistrationDateRequest
 *
 * @param ipId address
 */
export type IpAssetRendererRegistrationDateRequest = {
  ipId: Address;
};

export type IpAssetRendererRegistrationDateResponse = bigint;

/**
 * IpAssetRendererTokenUriRequest
 *
 * @param ipId address
 */
export type IpAssetRendererTokenUriRequest = {
  ipId: Address;
};

export type IpAssetRendererTokenUriResponse = string;

/**
 * IpAssetRendererUriRequest
 *
 * @param ipId address
 */
export type IpAssetRendererUriRequest = {
  ipId: Address;
};

export type IpAssetRendererUriResponse = string;

/**
 * contract IPAssetRenderer readonly method
 */
export class IpAssetRendererReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x39cCE13916e7bfdeFa462D360d551aEcc6D82311",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method IP_ASSET_REGISTRY for contract IPAssetRenderer
   *
   * @param request IpAssetRendererIpAssetRegistryRequest
   * @return Promise<IpAssetRendererIpAssetRegistryResponse>
   */
  public async ipAssetRegistry(): Promise<IpAssetRendererIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "IP_ASSET_REGISTRY",
    });
  }

  /**
   * method LICENSE_REGISTRY for contract IPAssetRenderer
   *
   * @param request IpAssetRendererLicenseRegistryRequest
   * @return Promise<IpAssetRendererLicenseRegistryResponse>
   */
  public async licenseRegistry(): Promise<IpAssetRendererLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "LICENSE_REGISTRY",
    });
  }

  /**
   * method ROYALTY_MODULE for contract IPAssetRenderer
   *
   * @param request IpAssetRendererRoyaltyModuleRequest
   * @return Promise<IpAssetRendererRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<IpAssetRendererRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method description for contract IPAssetRenderer
   *
   * @param request IpAssetRendererDescriptionRequest
   * @return Promise<IpAssetRendererDescriptionResponse>
   */
  public async description(
    request: IpAssetRendererDescriptionRequest,
  ): Promise<IpAssetRendererDescriptionResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "description",
      args: [request.ipId],
    });
  }

  /**
   * method hash for contract IPAssetRenderer
   *
   * @param request IpAssetRendererHashRequest
   * @return Promise<IpAssetRendererHashResponse>
   */
  public async hash(request: IpAssetRendererHashRequest): Promise<IpAssetRendererHashResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "hash",
      args: [request.ipId],
    });
  }

  /**
   * method name for contract IPAssetRenderer
   *
   * @param request IpAssetRendererNameRequest
   * @return Promise<IpAssetRendererNameResponse>
   */
  public async name(request: IpAssetRendererNameRequest): Promise<IpAssetRendererNameResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "name",
      args: [request.ipId],
    });
  }

  /**
   * method owner for contract IPAssetRenderer
   *
   * @param request IpAssetRendererOwnerRequest
   * @return Promise<IpAssetRendererOwnerResponse>
   */
  public async owner(request: IpAssetRendererOwnerRequest): Promise<IpAssetRendererOwnerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "owner",
      args: [request.ipId],
    });
  }

  /**
   * method registrant for contract IPAssetRenderer
   *
   * @param request IpAssetRendererRegistrantRequest
   * @return Promise<IpAssetRendererRegistrantResponse>
   */
  public async registrant(
    request: IpAssetRendererRegistrantRequest,
  ): Promise<IpAssetRendererRegistrantResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "registrant",
      args: [request.ipId],
    });
  }

  /**
   * method registrationDate for contract IPAssetRenderer
   *
   * @param request IpAssetRendererRegistrationDateRequest
   * @return Promise<IpAssetRendererRegistrationDateResponse>
   */
  public async registrationDate(
    request: IpAssetRendererRegistrationDateRequest,
  ): Promise<IpAssetRendererRegistrationDateResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "registrationDate",
      args: [request.ipId],
    });
  }

  /**
   * method tokenURI for contract IPAssetRenderer
   *
   * @param request IpAssetRendererTokenUriRequest
   * @return Promise<IpAssetRendererTokenUriResponse>
   */
  public async tokenUri(
    request: IpAssetRendererTokenUriRequest,
  ): Promise<IpAssetRendererTokenUriResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "tokenURI",
      args: [request.ipId],
    });
  }

  /**
   * method uri for contract IPAssetRenderer
   *
   * @param request IpAssetRendererUriRequest
   * @return Promise<IpAssetRendererUriResponse>
   */
  public async uri(request: IpAssetRendererUriRequest): Promise<IpAssetRendererUriResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: "uri",
      args: [request.ipId],
    });
  }
}

// Contract IPMetadataProvider =============================================================

export type IpMetadataProviderIpAssetRegistryResponse = Address;

/**
 * IpMetadataProviderGetMetadataRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderGetMetadataRequest = {
  ipId: Address;
};

export type IpMetadataProviderGetMetadataResponse = Hex;

/**
 * IpMetadataProviderHashRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderHashRequest = {
  ipId: Address;
};

export type IpMetadataProviderHashResponse = Hex;

/**
 * IpMetadataProviderMetadataRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderMetadataRequest = {
  ipId: Address;
};

export type IpMetadataProviderMetadataResponse = {
  name: string;
  hash: Hex;
  registrationDate: bigint;
  registrant: Address;
  uri: string;
};

/**
 * IpMetadataProviderNameRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderNameRequest = {
  ipId: Address;
};

export type IpMetadataProviderNameResponse = string;

/**
 * IpMetadataProviderRegistrantRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderRegistrantRequest = {
  ipId: Address;
};

export type IpMetadataProviderRegistrantResponse = Address;

/**
 * IpMetadataProviderRegistrationDateRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderRegistrationDateRequest = {
  ipId: Address;
};

export type IpMetadataProviderRegistrationDateResponse = bigint;

export type IpMetadataProviderUpgradeProviderResponse = Address;

/**
 * IpMetadataProviderUriRequest
 *
 * @param ipId address
 */
export type IpMetadataProviderUriRequest = {
  ipId: Address;
};

export type IpMetadataProviderUriResponse = string;

/**
 * IpMetadataProviderSetMetadataRequest
 *
 * @param ipId address
 * @param metadata bytes
 */
export type IpMetadataProviderSetMetadataRequest = {
  ipId: Address;
  metadata: Hex;
};

/**
 * IpMetadataProviderSetUpgradeProviderRequest
 *
 * @param provider address
 */
export type IpMetadataProviderSetUpgradeProviderRequest = {
  provider: Address;
};

/**
 * IpMetadataProviderUpgradeRequest
 *
 * @param ipId address
 * @param metadata bytes
 */
export type IpMetadataProviderUpgradeRequest = {
  ipId: Address;
  metadata: Hex;
};

/**
 * IpMetadataProviderMetadataSetEvent
 *
 * @param ipId address (optional)
 * @param metadata bytes (optional)
 */
export type IpMetadataProviderMetadataSetEvent = {
  ipId?: Address;
  metadata?: Hex;
};

/**
 * contract IPMetadataProvider readonly method
 */
export class IpMetadataProviderReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method IP_ASSET_REGISTRY for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderIpAssetRegistryRequest
   * @return Promise<IpMetadataProviderIpAssetRegistryResponse>
   */
  public async ipAssetRegistry(): Promise<IpMetadataProviderIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "IP_ASSET_REGISTRY",
    });
  }

  /**
   * method getMetadata for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderGetMetadataRequest
   * @return Promise<IpMetadataProviderGetMetadataResponse>
   */
  public async getMetadata(
    request: IpMetadataProviderGetMetadataRequest,
  ): Promise<IpMetadataProviderGetMetadataResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "getMetadata",
      args: [request.ipId],
    });
  }

  /**
   * method hash for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderHashRequest
   * @return Promise<IpMetadataProviderHashResponse>
   */
  public async hash(
    request: IpMetadataProviderHashRequest,
  ): Promise<IpMetadataProviderHashResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "hash",
      args: [request.ipId],
    });
  }

  /**
   * method metadata for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderMetadataRequest
   * @return Promise<IpMetadataProviderMetadataResponse>
   */
  public async metadata(
    request: IpMetadataProviderMetadataRequest,
  ): Promise<IpMetadataProviderMetadataResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "metadata",
      args: [request.ipId],
    });
  }

  /**
   * method name for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderNameRequest
   * @return Promise<IpMetadataProviderNameResponse>
   */
  public async name(
    request: IpMetadataProviderNameRequest,
  ): Promise<IpMetadataProviderNameResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "name",
      args: [request.ipId],
    });
  }

  /**
   * method registrant for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderRegistrantRequest
   * @return Promise<IpMetadataProviderRegistrantResponse>
   */
  public async registrant(
    request: IpMetadataProviderRegistrantRequest,
  ): Promise<IpMetadataProviderRegistrantResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "registrant",
      args: [request.ipId],
    });
  }

  /**
   * method registrationDate for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderRegistrationDateRequest
   * @return Promise<IpMetadataProviderRegistrationDateResponse>
   */
  public async registrationDate(
    request: IpMetadataProviderRegistrationDateRequest,
  ): Promise<IpMetadataProviderRegistrationDateResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "registrationDate",
      args: [request.ipId],
    });
  }

  /**
   * method upgradeProvider for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderUpgradeProviderRequest
   * @return Promise<IpMetadataProviderUpgradeProviderResponse>
   */
  public async upgradeProvider(): Promise<IpMetadataProviderUpgradeProviderResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "upgradeProvider",
    });
  }

  /**
   * method uri for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderUriRequest
   * @return Promise<IpMetadataProviderUriResponse>
   */
  public async uri(request: IpMetadataProviderUriRequest): Promise<IpMetadataProviderUriResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "uri",
      args: [request.ipId],
    });
  }
}

/**
 * contract IPMetadataProvider write method
 */
export class IpMetadataProviderClient extends IpMetadataProviderReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method setMetadata for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderSetMetadataRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMetadata(
    request: IpMetadataProviderSetMetadataRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "setMetadata",
      account: this.wallet.account,
      args: [request.ipId, request.metadata],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setUpgradeProvider for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderSetUpgradeProviderRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setUpgradeProvider(
    request: IpMetadataProviderSetUpgradeProviderRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "setUpgradeProvider",
      account: this.wallet.account,
      args: [request.provider],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method upgrade for contract IPMetadataProvider
   *
   * @param request IpMetadataProviderUpgradeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgrade(
    request: IpMetadataProviderUpgradeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: "upgrade",
      account: this.wallet.account,
      args: [request.ipId, request.metadata],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract IPMetadataProvider event
 */
export class IpMetadataProviderEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event MetadataSet for contract IPMetadataProvider
   */
  public watchMetadataSetEvent(
    onLogs: (txHash: Hex, ev: IpMetadataProviderMetadataSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipMetadataProviderAbi,
      address: this.address,
      eventName: "MetadataSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract IPResolver =============================================================

export type IpResolverAccessControllerResponse = Address;

export type IpResolverIpAccountRegistryResponse = Address;

export type IpResolverNameResponse = string;

/**
 * IpResolverSupportsInterfaceRequest
 *
 * @param id bytes4
 */
export type IpResolverSupportsInterfaceRequest = {
  id: Hex;
};

export type IpResolverSupportsInterfaceResponse = boolean;

/**
 * IpResolverValueRequest
 *
 * @param ipId address
 * @param key string
 */
export type IpResolverValueRequest = {
  ipId: Address;
  key: string;
};

export type IpResolverValueResponse = string;

/**
 * IpResolverSetValueRequest
 *
 * @param ipId address
 * @param key string
 * @param val string
 */
export type IpResolverSetValueRequest = {
  ipId: Address;
  key: string;
  val: string;
};

/**
 * IpResolverKeyValueSetEvent
 *
 * @param ipId address (optional)
 * @param key string (optional)
 * @param value string (optional)
 */
export type IpResolverKeyValueSetEvent = {
  ipId?: Address;
  key?: string;
  value?: string;
};

/**
 * contract IPResolver readonly method
 */
export class IpResolverReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ACCESS_CONTROLLER for contract IPResolver
   *
   * @param request IpResolverAccessControllerRequest
   * @return Promise<IpResolverAccessControllerResponse>
   */
  public async accessController(): Promise<IpResolverAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract IPResolver
   *
   * @param request IpResolverIpAccountRegistryRequest
   * @return Promise<IpResolverIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<IpResolverIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method name for contract IPResolver
   *
   * @param request IpResolverNameRequest
   * @return Promise<IpResolverNameResponse>
   */
  public async name(): Promise<IpResolverNameResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method supportsInterface for contract IPResolver
   *
   * @param request IpResolverSupportsInterfaceRequest
   * @return Promise<IpResolverSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: IpResolverSupportsInterfaceRequest,
  ): Promise<IpResolverSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.id],
    });
  }

  /**
   * method value for contract IPResolver
   *
   * @param request IpResolverValueRequest
   * @return Promise<IpResolverValueResponse>
   */
  public async value(request: IpResolverValueRequest): Promise<IpResolverValueResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: "value",
      args: [request.ipId, request.key],
    });
  }
}

/**
 * contract IPResolver write method
 */
export class IpResolverClient extends IpResolverReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method setValue for contract IPResolver
   *
   * @param request IpResolverSetValueRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setValue(request: IpResolverSetValueRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: "setValue",
      account: this.wallet.account,
      args: [request.ipId, request.key, request.val],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract IPResolver event
 */
export class IpResolverEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event KeyValueSet for contract IPResolver
   */
  public watchKeyValueSetEvent(
    onLogs: (txHash: Hex, ev: IpResolverKeyValueSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipResolverAbi,
      address: this.address,
      eventName: "KeyValueSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract LicenseRegistry =============================================================

export type LicenseRegistryDisputeModuleResponse = Address;

export type LicenseRegistryLicensingModuleResponse = Address;

/**
 * LicenseRegistryBalanceOfRequest
 *
 * @param account address
 * @param id uint256
 */
export type LicenseRegistryBalanceOfRequest = {
  account: Address;
  id: bigint;
};

export type LicenseRegistryBalanceOfResponse = bigint;

/**
 * LicenseRegistryBalanceOfBatchRequest
 *
 * @param accounts address[]
 * @param ids uint256[]
 */
export type LicenseRegistryBalanceOfBatchRequest = {
  accounts: readonly Address[];
  ids: readonly bigint[];
};

export type LicenseRegistryBalanceOfBatchResponse = readonly bigint[];

export type LicenseRegistryGetGovernanceResponse = Address;

export type LicenseRegistryGovernanceResponse = Address;

export type LicenseRegistryImageUrlResponse = string;

/**
 * LicenseRegistryIsApprovedForAllRequest
 *
 * @param account address
 * @param operator address
 */
export type LicenseRegistryIsApprovedForAllRequest = {
  account: Address;
  operator: Address;
};

export type LicenseRegistryIsApprovedForAllResponse = boolean;

/**
 * LicenseRegistryIsLicenseRevokedRequest
 *
 * @param licenseId uint256
 */
export type LicenseRegistryIsLicenseRevokedRequest = {
  licenseId: bigint;
};

export type LicenseRegistryIsLicenseRevokedResponse = boolean;

/**
 * LicenseRegistryIsLicenseeRequest
 *
 * @param licenseId uint256
 * @param holder address
 */
export type LicenseRegistryIsLicenseeRequest = {
  licenseId: bigint;
  holder: Address;
};

export type LicenseRegistryIsLicenseeResponse = boolean;

/**
 * LicenseRegistryLicenseRequest
 *
 * @param licenseId uint256
 */
export type LicenseRegistryLicenseRequest = {
  licenseId: bigint;
};

export type LicenseRegistryLicenseResponse = {
  policyId: bigint;
  licensorIpId: Address;
  transferable: boolean;
};

/**
 * LicenseRegistryLicensorIpIdRequest
 *
 * @param licenseId uint256
 */
export type LicenseRegistryLicensorIpIdRequest = {
  licenseId: bigint;
};

export type LicenseRegistryLicensorIpIdResponse = Address;

export type LicenseRegistryMintedLicensesResponse = bigint;

export type LicenseRegistryNameResponse = string;

/**
 * LicenseRegistryPolicyIdForLicenseRequest
 *
 * @param licenseId uint256
 */
export type LicenseRegistryPolicyIdForLicenseRequest = {
  licenseId: bigint;
};

export type LicenseRegistryPolicyIdForLicenseResponse = bigint;

/**
 * LicenseRegistrySupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type LicenseRegistrySupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type LicenseRegistrySupportsInterfaceResponse = boolean;

export type LicenseRegistrySymbolResponse = string;

/**
 * LicenseRegistryUriRequest
 *
 * @param id uint256
 */
export type LicenseRegistryUriRequest = {
  id: bigint;
};

export type LicenseRegistryUriResponse = string;

/**
 * LicenseRegistryBurnLicensesRequest
 *
 * @param holder address
 * @param licenseIds uint256[]
 */
export type LicenseRegistryBurnLicensesRequest = {
  holder: Address;
  licenseIds: readonly bigint[];
};

/**
 * LicenseRegistryMintLicenseRequest
 *
 * @param policyId uint256
 * @param licensorIpId_ address
 * @param transferable bool
 * @param amount uint256
 * @param receiver address
 */
export type LicenseRegistryMintLicenseRequest = {
  policyId: bigint;
  licensorIpId_: Address;
  transferable: boolean;
  amount: bigint;
  receiver: Address;
};

/**
 * LicenseRegistrySafeBatchTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param ids uint256[]
 * @param values uint256[]
 * @param data bytes
 */
export type LicenseRegistrySafeBatchTransferFromRequest = {
  from: Address;
  to: Address;
  ids: readonly bigint[];
  values: readonly bigint[];
  data: Hex;
};

/**
 * LicenseRegistrySafeTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param id uint256
 * @param value uint256
 * @param data bytes
 */
export type LicenseRegistrySafeTransferFromRequest = {
  from: Address;
  to: Address;
  id: bigint;
  value: bigint;
  data: Hex;
};

/**
 * LicenseRegistrySetApprovalForAllRequest
 *
 * @param operator address
 * @param approved bool
 */
export type LicenseRegistrySetApprovalForAllRequest = {
  operator: Address;
  approved: boolean;
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
 * LicenseRegistrySetGovernanceRequest
 *
 * @param newGovernance address
 */
export type LicenseRegistrySetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * LicenseRegistrySetLicensingImageUrlRequest
 *
 * @param url string
 */
export type LicenseRegistrySetLicensingImageUrlRequest = {
  url: string;
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
 * LicenseRegistryApprovalForAllEvent
 *
 * @param account address (optional)
 * @param operator address (optional)
 * @param approved bool (optional)
 */
export type LicenseRegistryApprovalForAllEvent = {
  account?: Address;
  operator?: Address;
  approved?: boolean;
};

/**
 * LicenseRegistryBatchMetadataUpdateEvent
 *
 * @param _fromTokenId uint256 (optional)
 * @param _toTokenId uint256 (optional)
 */
export type LicenseRegistryBatchMetadataUpdateEvent = {
  _fromTokenId?: bigint;
  _toTokenId?: bigint;
};

/**
 * LicenseRegistryGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type LicenseRegistryGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * LicenseRegistryLicenseMintedEvent
 *
 * @param creator address (optional)
 * @param receiver address (optional)
 * @param licenseId uint256 (optional)
 * @param amount uint256 (optional)
 * @param licenseData tuple (optional)
 */
export type LicenseRegistryLicenseMintedEvent = {
  creator?: Address;
  receiver?: Address;
  licenseId?: bigint;
  amount?: bigint;
  licenseData?: {
    policyId: bigint;
    licensorIpId: Address;
    transferable: boolean;
  };
};

/**
 * LicenseRegistryTransferBatchEvent
 *
 * @param operator address (optional)
 * @param from address (optional)
 * @param to address (optional)
 * @param ids uint256[] (optional)
 * @param values uint256[] (optional)
 */
export type LicenseRegistryTransferBatchEvent = {
  operator?: Address;
  from?: Address;
  to?: Address;
  ids?: readonly bigint[];
  values?: readonly bigint[];
};

/**
 * LicenseRegistryTransferSingleEvent
 *
 * @param operator address (optional)
 * @param from address (optional)
 * @param to address (optional)
 * @param id uint256 (optional)
 * @param value uint256 (optional)
 */
export type LicenseRegistryTransferSingleEvent = {
  operator?: Address;
  from?: Address;
  to?: Address;
  id?: bigint;
  value?: bigint;
};

/**
 * LicenseRegistryUriEvent
 *
 * @param value string (optional)
 * @param id uint256 (optional)
 */
export type LicenseRegistryUriEvent = {
  value?: string;
  id?: bigint;
};

/**
 * contract LicenseRegistry readonly method
 */
export class LicenseRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method DISPUTE_MODULE for contract LicenseRegistry
   *
   * @param request LicenseRegistryDisputeModuleRequest
   * @return Promise<LicenseRegistryDisputeModuleResponse>
   */
  public async disputeModule(): Promise<LicenseRegistryDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "DISPUTE_MODULE",
    });
  }

  /**
   * method LICENSING_MODULE for contract LicenseRegistry
   *
   * @param request LicenseRegistryLicensingModuleRequest
   * @return Promise<LicenseRegistryLicensingModuleResponse>
   */
  public async licensingModule(): Promise<LicenseRegistryLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "LICENSING_MODULE",
    });
  }

  /**
   * method balanceOf for contract LicenseRegistry
   *
   * @param request LicenseRegistryBalanceOfRequest
   * @return Promise<LicenseRegistryBalanceOfResponse>
   */
  public async balanceOf(
    request: LicenseRegistryBalanceOfRequest,
  ): Promise<LicenseRegistryBalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "balanceOf",
      args: [request.account, request.id],
    });
  }

  /**
   * method balanceOfBatch for contract LicenseRegistry
   *
   * @param request LicenseRegistryBalanceOfBatchRequest
   * @return Promise<LicenseRegistryBalanceOfBatchResponse>
   */
  public async balanceOfBatch(
    request: LicenseRegistryBalanceOfBatchRequest,
  ): Promise<LicenseRegistryBalanceOfBatchResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "balanceOfBatch",
      args: [request.accounts, request.ids],
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
   * method governance for contract LicenseRegistry
   *
   * @param request LicenseRegistryGovernanceRequest
   * @return Promise<LicenseRegistryGovernanceResponse>
   */
  public async governance(): Promise<LicenseRegistryGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "governance",
    });
  }

  /**
   * method imageUrl for contract LicenseRegistry
   *
   * @param request LicenseRegistryImageUrlRequest
   * @return Promise<LicenseRegistryImageUrlResponse>
   */
  public async imageUrl(): Promise<LicenseRegistryImageUrlResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "imageUrl",
    });
  }

  /**
   * method isApprovedForAll for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsApprovedForAllRequest
   * @return Promise<LicenseRegistryIsApprovedForAllResponse>
   */
  public async isApprovedForAll(
    request: LicenseRegistryIsApprovedForAllRequest,
  ): Promise<LicenseRegistryIsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "isApprovedForAll",
      args: [request.account, request.operator],
    });
  }

  /**
   * method isLicenseRevoked for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsLicenseRevokedRequest
   * @return Promise<LicenseRegistryIsLicenseRevokedResponse>
   */
  public async isLicenseRevoked(
    request: LicenseRegistryIsLicenseRevokedRequest,
  ): Promise<LicenseRegistryIsLicenseRevokedResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "isLicenseRevoked",
      args: [request.licenseId],
    });
  }

  /**
   * method isLicensee for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsLicenseeRequest
   * @return Promise<LicenseRegistryIsLicenseeResponse>
   */
  public async isLicensee(
    request: LicenseRegistryIsLicenseeRequest,
  ): Promise<LicenseRegistryIsLicenseeResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "isLicensee",
      args: [request.licenseId, request.holder],
    });
  }

  /**
   * method license for contract LicenseRegistry
   *
   * @param request LicenseRegistryLicenseRequest
   * @return Promise<LicenseRegistryLicenseResponse>
   */
  public async license(
    request: LicenseRegistryLicenseRequest,
  ): Promise<LicenseRegistryLicenseResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "license",
      args: [request.licenseId],
    });
  }

  /**
   * method licensorIpId for contract LicenseRegistry
   *
   * @param request LicenseRegistryLicensorIpIdRequest
   * @return Promise<LicenseRegistryLicensorIpIdResponse>
   */
  public async licensorIpId(
    request: LicenseRegistryLicensorIpIdRequest,
  ): Promise<LicenseRegistryLicensorIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "licensorIpId",
      args: [request.licenseId],
    });
  }

  /**
   * method mintedLicenses for contract LicenseRegistry
   *
   * @param request LicenseRegistryMintedLicensesRequest
   * @return Promise<LicenseRegistryMintedLicensesResponse>
   */
  public async mintedLicenses(): Promise<LicenseRegistryMintedLicensesResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "mintedLicenses",
    });
  }

  /**
   * method name for contract LicenseRegistry
   *
   * @param request LicenseRegistryNameRequest
   * @return Promise<LicenseRegistryNameResponse>
   */
  public async name(): Promise<LicenseRegistryNameResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method policyIdForLicense for contract LicenseRegistry
   *
   * @param request LicenseRegistryPolicyIdForLicenseRequest
   * @return Promise<LicenseRegistryPolicyIdForLicenseResponse>
   */
  public async policyIdForLicense(
    request: LicenseRegistryPolicyIdForLicenseRequest,
  ): Promise<LicenseRegistryPolicyIdForLicenseResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "policyIdForLicense",
      args: [request.licenseId],
    });
  }

  /**
   * method supportsInterface for contract LicenseRegistry
   *
   * @param request LicenseRegistrySupportsInterfaceRequest
   * @return Promise<LicenseRegistrySupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: LicenseRegistrySupportsInterfaceRequest,
  ): Promise<LicenseRegistrySupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }

  /**
   * method symbol for contract LicenseRegistry
   *
   * @param request LicenseRegistrySymbolRequest
   * @return Promise<LicenseRegistrySymbolResponse>
   */
  public async symbol(): Promise<LicenseRegistrySymbolResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "symbol",
    });
  }

  /**
   * method uri for contract LicenseRegistry
   *
   * @param request LicenseRegistryUriRequest
   * @return Promise<LicenseRegistryUriResponse>
   */
  public async uri(request: LicenseRegistryUriRequest): Promise<LicenseRegistryUriResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "uri",
      args: [request.id],
    });
  }
}

/**
 * contract LicenseRegistry write method
 */
export class LicenseRegistryClient extends LicenseRegistryReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method burnLicenses for contract LicenseRegistry
   *
   * @param request LicenseRegistryBurnLicensesRequest
   * @return Promise<WriteContractReturnType>
   */
  public async burnLicenses(
    request: LicenseRegistryBurnLicensesRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "burnLicenses",
      account: this.wallet.account,
      args: [request.holder, request.licenseIds],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method mintLicense for contract LicenseRegistry
   *
   * @param request LicenseRegistryMintLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicense(
    request: LicenseRegistryMintLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "mintLicense",
      account: this.wallet.account,
      args: [
        request.policyId,
        request.licensorIpId_,
        request.transferable,
        request.amount,
        request.receiver,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method safeBatchTransferFrom for contract LicenseRegistry
   *
   * @param request LicenseRegistrySafeBatchTransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async safeBatchTransferFrom(
    request: LicenseRegistrySafeBatchTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "safeBatchTransferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.ids, request.values, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method safeTransferFrom for contract LicenseRegistry
   *
   * @param request LicenseRegistrySafeTransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async safeTransferFrom(
    request: LicenseRegistrySafeTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "safeTransferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.id, request.value, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setApprovalForAll for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetApprovalForAllRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApprovalForAll(
    request: LicenseRegistrySetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setApprovalForAll",
      account: this.wallet.account,
      args: [request.operator, request.approved],
    });
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }

  /**
   * method setLicensingImageUrl for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetLicensingImageUrlRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setLicensingImageUrl(
    request: LicenseRegistrySetLicensingImageUrlRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "setLicensingImageUrl",
      account: this.wallet.account,
      args: [request.url],
    });
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract LicenseRegistry event
 */
export class LicenseRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event ApprovalForAll for contract LicenseRegistry
   */
  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryApprovalForAllEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "ApprovalForAll",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event BatchMetadataUpdate for contract LicenseRegistry
   */
  public watchBatchMetadataUpdateEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryBatchMetadataUpdateEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "BatchMetadataUpdate",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event GovernanceUpdated for contract LicenseRegistry
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryGovernanceUpdatedEvent) => void,
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
   * event LicenseMinted for contract LicenseRegistry
   */
  public watchLicenseMintedEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryLicenseMintedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "LicenseMinted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event TransferBatch for contract LicenseRegistry
   */
  public watchTransferBatchEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryTransferBatchEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "TransferBatch",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event TransferSingle for contract LicenseRegistry
   */
  public watchTransferSingleEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryTransferSingleEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "TransferSingle",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event URI for contract LicenseRegistry
   */
  public watchUriEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryUriEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "URI",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract LicensingModule =============================================================

export type LicensingModuleAccessControllerResponse = Address;

export type LicensingModuleDisputeModuleResponse = Address;

export type LicensingModuleIpAccountRegistryResponse = Address;

export type LicensingModuleLicenseRegistryResponse = Address;

export type LicensingModuleRoyaltyModuleResponse = Address;

/**
 * LicensingModuleGetPolicyIdRequest
 *
 * @param pol tuple
 */
export type LicensingModuleGetPolicyIdRequest = {
  pol: {
    isLicenseTransferable: boolean;
    policyFramework: Address;
    frameworkData: Hex;
    royaltyPolicy: Address;
    royaltyData: Hex;
    mintingFee: bigint;
    mintingFeeToken: Address;
  };
};

/**
 * LicensingModuleGetPolicyIdResponse
 *
 * @param policyId uint256
 */
export type LicensingModuleGetPolicyIdResponse = {
  policyId: bigint;
};

/**
 * LicensingModuleIsFrameworkRegisteredRequest
 *
 * @param policyFramework address
 */
export type LicensingModuleIsFrameworkRegisteredRequest = {
  policyFramework: Address;
};

export type LicensingModuleIsFrameworkRegisteredResponse = boolean;

/**
 * LicensingModuleIsParentRequest
 *
 * @param parentIpId address
 * @param childIpId address
 */
export type LicensingModuleIsParentRequest = {
  parentIpId: Address;
  childIpId: Address;
};

export type LicensingModuleIsParentResponse = boolean;

/**
 * LicensingModuleIsPolicyDefinedRequest
 *
 * @param policyId uint256
 */
export type LicensingModuleIsPolicyDefinedRequest = {
  policyId: bigint;
};

export type LicensingModuleIsPolicyDefinedResponse = boolean;

/**
 * LicensingModuleIsPolicyIdSetForIpRequest
 *
 * @param isInherited bool
 * @param ipId address
 * @param policyId uint256
 */
export type LicensingModuleIsPolicyIdSetForIpRequest = {
  isInherited: boolean;
  ipId: Address;
  policyId: bigint;
};

export type LicensingModuleIsPolicyIdSetForIpResponse = boolean;

/**
 * LicensingModuleIsPolicyInheritedRequest
 *
 * @param ipId address
 * @param policyId uint256
 */
export type LicensingModuleIsPolicyInheritedRequest = {
  ipId: Address;
  policyId: bigint;
};

export type LicensingModuleIsPolicyInheritedResponse = boolean;

export type LicensingModuleNameResponse = string;

/**
 * LicensingModuleParentIpIdsRequest
 *
 * @param ipId address
 */
export type LicensingModuleParentIpIdsRequest = {
  ipId: Address;
};

export type LicensingModuleParentIpIdsResponse = readonly Address[];

/**
 * LicensingModulePolicyRequest
 *
 * @param policyId uint256
 */
export type LicensingModulePolicyRequest = {
  policyId: bigint;
};

/**
 * LicensingModulePolicyResponse
 *
 * @param pol tuple
 */
export type LicensingModulePolicyResponse = {
  pol: {
    isLicenseTransferable: boolean;
    policyFramework: Address;
    frameworkData: Hex;
    royaltyPolicy: Address;
    royaltyData: Hex;
    mintingFee: bigint;
    mintingFeeToken: Address;
  };
};

/**
 * LicensingModulePolicyAggregatorDataRequest
 *
 * @param framework address
 * @param ipId address
 */
export type LicensingModulePolicyAggregatorDataRequest = {
  framework: Address;
  ipId: Address;
};

export type LicensingModulePolicyAggregatorDataResponse = Hex;

/**
 * LicensingModulePolicyForIpAtIndexRequest
 *
 * @param isInherited bool
 * @param ipId address
 * @param index uint256
 */
export type LicensingModulePolicyForIpAtIndexRequest = {
  isInherited: boolean;
  ipId: Address;
  index: bigint;
};

export type LicensingModulePolicyForIpAtIndexResponse = {
  isLicenseTransferable: boolean;
  policyFramework: Address;
  frameworkData: Hex;
  royaltyPolicy: Address;
  royaltyData: Hex;
  mintingFee: bigint;
  mintingFeeToken: Address;
};

/**
 * LicensingModulePolicyIdForIpAtIndexRequest
 *
 * @param isInherited bool
 * @param ipId address
 * @param index uint256
 */
export type LicensingModulePolicyIdForIpAtIndexRequest = {
  isInherited: boolean;
  ipId: Address;
  index: bigint;
};

/**
 * LicensingModulePolicyIdForIpAtIndexResponse
 *
 * @param policyId uint256
 */
export type LicensingModulePolicyIdForIpAtIndexResponse = {
  policyId: bigint;
};

/**
 * LicensingModulePolicyIdsForIpRequest
 *
 * @param isInherited bool
 * @param ipId address
 */
export type LicensingModulePolicyIdsForIpRequest = {
  isInherited: boolean;
  ipId: Address;
};

/**
 * LicensingModulePolicyIdsForIpResponse
 *
 * @param policyIds uint256[]
 */
export type LicensingModulePolicyIdsForIpResponse = {
  policyIds: readonly bigint[];
};

/**
 * LicensingModulePolicyStatusRequest
 *
 * @param ipId address
 * @param policyId uint256
 */
export type LicensingModulePolicyStatusRequest = {
  ipId: Address;
  policyId: bigint;
};

/**
 * LicensingModulePolicyStatusResponse
 *
 * @param index uint256
 * @param isInherited bool
 * @param active bool
 */
export type LicensingModulePolicyStatusResponse = {
  index: bigint;
  isInherited: boolean;
  active: boolean;
};

/**
 * LicensingModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type LicensingModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type LicensingModuleSupportsInterfaceResponse = boolean;

/**
 * LicensingModuleTotalParentsForIpIdRequest
 *
 * @param ipId address
 */
export type LicensingModuleTotalParentsForIpIdRequest = {
  ipId: Address;
};

export type LicensingModuleTotalParentsForIpIdResponse = bigint;

export type LicensingModuleTotalPoliciesResponse = bigint;

/**
 * LicensingModuleTotalPoliciesForIpRequest
 *
 * @param isInherited bool
 * @param ipId address
 */
export type LicensingModuleTotalPoliciesForIpRequest = {
  isInherited: boolean;
  ipId: Address;
};

export type LicensingModuleTotalPoliciesForIpResponse = bigint;

/**
 * LicensingModuleAddPolicyToIpRequest
 *
 * @param ipId address
 * @param polId uint256
 */
export type LicensingModuleAddPolicyToIpRequest = {
  ipId: Address;
  polId: bigint;
};

/**
 * LicensingModuleLinkIpToParentsRequest
 *
 * @param licenseIds uint256[]
 * @param childIpId address
 * @param royaltyContext bytes
 */
export type LicensingModuleLinkIpToParentsRequest = {
  licenseIds: readonly bigint[];
  childIpId: Address;
  royaltyContext: Hex;
};

/**
 * LicensingModuleMintLicenseRequest
 *
 * @param policyId uint256
 * @param licensorIpId address
 * @param amount uint256
 * @param receiver address
 * @param royaltyContext bytes
 */
export type LicensingModuleMintLicenseRequest = {
  policyId: bigint;
  licensorIpId: Address;
  amount: bigint;
  receiver: Address;
  royaltyContext: Hex;
};

/**
 * LicensingModuleRegisterPolicyRequest
 *
 * @param pol tuple
 */
export type LicensingModuleRegisterPolicyRequest = {
  pol: {
    isLicenseTransferable: boolean;
    policyFramework: Address;
    frameworkData: Hex;
    royaltyPolicy: Address;
    royaltyData: Hex;
    mintingFee: bigint;
    mintingFeeToken: Address;
  };
};

/**
 * LicensingModuleRegisterPolicyFrameworkManagerRequest
 *
 * @param manager address
 */
export type LicensingModuleRegisterPolicyFrameworkManagerRequest = {
  manager: Address;
};

/**
 * LicensingModuleIpIdLinkedToParentsEvent
 *
 * @param caller address (optional)
 * @param ipId address (optional)
 * @param parentIpIds address[] (optional)
 */
export type LicensingModuleIpIdLinkedToParentsEvent = {
  caller?: Address;
  ipId?: Address;
  parentIpIds?: readonly Address[];
};

/**
 * LicensingModulePolicyAddedToIpIdEvent
 *
 * @param caller address (optional)
 * @param ipId address (optional)
 * @param policyId uint256 (optional)
 * @param index uint256 (optional)
 * @param isInherited bool (optional)
 */
export type LicensingModulePolicyAddedToIpIdEvent = {
  caller?: Address;
  ipId?: Address;
  policyId?: bigint;
  index?: bigint;
  isInherited?: boolean;
};

/**
 * LicensingModulePolicyFrameworkRegisteredEvent
 *
 * @param framework address (optional)
 * @param name string (optional)
 * @param licenseTextUrl string (optional)
 */
export type LicensingModulePolicyFrameworkRegisteredEvent = {
  framework?: Address;
  name?: string;
  licenseTextUrl?: string;
};

/**
 * LicensingModulePolicyRegisteredEvent
 *
 * @param policyId uint256 (optional)
 * @param policyFrameworkManager address (optional)
 * @param frameworkData bytes (optional)
 * @param royaltyPolicy address (optional)
 * @param royaltyData bytes (optional)
 * @param mintingFee uint256 (optional)
 * @param mintingFeeToken address (optional)
 */
export type LicensingModulePolicyRegisteredEvent = {
  policyId?: bigint;
  policyFrameworkManager?: Address;
  frameworkData?: Hex;
  royaltyPolicy?: Address;
  royaltyData?: Hex;
  mintingFee?: bigint;
  mintingFeeToken?: Address;
};

/**
 * contract LicensingModule readonly method
 */
export class LicensingModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x2A88056985814dcBb72aFA50B95893359B6262f5",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ACCESS_CONTROLLER for contract LicensingModule
   *
   * @param request LicensingModuleAccessControllerRequest
   * @return Promise<LicensingModuleAccessControllerResponse>
   */
  public async accessController(): Promise<LicensingModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method DISPUTE_MODULE for contract LicensingModule
   *
   * @param request LicensingModuleDisputeModuleRequest
   * @return Promise<LicensingModuleDisputeModuleResponse>
   */
  public async disputeModule(): Promise<LicensingModuleDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "DISPUTE_MODULE",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract LicensingModule
   *
   * @param request LicensingModuleIpAccountRegistryRequest
   * @return Promise<LicensingModuleIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<LicensingModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method LICENSE_REGISTRY for contract LicensingModule
   *
   * @param request LicensingModuleLicenseRegistryRequest
   * @return Promise<LicensingModuleLicenseRegistryResponse>
   */
  public async licenseRegistry(): Promise<LicensingModuleLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "LICENSE_REGISTRY",
    });
  }

  /**
   * method ROYALTY_MODULE for contract LicensingModule
   *
   * @param request LicensingModuleRoyaltyModuleRequest
   * @return Promise<LicensingModuleRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<LicensingModuleRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method getPolicyId for contract LicensingModule
   *
   * @param request LicensingModuleGetPolicyIdRequest
   * @return Promise<LicensingModuleGetPolicyIdResponse>
   */
  public async getPolicyId(
    request: LicensingModuleGetPolicyIdRequest,
  ): Promise<LicensingModuleGetPolicyIdResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "getPolicyId",
      args: [request.pol],
    });
    return {
      policyId: result,
    };
  }

  /**
   * method isFrameworkRegistered for contract LicensingModule
   *
   * @param request LicensingModuleIsFrameworkRegisteredRequest
   * @return Promise<LicensingModuleIsFrameworkRegisteredResponse>
   */
  public async isFrameworkRegistered(
    request: LicensingModuleIsFrameworkRegisteredRequest,
  ): Promise<LicensingModuleIsFrameworkRegisteredResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "isFrameworkRegistered",
      args: [request.policyFramework],
    });
  }

  /**
   * method isParent for contract LicensingModule
   *
   * @param request LicensingModuleIsParentRequest
   * @return Promise<LicensingModuleIsParentResponse>
   */
  public async isParent(
    request: LicensingModuleIsParentRequest,
  ): Promise<LicensingModuleIsParentResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "isParent",
      args: [request.parentIpId, request.childIpId],
    });
  }

  /**
   * method isPolicyDefined for contract LicensingModule
   *
   * @param request LicensingModuleIsPolicyDefinedRequest
   * @return Promise<LicensingModuleIsPolicyDefinedResponse>
   */
  public async isPolicyDefined(
    request: LicensingModuleIsPolicyDefinedRequest,
  ): Promise<LicensingModuleIsPolicyDefinedResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "isPolicyDefined",
      args: [request.policyId],
    });
  }

  /**
   * method isPolicyIdSetForIp for contract LicensingModule
   *
   * @param request LicensingModuleIsPolicyIdSetForIpRequest
   * @return Promise<LicensingModuleIsPolicyIdSetForIpResponse>
   */
  public async isPolicyIdSetForIp(
    request: LicensingModuleIsPolicyIdSetForIpRequest,
  ): Promise<LicensingModuleIsPolicyIdSetForIpResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "isPolicyIdSetForIp",
      args: [request.isInherited, request.ipId, request.policyId],
    });
  }

  /**
   * method isPolicyInherited for contract LicensingModule
   *
   * @param request LicensingModuleIsPolicyInheritedRequest
   * @return Promise<LicensingModuleIsPolicyInheritedResponse>
   */
  public async isPolicyInherited(
    request: LicensingModuleIsPolicyInheritedRequest,
  ): Promise<LicensingModuleIsPolicyInheritedResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "isPolicyInherited",
      args: [request.ipId, request.policyId],
    });
  }

  /**
   * method name for contract LicensingModule
   *
   * @param request LicensingModuleNameRequest
   * @return Promise<LicensingModuleNameResponse>
   */
  public async name(): Promise<LicensingModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method parentIpIds for contract LicensingModule
   *
   * @param request LicensingModuleParentIpIdsRequest
   * @return Promise<LicensingModuleParentIpIdsResponse>
   */
  public async parentIpIds(
    request: LicensingModuleParentIpIdsRequest,
  ): Promise<LicensingModuleParentIpIdsResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "parentIpIds",
      args: [request.ipId],
    });
  }

  /**
   * method policy for contract LicensingModule
   *
   * @param request LicensingModulePolicyRequest
   * @return Promise<LicensingModulePolicyResponse>
   */
  public async policy(
    request: LicensingModulePolicyRequest,
  ): Promise<LicensingModulePolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "policy",
      args: [request.policyId],
    });
    return {
      pol: result,
    };
  }

  /**
   * method policyAggregatorData for contract LicensingModule
   *
   * @param request LicensingModulePolicyAggregatorDataRequest
   * @return Promise<LicensingModulePolicyAggregatorDataResponse>
   */
  public async policyAggregatorData(
    request: LicensingModulePolicyAggregatorDataRequest,
  ): Promise<LicensingModulePolicyAggregatorDataResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "policyAggregatorData",
      args: [request.framework, request.ipId],
    });
  }

  /**
   * method policyForIpAtIndex for contract LicensingModule
   *
   * @param request LicensingModulePolicyForIpAtIndexRequest
   * @return Promise<LicensingModulePolicyForIpAtIndexResponse>
   */
  public async policyForIpAtIndex(
    request: LicensingModulePolicyForIpAtIndexRequest,
  ): Promise<LicensingModulePolicyForIpAtIndexResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "policyForIpAtIndex",
      args: [request.isInherited, request.ipId, request.index],
    });
  }

  /**
   * method policyIdForIpAtIndex for contract LicensingModule
   *
   * @param request LicensingModulePolicyIdForIpAtIndexRequest
   * @return Promise<LicensingModulePolicyIdForIpAtIndexResponse>
   */
  public async policyIdForIpAtIndex(
    request: LicensingModulePolicyIdForIpAtIndexRequest,
  ): Promise<LicensingModulePolicyIdForIpAtIndexResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "policyIdForIpAtIndex",
      args: [request.isInherited, request.ipId, request.index],
    });
    return {
      policyId: result,
    };
  }

  /**
   * method policyIdsForIp for contract LicensingModule
   *
   * @param request LicensingModulePolicyIdsForIpRequest
   * @return Promise<LicensingModulePolicyIdsForIpResponse>
   */
  public async policyIdsForIp(
    request: LicensingModulePolicyIdsForIpRequest,
  ): Promise<LicensingModulePolicyIdsForIpResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "policyIdsForIp",
      args: [request.isInherited, request.ipId],
    });
    return {
      policyIds: result,
    };
  }

  /**
   * method policyStatus for contract LicensingModule
   *
   * @param request LicensingModulePolicyStatusRequest
   * @return Promise<LicensingModulePolicyStatusResponse>
   */
  public async policyStatus(
    request: LicensingModulePolicyStatusRequest,
  ): Promise<LicensingModulePolicyStatusResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "policyStatus",
      args: [request.ipId, request.policyId],
    });
    return {
      index: result[0],
      isInherited: result[1],
      active: result[2],
    };
  }

  /**
   * method supportsInterface for contract LicensingModule
   *
   * @param request LicensingModuleSupportsInterfaceRequest
   * @return Promise<LicensingModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: LicensingModuleSupportsInterfaceRequest,
  ): Promise<LicensingModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }

  /**
   * method totalParentsForIpId for contract LicensingModule
   *
   * @param request LicensingModuleTotalParentsForIpIdRequest
   * @return Promise<LicensingModuleTotalParentsForIpIdResponse>
   */
  public async totalParentsForIpId(
    request: LicensingModuleTotalParentsForIpIdRequest,
  ): Promise<LicensingModuleTotalParentsForIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "totalParentsForIpId",
      args: [request.ipId],
    });
  }

  /**
   * method totalPolicies for contract LicensingModule
   *
   * @param request LicensingModuleTotalPoliciesRequest
   * @return Promise<LicensingModuleTotalPoliciesResponse>
   */
  public async totalPolicies(): Promise<LicensingModuleTotalPoliciesResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "totalPolicies",
    });
  }

  /**
   * method totalPoliciesForIp for contract LicensingModule
   *
   * @param request LicensingModuleTotalPoliciesForIpRequest
   * @return Promise<LicensingModuleTotalPoliciesForIpResponse>
   */
  public async totalPoliciesForIp(
    request: LicensingModuleTotalPoliciesForIpRequest,
  ): Promise<LicensingModuleTotalPoliciesForIpResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "totalPoliciesForIp",
      args: [request.isInherited, request.ipId],
    });
  }
}

/**
 * contract LicensingModule write method
 */
export class LicensingModuleClient extends LicensingModuleReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x2A88056985814dcBb72aFA50B95893359B6262f5",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method addPolicyToIp for contract LicensingModule
   *
   * @param request LicensingModuleAddPolicyToIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async addPolicyToIp(
    request: LicensingModuleAddPolicyToIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "addPolicyToIp",
      account: this.wallet.account,
      args: [request.ipId, request.polId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method linkIpToParents for contract LicensingModule
   *
   * @param request LicensingModuleLinkIpToParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async linkIpToParents(
    request: LicensingModuleLinkIpToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "linkIpToParents",
      account: this.wallet.account,
      args: [request.licenseIds, request.childIpId, request.royaltyContext],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method mintLicense for contract LicensingModule
   *
   * @param request LicensingModuleMintLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicense(
    request: LicensingModuleMintLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "mintLicense",
      account: this.wallet.account,
      args: [
        request.policyId,
        request.licensorIpId,
        request.amount,
        request.receiver,
        request.royaltyContext,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method registerPolicy for contract LicensingModule
   *
   * @param request LicensingModuleRegisterPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicy(
    request: LicensingModuleRegisterPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "registerPolicy",
      account: this.wallet.account,
      args: [request.pol],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method registerPolicyFrameworkManager for contract LicensingModule
   *
   * @param request LicensingModuleRegisterPolicyFrameworkManagerRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicyFrameworkManager(
    request: LicensingModuleRegisterPolicyFrameworkManagerRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "registerPolicyFrameworkManager",
      account: this.wallet.account,
      args: [request.manager],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract LicensingModule event
 */
export class LicensingModuleEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x2A88056985814dcBb72aFA50B95893359B6262f5",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event IpIdLinkedToParents for contract LicensingModule
   */
  public watchIpIdLinkedToParentsEvent(
    onLogs: (txHash: Hex, ev: LicensingModuleIpIdLinkedToParentsEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "IpIdLinkedToParents",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event PolicyAddedToIpId for contract LicensingModule
   */
  public watchPolicyAddedToIpIdEvent(
    onLogs: (txHash: Hex, ev: LicensingModulePolicyAddedToIpIdEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "PolicyAddedToIpId",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event PolicyFrameworkRegistered for contract LicensingModule
   */
  public watchPolicyFrameworkRegisteredEvent(
    onLogs: (txHash: Hex, ev: LicensingModulePolicyFrameworkRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "PolicyFrameworkRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event PolicyRegistered for contract LicensingModule
   */
  public watchPolicyRegisteredEvent(
    onLogs: (txHash: Hex, ev: LicensingModulePolicyRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "PolicyRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract MockERC20 =============================================================

/**
 * MockErc20AllowanceRequest
 *
 * @param owner address
 * @param spender address
 */
export type MockErc20AllowanceRequest = {
  owner: Address;
  spender: Address;
};

export type MockErc20AllowanceResponse = bigint;

/**
 * MockErc20BalanceOfRequest
 *
 * @param account address
 */
export type MockErc20BalanceOfRequest = {
  account: Address;
};

export type MockErc20BalanceOfResponse = bigint;

export type MockErc20DecimalsResponse = number;

export type MockErc20NameResponse = string;

export type MockErc20SymbolResponse = string;

export type MockErc20TotalSupplyResponse = bigint;

/**
 * MockErc20ApproveRequest
 *
 * @param spender address
 * @param value uint256
 */
export type MockErc20ApproveRequest = {
  spender: Address;
  value: bigint;
};

/**
 * MockErc20BurnRequest
 *
 * @param from address
 * @param amount uint256
 */
export type MockErc20BurnRequest = {
  from: Address;
  amount: bigint;
};

/**
 * MockErc20MintRequest
 *
 * @param to address
 * @param amount uint256
 */
export type MockErc20MintRequest = {
  to: Address;
  amount: bigint;
};

/**
 * MockErc20TransferRequest
 *
 * @param to address
 * @param value uint256
 */
export type MockErc20TransferRequest = {
  to: Address;
  value: bigint;
};

/**
 * MockErc20TransferFromRequest
 *
 * @param from address
 * @param to address
 * @param value uint256
 */
export type MockErc20TransferFromRequest = {
  from: Address;
  to: Address;
  value: bigint;
};

/**
 * MockErc20ApprovalEvent
 *
 * @param owner address (optional)
 * @param spender address (optional)
 * @param value uint256 (optional)
 */
export type MockErc20ApprovalEvent = {
  owner?: Address;
  spender?: Address;
  value?: bigint;
};

/**
 * MockErc20TransferEvent
 *
 * @param from address (optional)
 * @param to address (optional)
 * @param value uint256 (optional)
 */
export type MockErc20TransferEvent = {
  from?: Address;
  to?: Address;
  value?: bigint;
};

/**
 * contract MockERC20 readonly method
 */
export class MockErc20ReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x3271778AdE44EfeC9e11b7160827921b6d614AF1",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method allowance for contract MockERC20
   *
   * @param request MockErc20AllowanceRequest
   * @return Promise<MockErc20AllowanceResponse>
   */
  public async allowance(request: MockErc20AllowanceRequest): Promise<MockErc20AllowanceResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "allowance",
      args: [request.owner, request.spender],
    });
  }

  /**
   * method balanceOf for contract MockERC20
   *
   * @param request MockErc20BalanceOfRequest
   * @return Promise<MockErc20BalanceOfResponse>
   */
  public async balanceOf(request: MockErc20BalanceOfRequest): Promise<MockErc20BalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "balanceOf",
      args: [request.account],
    });
  }

  /**
   * method decimals for contract MockERC20
   *
   * @param request MockErc20DecimalsRequest
   * @return Promise<MockErc20DecimalsResponse>
   */
  public async decimals(): Promise<MockErc20DecimalsResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "decimals",
    });
  }

  /**
   * method name for contract MockERC20
   *
   * @param request MockErc20NameRequest
   * @return Promise<MockErc20NameResponse>
   */
  public async name(): Promise<MockErc20NameResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method symbol for contract MockERC20
   *
   * @param request MockErc20SymbolRequest
   * @return Promise<MockErc20SymbolResponse>
   */
  public async symbol(): Promise<MockErc20SymbolResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "symbol",
    });
  }

  /**
   * method totalSupply for contract MockERC20
   *
   * @param request MockErc20TotalSupplyRequest
   * @return Promise<MockErc20TotalSupplyResponse>
   */
  public async totalSupply(): Promise<MockErc20TotalSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "totalSupply",
    });
  }
}

/**
 * contract MockERC20 write method
 */
export class MockErc20Client extends MockErc20ReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x3271778AdE44EfeC9e11b7160827921b6d614AF1",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method approve for contract MockERC20
   *
   * @param request MockErc20ApproveRequest
   * @return Promise<WriteContractReturnType>
   */
  public async approve(request: MockErc20ApproveRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "approve",
      account: this.wallet.account,
      args: [request.spender, request.value],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method burn for contract MockERC20
   *
   * @param request MockErc20BurnRequest
   * @return Promise<WriteContractReturnType>
   */
  public async burn(request: MockErc20BurnRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "burn",
      account: this.wallet.account,
      args: [request.from, request.amount],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method mint for contract MockERC20
   *
   * @param request MockErc20MintRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mint(request: MockErc20MintRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "mint",
      account: this.wallet.account,
      args: [request.to, request.amount],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method transfer for contract MockERC20
   *
   * @param request MockErc20TransferRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transfer(request: MockErc20TransferRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "transfer",
      account: this.wallet.account,
      args: [request.to, request.value],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method transferFrom for contract MockERC20
   *
   * @param request MockErc20TransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferFrom(
    request: MockErc20TransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "transferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.value],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract MockERC20 event
 */
export class MockErc20EventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x3271778AdE44EfeC9e11b7160827921b6d614AF1",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event Approval for contract MockERC20
   */
  public watchApprovalEvent(
    onLogs: (txHash: Hex, ev: MockErc20ApprovalEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc20Abi,
      address: this.address,
      eventName: "Approval",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event Transfer for contract MockERC20
   */
  public watchTransferEvent(
    onLogs: (txHash: Hex, ev: MockErc20TransferEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc20Abi,
      address: this.address,
      eventName: "Transfer",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract MockERC721 =============================================================

/**
 * MockErc721BalanceOfRequest
 *
 * @param owner address
 */
export type MockErc721BalanceOfRequest = {
  owner: Address;
};

export type MockErc721BalanceOfResponse = bigint;

/**
 * MockErc721GetApprovedRequest
 *
 * @param tokenId uint256
 */
export type MockErc721GetApprovedRequest = {
  tokenId: bigint;
};

export type MockErc721GetApprovedResponse = Address;

/**
 * MockErc721IsApprovedForAllRequest
 *
 * @param owner address
 * @param operator address
 */
export type MockErc721IsApprovedForAllRequest = {
  owner: Address;
  operator: Address;
};

export type MockErc721IsApprovedForAllResponse = boolean;

export type MockErc721NameResponse = string;

/**
 * MockErc721OwnerOfRequest
 *
 * @param tokenId uint256
 */
export type MockErc721OwnerOfRequest = {
  tokenId: bigint;
};

export type MockErc721OwnerOfResponse = Address;

/**
 * MockErc721SupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type MockErc721SupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type MockErc721SupportsInterfaceResponse = boolean;

export type MockErc721SymbolResponse = string;

/**
 * MockErc721TokenUriRequest
 *
 * @param tokenId uint256
 */
export type MockErc721TokenUriRequest = {
  tokenId: bigint;
};

export type MockErc721TokenUriResponse = string;

/**
 * MockErc721ApproveRequest
 *
 * @param to address
 * @param tokenId uint256
 */
export type MockErc721ApproveRequest = {
  to: Address;
  tokenId: bigint;
};

/**
 * MockErc721BurnRequest
 *
 * @param tokenId uint256
 */
export type MockErc721BurnRequest = {
  tokenId: bigint;
};

/**
 * MockErc721MintRequest
 *
 * @param to address
 */
export type MockErc721MintRequest = {
  to: Address;
};

/**
 * MockErc721MintIdRequest
 *
 * @param to address
 * @param tokenId uint256
 */
export type MockErc721MintIdRequest = {
  to: Address;
  tokenId: bigint;
};

/**
 * MockErc721SafeTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type MockErc721SafeTransferFromRequest = {
  from: Address;
  to: Address;
  tokenId: bigint;
};

/**
 * MockErc721SafeTransferFrom2Request
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 * @param data bytes
 */
export type MockErc721SafeTransferFrom2Request = {
  from: Address;
  to: Address;
  tokenId: bigint;
  data: Hex;
};

/**
 * MockErc721SetApprovalForAllRequest
 *
 * @param operator address
 * @param approved bool
 */
export type MockErc721SetApprovalForAllRequest = {
  operator: Address;
  approved: boolean;
};

/**
 * MockErc721TransferFromRequest
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type MockErc721TransferFromRequest = {
  from: Address;
  to: Address;
  tokenId: bigint;
};

/**
 * MockErc721ApprovalEvent
 *
 * @param owner address (optional)
 * @param approved address (optional)
 * @param tokenId uint256 (optional)
 */
export type MockErc721ApprovalEvent = {
  owner?: Address;
  approved?: Address;
  tokenId?: bigint;
};

/**
 * MockErc721ApprovalForAllEvent
 *
 * @param owner address (optional)
 * @param operator address (optional)
 * @param approved bool (optional)
 */
export type MockErc721ApprovalForAllEvent = {
  owner?: Address;
  operator?: Address;
  approved?: boolean;
};

/**
 * MockErc721TransferEvent
 *
 * @param from address (optional)
 * @param to address (optional)
 * @param tokenId uint256 (optional)
 */
export type MockErc721TransferEvent = {
  from?: Address;
  to?: Address;
  tokenId?: bigint;
};

/**
 * contract MockERC721 readonly method
 */
export class MockErc721ReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method balanceOf for contract MockERC721
   *
   * @param request MockErc721BalanceOfRequest
   * @return Promise<MockErc721BalanceOfResponse>
   */
  public async balanceOf(
    request: MockErc721BalanceOfRequest,
  ): Promise<MockErc721BalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "balanceOf",
      args: [request.owner],
    });
  }

  /**
   * method getApproved for contract MockERC721
   *
   * @param request MockErc721GetApprovedRequest
   * @return Promise<MockErc721GetApprovedResponse>
   */
  public async getApproved(
    request: MockErc721GetApprovedRequest,
  ): Promise<MockErc721GetApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "getApproved",
      args: [request.tokenId],
    });
  }

  /**
   * method isApprovedForAll for contract MockERC721
   *
   * @param request MockErc721IsApprovedForAllRequest
   * @return Promise<MockErc721IsApprovedForAllResponse>
   */
  public async isApprovedForAll(
    request: MockErc721IsApprovedForAllRequest,
  ): Promise<MockErc721IsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "isApprovedForAll",
      args: [request.owner, request.operator],
    });
  }

  /**
   * method name for contract MockERC721
   *
   * @param request MockErc721NameRequest
   * @return Promise<MockErc721NameResponse>
   */
  public async name(): Promise<MockErc721NameResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method ownerOf for contract MockERC721
   *
   * @param request MockErc721OwnerOfRequest
   * @return Promise<MockErc721OwnerOfResponse>
   */
  public async ownerOf(request: MockErc721OwnerOfRequest): Promise<MockErc721OwnerOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "ownerOf",
      args: [request.tokenId],
    });
  }

  /**
   * method supportsInterface for contract MockERC721
   *
   * @param request MockErc721SupportsInterfaceRequest
   * @return Promise<MockErc721SupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: MockErc721SupportsInterfaceRequest,
  ): Promise<MockErc721SupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }

  /**
   * method symbol for contract MockERC721
   *
   * @param request MockErc721SymbolRequest
   * @return Promise<MockErc721SymbolResponse>
   */
  public async symbol(): Promise<MockErc721SymbolResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "symbol",
    });
  }

  /**
   * method tokenURI for contract MockERC721
   *
   * @param request MockErc721TokenUriRequest
   * @return Promise<MockErc721TokenUriResponse>
   */
  public async tokenUri(request: MockErc721TokenUriRequest): Promise<MockErc721TokenUriResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "tokenURI",
      args: [request.tokenId],
    });
  }
}

/**
 * contract MockERC721 write method
 */
export class MockErc721Client extends MockErc721ReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method approve for contract MockERC721
   *
   * @param request MockErc721ApproveRequest
   * @return Promise<WriteContractReturnType>
   */
  public async approve(request: MockErc721ApproveRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "approve",
      account: this.wallet.account,
      args: [request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method burn for contract MockERC721
   *
   * @param request MockErc721BurnRequest
   * @return Promise<WriteContractReturnType>
   */
  public async burn(request: MockErc721BurnRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "burn",
      account: this.wallet.account,
      args: [request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method mint for contract MockERC721
   *
   * @param request MockErc721MintRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mint(request: MockErc721MintRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "mint",
      account: this.wallet.account,
      args: [request.to],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method mintId for contract MockERC721
   *
   * @param request MockErc721MintIdRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintId(request: MockErc721MintIdRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "mintId",
      account: this.wallet.account,
      args: [request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method safeTransferFrom for contract MockERC721
   *
   * @param request MockErc721SafeTransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async safeTransferFrom(
    request: MockErc721SafeTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "safeTransferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method safeTransferFrom for contract MockERC721
   *
   * @param request MockErc721SafeTransferFrom2Request
   * @return Promise<WriteContractReturnType>
   */
  public async safeTransferFrom2(
    request: MockErc721SafeTransferFrom2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "safeTransferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId, request.data],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setApprovalForAll for contract MockERC721
   *
   * @param request MockErc721SetApprovalForAllRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApprovalForAll(
    request: MockErc721SetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "setApprovalForAll",
      account: this.wallet.account,
      args: [request.operator, request.approved],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method transferFrom for contract MockERC721
   *
   * @param request MockErc721TransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferFrom(
    request: MockErc721TransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: "transferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract MockERC721 event
 */
export class MockErc721EventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event Approval for contract MockERC721
   */
  public watchApprovalEvent(
    onLogs: (txHash: Hex, ev: MockErc721ApprovalEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc721Abi,
      address: this.address,
      eventName: "Approval",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event ApprovalForAll for contract MockERC721
   */
  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: MockErc721ApprovalForAllEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc721Abi,
      address: this.address,
      eventName: "ApprovalForAll",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event Transfer for contract MockERC721
   */
  public watchTransferEvent(
    onLogs: (txHash: Hex, ev: MockErc721TransferEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc721Abi,
      address: this.address,
      eventName: "Transfer",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract MockTokenGatedHook =============================================================

export type MockTokenGatedHookNameResponse = string;

/**
 * MockTokenGatedHookSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type MockTokenGatedHookSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type MockTokenGatedHookSupportsInterfaceResponse = boolean;

/**
 * MockTokenGatedHookValidateConfigRequest
 *
 * @param configData bytes
 */
export type MockTokenGatedHookValidateConfigRequest = {
  configData: Hex;
};

/**
 * MockTokenGatedHookVerifyRequest
 *
 * @param caller address
 * @param data bytes
 */
export type MockTokenGatedHookVerifyRequest = {
  caller: Address;
  data: Hex;
};

export type MockTokenGatedHookVerifyResponse = boolean;

/**
 * contract MockTokenGatedHook readonly method
 */
export class MockTokenGatedHookReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x008B5D8Db85100E143729453784e9F077B2279fA",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method name for contract MockTokenGatedHook
   *
   * @param request MockTokenGatedHookNameRequest
   * @return Promise<MockTokenGatedHookNameResponse>
   */
  public async name(): Promise<MockTokenGatedHookNameResponse> {
    return await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method supportsInterface for contract MockTokenGatedHook
   *
   * @param request MockTokenGatedHookSupportsInterfaceRequest
   * @return Promise<MockTokenGatedHookSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: MockTokenGatedHookSupportsInterfaceRequest,
  ): Promise<MockTokenGatedHookSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }

  /**
   * method validateConfig for contract MockTokenGatedHook
   *
   * @param request MockTokenGatedHookValidateConfigRequest
   * @return Promise<void>
   */
  public async validateConfig(request: MockTokenGatedHookValidateConfigRequest): Promise<void> {
    await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: "validateConfig",
      args: [request.configData],
    });
  }

  /**
   * method verify for contract MockTokenGatedHook
   *
   * @param request MockTokenGatedHookVerifyRequest
   * @return Promise<MockTokenGatedHookVerifyResponse>
   */
  public async verify(
    request: MockTokenGatedHookVerifyRequest,
  ): Promise<MockTokenGatedHookVerifyResponse> {
    return await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: "verify",
      args: [request.caller, request.data],
    });
  }
}

// Contract ModuleRegistry =============================================================

export type ModuleRegistryGetGovernanceResponse = Address;

/**
 * ModuleRegistryGetModuleRequest
 *
 * @param name string
 */
export type ModuleRegistryGetModuleRequest = {
  name: string;
};

export type ModuleRegistryGetModuleResponse = Address;

/**
 * ModuleRegistryGetModuleTypeRequest
 *
 * @param moduleAddress address
 */
export type ModuleRegistryGetModuleTypeRequest = {
  moduleAddress: Address;
};

export type ModuleRegistryGetModuleTypeResponse = string;

/**
 * ModuleRegistryGetModuleTypeInterfaceIdRequest
 *
 * @param moduleType string
 */
export type ModuleRegistryGetModuleTypeInterfaceIdRequest = {
  moduleType: string;
};

export type ModuleRegistryGetModuleTypeInterfaceIdResponse = Hex;

export type ModuleRegistryGovernanceResponse = Address;

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
 * ModuleRegistryRegisterModuleRequest
 *
 * @param name string
 * @param moduleAddress address
 */
export type ModuleRegistryRegisterModuleRequest = {
  name: string;
  moduleAddress: Address;
};

/**
 * ModuleRegistryRegisterModule2Request
 *
 * @param name string
 * @param moduleAddress address
 * @param moduleType string
 */
export type ModuleRegistryRegisterModule2Request = {
  name: string;
  moduleAddress: Address;
  moduleType: string;
};

/**
 * ModuleRegistryRegisterModuleTypeRequest
 *
 * @param name string
 * @param interfaceId bytes4
 */
export type ModuleRegistryRegisterModuleTypeRequest = {
  name: string;
  interfaceId: Hex;
};

/**
 * ModuleRegistryRemoveModuleRequest
 *
 * @param name string
 */
export type ModuleRegistryRemoveModuleRequest = {
  name: string;
};

/**
 * ModuleRegistryRemoveModuleTypeRequest
 *
 * @param name string
 */
export type ModuleRegistryRemoveModuleTypeRequest = {
  name: string;
};

/**
 * ModuleRegistrySetGovernanceRequest
 *
 * @param newGovernance address
 */
export type ModuleRegistrySetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * ModuleRegistryGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type ModuleRegistryGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * ModuleRegistryModuleAddedEvent
 *
 * @param name string (optional)
 * @param module address (optional)
 * @param moduleTypeInterfaceId bytes4 (optional)
 * @param moduleType string (optional)
 */
export type ModuleRegistryModuleAddedEvent = {
  name?: string;
  module?: Address;
  moduleTypeInterfaceId?: Hex;
  moduleType?: string;
};

/**
 * ModuleRegistryModuleRemovedEvent
 *
 * @param name string (optional)
 * @param module address (optional)
 */
export type ModuleRegistryModuleRemovedEvent = {
  name?: string;
  module?: Address;
};

/**
 * contract ModuleRegistry readonly method
 */
export class ModuleRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method getGovernance for contract ModuleRegistry
   *
   * @param request ModuleRegistryGetGovernanceRequest
   * @return Promise<ModuleRegistryGetGovernanceResponse>
   */
  public async getGovernance(): Promise<ModuleRegistryGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method getModule for contract ModuleRegistry
   *
   * @param request ModuleRegistryGetModuleRequest
   * @return Promise<ModuleRegistryGetModuleResponse>
   */
  public async getModule(
    request: ModuleRegistryGetModuleRequest,
  ): Promise<ModuleRegistryGetModuleResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "getModule",
      args: [request.name],
    });
  }

  /**
   * method getModuleType for contract ModuleRegistry
   *
   * @param request ModuleRegistryGetModuleTypeRequest
   * @return Promise<ModuleRegistryGetModuleTypeResponse>
   */
  public async getModuleType(
    request: ModuleRegistryGetModuleTypeRequest,
  ): Promise<ModuleRegistryGetModuleTypeResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "getModuleType",
      args: [request.moduleAddress],
    });
  }

  /**
   * method getModuleTypeInterfaceId for contract ModuleRegistry
   *
   * @param request ModuleRegistryGetModuleTypeInterfaceIdRequest
   * @return Promise<ModuleRegistryGetModuleTypeInterfaceIdResponse>
   */
  public async getModuleTypeInterfaceId(
    request: ModuleRegistryGetModuleTypeInterfaceIdRequest,
  ): Promise<ModuleRegistryGetModuleTypeInterfaceIdResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "getModuleTypeInterfaceId",
      args: [request.moduleType],
    });
  }

  /**
   * method governance for contract ModuleRegistry
   *
   * @param request ModuleRegistryGovernanceRequest
   * @return Promise<ModuleRegistryGovernanceResponse>
   */
  public async governance(): Promise<ModuleRegistryGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "governance",
    });
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

/**
 * contract ModuleRegistry write method
 */
export class ModuleRegistryClient extends ModuleRegistryReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method registerModule for contract ModuleRegistry
   *
   * @param request ModuleRegistryRegisterModuleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerModule(
    request: ModuleRegistryRegisterModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "registerModule",
      account: this.wallet.account,
      args: [request.name, request.moduleAddress],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method registerModule for contract ModuleRegistry
   *
   * @param request ModuleRegistryRegisterModule2Request
   * @return Promise<WriteContractReturnType>
   */
  public async registerModule2(
    request: ModuleRegistryRegisterModule2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "registerModule",
      account: this.wallet.account,
      args: [request.name, request.moduleAddress, request.moduleType],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method registerModuleType for contract ModuleRegistry
   *
   * @param request ModuleRegistryRegisterModuleTypeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerModuleType(
    request: ModuleRegistryRegisterModuleTypeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "registerModuleType",
      account: this.wallet.account,
      args: [request.name, request.interfaceId],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method removeModule for contract ModuleRegistry
   *
   * @param request ModuleRegistryRemoveModuleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async removeModule(
    request: ModuleRegistryRemoveModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "removeModule",
      account: this.wallet.account,
      args: [request.name],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method removeModuleType for contract ModuleRegistry
   *
   * @param request ModuleRegistryRemoveModuleTypeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async removeModuleType(
    request: ModuleRegistryRemoveModuleTypeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "removeModuleType",
      account: this.wallet.account,
      args: [request.name],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract ModuleRegistry
   *
   * @param request ModuleRegistrySetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: ModuleRegistrySetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract ModuleRegistry event
 */
export class ModuleRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event GovernanceUpdated for contract ModuleRegistry
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: ModuleRegistryGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: moduleRegistryAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event ModuleAdded for contract ModuleRegistry
   */
  public watchModuleAddedEvent(
    onLogs: (txHash: Hex, ev: ModuleRegistryModuleAddedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: moduleRegistryAbi,
      address: this.address,
      eventName: "ModuleAdded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event ModuleRemoved for contract ModuleRegistry
   */
  public watchModuleRemovedEvent(
    onLogs: (txHash: Hex, ev: ModuleRegistryModuleRemovedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: moduleRegistryAbi,
      address: this.address,
      eventName: "ModuleRemoved",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract PILPolicyFrameworkManager =============================================================

export type PilPolicyFrameworkManagerAccessControllerResponse = Address;

export type PilPolicyFrameworkManagerIpAccountRegistryResponse = Address;

export type PilPolicyFrameworkManagerLicenseRegistryResponse = Address;

export type PilPolicyFrameworkManagerLicensingModuleResponse = Address;

/**
 * PilPolicyFrameworkManagerGetAggregatorRequest
 *
 * @param ipId address
 */
export type PilPolicyFrameworkManagerGetAggregatorRequest = {
  ipId: Address;
};

/**
 * PilPolicyFrameworkManagerGetAggregatorResponse
 *
 * @param rights tuple
 */
export type PilPolicyFrameworkManagerGetAggregatorResponse = {
  rights: {
    commercial: boolean;
    derivativesReciprocal: boolean;
    lastPolicyId: bigint;
    territoriesAcc: Hex;
    distributionChannelsAcc: Hex;
    contentRestrictionsAcc: Hex;
  };
};

/**
 * PilPolicyFrameworkManagerGetPilPolicyRequest
 *
 * @param policyId uint256
 */
export type PilPolicyFrameworkManagerGetPilPolicyRequest = {
  policyId: bigint;
};

/**
 * PilPolicyFrameworkManagerGetPilPolicyResponse
 *
 * @param policy tuple
 */
export type PilPolicyFrameworkManagerGetPilPolicyResponse = {
  policy: {
    attribution: boolean;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    territories: readonly string[];
    distributionChannels: readonly string[];
    contentRestrictions: readonly string[];
  };
};

/**
 * PilPolicyFrameworkManagerIsDerivativeApprovedRequest
 *
 * @param licenseId uint256
 * @param childIpId address
 */
export type PilPolicyFrameworkManagerIsDerivativeApprovedRequest = {
  licenseId: bigint;
  childIpId: Address;
};

export type PilPolicyFrameworkManagerIsDerivativeApprovedResponse = boolean;

export type PilPolicyFrameworkManagerLicenseTextUrlResponse = string;

export type PilPolicyFrameworkManagerNameResponse = string;

/**
 * PilPolicyFrameworkManagerPolicyToJsonRequest
 *
 * @param policyData bytes
 */
export type PilPolicyFrameworkManagerPolicyToJsonRequest = {
  policyData: Hex;
};

export type PilPolicyFrameworkManagerPolicyToJsonResponse = string;

/**
 * PilPolicyFrameworkManagerProcessInheritedPoliciesRequest
 *
 * @param aggregator bytes
 * @param policyId uint256
 * @param policy bytes
 */
export type PilPolicyFrameworkManagerProcessInheritedPoliciesRequest = {
  aggregator: Hex;
  policyId: bigint;
  policy: Hex;
};

/**
 * PilPolicyFrameworkManagerProcessInheritedPoliciesResponse
 *
 * @param changedAgg bool
 * @param newAggregator bytes
 */
export type PilPolicyFrameworkManagerProcessInheritedPoliciesResponse = {
  changedAgg: boolean;
  newAggregator: Hex;
};

/**
 * PilPolicyFrameworkManagerSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type PilPolicyFrameworkManagerSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type PilPolicyFrameworkManagerSupportsInterfaceResponse = boolean;

/**
 * PilPolicyFrameworkManagerRegisterPolicyRequest
 *
 * @param params tuple
 */
export type PilPolicyFrameworkManagerRegisterPolicyRequest = {
  params: {
    transferable: boolean;
    royaltyPolicy: Address;
    mintingFee: bigint;
    mintingFeeToken: Address;
    policy: {
      attribution: boolean;
      commercialUse: boolean;
      commercialAttribution: boolean;
      commercializerChecker: Address;
      commercializerCheckerData: Hex;
      commercialRevShare: number;
      derivativesAllowed: boolean;
      derivativesAttribution: boolean;
      derivativesApproval: boolean;
      derivativesReciprocal: boolean;
      territories: readonly string[];
      distributionChannels: readonly string[];
      contentRestrictions: readonly string[];
    };
  };
};

/**
 * PilPolicyFrameworkManagerSetApprovalRequest
 *
 * @param licenseId uint256
 * @param childIpId address
 * @param approved bool
 */
export type PilPolicyFrameworkManagerSetApprovalRequest = {
  licenseId: bigint;
  childIpId: Address;
  approved: boolean;
};

/**
 * PilPolicyFrameworkManagerVerifyLinkRequest
 *
 * @param licenseId uint256
 * @param licensee address
 * @param ipId address
 * @param parentIpId address
 * @param policyData bytes
 */
export type PilPolicyFrameworkManagerVerifyLinkRequest = {
  licenseId: bigint;
  licensee: Address;
  ipId: Address;
  parentIpId: Address;
  policyData: Hex;
};

/**
 * PilPolicyFrameworkManagerVerifyMintRequest
 *
 * @param licensee address
 * @param mintingFromADerivative bool
 * @param licensorIpId address
 * @param receiver address
 * @param mintAmount uint256
 * @param policyData bytes
 */
export type PilPolicyFrameworkManagerVerifyMintRequest = {
  licensee: Address;
  mintingFromADerivative: boolean;
  licensorIpId: Address;
  receiver: Address;
  mintAmount: bigint;
  policyData: Hex;
};

/**
 * PilPolicyFrameworkManagerDerivativeApprovedEvent
 *
 * @param licenseId uint256 (optional)
 * @param ipId address (optional)
 * @param caller address (optional)
 * @param approved bool (optional)
 */
export type PilPolicyFrameworkManagerDerivativeApprovedEvent = {
  licenseId?: bigint;
  ipId?: Address;
  caller?: Address;
  approved?: boolean;
};

/**
 * contract PILPolicyFrameworkManager readonly method
 */
export class PilPolicyFrameworkManagerReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xAc2C50Af31501370366D243FaeC56F89128f6d96",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ACCESS_CONTROLLER for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerAccessControllerRequest
   * @return Promise<PilPolicyFrameworkManagerAccessControllerResponse>
   */
  public async accessController(): Promise<PilPolicyFrameworkManagerAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerIpAccountRegistryRequest
   * @return Promise<PilPolicyFrameworkManagerIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<PilPolicyFrameworkManagerIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method LICENSE_REGISTRY for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerLicenseRegistryRequest
   * @return Promise<PilPolicyFrameworkManagerLicenseRegistryResponse>
   */
  public async licenseRegistry(): Promise<PilPolicyFrameworkManagerLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "LICENSE_REGISTRY",
    });
  }

  /**
   * method LICENSING_MODULE for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerLicensingModuleRequest
   * @return Promise<PilPolicyFrameworkManagerLicensingModuleResponse>
   */
  public async licensingModule(): Promise<PilPolicyFrameworkManagerLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "LICENSING_MODULE",
    });
  }

  /**
   * method getAggregator for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerGetAggregatorRequest
   * @return Promise<PilPolicyFrameworkManagerGetAggregatorResponse>
   */
  public async getAggregator(
    request: PilPolicyFrameworkManagerGetAggregatorRequest,
  ): Promise<PilPolicyFrameworkManagerGetAggregatorResponse> {
    const result = await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "getAggregator",
      args: [request.ipId],
    });
    return {
      rights: result,
    };
  }

  /**
   * method getPILPolicy for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerGetPilPolicyRequest
   * @return Promise<PilPolicyFrameworkManagerGetPilPolicyResponse>
   */
  public async getPilPolicy(
    request: PilPolicyFrameworkManagerGetPilPolicyRequest,
  ): Promise<PilPolicyFrameworkManagerGetPilPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "getPILPolicy",
      args: [request.policyId],
    });
    return {
      policy: result,
    };
  }

  /**
   * method isDerivativeApproved for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerIsDerivativeApprovedRequest
   * @return Promise<PilPolicyFrameworkManagerIsDerivativeApprovedResponse>
   */
  public async isDerivativeApproved(
    request: PilPolicyFrameworkManagerIsDerivativeApprovedRequest,
  ): Promise<PilPolicyFrameworkManagerIsDerivativeApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "isDerivativeApproved",
      args: [request.licenseId, request.childIpId],
    });
  }

  /**
   * method licenseTextUrl for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerLicenseTextUrlRequest
   * @return Promise<PilPolicyFrameworkManagerLicenseTextUrlResponse>
   */
  public async licenseTextUrl(): Promise<PilPolicyFrameworkManagerLicenseTextUrlResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "licenseTextUrl",
    });
  }

  /**
   * method name for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerNameRequest
   * @return Promise<PilPolicyFrameworkManagerNameResponse>
   */
  public async name(): Promise<PilPolicyFrameworkManagerNameResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method policyToJson for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerPolicyToJsonRequest
   * @return Promise<PilPolicyFrameworkManagerPolicyToJsonResponse>
   */
  public async policyToJson(
    request: PilPolicyFrameworkManagerPolicyToJsonRequest,
  ): Promise<PilPolicyFrameworkManagerPolicyToJsonResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "policyToJson",
      args: [request.policyData],
    });
  }

  /**
   * method processInheritedPolicies for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerProcessInheritedPoliciesRequest
   * @return Promise<PilPolicyFrameworkManagerProcessInheritedPoliciesResponse>
   */
  public async processInheritedPolicies(
    request: PilPolicyFrameworkManagerProcessInheritedPoliciesRequest,
  ): Promise<PilPolicyFrameworkManagerProcessInheritedPoliciesResponse> {
    const result = await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "processInheritedPolicies",
      args: [request.aggregator, request.policyId, request.policy],
    });
    return {
      changedAgg: result[0],
      newAggregator: result[1],
    };
  }

  /**
   * method supportsInterface for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerSupportsInterfaceRequest
   * @return Promise<PilPolicyFrameworkManagerSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: PilPolicyFrameworkManagerSupportsInterfaceRequest,
  ): Promise<PilPolicyFrameworkManagerSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract PILPolicyFrameworkManager write method
 */
export class PilPolicyFrameworkManagerClient extends PilPolicyFrameworkManagerReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xAc2C50Af31501370366D243FaeC56F89128f6d96",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method registerPolicy for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerRegisterPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicy(
    request: PilPolicyFrameworkManagerRegisterPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "registerPolicy",
      account: this.wallet.account,
      args: [request.params],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setApproval for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerSetApprovalRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApproval(
    request: PilPolicyFrameworkManagerSetApprovalRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "setApproval",
      account: this.wallet.account,
      args: [request.licenseId, request.childIpId, request.approved],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method verifyLink for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerVerifyLinkRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyLink(
    request: PilPolicyFrameworkManagerVerifyLinkRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "verifyLink",
      account: this.wallet.account,
      args: [
        request.licenseId,
        request.licensee,
        request.ipId,
        request.parentIpId,
        request.policyData,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method verifyMint for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerVerifyMintRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyMint(
    request: PilPolicyFrameworkManagerVerifyMintRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: "verifyMint",
      account: this.wallet.account,
      args: [
        request.licensee,
        request.mintingFromADerivative,
        request.licensorIpId,
        request.receiver,
        request.mintAmount,
        request.policyData,
      ],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract PILPolicyFrameworkManager event
 */
export class PilPolicyFrameworkManagerEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xAc2C50Af31501370366D243FaeC56F89128f6d96",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event DerivativeApproved for contract PILPolicyFrameworkManager
   */
  public watchDerivativeApprovedEvent(
    onLogs: (txHash: Hex, ev: PilPolicyFrameworkManagerDerivativeApprovedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      eventName: "DerivativeApproved",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract RegistrationModule =============================================================

export type RegistrationModuleIpResolverResponse = Address;

export type RegistrationModuleNameResponse = string;

/**
 * RegistrationModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type RegistrationModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type RegistrationModuleSupportsInterfaceResponse = boolean;

/**
 * RegistrationModuleRegisterDerivativeIpRequest
 *
 * @param licenseIds uint256[]
 * @param tokenContract address
 * @param tokenId uint256
 * @param ipName string
 * @param contentHash bytes32
 * @param externalURL string
 * @param royaltyContext bytes
 */
export type RegistrationModuleRegisterDerivativeIpRequest = {
  licenseIds: readonly bigint[];
  tokenContract: Address;
  tokenId: bigint;
  ipName: string;
  contentHash: Hex;
  externalURL: string;
  royaltyContext: Hex;
};

/**
 * RegistrationModuleRegisterRootIpRequest
 *
 * @param policyId uint256
 * @param tokenContract address
 * @param tokenId uint256
 * @param ipName string
 * @param contentHash bytes32
 * @param externalURL string
 */
export type RegistrationModuleRegisterRootIpRequest = {
  policyId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  ipName: string;
  contentHash: Hex;
  externalURL: string;
};

/**
 * RegistrationModuleDerivativeIpRegisteredEvent
 *
 * @param caller address (optional)
 * @param ipId address (optional)
 * @param licenseIds uint256[] (optional)
 */
export type RegistrationModuleDerivativeIpRegisteredEvent = {
  caller?: Address;
  ipId?: Address;
  licenseIds?: readonly bigint[];
};

/**
 * RegistrationModuleRootIpRegisteredEvent
 *
 * @param caller address (optional)
 * @param ipId address (optional)
 * @param policyId uint256 (optional)
 */
export type RegistrationModuleRootIpRegisteredEvent = {
  caller?: Address;
  ipId?: Address;
  policyId?: bigint;
};

/**
 * contract RegistrationModule readonly method
 */
export class RegistrationModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ipResolver for contract RegistrationModule
   *
   * @param request RegistrationModuleIpResolverRequest
   * @return Promise<RegistrationModuleIpResolverResponse>
   */
  public async ipResolver(): Promise<RegistrationModuleIpResolverResponse> {
    return await this.rpcClient.readContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: "ipResolver",
    });
  }

  /**
   * method name for contract RegistrationModule
   *
   * @param request RegistrationModuleNameRequest
   * @return Promise<RegistrationModuleNameResponse>
   */
  public async name(): Promise<RegistrationModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method supportsInterface for contract RegistrationModule
   *
   * @param request RegistrationModuleSupportsInterfaceRequest
   * @return Promise<RegistrationModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: RegistrationModuleSupportsInterfaceRequest,
  ): Promise<RegistrationModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract RegistrationModule write method
 */
export class RegistrationModuleClient extends RegistrationModuleReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method registerDerivativeIp for contract RegistrationModule
   *
   * @param request RegistrationModuleRegisterDerivativeIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivativeIp(
    request: RegistrationModuleRegisterDerivativeIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: "registerDerivativeIp",
      account: this.wallet.account,
      args: [
        request.licenseIds,
        request.tokenContract,
        request.tokenId,
        request.ipName,
        request.contentHash,
        request.externalURL,
        request.royaltyContext,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method registerRootIp for contract RegistrationModule
   *
   * @param request RegistrationModuleRegisterRootIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerRootIp(
    request: RegistrationModuleRegisterRootIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: "registerRootIp",
      account: this.wallet.account,
      args: [
        request.policyId,
        request.tokenContract,
        request.tokenId,
        request.ipName,
        request.contentHash,
        request.externalURL,
      ],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract RegistrationModule event
 */
export class RegistrationModuleEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event DerivativeIPRegistered for contract RegistrationModule
   */
  public watchDerivativeIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: RegistrationModuleDerivativeIpRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: registrationModuleAbi,
      address: this.address,
      eventName: "DerivativeIPRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event RootIPRegistered for contract RegistrationModule
   */
  public watchRootIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: RegistrationModuleRootIpRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: registrationModuleAbi,
      address: this.address,
      eventName: "RootIPRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract RoyaltyModule =============================================================

export type RoyaltyModuleLicensingModuleResponse = Address;

export type RoyaltyModuleGetGovernanceResponse = Address;

export type RoyaltyModuleGovernanceResponse = Address;

/**
 * RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest
 *
 * @param royaltyPolicy address
 */
export type RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest = {
  royaltyPolicy: Address;
};

/**
 * RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse
 *
 * @param isWhitelisted bool
 */
export type RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse = {
  isWhitelisted: boolean;
};

/**
 * RoyaltyModuleIsWhitelistedRoyaltyTokenRequest
 *
 * @param token address
 */
export type RoyaltyModuleIsWhitelistedRoyaltyTokenRequest = {
  token: Address;
};

export type RoyaltyModuleIsWhitelistedRoyaltyTokenResponse = boolean;

export type RoyaltyModuleNameResponse = string;

/**
 * RoyaltyModuleRoyaltyPoliciesRequest
 *
 * @param ipId address
 */
export type RoyaltyModuleRoyaltyPoliciesRequest = {
  ipId: Address;
};

/**
 * RoyaltyModuleRoyaltyPoliciesResponse
 *
 * @param royaltyPolicy address
 */
export type RoyaltyModuleRoyaltyPoliciesResponse = {
  royaltyPolicy: Address;
};

/**
 * RoyaltyModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type RoyaltyModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type RoyaltyModuleSupportsInterfaceResponse = boolean;

/**
 * RoyaltyModuleOnLicenseMintingRequest
 *
 * @param ipId address
 * @param royaltyPolicy address
 * @param licenseData bytes
 * @param externalData bytes
 */
export type RoyaltyModuleOnLicenseMintingRequest = {
  ipId: Address;
  royaltyPolicy: Address;
  licenseData: Hex;
  externalData: Hex;
};

/**
 * RoyaltyModuleOnLinkToParentsRequest
 *
 * @param ipId address
 * @param royaltyPolicy address
 * @param parentIpIds address[]
 * @param licenseData bytes[]
 * @param externalData bytes
 */
export type RoyaltyModuleOnLinkToParentsRequest = {
  ipId: Address;
  royaltyPolicy: Address;
  parentIpIds: readonly Address[];
  licenseData: readonly Hex[];
  externalData: Hex;
};

/**
 * RoyaltyModulePayLicenseMintingFeeRequest
 *
 * @param receiverIpId address
 * @param payerAddress address
 * @param licenseRoyaltyPolicy address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyModulePayLicenseMintingFeeRequest = {
  receiverIpId: Address;
  payerAddress: Address;
  licenseRoyaltyPolicy: Address;
  token: Address;
  amount: bigint;
};

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
 * RoyaltyModuleSetGovernanceRequest
 *
 * @param newGovernance address
 */
export type RoyaltyModuleSetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * RoyaltyModuleSetLicensingModuleRequest
 *
 * @param licensingModule address
 */
export type RoyaltyModuleSetLicensingModuleRequest = {
  licensingModule: Address;
};

/**
 * RoyaltyModuleWhitelistRoyaltyPolicyRequest
 *
 * @param royaltyPolicy address
 * @param allowed bool
 */
export type RoyaltyModuleWhitelistRoyaltyPolicyRequest = {
  royaltyPolicy: Address;
  allowed: boolean;
};

/**
 * RoyaltyModuleWhitelistRoyaltyTokenRequest
 *
 * @param token address
 * @param allowed bool
 */
export type RoyaltyModuleWhitelistRoyaltyTokenRequest = {
  token: Address;
  allowed: boolean;
};

/**
 * RoyaltyModuleGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type RoyaltyModuleGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * RoyaltyModuleLicenseMintingFeePaidEvent
 *
 * @param receiverIpId address (optional)
 * @param payerAddress address (optional)
 * @param token address (optional)
 * @param amount uint256 (optional)
 */
export type RoyaltyModuleLicenseMintingFeePaidEvent = {
  receiverIpId?: Address;
  payerAddress?: Address;
  token?: Address;
  amount?: bigint;
};

/**
 * RoyaltyModuleRoyaltyPaidEvent
 *
 * @param receiverIpId address (optional)
 * @param payerIpId address (optional)
 * @param sender address (optional)
 * @param token address (optional)
 * @param amount uint256 (optional)
 */
export type RoyaltyModuleRoyaltyPaidEvent = {
  receiverIpId?: Address;
  payerIpId?: Address;
  sender?: Address;
  token?: Address;
  amount?: bigint;
};

/**
 * RoyaltyModuleRoyaltyPolicyWhitelistUpdatedEvent
 *
 * @param royaltyPolicy address (optional)
 * @param allowed bool (optional)
 */
export type RoyaltyModuleRoyaltyPolicyWhitelistUpdatedEvent = {
  royaltyPolicy?: Address;
  allowed?: boolean;
};

/**
 * RoyaltyModuleRoyaltyTokenWhitelistUpdatedEvent
 *
 * @param token address (optional)
 * @param allowed bool (optional)
 */
export type RoyaltyModuleRoyaltyTokenWhitelistUpdatedEvent = {
  token?: Address;
  allowed?: boolean;
};

/**
 * contract RoyaltyModule readonly method
 */
export class RoyaltyModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xE1a667ccc38540b38d8579c499bE22e51390a308",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method LICENSING_MODULE for contract RoyaltyModule
   *
   * @param request RoyaltyModuleLicensingModuleRequest
   * @return Promise<RoyaltyModuleLicensingModuleResponse>
   */
  public async licensingModule(): Promise<RoyaltyModuleLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "LICENSING_MODULE",
    });
  }

  /**
   * method getGovernance for contract RoyaltyModule
   *
   * @param request RoyaltyModuleGetGovernanceRequest
   * @return Promise<RoyaltyModuleGetGovernanceResponse>
   */
  public async getGovernance(): Promise<RoyaltyModuleGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method governance for contract RoyaltyModule
   *
   * @param request RoyaltyModuleGovernanceRequest
   * @return Promise<RoyaltyModuleGovernanceResponse>
   */
  public async governance(): Promise<RoyaltyModuleGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "governance",
    });
  }

  /**
   * method isWhitelistedRoyaltyPolicy for contract RoyaltyModule
   *
   * @param request RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest
   * @return Promise<RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse>
   */
  public async isWhitelistedRoyaltyPolicy(
    request: RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest,
  ): Promise<RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "isWhitelistedRoyaltyPolicy",
      args: [request.royaltyPolicy],
    });
    return {
      isWhitelisted: result,
    };
  }

  /**
   * method isWhitelistedRoyaltyToken for contract RoyaltyModule
   *
   * @param request RoyaltyModuleIsWhitelistedRoyaltyTokenRequest
   * @return Promise<RoyaltyModuleIsWhitelistedRoyaltyTokenResponse>
   */
  public async isWhitelistedRoyaltyToken(
    request: RoyaltyModuleIsWhitelistedRoyaltyTokenRequest,
  ): Promise<RoyaltyModuleIsWhitelistedRoyaltyTokenResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "isWhitelistedRoyaltyToken",
      args: [request.token],
    });
  }

  /**
   * method name for contract RoyaltyModule
   *
   * @param request RoyaltyModuleNameRequest
   * @return Promise<RoyaltyModuleNameResponse>
   */
  public async name(): Promise<RoyaltyModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method royaltyPolicies for contract RoyaltyModule
   *
   * @param request RoyaltyModuleRoyaltyPoliciesRequest
   * @return Promise<RoyaltyModuleRoyaltyPoliciesResponse>
   */
  public async royaltyPolicies(
    request: RoyaltyModuleRoyaltyPoliciesRequest,
  ): Promise<RoyaltyModuleRoyaltyPoliciesResponse> {
    const result = await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "royaltyPolicies",
      args: [request.ipId],
    });
    return {
      royaltyPolicy: result,
    };
  }

  /**
   * method supportsInterface for contract RoyaltyModule
   *
   * @param request RoyaltyModuleSupportsInterfaceRequest
   * @return Promise<RoyaltyModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: RoyaltyModuleSupportsInterfaceRequest,
  ): Promise<RoyaltyModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract RoyaltyModule write method
 */
export class RoyaltyModuleClient extends RoyaltyModuleReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0xE1a667ccc38540b38d8579c499bE22e51390a308",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method onLicenseMinting for contract RoyaltyModule
   *
   * @param request RoyaltyModuleOnLicenseMintingRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onLicenseMinting(
    request: RoyaltyModuleOnLicenseMintingRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "onLicenseMinting",
      account: this.wallet.account,
      args: [request.ipId, request.royaltyPolicy, request.licenseData, request.externalData],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onLinkToParents for contract RoyaltyModule
   *
   * @param request RoyaltyModuleOnLinkToParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onLinkToParents(
    request: RoyaltyModuleOnLinkToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "onLinkToParents",
      account: this.wallet.account,
      args: [
        request.ipId,
        request.royaltyPolicy,
        request.parentIpIds,
        request.licenseData,
        request.externalData,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method payLicenseMintingFee for contract RoyaltyModule
   *
   * @param request RoyaltyModulePayLicenseMintingFeeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async payLicenseMintingFee(
    request: RoyaltyModulePayLicenseMintingFeeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "payLicenseMintingFee",
      account: this.wallet.account,
      args: [
        request.receiverIpId,
        request.payerAddress,
        request.licenseRoyaltyPolicy,
        request.token,
        request.amount,
      ],
    });
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract RoyaltyModule
   *
   * @param request RoyaltyModuleSetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: RoyaltyModuleSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setLicensingModule for contract RoyaltyModule
   *
   * @param request RoyaltyModuleSetLicensingModuleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setLicensingModule(
    request: RoyaltyModuleSetLicensingModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "setLicensingModule",
      account: this.wallet.account,
      args: [request.licensingModule],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method whitelistRoyaltyPolicy for contract RoyaltyModule
   *
   * @param request RoyaltyModuleWhitelistRoyaltyPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async whitelistRoyaltyPolicy(
    request: RoyaltyModuleWhitelistRoyaltyPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "whitelistRoyaltyPolicy",
      account: this.wallet.account,
      args: [request.royaltyPolicy, request.allowed],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method whitelistRoyaltyToken for contract RoyaltyModule
   *
   * @param request RoyaltyModuleWhitelistRoyaltyTokenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async whitelistRoyaltyToken(
    request: RoyaltyModuleWhitelistRoyaltyTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "whitelistRoyaltyToken",
      account: this.wallet.account,
      args: [request.token, request.allowed],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract RoyaltyModule event
 */
export class RoyaltyModuleEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0xE1a667ccc38540b38d8579c499bE22e51390a308",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event GovernanceUpdated for contract RoyaltyModule
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event LicenseMintingFeePaid for contract RoyaltyModule
   */
  public watchLicenseMintingFeePaidEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleLicenseMintingFeePaidEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: "LicenseMintingFeePaid",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event RoyaltyPaid for contract RoyaltyModule
   */
  public watchRoyaltyPaidEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleRoyaltyPaidEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: "RoyaltyPaid",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event RoyaltyPolicyWhitelistUpdated for contract RoyaltyModule
   */
  public watchRoyaltyPolicyWhitelistUpdatedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleRoyaltyPolicyWhitelistUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: "RoyaltyPolicyWhitelistUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event RoyaltyTokenWhitelistUpdated for contract RoyaltyModule
   */
  public watchRoyaltyTokenWhitelistUpdatedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleRoyaltyTokenWhitelistUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: "RoyaltyTokenWhitelistUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract RoyaltyPolicyLAP =============================================================

export type RoyaltyPolicyLapAncestorsVaultImplResponse = Address;

export type RoyaltyPolicyLapLicensingModuleResponse = Address;

export type RoyaltyPolicyLapLiquidSplitFactoryResponse = Address;

export type RoyaltyPolicyLapLiquidSplitMainResponse = Address;

export type RoyaltyPolicyLapMaxAncestorsResponse = bigint;

export type RoyaltyPolicyLapMaxParentsResponse = bigint;

export type RoyaltyPolicyLapRoyaltyModuleResponse = Address;

export type RoyaltyPolicyLapTotalRnftSupplyResponse = number;

export type RoyaltyPolicyLapGetGovernanceResponse = Address;

export type RoyaltyPolicyLapGovernanceResponse = Address;

/**
 * RoyaltyPolicyLapRoyaltyDataRequest
 *
 * @param ipId address
 */
export type RoyaltyPolicyLapRoyaltyDataRequest = {
  ipId: Address;
};

/**
 * RoyaltyPolicyLapRoyaltyDataResponse
 *
 * @param isUnlinkableToParents bool
 * @param splitClone address
 * @param ancestorsVault address
 * @param royaltyStack uint32
 * @param ancestorsHash bytes32
 */
export type RoyaltyPolicyLapRoyaltyDataResponse = {
  isUnlinkableToParents: boolean;
  splitClone: Address;
  ancestorsVault: Address;
  royaltyStack: number;
  ancestorsHash: Hex;
};

/**
 * RoyaltyPolicyLapSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type RoyaltyPolicyLapSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type RoyaltyPolicyLapSupportsInterfaceResponse = boolean;

/**
 * RoyaltyPolicyLapClaimFromAncestorsVaultRequest
 *
 * @param ipId address
 * @param claimerIpId address
 * @param ancestors address[]
 * @param ancestorsRoyalties uint32[]
 * @param withdrawETH bool
 * @param tokens address[]
 */
export type RoyaltyPolicyLapClaimFromAncestorsVaultRequest = {
  ipId: Address;
  claimerIpId: Address;
  ancestors: readonly Address[];
  ancestorsRoyalties: readonly number[];
  withdrawETH: boolean;
  tokens: readonly Address[];
};

/**
 * RoyaltyPolicyLapClaimFromIpPoolRequest
 *
 * @param account address
 * @param withdrawETH uint256
 * @param tokens address[]
 */
export type RoyaltyPolicyLapClaimFromIpPoolRequest = {
  account: Address;
  withdrawETH: bigint;
  tokens: readonly Address[];
};

/**
 * RoyaltyPolicyLapClaimFromIpPoolAsTotalRnftOwnerRequest
 *
 * @param ipId address
 * @param withdrawETH uint256
 * @param token address
 */
export type RoyaltyPolicyLapClaimFromIpPoolAsTotalRnftOwnerRequest = {
  ipId: Address;
  withdrawETH: bigint;
  token: Address;
};

/**
 * RoyaltyPolicyLapDistributeIpPoolFundsRequest
 *
 * @param ipId address
 * @param token address
 * @param accounts address[]
 * @param distributorAddress address
 */
export type RoyaltyPolicyLapDistributeIpPoolFundsRequest = {
  ipId: Address;
  token: Address;
  accounts: readonly Address[];
  distributorAddress: Address;
};

/**
 * RoyaltyPolicyLapOnErc1155BatchReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256[]
 * @param 3 uint256[]
 * @param 4 bytes
 */
export type RoyaltyPolicyLapOnErc1155BatchReceivedRequest = readonly [
  Address,
  Address,
  readonly bigint[],
  readonly bigint[],
  Hex,
];

/**
 * RoyaltyPolicyLapOnErc1155ReceivedRequest
 *
 * @param 0 address
 * @param 1 address
 * @param 2 uint256
 * @param 3 uint256
 * @param 4 bytes
 */
export type RoyaltyPolicyLapOnErc1155ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  bigint,
  Hex,
];

/**
 * RoyaltyPolicyLapOnLicenseMintingRequest
 *
 * @param ipId address
 * @param licenseData bytes
 * @param externalData bytes
 */
export type RoyaltyPolicyLapOnLicenseMintingRequest = {
  ipId: Address;
  licenseData: Hex;
  externalData: Hex;
};

/**
 * RoyaltyPolicyLapOnLinkToParentsRequest
 *
 * @param ipId address
 * @param parentIpIds address[]
 * @param licenseData bytes[]
 * @param externalData bytes
 */
export type RoyaltyPolicyLapOnLinkToParentsRequest = {
  ipId: Address;
  parentIpIds: readonly Address[];
  licenseData: readonly Hex[];
  externalData: Hex;
};

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
 * RoyaltyPolicyLapSetAncestorsVaultImplementationRequest
 *
 * @param ancestorsVaultImpl address
 */
export type RoyaltyPolicyLapSetAncestorsVaultImplementationRequest = {
  ancestorsVaultImpl: Address;
};

/**
 * RoyaltyPolicyLapSetGovernanceRequest
 *
 * @param newGovernance address
 */
export type RoyaltyPolicyLapSetGovernanceRequest = {
  newGovernance: Address;
};

/**
 * RoyaltyPolicyLapGovernanceUpdatedEvent
 *
 * @param newGovernance address (optional)
 */
export type RoyaltyPolicyLapGovernanceUpdatedEvent = {
  newGovernance?: Address;
};

/**
 * RoyaltyPolicyLapPolicyInitializedEvent
 *
 * @param ipId address (optional)
 * @param splitClone address (optional)
 * @param ancestorsVault address (optional)
 * @param royaltyStack uint32 (optional)
 * @param targetAncestors address[] (optional)
 * @param targetRoyaltyAmount uint32[] (optional)
 */
export type RoyaltyPolicyLapPolicyInitializedEvent = {
  ipId?: Address;
  splitClone?: Address;
  ancestorsVault?: Address;
  royaltyStack?: number;
  targetAncestors?: readonly Address[];
  targetRoyaltyAmount?: readonly number[];
};

/**
 * contract RoyaltyPolicyLAP readonly method
 */
export class RoyaltyPolicyLapReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x265C21b34e0E92d63C678425478C42aa8D727B79",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ANCESTORS_VAULT_IMPL for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapAncestorsVaultImplRequest
   * @return Promise<RoyaltyPolicyLapAncestorsVaultImplResponse>
   */
  public async ancestorsVaultImpl(): Promise<RoyaltyPolicyLapAncestorsVaultImplResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "ANCESTORS_VAULT_IMPL",
    });
  }

  /**
   * method LICENSING_MODULE for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapLicensingModuleRequest
   * @return Promise<RoyaltyPolicyLapLicensingModuleResponse>
   */
  public async licensingModule(): Promise<RoyaltyPolicyLapLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "LICENSING_MODULE",
    });
  }

  /**
   * method LIQUID_SPLIT_FACTORY for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapLiquidSplitFactoryRequest
   * @return Promise<RoyaltyPolicyLapLiquidSplitFactoryResponse>
   */
  public async liquidSplitFactory(): Promise<RoyaltyPolicyLapLiquidSplitFactoryResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "LIQUID_SPLIT_FACTORY",
    });
  }

  /**
   * method LIQUID_SPLIT_MAIN for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapLiquidSplitMainRequest
   * @return Promise<RoyaltyPolicyLapLiquidSplitMainResponse>
   */
  public async liquidSplitMain(): Promise<RoyaltyPolicyLapLiquidSplitMainResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "LIQUID_SPLIT_MAIN",
    });
  }

  /**
   * method MAX_ANCESTORS for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapMaxAncestorsRequest
   * @return Promise<RoyaltyPolicyLapMaxAncestorsResponse>
   */
  public async maxAncestors(): Promise<RoyaltyPolicyLapMaxAncestorsResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "MAX_ANCESTORS",
    });
  }

  /**
   * method MAX_PARENTS for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapMaxParentsRequest
   * @return Promise<RoyaltyPolicyLapMaxParentsResponse>
   */
  public async maxParents(): Promise<RoyaltyPolicyLapMaxParentsResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "MAX_PARENTS",
    });
  }

  /**
   * method ROYALTY_MODULE for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapRoyaltyModuleRequest
   * @return Promise<RoyaltyPolicyLapRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<RoyaltyPolicyLapRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method TOTAL_RNFT_SUPPLY for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapTotalRnftSupplyRequest
   * @return Promise<RoyaltyPolicyLapTotalRnftSupplyResponse>
   */
  public async totalRnftSupply(): Promise<RoyaltyPolicyLapTotalRnftSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "TOTAL_RNFT_SUPPLY",
    });
  }

  /**
   * method getGovernance for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapGetGovernanceRequest
   * @return Promise<RoyaltyPolicyLapGetGovernanceResponse>
   */
  public async getGovernance(): Promise<RoyaltyPolicyLapGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "getGovernance",
    });
  }

  /**
   * method governance for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapGovernanceRequest
   * @return Promise<RoyaltyPolicyLapGovernanceResponse>
   */
  public async governance(): Promise<RoyaltyPolicyLapGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "governance",
    });
  }

  /**
   * method royaltyData for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapRoyaltyDataRequest
   * @return Promise<RoyaltyPolicyLapRoyaltyDataResponse>
   */
  public async royaltyData(
    request: RoyaltyPolicyLapRoyaltyDataRequest,
  ): Promise<RoyaltyPolicyLapRoyaltyDataResponse> {
    const result = await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "royaltyData",
      args: [request.ipId],
    });
    return {
      isUnlinkableToParents: result[0],
      splitClone: result[1],
      ancestorsVault: result[2],
      royaltyStack: result[3],
      ancestorsHash: result[4],
    };
  }

  /**
   * method supportsInterface for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapSupportsInterfaceRequest
   * @return Promise<RoyaltyPolicyLapSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: RoyaltyPolicyLapSupportsInterfaceRequest,
  ): Promise<RoyaltyPolicyLapSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract RoyaltyPolicyLAP write method
 */
export class RoyaltyPolicyLapClient extends RoyaltyPolicyLapReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x265C21b34e0E92d63C678425478C42aa8D727B79",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method claimFromAncestorsVault for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapClaimFromAncestorsVaultRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimFromAncestorsVault(
    request: RoyaltyPolicyLapClaimFromAncestorsVaultRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "claimFromAncestorsVault",
      account: this.wallet.account,
      args: [
        request.ipId,
        request.claimerIpId,
        request.ancestors,
        request.ancestorsRoyalties,
        request.withdrawETH,
        request.tokens,
      ],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method claimFromIpPool for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapClaimFromIpPoolRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimFromIpPool(
    request: RoyaltyPolicyLapClaimFromIpPoolRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "claimFromIpPool",
      account: this.wallet.account,
      args: [request.account, request.withdrawETH, request.tokens],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method claimFromIpPoolAsTotalRnftOwner for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapClaimFromIpPoolAsTotalRnftOwnerRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimFromIpPoolAsTotalRnftOwner(
    request: RoyaltyPolicyLapClaimFromIpPoolAsTotalRnftOwnerRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "claimFromIpPoolAsTotalRnftOwner",
      account: this.wallet.account,
      args: [request.ipId, request.withdrawETH, request.token],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method distributeIpPoolFunds for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapDistributeIpPoolFundsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async distributeIpPoolFunds(
    request: RoyaltyPolicyLapDistributeIpPoolFundsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "distributeIpPoolFunds",
      account: this.wallet.account,
      args: [request.ipId, request.token, request.accounts, request.distributorAddress],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onERC1155BatchReceived for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnErc1155BatchReceivedRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onErc1155BatchReceived(
    request: RoyaltyPolicyLapOnErc1155BatchReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "onERC1155BatchReceived",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onERC1155Received for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnErc1155ReceivedRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onErc1155Received(
    request: RoyaltyPolicyLapOnErc1155ReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "onERC1155Received",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onLicenseMinting for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnLicenseMintingRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onLicenseMinting(
    request: RoyaltyPolicyLapOnLicenseMintingRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "onLicenseMinting",
      account: this.wallet.account,
      args: [request.ipId, request.licenseData, request.externalData],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method onLinkToParents for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnLinkToParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onLinkToParents(
    request: RoyaltyPolicyLapOnLinkToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "onLinkToParents",
      account: this.wallet.account,
      args: [request.ipId, request.parentIpIds, request.licenseData, request.externalData],
    });
    return await this.wallet.writeContract(call);
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
    return await this.wallet.writeContract(call);
  }

  /**
   * method setAncestorsVaultImplementation for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapSetAncestorsVaultImplementationRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAncestorsVaultImplementation(
    request: RoyaltyPolicyLapSetAncestorsVaultImplementationRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "setAncestorsVaultImplementation",
      account: this.wallet.account,
      args: [request.ancestorsVaultImpl],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method setGovernance for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapSetGovernanceRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setGovernance(
    request: RoyaltyPolicyLapSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: "setGovernance",
      account: this.wallet.account,
      args: [request.newGovernance],
    });
    return await this.wallet.writeContract(call);
  }
}

/**
 * contract RoyaltyPolicyLAP event
 */
export class RoyaltyPolicyLapEventClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x265C21b34e0E92d63C678425478C42aa8D727B79",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * event GovernanceUpdated for contract RoyaltyPolicyLAP
   */
  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyPolicyLapGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      eventName: "GovernanceUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * event PolicyInitialized for contract RoyaltyPolicyLAP
   */
  public watchPolicyInitializedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyPolicyLapPolicyInitializedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      eventName: "PolicyInitialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }
}

// Contract TokenWithdrawalModule =============================================================

export type TokenWithdrawalModuleAccessControllerResponse = Address;

export type TokenWithdrawalModuleIpAccountRegistryResponse = Address;

export type TokenWithdrawalModuleNameResponse = string;

/**
 * TokenWithdrawalModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type TokenWithdrawalModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type TokenWithdrawalModuleSupportsInterfaceResponse = boolean;

/**
 * TokenWithdrawalModuleWithdrawErc1155Request
 *
 * @param ipAccount address
 * @param tokenContract address
 * @param tokenId uint256
 * @param amount uint256
 */
export type TokenWithdrawalModuleWithdrawErc1155Request = {
  ipAccount: Address;
  tokenContract: Address;
  tokenId: bigint;
  amount: bigint;
};

/**
 * TokenWithdrawalModuleWithdrawErc20Request
 *
 * @param ipAccount address
 * @param tokenContract address
 * @param amount uint256
 */
export type TokenWithdrawalModuleWithdrawErc20Request = {
  ipAccount: Address;
  tokenContract: Address;
  amount: bigint;
};

/**
 * TokenWithdrawalModuleWithdrawErc721Request
 *
 * @param ipAccount address
 * @param tokenContract address
 * @param tokenId uint256
 */
export type TokenWithdrawalModuleWithdrawErc721Request = {
  ipAccount: Address;
  tokenContract: Address;
  tokenId: bigint;
};

/**
 * contract TokenWithdrawalModule readonly method
 */
export class TokenWithdrawalModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  protected readonly address: Address;

  constructor(
    rpcClient: PublicClient,
    address: Address = "0x5f62d238B3022bA5881e5e443B014cac6999a4f2",
  ) {
    this.address = address;
    this.rpcClient = rpcClient;
  }

  /**
   * method ACCESS_CONTROLLER for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleAccessControllerRequest
   * @return Promise<TokenWithdrawalModuleAccessControllerResponse>
   */
  public async accessController(): Promise<TokenWithdrawalModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleIpAccountRegistryRequest
   * @return Promise<TokenWithdrawalModuleIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<TokenWithdrawalModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method name for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleNameRequest
   * @return Promise<TokenWithdrawalModuleNameResponse>
   */
  public async name(): Promise<TokenWithdrawalModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method supportsInterface for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleSupportsInterfaceRequest
   * @return Promise<TokenWithdrawalModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: TokenWithdrawalModuleSupportsInterfaceRequest,
  ): Promise<TokenWithdrawalModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract TokenWithdrawalModule write method
 */
export class TokenWithdrawalModuleClient extends TokenWithdrawalModuleReadOnlyClient {
  protected readonly wallet: WalletClient;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = "0x5f62d238B3022bA5881e5e443B014cac6999a4f2",
  ) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method withdrawERC1155 for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleWithdrawErc1155Request
   * @return Promise<WriteContractReturnType>
   */
  public async withdrawErc1155(
    request: TokenWithdrawalModuleWithdrawErc1155Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "withdrawERC1155",
      account: this.wallet.account,
      args: [request.ipAccount, request.tokenContract, request.tokenId, request.amount],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method withdrawERC20 for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleWithdrawErc20Request
   * @return Promise<WriteContractReturnType>
   */
  public async withdrawErc20(
    request: TokenWithdrawalModuleWithdrawErc20Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "withdrawERC20",
      account: this.wallet.account,
      args: [request.ipAccount, request.tokenContract, request.amount],
    });
    return await this.wallet.writeContract(call);
  }

  /**
   * method withdrawERC721 for contract TokenWithdrawalModule
   *
   * @param request TokenWithdrawalModuleWithdrawErc721Request
   * @return Promise<WriteContractReturnType>
   */
  public async withdrawErc721(
    request: TokenWithdrawalModuleWithdrawErc721Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: "withdrawERC721",
      account: this.wallet.account,
      args: [request.ipAccount, request.tokenContract, request.tokenId],
    });
    return await this.wallet.writeContract(call);
  }
}
