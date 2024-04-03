import {
  Address,
  PublicClient,
  WalletClient,
  WatchContractEventReturnType,
  WriteContractReturnType,
  Hex,
} from 'viem'
import { AbiTypeToPrimitiveType, AbiParameterToPrimitiveType } from 'abitype'

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
  { type: 'error', inputs: [], name: 'Governance__InconsistentState' },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  { type: 'error', inputs: [], name: 'Governance__ProtocolPaused' },
  {
    type: 'error',
    inputs: [{ name: 'interfaceName', internalType: 'string', type: 'string' }],
    name: 'Governance__UnsupportedInterface',
  },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
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
] as const

export const accessControllerAddress =
  '0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3' as const

export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AncestorsVaultLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ancestorsVaultLapAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'royaltyPolicyLAP', internalType: 'address', type: 'address' },
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
  { type: 'error', inputs: [], name: 'AncestorsVaultLAP__AlreadyClaimed' },
  {
    type: 'error',
    inputs: [],
    name: 'AncestorsVaultLAP__ClaimerNotAnAncestor',
  },
  { type: 'error', inputs: [], name: 'AncestorsVaultLAP__ERC20BalanceNotZero' },
  { type: 'error', inputs: [], name: 'AncestorsVaultLAP__ETHBalanceNotZero' },
  {
    type: 'error',
    inputs: [],
    name: 'AncestorsVaultLAP__InvalidAncestorsHash',
  },
  { type: 'error', inputs: [], name: 'AncestorsVaultLAP__InvalidClaimer' },
  { type: 'error', inputs: [], name: 'AncestorsVaultLAP__TransferFailed' },
  {
    type: 'error',
    inputs: [],
    name: 'AncestorsVaultLAP__ZeroRoyaltyPolicyLAP',
  },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
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
        name: 'ipId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'claimerIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'withdrawETH',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'tokens',
        internalType: 'contract ERC20[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'Claimed',
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
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'claimerIpId', internalType: 'address', type: 'address' },
    ],
    name: 'isClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

export const ancestorsVaultLapAddress =
  '0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c' as const

export const ancestorsVaultLapConfig = {
  address: ancestorsVaultLapAddress,
  abi: ancestorsVaultLapAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbitrationPolicySP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const arbitrationPolicySpAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_disputeModule', internalType: 'address', type: 'address' },
      { name: '_paymentToken', internalType: 'address', type: 'address' },
      { name: '_arbitrationPrice', internalType: 'uint256', type: 'uint256' },
      { name: '_governable', internalType: 'address', type: 'address' },
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
  { type: 'error', inputs: [], name: 'ArbitrationPolicySP__NotDisputeModule' },
  { type: 'error', inputs: [], name: 'ArbitrationPolicySP__ZeroDisputeModule' },
  { type: 'error', inputs: [], name: 'ArbitrationPolicySP__ZeroPaymentToken' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GovernanceWithdrew',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ARBITRATION_PRICE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DISPUTE_MODULE',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAYMENT_TOKEN',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    inputs: [],
    name: 'governanceWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'disputeId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onDisputeCancel',
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
    name: 'onDisputeJudgement',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onRaiseDispute',
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
] as const

export const arbitrationPolicySpAddress =
  '0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3' as const

export const arbitrationPolicySpConfig = {
  address: arbitrationPolicySpAddress,
  abi: arbitrationPolicySpAbi,
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
      { name: '_governance', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
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
] as const

export const disputeModuleAddress =
  '0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb' as const

export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Governance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const governanceAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'admin', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [],
    name: 'Governance__NewStateIsTheSameWithOldState',
  },
  { type: 'error', inputs: [], name: 'Governance__OnlyProtocolAdmin' },
  { type: 'error', inputs: [], name: 'Governance__ZeroAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
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
        name: 'prevState',
        internalType: 'enum GovernanceLib.ProtocolState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newState',
        internalType: 'enum GovernanceLib.ProtocolState',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StateSet',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getState',
    outputs: [
      {
        name: '',
        internalType: 'enum GovernanceLib.ProtocolState',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newState',
        internalType: 'enum GovernanceLib.ProtocolState',
        type: 'uint8',
      },
    ],
    name: 'setState',
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
] as const

export const governanceAddress =
  '0x6D8070F7726769bEd136bc7007B3deA695f7047A' as const

export const governanceConfig = {
  address: governanceAddress,
  abi: governanceAbi,
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
    inputs: [],
    name: 'state',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
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
  { type: 'receive', stateMutability: 'payable' },
] as const

export const ipAccountImplAddress =
  '0xddcBD4309f0545fa8cC99137bC621620e017bdBe' as const

export const ipAccountImplConfig = {
  address: ipAccountImplAddress,
  abi: ipAccountImplAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAccountRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'erc6551Registry', internalType: 'address', type: 'address' },
      { name: 'ipAccountImpl', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'IPAccountRegistry_InvalidIpAccountImpl' },
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
    name: 'getIPAccountImpl',
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
    name: 'registerIpAccount',
    outputs: [
      { name: 'ipAccountAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
] as const

export const ipAccountRegistryAddress =
  '0x16129393444e5BEb435501Dea41D5ECfB10b76F0' as const

export const ipAccountRegistryConfig = {
  address: ipAccountRegistryAddress,
  abi: ipAccountRegistryAbi,
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
      { name: 'moduleRegistry', internalType: 'address', type: 'address' },
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
  { type: 'error', inputs: [], name: 'IPAssetRegistry__InvalidAccount' },
  { type: 'error', inputs: [], name: 'IPAssetRegistry__NotYetRegistered' },
  {
    type: 'error',
    inputs: [],
    name: 'IPAssetRegistry__RegistrantUnauthorized',
  },
  { type: 'error', inputs: [], name: 'IPAssetRegistry__Unauthorized' },
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
      {
        name: 'resolver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'provider',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'metadata',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'IPRegistered',
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
        name: 'resolver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'IPResolverSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'metadataProvider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'metadata',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'MetadataSet',
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
    name: 'MODULE_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IModuleRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REGISTRATION_MODULE',
    outputs: [
      {
        name: '',
        internalType: 'contract IRegistrationModule',
        type: 'address',
      },
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
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    inputs: [{ name: 'id', internalType: 'address', type: 'address' }],
    name: 'metadata',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'address', type: 'address' }],
    name: 'metadataProvider',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'metadataProvider',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'resolverAddr', internalType: 'address', type: 'address' },
      { name: 'createAccount', internalType: 'bool', type: 'bool' },
      { name: 'metadata_', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'register',
    outputs: [{ name: 'ipId_', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'resolverAddr', internalType: 'address', type: 'address' },
      { name: 'createAccount', internalType: 'bool', type: 'bool' },
      { name: 'metadata_', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'register',
    outputs: [{ name: 'ipId_', internalType: 'address', type: 'address' }],
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
    inputs: [{ name: 'id', internalType: 'address', type: 'address' }],
    name: 'resolver',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
      { name: 'newGovernance', internalType: 'address', type: 'address' },
    ],
    name: 'setGovernance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'address', type: 'address' },
      { name: 'provider', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newMetadataProvider', internalType: 'address', type: 'address' },
    ],
    name: 'setMetadataProvider',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'registrationModule', internalType: 'address', type: 'address' },
    ],
    name: 'setRegistrationModule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'address', type: 'address' },
      { name: 'resolverAddr', internalType: 'address', type: 'address' },
    ],
    name: 'setResolver',
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
  '0xAAe9e83F8cE8832270AF033c609e233686f0E0eB' as const

export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRenderer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAssetRendererAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'assetRegistry', internalType: 'address', type: 'address' },
      { name: 'licenseRegistry', internalType: 'address', type: 'address' },
      { name: 'royaltyModule', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IP_ASSET_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IPAssetRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LICENSE_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract LicenseRegistry', type: 'address' },
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
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'description',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'hash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'registrant',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'registrationDate',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

export const ipAssetRendererAddress =
  '0x39cCE13916e7bfdeFa462D360d551aEcc6D82311' as const

export const ipAssetRendererConfig = {
  address: ipAssetRendererAddress,
  abi: ipAssetRendererAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPMetadataProvider
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipMetadataProviderAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'ipAssetRegistry', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'MetadataProvider__IPAssetOwnerInvalid' },
  {
    type: 'error',
    inputs: [],
    name: 'MetadataProvider__MetadataNotCompatible',
  },
  { type: 'error', inputs: [], name: 'MetadataProvider__RegistrantInvalid' },
  { type: 'error', inputs: [], name: 'MetadataProvider__Unauthorized' },
  {
    type: 'error',
    inputs: [],
    name: 'MetadataProvider__UpgradeProviderInvalid',
  },
  { type: 'error', inputs: [], name: 'MetadataProvider__UpgradeUnavailable' },
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
        name: 'metadata',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'MetadataSet',
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
    name: 'getMetadata',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'hash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'metadata',
    outputs: [
      {
        name: '',
        internalType: 'struct IP.MetadataV1',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'registrationDate', internalType: 'uint64', type: 'uint64' },
          { name: 'registrant', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'registrant',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'registrationDate',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'metadata', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'provider', internalType: 'address', type: 'address' }],
    name: 'setUpgradeProvider',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address payable', type: 'address' },
      { name: 'metadata', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'upgradeProvider',
    outputs: [
      { name: '', internalType: 'contract IMetadataProvider', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

export const ipMetadataProviderAddress =
  '0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB' as const

export const ipMetadataProviderConfig = {
  address: ipMetadataProviderAddress,
  abi: ipMetadataProviderAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPResolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipResolverAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAssetRegistry', internalType: 'address', type: 'address' },
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
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      { name: 'key', internalType: 'string', type: 'string', indexed: true },
      { name: 'value', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'KeyValueSet',
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
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'key', internalType: 'string', type: 'string' },
      { name: 'val', internalType: 'string', type: 'string' },
    ],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'key', internalType: 'string', type: 'string' },
    ],
    name: 'value',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

export const ipResolverAddress =
  '0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78' as const

export const ipResolverConfig = {
  address: ipResolverAddress,
  abi: ipResolverAbi,
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
// MockERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockErc20Abi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
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
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
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
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
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
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
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
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
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
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

export const mockErc20Address =
  '0x3271778AdE44EfeC9e11b7160827921b6d614AF1' as const

export const mockErc20Config = {
  address: mockErc20Address,
  abi: mockErc20Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockErc721Abi = [
  {
    type: 'constructor',
    inputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
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
        name: 'approved',
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
    ],
    name: 'Approval',
  },
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
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'mint',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mintId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
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
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const mockErc721Address =
  '0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f' as const

export const mockErc721Config = {
  address: mockErc721Address,
  abi: mockErc721Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockTokenGatedHook
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockTokenGatedHookAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'name',
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
    inputs: [{ name: 'configData', internalType: 'bytes', type: 'bytes' }],
    name: 'validateConfig',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'verify',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

export const mockTokenGatedHookAddress =
  '0x008B5D8Db85100E143729453784e9F077B2279fA' as const

export const mockTokenGatedHookConfig = {
  address: mockTokenGatedHookAddress,
  abi: mockTokenGatedHookAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ModuleRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const moduleRegistryAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'governance', internalType: 'address', type: 'address' }],
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
    inputs: [],
    name: 'governance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
] as const

export const moduleRegistryAddress =
  '0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d' as const

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
// RegistrationModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const registrationModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'assetRegistry', internalType: 'address', type: 'address' },
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      { name: 'resolverAddr', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'RegistrationModule__InvalidOwner' },
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
        name: 'licenseIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'DerivativeIPRegistered',
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
    ],
    name: 'RootIPRegistered',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ipResolver',
    outputs: [
      { name: '', internalType: 'contract IPResolver', type: 'address' },
    ],
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
      { name: 'licenseIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'ipName', internalType: 'string', type: 'string' },
      { name: 'contentHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'externalURL', internalType: 'string', type: 'string' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'registerDerivativeIp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'ipName', internalType: 'string', type: 'string' },
      { name: 'contentHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'externalURL', internalType: 'string', type: 'string' },
    ],
    name: 'registerRootIp',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

export const registrationModuleAddress =
  '0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694' as const

export const registrationModuleConfig = {
  address: registrationModuleAddress,
  abi: registrationModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const royaltyModuleAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'governance', internalType: 'address', type: 'address' }],
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
    type: 'function',
    inputs: [],
    name: 'LICENSING_MODULE',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    inputs: [
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
    ],
    name: 'isWhitelistedRoyaltyPolicy',
    outputs: [{ name: 'isWhitelisted', internalType: 'bool', type: 'bool' }],
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
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'royaltyPolicies',
    outputs: [
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
    ],
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
    inputs: [
      { name: 'licensingModule', internalType: 'address', type: 'address' },
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
  '0xE1a667ccc38540b38d8579c499bE22e51390a308' as const

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
// TokenWithdrawalModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenWithdrawalModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
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
    name: 'name',
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
    inputs: [
      { name: 'ipAccount', internalType: 'address payable', type: 'address' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawERC1155',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccount', internalType: 'address payable', type: 'address' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipAccount', internalType: 'address payable', type: 'address' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawERC721',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const tokenWithdrawalModuleAddress =
  '0x5f62d238B3022bA5881e5e443B014cac6999a4f2' as const

export const tokenWithdrawalModuleConfig = {
  address: tokenWithdrawalModuleAddress,
  abi: tokenWithdrawalModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Contract AccessController =============================================================
export type AccessControllerIpAccountRegistryResponse = Address

export type AccessControllerModuleRegistryResponse = Address

export type AccessControllerCheckPermissionRequest = {
  ipAccount: Address
  signer: Address
  to: Address
  func: Hex
}

export type AccessControllerGetGovernanceResponse = Address

export type AccessControllerGetPermissionRequest = {
  ipAccount: Address
  signer: Address
  to: Address
  func: Hex
}
export type AccessControllerGetPermissionResponse = number

export type AccessControllerGovernanceResponse = Address

export type AccessControllerInitializeRequest = {
  ipAccountRegistry: Address
  moduleRegistry: Address
}

export type AccessControllerSetBatchPermissionsRequest = {
  permissions: {
    ipAccount: Address
    signer: Address
    to: Address
    func: Hex
    permission: number
  }[]
}

export type AccessControllerSetGlobalPermissionRequest = {
  signer: Address
  to: Address
  func: Hex
  permission: number
}

export type AccessControllerSetGovernanceRequest = {
  newGovernance: Address
}

export type AccessControllerSetPermissionRequest = {
  ipAccount: Address
  signer: Address
  to: Address
  func: Hex
  permission: number
}

export type AccessControllerGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type AccessControllerPermissionSetEvent = {
  ipAccountOwner?: Address
  ipAccount?: Address
  signer?: Address
  to?: Address
  func?: Hex
  permission?: number
}

export class AccessControllerReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async ipAccountRegistry(): Promise<AccessControllerIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  public async moduleRegistry(): Promise<AccessControllerModuleRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'MODULE_REGISTRY',
    })
  }

  public async checkPermission(
    request: AccessControllerCheckPermissionRequest,
  ): Promise<void> {
    await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'checkPermission',
      args: [request.ipAccount, request.signer, request.to, request.func],
    })
  }

  public async getGovernance(): Promise<AccessControllerGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async getPermission(
    request: AccessControllerGetPermissionRequest,
  ): Promise<AccessControllerGetPermissionResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'getPermission',
      args: [request.ipAccount, request.signer, request.to, request.func],
    })
  }

  public async governance(): Promise<AccessControllerGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'governance',
    })
  }
}
export class AccessControllerClient extends AccessControllerReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async initialize(
    request: AccessControllerInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'initialize',
      account: this.wallet.account,
      args: [request.ipAccountRegistry, request.moduleRegistry],
    })
    return await this.wallet.writeContract(call)
  }

  public async setBatchPermissions(
    request: AccessControllerSetBatchPermissionsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'setBatchPermissions',
      account: this.wallet.account,
      args: [request.permissions],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGlobalPermission(
    request: AccessControllerSetGlobalPermissionRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'setGlobalPermission',
      account: this.wallet.account,
      args: [request.signer, request.to, request.func, request.permission],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: AccessControllerSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }

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
export class AccessControllerEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: AccessControllerGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: accessControllerAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchPermissionSetEvent(
    onLogs: (txHash: Hex, ev: AccessControllerPermissionSetEvent) => void,
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
}

// Contract AncestorsVaultLAP =============================================================
export type AncestorsVaultLapRoyaltyPolicyLapResponse = Address

export type AncestorsVaultLapIsClaimedRequest = {
  ipId: Address
  claimerIpId: Address
}
export type AncestorsVaultLapIsClaimedResponse = boolean

export type AncestorsVaultLapSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type AncestorsVaultLapSupportsInterfaceResponse = boolean

export type AncestorsVaultLapClaimRequest = {
  ipId: Address
  claimerIpId: Address
  ancestors: readonly Address[]
  ancestorsRoyalties: readonly number[]
  withdrawETH: boolean
  tokens: readonly Address[]
}

export type AncestorsVaultLapOnErc1155BatchReceivedRequest = readonly [
  Address,
  Address,
  readonly bigint[],
  readonly bigint[],
  Hex,
]

export type AncestorsVaultLapOnErc1155ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  bigint,
  Hex,
]

