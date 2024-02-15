import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen"

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UMLPolicyFrameworkManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const umlPolicyFrameworkManagerAbi = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "licensing", internalType: "address", type: "address" },
      { name: "name_", internalType: "string", type: "string" },
      { name: "licenseUrl_", internalType: "string", type: "string" },
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
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getAggregator",
    outputs: [
      {
        name: "rights",
        internalType: "struct UMLAggregator",
        type: "tuple",
        components: [
          { name: "commercial", internalType: "bool", type: "bool" },
          { name: "derivatives", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "lastPolicyId", internalType: "uint256", type: "uint256" },
          { name: "territoriesAcc", internalType: "bytes32", type: "bytes32" },
          { name: "distributionChannelsAcc", internalType: "bytes32", type: "bytes32" },
          { name: "contentRestrictionsAcc", internalType: "bytes32", type: "bytes32" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "getCommercialRevenueShare",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "getPolicy",
    outputs: [
      {
        name: "policy",
        internalType: "struct UMLPolicy",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "attribution", internalType: "bool", type: "bool" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          { name: "commercializers", internalType: "string[]", type: "string[]" },
          { name: "commercialRevShare", internalType: "uint32", type: "uint32" },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          { name: "derivativesAttribution", internalType: "bool", type: "bool" },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "derivativesRevShare", internalType: "uint32", type: "uint32" },
          { name: "territories", internalType: "string[]", type: "string[]" },
          { name: "distributionChannels", internalType: "string[]", type: "string[]" },
          { name: "contentRestrictions", internalType: "string[]", type: "string[]" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "umlPolicy",
        internalType: "struct UMLPolicy",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "attribution", internalType: "bool", type: "bool" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          { name: "commercializers", internalType: "string[]", type: "string[]" },
          { name: "commercialRevShare", internalType: "uint32", type: "uint32" },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          { name: "derivativesAttribution", internalType: "bool", type: "bool" },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "derivativesRevShare", internalType: "uint32", type: "uint32" },
          { name: "territories", internalType: "string[]", type: "string[]" },
          { name: "distributionChannels", internalType: "string[]", type: "string[]" },
          { name: "contentRestrictions", internalType: "string[]", type: "string[]" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "getPolicyId",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "getRoyaltyPolicy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isDerivativeApproved",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "isPolicyCommercial",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "licenseTextUrl",
    outputs: [{ name: "", internalType: "string", type: "string" }],
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
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyData", internalType: "bytes", type: "bytes" }],
    name: "policyToJson",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "umlPolicy",
        internalType: "struct UMLPolicy",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "attribution", internalType: "bool", type: "bool" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          { name: "commercializers", internalType: "string[]", type: "string[]" },
          { name: "commercialRevShare", internalType: "uint32", type: "uint32" },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          { name: "derivativesAttribution", internalType: "bool", type: "bool" },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "derivativesRevShare", internalType: "uint32", type: "uint32" },
          { name: "territories", internalType: "string[]", type: "string[]" },
          { name: "distributionChannels", internalType: "string[]", type: "string[]" },
          { name: "contentRestrictions", internalType: "string[]", type: "string[]" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "registerPolicy",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApproval",
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
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "policyData", internalType: "bytes", type: "bytes" },
    ],
    name: "verifyLink",
    outputs: [
      {
        name: "",
        internalType: "struct IPolicyFrameworkManager.VerifyLinkResponse",
        type: "tuple",
        components: [
          { name: "isLinkingAllowed", internalType: "bool", type: "bool" },
          { name: "isRoyaltyRequired", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "royaltyDerivativeRevShare", internalType: "uint32", type: "uint32" },
        ],
      },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "policyWasInherited", internalType: "bool", type: "bool" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "policyData", internalType: "bytes", type: "bytes" },
    ],
    name: "verifyMint",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "licenseId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "caller", internalType: "address", type: "address", indexed: true },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "DerivativeApproved",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  { type: "error", inputs: [], name: "LicensingModuleAware__CallerNotLicensingModule" },
  { type: "error", inputs: [], name: "PolicyFrameworkManager__GettingPolicyWrongFramework" },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__CommecialDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__CommecialDisabled_CantAddDerivRevShare",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__CommecialDisabled_CantAddRevShare",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__CommecialEnabled_RoyaltyPolicyRequired",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__CommercialDisabled_CantAddCommercializers",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__CommercialDisabled_CantAddRoyaltyPolicy",
  },
  { type: "error", inputs: [], name: "UMLPolicyFrameworkManager__CommercialValueMismatch" },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__DerivativesDisabled_CantAddApproval",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__DerivativesDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__DerivativesDisabled_CantAddReciprocal",
  },
  {
    type: "error",
    inputs: [],
    name: "UMLPolicyFrameworkManager__DerivativesDisabled_CantAddRevShare",
  },
  { type: "error", inputs: [], name: "UMLPolicyFrameworkManager__DerivativesValueMismatch" },
  { type: "error", inputs: [], name: "UMLPolicyFrameworkManager__ReciprocalButDifferentPolicyIds" },
  { type: "error", inputs: [], name: "UMLPolicyFrameworkManager__ReciprocalValueMismatch" },
  { type: "error", inputs: [], name: "UMLPolicyFrameworkManager__RightsNotFound" },
  { type: "error", inputs: [], name: "UMLPolicyFrameworkManager__StringArrayMismatch" },
] as const

