import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicensingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const licensingModuleAbi = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "registry", internalType: "address", type: "address" },
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
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract RoyaltyModule", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "polId", internalType: "uint256", type: "uint256" },
    ],
    name: "addPolicyToIp",
    outputs: [{ name: "indexOnIpId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "framework", internalType: "address", type: "address" },
      { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "getPolicyId",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyFramework", internalType: "address", type: "address" }],
    name: "isFrameworkRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isParent",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "isPolicyDefined",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "policyId", internalType: "uint256", type: "uint256" },
    ],
    name: "isPolicyIdSetForIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "policyId", internalType: "uint256", type: "uint256" },
    ],
    name: "isPolicyInherited",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "licenseRegistry",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "licenseIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "minRoyalty", internalType: "uint32", type: "uint32" },
    ],
    name: "linkIpToParents",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "policyId", internalType: "uint256", type: "uint256" },
      { name: "licensorIp", internalType: "address", type: "address" },
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
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "parentIpIds",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
    name: "policy",
    outputs: [
      {
        name: "pol",
        internalType: "struct Licensing.Policy",
        type: "tuple",
        components: [
          { name: "policyFramework", internalType: "address", type: "address" },
          { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "framework", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "policyAggregatorData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
  },
  {
    stateMutability: "view",
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
          { name: "policyFramework", internalType: "address", type: "address" },
          { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "policyIdForIpAtIndex",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "policyIdsForIp",
    outputs: [{ name: "policyIds", internalType: "uint256[]", type: "uint256[]" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "isLicenseTransferable", internalType: "bool", type: "bool" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "registerPolicy",
    outputs: [{ name: "policyId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "manager", internalType: "address", type: "address" }],
    name: "registerPolicyFrameworkManager",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "totalParentsForIpId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "totalPolicies",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "isInherited", internalType: "bool", type: "bool" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "totalPoliciesForIp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "caller", internalType: "address", type: "address", indexed: true },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "parentIpIds", internalType: "address[]", type: "address[]", indexed: false },
    ],
    name: "IpIdLinkedToParents",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "caller", internalType: "address", type: "address", indexed: true },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      { name: "policyId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "index", internalType: "uint256", type: "uint256", indexed: false },
      { name: "isInherited", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "PolicyAddedToIpId",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "framework", internalType: "address", type: "address", indexed: true },
      { name: "name", internalType: "string", type: "string", indexed: false },
      { name: "licenseTextUrl", internalType: "string", type: "string", indexed: false },
    ],
    name: "PolicyFrameworkRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "policyFrameworkManager", internalType: "address", type: "address", indexed: true },
      { name: "policyId", internalType: "uint256", type: "uint256", indexed: true },
      { name: "policy", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "PolicyRegistered",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  { type: "error", inputs: [], name: "LicensingModule__CallerNotLicensorAndPolicyNotSet" },
  { type: "error", inputs: [], name: "LicensingModule__DerivativeRevShareSumExceedsMaxRNFTSupply" },
  { type: "error", inputs: [], name: "LicensingModule__DerivativesCannotAddPolicy" },
  { type: "error", inputs: [], name: "LicensingModule__EmptyLicenseUrl" },
  { type: "error", inputs: [], name: "LicensingModule__FrameworkNotFound" },
  { type: "error", inputs: [], name: "LicensingModule__IncompatibleLicensorCommercialPolicy" },
  { type: "error", inputs: [], name: "LicensingModule__IncompatibleRoyaltyPolicyAddress" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__IncompatibleRoyaltyPolicyDerivativeRevShare",
  },
  { type: "error", inputs: [], name: "LicensingModule__InvalidPolicyFramework" },
  { type: "error", inputs: [], name: "LicensingModule__LicensorNotRegistered" },
  { type: "error", inputs: [], name: "LicensingModule__LinkParentParamFailed" },
  { type: "error", inputs: [], name: "LicensingModule__MintLicenseParamFailed" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__MismatchBetweenCommercialRevenueShareAndMinRoyalty",
  },
  { type: "error", inputs: [], name: "LicensingModule__MismatchBetweenRoyaltyPolicy" },
  { type: "error", inputs: [], name: "LicensingModule__NotLicensee" },
  { type: "error", inputs: [], name: "LicensingModule__ParentIdEqualThanChild" },
  { type: "error", inputs: [], name: "LicensingModule__PolicyAlreadySetForIpId" },
  { type: "error", inputs: [], name: "LicensingModule__PolicyNotFound" },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const licensingModuleAddress = {
  11155111: "0xF157fe3F5Bc001176FB86f486d11EE28F85979d9",
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModule = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"ACCESS_CONTROLLER"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleAccessController = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "ACCESS_CONTROLLER",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleIpAccountRegistry = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "IP_ACCOUNT_REGISTRY",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"LICENSE_REGISTRY"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleLicenseRegistry1 = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "LICENSE_REGISTRY",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"ROYALTY_MODULE"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleRoyaltyModule = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "ROYALTY_MODULE",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"getPolicyId"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleGetPolicyId = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "getPolicyId",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isFrameworkRegistered"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleIsFrameworkRegistered = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "isFrameworkRegistered",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isParent"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleIsParent = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "isParent",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isPolicyDefined"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleIsPolicyDefined = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "isPolicyDefined",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isPolicyIdSetForIp"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleIsPolicyIdSetForIp = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "isPolicyIdSetForIp",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isPolicyInherited"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleIsPolicyInherited = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "isPolicyInherited",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"licenseRegistry"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleLicenseRegistry2 = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "licenseRegistry",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleName = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"parentIpIds"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleParentIpIds = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "parentIpIds",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policy"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModulePolicy = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "policy",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyAggregatorData"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModulePolicyAggregatorData = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "policyAggregatorData",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyForIpAtIndex"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModulePolicyForIpAtIndex = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "policyForIpAtIndex",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyIdForIpAtIndex"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModulePolicyIdForIpAtIndex = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "policyIdForIpAtIndex",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyIdsForIp"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModulePolicyIdsForIp = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "policyIdsForIp",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyStatus"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModulePolicyStatus = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "policyStatus",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"totalParentsForIpId"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleTotalParentsForIpId = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "totalParentsForIpId",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"totalPolicies"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleTotalPolicies = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "totalPolicies",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"totalPoliciesForIp"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useReadLicensingModuleTotalPoliciesForIp = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "totalPoliciesForIp",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWriteLicensingModule = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"addPolicyToIp"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWriteLicensingModuleAddPolicyToIp = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "addPolicyToIp",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"linkIpToParents"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWriteLicensingModuleLinkIpToParents = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "linkIpToParents",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"mintLicense"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWriteLicensingModuleMintLicense = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "mintLicense",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicy"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWriteLicensingModuleRegisterPolicy = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "registerPolicy",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicyFrameworkManager"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWriteLicensingModuleRegisterPolicyFrameworkManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: "registerPolicyFrameworkManager",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useSimulateLicensingModule = /*#__PURE__*/ createUseSimulateContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"addPolicyToIp"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useSimulateLicensingModuleAddPolicyToIp = /*#__PURE__*/ createUseSimulateContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "addPolicyToIp",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"linkIpToParents"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useSimulateLicensingModuleLinkIpToParents = /*#__PURE__*/ createUseSimulateContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "linkIpToParents",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"mintLicense"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useSimulateLicensingModuleMintLicense = /*#__PURE__*/ createUseSimulateContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "mintLicense",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicy"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useSimulateLicensingModuleRegisterPolicy = /*#__PURE__*/ createUseSimulateContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: "registerPolicy",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicyFrameworkManager"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useSimulateLicensingModuleRegisterPolicyFrameworkManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: "registerPolicyFrameworkManager",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWatchLicensingModule = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"IpIdLinkedToParents"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWatchLicensingModuleIpIdLinkedToParents = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: licensingModuleAbi, address: licensingModuleAddress, eventName: "IpIdLinkedToParents" },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"PolicyAddedToIpId"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWatchLicensingModulePolicyAddedToIpId = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  eventName: "PolicyAddedToIpId",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"PolicyFrameworkRegistered"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWatchLicensingModulePolicyFrameworkRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    eventName: "PolicyFrameworkRegistered",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"PolicyRegistered"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF157fe3F5Bc001176FB86f486d11EE28F85979d9)
 */
export const useWatchLicensingModulePolicyRegistered = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  eventName: "PolicyRegistered",
});