export type AncestorsVaultLapClaimedEvent = {
  ipId?: Address
  claimerIpId?: Address
  withdrawETH?: boolean
  tokens?: readonly Address[]
}

export class AncestorsVaultLapReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async royaltyPolicyLap(): Promise<AncestorsVaultLapRoyaltyPolicyLapResponse> {
    return await this.rpcClient.readContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: 'ROYALTY_POLICY_LAP',
    })
  }

  public async isClaimed(
    request: AncestorsVaultLapIsClaimedRequest,
  ): Promise<AncestorsVaultLapIsClaimedResponse> {
    return await this.rpcClient.readContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: 'isClaimed',
      args: [request.ipId, request.claimerIpId],
    })
  }

  public async supportsInterface(
    request: AncestorsVaultLapSupportsInterfaceRequest,
  ): Promise<AncestorsVaultLapSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class AncestorsVaultLapClient extends AncestorsVaultLapReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async claim(
    request: AncestorsVaultLapClaimRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: 'claim',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.claimerIpId,
        request.ancestors,
        request.ancestorsRoyalties,
        request.withdrawETH,
        request.tokens,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async onErc1155BatchReceived(
    request: AncestorsVaultLapOnErc1155BatchReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: 'onERC1155BatchReceived',
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    })
    return await this.wallet.writeContract(call)
  }

  public async onErc1155Received(
    request: AncestorsVaultLapOnErc1155ReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      functionName: 'onERC1155Received',
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    })
    return await this.wallet.writeContract(call)
  }
}
export class AncestorsVaultLapEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchClaimedEvent(
    onLogs: (txHash: Hex, ev: AncestorsVaultLapClaimedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ancestorsVaultLapAbi,
      address: this.address,
      eventName: 'Claimed',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract ArbitrationPolicySP =============================================================
export type ArbitrationPolicySpArbitrationPriceResponse = bigint

export type ArbitrationPolicySpDisputeModuleResponse = Address

export type ArbitrationPolicySpPaymentTokenResponse = Address

export type ArbitrationPolicySpGetGovernanceResponse = Address

export type ArbitrationPolicySpGovernanceResponse = Address

export type ArbitrationPolicySpOnDisputeCancelRequest = {
  caller: Address
  disputeId: bigint
  data: Hex
}

export type ArbitrationPolicySpOnDisputeJudgementRequest = {
  disputeId: bigint
  decision: boolean
  data: Hex
}

export type ArbitrationPolicySpOnRaiseDisputeRequest = {
  caller: Address
  data: Hex
}

export type ArbitrationPolicySpSetGovernanceRequest = {
  newGovernance: Address
}

export type ArbitrationPolicySpGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type ArbitrationPolicySpGovernanceWithdrewEvent = {
  amount?: bigint
}

export class ArbitrationPolicySpReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async arbitrationPrice(): Promise<ArbitrationPolicySpArbitrationPriceResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'ARBITRATION_PRICE',
    })
  }

  public async disputeModule(): Promise<ArbitrationPolicySpDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'DISPUTE_MODULE',
    })
  }

  public async paymentToken(): Promise<ArbitrationPolicySpPaymentTokenResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'PAYMENT_TOKEN',
    })
  }

  public async getGovernance(): Promise<ArbitrationPolicySpGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async governance(): Promise<ArbitrationPolicySpGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'governance',
    })
  }
}
export class ArbitrationPolicySpClient extends ArbitrationPolicySpReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async governanceWithdraw(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'governanceWithdraw',
      account: this.wallet.account,
    })
    return await this.wallet.writeContract(call)
  }

  public async onDisputeCancel(
    request: ArbitrationPolicySpOnDisputeCancelRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'onDisputeCancel',
      account: this.wallet.account,
      args: [request.caller, request.disputeId, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async onDisputeJudgement(
    request: ArbitrationPolicySpOnDisputeJudgementRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'onDisputeJudgement',
      account: this.wallet.account,
      args: [request.disputeId, request.decision, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async onRaiseDispute(
    request: ArbitrationPolicySpOnRaiseDisputeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'onRaiseDispute',
      account: this.wallet.account,
      args: [request.caller, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: ArbitrationPolicySpSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }
}
export class ArbitrationPolicySpEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: ArbitrationPolicySpGovernanceUpdatedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchGovernanceWithdrewEvent(
    onLogs: (
      txHash: Hex,
      ev: ArbitrationPolicySpGovernanceWithdrewEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: arbitrationPolicySpAbi,
      address: this.address,
      eventName: 'GovernanceWithdrew',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract DisputeModule =============================================================
export type DisputeModuleAccessControllerResponse = Address

export type DisputeModuleInDisputeResponse = Hex

export type DisputeModuleIpAccountRegistryResponse = Address

export type DisputeModuleIpAssetRegistryResponse = Address

export type DisputeModuleArbitrationPoliciesRequest = {
  ipId: Address
}
export type DisputeModuleArbitrationPoliciesResponse = {
  arbitrationPolicy: Address
}

export type DisputeModuleBaseArbitrationPolicyResponse = Address

export type DisputeModuleDisputeCounterResponse = bigint

export type DisputeModuleDisputesRequest = {
  disputeId: bigint
}
export type DisputeModuleDisputesResponse = {
  targetIpId: Address
  disputeInitiator: Address
  arbitrationPolicy: Address
  linkToDisputeEvidence: Hex
  targetTag: Hex
  currentTag: Hex
}

export type DisputeModuleGetGovernanceResponse = Address

export type DisputeModuleGovernanceResponse = Address

export type DisputeModuleIsIpTaggedRequest = {
  ipId: Address
}
export type DisputeModuleIsIpTaggedResponse = boolean

export type DisputeModuleIsWhitelistedArbitrationPolicyRequest = {
  arbitrationPolicy: Address
}
export type DisputeModuleIsWhitelistedArbitrationPolicyResponse = {
  allowed: boolean
}

export type DisputeModuleIsWhitelistedArbitrationRelayerRequest = {
  arbitrationPolicy: Address
  arbitrationRelayer: Address
}
export type DisputeModuleIsWhitelistedArbitrationRelayerResponse = {
  allowed: boolean
}

export type DisputeModuleIsWhitelistedDisputeTagRequest = {
  tag: Hex
}
export type DisputeModuleIsWhitelistedDisputeTagResponse = {
  allowed: boolean
}

export type DisputeModuleNameResponse = string

export type DisputeModuleSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type DisputeModuleSupportsInterfaceResponse = boolean

export type DisputeModuleCancelDisputeRequest = {
  disputeId: bigint
  data: Hex
}

export type DisputeModuleRaiseDisputeRequest = {
  targetIpId: Address
  linkToDisputeEvidence: string
  targetTag: Hex
  data: Hex
}

export type DisputeModuleResolveDisputeRequest = {
  disputeId: bigint
}

export type DisputeModuleSetArbitrationPolicyRequest = {
  ipId: Address
  arbitrationPolicy: Address
}

export type DisputeModuleSetBaseArbitrationPolicyRequest = {
  arbitrationPolicy: Address
}

export type DisputeModuleSetDisputeJudgementRequest = {
  disputeId: bigint
  decision: boolean
  data: Hex
}

export type DisputeModuleSetGovernanceRequest = {
  newGovernance: Address
}

export type DisputeModuleWhitelistArbitrationPolicyRequest = {
  arbitrationPolicy: Address
  allowed: boolean
}

export type DisputeModuleWhitelistArbitrationRelayerRequest = {
  arbitrationPolicy: Address
  arbPolicyRelayer: Address
  allowed: boolean
}

export type DisputeModuleWhitelistDisputeTagRequest = {
  tag: Hex
  allowed: boolean
}

export type DisputeModuleArbitrationPolicySetEvent = {
  ipId?: Address
  arbitrationPolicy?: Address
}

export type DisputeModuleArbitrationPolicyWhitelistUpdatedEvent = {
  arbitrationPolicy?: Address
  allowed?: boolean
}

export type DisputeModuleArbitrationRelayerWhitelistUpdatedEvent = {
  arbitrationPolicy?: Address
  arbitrationRelayer?: Address
  allowed?: boolean
}

export type DisputeModuleDefaultArbitrationPolicyUpdatedEvent = {
  arbitrationPolicy?: Address
}

export type DisputeModuleDisputeCancelledEvent = {
  disputeId?: bigint
  data?: Hex
}

export type DisputeModuleDisputeJudgementSetEvent = {
  disputeId?: bigint
  decision?: boolean
  data?: Hex
}

export type DisputeModuleDisputeRaisedEvent = {
  disputeId?: bigint
  targetIpId?: Address
  disputeInitiator?: Address
  arbitrationPolicy?: Address
  linkToDisputeEvidence?: Hex
  targetTag?: Hex
  data?: Hex
}

export type DisputeModuleDisputeResolvedEvent = {
  disputeId?: bigint
}

export type DisputeModuleGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type DisputeModuleTagWhitelistUpdatedEvent = {
  tag?: Hex
  allowed?: boolean
}

export class DisputeModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async accessController(): Promise<DisputeModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'ACCESS_CONTROLLER',
    })
  }

  public async inDispute(): Promise<DisputeModuleInDisputeResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'IN_DISPUTE',
    })
  }

  public async ipAccountRegistry(): Promise<DisputeModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  public async ipAssetRegistry(): Promise<DisputeModuleIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'IP_ASSET_REGISTRY',
    })
  }

  public async arbitrationPolicies(
    request: DisputeModuleArbitrationPoliciesRequest,
  ): Promise<DisputeModuleArbitrationPoliciesResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'arbitrationPolicies',
      args: [request.ipId],
    })
    return {
      arbitrationPolicy: result,
    }
  }

  public async baseArbitrationPolicy(): Promise<DisputeModuleBaseArbitrationPolicyResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'baseArbitrationPolicy',
    })
  }

  public async disputeCounter(): Promise<DisputeModuleDisputeCounterResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'disputeCounter',
    })
  }

  public async disputes(
    request: DisputeModuleDisputesRequest,
  ): Promise<DisputeModuleDisputesResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'disputes',
      args: [request.disputeId],
    })
    return {
      targetIpId: result[0],
      disputeInitiator: result[1],
      arbitrationPolicy: result[2],
      linkToDisputeEvidence: result[3],
      targetTag: result[4],
      currentTag: result[5],
    }
  }

  public async getGovernance(): Promise<DisputeModuleGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async governance(): Promise<DisputeModuleGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'governance',
    })
  }

  public async isIpTagged(
    request: DisputeModuleIsIpTaggedRequest,
  ): Promise<DisputeModuleIsIpTaggedResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'isIpTagged',
      args: [request.ipId],
    })
  }

  public async isWhitelistedArbitrationPolicy(
    request: DisputeModuleIsWhitelistedArbitrationPolicyRequest,
  ): Promise<DisputeModuleIsWhitelistedArbitrationPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'isWhitelistedArbitrationPolicy',
      args: [request.arbitrationPolicy],
    })
    return {
      allowed: result,
    }
  }

  public async isWhitelistedArbitrationRelayer(
    request: DisputeModuleIsWhitelistedArbitrationRelayerRequest,
  ): Promise<DisputeModuleIsWhitelistedArbitrationRelayerResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'isWhitelistedArbitrationRelayer',
      args: [request.arbitrationPolicy, request.arbitrationRelayer],
    })
    return {
      allowed: result,
    }
  }

  public async isWhitelistedDisputeTag(
    request: DisputeModuleIsWhitelistedDisputeTagRequest,
  ): Promise<DisputeModuleIsWhitelistedDisputeTagResponse> {
    const result = await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'isWhitelistedDisputeTag',
      args: [request.tag],
    })
    return {
      allowed: result,
    }
  }

  public async name(): Promise<DisputeModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async supportsInterface(
    request: DisputeModuleSupportsInterfaceRequest,
  ): Promise<DisputeModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class DisputeModuleClient extends DisputeModuleReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

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

  public async setArbitrationPolicy(
    request: DisputeModuleSetArbitrationPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'setArbitrationPolicy',
      account: this.wallet.account,
      args: [request.ipId, request.arbitrationPolicy],
    })
    return await this.wallet.writeContract(call)
  }

  public async setBaseArbitrationPolicy(
    request: DisputeModuleSetBaseArbitrationPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'setBaseArbitrationPolicy',
      account: this.wallet.account,
      args: [request.arbitrationPolicy],
    })
    return await this.wallet.writeContract(call)
  }

  public async setDisputeJudgement(
    request: DisputeModuleSetDisputeJudgementRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'setDisputeJudgement',
      account: this.wallet.account,
      args: [request.disputeId, request.decision, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: DisputeModuleSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }

  public async whitelistArbitrationPolicy(
    request: DisputeModuleWhitelistArbitrationPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'whitelistArbitrationPolicy',
      account: this.wallet.account,
      args: [request.arbitrationPolicy, request.allowed],
    })
    return await this.wallet.writeContract(call)
  }

  public async whitelistArbitrationRelayer(
    request: DisputeModuleWhitelistArbitrationRelayerRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'whitelistArbitrationRelayer',
      account: this.wallet.account,
      args: [
        request.arbitrationPolicy,
        request.arbPolicyRelayer,
        request.allowed,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async whitelistDisputeTag(
    request: DisputeModuleWhitelistDisputeTagRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: disputeModuleAbi,
      address: this.address,
      functionName: 'whitelistDisputeTag',
      account: this.wallet.account,
      args: [request.tag, request.allowed],
    })
    return await this.wallet.writeContract(call)
  }
}
export class DisputeModuleEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchArbitrationPolicySetEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleArbitrationPolicySetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'ArbitrationPolicySet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchArbitrationPolicyWhitelistUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: DisputeModuleArbitrationPolicyWhitelistUpdatedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'ArbitrationPolicyWhitelistUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchArbitrationRelayerWhitelistUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: DisputeModuleArbitrationRelayerWhitelistUpdatedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'ArbitrationRelayerWhitelistUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchDefaultArbitrationPolicyUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: DisputeModuleDefaultArbitrationPolicyUpdatedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'DefaultArbitrationPolicyUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchDisputeCancelledEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeCancelledEvent) => void,
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

  public watchDisputeJudgementSetEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeJudgementSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'DisputeJudgementSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchDisputeRaisedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeRaisedEvent) => void,
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

  public watchDisputeResolvedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleDisputeResolvedEvent) => void,
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

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchTagWhitelistUpdatedEvent(
    onLogs: (txHash: Hex, ev: DisputeModuleTagWhitelistUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: 'TagWhitelistUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract Governance =============================================================
export type GovernanceDefaultAdminRoleResponse = Hex

export type GovernanceGetRoleAdminRequest = {
  role: Hex
}
export type GovernanceGetRoleAdminResponse = Hex

export type GovernanceGetStateResponse = number

export type GovernanceHasRoleRequest = {
  role: Hex
  account: Address
}
export type GovernanceHasRoleResponse = boolean

export type GovernanceSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type GovernanceSupportsInterfaceResponse = boolean

export type GovernanceGrantRoleRequest = {
  role: Hex
  account: Address
}

export type GovernanceRenounceRoleRequest = {
  role: Hex
  callerConfirmation: Address
}

export type GovernanceRevokeRoleRequest = {
  role: Hex
  account: Address
}

export type GovernanceSetStateRequest = {
  newState: number
}

export type GovernanceRoleAdminChangedEvent = {
  role?: Hex
  previousAdminRole?: Hex
  newAdminRole?: Hex
}

export type GovernanceRoleGrantedEvent = {
  role?: Hex
  account?: Address
  sender?: Address
}

export type GovernanceRoleRevokedEvent = {
  role?: Hex
  account?: Address
  sender?: Address
}

export type GovernanceStateSetEvent = {
  account?: Address
  prevState?: number
  newState?: number
  timestamp?: bigint
}

export class GovernanceReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x6D8070F7726769bEd136bc7007B3deA695f7047A',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async defaultAdminRole(): Promise<GovernanceDefaultAdminRoleResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'DEFAULT_ADMIN_ROLE',
    })
  }

  public async getRoleAdmin(
    request: GovernanceGetRoleAdminRequest,
  ): Promise<GovernanceGetRoleAdminResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'getRoleAdmin',
      args: [request.role],
    })
  }

  public async getState(): Promise<GovernanceGetStateResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'getState',
    })
  }

  public async hasRole(
    request: GovernanceHasRoleRequest,
  ): Promise<GovernanceHasRoleResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'hasRole',
      args: [request.role, request.account],
    })
  }

  public async supportsInterface(
    request: GovernanceSupportsInterfaceRequest,
  ): Promise<GovernanceSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class GovernanceClient extends GovernanceReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x6D8070F7726769bEd136bc7007B3deA695f7047A',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async grantRole(
    request: GovernanceGrantRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'grantRole',
      account: this.wallet.account,
      args: [request.role, request.account],
    })
    return await this.wallet.writeContract(call)
  }

  public async renounceRole(
    request: GovernanceRenounceRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'renounceRole',
      account: this.wallet.account,
      args: [request.role, request.callerConfirmation],
    })
    return await this.wallet.writeContract(call)
  }

  public async revokeRole(
    request: GovernanceRevokeRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'revokeRole',
      account: this.wallet.account,
      args: [request.role, request.account],
    })
    return await this.wallet.writeContract(call)
  }

  public async setState(
    request: GovernanceSetStateRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: governanceAbi,
      address: this.address,
      functionName: 'setState',
      account: this.wallet.account,
      args: [request.newState],
    })
    return await this.wallet.writeContract(call)
  }
}
export class GovernanceEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x6D8070F7726769bEd136bc7007B3deA695f7047A',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchRoleAdminChangedEvent(
    onLogs: (txHash: Hex, ev: GovernanceRoleAdminChangedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: 'RoleAdminChanged',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchRoleGrantedEvent(
    onLogs: (txHash: Hex, ev: GovernanceRoleGrantedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: 'RoleGranted',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchRoleRevokedEvent(
    onLogs: (txHash: Hex, ev: GovernanceRoleRevokedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: 'RoleRevoked',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchStateSetEvent(
    onLogs: (txHash: Hex, ev: GovernanceStateSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: governanceAbi,
      address: this.address,
      eventName: 'StateSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract IPAccountImpl =============================================================
export type IpAccountImplAccessControllerResponse = Address

export type IpAccountImplIsValidSignerRequest = {
  signer: Address
  data: Hex
}
export type IpAccountImplIsValidSignerResponse = Hex

export type IpAccountImplOnErc1155BatchReceivedRequest = readonly [
  Address,
  Address,
  readonly bigint[],
  readonly bigint[],
  Hex,
]
export type IpAccountImplOnErc1155BatchReceivedResponse = Hex

export type IpAccountImplOnErc1155ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  bigint,
  Hex,
]
export type IpAccountImplOnErc1155ReceivedResponse = Hex

export type IpAccountImplOnErc721ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  Hex,
]
export type IpAccountImplOnErc721ReceivedResponse = Hex

export type IpAccountImplOwnerResponse = Address

export type IpAccountImplStateResponse = bigint

export type IpAccountImplSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type IpAccountImplSupportsInterfaceResponse = boolean

export type IpAccountImplTokenResponse = readonly [bigint, Address, bigint]

export type IpAccountImplExecuteRequest = {
  to: Address
  value: bigint
  data: Hex
}

export type IpAccountImplExecuteWithSigRequest = {
  to: Address
  value: bigint
  data: Hex
  signer: Address
  deadline: bigint
  signature: Hex
}

export type IpAccountImplExecutedEvent = {
  to?: Address
  value?: bigint
  data?: Hex
  nonce?: bigint
}

export type IpAccountImplExecutedWithSigEvent = {
  to?: Address
  value?: bigint
  data?: Hex
  nonce?: bigint
  deadline?: bigint
  signer?: Address
  signature?: Hex
}

export class IpAccountImplReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xddcBD4309f0545fa8cC99137bC621620e017bdBe',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async accessController(): Promise<IpAccountImplAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'accessController',
    })
  }

  public async isValidSigner(
    request: IpAccountImplIsValidSignerRequest,
  ): Promise<IpAccountImplIsValidSignerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'isValidSigner',
      args: [request.signer, request.data],
    })
  }

  public async onErc1155BatchReceived(
    request: IpAccountImplOnErc1155BatchReceivedRequest,
  ): Promise<IpAccountImplOnErc1155BatchReceivedResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'onERC1155BatchReceived',
      args: [request[0], request[1], request[2], request[3], request[4]],
    })
  }

  public async onErc1155Received(
    request: IpAccountImplOnErc1155ReceivedRequest,
  ): Promise<IpAccountImplOnErc1155ReceivedResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'onERC1155Received',
      args: [request[0], request[1], request[2], request[3], request[4]],
    })
  }

  public async onErc721Received(
    request: IpAccountImplOnErc721ReceivedRequest,
  ): Promise<IpAccountImplOnErc721ReceivedResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'onERC721Received',
      args: [request[0], request[1], request[2], request[3]],
    })
  }

  public async owner(): Promise<IpAccountImplOwnerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'owner',
    })
  }

  public async state(): Promise<IpAccountImplStateResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'state',
    })
  }

  public async supportsInterface(
    request: IpAccountImplSupportsInterfaceRequest,
  ): Promise<IpAccountImplSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  public async token(): Promise<IpAccountImplTokenResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: 'token',
    })
  }
}
export class IpAccountImplClient extends IpAccountImplReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xddcBD4309f0545fa8cC99137bC621620e017bdBe',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

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
export class IpAccountImplEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xddcBD4309f0545fa8cC99137bC621620e017bdBe',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchExecutedEvent(
    onLogs: (txHash: Hex, ev: IpAccountImplExecutedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAccountImplAbi,
      address: this.address,
      eventName: 'Executed',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchExecutedWithSigEvent(
    onLogs: (txHash: Hex, ev: IpAccountImplExecutedWithSigEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAccountImplAbi,
      address: this.address,
      eventName: 'ExecutedWithSig',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract IPAccountRegistry =============================================================
export type IpAccountRegistryErc6551PublicRegistryResponse = Address

export type IpAccountRegistryIpAccountImplResponse = Address

export type IpAccountRegistryIpAccountSaltResponse = Hex

export type IpAccountRegistryGetIpAccountImplResponse = Address

export type IpAccountRegistryIpAccountRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
}
export type IpAccountRegistryIpAccountResponse = Address

export type IpAccountRegistryRegisterIpAccountRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
}

export type IpAccountRegistryIpAccountRegisteredEvent = {
  account?: Address
  implementation?: Address
  chainId?: bigint
  tokenContract?: Address
  tokenId?: bigint
}

export class IpAccountRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x16129393444e5BEb435501Dea41D5ECfB10b76F0',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async erc6551PublicRegistry(): Promise<IpAccountRegistryErc6551PublicRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: 'ERC6551_PUBLIC_REGISTRY',
    })
  }

  public async ipAccountImpl(): Promise<IpAccountRegistryIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_IMPL',
    })
  }

  public async ipAccountSalt(): Promise<IpAccountRegistryIpAccountSaltResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_SALT',
    })
  }

  public async getIpAccountImpl(): Promise<IpAccountRegistryGetIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: 'getIPAccountImpl',
    })
  }

  public async ipAccount(
    request: IpAccountRegistryIpAccountRequest,
  ): Promise<IpAccountRegistryIpAccountResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: 'ipAccount',
      args: [request.chainId, request.tokenContract, request.tokenId],
    })
  }
}
export class IpAccountRegistryClient extends IpAccountRegistryReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x16129393444e5BEb435501Dea41D5ECfB10b76F0',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async registerIpAccount(
    request: IpAccountRegistryRegisterIpAccountRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountRegistryAbi,
      address: this.address,
      functionName: 'registerIpAccount',
      account: this.wallet.account,
      args: [request.chainId, request.tokenContract, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }
}
export class IpAccountRegistryEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x16129393444e5BEb435501Dea41D5ECfB10b76F0',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchIpAccountRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: IpAccountRegistryIpAccountRegisteredEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAccountRegistryAbi,
      address: this.address,
      eventName: 'IPAccountRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract IPAssetRegistry =============================================================