export const umlPolicyFrameworkManagerAddress =
  "0x30A18EA9abca9ff72fB9ce33F4f060A44a09f515" as const

export const umlPolicyFrameworkManagerConfig = {
  address: umlPolicyFrameworkManagerAddress,
  abi: umlPolicyFrameworkManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__
 */
export const useReadUmlPolicyFrameworkManager = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"ACCESS_CONTROLLER"`
 */
export const useReadUmlPolicyFrameworkManagerAccessController = /*#__PURE__*/ createUseReadContract(
  {
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "ACCESS_CONTROLLER",
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadUmlPolicyFrameworkManagerIpAccountRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "IP_ACCOUNT_REGISTRY",
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"LICENSE_REGISTRY"`
 */
export const useReadUmlPolicyFrameworkManagerLicenseRegistry3 = /*#__PURE__*/ createUseReadContract(
  {
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "LICENSE_REGISTRY",
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"LICENSING_MODULE"`
 */
export const useReadUmlPolicyFrameworkManagerLicensingModule4 = /*#__PURE__*/ createUseReadContract(
  {
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "LICENSING_MODULE",
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"getAggregator"`
 */
export const useReadUmlPolicyFrameworkManagerGetAggregator = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "getAggregator",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"getCommercialRevenueShare"`
 */
export const useReadUmlPolicyFrameworkManagerGetCommercialRevenueShare =
  /*#__PURE__*/ createUseReadContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "getCommercialRevenueShare",
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"getPolicy"`
 */
export const useReadUmlPolicyFrameworkManagerGetPolicy = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "getPolicy",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"getPolicyId"`
 */
export const useReadUmlPolicyFrameworkManagerGetPolicyId = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "getPolicyId",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"getRoyaltyPolicy"`
 */
export const useReadUmlPolicyFrameworkManagerGetRoyaltyPolicy = /*#__PURE__*/ createUseReadContract(
  {
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "getRoyaltyPolicy",
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"isDerivativeApproved"`
 */
export const useReadUmlPolicyFrameworkManagerIsDerivativeApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "isDerivativeApproved",
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"isPolicyCommercial"`
 */
export const useReadUmlPolicyFrameworkManagerIsPolicyCommercial =
  /*#__PURE__*/ createUseReadContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "isPolicyCommercial",
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"licenseTextUrl"`
 */
export const useReadUmlPolicyFrameworkManagerLicenseTextUrl = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "licenseTextUrl",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"licensingModule"`
 */
export const useReadUmlPolicyFrameworkManagerLicensingModule5 = /*#__PURE__*/ createUseReadContract(
  {
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "licensingModule",
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"name"`
 */
export const useReadUmlPolicyFrameworkManagerName = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "name",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"policyToJson"`
 */
export const useReadUmlPolicyFrameworkManagerPolicyToJson = /*#__PURE__*/ createUseReadContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "policyToJson",
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"processInheritedPolicies"`
 */
export const useReadUmlPolicyFrameworkManagerProcessInheritedPolicies =
  /*#__PURE__*/ createUseReadContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "processInheritedPolicies",
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadUmlPolicyFrameworkManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "supportsInterface",
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__
 */
export const useWriteUmlPolicyFrameworkManager = /*#__PURE__*/ createUseWriteContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"registerPolicy"`
 */
export const useWriteUmlPolicyFrameworkManagerRegisterPolicy = /*#__PURE__*/ createUseWriteContract(
  {
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "registerPolicy",
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"setApproval"`
 */
export const useWriteUmlPolicyFrameworkManagerSetApproval = /*#__PURE__*/ createUseWriteContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "setApproval",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyLink"`
 */
export const useWriteUmlPolicyFrameworkManagerVerifyLink = /*#__PURE__*/ createUseWriteContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "verifyLink",
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyMint"`
 */
export const useWriteUmlPolicyFrameworkManagerVerifyMint = /*#__PURE__*/ createUseWriteContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
  functionName: "verifyMint",
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__
 */
export const useSimulateUmlPolicyFrameworkManager = /*#__PURE__*/ createUseSimulateContract({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"registerPolicy"`
 */
export const useSimulateUmlPolicyFrameworkManagerRegisterPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "registerPolicy",
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"setApproval"`
 */
export const useSimulateUmlPolicyFrameworkManagerSetApproval =
  /*#__PURE__*/ createUseSimulateContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "setApproval",
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyLink"`
 */
export const useSimulateUmlPolicyFrameworkManagerVerifyLink =
  /*#__PURE__*/ createUseSimulateContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "verifyLink",
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyMint"`
 */
export const useSimulateUmlPolicyFrameworkManagerVerifyMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    functionName: "verifyMint",
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__
 */
export const useWatchUmlPolicyFrameworkManager = /*#__PURE__*/ createUseWatchContractEvent({
  abi: umlPolicyFrameworkManagerAbi,
  address: umlPolicyFrameworkManagerAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link umlPolicyFrameworkManagerAbi}__ and `eventName` set to `"DerivativeApproved"`
 */
export const useWatchUmlPolicyFrameworkManagerDerivativeApproved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: umlPolicyFrameworkManagerAbi,
    address: umlPolicyFrameworkManagerAddress,
    eventName: "DerivativeApproved",
  })
