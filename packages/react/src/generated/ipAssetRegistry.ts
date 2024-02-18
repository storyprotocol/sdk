import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IpAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAssetRegistryAbi = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "erc6551Registry", internalType: "address", type: "address" },
      { name: "ipAccountImpl", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
      { name: "governance", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ERC6551_PUBLIC_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_IMPL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_SALT",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "MODULE_REGISTRY",
    outputs: [{ name: "", internalType: "contract IModuleRegistry", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "REGISTRATION_MODULE",
    outputs: [{ name: "", internalType: "contract IRegistrationModule", type: "address" }],
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
    inputs: [],
    name: "getIPAccountImpl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governance",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipAccount",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "metadata",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "metadataProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "metadataProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "registerIpAccount",
    outputs: [{ name: "ipAccountAddress", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "resolver",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
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
      { name: "id", internalType: "address", type: "address" },
      { name: "provider", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "setMetadata",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newMetadataProvider", internalType: "address", type: "address" }],
    name: "setMetadataProvider",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "registrationModule", internalType: "address", type: "address" }],
    name: "setRegistrationModule",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "id", internalType: "address", type: "address" },
      { name: "resolverAddr", internalType: "address", type: "address" },
    ],
    name: "setResolver",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "owner", internalType: "address", type: "address", indexed: true },
      { name: "operator", internalType: "address", type: "address", indexed: true },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
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
      { name: "account", internalType: "address", type: "address", indexed: true },
      { name: "implementation", internalType: "address", type: "address", indexed: true },
      { name: "chainId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "tokenContract", internalType: "address", type: "address", indexed: false },
      { name: "tokenId", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "IPAccountRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: false },
      { name: "chainId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "tokenContract", internalType: "address", type: "address", indexed: true },
      { name: "tokenId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "resolver", internalType: "address", type: "address", indexed: false },
      { name: "provider", internalType: "address", type: "address", indexed: false },
      { name: "metadata", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "IPRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: false },
      { name: "resolver", internalType: "address", type: "address", indexed: false },
    ],
    name: "IPResolverSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "metadataProvider", internalType: "address", type: "address", indexed: true },
      { name: "metadata", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "MetadataSet",
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
  { type: "error", inputs: [], name: "IPAssetRegistry__RegistrantUnauthorized" },
  { type: "error", inputs: [], name: "IPAssetRegistry__Unauthorized" },
] as const;

export const ipAssetRegistryAddress = "0xF59adB67B7CC87436A7CC41040A7dB24AE90aDB8" as const;

export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__
 */
export const useReadIpAssetRegistry = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"ERC6551_PUBLIC_REGISTRY"`
 */
export const useReadErc6551PublicRegistry = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "ERC6551_PUBLIC_REGISTRY",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"IP_ACCOUNT_IMPL"`
 */
export const useReadIpAccountImpl = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "IP_ACCOUNT_IMPL",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"IP_ACCOUNT_SALT"`
 */
export const useReadIpAccountSalt = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "IP_ACCOUNT_SALT",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"MODULE_REGISTRY"`
 */
export const useReadModuleRegistry = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "MODULE_REGISTRY",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"REGISTRATION_MODULE"`
 */
export const useReadRegistrationModule = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "REGISTRATION_MODULE",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"getGovernance"`
 */
export const useReadGetGovernance = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "getGovernance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"getIPAccountImpl"`
 */
export const useReadGetIpAccountImpl = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "getIPAccountImpl",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"governance"`
 */
export const useReadGovernance = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "governance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"ipAccount"`
 */
export const useReadIpAccount = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "ipAccount",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"ipId"`
 */
export const useReadIpId = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "ipId",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "isApprovedForAll",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"isRegistered"`
 */
export const useReadIsRegistered = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "isRegistered",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"metadata"`
 */
export const useReadMetadata = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "metadata",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"metadataProvider"`
 */
export const useReadMetadataProvider = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "metadataProvider",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"resolver"`
 */
export const useReadResolver = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "resolver",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__
 */
export const useWriteIpAssetRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"register"`
 */
export const useRegister = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "register",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"registerIpAccount"`
 */
export const useRegisterIpAccount = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "registerIpAccount",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSetApprovalForAll = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setApprovalForAll",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSetGovernance = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setGovernance",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setMetadata"`
 */
export const useSetMetadata = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setMetadata",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setMetadataProvider"`
 */
export const useSetMetadataProvider = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setMetadataProvider",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setRegistrationModule"`
 */
export const useSetRegistrationModule = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setRegistrationModule",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setResolver"`
 */
export const useSetResolver = /*#__PURE__*/ createUseWriteContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setResolver",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__
 */
export const useSimulateIpAssetRegistry = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"register"`
 */
export const useSimulateRegister = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "register",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"registerIpAccount"`
 */
export const useSimulateRegisterIpAccount = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "registerIpAccount",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateSetApprovalForAll = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setApprovalForAll",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSimulateSetGovernance = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setGovernance",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setMetadata"`
 */
export const useSimulateSetMetadata = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setMetadata",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setMetadataProvider"`
 */
export const useSimulateSetMetadataProvider = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setMetadataProvider",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setRegistrationModule"`
 */
export const useSimulateSetRegistrationModule = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setRegistrationModule",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `functionName` set to `"setResolver"`
 */
export const useSimulateSetResolver = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  functionName: "setResolver",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__
 */
export const useWatchIpAssetRegistry = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchApprovalForAll = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  eventName: "ApprovalForAll",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `eventName` set to `"GovernanceUpdated"`
 */
export const useWatchGovernanceUpdated = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  eventName: "GovernanceUpdated",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `eventName` set to `"IPAccountRegistered"`
 */
export const useWatchIpAccountRegistered = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  eventName: "IPAccountRegistered",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `eventName` set to `"IPRegistered"`
 */
export const useWatchIpRegistered = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  eventName: "IPRegistered",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `eventName` set to `"IPResolverSet"`
 */
export const useWatchIpResolverSet = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  eventName: "IPResolverSet",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAssetRegistryAbi}__ and `eventName` set to `"MetadataSet"`
 */
export const useWatchMetadataSet = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAssetRegistryAbi,
  address: ipAssetRegistryAddress,
  eventName: "MetadataSet",
});