export type IpAssetRegistryErc6551PublicRegistryResponse = Address

export type IpAssetRegistryIpAccountImplResponse = Address

export type IpAssetRegistryIpAccountSaltResponse = Hex

export type IpAssetRegistryModuleRegistryResponse = Address

export type IpAssetRegistryRegistrationModuleResponse = Address

export type IpAssetRegistryGetGovernanceResponse = Address

export type IpAssetRegistryGetIpAccountImplResponse = Address

export type IpAssetRegistryGovernanceResponse = Address

export type IpAssetRegistryIpAccountRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
}
export type IpAssetRegistryIpAccountResponse = Address

export type IpAssetRegistryIpIdRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
}
export type IpAssetRegistryIpIdResponse = Address

export type IpAssetRegistryIsApprovedForAllRequest = {
  owner: Address
  operator: Address
}
export type IpAssetRegistryIsApprovedForAllResponse = boolean

export type IpAssetRegistryIsRegisteredRequest = {
  id: Address
}
export type IpAssetRegistryIsRegisteredResponse = boolean

export type IpAssetRegistryMetadataRequest = {
  id: Address
}
export type IpAssetRegistryMetadataResponse = Hex

export type IpAssetRegistryMetadataProviderRequest = {
  id: Address
}
export type IpAssetRegistryMetadataProviderResponse = Address

export type IpAssetRegistryMetadataProvider2Response = Address

export type IpAssetRegistryResolverRequest = {
  id: Address
}
export type IpAssetRegistryResolverResponse = Address

export type IpAssetRegistryTotalSupplyResponse = bigint

export type IpAssetRegistryRegisterRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
  resolverAddr: Address
  createAccount: boolean
  metadata_: Hex
}

export type IpAssetRegistryRegister2Request = {
  licenseIds: readonly bigint[]
  royaltyContext: Hex
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
  resolverAddr: Address
  createAccount: boolean
  metadata_: Hex
}

export type IpAssetRegistryRegisterIpAccountRequest = {
  chainId: bigint
  tokenContract: Address
  tokenId: bigint
}

export type IpAssetRegistrySetApprovalForAllRequest = {
  operator: Address
  approved: boolean
}

export type IpAssetRegistrySetGovernanceRequest = {
  newGovernance: Address
}

export type IpAssetRegistrySetMetadataRequest = {
  id: Address
  provider: Address
  data: Hex
}

export type IpAssetRegistrySetMetadataProviderRequest = {
  newMetadataProvider: Address
}

export type IpAssetRegistrySetRegistrationModuleRequest = {
  registrationModule: Address
}

