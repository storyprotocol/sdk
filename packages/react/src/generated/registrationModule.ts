import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen"

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RegistrationModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const registrationModuleAbi = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "controller", internalType: "address", type: "address" },
      { name: "assetRegistry", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "resolverAddr", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAccountRegistry", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IPAssetRegistry", type: "address" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "ipName", internalType: "string", type: "string" },
      { name: "contentHash", internalType: "bytes32", type: "bytes32" },
      { name: "externalURL", internalType: "string", type: "string" },
      { name: "minRoyalty", internalType: "uint32", type: "uint32" },
    ],
    name: "registerDerivativeIp",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "resolver",
    outputs: [{ name: "", internalType: "contract IPResolver", type: "address" }],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "caller", internalType: "address", type: "address", indexed: true },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]", indexed: false },
    ],
    name: "DerivativeIPRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "caller", internalType: "address", type: "address", indexed: true },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "policyId", internalType: "uint256", type: "uint256", indexed: true },
    ],
    name: "RootIPRegistered",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  { type: "error", inputs: [], name: "RegistrationModule__InvalidOwner" },
] as const

export const registrationModuleAddress = "0x27c899af5AD9024570B9e5c58831726b48430212" as const

export const registrationModuleConfig = {
  address: registrationModuleAddress,
  abi: registrationModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useReadRegistrationModule = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"ACCESS_CONTROLLER"`
 */
export const useReadRegistrationModuleAccessController = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "ACCESS_CONTROLLER",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadRegistrationModuleIpAccountRegistry = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "IP_ACCOUNT_REGISTRY",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"IP_ASSET_REGISTRY"`
 */
export const useReadRegistrationModuleIpAssetRegistry = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "IP_ASSET_REGISTRY",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"name"`
 */
export const useReadRegistrationModuleName = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "name",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"resolver"`
 */
export const useReadRegistrationModuleResolver = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "resolver",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useWriteRegistrationModule = /*#__PURE__*/ createUseWriteContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerDerivativeIp"`
 */
export const useWriteRegistrationModuleRegisterDerivativeIp = /*#__PURE__*/ createUseWriteContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "registerDerivativeIp",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerRootIp"`
 */
export const useWriteRegistrationModuleRegisterRootIp = /*#__PURE__*/ createUseWriteContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "registerRootIp",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useSimulateRegistrationModule = /*#__PURE__*/ createUseSimulateContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerDerivativeIp"`
 */
export const useSimulateRegistrationModuleRegisterDerivativeIp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    functionName: "registerDerivativeIp",
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerRootIp"`
 */
export const useSimulateRegistrationModuleRegisterRootIp = /*#__PURE__*/ createUseSimulateContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: "registerRootIp",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useWatchRegistrationModule = /*#__PURE__*/ createUseWatchContractEvent({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registrationModuleAbi}__ and `eventName` set to `"DerivativeIPRegistered"`
 */
export const useWatchRegistrationModuleDerivativeIpRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    eventName: "DerivativeIPRegistered",
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registrationModuleAbi}__ and `eventName` set to `"RootIPRegistered"`
 */
export const useWatchRegistrationModuleRootIpRegistered = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: registrationModuleAbi, address: registrationModuleAddress, eventName: "RootIPRegistered" },
)
