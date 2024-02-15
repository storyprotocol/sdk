import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen"

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accessControllerAbi = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "governance", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "MODULE_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "ipAccount_", internalType: "address", type: "address" },
      { name: "signer_", internalType: "address", type: "address" },
      { name: "to_", internalType: "address", type: "address" },
      { name: "func_", internalType: "bytes4", type: "bytes4" },
    ],
    name: "checkPermission",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getGovernance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "getPermission",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "permissions",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "permissions_",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "signer_", internalType: "address", type: "address" },
      { name: "to_", internalType: "address", type: "address" },
      { name: "func_", internalType: "bytes4", type: "bytes4" },
      { name: "permission_", internalType: "uint8", type: "uint8" },
    ],
    name: "setGlobalPermission",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newGovernance", internalType: "address", type: "address" }],
    name: "setGovernance",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "ipAccount_", internalType: "address", type: "address" },
      { name: "signer_", internalType: "address", type: "address" },
      { name: "to_", internalType: "address", type: "address" },
      { name: "func_", internalType: "bytes4", type: "bytes4" },
      { name: "permission_", internalType: "uint8", type: "uint8" },
    ],
    name: "setPermission",
    outputs: [],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "newGovernance", internalType: "address", type: "address", indexed: true }],
    name: "GovernanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address", indexed: true },
      { name: "signer", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "func", internalType: "bytes4", type: "bytes4", indexed: false },
      { name: "permission", internalType: "uint8", type: "uint8", indexed: false },
    ],
    name: "PermissionSet",
  },
  { type: "error", inputs: [], name: "AccessController__CallerIsNotIPAccount" },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessController__IPAccountIsNotValid",
  },
  { type: "error", inputs: [], name: "AccessController__IPAccountIsZeroAddress" },
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
  {
    type: "error",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "AccessController__RecipientIsNotRegisteredModule",
  },
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
] as const

export const accessControllerAddress = "0xfeDc2A52AA77977E291d9077C7AbB60be76399FC" as const

export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__
 */
export const useReadAccessController = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadAccessControllerIpAccountRegistry = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "IP_ACCOUNT_REGISTRY",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"MODULE_REGISTRY"`
 */
export const useReadAccessControllerModuleRegistry = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "MODULE_REGISTRY",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"checkPermission"`
 */
export const useReadAccessControllerCheckPermission = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "checkPermission",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"getGovernance"`
 */
export const useReadAccessControllerGetGovernance = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "getGovernance",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"getPermission"`
 */
export const useReadAccessControllerGetPermission = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "getPermission",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"governance"`
 */
export const useReadAccessControllerGovernance = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "governance",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"permissions"`
 */
export const useReadAccessControllerPermissions = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "permissions",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__
 */
export const useWriteAccessController = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteAccessControllerInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "initialize",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setBatchPermissions"`
 */
export const useWriteAccessControllerSetBatchPermissions = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "setBatchPermissions",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGlobalPermission"`
 */
export const useWriteAccessControllerSetGlobalPermission = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "setGlobalPermission",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useWriteAccessControllerSetGovernance = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "setGovernance",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setPermission"`
 */
export const useWriteAccessControllerSetPermission = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "setPermission",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__
 */
export const useSimulateAccessController = /*#__PURE__*/ createUseSimulateContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateAccessControllerInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "initialize",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setBatchPermissions"`
 */
export const useSimulateAccessControllerSetBatchPermissions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: accessControllerAbi,
    address: accessControllerAddress,
    functionName: "setBatchPermissions",
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGlobalPermission"`
 */
export const useSimulateAccessControllerSetGlobalPermission =
  /*#__PURE__*/ createUseSimulateContract({
    abi: accessControllerAbi,
    address: accessControllerAddress,
    functionName: "setGlobalPermission",
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSimulateAccessControllerSetGovernance = /*#__PURE__*/ createUseSimulateContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "setGovernance",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setPermission"`
 */
export const useSimulateAccessControllerSetPermission = /*#__PURE__*/ createUseSimulateContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: "setPermission",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link accessControllerAbi}__
 */
export const useWatchAccessController = /*#__PURE__*/ createUseWatchContractEvent({
  abi: accessControllerAbi,
  address: accessControllerAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link accessControllerAbi}__ and `eventName` set to `"GovernanceUpdated"`
 */
export const useWatchAccessControllerGovernanceUpdated = /*#__PURE__*/ createUseWatchContractEvent({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  eventName: "GovernanceUpdated",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link accessControllerAbi}__ and `eventName` set to `"PermissionSet"`
 */
export const useWatchAccessControllerPermissionSet = /*#__PURE__*/ createUseWatchContractEvent({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  eventName: "PermissionSet",
})