export type IpAssetRegistrySetResolverRequest = {
  id: Address
  resolverAddr: Address
}

export type IpAssetRegistryApprovalForAllEvent = {
  owner?: Address
  operator?: Address
  approved?: boolean
}

export type IpAssetRegistryGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type IpAssetRegistryIpAccountRegisteredEvent = {
  account?: Address
  implementation?: Address
  chainId?: bigint
  tokenContract?: Address
  tokenId?: bigint
}

export type IpAssetRegistryIpRegisteredEvent = {
  ipId?: Address
  chainId?: bigint
  tokenContract?: Address
  tokenId?: bigint
  resolver?: Address
  provider?: Address
  metadata?: Hex
}

export type IpAssetRegistryIpResolverSetEvent = {
  ipId?: Address
  resolver?: Address
}

export type IpAssetRegistryMetadataSetEvent = {
  ipId?: Address
  metadataProvider?: Address
  metadata?: Hex
}

export class IpAssetRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xAAe9e83F8cE8832270AF033c609e233686f0E0eB',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async erc6551PublicRegistry(): Promise<IpAssetRegistryErc6551PublicRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'ERC6551_PUBLIC_REGISTRY',
    })
  }

  public async ipAccountImpl(): Promise<IpAssetRegistryIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_IMPL',
    })
  }

  public async ipAccountSalt(): Promise<IpAssetRegistryIpAccountSaltResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_SALT',
    })
  }

  public async moduleRegistry(): Promise<IpAssetRegistryModuleRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'MODULE_REGISTRY',
    })
  }

  public async registrationModule(): Promise<IpAssetRegistryRegistrationModuleResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'REGISTRATION_MODULE',
    })
  }

  public async getGovernance(): Promise<IpAssetRegistryGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async getIpAccountImpl(): Promise<IpAssetRegistryGetIpAccountImplResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'getIPAccountImpl',
    })
  }

  public async governance(): Promise<IpAssetRegistryGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'governance',
    })
  }

  public async ipAccount(
    request: IpAssetRegistryIpAccountRequest,
  ): Promise<IpAssetRegistryIpAccountResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'ipAccount',
      args: [request.chainId, request.tokenContract, request.tokenId],
    })
  }

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

  public async isApprovedForAll(
    request: IpAssetRegistryIsApprovedForAllRequest,
  ): Promise<IpAssetRegistryIsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'isApprovedForAll',
      args: [request.owner, request.operator],
    })
  }

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

  public async metadata(
    request: IpAssetRegistryMetadataRequest,
  ): Promise<IpAssetRegistryMetadataResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'metadata',
      args: [request.id],
    })
  }

  public async metadataProvider(
    request: IpAssetRegistryMetadataProviderRequest,
  ): Promise<IpAssetRegistryMetadataProviderResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'metadataProvider',
      args: [request.id],
    })
  }

  public async metadataProvider2(): Promise<IpAssetRegistryMetadataProvider2Response> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'metadataProvider',
    })
  }

  public async resolver(
    request: IpAssetRegistryResolverRequest,
  ): Promise<IpAssetRegistryResolverResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'resolver',
      args: [request.id],
    })
  }

  public async totalSupply(): Promise<IpAssetRegistryTotalSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'totalSupply',
    })
  }
}
export class IpAssetRegistryClient extends IpAssetRegistryReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xAAe9e83F8cE8832270AF033c609e233686f0E0eB',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async register(
    request: IpAssetRegistryRegisterRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'register',
      account: this.wallet.account,
      args: [
        request.chainId,
        request.tokenContract,
        request.tokenId,
        request.resolverAddr,
        request.createAccount,
        request.metadata_,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async register2(
    request: IpAssetRegistryRegister2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'register',
      account: this.wallet.account,
      args: [
        request.licenseIds,
        request.royaltyContext,
        request.chainId,
        request.tokenContract,
        request.tokenId,
        request.resolverAddr,
        request.createAccount,
        request.metadata_,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async registerIpAccount(
    request: IpAssetRegistryRegisterIpAccountRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'registerIpAccount',
      account: this.wallet.account,
      args: [request.chainId, request.tokenContract, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }

  public async setApprovalForAll(
    request: IpAssetRegistrySetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'setApprovalForAll',
      account: this.wallet.account,
      args: [request.operator, request.approved],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: IpAssetRegistrySetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }

  public async setMetadata(
    request: IpAssetRegistrySetMetadataRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'setMetadata',
      account: this.wallet.account,
      args: [request.id, request.provider, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async setMetadataProvider(
    request: IpAssetRegistrySetMetadataProviderRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'setMetadataProvider',
      account: this.wallet.account,
      args: [request.newMetadataProvider],
    })
    return await this.wallet.writeContract(call)
  }

  public async setRegistrationModule(
    request: IpAssetRegistrySetRegistrationModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'setRegistrationModule',
      account: this.wallet.account,
      args: [request.registrationModule],
    })
    return await this.wallet.writeContract(call)
  }

  public async setResolver(
    request: IpAssetRegistrySetResolverRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: 'setResolver',
      account: this.wallet.account,
      args: [request.id, request.resolverAddr],
    })
    return await this.wallet.writeContract(call)
  }
}
export class IpAssetRegistryEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xAAe9e83F8cE8832270AF033c609e233686f0E0eB',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryApprovalForAllEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: 'ApprovalForAll',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchIpAccountRegisteredEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryIpAccountRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: 'IPAccountRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryIpRegisteredEvent) => void,
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

  public watchIpResolverSetEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryIpResolverSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: 'IPResolverSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchMetadataSetEvent(
    onLogs: (txHash: Hex, ev: IpAssetRegistryMetadataSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: 'MetadataSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract IPAssetRenderer =============================================================
export type IpAssetRendererIpAssetRegistryResponse = Address

export type IpAssetRendererLicenseRegistryResponse = Address

export type IpAssetRendererRoyaltyModuleResponse = Address

export type IpAssetRendererDescriptionRequest = {
  ipId: Address
}
export type IpAssetRendererDescriptionResponse = string

export type IpAssetRendererHashRequest = {
  ipId: Address
}
export type IpAssetRendererHashResponse = Hex

export type IpAssetRendererNameRequest = {
  ipId: Address
}
export type IpAssetRendererNameResponse = string

export type IpAssetRendererOwnerRequest = {
  ipId: Address
}
export type IpAssetRendererOwnerResponse = Address

export type IpAssetRendererRegistrantRequest = {
  ipId: Address
}
export type IpAssetRendererRegistrantResponse = Address

export type IpAssetRendererRegistrationDateRequest = {
  ipId: Address
}
export type IpAssetRendererRegistrationDateResponse = bigint

export type IpAssetRendererTokenUriRequest = {
  ipId: Address
}
export type IpAssetRendererTokenUriResponse = string

export type IpAssetRendererUriRequest = {
  ipId: Address
}
export type IpAssetRendererUriResponse = string

export class IpAssetRendererReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x39cCE13916e7bfdeFa462D360d551aEcc6D82311',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async ipAssetRegistry(): Promise<IpAssetRendererIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'IP_ASSET_REGISTRY',
    })
  }

  public async licenseRegistry(): Promise<IpAssetRendererLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'LICENSE_REGISTRY',
    })
  }

  public async royaltyModule(): Promise<IpAssetRendererRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'ROYALTY_MODULE',
    })
  }

  public async description(
    request: IpAssetRendererDescriptionRequest,
  ): Promise<IpAssetRendererDescriptionResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'description',
      args: [request.ipId],
    })
  }

  public async hash(
    request: IpAssetRendererHashRequest,
  ): Promise<IpAssetRendererHashResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'hash',
      args: [request.ipId],
    })
  }

  public async name(
    request: IpAssetRendererNameRequest,
  ): Promise<IpAssetRendererNameResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'name',
      args: [request.ipId],
    })
  }

  public async owner(
    request: IpAssetRendererOwnerRequest,
  ): Promise<IpAssetRendererOwnerResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'owner',
      args: [request.ipId],
    })
  }

  public async registrant(
    request: IpAssetRendererRegistrantRequest,
  ): Promise<IpAssetRendererRegistrantResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'registrant',
      args: [request.ipId],
    })
  }

  public async registrationDate(
    request: IpAssetRendererRegistrationDateRequest,
  ): Promise<IpAssetRendererRegistrationDateResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'registrationDate',
      args: [request.ipId],
    })
  }

  public async tokenUri(
    request: IpAssetRendererTokenUriRequest,
  ): Promise<IpAssetRendererTokenUriResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'tokenURI',
      args: [request.ipId],
    })
  }

  public async uri(
    request: IpAssetRendererUriRequest,
  ): Promise<IpAssetRendererUriResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRendererAbi,
      address: this.address,
      functionName: 'uri',
      args: [request.ipId],
    })
  }
}

// Contract IPMetadataProvider =============================================================
export type IpMetadataProviderIpAssetRegistryResponse = Address

export type IpMetadataProviderGetMetadataRequest = {
  ipId: Address
}
export type IpMetadataProviderGetMetadataResponse = Hex

export type IpMetadataProviderHashRequest = {
  ipId: Address
}
export type IpMetadataProviderHashResponse = Hex

export type IpMetadataProviderMetadataRequest = {
  ipId: Address
}
export type IpMetadataProviderMetadataResponse = {
  name: string
  hash: Hex
  registrationDate: bigint
  registrant: Address
  uri: string
}

export type IpMetadataProviderNameRequest = {
  ipId: Address
}
export type IpMetadataProviderNameResponse = string

export type IpMetadataProviderRegistrantRequest = {
  ipId: Address
}
export type IpMetadataProviderRegistrantResponse = Address

export type IpMetadataProviderRegistrationDateRequest = {
  ipId: Address
}
export type IpMetadataProviderRegistrationDateResponse = bigint

export type IpMetadataProviderUpgradeProviderResponse = Address

export type IpMetadataProviderUriRequest = {
  ipId: Address
}
export type IpMetadataProviderUriResponse = string

export type IpMetadataProviderSetMetadataRequest = {
  ipId: Address
  metadata: Hex
}

export type IpMetadataProviderSetUpgradeProviderRequest = {
  provider: Address
}

export type IpMetadataProviderUpgradeRequest = {
  ipId: Address
  metadata: Hex
}

export type IpMetadataProviderMetadataSetEvent = {
  ipId?: Address
  metadata?: Hex
}

