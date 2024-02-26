import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accessControllerAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'governance', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IP_ACCOUNT_REGISTRY',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MODULE_REGISTRY',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccount', internalType: 'address', type: 'address' },
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'func', internalType: 'bytes4', type: 'bytes4' },
    ],
    name: 'checkPermission',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGovernance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccount', internalType: 'address', type: 'address' },
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'func', internalType: 'bytes4', type: 'bytes4' },
    ],
    name: 'getPermission',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'governance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'moduleRegistry', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'permissions',
        internalType: 'struct AccessPermission.Permission[]',
        type: 'tuple[]',
        components: [
          { name: 'ipAccount', internalType: 'address', type: 'address' },
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'to', internalType: 'address', type: 'address' },
          { name: 'func', internalType: 'bytes4', type: 'bytes4' },
          { name: 'permission', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'setBatchPermissions',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'func', internalType: 'bytes4', type: 'bytes4' },
      { name: 'permission', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'setGlobalPermission',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newGovernance', internalType: 'address', type: 'address' },
    ],
    name: 'setGovernance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccount', internalType: 'address', type: 'address' },
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'func', internalType: 'bytes4', type: 'bytes4' },
      { name: 'permission', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'setPermission',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newGovernance',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GovernanceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ipAccountOwner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'ipAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'signer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'func', internalType: 'bytes4', type: 'bytes4', indexed: false },
      {
        name: 'permission',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PermissionSet',
  },
  { type: 'error', inputs: [], name: 'AccessController__CallerIsNotIPAccount' },
  {
    type: 'error',
    inputs: [{ name: 'ipAccount', internalType: 'address', type: 'address' }],
    name: 'AccessController__IPAccountIsNotValid',
  },
  {
    type: 'error',
    inputs: [],
    name: 'AccessController__IPAccountIsZeroAddress',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipAccount', internalType: 'address', type: 'address' },
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'func', internalType: 'bytes4', type: 'bytes4' },
    ],
    name: 'AccessController__PermissionDenied',
  },
  { type: 'error', inputs: [], name: 'AccessController__PermissionIsNotValid' },
  {
    type: 'error',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'AccessController__RecipientIsNotRegisteredModule',
  },
  { type: 'error', inputs: [], name: 'AccessController__SignerIsZeroAddress' },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  { type: 'error', inputs: [], name: 'Governance__ProtocolPaused' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
] as const

export const accessControllerAddress =
  '0x8eB53745795E2107E3568c647A77a7294C89Ef31' as const

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
export const useReadIpAccountRegistry = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'IP_ACCOUNT_REGISTRY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"MODULE_REGISTRY"`
 */
export const useReadModuleRegistry = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'MODULE_REGISTRY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"checkPermission"`
 */
export const useReadCheckPermission = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'checkPermission',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"getGovernance"`
 */
export const useReadGetGovernance = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'getGovernance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"getPermission"`
 */
export const useReadGetPermission = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'getPermission',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"governance"`
 */
export const useReadGovernance = /*#__PURE__*/ createUseReadContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'governance',
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
export const useInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setBatchPermissions"`
 */
export const useSetBatchPermissions = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'setBatchPermissions',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGlobalPermission"`
 */
export const useSetGlobalPermission = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'setGlobalPermission',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSetGovernance = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'setGovernance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setPermission"`
 */
export const useSetPermission = /*#__PURE__*/ createUseWriteContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'setPermission',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__
 */
export const useSimulateAccessController =
  /*#__PURE__*/ createUseSimulateContract({
    abi: accessControllerAbi,
    address: accessControllerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setBatchPermissions"`
 */
export const useSimulateSetBatchPermissions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: accessControllerAbi,
    address: accessControllerAddress,
    functionName: 'setBatchPermissions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGlobalPermission"`
 */
export const useSimulateSetGlobalPermission =
  /*#__PURE__*/ createUseSimulateContract({
    abi: accessControllerAbi,
    address: accessControllerAddress,
    functionName: 'setGlobalPermission',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSimulateSetGovernance = /*#__PURE__*/ createUseSimulateContract(
  {
    abi: accessControllerAbi,
    address: accessControllerAddress,
    functionName: 'setGovernance',
  },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link accessControllerAbi}__ and `functionName` set to `"setPermission"`
 */
export const useSimulateSetPermission = /*#__PURE__*/ createUseSimulateContract(
  {
    abi: accessControllerAbi,
    address: accessControllerAddress,
    functionName: 'setPermission',
  },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link accessControllerAbi}__
 */
export const useWatchAccessController =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: accessControllerAbi,
    address: accessControllerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link accessControllerAbi}__ and `eventName` set to `"GovernanceUpdated"`
 */
export const useWatchGovernanceUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: accessControllerAbi,
    address: accessControllerAddress,
    eventName: 'GovernanceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link accessControllerAbi}__ and `eventName` set to `"PermissionSet"`
 */
export const useWatchPermissionSet = /*#__PURE__*/ createUseWatchContractEvent({
  abi: accessControllerAbi,
  address: accessControllerAddress,
  eventName: 'PermissionSet',
})
