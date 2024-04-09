import {
  encodeFunctionData,
  decodeEventLog,
  Address,
  PublicClient,
  WalletClient,
  WatchContractEventReturnType,
  WriteContractReturnType,
  TransactionReceipt,
  Hex,
} from 'viem'
import { AbiTypeToPrimitiveType, AbiParameterToPrimitiveType } from 'abitype'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accessControllerAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'AccessController__BothCallerAndRecipientAreNotRegisteredModule',
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
  { type: 'error', inputs: [], name: 'AccessController__SignerIsZeroAddress' },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  { type: 'error', inputs: [], name: 'Governance__ProtocolPaused' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
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
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
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
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    inputs: [{ name: 'governance', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'moduleRegistry', internalType: 'address', type: 'address' },
    ],
    name: 'setAddresses',
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
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

export const accessControllerAddress =
  '0x6fB5BA9A8747E897109044a1cd1192898AA384a9' as const

export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const disputeModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_controller', internalType: 'address', type: 'address' },
      { name: '_assetRegistry', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipAccount', internalType: 'address', type: 'address' }],
    name: 'AccessControlled__NotIpAccount',
  },
  { type: 'error', inputs: [], name: 'AccessControlled__ZeroAddress' },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
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
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
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
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
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
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
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
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'arbitrationPolicies',
    outputs: [{ name: 'policy', internalType: 'address', type: 'address' }],
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
    inputs: [{ name: '_governance', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
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
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
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
] as const

export const disputeModuleAddress =
  '0x837d095F9A11178545DF4114C44fb526dcf74168' as const

export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAccountImplAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'IPAccount__ExpiredSignature' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidAccessController' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidCalldata' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidSignature' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidSigner' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Executed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'deadline',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'signer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'signature',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'ExecutedWithSig',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accessController',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'addressData',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'boolData',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'bytes32Data',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'bytesData',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [{ name: 'result', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'executeWithSig',
    outputs: [{ name: 'result', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'key', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getBytes',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'namespace', internalType: 'bytes32', type: 'bytes32' },
      { name: 'key', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getBytes',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'namespace', internalType: 'bytes32', type: 'bytes32' },
      { name: 'key', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getBytes32',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'key', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getBytes32',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'isValidSigner',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'key', internalType: 'bytes32', type: 'bytes32' },
      { name: 'value', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setBytes',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'key', internalType: 'bytes32', type: 'bytes32' },
      { name: 'value', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setBytes32',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'state',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'stringData',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'token',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'uint256Data',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

export const ipAccountImplAddress =
  '0x6d1398e1ceE174a3e41d6eB50F00Fe43132f9C8A' as const

export const ipAccountImplConfig = {
  address: ipAccountImplAddress,
  abi: ipAccountImplAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAssetRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'erc6551Registry', internalType: 'address', type: 'address' },
      { name: 'ipAccountImpl', internalType: 'address', type: 'address' },
      { name: 'governance', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'IPAccountRegistry_InvalidIpAccountImpl' },
  { type: 'error', inputs: [], name: 'IPAssetRegistry__AlreadyRegistered' },
  {
    type: 'error',
    inputs: [
      { name: 'contractAddress', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'IPAssetRegistry__InvalidToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'contractAddress', internalType: 'address', type: 'address' },
    ],
    name: 'IPAssetRegistry__UnsupportedIERC721',
  },
  {
    type: 'error',
    inputs: [
      { name: 'contractAddress', internalType: 'address', type: 'address' },
    ],
    name: 'IPAssetRegistry__UnsupportedIERC721Metadata',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'chainId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tokenContract',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'IPAccountRegistered',
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
        name: 'chainId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tokenContract',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      { name: 'uri', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'registrationDate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'IPRegistered',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ERC6551_PUBLIC_REGISTRY',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IP_ACCOUNT_IMPL',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IP_ACCOUNT_SALT',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
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
    name: 'getIPAccountImpl',
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
    inputs: [
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ipAccount',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ipId',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'address', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'register',
    outputs: [{ name: 'id', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerIpAccount',
    outputs: [
      { name: 'ipAccountAddress', internalType: 'address', type: 'address' },
    ],
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
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

export const ipAssetRegistryAddress =
  '0x30C89bCB41277f09b18DF0375b9438909e193bf0' as const

export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IpRoyaltyVaultImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipRoyaltyVaultImplAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'royaltyPolicyLAP', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__AlreadyClaimed' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__ClaimerNotAnAncestor' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__NotRoyaltyPolicyLAP' },
  {
    type: 'error',
    inputs: [],
    name: 'IpRoyaltyVault__SnapshotIntervalTooShort',
  },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__ZeroIpId' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__ZeroRoyaltyPolicyLAP' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ancestorIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'royaltyTokensCollected',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RoyaltyTokensCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Snapshot',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'snapshotId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'snapshotTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'unclaimedTokens',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'SnapshotCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ROYALTY_POLICY_LAP',
    outputs: [
      { name: '', internalType: 'contract IRoyaltyPolicyLAP', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'addIpRoyaltyVaultTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'ancestorsVaultAmount',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'snapshotId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'balanceOfAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'snapshotIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'claimRevenueBySnapshotBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'snapshotId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokens', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'claimRevenueByTokenBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'claimVaultAmount',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'snapshotId', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'claimableAtSnapshot',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'snapshotId', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'claimableRevenue',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ancestorIpId', internalType: 'address', type: 'address' },
    ],
    name: 'collectRoyaltyTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVaultTokens',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'supply', internalType: 'uint32', type: 'uint32' },
      { name: 'unclaimedTokens', internalType: 'uint32', type: 'uint32' },
      { name: 'ipIdAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ipId',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'snapshotId', internalType: 'uint256', type: 'uint256' },
      { name: 'claimer', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'isClaimedAtSnapshot',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ancestorIpId', internalType: 'address', type: 'address' },
    ],
    name: 'isClaimedByAncestor',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastSnapshotTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'snapshot',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'snapshotId', internalType: 'uint256', type: 'uint256' }],
    name: 'totalSupplyAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'snapshotId', internalType: 'uint256', type: 'uint256' }],
    name: 'unclaimedAtSnapshot',
    outputs: [{ name: 'tokenAmount', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unclaimedRoyaltyTokens',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
] as const

export const ipRoyaltyVaultImplAddress =
  '0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12' as const

export const ipRoyaltyVaultImplConfig = {
  address: ipRoyaltyVaultImplAddress,
  abi: ipRoyaltyVaultImplAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const licenseRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'governance', internalType: 'address', type: 'address' },
      { name: 'url', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidApprover',
  },
  {
    type: 'error',
    inputs: [
      { name: 'idsLength', internalType: 'uint256', type: 'uint256' },
      { name: 'valuesLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InvalidArrayLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1155MissingApprovalForAll',
  },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  {
    type: 'error',
    inputs: [],
    name: 'LicenseRegistry__CallerNotLicensingModule',
  },
  { type: 'error', inputs: [], name: 'LicenseRegistry__NotTransferable' },
  { type: 'error', inputs: [], name: 'LicenseRegistry__RevokedLicense' },
  { type: 'error', inputs: [], name: 'LicenseRegistry__ZeroDisputeModule' },
  { type: 'error', inputs: [], name: 'LicenseRegistry__ZeroLicensingModule' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_fromTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_toTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BatchMetadataUpdate',
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
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'licenseId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'licenseData',
        internalType: 'struct Licensing.License',
        type: 'tuple',
        components: [
          { name: 'policyId', internalType: 'uint256', type: 'uint256' },
          { name: 'licensorIpId', internalType: 'address', type: 'address' },
          { name: 'transferable', internalType: 'bool', type: 'bool' },
        ],
        indexed: false,
      },
    ],
    name: 'LicenseMinted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'values',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'TransferBatch',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferSingle',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'value', internalType: 'string', type: 'string', indexed: false },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'URI',
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
    name: 'LICENSING_MODULE',
    outputs: [
      { name: '', internalType: 'contract ILicensingModule', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accounts', internalType: 'address[]', type: 'address[]' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'licenseIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'burnLicenses',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'imageUrl',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    name: 'isLicenseRevoked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseId', internalType: 'uint256', type: 'uint256' },
      { name: 'holder', internalType: 'address', type: 'address' },
    ],
    name: 'isLicensee',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    name: 'license',
    outputs: [
      {
        name: '',
        internalType: 'struct Licensing.License',
        type: 'tuple',
        components: [
          { name: 'policyId', internalType: 'uint256', type: 'uint256' },
          { name: 'licensorIpId', internalType: 'address', type: 'address' },
          { name: 'transferable', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    name: 'licensorIpId',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensorIpId_', internalType: 'address', type: 'address' },
      { name: 'transferable', internalType: 'bool', type: 'bool' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'mintLicense',
    outputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mintedLicenses',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    name: 'policyIdForLicense',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newDisputeModule', internalType: 'address', type: 'address' },
    ],
    name: 'setDisputeModule',
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
    inputs: [{ name: 'url', internalType: 'string', type: 'string' }],
    name: 'setLicensingImageUrl',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newLicensingModule', internalType: 'address', type: 'address' },
    ],
    name: 'setLicensingModule',
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
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

export const licenseRegistryAddress =
  '0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba' as const

export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const

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
  { type: 'error', inputs: [], name: 'LicensingModule__MintAmountZero' },
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
  { type: 'error', inputs: [], name: 'LicensingModule__ReceiverZeroAddress' },
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
] as const

export const licensingModuleAddress =
  '0x2A88056985814dcBb72aFA50B95893359B6262f5' as const

export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ModuleRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const moduleRegistryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'ModuleRegistry__InterfaceIdZero' },
  {
    type: 'error',
    inputs: [],
    name: 'ModuleRegistry__ModuleAddressNotContract',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ModuleRegistry__ModuleAddressZeroAddress',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ModuleRegistry__ModuleAlreadyRegistered',
  },
  { type: 'error', inputs: [], name: 'ModuleRegistry__ModuleNotRegistered' },
  {
    type: 'error',
    inputs: [],
    name: 'ModuleRegistry__ModuleNotSupportExpectedModuleTypeInterfaceId',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ModuleRegistry__ModuleTypeAlreadyRegistered',
  },
  { type: 'error', inputs: [], name: 'ModuleRegistry__ModuleTypeEmptyString' },
  {
    type: 'error',
    inputs: [],
    name: 'ModuleRegistry__ModuleTypeNotRegistered',
  },
  { type: 'error', inputs: [], name: 'ModuleRegistry__NameAlreadyRegistered' },
  { type: 'error', inputs: [], name: 'ModuleRegistry__NameDoesNotMatch' },
  { type: 'error', inputs: [], name: 'ModuleRegistry__NameEmptyString' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
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
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'moduleTypeInterfaceId',
        internalType: 'bytes4',
        type: 'bytes4',
        indexed: true,
      },
      {
        name: 'moduleType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ModuleAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ModuleRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    inputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    name: 'getModule',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'moduleAddress', internalType: 'address', type: 'address' },
    ],
    name: 'getModuleType',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'moduleType', internalType: 'string', type: 'string' }],
    name: 'getModuleTypeInterfaceId',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'governance_', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'moduleAddress', internalType: 'address', type: 'address' },
    ],
    name: 'isRegistered',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'moduleAddress', internalType: 'address', type: 'address' },
    ],
    name: 'registerModule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'moduleAddress', internalType: 'address', type: 'address' },
      { name: 'moduleType', internalType: 'string', type: 'string' },
    ],
    name: 'registerModule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' },
    ],
    name: 'registerModuleType',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    name: 'removeModule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    name: 'removeModuleType',
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
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

export const moduleRegistryAddress =
  '0xab0bf9846eCE1299AaA1cB3FF5EfbBA328968771' as const

export const moduleRegistryConfig = {
  address: moduleRegistryAddress,
  abi: moduleRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PILPolicyFrameworkManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pilPolicyFrameworkManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'licensing', internalType: 'address', type: 'address' },
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'licenseUrl_', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
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
    name: 'LicensingModuleAware__CallerNotLicensingModule',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialDisabled_CantAddAttribution',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialDisabled_CantAddCommercializers',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialDisabled_CantAddMintingFee',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialDisabled_CantAddMintingFeeToken',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialDisabled_CantAddRevShare',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialDisabled_CantAddRoyaltyPolicy',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialEnabled_RoyaltyPolicyRequired',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__CommercialValueMismatch',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__DerivativesDisabled_CantAddApproval',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__DerivativesDisabled_CantAddAttribution',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__DerivativesDisabled_CantAddReciprocal',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__ReciprocalButDifferentPolicyIds',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__ReciprocalValueMismatch',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__RightsNotFound',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILPolicyFrameworkManager__StringArrayMismatch',
  },
  {
    type: 'error',
    inputs: [
      { name: 'commercializer', internalType: 'address', type: 'address' },
    ],
    name: 'PolicyFrameworkManager__CommercializerCheckerDoesNotSupportHook',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'licenseId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'DerivativeApproved',
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
    name: 'LICENSING_MODULE',
    outputs: [
      { name: '', internalType: 'contract ILicensingModule', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'getAggregator',
    outputs: [
      {
        name: 'rights',
        internalType: 'struct PILAggregator',
        type: 'tuple',
        components: [
          { name: 'commercial', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          { name: 'lastPolicyId', internalType: 'uint256', type: 'uint256' },
          { name: 'territoriesAcc', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'distributionChannelsAcc',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'contentRestrictionsAcc',
            internalType: 'bytes32',
            type: 'bytes32',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPILPolicy',
    outputs: [
      {
        name: 'policy',
        internalType: 'struct PILPolicy',
        type: 'tuple',
        components: [
          { name: 'attribution', internalType: 'bool', type: 'bool' },
          { name: 'commercialUse', internalType: 'bool', type: 'bool' },
          { name: 'commercialAttribution', internalType: 'bool', type: 'bool' },
          {
            name: 'commercializerChecker',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'commercializerCheckerData',
            internalType: 'bytes',
            type: 'bytes',
          },
          {
            name: 'commercialRevShare',
            internalType: 'uint32',
            type: 'uint32',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          { name: 'territories', internalType: 'string[]', type: 'string[]' },
          {
            name: 'distributionChannels',
            internalType: 'string[]',
            type: 'string[]',
          },
          {
            name: 'contentRestrictions',
            internalType: 'string[]',
            type: 'string[]',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseId', internalType: 'uint256', type: 'uint256' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
    ],
    name: 'isDerivativeApproved',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'licenseTextUrl',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    inputs: [{ name: 'policyData', internalType: 'bytes', type: 'bytes' }],
    name: 'policyToJson',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'aggregator', internalType: 'bytes', type: 'bytes' },
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'policy', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'processInheritedPolicies',
    outputs: [
      { name: 'changedAgg', internalType: 'bool', type: 'bool' },
      { name: 'newAggregator', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct RegisterPILPolicyParams',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
          {
            name: 'policy',
            internalType: 'struct PILPolicy',
            type: 'tuple',
            components: [
              { name: 'attribution', internalType: 'bool', type: 'bool' },
              { name: 'commercialUse', internalType: 'bool', type: 'bool' },
              {
                name: 'commercialAttribution',
                internalType: 'bool',
                type: 'bool',
              },
              {
                name: 'commercializerChecker',
                internalType: 'address',
                type: 'address',
              },
              {
                name: 'commercializerCheckerData',
                internalType: 'bytes',
                type: 'bytes',
              },
              {
                name: 'commercialRevShare',
                internalType: 'uint32',
                type: 'uint32',
              },
              {
                name: 'derivativesAllowed',
                internalType: 'bool',
                type: 'bool',
              },
              {
                name: 'derivativesAttribution',
                internalType: 'bool',
                type: 'bool',
              },
              {
                name: 'derivativesApproval',
                internalType: 'bool',
                type: 'bool',
              },
              {
                name: 'derivativesReciprocal',
                internalType: 'bool',
                type: 'bool',
              },
              {
                name: 'territories',
                internalType: 'string[]',
                type: 'string[]',
              },
              {
                name: 'distributionChannels',
                internalType: 'string[]',
                type: 'string[]',
              },
              {
                name: 'contentRestrictions',
                internalType: 'string[]',
                type: 'string[]',
              },
            ],
          },
        ],
      },
    ],
    name: 'registerPolicy',
    outputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseId', internalType: 'uint256', type: 'uint256' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApproval',
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
      { name: 'licenseId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensee', internalType: 'address', type: 'address' },
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'policyData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'verifyLink',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licensee', internalType: 'address', type: 'address' },
      { name: 'mintingFromADerivative', internalType: 'bool', type: 'bool' },
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'mintAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'policyData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'verifyMint',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

export const pilPolicyFrameworkManagerAddress =
  '0xAc2C50Af31501370366D243FaeC56F89128f6d96' as const

export const pilPolicyFrameworkManagerConfig = {
  address: pilPolicyFrameworkManagerAddress,
  abi: pilPolicyFrameworkManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const royaltyModuleAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyModule__CanOnlyMintSelectedPolicy',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyModule__IncompatibleRoyaltyPolicy',
  },
  { type: 'error', inputs: [], name: 'RoyaltyModule__NoParentsOnLinking' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__NoRoyaltyPolicySet' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__NotAllowedCaller' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyModule__NotWhitelistedRoyaltyPolicy',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyModule__NotWhitelistedRoyaltyToken',
  },
  { type: 'error', inputs: [], name: 'RoyaltyModule__ZeroLicensingModule' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__ZeroRoyaltyPolicy' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__ZeroRoyaltyToken' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
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
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'receiverIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'payerAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LicenseMintingFeePaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'receiverIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'payerIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RoyaltyPaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'royaltyPolicy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'RoyaltyPolicyWhitelistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'RoyaltyTokenWhitelistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    inputs: [{ name: '_governance', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'isWhitelistedRoyaltyPolicy',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'isWhitelistedRoyaltyToken',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'licensingModule',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'licenseData', internalType: 'bytes', type: 'bytes' },
      { name: 'externalData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onLicenseMinting',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
      { name: 'licenseData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'externalData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onLinkToParents',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'receiverIpId', internalType: 'address', type: 'address' },
      { name: 'payerAddress', internalType: 'address', type: 'address' },
      {
        name: 'licenseRoyaltyPolicy',
        internalType: 'address',
        type: 'address',
      },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'payLicenseMintingFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'receiverIpId', internalType: 'address', type: 'address' },
      { name: 'payerIpId', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'payRoyaltyOnBehalf',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'royaltyPolicies',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    inputs: [{ name: 'licensing', internalType: 'address', type: 'address' }],
    name: 'setLicensingModule',
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
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistRoyaltyPolicy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelistRoyaltyToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const royaltyModuleAddress =
  '0xF77b0933F6aaC2dCE2eAa0d79f6Bfd6b9347a5E7' as const

export const royaltyModuleConfig = {
  address: royaltyModuleAddress,
  abi: royaltyModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyPolicyLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const royaltyPolicyLapAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'royaltyModule', internalType: 'address', type: 'address' },
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      { name: 'liquidSplitFactory', internalType: 'address', type: 'address' },
      { name: 'liquidSplitMain', internalType: 'address', type: 'address' },
      { name: 'governance', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'ERC1167FailedCreateClone' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__AboveAncestorsLimit' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__AboveParentLimit' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__AboveRoyaltyStackLimit',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__ImplementationAlreadySet',
  },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__InvalidAncestors' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__InvalidAncestorsHash' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__InvalidAncestorsLength',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__InvalidAncestorsRoyalty',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__InvalidParentRoyaltiesLength',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__InvalidRoyaltyAmountLength',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__LastPositionNotAbleToMintLicense',
  },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__NotFullOwnership' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__NotRoyaltyModule' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__TransferFailed' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__UnlinkableToParents' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__ZeroAncestorsVaultImpl',
  },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__ZeroLicensingModule' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__ZeroLiquidSplitFactory',
  },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__ZeroLiquidSplitMain' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__ZeroRoyaltyModule' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
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
        name: 'ipId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'splitClone',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'ancestorsVault',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'royaltyStack',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'targetAncestors',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'targetRoyaltyAmount',
        internalType: 'uint32[]',
        type: 'uint32[]',
        indexed: false,
      },
    ],
    name: 'PolicyInitialized',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANCESTORS_VAULT_IMPL',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LICENSING_MODULE',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LIQUID_SPLIT_FACTORY',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LIQUID_SPLIT_MAIN',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_ANCESTORS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_PARENTS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ROYALTY_MODULE',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TOTAL_RNFT_SUPPLY',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'claimerIpId', internalType: 'address', type: 'address' },
      { name: 'ancestors', internalType: 'address[]', type: 'address[]' },
      {
        name: 'ancestorsRoyalties',
        internalType: 'uint32[]',
        type: 'uint32[]',
      },
      { name: 'withdrawETH', internalType: 'bool', type: 'bool' },
      { name: 'tokens', internalType: 'contract ERC20[]', type: 'address[]' },
    ],
    name: 'claimFromAncestorsVault',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'withdrawETH', internalType: 'uint256', type: 'uint256' },
      { name: 'tokens', internalType: 'contract ERC20[]', type: 'address[]' },
    ],
    name: 'claimFromIpPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'withdrawETH', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'claimFromIpPoolAsTotalRnftOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'accounts', internalType: 'address[]', type: 'address[]' },
      { name: 'distributorAddress', internalType: 'address', type: 'address' },
    ],
    name: 'distributeIpPoolFunds',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseData', internalType: 'bytes', type: 'bytes' },
      { name: 'externalData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onLicenseMinting',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
      { name: 'licenseData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'externalData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onLinkToParents',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'onRoyaltyPayment',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'royaltyData',
    outputs: [
      { name: 'isUnlinkableToParents', internalType: 'bool', type: 'bool' },
      { name: 'splitClone', internalType: 'address', type: 'address' },
      { name: 'ancestorsVault', internalType: 'address', type: 'address' },
      { name: 'royaltyStack', internalType: 'uint32', type: 'uint32' },
      { name: 'ancestorsHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ancestorsVaultImpl', internalType: 'address', type: 'address' },
    ],
    name: 'setAncestorsVaultImplementation',
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
  { type: 'receive', stateMutability: 'payable' },
] as const

export const royaltyPolicyLapAddress =
  '0x265C21b34e0E92d63C678425478C42aa8D727B79' as const

export const royaltyPolicyLapConfig = {
  address: royaltyPolicyLapAddress,
  abi: royaltyPolicyLapAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Contract AccessController =============================================================

/**
 * AccessControllerPermissionSetEvent
 *
 * @param ipAccountOwner address
 * @param ipAccount address
 * @param signer address
 * @param to address
 * @param func bytes4
 * @param permission uint8
 */
export type AccessControllerPermissionSetEvent = {
  ipAccountOwner: Address
  ipAccount: Address
  signer: Address
  to: Address
  func: Hex
  permission: number
}

/**
 * AccessControllerSetPermissionRequest
 *
 * @param ipAccount address
 * @param signer address
 * @param to address
 * @param func bytes4
 * @param permission uint8
 */
export type AccessControllerSetPermissionRequest = {
  ipAccount: Address
  signer: Address
  to: Address
  func: Hex
  permission: number
}

/**
 * contract AccessController event
 */
export class AccessControllerEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x6fB5BA9A8747E897109044a1cd1192898AA384a9',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * event PermissionSet for contract AccessController
   */
  public watchPermissionSetEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<AccessControllerPermissionSetEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: accessControllerAbi,
      address: this.address,
      eventName: 'PermissionSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event PermissionSet for contract AccessController
   */
  public async parseTxPermissionSetEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<AccessControllerPermissionSetEvent>> {
    const targetLogs: Array<AccessControllerPermissionSetEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: accessControllerAbi,
            eventName: 'PermissionSet',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }
}

/**
 * contract AccessController write method
 */
export class AccessControllerClient extends AccessControllerEventClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x6fB5BA9A8747E897109044a1cd1192898AA384a9',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method setPermission for contract AccessController
   *
   * @param request AccessControllerSetPermissionRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setPermission(
    request: AccessControllerSetPermissionRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'setPermission',
      account: this.wallet.account,
      args: [
        request.ipAccount,
        request.signer,
        request.to,
        request.func,
        request.permission,
      ],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract AccessController permission less write method
 */
export class AccessControllerPermissionLessClient extends AccessControllerEventClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x6fB5BA9A8747E897109044a1cd1192898AA384a9',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * permission less method setPermission for contract AccessController
   *
   * @param request AccessControllerSetPermissionRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setPermission(
    request: AccessControllerSetPermissionRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: accessControllerAbi,
            functionName: 'setPermission',
            args: [
              request.ipAccount,
              request.signer,
              request.to,
              request.func,
              request.permission,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract DisputeModule =============================================================

/**
 * DisputeModuleDisputeCancelledEvent
 *
 * @param disputeId uint256
 * @param data bytes
 */
export type DisputeModuleDisputeCancelledEvent = {
  disputeId: bigint
  data: Hex
}

/**
 * DisputeModuleDisputeRaisedEvent
 *
 * @param disputeId uint256
 * @param targetIpId address
 * @param disputeInitiator address
 * @param arbitrationPolicy address
 * @param linkToDisputeEvidence bytes32
 * @param targetTag bytes32
 * @param data bytes
 */
export type DisputeModuleDisputeRaisedEvent = {
  disputeId: bigint
  targetIpId: Address
  disputeInitiator: Address
  arbitrationPolicy: Address
  linkToDisputeEvidence: Hex
  targetTag: Hex
  data: Hex
}

/**
 * DisputeModuleDisputeResolvedEvent
 *
 * @param disputeId uint256
 */
export type DisputeModuleDisputeResolvedEvent = {
  disputeId: bigint
}

/**
 * DisputeModuleCancelDisputeRequest
 *
 * @param disputeId uint256
 * @param data bytes
 */
export type DisputeModuleCancelDisputeRequest = {
  disputeId: bigint
  data: Hex
}

/**
 * DisputeModuleRaiseDisputeRequest
 *
 * @param targetIpId address
 * @param linkToDisputeEvidence string
 * @param targetTag bytes32
 * @param data bytes
 */
export type DisputeModuleRaiseDisputeRequest = {
  targetIpId: Address
  linkToDisputeEvidence: string
  targetTag: Hex
  data: Hex
}

/**
 * DisputeModuleResolveDisputeRequest
 *
 * @param disputeId uint256
 */
export type DisputeModuleResolveDisputeRequest = {
  disputeId: bigint
}

/**
 * contract DisputeModule event
 */
export class DisputeModuleEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x837d095F9A11178545DF4114C44fb526dcf74168',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * event DisputeCancelled for contract DisputeModule
   */
  public watchDisputeCancelledEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<DisputeModuleDisputeCancelledEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'DisputeCancelled',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event DisputeCancelled for contract DisputeModule
   */
  public async parseTxDisputeCancelledEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<DisputeModuleDisputeCancelledEvent>> {
    const targetLogs: Array<DisputeModuleDisputeCancelledEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: disputeModuleAbi,
            eventName: 'DisputeCancelled',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }

  /**
   * event DisputeRaised for contract DisputeModule
   */
  public watchDisputeRaisedEvent(
    onLogs: (txHash: Hex, ev: Partial<DisputeModuleDisputeRaisedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'DisputeRaised',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event DisputeRaised for contract DisputeModule
   */
  public async parseTxDisputeRaisedEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<DisputeModuleDisputeRaisedEvent>> {
    const targetLogs: Array<DisputeModuleDisputeRaisedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: disputeModuleAbi,
            eventName: 'DisputeRaised',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }

  /**
   * event DisputeResolved for contract DisputeModule
   */
  public watchDisputeResolvedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<DisputeModuleDisputeResolvedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'DisputeResolved',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event DisputeResolved for contract DisputeModule
   */
  public async parseTxDisputeResolvedEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<DisputeModuleDisputeResolvedEvent>> {
    const targetLogs: Array<DisputeModuleDisputeResolvedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: disputeModuleAbi,
            eventName: 'DisputeResolved',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }
}

/**
 * contract DisputeModule write method
 */
export class DisputeModuleClient extends DisputeModuleEventClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x837d095F9A11178545DF4114C44fb526dcf74168',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method cancelDispute for contract DisputeModule
   *
   * @param request DisputeModuleCancelDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async cancelDispute(
    request: DisputeModuleCancelDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'cancelDispute',
      account: this.wallet.account,
      args: [request.disputeId, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method raiseDispute for contract DisputeModule
   *
   * @param request DisputeModuleRaiseDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async raiseDispute(
    request: DisputeModuleRaiseDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'raiseDispute',
      account: this.wallet.account,
      args: [
        request.targetIpId,
        request.linkToDisputeEvidence,
        request.targetTag,
        request.data,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method resolveDispute for contract DisputeModule
   *
   * @param request DisputeModuleResolveDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async resolveDispute(
    request: DisputeModuleResolveDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'resolveDispute',
      account: this.wallet.account,
      args: [request.disputeId],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract DisputeModule permission less write method
 */
export class DisputeModulePermissionLessClient extends DisputeModuleEventClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x837d095F9A11178545DF4114C44fb526dcf74168',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * permission less method cancelDispute for contract DisputeModule
   *
   * @param request DisputeModuleCancelDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async cancelDispute(
    request: DisputeModuleCancelDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: disputeModuleAbi,
            functionName: 'cancelDispute',
            args: [request.disputeId, request.data],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method raiseDispute for contract DisputeModule
   *
   * @param request DisputeModuleRaiseDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async raiseDispute(
    request: DisputeModuleRaiseDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: disputeModuleAbi,
            functionName: 'raiseDispute',
            args: [
              request.targetIpId,
              request.linkToDisputeEvidence,
              request.targetTag,
              request.data,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method resolveDispute for contract DisputeModule
   *
   * @param request DisputeModuleResolveDisputeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async resolveDispute(
    request: DisputeModuleResolveDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: disputeModuleAbi,
            functionName: 'resolveDispute',
            args: [request.disputeId],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract IPAccountImpl =============================================================

/**
 * IpAccountImplExecuteRequest
 *
 * @param to address
 * @param value uint256
 * @param data bytes
 */
export type IpAccountImplExecuteRequest = {
  to: Address
  value: bigint
  data: Hex
}

/**
 * IpAccountImplExecuteWithSigRequest
 *
 * @param to address
 * @param value uint256
 * @param data bytes
 * @param signer address
 * @param deadline uint256
 * @param signature bytes
 */
export type IpAccountImplExecuteWithSigRequest = {
  to: Address
  value: bigint
  data: Hex
  signer: Address
  deadline: bigint
  signature: Hex
}

/**
 * contract IPAccountImpl write method
 */
export class IpAccountImplClient {
  protected readonly wallet: WalletClient
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x6d1398e1ceE174a3e41d6eB50F00Fe43132f9C8A',
  ) {
    this.address = address
    this.rpcClient = rpcClient
    this.wallet = wallet
  }

  /**
   * method execute for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteRequest
   * @return Promise<WriteContractReturnType>
   */
  public async execute(
    request: IpAccountImplExecuteRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'execute',
      account: this.wallet.account,
      args: [request.to, request.value, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method executeWithSig for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteWithSigRequest
   * @return Promise<WriteContractReturnType>
   */
  public async executeWithSig(
    request: IpAccountImplExecuteWithSigRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'executeWithSig',
      account: this.wallet.account,
      args: [
        request.to,
        request.value,
        request.data,
        request.signer,
        request.deadline,
        request.signature,
      ],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract IPAccountImpl permission less write method
 */
export class IpAccountImplPermissionLessClient {
  protected readonly wallet: WalletClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x6d1398e1ceE174a3e41d6eB50F00Fe43132f9C8A',
  ) {
    this.address = address
    this.wallet = wallet
  }

  /**
   * permission less method execute for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteRequest
   * @return Promise<WriteContractReturnType>
   */
  public async execute(
    request: IpAccountImplExecuteRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: ipAccountImplAbi,
            functionName: 'execute',
            args: [request.to, request.value, request.data],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method executeWithSig for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteWithSigRequest
   * @return Promise<WriteContractReturnType>
   */
  public async executeWithSig(
    request: IpAccountImplExecuteWithSigRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: ipAccountImplAbi,
            functionName: 'executeWithSig',
            args: [
              request.to,
              request.value,
              request.data,
              request.signer,
              request.deadline,
              request.signature,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract IPAssetRegistry =============================================================

/**
 * IpAssetRegistryIpRegisteredEvent
 *
 * @param ipId address
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 * @param name string
 * @param uri string
 * @param registrationDate uint256
 */
export type IpAssetRegistryIpRegisteredEvent = {
  ipId: Address
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
  name: string
  uri: string
  registrationDate: bigint
}

/**
 * IpAssetRegistryIpIdRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryIpIdRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
}

export type IpAssetRegistryIpIdResponse = Address

/**
 * IpAssetRegistryIsRegisteredRequest
 *
 * @param id address
 */
export type IpAssetRegistryIsRegisteredRequest = {
  id: Address
}

export type IpAssetRegistryIsRegisteredResponse = boolean

/**
 * IpAssetRegistryRegisterRequest
 *
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryRegisterRequest = {
  tokenContract: Address
  tokenId: bigint
}

/**
 * contract IPAssetRegistry event
 */
export class IpAssetRegistryEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x30C89bCB41277f09b18DF0375b9438909e193bf0',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * event IPRegistered for contract IPAssetRegistry
   */
  public watchIpRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<IpAssetRegistryIpRegisteredEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: 'IPRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event IPRegistered for contract IPAssetRegistry
   */
  public async parseTxIpRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<IpAssetRegistryIpRegisteredEvent>> {
    const targetLogs: Array<IpAssetRegistryIpRegisteredEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: ipAssetRegistryAbi,
            eventName: 'IPRegistered',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }
}

/**
 * contract IPAssetRegistry readonly method
 */
export class IpAssetRegistryReadOnlyClient extends IpAssetRegistryEventClient {
  constructor(
    rpcClient: PublicClient,
    address: Address = '0x30C89bCB41277f09b18DF0375b9438909e193bf0',
  ) {
    super(rpcClient, address)
  }

  /**
   * method ipId for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIpIdRequest
   * @return Promise<IpAssetRegistryIpIdResponse>
   */
  public async ipId(
    request: IpAssetRegistryIpIdRequest,
  ): Promise<IpAssetRegistryIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'ipId',
      args: [request.chainId, request.tokenContract, request.tokenId],
    })
  }

  /**
   * method isRegistered for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIsRegisteredRequest
   * @return Promise<IpAssetRegistryIsRegisteredResponse>
   */
  public async isRegistered(
    request: IpAssetRegistryIsRegisteredRequest,
  ): Promise<IpAssetRegistryIsRegisteredResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'isRegistered',
      args: [request.id],
    })
  }
}

/**
 * contract IPAssetRegistry write method
 */
export class IpAssetRegistryClient extends IpAssetRegistryReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x30C89bCB41277f09b18DF0375b9438909e193bf0',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method register for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegisterRequest
   * @return Promise<WriteContractReturnType>
   */
  public async register(
    request: IpAssetRegistryRegisterRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'register',
      account: this.wallet.account,
      args: [request.tokenContract, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract IPAssetRegistry permission less write method
 */
export class IpAssetRegistryPermissionLessClient extends IpAssetRegistryReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x30C89bCB41277f09b18DF0375b9438909e193bf0',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * permission less method register for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegisterRequest
   * @return Promise<WriteContractReturnType>
   */
  public async register(
    request: IpAssetRegistryRegisterRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: ipAssetRegistryAbi,
            functionName: 'register',
            args: [request.tokenContract, request.tokenId],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract IpRoyaltyVaultImpl =============================================================

/**
 * IpRoyaltyVaultImplClaimableRevenueRequest
 *
 * @param account address
 * @param snapshotId uint256
 * @param token address
 */
export type IpRoyaltyVaultImplClaimableRevenueRequest = {
  account: Address
  snapshotId: bigint
  token: Address
}

export type IpRoyaltyVaultImplClaimableRevenueResponse = bigint

export type IpRoyaltyVaultImplIpIdResponse = Address

/**
 * IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest
 *
 * @param snapshotIds uint256[]
 * @param token address
 */
export type IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest = {
  snapshotIds: readonly bigint[]
  token: Address
}

/**
 * IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest
 *
 * @param snapshotId uint256
 * @param tokens address[]
 */
export type IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest = {
  snapshotId: bigint
  tokens: readonly Address[]
}

/**
 * IpRoyaltyVaultImplCollectRoyaltyTokensRequest
 *
 * @param ancestorIpId address
 */
export type IpRoyaltyVaultImplCollectRoyaltyTokensRequest = {
  ancestorIpId: Address
}

/**
 * contract IpRoyaltyVaultImpl readonly method
 */
export class IpRoyaltyVaultImplReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * method claimableRevenue for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimableRevenueRequest
   * @return Promise<IpRoyaltyVaultImplClaimableRevenueResponse>
   */
  public async claimableRevenue(
    request: IpRoyaltyVaultImplClaimableRevenueRequest,
  ): Promise<IpRoyaltyVaultImplClaimableRevenueResponse> {
    return await this.rpcClient.readContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: 'claimableRevenue',
      args: [request.account, request.snapshotId, request.token],
    })
  }

  /**
   * method ipId for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplIpIdRequest
   * @return Promise<IpRoyaltyVaultImplIpIdResponse>
   */
  public async ipId(): Promise<IpRoyaltyVaultImplIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: 'ipId',
    })
  }
}

/**
 * contract IpRoyaltyVaultImpl write method
 */
export class IpRoyaltyVaultImplClient extends IpRoyaltyVaultImplReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method claimRevenueBySnapshotBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueBySnapshotBatch(
    request: IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: 'claimRevenueBySnapshotBatch',
      account: this.wallet.account,
      args: [request.snapshotIds, request.token],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method claimRevenueByTokenBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueByTokenBatch(
    request: IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: 'claimRevenueByTokenBatch',
      account: this.wallet.account,
      args: [request.snapshotId, request.tokens],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method collectRoyaltyTokens for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplCollectRoyaltyTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async collectRoyaltyTokens(
    request: IpRoyaltyVaultImplCollectRoyaltyTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: 'collectRoyaltyTokens',
      account: this.wallet.account,
      args: [request.ancestorIpId],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract IpRoyaltyVaultImpl permission less write method
 */
export class IpRoyaltyVaultImplPermissionLessClient extends IpRoyaltyVaultImplReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * permission less method claimRevenueBySnapshotBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueBySnapshotBatch(
    request: IpRoyaltyVaultImplClaimRevenueBySnapshotBatchRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: ipRoyaltyVaultImplAbi,
            functionName: 'claimRevenueBySnapshotBatch',
            args: [request.snapshotIds, request.token],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method claimRevenueByTokenBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueByTokenBatch(
    request: IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: ipRoyaltyVaultImplAbi,
            functionName: 'claimRevenueByTokenBatch',
            args: [request.snapshotId, request.tokens],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method collectRoyaltyTokens for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplCollectRoyaltyTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async collectRoyaltyTokens(
    request: IpRoyaltyVaultImplCollectRoyaltyTokensRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: ipRoyaltyVaultImplAbi,
            functionName: 'collectRoyaltyTokens',
            args: [request.ancestorIpId],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract LicenseRegistry =============================================================

/**
 * LicenseRegistryTransferBatchEvent
 *
 * @param operator address
 * @param from address
 * @param to address
 * @param ids uint256[]
 * @param values uint256[]
 */
export type LicenseRegistryTransferBatchEvent = {
  operator: Address
  from: Address
  to: Address
  ids: readonly bigint[]
  values: readonly bigint[]
}

/**
 * LicenseRegistryTransferSingleEvent
 *
 * @param operator address
 * @param from address
 * @param to address
 * @param id uint256
 * @param value uint256
 */
export type LicenseRegistryTransferSingleEvent = {
  operator: Address
  from: Address
  to: Address
  id: bigint
  value: bigint
}

/**
 * LicenseRegistryMintLicenseRequest
 *
 * @param policyId uint256
 * @param licensorIpId_ address
 * @param transferable bool
 * @param amount uint256
 * @param receiver address
 */
export type LicenseRegistryMintLicenseRequest = {
  policyId: bigint
  licensorIpId_: Address
  transferable: boolean
  amount: bigint
  receiver: Address
}

/**
 * contract LicenseRegistry event
 */
export class LicenseRegistryEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * event TransferBatch for contract LicenseRegistry
   */
  public watchTransferBatchEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryTransferBatchEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'TransferBatch',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event TransferBatch for contract LicenseRegistry
   */
  public async parseTxTransferBatchEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<LicenseRegistryTransferBatchEvent>> {
    const targetLogs: Array<LicenseRegistryTransferBatchEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: licenseRegistryAbi,
            eventName: 'TransferBatch',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }

  /**
   * event TransferSingle for contract LicenseRegistry
   */
  public watchTransferSingleEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryTransferSingleEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'TransferSingle',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event TransferSingle for contract LicenseRegistry
   */
  public async parseTxTransferSingleEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<LicenseRegistryTransferSingleEvent>> {
    const targetLogs: Array<LicenseRegistryTransferSingleEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: licenseRegistryAbi,
            eventName: 'TransferSingle',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }
}

/**
 * contract LicenseRegistry write method
 */
export class LicenseRegistryClient extends LicenseRegistryEventClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method mintLicense for contract LicenseRegistry
   *
   * @param request LicenseRegistryMintLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicense(
    request: LicenseRegistryMintLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'mintLicense',
      account: this.wallet.account,
      args: [
        request.policyId,
        request.licensorIpId_,
        request.transferable,
        request.amount,
        request.receiver,
      ],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract LicenseRegistry permission less write method
 */
export class LicenseRegistryPermissionLessClient extends LicenseRegistryEventClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * permission less method mintLicense for contract LicenseRegistry
   *
   * @param request LicenseRegistryMintLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicense(
    request: LicenseRegistryMintLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: licenseRegistryAbi,
            functionName: 'mintLicense',
            args: [
              request.policyId,
              request.licensorIpId_,
              request.transferable,
              request.amount,
              request.receiver,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract LicensingModule =============================================================

/**
 * LicensingModuleIpIdLinkedToParentsEvent
 *
 * @param caller address
 * @param ipId address
 * @param parentIpIds address[]
 */
export type LicensingModuleIpIdLinkedToParentsEvent = {
  caller: Address
  ipId: Address
  parentIpIds: readonly Address[]
}

/**
 * LicensingModulePolicyAddedToIpIdEvent
 *
 * @param caller address
 * @param ipId address
 * @param policyId uint256
 * @param index uint256
 * @param isInherited bool
 */
export type LicensingModulePolicyAddedToIpIdEvent = {
  caller: Address
  ipId: Address
  policyId: bigint
  index: bigint
  isInherited: boolean
}

/**
 * LicensingModulePolicyRegisteredEvent
 *
 * @param policyId uint256
 * @param policyFrameworkManager address
 * @param frameworkData bytes
 * @param royaltyPolicy address
 * @param royaltyData bytes
 * @param mintingFee uint256
 * @param mintingFeeToken address
 */
export type LicensingModulePolicyRegisteredEvent = {
  policyId: bigint
  policyFrameworkManager: Address
  frameworkData: Hex
  royaltyPolicy: Address
  royaltyData: Hex
  mintingFee: bigint
  mintingFeeToken: Address
}

/**
 * LicensingModuleGetPolicyIdRequest
 *
 * @param pol tuple
 */
export type LicensingModuleGetPolicyIdRequest = {
  pol: {
    isLicenseTransferable: boolean
    policyFramework: Address
    frameworkData: Hex
    royaltyPolicy: Address
    royaltyData: Hex
    mintingFee: bigint
    mintingFeeToken: Address
  }
}

/**
 * LicensingModuleGetPolicyIdResponse
 *
 * @param policyId uint256
 */
export type LicensingModuleGetPolicyIdResponse = {
  policyId: bigint
}

/**
 * LicensingModuleAddPolicyToIpRequest
 *
 * @param ipId address
 * @param polId uint256
 */
export type LicensingModuleAddPolicyToIpRequest = {
  ipId: Address
  polId: bigint
}

/**
 * LicensingModuleLinkIpToParentsRequest
 *
 * @param licenseIds uint256[]
 * @param childIpId address
 * @param royaltyContext bytes
 */
export type LicensingModuleLinkIpToParentsRequest = {
  licenseIds: readonly bigint[]
  childIpId: Address
  royaltyContext: Hex
}

/**
 * LicensingModuleMintLicenseRequest
 *
 * @param policyId uint256
 * @param licensorIpId address
 * @param amount uint256
 * @param receiver address
 * @param royaltyContext bytes
 */
export type LicensingModuleMintLicenseRequest = {
  policyId: bigint
  licensorIpId: Address
  amount: bigint
  receiver: Address
  royaltyContext: Hex
}

/**
 * LicensingModuleRegisterPolicyRequest
 *
 * @param pol tuple
 */
export type LicensingModuleRegisterPolicyRequest = {
  pol: {
    isLicenseTransferable: boolean
    policyFramework: Address
    frameworkData: Hex
    royaltyPolicy: Address
    royaltyData: Hex
    mintingFee: bigint
    mintingFeeToken: Address
  }
}

/**
 * contract LicensingModule event
 */
export class LicensingModuleEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x2A88056985814dcBb72aFA50B95893359B6262f5',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * event IpIdLinkedToParents for contract LicensingModule
   */
  public watchIpIdLinkedToParentsEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicensingModuleIpIdLinkedToParentsEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: 'IpIdLinkedToParents',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event IpIdLinkedToParents for contract LicensingModule
   */
  public async parseTxIpIdLinkedToParentsEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<LicensingModuleIpIdLinkedToParentsEvent>> {
    const targetLogs: Array<LicensingModuleIpIdLinkedToParentsEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: licensingModuleAbi,
            eventName: 'IpIdLinkedToParents',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }

  /**
   * event PolicyAddedToIpId for contract LicensingModule
   */
  public watchPolicyAddedToIpIdEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicensingModulePolicyAddedToIpIdEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: 'PolicyAddedToIpId',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event PolicyAddedToIpId for contract LicensingModule
   */
  public async parseTxPolicyAddedToIpIdEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<LicensingModulePolicyAddedToIpIdEvent>> {
    const targetLogs: Array<LicensingModulePolicyAddedToIpIdEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: licensingModuleAbi,
            eventName: 'PolicyAddedToIpId',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }

  /**
   * event PolicyRegistered for contract LicensingModule
   */
  public watchPolicyRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicensingModulePolicyRegisteredEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: 'PolicyRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event PolicyRegistered for contract LicensingModule
   */
  public async parseTxPolicyRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Promise<Array<LicensingModulePolicyRegisteredEvent>> {
    const targetLogs: Array<LicensingModulePolicyRegisteredEvent> = []
    for (const log of txReceipt.logs) {
      try {
        targetLogs.push(
          decodeEventLog({
            abi: licensingModuleAbi,
            eventName: 'PolicyRegistered',
            data: log.data,
            topics: log.topics,
          }).args,
        )
      } catch (e) {}
    }
    return targetLogs
  }
}

/**
 * contract LicensingModule readonly method
 */
export class LicensingModuleReadOnlyClient extends LicensingModuleEventClient {
  constructor(
    rpcClient: PublicClient,
    address: Address = '0x2A88056985814dcBb72aFA50B95893359B6262f5',
  ) {
    super(rpcClient, address)
  }

  /**
   * method getPolicyId for contract LicensingModule
   *
   * @param request LicensingModuleGetPolicyIdRequest
   * @return Promise<LicensingModuleGetPolicyIdResponse>
   */
  public async getPolicyId(
    request: LicensingModuleGetPolicyIdRequest,
  ): Promise<LicensingModuleGetPolicyIdResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'getPolicyId',
      args: [request.pol],
    })
    return {
      policyId: result,
    }
  }
}

/**
 * contract LicensingModule write method
 */
export class LicensingModuleClient extends LicensingModuleReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x2A88056985814dcBb72aFA50B95893359B6262f5',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method addPolicyToIp for contract LicensingModule
   *
   * @param request LicensingModuleAddPolicyToIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async addPolicyToIp(
    request: LicensingModuleAddPolicyToIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'addPolicyToIp',
      account: this.wallet.account,
      args: [request.ipId, request.polId],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method linkIpToParents for contract LicensingModule
   *
   * @param request LicensingModuleLinkIpToParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async linkIpToParents(
    request: LicensingModuleLinkIpToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'linkIpToParents',
      account: this.wallet.account,
      args: [request.licenseIds, request.childIpId, request.royaltyContext],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method mintLicense for contract LicensingModule
   *
   * @param request LicensingModuleMintLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicense(
    request: LicensingModuleMintLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'mintLicense',
      account: this.wallet.account,
      args: [
        request.policyId,
        request.licensorIpId,
        request.amount,
        request.receiver,
        request.royaltyContext,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  /**
   * method registerPolicy for contract LicensingModule
   *
   * @param request LicensingModuleRegisterPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicy(
    request: LicensingModuleRegisterPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'registerPolicy',
      account: this.wallet.account,
      args: [request.pol],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract LicensingModule permission less write method
 */
export class LicensingModulePermissionLessClient extends LicensingModuleReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x2A88056985814dcBb72aFA50B95893359B6262f5',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * permission less method addPolicyToIp for contract LicensingModule
   *
   * @param request LicensingModuleAddPolicyToIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async addPolicyToIp(
    request: LicensingModuleAddPolicyToIpRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: licensingModuleAbi,
            functionName: 'addPolicyToIp',
            args: [request.ipId, request.polId],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method linkIpToParents for contract LicensingModule
   *
   * @param request LicensingModuleLinkIpToParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async linkIpToParents(
    request: LicensingModuleLinkIpToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: licensingModuleAbi,
            functionName: 'linkIpToParents',
            args: [
              request.licenseIds,
              request.childIpId,
              request.royaltyContext,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method mintLicense for contract LicensingModule
   *
   * @param request LicensingModuleMintLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicense(
    request: LicensingModuleMintLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: licensingModuleAbi,
            functionName: 'mintLicense',
            args: [
              request.policyId,
              request.licensorIpId,
              request.amount,
              request.receiver,
              request.royaltyContext,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }

  /**
   * permission less method registerPolicy for contract LicensingModule
   *
   * @param request LicensingModuleRegisterPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicy(
    request: LicensingModuleRegisterPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: licensingModuleAbi,
            functionName: 'registerPolicy',
            args: [request.pol],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract ModuleRegistry =============================================================

/**
 * ModuleRegistryIsRegisteredRequest
 *
 * @param moduleAddress address
 */
export type ModuleRegistryIsRegisteredRequest = {
  moduleAddress: Address
}

export type ModuleRegistryIsRegisteredResponse = boolean

/**
 * contract ModuleRegistry readonly method
 */
export class ModuleRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xab0bf9846eCE1299AaA1cB3FF5EfbBA328968771',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  /**
   * method isRegistered for contract ModuleRegistry
   *
   * @param request ModuleRegistryIsRegisteredRequest
   * @return Promise<ModuleRegistryIsRegisteredResponse>
   */
  public async isRegistered(
    request: ModuleRegistryIsRegisteredRequest,
  ): Promise<ModuleRegistryIsRegisteredResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'isRegistered',
      args: [request.moduleAddress],
    })
  }
}

// Contract PILPolicyFrameworkManager =============================================================

/**
 * PilPolicyFrameworkManagerRegisterPolicyRequest
 *
 * @param params tuple
 */
export type PilPolicyFrameworkManagerRegisterPolicyRequest = {
  params: {
    transferable: boolean
    royaltyPolicy: Address
    mintingFee: bigint
    mintingFeeToken: Address
    policy: {
      attribution: boolean
      commercialUse: boolean
      commercialAttribution: boolean
      commercializerChecker: Address
      commercializerCheckerData: Hex
      commercialRevShare: number
      derivativesAllowed: boolean
      derivativesAttribution: boolean
      derivativesApproval: boolean
      derivativesReciprocal: boolean
      territories: readonly string[]
      distributionChannels: readonly string[]
      contentRestrictions: readonly string[]
    }
  }
}

/**
 * contract PILPolicyFrameworkManager write method
 */
export class PilPolicyFrameworkManagerClient {
  protected readonly wallet: WalletClient
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xAc2C50Af31501370366D243FaeC56F89128f6d96',
  ) {
    this.address = address
    this.rpcClient = rpcClient
    this.wallet = wallet
  }

  /**
   * method registerPolicy for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerRegisterPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicy(
    request: PilPolicyFrameworkManagerRegisterPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'registerPolicy',
      account: this.wallet.account,
      args: [request.params],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract PILPolicyFrameworkManager permission less write method
 */
export class PilPolicyFrameworkManagerPermissionLessClient {
  protected readonly wallet: WalletClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xAc2C50Af31501370366D243FaeC56F89128f6d96',
  ) {
    this.address = address
    this.wallet = wallet
  }

  /**
   * permission less method registerPolicy for contract PILPolicyFrameworkManager
   *
   * @param request PilPolicyFrameworkManagerRegisterPolicyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPolicy(
    request: PilPolicyFrameworkManagerRegisterPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: pilPolicyFrameworkManagerAbi,
            functionName: 'registerPolicy',
            args: [request.params],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract RoyaltyModule =============================================================

/**
 * RoyaltyModulePayRoyaltyOnBehalfRequest
 *
 * @param receiverIpId address
 * @param payerIpId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyModulePayRoyaltyOnBehalfRequest = {
  receiverIpId: Address
  payerIpId: Address
  token: Address
  amount: bigint
}

/**
 * contract RoyaltyModule write method
 */
export class RoyaltyModuleClient {
  protected readonly wallet: WalletClient
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xF77b0933F6aaC2dCE2eAa0d79f6Bfd6b9347a5E7',
  ) {
    this.address = address
    this.rpcClient = rpcClient
    this.wallet = wallet
  }

  /**
   * method payRoyaltyOnBehalf for contract RoyaltyModule
   *
   * @param request RoyaltyModulePayRoyaltyOnBehalfRequest
   * @return Promise<WriteContractReturnType>
   */
  public async payRoyaltyOnBehalf(
    request: RoyaltyModulePayRoyaltyOnBehalfRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'payRoyaltyOnBehalf',
      account: this.wallet.account,
      args: [
        request.receiverIpId,
        request.payerIpId,
        request.token,
        request.amount,
      ],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract RoyaltyModule permission less write method
 */
export class RoyaltyModulePermissionLessClient {
  protected readonly wallet: WalletClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xF77b0933F6aaC2dCE2eAa0d79f6Bfd6b9347a5E7',
  ) {
    this.address = address
    this.wallet = wallet
  }

  /**
   * permission less method payRoyaltyOnBehalf for contract RoyaltyModule
   *
   * @param request RoyaltyModulePayRoyaltyOnBehalfRequest
   * @return Promise<WriteContractReturnType>
   */
  public async payRoyaltyOnBehalf(
    request: RoyaltyModulePayRoyaltyOnBehalfRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: royaltyModuleAbi,
            functionName: 'payRoyaltyOnBehalf',
            args: [
              request.receiverIpId,
              request.payerIpId,
              request.token,
              request.amount,
            ],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}

// Contract RoyaltyPolicyLAP =============================================================

/**
 * RoyaltyPolicyLapOnRoyaltyPaymentRequest
 *
 * @param caller address
 * @param ipId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyPolicyLapOnRoyaltyPaymentRequest = {
  caller: Address
  ipId: Address
  token: Address
  amount: bigint
}

/**
 * contract RoyaltyPolicyLAP write method
 */
export class RoyaltyPolicyLapClient {
  protected readonly wallet: WalletClient
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x265C21b34e0E92d63C678425478C42aa8D727B79',
  ) {
    this.address = address
    this.rpcClient = rpcClient
    this.wallet = wallet
  }

  /**
   * method onRoyaltyPayment for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnRoyaltyPaymentRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onRoyaltyPayment(
    request: RoyaltyPolicyLapOnRoyaltyPaymentRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'onRoyaltyPayment',
      account: this.wallet.account,
      args: [request.caller, request.ipId, request.token, request.amount],
    })
    return await this.wallet.writeContract(call)
  }
}

/**
 * contract RoyaltyPolicyLAP permission less write method
 */
export class RoyaltyPolicyLapPermissionLessClient {
  protected readonly wallet: WalletClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x265C21b34e0E92d63C678425478C42aa8D727B79',
  ) {
    this.address = address
    this.wallet = wallet
  }

  /**
   * permission less method onRoyaltyPayment for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapOnRoyaltyPaymentRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onRoyaltyPayment(
    request: RoyaltyPolicyLapOnRoyaltyPaymentRequest,
  ): Promise<WriteContractReturnType> {
    const userOperationRequest = await this.wallet.prepareUserOperationRequest({
      userOperation: {
        callData: await this.wallet.account.encodeCallData({
          to: this.address,
          data: encodeFunctionData({
            abi: royaltyPolicyLapAbi,
            functionName: 'onRoyaltyPayment',
            args: [request.caller, request.ipId, request.token, request.amount],
          }),
          value: 0n,
        }),
      },
      account: this.wallet.account,
    })
    return await this.wallet.sendUserOperation({
      userOperation: userOperationRequest,
      account: this.wallet.account,
    })
  }
}