export class IpMetadataProviderReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async ipAssetRegistry(): Promise<IpMetadataProviderIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'IP_ASSET_REGISTRY',
    })
  }

  public async getMetadata(
    request: IpMetadataProviderGetMetadataRequest,
  ): Promise<IpMetadataProviderGetMetadataResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'getMetadata',
      args: [request.ipId],
    })
  }

  public async hash(
    request: IpMetadataProviderHashRequest,
  ): Promise<IpMetadataProviderHashResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'hash',
      args: [request.ipId],
    })
  }

  public async metadata(
    request: IpMetadataProviderMetadataRequest,
  ): Promise<IpMetadataProviderMetadataResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'metadata',
      args: [request.ipId],
    })
  }

  public async name(
    request: IpMetadataProviderNameRequest,
  ): Promise<IpMetadataProviderNameResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'name',
      args: [request.ipId],
    })
  }

  public async registrant(
    request: IpMetadataProviderRegistrantRequest,
  ): Promise<IpMetadataProviderRegistrantResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'registrant',
      args: [request.ipId],
    })
  }

  public async registrationDate(
    request: IpMetadataProviderRegistrationDateRequest,
  ): Promise<IpMetadataProviderRegistrationDateResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'registrationDate',
      args: [request.ipId],
    })
  }

  public async upgradeProvider(): Promise<IpMetadataProviderUpgradeProviderResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'upgradeProvider',
    })
  }

  public async uri(
    request: IpMetadataProviderUriRequest,
  ): Promise<IpMetadataProviderUriResponse> {
    return await this.rpcClient.readContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'uri',
      args: [request.ipId],
    })
  }
}
export class IpMetadataProviderClient extends IpMetadataProviderReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async setMetadata(
    request: IpMetadataProviderSetMetadataRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'setMetadata',
      account: this.wallet.account,
      args: [request.ipId, request.metadata],
    })
    return await this.wallet.writeContract(call)
  }

  public async setUpgradeProvider(
    request: IpMetadataProviderSetUpgradeProviderRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'setUpgradeProvider',
      account: this.wallet.account,
      args: [request.provider],
    })
    return await this.wallet.writeContract(call)
  }

  public async upgrade(
    request: IpMetadataProviderUpgradeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipMetadataProviderAbi,
      address: this.address,
      functionName: 'upgrade',
      account: this.wallet.account,
      args: [request.ipId, request.metadata],
    })
    return await this.wallet.writeContract(call)
  }
}
export class IpMetadataProviderEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchMetadataSetEvent(
    onLogs: (txHash: Hex, ev: IpMetadataProviderMetadataSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipMetadataProviderAbi,
      address: this.address,
      eventName: 'MetadataSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract IPResolver =============================================================
export type IpResolverAccessControllerResponse = Address

export type IpResolverIpAccountRegistryResponse = Address

export type IpResolverNameResponse = string

export type IpResolverSupportsInterfaceRequest = {
  id: Hex
}
export type IpResolverSupportsInterfaceResponse = boolean

export type IpResolverValueRequest = {
  ipId: Address
  key: string
}
export type IpResolverValueResponse = string

export type IpResolverSetValueRequest = {
  ipId: Address
  key: string
  val: string
}

export type IpResolverKeyValueSetEvent = {
  ipId?: Address
  key?: string
  value?: string
}

export class IpResolverReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async accessController(): Promise<IpResolverAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: 'ACCESS_CONTROLLER',
    })
  }

  public async ipAccountRegistry(): Promise<IpResolverIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  public async name(): Promise<IpResolverNameResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async supportsInterface(
    request: IpResolverSupportsInterfaceRequest,
  ): Promise<IpResolverSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.id],
    })
  }

  public async value(
    request: IpResolverValueRequest,
  ): Promise<IpResolverValueResponse> {
    return await this.rpcClient.readContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: 'value',
      args: [request.ipId, request.key],
    })
  }
}
export class IpResolverClient extends IpResolverReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async setValue(
    request: IpResolverSetValueRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipResolverAbi,
      address: this.address,
      functionName: 'setValue',
      account: this.wallet.account,
      args: [request.ipId, request.key, request.val],
    })
    return await this.wallet.writeContract(call)
  }
}
export class IpResolverEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchKeyValueSetEvent(
    onLogs: (txHash: Hex, ev: IpResolverKeyValueSetEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipResolverAbi,
      address: this.address,
      eventName: 'KeyValueSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract LicenseRegistry =============================================================
export type LicenseRegistryDisputeModuleResponse = Address

export type LicenseRegistryLicensingModuleResponse = Address

export type LicenseRegistryBalanceOfRequest = {
  account: Address
  id: bigint
}
export type LicenseRegistryBalanceOfResponse = bigint

export type LicenseRegistryBalanceOfBatchRequest = {
  accounts: readonly Address[]
  ids: readonly bigint[]
}
export type LicenseRegistryBalanceOfBatchResponse = readonly bigint[]

export type LicenseRegistryGetGovernanceResponse = Address

export type LicenseRegistryGovernanceResponse = Address

export type LicenseRegistryImageUrlResponse = string

export type LicenseRegistryIsApprovedForAllRequest = {
  account: Address
  operator: Address
}
export type LicenseRegistryIsApprovedForAllResponse = boolean

export type LicenseRegistryIsLicenseRevokedRequest = {
  licenseId: bigint
}
export type LicenseRegistryIsLicenseRevokedResponse = boolean

export type LicenseRegistryIsLicenseeRequest = {
  licenseId: bigint
  holder: Address
}
export type LicenseRegistryIsLicenseeResponse = boolean

export type LicenseRegistryLicenseRequest = {
  licenseId: bigint
}
export type LicenseRegistryLicenseResponse = {
  policyId: bigint
  licensorIpId: Address
  transferable: boolean
}

export type LicenseRegistryLicensorIpIdRequest = {
  licenseId: bigint
}
export type LicenseRegistryLicensorIpIdResponse = Address

export type LicenseRegistryMintedLicensesResponse = bigint

export type LicenseRegistryNameResponse = string

export type LicenseRegistryPolicyIdForLicenseRequest = {
  licenseId: bigint
}
export type LicenseRegistryPolicyIdForLicenseResponse = bigint

export type LicenseRegistrySupportsInterfaceRequest = {
  interfaceId: Hex
}
export type LicenseRegistrySupportsInterfaceResponse = boolean

export type LicenseRegistrySymbolResponse = string

export type LicenseRegistryUriRequest = {
  id: bigint
}
export type LicenseRegistryUriResponse = string

export type LicenseRegistryBurnLicensesRequest = {
  holder: Address
  licenseIds: readonly bigint[]
}

export type LicenseRegistryMintLicenseRequest = {
  policyId: bigint
  licensorIpId_: Address
  transferable: boolean
  amount: bigint
  receiver: Address
}

export type LicenseRegistrySafeBatchTransferFromRequest = {
  from: Address
  to: Address
  ids: readonly bigint[]
  values: readonly bigint[]
  data: Hex
}

export type LicenseRegistrySafeTransferFromRequest = {
  from: Address
  to: Address
  id: bigint
  value: bigint
  data: Hex
}

export type LicenseRegistrySetApprovalForAllRequest = {
  operator: Address
  approved: boolean
}

export type LicenseRegistrySetDisputeModuleRequest = {
  newDisputeModule: Address
}

export type LicenseRegistrySetGovernanceRequest = {
  newGovernance: Address
}

export type LicenseRegistrySetLicensingImageUrlRequest = {
  url: string
}

export type LicenseRegistrySetLicensingModuleRequest = {
  newLicensingModule: Address
}

export type LicenseRegistryApprovalForAllEvent = {
  account?: Address
  operator?: Address
  approved?: boolean
}

export type LicenseRegistryBatchMetadataUpdateEvent = {
  _fromTokenId?: bigint
  _toTokenId?: bigint
}

export type LicenseRegistryGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type LicenseRegistryLicenseMintedEvent = {
  creator?: Address
  receiver?: Address
  licenseId?: bigint
  amount?: bigint
  licenseData?: {
    policyId: bigint
    licensorIpId: Address
    transferable: boolean
  }
}

export type LicenseRegistryTransferBatchEvent = {
  operator?: Address
  from?: Address
  to?: Address
  ids?: readonly bigint[]
  values?: readonly bigint[]
}

export type LicenseRegistryTransferSingleEvent = {
  operator?: Address
  from?: Address
  to?: Address
  id?: bigint
  value?: bigint
}

export type LicenseRegistryUriEvent = {
  value?: string
  id?: bigint
}

export class LicenseRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async disputeModule(): Promise<LicenseRegistryDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'DISPUTE_MODULE',
    })
  }

  public async licensingModule(): Promise<LicenseRegistryLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'LICENSING_MODULE',
    })
  }

  public async balanceOf(
    request: LicenseRegistryBalanceOfRequest,
  ): Promise<LicenseRegistryBalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'balanceOf',
      args: [request.account, request.id],
    })
  }

  public async balanceOfBatch(
    request: LicenseRegistryBalanceOfBatchRequest,
  ): Promise<LicenseRegistryBalanceOfBatchResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'balanceOfBatch',
      args: [request.accounts, request.ids],
    })
  }

  public async getGovernance(): Promise<LicenseRegistryGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async governance(): Promise<LicenseRegistryGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'governance',
    })
  }

  public async imageUrl(): Promise<LicenseRegistryImageUrlResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'imageUrl',
    })
  }

  public async isApprovedForAll(
    request: LicenseRegistryIsApprovedForAllRequest,
  ): Promise<LicenseRegistryIsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isApprovedForAll',
      args: [request.account, request.operator],
    })
  }

  public async isLicenseRevoked(
    request: LicenseRegistryIsLicenseRevokedRequest,
  ): Promise<LicenseRegistryIsLicenseRevokedResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isLicenseRevoked',
      args: [request.licenseId],
    })
  }

  public async isLicensee(
    request: LicenseRegistryIsLicenseeRequest,
  ): Promise<LicenseRegistryIsLicenseeResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isLicensee',
      args: [request.licenseId, request.holder],
    })
  }

  public async license(
    request: LicenseRegistryLicenseRequest,
  ): Promise<LicenseRegistryLicenseResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'license',
      args: [request.licenseId],
    })
  }

  public async licensorIpId(
    request: LicenseRegistryLicensorIpIdRequest,
  ): Promise<LicenseRegistryLicensorIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'licensorIpId',
      args: [request.licenseId],
    })
  }

  public async mintedLicenses(): Promise<LicenseRegistryMintedLicensesResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'mintedLicenses',
    })
  }

  public async name(): Promise<LicenseRegistryNameResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async policyIdForLicense(
    request: LicenseRegistryPolicyIdForLicenseRequest,
  ): Promise<LicenseRegistryPolicyIdForLicenseResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'policyIdForLicense',
      args: [request.licenseId],
    })
  }

  public async supportsInterface(
    request: LicenseRegistrySupportsInterfaceRequest,
  ): Promise<LicenseRegistrySupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  public async symbol(): Promise<LicenseRegistrySymbolResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'symbol',
    })
  }

  public async uri(
    request: LicenseRegistryUriRequest,
  ): Promise<LicenseRegistryUriResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'uri',
      args: [request.id],
    })
  }
}
export class LicenseRegistryClient extends LicenseRegistryReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async burnLicenses(
    request: LicenseRegistryBurnLicensesRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'burnLicenses',
      account: this.wallet.account,
      args: [request.holder, request.licenseIds],
    })
    return await this.wallet.writeContract(call)
  }

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

  public async safeBatchTransferFrom(
    request: LicenseRegistrySafeBatchTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'safeBatchTransferFrom',
      account: this.wallet.account,
      args: [
        request.from,
        request.to,
        request.ids,
        request.values,
        request.data,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async safeTransferFrom(
    request: LicenseRegistrySafeTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'safeTransferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.id, request.value, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async setApprovalForAll(
    request: LicenseRegistrySetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setApprovalForAll',
      account: this.wallet.account,
      args: [request.operator, request.approved],
    })
    return await this.wallet.writeContract(call)
  }

  public async setDisputeModule(
    request: LicenseRegistrySetDisputeModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setDisputeModule',
      account: this.wallet.account,
      args: [request.newDisputeModule],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: LicenseRegistrySetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }

  public async setLicensingImageUrl(
    request: LicenseRegistrySetLicensingImageUrlRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setLicensingImageUrl',
      account: this.wallet.account,
      args: [request.url],
    })
    return await this.wallet.writeContract(call)
  }

  public async setLicensingModule(
    request: LicenseRegistrySetLicensingModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setLicensingModule',
      account: this.wallet.account,
      args: [request.newLicensingModule],
    })
    return await this.wallet.writeContract(call)
  }
}
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

  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryApprovalForAllEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'ApprovalForAll',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchBatchMetadataUpdateEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryBatchMetadataUpdateEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'BatchMetadataUpdate',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchLicenseMintedEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryLicenseMintedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'LicenseMinted',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchTransferBatchEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryTransferBatchEvent) => void,
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

  public watchTransferSingleEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryTransferSingleEvent) => void,
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

  public watchUriEvent(
    onLogs: (txHash: Hex, ev: LicenseRegistryUriEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'URI',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract LicensingModule =============================================================
export type LicensingModuleAccessControllerResponse = Address

export type LicensingModuleDisputeModuleResponse = Address

export type LicensingModuleIpAccountRegistryResponse = Address

export type LicensingModuleLicenseRegistryResponse = Address

export type LicensingModuleRoyaltyModuleResponse = Address

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
export type LicensingModuleGetPolicyIdResponse = {
  policyId: bigint
}

export type LicensingModuleIsFrameworkRegisteredRequest = {
  policyFramework: Address
}
export type LicensingModuleIsFrameworkRegisteredResponse = boolean

export type LicensingModuleIsParentRequest = {
  parentIpId: Address
  childIpId: Address
}
export type LicensingModuleIsParentResponse = boolean

export type LicensingModuleIsPolicyDefinedRequest = {
  policyId: bigint
}
export type LicensingModuleIsPolicyDefinedResponse = boolean

export type LicensingModuleIsPolicyIdSetForIpRequest = {
  isInherited: boolean
  ipId: Address
  policyId: bigint
}
export type LicensingModuleIsPolicyIdSetForIpResponse = boolean

export type LicensingModuleIsPolicyInheritedRequest = {
  ipId: Address
  policyId: bigint
}
export type LicensingModuleIsPolicyInheritedResponse = boolean

export type LicensingModuleNameResponse = string

export type LicensingModuleParentIpIdsRequest = {
  ipId: Address
}
export type LicensingModuleParentIpIdsResponse = readonly Address[]

export type LicensingModulePolicyRequest = {
  policyId: bigint
}
export type LicensingModulePolicyResponse = {
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

export type LicensingModulePolicyAggregatorDataRequest = {
  framework: Address
  ipId: Address
}
export type LicensingModulePolicyAggregatorDataResponse = Hex

export type LicensingModulePolicyForIpAtIndexRequest = {
  isInherited: boolean
  ipId: Address
  index: bigint
}
export type LicensingModulePolicyForIpAtIndexResponse = {
  isLicenseTransferable: boolean
  policyFramework: Address
  frameworkData: Hex
  royaltyPolicy: Address
  royaltyData: Hex
  mintingFee: bigint
  mintingFeeToken: Address
}

export type LicensingModulePolicyIdForIpAtIndexRequest = {
  isInherited: boolean
  ipId: Address
  index: bigint
}
export type LicensingModulePolicyIdForIpAtIndexResponse = {
  policyId: bigint
}

export type LicensingModulePolicyIdsForIpRequest = {
  isInherited: boolean
  ipId: Address
}
export type LicensingModulePolicyIdsForIpResponse = {
  policyIds: readonly bigint[]
}

export type LicensingModulePolicyStatusRequest = {
  ipId: Address
  policyId: bigint
}
export type LicensingModulePolicyStatusResponse = {
  index: bigint
  isInherited: boolean
  active: boolean
}

export type LicensingModuleSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type LicensingModuleSupportsInterfaceResponse = boolean

export type LicensingModuleTotalParentsForIpIdRequest = {
  ipId: Address
}
export type LicensingModuleTotalParentsForIpIdResponse = bigint

export type LicensingModuleTotalPoliciesResponse = bigint

export type LicensingModuleTotalPoliciesForIpRequest = {
  isInherited: boolean
  ipId: Address
}
export type LicensingModuleTotalPoliciesForIpResponse = bigint

export type LicensingModuleAddPolicyToIpRequest = {
  ipId: Address
  polId: bigint
}

export type LicensingModuleLinkIpToParentsRequest = {
  licenseIds: readonly bigint[]
  childIpId: Address
  royaltyContext: Hex
}

export type LicensingModuleMintLicenseRequest = {
  policyId: bigint
  licensorIpId: Address
  amount: bigint
  receiver: Address
  royaltyContext: Hex
}

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

export type LicensingModuleRegisterPolicyFrameworkManagerRequest = {
  manager: Address
}

export type LicensingModuleIpIdLinkedToParentsEvent = {
  caller?: Address
  ipId?: Address
  parentIpIds?: readonly Address[]
}

export type LicensingModulePolicyAddedToIpIdEvent = {
  caller?: Address
  ipId?: Address
  policyId?: bigint
  index?: bigint
  isInherited?: boolean
}

export type LicensingModulePolicyFrameworkRegisteredEvent = {
  framework?: Address
  name?: string
  licenseTextUrl?: string
}

export type LicensingModulePolicyRegisteredEvent = {
  policyId?: bigint
  policyFrameworkManager?: Address
  frameworkData?: Hex
  royaltyPolicy?: Address
  royaltyData?: Hex
  mintingFee?: bigint
  mintingFeeToken?: Address
}

export class LicensingModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x2A88056985814dcBb72aFA50B95893359B6262f5',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async accessController(): Promise<LicensingModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'ACCESS_CONTROLLER',
    })
  }

  public async disputeModule(): Promise<LicensingModuleDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'DISPUTE_MODULE',
    })
  }

  public async ipAccountRegistry(): Promise<LicensingModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  public async licenseRegistry(): Promise<LicensingModuleLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'LICENSE_REGISTRY',
    })
  }

  public async royaltyModule(): Promise<LicensingModuleRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'ROYALTY_MODULE',
    })
  }

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

  public async isFrameworkRegistered(
    request: LicensingModuleIsFrameworkRegisteredRequest,
  ): Promise<LicensingModuleIsFrameworkRegisteredResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'isFrameworkRegistered',
      args: [request.policyFramework],
    })
  }

  public async isParent(
    request: LicensingModuleIsParentRequest,
  ): Promise<LicensingModuleIsParentResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'isParent',
      args: [request.parentIpId, request.childIpId],
    })
  }

  public async isPolicyDefined(
    request: LicensingModuleIsPolicyDefinedRequest,
  ): Promise<LicensingModuleIsPolicyDefinedResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'isPolicyDefined',
      args: [request.policyId],
    })
  }

  public async isPolicyIdSetForIp(
    request: LicensingModuleIsPolicyIdSetForIpRequest,
  ): Promise<LicensingModuleIsPolicyIdSetForIpResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'isPolicyIdSetForIp',
      args: [request.isInherited, request.ipId, request.policyId],
    })
  }

  public async isPolicyInherited(
    request: LicensingModuleIsPolicyInheritedRequest,
  ): Promise<LicensingModuleIsPolicyInheritedResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'isPolicyInherited',
      args: [request.ipId, request.policyId],
    })
  }

  public async name(): Promise<LicensingModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async parentIpIds(
    request: LicensingModuleParentIpIdsRequest,
  ): Promise<LicensingModuleParentIpIdsResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'parentIpIds',
      args: [request.ipId],
    })
  }

  public async policy(
    request: LicensingModulePolicyRequest,
  ): Promise<LicensingModulePolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'policy',
      args: [request.policyId],
    })
    return {
      pol: result,
    }
  }

  public async policyAggregatorData(
    request: LicensingModulePolicyAggregatorDataRequest,
  ): Promise<LicensingModulePolicyAggregatorDataResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'policyAggregatorData',
      args: [request.framework, request.ipId],
    })
  }

  public async policyForIpAtIndex(
    request: LicensingModulePolicyForIpAtIndexRequest,
  ): Promise<LicensingModulePolicyForIpAtIndexResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'policyForIpAtIndex',
      args: [request.isInherited, request.ipId, request.index],
    })
  }

  public async policyIdForIpAtIndex(
    request: LicensingModulePolicyIdForIpAtIndexRequest,
  ): Promise<LicensingModulePolicyIdForIpAtIndexResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'policyIdForIpAtIndex',
      args: [request.isInherited, request.ipId, request.index],
    })
    return {
      policyId: result,
    }
  }

  public async policyIdsForIp(
    request: LicensingModulePolicyIdsForIpRequest,
  ): Promise<LicensingModulePolicyIdsForIpResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'policyIdsForIp',
      args: [request.isInherited, request.ipId],
    })
    return {
      policyIds: result,
    }
  }

  public async policyStatus(
    request: LicensingModulePolicyStatusRequest,
  ): Promise<LicensingModulePolicyStatusResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'policyStatus',
      args: [request.ipId, request.policyId],
    })
    return {
      index: result[0],
      isInherited: result[1],
      active: result[2],
    }
  }

  public async supportsInterface(
    request: LicensingModuleSupportsInterfaceRequest,
  ): Promise<LicensingModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  public async totalParentsForIpId(
    request: LicensingModuleTotalParentsForIpIdRequest,
  ): Promise<LicensingModuleTotalParentsForIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'totalParentsForIpId',
      args: [request.ipId],
    })
  }

  public async totalPolicies(): Promise<LicensingModuleTotalPoliciesResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'totalPolicies',
    })
  }

  public async totalPoliciesForIp(
    request: LicensingModuleTotalPoliciesForIpRequest,
  ): Promise<LicensingModuleTotalPoliciesForIpResponse> {
    return await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'totalPoliciesForIp',
      args: [request.isInherited, request.ipId],
    })
  }
}
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

  public async registerPolicyFrameworkManager(
    request: LicensingModuleRegisterPolicyFrameworkManagerRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'registerPolicyFrameworkManager',
      account: this.wallet.account,
      args: [request.manager],
    })
    return await this.wallet.writeContract(call)
  }
}
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

  public watchIpIdLinkedToParentsEvent(
    onLogs: (txHash: Hex, ev: LicensingModuleIpIdLinkedToParentsEvent) => void,
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

  public watchPolicyAddedToIpIdEvent(
    onLogs: (txHash: Hex, ev: LicensingModulePolicyAddedToIpIdEvent) => void,
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

  public watchPolicyFrameworkRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: LicensingModulePolicyFrameworkRegisteredEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: 'PolicyFrameworkRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchPolicyRegisteredEvent(
    onLogs: (txHash: Hex, ev: LicensingModulePolicyRegisteredEvent) => void,
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
}

// Contract MockERC20 =============================================================
export type MockErc20AllowanceRequest = {
  owner: Address
  spender: Address
}
export type MockErc20AllowanceResponse = bigint

export type MockErc20BalanceOfRequest = {
  account: Address
}
export type MockErc20BalanceOfResponse = bigint

export type MockErc20DecimalsResponse = number

export type MockErc20NameResponse = string

export type MockErc20SymbolResponse = string

export type MockErc20TotalSupplyResponse = bigint

export type MockErc20ApproveRequest = {
  spender: Address
  value: bigint
}

export type MockErc20BurnRequest = {
  from: Address
  amount: bigint
}

export type MockErc20MintRequest = {
  to: Address
  amount: bigint
}

export type MockErc20TransferRequest = {
  to: Address
  value: bigint
}

export type MockErc20TransferFromRequest = {
  from: Address
  to: Address
  value: bigint
}

export type MockErc20ApprovalEvent = {
  owner?: Address
  spender?: Address
  value?: bigint
}

export type MockErc20TransferEvent = {
  from?: Address
  to?: Address
  value?: bigint
}

export class MockErc20ReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x3271778AdE44EfeC9e11b7160827921b6d614AF1',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async allowance(
    request: MockErc20AllowanceRequest,
  ): Promise<MockErc20AllowanceResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'allowance',
      args: [request.owner, request.spender],
    })
  }

  public async balanceOf(
    request: MockErc20BalanceOfRequest,
  ): Promise<MockErc20BalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'balanceOf',
      args: [request.account],
    })
  }

  public async decimals(): Promise<MockErc20DecimalsResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'decimals',
    })
  }

  public async name(): Promise<MockErc20NameResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async symbol(): Promise<MockErc20SymbolResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'symbol',
    })
  }

  public async totalSupply(): Promise<MockErc20TotalSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'totalSupply',
    })
  }
}
export class MockErc20Client extends MockErc20ReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x3271778AdE44EfeC9e11b7160827921b6d614AF1',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async approve(
    request: MockErc20ApproveRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'approve',
      account: this.wallet.account,
      args: [request.spender, request.value],
    })
    return await this.wallet.writeContract(call)
  }

  public async burn(
    request: MockErc20BurnRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'burn',
      account: this.wallet.account,
      args: [request.from, request.amount],
    })
    return await this.wallet.writeContract(call)
  }

  public async mint(
    request: MockErc20MintRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'mint',
      account: this.wallet.account,
      args: [request.to, request.amount],
    })
    return await this.wallet.writeContract(call)
  }

  public async transfer(
    request: MockErc20TransferRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'transfer',
      account: this.wallet.account,
      args: [request.to, request.value],
    })
    return await this.wallet.writeContract(call)
  }

  public async transferFrom(
    request: MockErc20TransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: 'transferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.value],
    })
    return await this.wallet.writeContract(call)
  }
}
export class MockErc20EventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x3271778AdE44EfeC9e11b7160827921b6d614AF1',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchApprovalEvent(
    onLogs: (txHash: Hex, ev: MockErc20ApprovalEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc20Abi,
      address: this.address,
      eventName: 'Approval',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchTransferEvent(
    onLogs: (txHash: Hex, ev: MockErc20TransferEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc20Abi,
      address: this.address,
      eventName: 'Transfer',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract MockERC721 =============================================================
export type MockErc721BalanceOfRequest = {
  owner: Address
}
export type MockErc721BalanceOfResponse = bigint

export type MockErc721GetApprovedRequest = {
  tokenId: bigint
}
export type MockErc721GetApprovedResponse = Address

export type MockErc721IsApprovedForAllRequest = {
  owner: Address
  operator: Address
}
export type MockErc721IsApprovedForAllResponse = boolean

export type MockErc721NameResponse = string

export type MockErc721OwnerOfRequest = {
  tokenId: bigint
}
export type MockErc721OwnerOfResponse = Address

export type MockErc721SupportsInterfaceRequest = {
  interfaceId: Hex
}
export type MockErc721SupportsInterfaceResponse = boolean

export type MockErc721SymbolResponse = string

export type MockErc721TokenUriRequest = {
  tokenId: bigint
}
export type MockErc721TokenUriResponse = string

export type MockErc721ApproveRequest = {
  to: Address
  tokenId: bigint
}

export type MockErc721BurnRequest = {
  tokenId: bigint
}

export type MockErc721MintRequest = {
  to: Address
}

export type MockErc721MintIdRequest = {
  to: Address
  tokenId: bigint
}

export type MockErc721SafeTransferFromRequest = {
  from: Address
  to: Address
  tokenId: bigint
}

export type MockErc721SafeTransferFrom2Request = {
  from: Address
  to: Address
  tokenId: bigint
  data: Hex
}

export type MockErc721SetApprovalForAllRequest = {
  operator: Address
  approved: boolean
}

export type MockErc721TransferFromRequest = {
  from: Address
  to: Address
  tokenId: bigint
}

export type MockErc721ApprovalEvent = {
  owner?: Address
  approved?: Address
  tokenId?: bigint
}

export type MockErc721ApprovalForAllEvent = {
  owner?: Address
  operator?: Address
  approved?: boolean
}

export type MockErc721TransferEvent = {
  from?: Address
  to?: Address
  tokenId?: bigint
}

export class MockErc721ReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async balanceOf(
    request: MockErc721BalanceOfRequest,
  ): Promise<MockErc721BalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'balanceOf',
      args: [request.owner],
    })
  }

  public async getApproved(
    request: MockErc721GetApprovedRequest,
  ): Promise<MockErc721GetApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'getApproved',
      args: [request.tokenId],
    })
  }

  public async isApprovedForAll(
    request: MockErc721IsApprovedForAllRequest,
  ): Promise<MockErc721IsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'isApprovedForAll',
      args: [request.owner, request.operator],
    })
  }

  public async name(): Promise<MockErc721NameResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async ownerOf(
    request: MockErc721OwnerOfRequest,
  ): Promise<MockErc721OwnerOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'ownerOf',
      args: [request.tokenId],
    })
  }

  public async supportsInterface(
    request: MockErc721SupportsInterfaceRequest,
  ): Promise<MockErc721SupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  public async symbol(): Promise<MockErc721SymbolResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'symbol',
    })
  }

  public async tokenUri(
    request: MockErc721TokenUriRequest,
  ): Promise<MockErc721TokenUriResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'tokenURI',
      args: [request.tokenId],
    })
  }
}
export class MockErc721Client extends MockErc721ReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async approve(
    request: MockErc721ApproveRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'approve',
      account: this.wallet.account,
      args: [request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }

  public async burn(
    request: MockErc721BurnRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'burn',
      account: this.wallet.account,
      args: [request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }

  public async mint(
    request: MockErc721MintRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'mint',
      account: this.wallet.account,
      args: [request.to],
    })
    return await this.wallet.writeContract(call)
  }

  public async mintId(
    request: MockErc721MintIdRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'mintId',
      account: this.wallet.account,
      args: [request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }

  public async safeTransferFrom(
    request: MockErc721SafeTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'safeTransferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }

  public async safeTransferFrom2(
    request: MockErc721SafeTransferFrom2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'safeTransferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId, request.data],
    })
    return await this.wallet.writeContract(call)
  }

  public async setApprovalForAll(
    request: MockErc721SetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'setApprovalForAll',
      account: this.wallet.account,
      args: [request.operator, request.approved],
    })
    return await this.wallet.writeContract(call)
  }

  public async transferFrom(
    request: MockErc721TransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc721Abi,
      address: this.address,
      functionName: 'transferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }
}
export class MockErc721EventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchApprovalEvent(
    onLogs: (txHash: Hex, ev: MockErc721ApprovalEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc721Abi,
      address: this.address,
      eventName: 'Approval',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: MockErc721ApprovalForAllEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc721Abi,
      address: this.address,
      eventName: 'ApprovalForAll',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchTransferEvent(
    onLogs: (txHash: Hex, ev: MockErc721TransferEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc721Abi,
      address: this.address,
      eventName: 'Transfer',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract MockTokenGatedHook =============================================================
export type MockTokenGatedHookNameResponse = string

export type MockTokenGatedHookSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type MockTokenGatedHookSupportsInterfaceResponse = boolean

export type MockTokenGatedHookValidateConfigRequest = {
  configData: Hex
}

export type MockTokenGatedHookVerifyRequest = {
  caller: Address
  data: Hex
}
export type MockTokenGatedHookVerifyResponse = boolean

export class MockTokenGatedHookReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x008B5D8Db85100E143729453784e9F077B2279fA',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async name(): Promise<MockTokenGatedHookNameResponse> {
    return await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async supportsInterface(
    request: MockTokenGatedHookSupportsInterfaceRequest,
  ): Promise<MockTokenGatedHookSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  public async validateConfig(
    request: MockTokenGatedHookValidateConfigRequest,
  ): Promise<void> {
    await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: 'validateConfig',
      args: [request.configData],
    })
  }

  public async verify(
    request: MockTokenGatedHookVerifyRequest,
  ): Promise<MockTokenGatedHookVerifyResponse> {
    return await this.rpcClient.readContract({
      abi: mockTokenGatedHookAbi,
      address: this.address,
      functionName: 'verify',
      args: [request.caller, request.data],
    })
  }
}

// Contract ModuleRegistry =============================================================
export type ModuleRegistryGetGovernanceResponse = Address

export type ModuleRegistryGetModuleRequest = {
  name: string
}
export type ModuleRegistryGetModuleResponse = Address

export type ModuleRegistryGetModuleTypeRequest = {
  moduleAddress: Address
}
export type ModuleRegistryGetModuleTypeResponse = string

export type ModuleRegistryGetModuleTypeInterfaceIdRequest = {
  moduleType: string
}
export type ModuleRegistryGetModuleTypeInterfaceIdResponse = Hex

export type ModuleRegistryGovernanceResponse = Address

export type ModuleRegistryIsRegisteredRequest = {
  moduleAddress: Address
}
export type ModuleRegistryIsRegisteredResponse = boolean

export type ModuleRegistryRegisterModuleRequest = {
  name: string
  moduleAddress: Address
}

export type ModuleRegistryRegisterModule2Request = {
  name: string
  moduleAddress: Address
  moduleType: string
}

export type ModuleRegistryRegisterModuleTypeRequest = {
  name: string
  interfaceId: Hex
}

export type ModuleRegistryRemoveModuleRequest = {
  name: string
}

export type ModuleRegistryRemoveModuleTypeRequest = {
  name: string
}

export type ModuleRegistrySetGovernanceRequest = {
  newGovernance: Address
}

export type ModuleRegistryGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type ModuleRegistryModuleAddedEvent = {
  name?: string
  module?: Address
  moduleTypeInterfaceId?: Hex
  moduleType?: string
}

export type ModuleRegistryModuleRemovedEvent = {
  name?: string
  module?: Address
}

export class ModuleRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async getGovernance(): Promise<ModuleRegistryGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async getModule(
    request: ModuleRegistryGetModuleRequest,
  ): Promise<ModuleRegistryGetModuleResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'getModule',
      args: [request.name],
    })
  }

  public async getModuleType(
    request: ModuleRegistryGetModuleTypeRequest,
  ): Promise<ModuleRegistryGetModuleTypeResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'getModuleType',
      args: [request.moduleAddress],
    })
  }

  public async getModuleTypeInterfaceId(
    request: ModuleRegistryGetModuleTypeInterfaceIdRequest,
  ): Promise<ModuleRegistryGetModuleTypeInterfaceIdResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'getModuleTypeInterfaceId',
      args: [request.moduleType],
    })
  }

  public async governance(): Promise<ModuleRegistryGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'governance',
    })
  }

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
export class ModuleRegistryClient extends ModuleRegistryReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async registerModule(
    request: ModuleRegistryRegisterModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'registerModule',
      account: this.wallet.account,
      args: [request.name, request.moduleAddress],
    })
    return await this.wallet.writeContract(call)
  }

  public async registerModule2(
    request: ModuleRegistryRegisterModule2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'registerModule',
      account: this.wallet.account,
      args: [request.name, request.moduleAddress, request.moduleType],
    })
    return await this.wallet.writeContract(call)
  }

  public async registerModuleType(
    request: ModuleRegistryRegisterModuleTypeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'registerModuleType',
      account: this.wallet.account,
      args: [request.name, request.interfaceId],
    })
    return await this.wallet.writeContract(call)
  }

  public async removeModule(
    request: ModuleRegistryRemoveModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'removeModule',
      account: this.wallet.account,
      args: [request.name],
    })
    return await this.wallet.writeContract(call)
  }

  public async removeModuleType(
    request: ModuleRegistryRemoveModuleTypeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'removeModuleType',
      account: this.wallet.account,
      args: [request.name],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: ModuleRegistrySetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: moduleRegistryAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }
}
export class ModuleRegistryEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: ModuleRegistryGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: moduleRegistryAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchModuleAddedEvent(
    onLogs: (txHash: Hex, ev: ModuleRegistryModuleAddedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: moduleRegistryAbi,
      address: this.address,
      eventName: 'ModuleAdded',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchModuleRemovedEvent(
    onLogs: (txHash: Hex, ev: ModuleRegistryModuleRemovedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: moduleRegistryAbi,
      address: this.address,
      eventName: 'ModuleRemoved',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract PILPolicyFrameworkManager =============================================================
export type PilPolicyFrameworkManagerAccessControllerResponse = Address

export type PilPolicyFrameworkManagerIpAccountRegistryResponse = Address

export type PilPolicyFrameworkManagerLicenseRegistryResponse = Address

export type PilPolicyFrameworkManagerLicensingModuleResponse = Address

export type PilPolicyFrameworkManagerGetAggregatorRequest = {
  ipId: Address
}
export type PilPolicyFrameworkManagerGetAggregatorResponse = {
  rights: {
    commercial: boolean
    derivativesReciprocal: boolean
    lastPolicyId: bigint
    territoriesAcc: Hex
    distributionChannelsAcc: Hex
    contentRestrictionsAcc: Hex
  }
}

export type PilPolicyFrameworkManagerGetPilPolicyRequest = {
  policyId: bigint
}
export type PilPolicyFrameworkManagerGetPilPolicyResponse = {
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

export type PilPolicyFrameworkManagerIsDerivativeApprovedRequest = {
  licenseId: bigint
  childIpId: Address
}
export type PilPolicyFrameworkManagerIsDerivativeApprovedResponse = boolean

export type PilPolicyFrameworkManagerLicenseTextUrlResponse = string

export type PilPolicyFrameworkManagerNameResponse = string

export type PilPolicyFrameworkManagerPolicyToJsonRequest = {
  policyData: Hex
}
export type PilPolicyFrameworkManagerPolicyToJsonResponse = string

export type PilPolicyFrameworkManagerProcessInheritedPoliciesRequest = {
  aggregator: Hex
  policyId: bigint
  policy: Hex
}
export type PilPolicyFrameworkManagerProcessInheritedPoliciesResponse = {
  changedAgg: boolean
  newAggregator: Hex
}

export type PilPolicyFrameworkManagerSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type PilPolicyFrameworkManagerSupportsInterfaceResponse = boolean

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

export type PilPolicyFrameworkManagerSetApprovalRequest = {
  licenseId: bigint
  childIpId: Address
  approved: boolean
}

export type PilPolicyFrameworkManagerVerifyLinkRequest = {
  licenseId: bigint
  licensee: Address
  ipId: Address
  parentIpId: Address
  policyData: Hex
}

export type PilPolicyFrameworkManagerVerifyMintRequest = {
  licensee: Address
  mintingFromADerivative: boolean
  licensorIpId: Address
  receiver: Address
  mintAmount: bigint
  policyData: Hex
}

export type PilPolicyFrameworkManagerDerivativeApprovedEvent = {
  licenseId?: bigint
  ipId?: Address
  caller?: Address
  approved?: boolean
}

export class PilPolicyFrameworkManagerReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xAc2C50Af31501370366D243FaeC56F89128f6d96',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async accessController(): Promise<PilPolicyFrameworkManagerAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'ACCESS_CONTROLLER',
    })
  }

  public async ipAccountRegistry(): Promise<PilPolicyFrameworkManagerIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  public async licenseRegistry(): Promise<PilPolicyFrameworkManagerLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'LICENSE_REGISTRY',
    })
  }

  public async licensingModule(): Promise<PilPolicyFrameworkManagerLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'LICENSING_MODULE',
    })
  }

  public async getAggregator(
    request: PilPolicyFrameworkManagerGetAggregatorRequest,
  ): Promise<PilPolicyFrameworkManagerGetAggregatorResponse> {
    const result = await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'getAggregator',
      args: [request.ipId],
    })
    return {
      rights: result,
    }
  }

  public async getPilPolicy(
    request: PilPolicyFrameworkManagerGetPilPolicyRequest,
  ): Promise<PilPolicyFrameworkManagerGetPilPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'getPILPolicy',
      args: [request.policyId],
    })
    return {
      policy: result,
    }
  }

  public async isDerivativeApproved(
    request: PilPolicyFrameworkManagerIsDerivativeApprovedRequest,
  ): Promise<PilPolicyFrameworkManagerIsDerivativeApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'isDerivativeApproved',
      args: [request.licenseId, request.childIpId],
    })
  }

  public async licenseTextUrl(): Promise<PilPolicyFrameworkManagerLicenseTextUrlResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'licenseTextUrl',
    })
  }

  public async name(): Promise<PilPolicyFrameworkManagerNameResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async policyToJson(
    request: PilPolicyFrameworkManagerPolicyToJsonRequest,
  ): Promise<PilPolicyFrameworkManagerPolicyToJsonResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'policyToJson',
      args: [request.policyData],
    })
  }

  public async processInheritedPolicies(
    request: PilPolicyFrameworkManagerProcessInheritedPoliciesRequest,
  ): Promise<PilPolicyFrameworkManagerProcessInheritedPoliciesResponse> {
    const result = await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'processInheritedPolicies',
      args: [request.aggregator, request.policyId, request.policy],
    })
    return {
      changedAgg: result[0],
      newAggregator: result[1],
    }
  }

  public async supportsInterface(
    request: PilPolicyFrameworkManagerSupportsInterfaceRequest,
  ): Promise<PilPolicyFrameworkManagerSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class PilPolicyFrameworkManagerClient extends PilPolicyFrameworkManagerReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xAc2C50Af31501370366D243FaeC56F89128f6d96',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

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

  public async setApproval(
    request: PilPolicyFrameworkManagerSetApprovalRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'setApproval',
      account: this.wallet.account,
      args: [request.licenseId, request.childIpId, request.approved],
    })
    return await this.wallet.writeContract(call)
  }

  public async verifyLink(
    request: PilPolicyFrameworkManagerVerifyLinkRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'verifyLink',
      account: this.wallet.account,
      args: [
        request.licenseId,
        request.licensee,
        request.ipId,
        request.parentIpId,
        request.policyData,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async verifyMint(
    request: PilPolicyFrameworkManagerVerifyMintRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      functionName: 'verifyMint',
      account: this.wallet.account,
      args: [
        request.licensee,
        request.mintingFromADerivative,
        request.licensorIpId,
        request.receiver,
        request.mintAmount,
        request.policyData,
      ],
    })
    return await this.wallet.writeContract(call)
  }
}
export class PilPolicyFrameworkManagerEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xAc2C50Af31501370366D243FaeC56F89128f6d96',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchDerivativeApprovedEvent(
    onLogs: (
      txHash: Hex,
      ev: PilPolicyFrameworkManagerDerivativeApprovedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: pilPolicyFrameworkManagerAbi,
      address: this.address,
      eventName: 'DerivativeApproved',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract RegistrationModule =============================================================
export type RegistrationModuleIpResolverResponse = Address

export type RegistrationModuleNameResponse = string

export type RegistrationModuleSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type RegistrationModuleSupportsInterfaceResponse = boolean

export type RegistrationModuleRegisterDerivativeIpRequest = {
  licenseIds: readonly bigint[]
  tokenContract: Address
  tokenId: bigint
  ipName: string
  contentHash: Hex
  externalURL: string
  royaltyContext: Hex
}

export type RegistrationModuleRegisterRootIpRequest = {
  policyId: bigint
  tokenContract: Address
  tokenId: bigint
  ipName: string
  contentHash: Hex
  externalURL: string
}

export type RegistrationModuleDerivativeIpRegisteredEvent = {
  caller?: Address
  ipId?: Address
  licenseIds?: readonly bigint[]
}

export type RegistrationModuleRootIpRegisteredEvent = {
  caller?: Address
  ipId?: Address
  policyId?: bigint
}

export class RegistrationModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async ipResolver(): Promise<RegistrationModuleIpResolverResponse> {
    return await this.rpcClient.readContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: 'ipResolver',
    })
  }

  public async name(): Promise<RegistrationModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async supportsInterface(
    request: RegistrationModuleSupportsInterfaceRequest,
  ): Promise<RegistrationModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class RegistrationModuleClient extends RegistrationModuleReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async registerDerivativeIp(
    request: RegistrationModuleRegisterDerivativeIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: 'registerDerivativeIp',
      account: this.wallet.account,
      args: [
        request.licenseIds,
        request.tokenContract,
        request.tokenId,
        request.ipName,
        request.contentHash,
        request.externalURL,
        request.royaltyContext,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async registerRootIp(
    request: RegistrationModuleRegisterRootIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationModuleAbi,
      address: this.address,
      functionName: 'registerRootIp',
      account: this.wallet.account,
      args: [
        request.policyId,
        request.tokenContract,
        request.tokenId,
        request.ipName,
        request.contentHash,
        request.externalURL,
      ],
    })
    return await this.wallet.writeContract(call)
  }
}
export class RegistrationModuleEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchDerivativeIpRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: RegistrationModuleDerivativeIpRegisteredEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: registrationModuleAbi,
      address: this.address,
      eventName: 'DerivativeIPRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchRootIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: RegistrationModuleRootIpRegisteredEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: registrationModuleAbi,
      address: this.address,
      eventName: 'RootIPRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract RoyaltyModule =============================================================
