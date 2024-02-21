import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const disputeModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_controller', internalType: 'address', type: 'address' },
      { name: '_assetRegistry', internalType: 'address', type: 'address' },
      { name: '_governance', internalType: 'address', type: 'address' },
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
    name: 'IN_DISPUTE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
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
    name: 'IP_ASSET_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IIPAssetRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'arbitrationPolicies',
    outputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseArbitrationPolicy',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'disputeId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'cancelDispute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disputeCounter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'disputeId', internalType: 'uint256', type: 'uint256' }],
    name: 'disputes',
    outputs: [
      { name: 'targetIpId', internalType: 'address', type: 'address' },
      { name: 'disputeInitiator', internalType: 'address', type: 'address' },
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
      {
        name: 'linkToDisputeEvidence',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      { name: 'targetTag', internalType: 'bytes32', type: 'bytes32' },
      { name: 'currentTag', internalType: 'bytes32', type: 'bytes32' },
    ],
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
    inputs: [],
    name: 'governance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'isIpTagged',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'isWhitelistedArbitrationPolicy',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
      { name: 'arbitrationRelayer', internalType: 'address', type: 'address' },
    ],
    name: 'isWhitelistedArbitrationRelayer',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tag', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isWhitelistedDisputeTag',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
    inputs: [
      { name: 'targetIpId', internalType: 'address', type: 'address' },
      { name: 'linkToDisputeEvidence', internalType: 'string', type: 'string' },
      { name: 'targetTag', internalType: 'bytes32', type: 'bytes32' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'raiseDispute',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'disputeId', internalType: 'uint256', type: 'uint256' }],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'setArbitrationPolicy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'setBaseArbitrationPolicy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'disputeId', internalType: 'uint256', type: 'uint256' },
      { name: 'decision', internalType: 'bool', type: 'bool' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setDisputeJudgement',
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
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistArbitrationPolicy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
      { name: 'arbPolicyRelayer', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistArbitrationRelayer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tag', internalType: 'bytes32', type: 'bytes32' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistDisputeTag',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ipId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'arbitrationPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ArbitrationPolicySet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'arbitrationPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ArbitrationPolicyWhitelistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'arbitrationPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'arbitrationRelayer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ArbitrationRelayerWhitelistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'arbitrationPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DefaultArbitrationPolicyUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'disputeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'DisputeCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'disputeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'decision', internalType: 'bool', type: 'bool', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'DisputeJudgementSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'disputeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'targetIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'disputeInitiator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'arbitrationPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'linkToDisputeEvidence',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'targetTag',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'DisputeRaised',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'disputeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DisputeResolved',
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
      { name: 'tag', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'TagWhitelistUpdated',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipAccount', internalType: 'address', type: 'address' }],
    name: 'AccessControlled__NotIpAccount',
  },
  { type: 'error', inputs: [], name: 'AccessControlled__ZeroAddress' },
  { type: 'error', inputs: [], name: 'DisputeModule__NotAbleToResolve' },
  { type: 'error', inputs: [], name: 'DisputeModule__NotDisputeInitiator' },
  { type: 'error', inputs: [], name: 'DisputeModule__NotInDisputeState' },
  { type: 'error', inputs: [], name: 'DisputeModule__NotRegisteredIpId' },
  {
    type: 'error',
    inputs: [],
    name: 'DisputeModule__NotWhitelistedArbitrationPolicy',
  },
  {
    type: 'error',
    inputs: [],
    name: 'DisputeModule__NotWhitelistedArbitrationRelayer',
  },
  {
    type: 'error',
    inputs: [],
    name: 'DisputeModule__NotWhitelistedDisputeTag',
  },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroArbitrationPolicy' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroArbitrationRelayer' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroDisputeTag' },
  {
    type: 'error',
    inputs: [],
    name: 'DisputeModule__ZeroLinkToDisputeEvidence',
  },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
] as const

export const disputeModuleAddress =
  '0x657b9b514B1AaCEaB8BfB9E29Db8ECBdA5C2fdfe' as const

export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__
 */
export const useReadDisputeModule = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"ACCESS_CONTROLLER"`
 */
export const useReadDisputeModuleAccessController4 =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'ACCESS_CONTROLLER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"IN_DISPUTE"`
 */
export const useReadInDispute = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'IN_DISPUTE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadDisputeModuleIpAccountRegistry5 =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'IP_ACCOUNT_REGISTRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"IP_ASSET_REGISTRY"`
 */
export const useReadDisputeModuleIpAssetRegistry6 =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'IP_ASSET_REGISTRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"arbitrationPolicies"`
 */
export const useReadArbitrationPolicies = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'arbitrationPolicies',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"baseArbitrationPolicy"`
 */
export const useReadBaseArbitrationPolicy = /*#__PURE__*/ createUseReadContract(
  {
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'baseArbitrationPolicy',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"disputeCounter"`
 */
export const useReadDisputeCounter = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'disputeCounter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"disputes"`
 */
export const useReadDisputes = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'disputes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"getGovernance"`
 */
export const useReadGetGovernance = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'getGovernance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"governance"`
 */
export const useReadGovernance = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'governance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isIpTagged"`
 */
export const useReadIsIpTagged = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'isIpTagged',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isWhitelistedArbitrationPolicy"`
 */
export const useReadIsWhitelistedArbitrationPolicy =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'isWhitelistedArbitrationPolicy',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isWhitelistedArbitrationRelayer"`
 */
export const useReadIsWhitelistedArbitrationRelayer =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'isWhitelistedArbitrationRelayer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isWhitelistedDisputeTag"`
 */
export const useReadIsWhitelistedDisputeTag =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'isWhitelistedDisputeTag',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"name"`
 */
export const useReadDisputeModuleName = /*#__PURE__*/ createUseReadContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadDisputeModuleSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__
 */
export const useWriteDisputeModule = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"cancelDispute"`
 */
export const useCancelDispute = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'cancelDispute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"raiseDispute"`
 */
export const useRaiseDispute = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'raiseDispute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"resolveDispute"`
 */
export const useResolveDispute = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'resolveDispute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setArbitrationPolicy"`
 */
export const useSetArbitrationPolicy = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'setArbitrationPolicy',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setBaseArbitrationPolicy"`
 */
export const useSetBaseArbitrationPolicy = /*#__PURE__*/ createUseWriteContract(
  {
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setBaseArbitrationPolicy',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setDisputeJudgement"`
 */
export const useSetDisputeJudgement = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'setDisputeJudgement',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useWriteDisputeModuleSetGovernance7 =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setGovernance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationPolicy"`
 */
export const useWhitelistArbitrationPolicy =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationPolicy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationRelayer"`
 */
export const useWhitelistArbitrationRelayer =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationRelayer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistDisputeTag"`
 */
export const useWhitelistDisputeTag = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'whitelistDisputeTag',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__
 */
export const useSimulateDisputeModule = /*#__PURE__*/ createUseSimulateContract(
  { abi: disputeModuleAbi, address: disputeModuleAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"cancelDispute"`
 */
export const useSimulateCancelDispute = /*#__PURE__*/ createUseSimulateContract(
  {
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'cancelDispute',
  },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"raiseDispute"`
 */
export const useSimulateRaiseDispute = /*#__PURE__*/ createUseSimulateContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  functionName: 'raiseDispute',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"resolveDispute"`
 */
export const useSimulateResolveDispute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'resolveDispute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setArbitrationPolicy"`
 */
export const useSimulateSetArbitrationPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setArbitrationPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setBaseArbitrationPolicy"`
 */
export const useSimulateSetBaseArbitrationPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setBaseArbitrationPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setDisputeJudgement"`
 */
export const useSimulateSetDisputeJudgement =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setDisputeJudgement',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSimulateDisputeModuleSetGovernance8 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setGovernance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationPolicy"`
 */
export const useSimulateWhitelistArbitrationPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationRelayer"`
 */
export const useSimulateWhitelistArbitrationRelayer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationRelayer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistDisputeTag"`
 */
export const useSimulateWhitelistDisputeTag =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistDisputeTag',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__
 */
export const useWatchDisputeModule = /*#__PURE__*/ createUseWatchContractEvent({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"ArbitrationPolicySet"`
 */
export const useWatchArbitrationPolicySet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'ArbitrationPolicySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"ArbitrationPolicyWhitelistUpdated"`
 */
export const useWatchArbitrationPolicyWhitelistUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'ArbitrationPolicyWhitelistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"ArbitrationRelayerWhitelistUpdated"`
 */
export const useWatchArbitrationRelayerWhitelistUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'ArbitrationRelayerWhitelistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DefaultArbitrationPolicyUpdated"`
 */
export const useWatchDefaultArbitrationPolicyUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DefaultArbitrationPolicyUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeCancelled"`
 */
export const useWatchDisputeCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeJudgementSet"`
 */
export const useWatchDisputeJudgementSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeJudgementSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeRaised"`
 */
export const useWatchDisputeRaised = /*#__PURE__*/ createUseWatchContractEvent({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
  eventName: 'DisputeRaised',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeResolved"`
 */
export const useWatchDisputeResolved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"GovernanceUpdated"`
 */
export const useWatchGovernanceUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'GovernanceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"TagWhitelistUpdated"`
 */
export const useWatchTagWhitelistUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'TagWhitelistUpdated',
  })
