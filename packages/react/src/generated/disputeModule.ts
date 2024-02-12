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
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_controller', internalType: 'address', type: 'address' },
      { name: '_assetRegistry', internalType: 'address', type: 'address' },
      { name: '_governance', internalType: 'address', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ACCESS_CONTROLLER',
    outputs: [
      { name: '', internalType: 'contract IAccessController', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'IN_DISPUTE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'IP_ASSET_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IPAssetRegistry', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'arbitrationPolicies',
    outputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'baseArbitrationPolicy',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_disputeId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'cancelDispute',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'disputeId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getGovernance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'governance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'isWhitelistedArbitrationPolicy',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'arbitrationPolicy', internalType: 'address', type: 'address' },
      { name: 'arbitrationRelayer', internalType: 'address', type: 'address' },
    ],
    name: 'isWhitelistedArbitrationRelayer',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tag', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isWhitelistedDisputeTag',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_targetIpId', internalType: 'address', type: 'address' },
      {
        name: '_linkToDisputeEvidence',
        internalType: 'string',
        type: 'string',
      },
      { name: '_targetTag', internalType: 'bytes32', type: 'bytes32' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'raiseDispute',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_disputeId', internalType: 'uint256', type: 'uint256' }],
    name: 'resolveDispute',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_ipId', internalType: 'address', type: 'address' },
      { name: '_arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'setArbitrationPolicy',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_arbitrationPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'setBaseArbitrationPolicy',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_disputeId', internalType: 'uint256', type: 'uint256' },
      { name: '_decision', internalType: 'bool', type: 'bool' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setDisputeJudgement',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newGovernance', internalType: 'address', type: 'address' },
    ],
    name: 'setGovernance',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_arbitrationPolicy', internalType: 'address', type: 'address' },
      { name: '_allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistArbitrationPolicy',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_arbitrationPolicy', internalType: 'address', type: 'address' },
      { name: '_arbPolicyRelayer', internalType: 'address', type: 'address' },
      { name: '_allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistArbitrationRelayer',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'bytes32', type: 'bytes32' },
      { name: '_allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistDisputeTag',
    outputs: [],
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
  '0x68341Ae6e5225100D1900fE27EeDe118b0d2f473' as const

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
export const useReadDisputeModuleAccessController =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'ACCESS_CONTROLLER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"IN_DISPUTE"`
 */
export const useReadDisputeModuleInDispute =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'IN_DISPUTE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"IP_ACCOUNT_REGISTRY"`
 */
export const useReadDisputeModuleIpAccountRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'IP_ACCOUNT_REGISTRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"IP_ASSET_REGISTRY"`
 */
export const useReadDisputeModuleIpAssetRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'IP_ASSET_REGISTRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"arbitrationPolicies"`
 */
export const useReadDisputeModuleArbitrationPolicies =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'arbitrationPolicies',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"baseArbitrationPolicy"`
 */
export const useReadDisputeModuleBaseArbitrationPolicy =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'baseArbitrationPolicy',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"disputeId"`
 */
export const useReadDisputeModuleDisputeId =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'disputeId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"disputes"`
 */
export const useReadDisputeModuleDisputes = /*#__PURE__*/ createUseReadContract(
  {
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'disputes',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"getGovernance"`
 */
export const useReadDisputeModuleGetGovernance =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'getGovernance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"governance"`
 */
export const useReadDisputeModuleGovernance =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'governance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isWhitelistedArbitrationPolicy"`
 */
export const useReadDisputeModuleIsWhitelistedArbitrationPolicy =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'isWhitelistedArbitrationPolicy',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isWhitelistedArbitrationRelayer"`
 */
export const useReadDisputeModuleIsWhitelistedArbitrationRelayer =
  /*#__PURE__*/ createUseReadContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'isWhitelistedArbitrationRelayer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"isWhitelistedDisputeTag"`
 */
export const useReadDisputeModuleIsWhitelistedDisputeTag =
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__
 */
export const useWriteDisputeModule = /*#__PURE__*/ createUseWriteContract({
  abi: disputeModuleAbi,
  address: disputeModuleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"cancelDispute"`
 */
export const useWriteDisputeModuleCancelDispute =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'cancelDispute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"raiseDispute"`
 */
export const useWriteDisputeModuleRaiseDispute =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'raiseDispute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"resolveDispute"`
 */
export const useWriteDisputeModuleResolveDispute =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'resolveDispute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setArbitrationPolicy"`
 */
export const useWriteDisputeModuleSetArbitrationPolicy =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setArbitrationPolicy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setBaseArbitrationPolicy"`
 */
export const useWriteDisputeModuleSetBaseArbitrationPolicy =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setBaseArbitrationPolicy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setDisputeJudgement"`
 */
export const useWriteDisputeModuleSetDisputeJudgement =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setDisputeJudgement',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useWriteDisputeModuleSetGovernance =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setGovernance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationPolicy"`
 */
export const useWriteDisputeModuleWhitelistArbitrationPolicy =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationPolicy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationRelayer"`
 */
export const useWriteDisputeModuleWhitelistArbitrationRelayer =
  /*#__PURE__*/ createUseWriteContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationRelayer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistDisputeTag"`
 */
export const useWriteDisputeModuleWhitelistDisputeTag =
  /*#__PURE__*/ createUseWriteContract({
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
export const useSimulateDisputeModuleCancelDispute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'cancelDispute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"raiseDispute"`
 */
export const useSimulateDisputeModuleRaiseDispute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'raiseDispute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"resolveDispute"`
 */
export const useSimulateDisputeModuleResolveDispute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'resolveDispute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setArbitrationPolicy"`
 */
export const useSimulateDisputeModuleSetArbitrationPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setArbitrationPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setBaseArbitrationPolicy"`
 */
export const useSimulateDisputeModuleSetBaseArbitrationPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setBaseArbitrationPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setDisputeJudgement"`
 */
export const useSimulateDisputeModuleSetDisputeJudgement =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setDisputeJudgement',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSimulateDisputeModuleSetGovernance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'setGovernance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationPolicy"`
 */
export const useSimulateDisputeModuleWhitelistArbitrationPolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationPolicy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistArbitrationRelayer"`
 */
export const useSimulateDisputeModuleWhitelistArbitrationRelayer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistArbitrationRelayer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link disputeModuleAbi}__ and `functionName` set to `"whitelistDisputeTag"`
 */
export const useSimulateDisputeModuleWhitelistDisputeTag =
  /*#__PURE__*/ createUseSimulateContract({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    functionName: 'whitelistDisputeTag',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__
 */
export const useWatchDisputeModuleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"ArbitrationPolicySet"`
 */
export const useWatchDisputeModuleArbitrationPolicySetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'ArbitrationPolicySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"ArbitrationPolicyWhitelistUpdated"`
 */
export const useWatchDisputeModuleArbitrationPolicyWhitelistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'ArbitrationPolicyWhitelistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"ArbitrationRelayerWhitelistUpdated"`
 */
export const useWatchDisputeModuleArbitrationRelayerWhitelistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'ArbitrationRelayerWhitelistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DefaultArbitrationPolicyUpdated"`
 */
export const useWatchDisputeModuleDefaultArbitrationPolicyUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DefaultArbitrationPolicyUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeCancelled"`
 */
export const useWatchDisputeModuleDisputeCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeJudgementSet"`
 */
export const useWatchDisputeModuleDisputeJudgementSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeJudgementSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeRaised"`
 */
export const useWatchDisputeModuleDisputeRaisedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeRaised',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"DisputeResolved"`
 */
export const useWatchDisputeModuleDisputeResolvedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'DisputeResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"GovernanceUpdated"`
 */
export const useWatchDisputeModuleGovernanceUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'GovernanceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link disputeModuleAbi}__ and `eventName` set to `"TagWhitelistUpdated"`
 */
export const useWatchDisputeModuleTagWhitelistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: disputeModuleAbi,
    address: disputeModuleAddress,
    eventName: 'TagWhitelistUpdated',
  })