export type RoyaltyModuleLicensingModuleResponse = Address

export type RoyaltyModuleGetGovernanceResponse = Address

export type RoyaltyModuleGovernanceResponse = Address

export type RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest = {
  royaltyPolicy: Address
}
export type RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse = {
  isWhitelisted: boolean
}

export type RoyaltyModuleIsWhitelistedRoyaltyTokenRequest = {
  token: Address
}
export type RoyaltyModuleIsWhitelistedRoyaltyTokenResponse = boolean

export type RoyaltyModuleNameResponse = string

export type RoyaltyModuleRoyaltyPoliciesRequest = {
  ipId: Address
}
export type RoyaltyModuleRoyaltyPoliciesResponse = {
  royaltyPolicy: Address
}

export type RoyaltyModuleSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type RoyaltyModuleSupportsInterfaceResponse = boolean

export type RoyaltyModuleOnLicenseMintingRequest = {
  ipId: Address
  royaltyPolicy: Address
  licenseData: Hex
  externalData: Hex
}

export type RoyaltyModuleOnLinkToParentsRequest = {
  ipId: Address
  royaltyPolicy: Address
  parentIpIds: readonly Address[]
  licenseData: readonly Hex[]
  externalData: Hex
}

export type RoyaltyModulePayLicenseMintingFeeRequest = {
  receiverIpId: Address
  payerAddress: Address
  licenseRoyaltyPolicy: Address
  token: Address
  amount: bigint
}

