import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PILPolicyFrameworkManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pilPolicyFrameworkManagerAbi = [
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
        internalType: "struct PILAggregator",
        type: "tuple",
        components: [
          { name: "commercial", internalType: "bool", type: "bool" },
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
          { name: "commercializerChecker", internalType: "address", type: "address" },
          { name: "commercializerCheckerData", internalType: "bytes", type: "bytes" },
          { name: "commercialRevShare", internalType: "uint32", type: "uint32" },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          { name: "derivativesAttribution", internalType: "bool", type: "bool" },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          { name: "territories", internalType: "string[]", type: "string[]" },
          { name: "distributionChannels", internalType: "string[]", type: "string[]" },
          { name: "contentRestrictions", internalType: "string[]", type: "string[]" },
        ],
      },
    ],
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
    inputs: [],
    name: "licenseTextUrl",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "pure",
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
              { name: "commercialAttribution", internalType: "bool", type: "bool" },
              { name: "commercializerChecker", internalType: "address", type: "address" },
              { name: "commercializerCheckerData", internalType: "bytes", type: "bytes" },
              { name: "commercialRevShare", internalType: "uint32", type: "uint32" },
              { name: "derivativesAllowed", internalType: "bool", type: "bool" },
              { name: "derivativesAttribution", internalType: "bool", type: "bool" },
              { name: "derivativesApproval", internalType: "bool", type: "bool" },
              { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
              { name: "territories", internalType: "string[]", type: "string[]" },
              { name: "distributionChannels", internalType: "string[]", type: "string[]" },
              { name: "contentRestrictions", internalType: "string[]", type: "string[]" },
            ],
          },
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
      { name: "caller", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "policyData", internalType: "bytes", type: "bytes" },
    ],
    name: "verifyLink",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "mintingFromADerivative", internalType: "bool", type: "bool" },
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "mintAmount", internalType: "uint256", type: "uint256" },
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
  { type: "error", inputs: [], name: "PILPolicyFrameworkManager__CommercialValueMismatch" },
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
  { type: "error", inputs: [], name: "PILPolicyFrameworkManager__ReciprocalButDifferentPolicyIds" },
  { type: "error", inputs: [], name: "PILPolicyFrameworkManager__ReciprocalValueMismatch" },
  { type: "error", inputs: [], name: "PILPolicyFrameworkManager__RightsNotFound" },
  { type: "error", inputs: [], name: "PILPolicyFrameworkManager__StringArrayMismatch" },
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
] as const;

export const pilPolicyFrameworkManagerAddress =
  "0x49cF5C5523011F8B4A0489969096Eb68C571C197" as const;

export const pilPolicyFrameworkManagerConfig = {
  address: pilPolicyFrameworkManagerAddress,
  abi: pilPolicyFrameworkManagerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__
 */
export const useReadPilPolicyFrameworkManager = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"ACCESS_CONTROLLER"`
 */
export const useReadPilPolicyFrameworkManagerAccessController = /*#__PURE__*/ createUseReadContract(
  {
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "ACCESS_CONTROLLER",
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadPilPolicyFrameworkManagerIpAccountRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "IP_ACCOUNT_REGISTRY",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"LICENSE_REGISTRY"`
 */
export const useReadPilPolicyFrameworkManagerLicenseRegistry = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "LICENSE_REGISTRY",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"LICENSING_MODULE"`
 */
export const useReadPilPolicyFrameworkManagerLicensingModule6 = /*#__PURE__*/ createUseReadContract(
  {
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "LICENSING_MODULE",
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"getAggregator"`
 */
export const useReadPilPolicyFrameworkManagerGetAggregator = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "getAggregator",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"getPILPolicy"`
 */
export const useReadPilPolicyFrameworkManagerGetPilPolicy = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "getPILPolicy",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"isDerivativeApproved"`
 */
export const useReadPilPolicyFrameworkManagerIsDerivativeApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "isDerivativeApproved",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"licenseTextUrl"`
 */
export const useReadPilPolicyFrameworkManagerLicenseTextUrl = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "licenseTextUrl",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"name"`
 */
export const useReadPilPolicyFrameworkManagerName = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"policyToJson"`
 */
export const useReadPilPolicyFrameworkManagerPolicyToJson = /*#__PURE__*/ createUseReadContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "policyToJson",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"processInheritedPolicies"`
 */
export const useReadPilPolicyFrameworkManagerProcessInheritedPolicies =
  /*#__PURE__*/ createUseReadContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "processInheritedPolicies",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadPilPolicyFrameworkManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "supportsInterface",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__
 */
export const useWritePilPolicyFrameworkManager = /*#__PURE__*/ createUseWriteContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"registerPolicy"`
 */
export const useWritePilPolicyFrameworkManagerRegisterPolicy = /*#__PURE__*/ createUseWriteContract(
  {
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "registerPolicy",
  },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"setApproval"`
 */
export const useSetApproval = /*#__PURE__*/ createUseWriteContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "setApproval",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyLink"`
 */
export const useVerifyLink = /*#__PURE__*/ createUseWriteContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "verifyLink",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyMint"`
 */
export const useVerifyMint = /*#__PURE__*/ createUseWriteContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
  functionName: "verifyMint",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__
 */
export const useSimulatePilPolicyFrameworkManager = /*#__PURE__*/ createUseSimulateContract({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"registerPolicy"`
 */
export const useSimulatePilPolicyFrameworkManagerRegisterPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "registerPolicy",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"setApproval"`
 */
export const useSimulatePilPolicyFrameworkManagerSetApproval =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "setApproval",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyLink"`
 */
export const useSimulatePilPolicyFrameworkManagerVerifyLink =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "verifyLink",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `functionName` set to `"verifyMint"`
 */
export const useSimulatePilPolicyFrameworkManagerVerifyMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    functionName: "verifyMint",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__
 */
export const useWatchPilPolicyFrameworkManager = /*#__PURE__*/ createUseWatchContractEvent({
  abi: pilPolicyFrameworkManagerAbi,
  address: pilPolicyFrameworkManagerAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pilPolicyFrameworkManagerAbi}__ and `eventName` set to `"DerivativeApproved"`
 */
export const useWatchPilPolicyFrameworkManagerDerivativeApproved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pilPolicyFrameworkManagerAbi,
    address: pilPolicyFrameworkManagerAddress,
    eventName: "DerivativeApproved",
  });
