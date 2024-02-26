import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicensingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const licensingModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'royaltyModule', internalType: 'address', type: 'address' },
      { name: 'registry', internalType: 'address', type: 'address' },
      { name: 'disputeModule', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ACCESS_CONTROLLER',
    outputs: [
      { name: '', internalType: 'contract IAccessController', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DISPUTE_MODULE',
    outputs: [
      { name: '', internalType: 'contract IDisputeModule', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IP_ACCOUNT_REGISTRY',
    outputs: [
      {
        name: '',
        internalType: 'contract IIPAccountRegistry',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LICENSE_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract ILicenseRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ROYALTY_MODULE',
    outputs: [
      { name: '', internalType: 'contract RoyaltyModule', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'polId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addPolicyToIp',
    outputs: [
      { name: 'indexOnIpId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pol',
        internalType: 'struct Licensing.Policy',
        type: 'tuple',
        components: [
          { name: 'isLicenseTransferable', internalType: 'bool', type: 'bool' },
          { name: 'policyFramework', internalType: 'address', type: 'address' },
          { name: 'frameworkData', internalType: 'bytes', type: 'bytes' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'royaltyData', internalType: 'bytes', type: 'bytes' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
        ],
      },
    ],
    name: 'getPolicyId',
    outputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyFramework', internalType: 'address', type: 'address' },
    ],
    name: 'isFrameworkRegistered',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
    ],
    name: 'isParent',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    name: 'isPolicyDefined',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isInherited', internalType: 'bool', type: 'bool' },
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isPolicyIdSetForIp',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isPolicyInherited',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'linkIpToParents',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mintLicense',
    outputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'parentIpIds',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    name: 'policy',
    outputs: [
      {
        name: 'pol',
        internalType: 'struct Licensing.Policy',
        type: 'tuple',
        components: [
          { name: 'isLicenseTransferable', internalType: 'bool', type: 'bool' },
          { name: 'policyFramework', internalType: 'address', type: 'address' },
          { name: 'frameworkData', internalType: 'bytes', type: 'bytes' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'royaltyData', internalType: 'bytes', type: 'bytes' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'framework', internalType: 'address', type: 'address' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'policyAggregatorData',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isInherited', internalType: 'bool', type: 'bool' },
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'policyForIpAtIndex',
    outputs: [
      {
        name: '',
        internalType: 'struct Licensing.Policy',
        type: 'tuple',
        components: [
          { name: 'isLicenseTransferable', internalType: 'bool', type: 'bool' },
          { name: 'policyFramework', internalType: 'address', type: 'address' },
          { name: 'frameworkData', internalType: 'bytes', type: 'bytes' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'royaltyData', internalType: 'bytes', type: 'bytes' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isInherited', internalType: 'bool', type: 'bool' },
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'policyIdForIpAtIndex',
    outputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isInherited', internalType: 'bool', type: 'bool' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'policyIdsForIp',
    outputs: [
      { name: 'policyIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'policyStatus',
    outputs: [
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'isInherited', internalType: 'bool', type: 'bool' },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pol',
        internalType: 'struct Licensing.Policy',
        type: 'tuple',
        components: [
          { name: 'isLicenseTransferable', internalType: 'bool', type: 'bool' },
          { name: 'policyFramework', internalType: 'address', type: 'address' },
          { name: 'frameworkData', internalType: 'bytes', type: 'bytes' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'royaltyData', internalType: 'bytes', type: 'bytes' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
        ],
      },
    ],
    name: 'registerPolicy',
    outputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'manager', internalType: 'address', type: 'address' }],
    name: 'registerPolicyFrameworkManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'totalParentsForIpId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalPolicies',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isInherited', internalType: 'bool', type: 'bool' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'totalPoliciesForIp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'parentIpIds',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'IpIdLinkedToParents',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'policyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'isInherited',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'PolicyAddedToIpId',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'framework',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'licenseTextUrl',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'PolicyFrameworkRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'policyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'policyFrameworkManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'frameworkData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
      {
        name: 'royaltyPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'royaltyData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
      {
        name: 'mintingFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'mintingFeeToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'PolicyRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipAccount', internalType: 'address', type: 'address' }],
    name: 'AccessControlled__NotIpAccount',
  },
  { type: 'error', inputs: [], name: 'AccessControlled__ZeroAddress' },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__CallerNotLicensorAndPolicyNotSet',
  },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__DerivativesCannotAddPolicy',
  },
  { type: 'error', inputs: [], name: 'LicensingModule__DisputedIpId' },
  { type: 'error', inputs: [], name: 'LicensingModule__EmptyLicenseUrl' },
  { type: 'error', inputs: [], name: 'LicensingModule__FrameworkNotFound' },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__IncompatibleLicensorCommercialPolicy',
  },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__InvalidPolicyFramework',
  },
  { type: 'error', inputs: [], name: 'LicensingModule__LicensorNotRegistered' },
  { type: 'error', inputs: [], name: 'LicensingModule__LinkParentParamFailed' },
  { type: 'error', inputs: [], name: 'LicensingModule__LinkingRevokedLicense' },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__MintLicenseParamFailed',
  },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__MintingFeeTokenNotWhitelisted',
  },
  { type: 'error', inputs: [], name: 'LicensingModule__NotLicensee' },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__ParentIdEqualThanChild',
  },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__PolicyAlreadySetForIpId',
  },
  { type: 'error', inputs: [], name: 'LicensingModule__PolicyNotFound' },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__RegisterPolicyFrameworkMismatch',
  },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__RoyaltyPolicyNotWhitelisted',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

export const licensingModuleAddress =
  '0x9CDDD88Dd34429a0F39eaDf91a56D1bf0533E72B' as const

export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__
 */
export const useReadLicensingModule = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"ACCESS_CONTROLLER"`
 */
export const useReadAccessController = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'ACCESS_CONTROLLER',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"DISPUTE_MODULE"`
 */
export const useReadLicensingModuleDisputeModule1 =
  /*#__PURE__*/ createUseReadContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'DISPUTE_MODULE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadIpAccountRegistry = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'IP_ACCOUNT_REGISTRY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"LICENSE_REGISTRY"`
 */
export const useReadLicensingModuleLicenseRegistry2 =
  /*#__PURE__*/ createUseReadContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'LICENSE_REGISTRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"ROYALTY_MODULE"`
 */
export const useReadRoyaltyModule = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'ROYALTY_MODULE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"getPolicyId"`
 */
export const useReadGetPolicyId = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'getPolicyId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isFrameworkRegistered"`
 */
export const useReadIsFrameworkRegistered = /*#__PURE__*/ createUseReadContract(
  {
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'isFrameworkRegistered',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isParent"`
 */
export const useReadIsParent = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'isParent',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isPolicyDefined"`
 */
export const useReadIsPolicyDefined = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'isPolicyDefined',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isPolicyIdSetForIp"`
 */
export const useReadIsPolicyIdSetForIp = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'isPolicyIdSetForIp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"isPolicyInherited"`
 */
export const useReadIsPolicyInherited = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'isPolicyInherited',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"name"`
 */
export const useReadLicensingModuleName = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"parentIpIds"`
 */
export const useReadParentIpIds = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'parentIpIds',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policy"`
 */
export const useReadPolicy = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'policy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyAggregatorData"`
 */
export const useReadPolicyAggregatorData = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'policyAggregatorData',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyForIpAtIndex"`
 */
export const useReadPolicyForIpAtIndex = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'policyForIpAtIndex',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyIdForIpAtIndex"`
 */
export const useReadPolicyIdForIpAtIndex = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'policyIdForIpAtIndex',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyIdsForIp"`
 */
export const useReadPolicyIdsForIp = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'policyIdsForIp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"policyStatus"`
 */
export const useReadPolicyStatus = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'policyStatus',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLicensingModuleSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"totalParentsForIpId"`
 */
export const useReadTotalParentsForIpId = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'totalParentsForIpId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"totalPolicies"`
 */
export const useReadTotalPolicies = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'totalPolicies',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"totalPoliciesForIp"`
 */
export const useReadTotalPoliciesForIp = /*#__PURE__*/ createUseReadContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'totalPoliciesForIp',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__
 */
export const useWriteLicensingModule = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"addPolicyToIp"`
 */
export const useAddPolicyToIp = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'addPolicyToIp',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"linkIpToParents"`
 */
export const useLinkIpToParents = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'linkIpToParents',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"mintLicense"`
 */
export const useMintLicense = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'mintLicense',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicy"`
 */
export const useRegisterPolicy = /*#__PURE__*/ createUseWriteContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'registerPolicy',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicyFrameworkManager"`
 */
export const useRegisterPolicyFrameworkManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'registerPolicyFrameworkManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__
 */
export const useSimulateLicensingModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"addPolicyToIp"`
 */
export const useSimulateAddPolicyToIp = /*#__PURE__*/ createUseSimulateContract(
  {
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'addPolicyToIp',
  },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"linkIpToParents"`
 */
export const useSimulateLinkIpToParents =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'linkIpToParents',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"mintLicense"`
 */
export const useSimulateMintLicense = /*#__PURE__*/ createUseSimulateContract({
  abi: licensingModuleAbi,
  address: licensingModuleAddress,
  functionName: 'mintLicense',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicy"`
 */
export const useSimulateRegisterPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'registerPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licensingModuleAbi}__ and `functionName` set to `"registerPolicyFrameworkManager"`
 */
export const useSimulateRegisterPolicyFrameworkManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    functionName: 'registerPolicyFrameworkManager',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__
 */
export const useWatchLicensingModule =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"IpIdLinkedToParents"`
 */
export const useWatchIpIdLinkedToParents =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    eventName: 'IpIdLinkedToParents',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"PolicyAddedToIpId"`
 */
export const useWatchPolicyAddedToIpId =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    eventName: 'PolicyAddedToIpId',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"PolicyFrameworkRegistered"`
 */
export const useWatchPolicyFrameworkRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    eventName: 'PolicyFrameworkRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licensingModuleAbi}__ and `eventName` set to `"PolicyRegistered"`
 */
export const useWatchPolicyRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licensingModuleAbi,
    address: licensingModuleAddress,
    eventName: 'PolicyRegistered',
  })