export type RoyaltyModulePayRoyaltyOnBehalfRequest = {
  receiverIpId: Address
  payerIpId: Address
  token: Address
  amount: bigint
}

export type RoyaltyModuleSetGovernanceRequest = {
  newGovernance: Address
}

export type RoyaltyModuleSetLicensingModuleRequest = {
  licensingModule: Address
}

export type RoyaltyModuleWhitelistRoyaltyPolicyRequest = {
  royaltyPolicy: Address
  allowed: boolean
}

export type RoyaltyModuleWhitelistRoyaltyTokenRequest = {
  token: Address
  allowed: boolean
}

export type RoyaltyModuleGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type RoyaltyModuleLicenseMintingFeePaidEvent = {
  receiverIpId?: Address
  payerAddress?: Address
  token?: Address
  amount?: bigint
}

export type RoyaltyModuleRoyaltyPaidEvent = {
  receiverIpId?: Address
  payerIpId?: Address
  sender?: Address
  token?: Address
  amount?: bigint
}

export type RoyaltyModuleRoyaltyPolicyWhitelistUpdatedEvent = {
  royaltyPolicy?: Address
  allowed?: boolean
}

export type RoyaltyModuleRoyaltyTokenWhitelistUpdatedEvent = {
  token?: Address
  allowed?: boolean
}

