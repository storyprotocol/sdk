import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen"

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const licenseRegistryAbi = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "id", internalType: "uint256", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "accounts", internalType: "address[]", type: "address[]" },
      { name: "ids", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "balanceOfBatch",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "holder", internalType: "address", type: "address" },
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "burnLicenses",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "holder", internalType: "address", type: "address" },
    ],
    name: "isLicensee",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "licensingModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    name: "licensorIpId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "policyId", internalType: "uint256", type: "uint256" },
      { name: "licensorIp", internalType: "address", type: "address" },
      { name: "transferable", internalType: "bool", type: "bool" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mintLicense",
    outputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "mintedLicenses",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "licenseId", internalType: "uint256", type: "uint256" }],
    name: "policyIdForLicense",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
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
    inputs: [{ name: "newLicensingModule", internalType: "address", type: "address" }],
    name: "setLicensingModule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    name: "uri",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "account", internalType: "address", type: "address", indexed: true },
      { name: "operator", internalType: "address", type: "address", indexed: true },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "creator", internalType: "address", type: "address", indexed: true },
      { name: "receiver", internalType: "address", type: "address", indexed: true },
      { name: "licenseId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "amount", internalType: "uint256", type: "uint256", indexed: false },
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
      { name: "operator", internalType: "address", type: "address", indexed: true },
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "ids", internalType: "uint256[]", type: "uint256[]", indexed: false },
      { name: "values", internalType: "uint256[]", type: "uint256[]", indexed: false },
    ],
    name: "TransferBatch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "operator", internalType: "address", type: "address", indexed: true },
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "id", internalType: "uint256", type: "uint256", indexed: false },
      { name: "value", internalType: "uint256", type: "uint256", indexed: false },
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
  { type: "error", inputs: [], name: "LicenseRegistry__CallerNotLicensingModule" },
  { type: "error", inputs: [], name: "LicenseRegistry__NotTransferable" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroLicensingModule" },
] as const

export const licenseRegistryAddress = "0x6F7FB37F668ba0F85b6a9C7Ffa02fEA1b3036aEF" as const

export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useReadLicenseRegistry = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "balanceOf",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const useReadBalanceOfBatch = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "balanceOfBatch",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "isApprovedForAll",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"isLicensee"`
 */
export const useReadIsLicensee = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "isLicensee",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"license"`
 */
export const useReadLicense = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "license",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"licensingModule"`
 */
export const useReadLicensingModule = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "licensingModule",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"licensorIpId"`
 */
export const useReadLicensorIpId = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "licensorIpId",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"mintedLicenses"`
 */
export const useReadMintedLicenses = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "mintedLicenses",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"policyIdForLicense"`
 */
export const useReadPolicyIdForLicense = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "policyIdForLicense",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLicenseRegistrySupportsInterface = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "supportsInterface",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"uri"`
 */
export const useReadUri = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "uri",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useWriteLicenseRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"burnLicenses"`
 */
export const useBurnLicenses = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "burnLicenses",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"mintLicense"`
 */
export const useMintLicense = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "mintLicense",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSafeBatchTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "safeBatchTransferFrom",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSafeTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "safeTransferFrom",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSetApprovalForAll = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "setApprovalForAll",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setLicensingModule"`
 */
export const useSetLicensingModule = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "setLicensingModule",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useSimulateLicenseRegistry = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"burnLicenses"`
 */
export const useSimulateBurnLicenses = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "burnLicenses",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"mintLicense"`
 */
export const useSimulateMintLicense = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "mintLicense",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSimulateSafeBatchTransferFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "safeBatchTransferFrom",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateSafeTransferFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "safeTransferFrom",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateSetApprovalForAll = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "setApprovalForAll",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setLicensingModule"`
 */
export const useSimulateSetLicensingModule = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: "setLicensingModule",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useWatchLicenseRegistry = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchApprovalForAll = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: "ApprovalForAll",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"LicenseMinted"`
 */
export const useWatchLicenseMinted = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: "LicenseMinted",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const useWatchTransferBatch = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: "TransferBatch",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const useWatchTransferSingle = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: "TransferSingle",
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"URI"`
 */
export const useWatchUri = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: "URI",
})