export class RoyaltyModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xE1a667ccc38540b38d8579c499bE22e51390a308',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async licensingModule(): Promise<RoyaltyModuleLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'LICENSING_MODULE',
    })
  }

  public async getGovernance(): Promise<RoyaltyModuleGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async governance(): Promise<RoyaltyModuleGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'governance',
    })
  }

  public async isWhitelistedRoyaltyPolicy(
    request: RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest,
  ): Promise<RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'isWhitelistedRoyaltyPolicy',
      args: [request.royaltyPolicy],
    })
    return {
      isWhitelisted: result,
    }
  }

  public async isWhitelistedRoyaltyToken(
    request: RoyaltyModuleIsWhitelistedRoyaltyTokenRequest,
  ): Promise<RoyaltyModuleIsWhitelistedRoyaltyTokenResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'isWhitelistedRoyaltyToken',
      args: [request.token],
    })
  }

  public async name(): Promise<RoyaltyModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async royaltyPolicies(
    request: RoyaltyModuleRoyaltyPoliciesRequest,
  ): Promise<RoyaltyModuleRoyaltyPoliciesResponse> {
    const result = await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'royaltyPolicies',
      args: [request.ipId],
    })
    return {
      royaltyPolicy: result,
    }
  }

  public async supportsInterface(
    request: RoyaltyModuleSupportsInterfaceRequest,
  ): Promise<RoyaltyModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class RoyaltyModuleClient extends RoyaltyModuleReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0xE1a667ccc38540b38d8579c499bE22e51390a308',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async onLicenseMinting(
    request: RoyaltyModuleOnLicenseMintingRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'onLicenseMinting',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.royaltyPolicy,
        request.licenseData,
        request.externalData,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async onLinkToParents(
    request: RoyaltyModuleOnLinkToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'onLinkToParents',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.royaltyPolicy,
        request.parentIpIds,
        request.licenseData,
        request.externalData,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async payLicenseMintingFee(
    request: RoyaltyModulePayLicenseMintingFeeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'payLicenseMintingFee',
      account: this.wallet.account,
      args: [
        request.receiverIpId,
        request.payerAddress,
        request.licenseRoyaltyPolicy,
        request.token,
        request.amount,
      ],
    })
    return await this.wallet.writeContract(call)
  }

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

  public async setGovernance(
    request: RoyaltyModuleSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }

  public async setLicensingModule(
    request: RoyaltyModuleSetLicensingModuleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'setLicensingModule',
      account: this.wallet.account,
      args: [request.licensingModule],
    })
    return await this.wallet.writeContract(call)
  }

  public async whitelistRoyaltyPolicy(
    request: RoyaltyModuleWhitelistRoyaltyPolicyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'whitelistRoyaltyPolicy',
      account: this.wallet.account,
      args: [request.royaltyPolicy, request.allowed],
    })
    return await this.wallet.writeContract(call)
  }

  public async whitelistRoyaltyToken(
    request: RoyaltyModuleWhitelistRoyaltyTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: 'whitelistRoyaltyToken',
      account: this.wallet.account,
      args: [request.token, request.allowed],
    })
    return await this.wallet.writeContract(call)
  }
}
export class RoyaltyModuleEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0xE1a667ccc38540b38d8579c499bE22e51390a308',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchLicenseMintingFeePaidEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleLicenseMintingFeePaidEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: 'LicenseMintingFeePaid',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchRoyaltyPaidEvent(
    onLogs: (txHash: Hex, ev: RoyaltyModuleRoyaltyPaidEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: 'RoyaltyPaid',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchRoyaltyPolicyWhitelistUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: RoyaltyModuleRoyaltyPolicyWhitelistUpdatedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: 'RoyaltyPolicyWhitelistUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchRoyaltyTokenWhitelistUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: RoyaltyModuleRoyaltyTokenWhitelistUpdatedEvent,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyModuleAbi,
      address: this.address,
      eventName: 'RoyaltyTokenWhitelistUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract RoyaltyPolicyLAP =============================================================
export type RoyaltyPolicyLapAncestorsVaultImplResponse = Address

export type RoyaltyPolicyLapLicensingModuleResponse = Address

export type RoyaltyPolicyLapLiquidSplitFactoryResponse = Address

export type RoyaltyPolicyLapLiquidSplitMainResponse = Address

export type RoyaltyPolicyLapMaxAncestorsResponse = bigint

export type RoyaltyPolicyLapMaxParentsResponse = bigint

export type RoyaltyPolicyLapRoyaltyModuleResponse = Address

export type RoyaltyPolicyLapTotalRnftSupplyResponse = number

export type RoyaltyPolicyLapGetGovernanceResponse = Address

export type RoyaltyPolicyLapGovernanceResponse = Address

export type RoyaltyPolicyLapRoyaltyDataRequest = {
  ipId: Address
}
export type RoyaltyPolicyLapRoyaltyDataResponse = {
  isUnlinkableToParents: boolean
  splitClone: Address
  ancestorsVault: Address
  royaltyStack: number
  ancestorsHash: Hex
}

export type RoyaltyPolicyLapSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type RoyaltyPolicyLapSupportsInterfaceResponse = boolean

export type RoyaltyPolicyLapClaimFromAncestorsVaultRequest = {
  ipId: Address
  claimerIpId: Address
  ancestors: readonly Address[]
  ancestorsRoyalties: readonly number[]
  withdrawETH: boolean
  tokens: readonly Address[]
}

export type RoyaltyPolicyLapClaimFromIpPoolRequest = {
  account: Address
  withdrawETH: bigint
  tokens: readonly Address[]
}

export type RoyaltyPolicyLapClaimFromIpPoolAsTotalRnftOwnerRequest = {
  ipId: Address
  withdrawETH: bigint
  token: Address
}

export type RoyaltyPolicyLapDistributeIpPoolFundsRequest = {
  ipId: Address
  token: Address
  accounts: readonly Address[]
  distributorAddress: Address
}

export type RoyaltyPolicyLapOnErc1155BatchReceivedRequest = readonly [
  Address,
  Address,
  readonly bigint[],
  readonly bigint[],
  Hex,
]

export type RoyaltyPolicyLapOnErc1155ReceivedRequest = readonly [
  Address,
  Address,
  bigint,
  bigint,
  Hex,
]

export type RoyaltyPolicyLapOnLicenseMintingRequest = {
  ipId: Address
  licenseData: Hex
  externalData: Hex
}

export type RoyaltyPolicyLapOnLinkToParentsRequest = {
  ipId: Address
  parentIpIds: readonly Address[]
  licenseData: readonly Hex[]
  externalData: Hex
}

export type RoyaltyPolicyLapOnRoyaltyPaymentRequest = {
  caller: Address
  ipId: Address
  token: Address
  amount: bigint
}

export type RoyaltyPolicyLapSetAncestorsVaultImplementationRequest = {
  ancestorsVaultImpl: Address
}

export type RoyaltyPolicyLapSetGovernanceRequest = {
  newGovernance: Address
}

export type RoyaltyPolicyLapGovernanceUpdatedEvent = {
  newGovernance?: Address
}

export type RoyaltyPolicyLapPolicyInitializedEvent = {
  ipId?: Address
  splitClone?: Address
  ancestorsVault?: Address
  royaltyStack?: number
  targetAncestors?: readonly Address[]
  targetRoyaltyAmount?: readonly number[]
}

export class RoyaltyPolicyLapReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x265C21b34e0E92d63C678425478C42aa8D727B79',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async ancestorsVaultImpl(): Promise<RoyaltyPolicyLapAncestorsVaultImplResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'ANCESTORS_VAULT_IMPL',
    })
  }

  public async licensingModule(): Promise<RoyaltyPolicyLapLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'LICENSING_MODULE',
    })
  }

  public async liquidSplitFactory(): Promise<RoyaltyPolicyLapLiquidSplitFactoryResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'LIQUID_SPLIT_FACTORY',
    })
  }

  public async liquidSplitMain(): Promise<RoyaltyPolicyLapLiquidSplitMainResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'LIQUID_SPLIT_MAIN',
    })
  }

  public async maxAncestors(): Promise<RoyaltyPolicyLapMaxAncestorsResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'MAX_ANCESTORS',
    })
  }

  public async maxParents(): Promise<RoyaltyPolicyLapMaxParentsResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'MAX_PARENTS',
    })
  }

  public async royaltyModule(): Promise<RoyaltyPolicyLapRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'ROYALTY_MODULE',
    })
  }

  public async totalRnftSupply(): Promise<RoyaltyPolicyLapTotalRnftSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'TOTAL_RNFT_SUPPLY',
    })
  }

  public async getGovernance(): Promise<RoyaltyPolicyLapGetGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'getGovernance',
    })
  }

  public async governance(): Promise<RoyaltyPolicyLapGovernanceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'governance',
    })
  }

  public async royaltyData(
    request: RoyaltyPolicyLapRoyaltyDataRequest,
  ): Promise<RoyaltyPolicyLapRoyaltyDataResponse> {
    const result = await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'royaltyData',
      args: [request.ipId],
    })
    return {
      isUnlinkableToParents: result[0],
      splitClone: result[1],
      ancestorsVault: result[2],
      royaltyStack: result[3],
      ancestorsHash: result[4],
    }
  }

  public async supportsInterface(
    request: RoyaltyPolicyLapSupportsInterfaceRequest,
  ): Promise<RoyaltyPolicyLapSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class RoyaltyPolicyLapClient extends RoyaltyPolicyLapReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x265C21b34e0E92d63C678425478C42aa8D727B79',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async claimFromAncestorsVault(
    request: RoyaltyPolicyLapClaimFromAncestorsVaultRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'claimFromAncestorsVault',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.claimerIpId,
        request.ancestors,
        request.ancestorsRoyalties,
        request.withdrawETH,
        request.tokens,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async claimFromIpPool(
    request: RoyaltyPolicyLapClaimFromIpPoolRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'claimFromIpPool',
      account: this.wallet.account,
      args: [request.account, request.withdrawETH, request.tokens],
    })
    return await this.wallet.writeContract(call)
  }

  public async claimFromIpPoolAsTotalRnftOwner(
    request: RoyaltyPolicyLapClaimFromIpPoolAsTotalRnftOwnerRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'claimFromIpPoolAsTotalRnftOwner',
      account: this.wallet.account,
      args: [request.ipId, request.withdrawETH, request.token],
    })
    return await this.wallet.writeContract(call)
  }

  public async distributeIpPoolFunds(
    request: RoyaltyPolicyLapDistributeIpPoolFundsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'distributeIpPoolFunds',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.token,
        request.accounts,
        request.distributorAddress,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async onErc1155BatchReceived(
    request: RoyaltyPolicyLapOnErc1155BatchReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'onERC1155BatchReceived',
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    })
    return await this.wallet.writeContract(call)
  }

  public async onErc1155Received(
    request: RoyaltyPolicyLapOnErc1155ReceivedRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'onERC1155Received',
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    })
    return await this.wallet.writeContract(call)
  }

  public async onLicenseMinting(
    request: RoyaltyPolicyLapOnLicenseMintingRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'onLicenseMinting',
      account: this.wallet.account,
      args: [request.ipId, request.licenseData, request.externalData],
    })
    return await this.wallet.writeContract(call)
  }

  public async onLinkToParents(
    request: RoyaltyPolicyLapOnLinkToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'onLinkToParents',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.parentIpIds,
        request.licenseData,
        request.externalData,
      ],
    })
    return await this.wallet.writeContract(call)
  }

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

  public async setAncestorsVaultImplementation(
    request: RoyaltyPolicyLapSetAncestorsVaultImplementationRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'setAncestorsVaultImplementation',
      account: this.wallet.account,
      args: [request.ancestorsVaultImpl],
    })
    return await this.wallet.writeContract(call)
  }

  public async setGovernance(
    request: RoyaltyPolicyLapSetGovernanceRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'setGovernance',
      account: this.wallet.account,
      args: [request.newGovernance],
    })
    return await this.wallet.writeContract(call)
  }
}
export class RoyaltyPolicyLapEventClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x265C21b34e0E92d63C678425478C42aa8D727B79',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public watchGovernanceUpdatedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyPolicyLapGovernanceUpdatedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      eventName: 'GovernanceUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  public watchPolicyInitializedEvent(
    onLogs: (txHash: Hex, ev: RoyaltyPolicyLapPolicyInitializedEvent) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      eventName: 'PolicyInitialized',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }
}

// Contract TokenWithdrawalModule =============================================================
export type TokenWithdrawalModuleAccessControllerResponse = Address

export type TokenWithdrawalModuleIpAccountRegistryResponse = Address

export type TokenWithdrawalModuleNameResponse = string

export type TokenWithdrawalModuleSupportsInterfaceRequest = {
  interfaceId: Hex
}
export type TokenWithdrawalModuleSupportsInterfaceResponse = boolean

export type TokenWithdrawalModuleWithdrawErc1155Request = {
  ipAccount: Address
  tokenContract: Address
  tokenId: bigint
  amount: bigint
}

export type TokenWithdrawalModuleWithdrawErc20Request = {
  ipAccount: Address
  tokenContract: Address
  amount: bigint
}

export type TokenWithdrawalModuleWithdrawErc721Request = {
  ipAccount: Address
  tokenContract: Address
  tokenId: bigint
}

export class TokenWithdrawalModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient
  protected readonly address: Address

  constructor(
    rpcClient: PublicClient,
    address: Address = '0x5f62d238B3022bA5881e5e443B014cac6999a4f2',
  ) {
    this.address = address
    this.rpcClient = rpcClient
  }

  public async accessController(): Promise<TokenWithdrawalModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'ACCESS_CONTROLLER',
    })
  }

  public async ipAccountRegistry(): Promise<TokenWithdrawalModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  public async name(): Promise<TokenWithdrawalModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  public async supportsInterface(
    request: TokenWithdrawalModuleSupportsInterfaceRequest,
  ): Promise<TokenWithdrawalModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }
}
export class TokenWithdrawalModuleClient extends TokenWithdrawalModuleReadOnlyClient {
  protected readonly wallet: WalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    address: Address = '0x5f62d238B3022bA5881e5e443B014cac6999a4f2',
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  public async withdrawErc1155(
    request: TokenWithdrawalModuleWithdrawErc1155Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'withdrawERC1155',
      account: this.wallet.account,
      args: [
        request.ipAccount,
        request.tokenContract,
        request.tokenId,
        request.amount,
      ],
    })
    return await this.wallet.writeContract(call)
  }

  public async withdrawErc20(
    request: TokenWithdrawalModuleWithdrawErc20Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'withdrawERC20',
      account: this.wallet.account,
      args: [request.ipAccount, request.tokenContract, request.amount],
    })
    return await this.wallet.writeContract(call)
  }

  public async withdrawErc721(
    request: TokenWithdrawalModuleWithdrawErc721Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: tokenWithdrawalModuleAbi,
      address: this.address,
      functionName: 'withdrawERC721',
      account: this.wallet.account,
      args: [request.ipAccount, request.tokenContract, request.tokenId],
    })
    return await this.wallet.writeContract(call)
  }
}
