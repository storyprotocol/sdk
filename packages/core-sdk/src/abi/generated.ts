import {
  Address,
  Abi,
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  WriteContractParameters,
  WriteContractReturnType,
  PublicClient,
  Hex,
  decodeEventLog,
  WatchContractEventReturnType,
  TransactionReceipt,
} from 'viem'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A)
 */
export const accessControllerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'moduleRegistry', internalType: 'address', type: 'address' },
    ],
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
  {
    type: 'error',
    inputs: [],
    name: 'AccessController__CallerIsNotIPAccountOrOwner',
  },
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
    inputs: [],
    name: 'AccessController__ToAndFuncAreZeroAddressShouldCallSetAllPermissions',
  },
  { type: 'error', inputs: [], name: 'AccessController__ZeroAccessManager' },
  {
    type: 'error',
    inputs: [],
    name: 'AccessController__ZeroIPAccountRegistry',
  },
  { type: 'error', inputs: [], name: 'AccessController__ZeroModuleRegistry' },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    name: 'MODULE_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IModuleRegistry', type: 'address' },
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
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: '__ProtocolPausable_init',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authority',
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
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
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
      { name: 'ipAccount', internalType: 'address', type: 'address' },
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'permission', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'setAllPermissions',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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
    inputs: [],
    name: 'unpause',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A)
 */
export const accessControllerAddress = {
  11155111: '0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A)
 */
export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xEB7B1dd43B81A7be1fA427515a2b173B454A9832)
 */
export const disputeModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAssetRegistry', internalType: 'address', type: 'address' },
      { name: 'licenseRegistry', internalType: 'address', type: 'address' },
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
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'DisputeModule__NotAbleToResolve' },
  { type: 'error', inputs: [], name: 'DisputeModule__NotDerivative' },
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
  {
    type: 'error',
    inputs: [],
    name: 'DisputeModule__ParentDisputeNotResolved',
  },
  { type: 'error', inputs: [], name: 'DisputeModule__ParentIpIdMismatch' },
  { type: 'error', inputs: [], name: 'DisputeModule__ParentNotTagged' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroAccessController' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroArbitrationPolicy' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroArbitrationRelayer' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroDisputeTag' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroIPAssetRegistry' },
  { type: 'error', inputs: [], name: 'DisputeModule__ZeroLicenseRegistry' },
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
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
        name: 'parentIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'derivativeIpId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'parentDisputeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'tag', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'DerivativeTaggedOnParentInfringement',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    name: 'LICENSE_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract ILicenseRegistry', type: 'address' },
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
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: '__ProtocolPausable_init',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'parentDisputeId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
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
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
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
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
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
    inputs: [
      { name: 'disputeId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
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
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'derivativeIpId', internalType: 'address', type: 'address' },
      { name: 'parentDisputeId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tagDerivativeIfParentInfringed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xEB7B1dd43B81A7be1fA427515a2b173B454A9832)
 */
export const disputeModuleAddress = {
  11155111: '0xEB7B1dd43B81A7be1fA427515a2b173B454A9832',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xEB7B1dd43B81A7be1fA427515a2b173B454A9832)
 */
export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x36a5f0D61f6Bab3C6Dde211E5a6762Cb18a8060d)
 */
export const ipAccountImplAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAssetRegistry', internalType: 'address', type: 'address' },
      { name: 'licenseRegistry', internalType: 'address', type: 'address' },
      { name: 'moduleRegistry', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'module', internalType: 'address', type: 'address' }],
    name: 'IPAccountStorage__NotRegisteredModule',
  },
  { type: 'error', inputs: [], name: 'IPAccount__ExpiredSignature' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidCalldata' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidSignature' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidSigner' },
  { type: 'error', inputs: [], name: 'IPAccount__ZeroAccessController' },
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
    name: 'ACCESS_CONTROLLER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IP_ASSET_REGISTRY',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LICENSE_REGISTRY',
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
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x36a5f0D61f6Bab3C6Dde211E5a6762Cb18a8060d)
 */
export const ipAccountImplAddress = {
  11155111: '0x36a5f0D61f6Bab3C6Dde211E5a6762Cb18a8060d',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x36a5f0D61f6Bab3C6Dde211E5a6762Cb18a8060d)
 */
export const ipAccountImplConfig = {
  address: ipAccountImplAddress,
  abi: ipAccountImplAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6)
 */
export const ipAssetRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'erc6551Registry', internalType: 'address', type: 'address' },
      { name: 'ipAccountImpl', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'IPAccountRegistry_ZeroIpAccountImpl' },
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
  { type: 'error', inputs: [], name: 'IPAssetRegistry__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: '__ProtocolPausable_init',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authority',
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
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
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
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
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
      { name: 'chainid', internalType: 'uint256', type: 'uint256' },
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
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6)
 */
export const ipAssetRegistryAddress = {
  11155111: '0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6)
 */
export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IpRoyaltyVaultImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xD6c2AfB61085f1359d47159f2271BDD0EeBf19C2)
 */
export const ipRoyaltyVaultImplAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'royaltyPolicyLAP', internalType: 'address', type: 'address' },
      { name: 'disputeModule', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__AlreadyClaimed' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__ClaimerNotAnAncestor' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__EnforcedPause' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__IpTagged' },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__NotRoyaltyPolicyLAP' },
  {
    type: 'error',
    inputs: [],
    name: 'IpRoyaltyVault__SnapshotIntervalTooShort',
  },
  { type: 'error', inputs: [], name: 'IpRoyaltyVault__ZeroDisputeModule' },
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
        name: 'claimer',
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
    name: 'RevenueTokenClaimed',
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
    name: 'DISPUTE_MODULE',
    outputs: [
      { name: '', internalType: 'contract IDisputeModule', type: 'address' },
    ],
    stateMutability: 'view',
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
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'tokenList', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'claimRevenueByTokenBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'claimVaultAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'snapshotId', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'claimableAtSnapshot',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    name: 'isCollectedByAncestor',
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
    name: 'tokens',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
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
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xD6c2AfB61085f1359d47159f2271BDD0EeBf19C2)
 */
export const ipRoyaltyVaultImplAddress = {
  11155111: '0xD6c2AfB61085f1359d47159f2271BDD0EeBf19C2',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xD6c2AfB61085f1359d47159f2271BDD0EeBf19C2)
 */
export const ipRoyaltyVaultImplConfig = {
  address: ipRoyaltyVaultImplAddress,
  abi: ipRoyaltyVaultImplAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4f4b1bf7135C7ff1462826CCA81B048Ed19562ed)
 */
export const licenseRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      { name: 'disputeModule', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [],
    name: 'LicenseRegistry__CallerNotLicensingModule',
  },
  {
    type: 'error',
    inputs: [{ name: 'childIpId', internalType: 'address', type: 'address' }],
    name: 'LicenseRegistry__DerivativeAlreadyRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'childIpId', internalType: 'address', type: 'address' }],
    name: 'LicenseRegistry__DerivativeIpAlreadyHasLicense',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'LicenseRegistry__DerivativeIsParent',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicenseRegistry__DuplicateLicense',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicenseRegistry__IndexOutOfBounds',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'LicenseRegistry__IpExpired',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicenseRegistry__LicenseTermsAlreadyAttached',
  },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicenseRegistry__LicenseTermsNotExists',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicenseRegistry__LicensorIpHasNoLicenseTerms',
  },
  { type: 'error', inputs: [], name: 'LicenseRegistry__NoParentIp' },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
    ],
    name: 'LicenseRegistry__NotLicenseTemplate',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'LicenseRegistry__ParentIpExpired',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicenseRegistry__ParentIpHasNoLicenseTerms',
  },
  {
    type: 'error',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'LicenseRegistry__ParentIpTagged',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
    ],
    name: 'LicenseRegistry__ParentIpUnmatchedLicenseTemplate',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'newLicenseTemplate', internalType: 'address', type: 'address' },
    ],
    name: 'LicenseRegistry__UnmatchedLicenseTemplate',
  },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
    ],
    name: 'LicenseRegistry__UnregisteredLicenseTemplate',
  },
  { type: 'error', inputs: [], name: 'LicenseRegistry__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'LicenseRegistry__ZeroDisputeModule' },
  { type: 'error', inputs: [], name: 'LicenseRegistry__ZeroLicensingModule' },
  {
    type: 'error',
    inputs: [],
    name: 'LicensingModule__DerivativesCannotAddLicenseTerms',
  },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicensingModule__LicenseTermsNotFound',
  },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'expireTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExpirationTimeSet',
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
        name: 'licenseTemplate',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LicenseTemplateRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'licensingConfig',
        internalType: 'struct Licensing.LicensingConfig',
        type: 'tuple',
        components: [
          { name: 'isSet', internalType: 'bool', type: 'bool' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'licensingHook', internalType: 'address', type: 'address' },
          { name: 'hookData', internalType: 'bytes', type: 'bytes' },
        ],
        indexed: false,
      },
    ],
    name: 'LicensingConfigSetForIP',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'licenseTemplate',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'licenseTermsId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'LicensingConfigSetForLicense',
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
    name: 'DISPUTE_MODULE',
    outputs: [
      { name: '', internalType: 'contract IDisputeModule', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'EXPIRATION_TIME',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
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
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'attachLicenseTermsToIp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'exists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAttachedLicenseTerms',
    outputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'getAttachedLicenseTermsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDefaultLicenseTerms',
    outputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getDerivativeIp',
    outputs: [{ name: 'childIpId', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'parentIpId', internalType: 'address', type: 'address' }],
    name: 'getDerivativeIpCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'getExpireTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getLicensingConfig',
    outputs: [
      {
        name: '',
        internalType: 'struct Licensing.LicensingConfig',
        type: 'tuple',
        components: [
          { name: 'isSet', internalType: 'bool', type: 'bool' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'licensingHook', internalType: 'address', type: 'address' },
          { name: 'hookData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getParentIp',
    outputs: [{ name: 'parentIpId', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'childIpId', internalType: 'address', type: 'address' }],
    name: 'getParentIpCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'parentIpId', internalType: 'address', type: 'address' }],
    name: 'hasDerivativeIps',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'hasIpAttachedLicenseTerms',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'childIpId', internalType: 'address', type: 'address' }],
    name: 'isDerivativeIp',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'isExpiredNow',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
    ],
    name: 'isParentIp',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
    ],
    name: 'isRegisteredLicenseTemplate',
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
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'registerDerivativeIp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
    ],
    name: 'registerLicenseTemplate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newLicenseTemplate', internalType: 'address', type: 'address' },
      { name: 'newLicenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setDefaultLicenseTerms',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'expireTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setExpireTime',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      {
        name: 'licensingConfig',
        internalType: 'struct Licensing.LicensingConfig',
        type: 'tuple',
        components: [
          { name: 'isSet', internalType: 'bool', type: 'bool' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'licensingHook', internalType: 'address', type: 'address' },
          { name: 'hookData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'setLicensingConfigForIp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'licensingConfig',
        internalType: 'struct Licensing.LicensingConfig',
        type: 'tuple',
        components: [
          { name: 'isSet', internalType: 'bool', type: 'bool' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'licensingHook', internalType: 'address', type: 'address' },
          { name: 'hookData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'setLicensingConfigForLicense',
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
  {
    type: 'function',
    inputs: [
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'isMintedByIpOwner', internalType: 'bool', type: 'bool' },
    ],
    name: 'verifyMintLicenseToken',
    outputs: [
      {
        name: '',
        internalType: 'struct Licensing.LicensingConfig',
        type: 'tuple',
        components: [
          { name: 'isSet', internalType: 'bool', type: 'bool' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'licensingHook', internalType: 'address', type: 'address' },
          { name: 'hookData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4f4b1bf7135C7ff1462826CCA81B048Ed19562ed)
 */
export const licenseRegistryAddress = {
  11155111: '0x4f4b1bf7135C7ff1462826CCA81B048Ed19562ed',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4f4b1bf7135C7ff1462826CCA81B048Ed19562ed)
 */
export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1333c78A821c9a576209B01a16dDCEF881cAb6f2)
 */
export const licenseTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      { name: 'disputeModule', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
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
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      {
        name: 'anotherLicenseTemplate',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'LicenseToken__AllLicenseTokensMustFromSameLicenseTemplate',
  },
  { type: 'error', inputs: [], name: 'LicenseToken__CallerNotLicensingModule' },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'iPowner', internalType: 'address', type: 'address' },
      { name: 'tokenOwner', internalType: 'address', type: 'address' },
    ],
    name: 'LicenseToken__NotLicenseTokenOwner',
  },
  { type: 'error', inputs: [], name: 'LicenseToken__NotTransferable' },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'LicenseToken__RevokedLicense',
  },
  { type: 'error', inputs: [], name: 'LicenseToken__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
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
      {
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
        name: 'minter',
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
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'LicenseTokenMinted',
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
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'burnLicenseTokens',
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
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLicenseTemplate',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLicenseTermsId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLicenseTokenMetadata',
    outputs: [
      {
        name: '',
        internalType: 'struct ILicenseToken.LicenseTokenMetadata',
        type: 'tuple',
        components: [
          { name: 'licensorIpId', internalType: 'address', type: 'address' },
          { name: 'licenseTemplate', internalType: 'address', type: 'address' },
          { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
          { name: 'transferable', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLicensorIpId',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
      { name: 'imageUrl', internalType: 'string', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'isLicenseTokenRevoked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'minter', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'mintLicenseTokens',
    outputs: [
      { name: 'startLicenseTokenId', internalType: 'uint256', type: 'uint256' },
    ],
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
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
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
    inputs: [
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalMintedTokens',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
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
  {
    type: 'function',
    inputs: [
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'childIpOwner', internalType: 'address', type: 'address' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'validateLicenseTokensForDerivative',
    outputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licensorIpIds', internalType: 'address[]', type: 'address[]' },
      { name: 'licenseTermsIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1333c78A821c9a576209B01a16dDCEF881cAb6f2)
 */
export const licenseTokenAddress = {
  11155111: '0x1333c78A821c9a576209B01a16dDCEF881cAb6f2',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1333c78A821c9a576209B01a16dDCEF881cAb6f2)
 */
export const licenseTokenConfig = {
  address: licenseTokenAddress,
  abi: licenseTokenAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicensingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xe89b0EaA8a0949738efA80bB531a165FB3456CBe)
 */
export const licensingModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'moduleRegistry', internalType: 'address', type: 'address' },
      { name: 'royaltyModule', internalType: 'address', type: 'address' },
      { name: 'licenseRegistry', internalType: 'address', type: 'address' },
      { name: 'disputeModule', internalType: 'address', type: 'address' },
      { name: 'licenseToken', internalType: 'address', type: 'address' },
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
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'LicensingModule__DisputedIpId' },
  {
    type: 'error',
    inputs: [
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      {
        name: 'anotherRoyaltyPolicy',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'LicensingModule__IncompatibleRoyaltyPolicy',
  },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicensingModule__InvalidLicenseTermsId',
  },
  {
    type: 'error',
    inputs: [{ name: 'hook', internalType: 'address', type: 'address' }],
    name: 'LicensingModule__InvalidLicensingHook',
  },
  {
    type: 'error',
    inputs: [
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
    ],
    name: 'LicensingModule__LicenseDenyMintLicenseToken',
  },
  {
    type: 'error',
    inputs: [{ name: 'childIpId', internalType: 'address', type: 'address' }],
    name: 'LicensingModule__LicenseNotCompatibleForDerivative',
  },
  {
    type: 'error',
    inputs: [
      { name: 'ipLength', internalType: 'uint256', type: 'uint256' },
      { name: 'licenseTermsLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LicensingModule__LicenseTermsLengthMismatch',
  },
  {
    type: 'error',
    inputs: [
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'LicensingModule__LicenseTokenNotCompatibleForDerivative',
  },
  { type: 'error', inputs: [], name: 'LicensingModule__MintAmountZero' },
  { type: 'error', inputs: [], name: 'LicensingModule__NoLicenseToken' },
  { type: 'error', inputs: [], name: 'LicensingModule__NoParentIp' },
  { type: 'error', inputs: [], name: 'LicensingModule__ReceiverZeroAddress' },
  { type: 'error', inputs: [], name: 'LicensingModule__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'LicensingModule__ZeroDisputeModule' },
  { type: 'error', inputs: [], name: 'LicensingModule__ZeroLicenseRegistry' },
  { type: 'error', inputs: [], name: 'LicensingModule__ZeroLicenseToken' },
  { type: 'error', inputs: [], name: 'LicensingModule__ZeroModuleRegistry' },
  { type: 'error', inputs: [], name: 'LicensingModule__ZeroRoyaltyModule' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
      {
        name: 'childIpId',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'licenseTokenIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'parentIpIds',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'licenseTermsIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'licenseTemplate',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DerivativeRegistered',
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
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'ipId', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'licenseTemplate',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'licenseTermsId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LicenseTermsAttached',
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
      {
        name: 'licensorIpId',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'licenseTemplate',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'licenseTermsId',
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
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'startLicenseTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LicenseTokensMinted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    name: 'LICENSE_NFT',
    outputs: [
      { name: '', internalType: 'contract ILicenseToken', type: 'address' },
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
    name: 'MODULE_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IModuleRegistry', type: 'address' },
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
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: '__ProtocolPausable_init',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'attachLicenseTerms',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mintLicenseTokens',
    outputs: [
      { name: 'startLicenseTokenId', internalType: 'uint256', type: 'uint256' },
    ],
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
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
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
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
      { name: 'licenseTermsIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'registerDerivative',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'registerDerivativeWithLicenseTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'licensingConfig',
        internalType: 'struct Licensing.LicensingConfig',
        type: 'tuple',
        components: [
          { name: 'isSet', internalType: 'bool', type: 'bool' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'licensingHook', internalType: 'address', type: 'address' },
          { name: 'hookData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'setLicensingConfig',
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
    name: 'unpause',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xe89b0EaA8a0949738efA80bB531a165FB3456CBe)
 */
export const licensingModuleAddress = {
  11155111: '0xe89b0EaA8a0949738efA80bB531a165FB3456CBe',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xe89b0EaA8a0949738efA80bB531a165FB3456CBe)
 */
export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ModuleRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2E0a668289D5C4Da6a2264aC8DF03cd600c7aAB8)
 */
export const moduleRegistryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'ModuleRegistry__ZeroAccessManager' },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
    name: 'authority',
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
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
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
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2E0a668289D5C4Da6a2264aC8DF03cd600c7aAB8)
 */
export const moduleRegistryAddress = {
  11155111: '0x2E0a668289D5C4Da6a2264aC8DF03cd600c7aAB8',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2E0a668289D5C4Da6a2264aC8DF03cd600c7aAB8)
 */
export const moduleRegistryConfig = {
  address: moduleRegistryAddress,
  abi: moduleRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PILicenseTemplate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x260B6CB6284c89dbE660c0004233f7bB99B5edE7)
 */
export const piLicenseTemplateAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAccountRegistry', internalType: 'address', type: 'address' },
      { name: 'licenseRegistry', internalType: 'address', type: 'address' },
      { name: 'royaltyModule', internalType: 'address', type: 'address' },
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
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__CommercialDisabled_CantAddAttribution',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__CommercialDisabled_CantAddCommercializers',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__CommercialDisabled_CantAddRevShare',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__CommercialDisabled_CantAddRoyaltyPolicy',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__CommercialEnabled_RoyaltyPolicyRequired',
  },
  {
    type: 'error',
    inputs: [{ name: 'checker', internalType: 'address', type: 'address' }],
    name: 'PILicenseTemplate__CommercializerCheckerDoesNotSupportHook',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__CurrencyTokenNotWhitelisted',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__DerivativesDisabled_CantAddApproval',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__DerivativesDisabled_CantAddAttribution',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__DerivativesDisabled_CantAddReciprocal',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__RoyaltyPolicyNotWhitelisted',
  },
  {
    type: 'error',
    inputs: [],
    name: 'PILicenseTemplate__RoyaltyPolicyRequiresCurrencyToken',
  },
  { type: 'error', inputs: [], name: 'PILicenseTemplate__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'PILicenseTemplate__ZeroLicenseRegistry' },
  { type: 'error', inputs: [], name: 'PILicenseTemplate__ZeroRoyaltyModule' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'licenseTermsId',
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
        name: 'licenseTermsId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'licenseTemplate',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'licenseTerms',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'LicenseTermsRegistered',
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
      { name: '', internalType: 'contract IRoyaltyModule', type: 'address' },
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
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'exists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEarlierExpireTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'start', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getExpireTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'selectedLicenseTermsId',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'getLicenseTerms',
    outputs: [
      {
        name: 'terms',
        internalType: 'struct PILTerms',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'expiration', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'commercialRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativeRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'terms',
        internalType: 'struct PILTerms',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'expiration', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'commercialRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativeRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'getLicenseTermsId',
    outputs: [
      {
        name: 'selectedLicenseTermsId',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getLicenseTermsURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMetadataURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRoyaltyPolicy',
    outputs: [
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'royaltyData', internalType: 'bytes', type: 'bytes' },
      { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
      { name: 'currency', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'metadataURI', internalType: 'string', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
    ],
    name: 'isDerivativeApproved',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isLicenseTransferable',
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
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'terms',
        internalType: 'struct PILTerms',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'expiration', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'commercialRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativeRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'registerLicenseTerms',
    outputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApproval',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'toJson',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRegisteredLicenseTerms',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'licenseTermsIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'verifyCompatibleLicenses',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensee', internalType: 'address', type: 'address' },
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'verifyMintLicenseToken',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'parentIpId', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensee', internalType: 'address', type: 'address' },
    ],
    name: 'verifyRegisterDerivative',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'childIpId', internalType: 'address', type: 'address' },
      { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
      { name: 'licenseTermsIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'childIpOwner', internalType: 'address', type: 'address' },
    ],
    name: 'verifyRegisterDerivativeForAllParents',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x260B6CB6284c89dbE660c0004233f7bB99B5edE7)
 */
export const piLicenseTemplateAddress = {
  11155111: '0x260B6CB6284c89dbE660c0004233f7bB99B5edE7',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x260B6CB6284c89dbE660c0004233f7bB99B5edE7)
 */
export const piLicenseTemplateConfig = {
  address: piLicenseTemplateAddress,
  abi: piLicenseTemplateAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFAE961dd2b87CD5818dbCDc2591e6AB0b50E96b0)
 */
export const royaltyModuleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      { name: 'disputeModule', internalType: 'address', type: 'address' },
      { name: 'licenseRegistry', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
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
  { type: 'error', inputs: [], name: 'RoyaltyModule__IpIsExpired' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__IpIsTagged' },
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
  { type: 'error', inputs: [], name: 'RoyaltyModule__ZeroAccessManager' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__ZeroDisputeModule' },
  { type: 'error', inputs: [], name: 'RoyaltyModule__ZeroLicenseRegistry' },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    name: 'DISPUTE_MODULE',
    outputs: [
      { name: '', internalType: 'contract IDisputeModule', type: 'address' },
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
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: '__ProtocolPausable_init',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
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
    name: 'unpause',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFAE961dd2b87CD5818dbCDc2591e6AB0b50E96b0)
 */
export const royaltyModuleAddress = {
  11155111: '0xFAE961dd2b87CD5818dbCDc2591e6AB0b50E96b0',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFAE961dd2b87CD5818dbCDc2591e6AB0b50E96b0)
 */
export const royaltyModuleConfig = {
  address: royaltyModuleAddress,
  abi: royaltyModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyPolicyLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAAbaf349C7a2A84564F9CC4Ac130B3f19A718E86)
 */
export const royaltyPolicyLapAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'royaltyModule', internalType: 'address', type: 'address' },
      { name: 'licensingModule', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
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
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
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
    name: 'RoyaltyPolicyLAP__InvalidParentRoyaltiesLength',
  },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__LastPositionNotAbleToMintLicense',
  },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__NotRoyaltyModule' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__UnlinkableToParents' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__ZeroAccessManager' },
  {
    type: 'error',
    inputs: [],
    name: 'RoyaltyPolicyLAP__ZeroIpRoyaltyVaultBeacon',
  },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__ZeroLicensingModule' },
  { type: 'error', inputs: [], name: 'RoyaltyPolicyLAP__ZeroRoyaltyModule' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
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
        name: 'ipRoyaltyVault',
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
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'vault',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RevenueTokenAddedToVault',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    name: 'LICENSING_MODULE',
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
    name: 'TOTAL_RT_SUPPLY',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
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
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: '__ProtocolPausable_init',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getIpRoyaltyVaultBeacon',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'getRoyaltyData',
    outputs: [
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint32', type: 'uint32' },
      { name: '', internalType: 'address[]', type: 'address[]' },
      { name: '', internalType: 'uint32[]', type: 'uint32[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getSnapshotInterval',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
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
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'beacon', internalType: 'address', type: 'address' }],
    name: 'setIpRoyaltyVaultBeacon',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'timestampInterval', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setSnapshotInterval',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
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
  {
    type: 'function',
    inputs: [{ name: 'newVault', internalType: 'address', type: 'address' }],
    name: 'upgradeVaults',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAAbaf349C7a2A84564F9CC4Ac130B3f19A718E86)
 */
export const royaltyPolicyLapAddress = {
  11155111: '0xAAbaf349C7a2A84564F9CC4Ac130B3f19A718E86',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAAbaf349C7a2A84564F9CC4Ac130B3f19A718E86)
 */
export const royaltyPolicyLapConfig = {
  address: royaltyPolicyLapAddress,
  abi: royaltyPolicyLapAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x69415CE984A79a3Cfbe3F51024C63b6C107331e3)
 */
export const spgAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAssetRegistry', internalType: 'address', type: 'address' },
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      { name: 'coreMetadataModule', internalType: 'address', type: 'address' },
      { name: 'pilTemplate', internalType: 'address', type: 'address' },
      { name: 'licenseToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'authority', internalType: 'address', type: 'address' }],
    name: 'AccessManagedInvalidAuthority',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'delay', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'AccessManagedRequiredDelay',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'AccessManagedUnauthorized',
  },
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
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'SPG__CallerNotMinterRole' },
  { type: 'error', inputs: [], name: 'SPG__EmptyLicenseTokens' },
  { type: 'error', inputs: [], name: 'SPG__ZeroAddressParam' },
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
        name: 'authority',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuthorityUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nftContract',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CollectionCreated',
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
    name: 'CORE_METADATA_MODULE',
    outputs: [
      {
        name: '',
        internalType: 'contract ICoreMetadataModule',
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
    name: 'LICENSE_TOKEN',
    outputs: [
      { name: '', internalType: 'contract ILicenseToken', type: 'address' },
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
    inputs: [],
    name: 'PIL_TEMPLATE',
    outputs: [
      {
        name: '',
        internalType: 'contract IPILicenseTemplate',
        type: 'address',
      },
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
    inputs: [],
    name: 'authority',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'maxSupply', internalType: 'uint32', type: 'uint32' },
      { name: 'mintCost', internalType: 'uint256', type: 'uint256' },
      { name: 'mintToken', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'createCollection',
    outputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accessManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'mintAndRegisterIp',
    outputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      {
        name: 'terms',
        internalType: 'struct PILTerms',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'expiration', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'commercialRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativeRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'mintAndRegisterIpAndAttachPILTerms',
    outputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
      {
        name: 'derivData',
        internalType: 'struct IStoryProtocolGateway.MakeDerivative',
        type: 'tuple',
        components: [
          { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
          { name: 'licenseTemplate', internalType: 'address', type: 'address' },
          {
            name: 'licenseTermsIds',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'mintAndRegisterIpAndMakeDerivative',
    outputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
      { name: 'licenseTokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'mintAndRegisterIpAndMakeDerivativeWithLicenseTokens',
    outputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
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
      { name: 'nftContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      {
        name: 'terms',
        internalType: 'struct PILTerms',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'expiration', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'commercialRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativeRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
      {
        name: 'sigMetadata',
        internalType: 'struct IStoryProtocolGateway.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'sigAttach',
        internalType: 'struct IStoryProtocolGateway.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'registerIpAndAttachPILTerms',
    outputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'derivData',
        internalType: 'struct IStoryProtocolGateway.MakeDerivative',
        type: 'tuple',
        components: [
          { name: 'parentIpIds', internalType: 'address[]', type: 'address[]' },
          { name: 'licenseTemplate', internalType: 'address', type: 'address' },
          {
            name: 'licenseTermsIds',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      {
        name: 'sigMetadata',
        internalType: 'struct IStoryProtocolGateway.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'sigRegister',
        internalType: 'struct IStoryProtocolGateway.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'registerIpAndMakeDerivative',
    outputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nftContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'licenseTokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
      {
        name: 'metadata',
        internalType: 'struct IStoryProtocolGateway.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'metadataURI', internalType: 'string', type: 'string' },
          { name: 'metadataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'nftMetadataHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      {
        name: 'sigMetadata',
        internalType: 'struct IStoryProtocolGateway.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'sigRegister',
        internalType: 'struct IStoryProtocolGateway.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'registerIpAndMakeDerivativeWithLicenseTokens',
    outputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      {
        name: 'terms',
        internalType: 'struct PILTerms',
        type: 'tuple',
        components: [
          { name: 'transferable', internalType: 'bool', type: 'bool' },
          { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
          { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
          { name: 'expiration', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'commercialRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'derivativesAllowed', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativesAttribution',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'derivativesApproval', internalType: 'bool', type: 'bool' },
          { name: 'derivativesReciprocal', internalType: 'bool', type: 'bool' },
          {
            name: 'derivativeRevCelling',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'uri', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'registerPILTermsAndAttach',
    outputs: [
      { name: 'licenseTermsId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newAuthority', internalType: 'address', type: 'address' },
    ],
    name: 'setAuthority',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newNftContractBeacon',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setNftContractBeacon',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newNftContract', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeCollections',
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x69415CE984A79a3Cfbe3F51024C63b6C107331e3)
 */
export const spgAddress = {
  11155111: '0x69415CE984A79a3Cfbe3F51024C63b6C107331e3',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x69415CE984A79a3Cfbe3F51024C63b6C107331e3)
 */
export const spgConfig = { address: spgAddress, abi: spgAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPGNFTBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x027D258659FBdda9033f9c008AF166239EBa67c1)
 */
export const spgnftBeaconAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'implementation_', internalType: 'address', type: 'address' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'BeaconInvalidImplementation',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
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
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x027D258659FBdda9033f9c008AF166239EBa67c1)
 */
export const spgnftBeaconAddress = {
  11155111: '0x027D258659FBdda9033f9c008AF166239EBa67c1',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x027D258659FBdda9033f9c008AF166239EBa67c1)
 */
export const spgnftBeaconConfig = {
  address: spgnftBeaconAddress,
  abi: spgnftBeaconAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPGNFTImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6)
 */
export const spgnftImplAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'spg', internalType: 'address', type: 'address' }],
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
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'SPGNFT_ZeroMaxSupply' },
  { type: 'error', inputs: [], name: 'SPGNFT__CallerNotSPG' },
  { type: 'error', inputs: [], name: 'SPGNFT__MaxSupplyReached' },
  { type: 'error', inputs: [], name: 'SPGNFT__ZeroAddressParam' },
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
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SPG_ADDRESS',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'maxSupply', internalType: 'uint32', type: 'uint32' },
      { name: 'mintCost', internalType: 'uint256', type: 'uint256' },
      { name: 'mintToken', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
      { name: 'payer', internalType: 'address', type: 'address' },
    ],
    name: 'mintBySPG',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mintCost',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mintToken',
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
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    inputs: [{ name: 'cost', internalType: 'uint256', type: 'uint256' }],
    name: 'setMintCost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'setMintToken',
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
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6)
 */
export const spgnftImplAddress = {
  11155111: '0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6)
 */
export const spgnftImplConfig = {
  address: spgnftImplAddress,
  abi: spgnftImplAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// COMMON =============================================================

function getAddress(
  address: Record<number, Address>,
  chainId?: number,
): Address {
  return address[chainId || 0] || '0x'
}

export type SimpleWalletClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = {
  account?: TAccount
  writeContract: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,
    args extends ContractFunctionArgs<
      abi,
      'payable' | 'nonpayable',
      functionName
    >,
    TChainOverride extends Chain | undefined = undefined,
  >(
    args: WriteContractParameters<
      abi,
      functionName,
      args,
      TChain,
      TAccount,
      TChainOverride
    >,
  ) => Promise<WriteContractReturnType>
}

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
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(accessControllerAddress, rpcClient.chain?.id)
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
  public parseTxPermissionSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<AccessControllerPermissionSetEvent> {
    const targetLogs: Array<AccessControllerPermissionSetEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: accessControllerAbi,
          eventName: 'PermissionSet',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'PermissionSet') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract AccessController write method
 */
export class AccessControllerClient extends AccessControllerEventClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
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
    return await this.wallet.writeContract(call as WriteContractParameters)
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
 * @param data bytes
 */
export type DisputeModuleResolveDisputeRequest = {
  disputeId: bigint
  data: Hex
}

/**
 * contract DisputeModule event
 */
export class DisputeModuleEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(disputeModuleAddress, rpcClient.chain?.id)
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
  public parseTxDisputeCancelledEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeCancelledEvent> {
    const targetLogs: Array<DisputeModuleDisputeCancelledEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: 'DisputeCancelled',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'DisputeCancelled') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
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
  public parseTxDisputeRaisedEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeRaisedEvent> {
    const targetLogs: Array<DisputeModuleDisputeRaisedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: 'DisputeRaised',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'DisputeRaised') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
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
  public parseTxDisputeResolvedEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeResolvedEvent> {
    const targetLogs: Array<DisputeModuleDisputeResolvedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: 'DisputeResolved',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'DisputeResolved') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract DisputeModule write method
 */
export class DisputeModuleClient extends DisputeModuleEventClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
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
    return await this.wallet.writeContract(call as WriteContractParameters)
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
    return await this.wallet.writeContract(call as WriteContractParameters)
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
      args: [request.disputeId, request.data],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
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
  protected readonly wallet: SimpleWalletClient
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    this.address =
      address || getAddress(ipAccountImplAddress, rpcClient.chain?.id)
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
    return await this.wallet.writeContract(call as WriteContractParameters)
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
    return await this.wallet.writeContract(call as WriteContractParameters)
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
 * @param chainid uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryRegisterRequest = {
  chainid: bigint
  tokenContract: Address
  tokenId: bigint
}

/**
 * contract IPAssetRegistry event
 */
export class IpAssetRegistryEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(ipAssetRegistryAddress, rpcClient.chain?.id)
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
  public parseTxIpRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpAssetRegistryIpRegisteredEvent> {
    const targetLogs: Array<IpAssetRegistryIpRegisteredEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipAssetRegistryAbi,
          eventName: 'IPRegistered',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'IPRegistered') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract IPAssetRegistry readonly method
 */
export class IpAssetRegistryReadOnlyClient extends IpAssetRegistryEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
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
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
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
      args: [request.chainid, request.tokenContract, request.tokenId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract IpRoyaltyVaultImpl =============================================================

/**
 * IpRoyaltyVaultImplRevenueTokenClaimedEvent
 *
 * @param claimer address
 * @param token address
 * @param amount uint256
 */
export type IpRoyaltyVaultImplRevenueTokenClaimedEvent = {
  claimer: Address
  token: Address
  amount: bigint
}

/**
 * IpRoyaltyVaultImplRoyaltyTokensCollectedEvent
 *
 * @param ancestorIpId address
 * @param royaltyTokensCollected uint256
 */
export type IpRoyaltyVaultImplRoyaltyTokensCollectedEvent = {
  ancestorIpId: Address
  royaltyTokensCollected: bigint
}

/**
 * IpRoyaltyVaultImplSnapshotCompletedEvent
 *
 * @param snapshotId uint256
 * @param snapshotTimestamp uint256
 * @param unclaimedTokens uint32
 */
export type IpRoyaltyVaultImplSnapshotCompletedEvent = {
  snapshotId: bigint
  snapshotTimestamp: bigint
  unclaimedTokens: number
}

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
 * @param tokenList address[]
 */
export type IpRoyaltyVaultImplClaimRevenueByTokenBatchRequest = {
  snapshotId: bigint
  tokenList: readonly Address[]
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
 * contract IpRoyaltyVaultImpl event
 */
export class IpRoyaltyVaultImplEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(ipRoyaltyVaultImplAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * event RevenueTokenClaimed for contract IpRoyaltyVaultImpl
   */
  public watchRevenueTokenClaimedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<IpRoyaltyVaultImplRevenueTokenClaimedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: 'RevenueTokenClaimed',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event RevenueTokenClaimed for contract IpRoyaltyVaultImpl
   */
  public parseTxRevenueTokenClaimedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplRevenueTokenClaimedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplRevenueTokenClaimedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: 'RevenueTokenClaimed',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'RevenueTokenClaimed')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event RoyaltyTokensCollected for contract IpRoyaltyVaultImpl
   */
  public watchRoyaltyTokensCollectedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<IpRoyaltyVaultImplRoyaltyTokensCollectedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: 'RoyaltyTokensCollected',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event RoyaltyTokensCollected for contract IpRoyaltyVaultImpl
   */
  public parseTxRoyaltyTokensCollectedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplRoyaltyTokensCollectedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplRoyaltyTokensCollectedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: 'RoyaltyTokensCollected',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'RoyaltyTokensCollected')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event SnapshotCompleted for contract IpRoyaltyVaultImpl
   */
  public watchSnapshotCompletedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<IpRoyaltyVaultImplSnapshotCompletedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: 'SnapshotCompleted',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event SnapshotCompleted for contract IpRoyaltyVaultImpl
   */
  public parseTxSnapshotCompletedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplSnapshotCompletedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplSnapshotCompletedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: 'SnapshotCompleted',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'SnapshotCompleted') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract IpRoyaltyVaultImpl readonly method
 */
export class IpRoyaltyVaultImplReadOnlyClient extends IpRoyaltyVaultImplEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address)
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
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
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
    return await this.wallet.writeContract(call as WriteContractParameters)
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
      args: [request.snapshotId, request.tokenList],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
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
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method snapshot for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplSnapshotRequest
   * @return Promise<WriteContractReturnType>
   */
  public async snapshot(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: 'snapshot',
      account: this.wallet.account,
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract LicenseRegistry =============================================================

/**
 * LicenseRegistryAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type LicenseRegistryAuthorityUpdatedEvent = {
  authority: Address
}

/**
 * LicenseRegistryExpirationTimeSetEvent
 *
 * @param ipId address
 * @param expireTime uint256
 */
export type LicenseRegistryExpirationTimeSetEvent = {
  ipId: Address
  expireTime: bigint
}

/**
 * LicenseRegistryInitializedEvent
 *
 * @param version uint64
 */
export type LicenseRegistryInitializedEvent = {
  version: bigint
}

/**
 * LicenseRegistryLicenseTemplateRegisteredEvent
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryLicenseTemplateRegisteredEvent = {
  licenseTemplate: Address
}

/**
 * LicenseRegistryLicensingConfigSetForIpEvent
 *
 * @param ipId address
 * @param licensingConfig tuple
 */
export type LicenseRegistryLicensingConfigSetForIpEvent = {
  ipId: Address
  licensingConfig: {
    isSet: boolean
    mintingFee: bigint
    licensingHook: Address
    hookData: Hex
  }
}

/**
 * LicenseRegistryLicensingConfigSetForLicenseEvent
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryLicensingConfigSetForLicenseEvent = {
  ipId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
}

/**
 * LicenseRegistryUpgradedEvent
 *
 * @param implementation address
 */
export type LicenseRegistryUpgradedEvent = {
  implementation: Address
}

export type LicenseRegistryDisputeModuleResponse = Address

export type LicenseRegistryExpirationTimeResponse = Hex

export type LicenseRegistryLicensingModuleResponse = Address

export type LicenseRegistryUpgradeInterfaceVersionResponse = string

export type LicenseRegistryAuthorityResponse = Address

/**
 * LicenseRegistryExistsRequest
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryExistsRequest = {
  licenseTemplate: Address
  licenseTermsId: bigint
}

export type LicenseRegistryExistsResponse = boolean

/**
 * LicenseRegistryGetAttachedLicenseTermsRequest
 *
 * @param ipId address
 * @param index uint256
 */
export type LicenseRegistryGetAttachedLicenseTermsRequest = {
  ipId: Address
  index: bigint
}

/**
 * LicenseRegistryGetAttachedLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetAttachedLicenseTermsResponse = {
  licenseTemplate: Address
  licenseTermsId: bigint
}

/**
 * LicenseRegistryGetAttachedLicenseTermsCountRequest
 *
 * @param ipId address
 */
export type LicenseRegistryGetAttachedLicenseTermsCountRequest = {
  ipId: Address
}

export type LicenseRegistryGetAttachedLicenseTermsCountResponse = bigint

/**
 * LicenseRegistryGetDefaultLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetDefaultLicenseTermsResponse = {
  licenseTemplate: Address
  licenseTermsId: bigint
}

/**
 * LicenseRegistryGetDerivativeIpRequest
 *
 * @param parentIpId address
 * @param index uint256
 */
export type LicenseRegistryGetDerivativeIpRequest = {
  parentIpId: Address
  index: bigint
}

/**
 * LicenseRegistryGetDerivativeIpResponse
 *
 * @param childIpId address
 */
export type LicenseRegistryGetDerivativeIpResponse = {
  childIpId: Address
}

/**
 * LicenseRegistryGetDerivativeIpCountRequest
 *
 * @param parentIpId address
 */
export type LicenseRegistryGetDerivativeIpCountRequest = {
  parentIpId: Address
}

export type LicenseRegistryGetDerivativeIpCountResponse = bigint

/**
 * LicenseRegistryGetExpireTimeRequest
 *
 * @param ipId address
 */
export type LicenseRegistryGetExpireTimeRequest = {
  ipId: Address
}

export type LicenseRegistryGetExpireTimeResponse = bigint

/**
 * LicenseRegistryGetLicensingConfigRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetLicensingConfigRequest = {
  ipId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
}

export type LicenseRegistryGetLicensingConfigResponse = {
  isSet: boolean
  mintingFee: bigint
  licensingHook: Address
  hookData: Hex
}

/**
 * LicenseRegistryGetParentIpRequest
 *
 * @param childIpId address
 * @param index uint256
 */
export type LicenseRegistryGetParentIpRequest = {
  childIpId: Address
  index: bigint
}

/**
 * LicenseRegistryGetParentIpResponse
 *
 * @param parentIpId address
 */
export type LicenseRegistryGetParentIpResponse = {
  parentIpId: Address
}

/**
 * LicenseRegistryGetParentIpCountRequest
 *
 * @param childIpId address
 */
export type LicenseRegistryGetParentIpCountRequest = {
  childIpId: Address
}

export type LicenseRegistryGetParentIpCountResponse = bigint

/**
 * LicenseRegistryHasDerivativeIpsRequest
 *
 * @param parentIpId address
 */
export type LicenseRegistryHasDerivativeIpsRequest = {
  parentIpId: Address
}

export type LicenseRegistryHasDerivativeIpsResponse = boolean

/**
 * LicenseRegistryHasIpAttachedLicenseTermsRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryHasIpAttachedLicenseTermsRequest = {
  ipId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
}

export type LicenseRegistryHasIpAttachedLicenseTermsResponse = boolean

export type LicenseRegistryIsConsumingScheduledOpResponse = Hex

/**
 * LicenseRegistryIsDerivativeIpRequest
 *
 * @param childIpId address
 */
export type LicenseRegistryIsDerivativeIpRequest = {
  childIpId: Address
}

export type LicenseRegistryIsDerivativeIpResponse = boolean

/**
 * LicenseRegistryIsExpiredNowRequest
 *
 * @param ipId address
 */
export type LicenseRegistryIsExpiredNowRequest = {
  ipId: Address
}

export type LicenseRegistryIsExpiredNowResponse = boolean

/**
 * LicenseRegistryIsParentIpRequest
 *
 * @param parentIpId address
 * @param childIpId address
 */
export type LicenseRegistryIsParentIpRequest = {
  parentIpId: Address
  childIpId: Address
}

export type LicenseRegistryIsParentIpResponse = boolean

/**
 * LicenseRegistryIsRegisteredLicenseTemplateRequest
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryIsRegisteredLicenseTemplateRequest = {
  licenseTemplate: Address
}

export type LicenseRegistryIsRegisteredLicenseTemplateResponse = boolean

export type LicenseRegistryProxiableUuidResponse = Hex

/**
 * LicenseRegistryVerifyMintLicenseTokenRequest
 *
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param isMintedByIpOwner bool
 */
export type LicenseRegistryVerifyMintLicenseTokenRequest = {
  licensorIpId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
  isMintedByIpOwner: boolean
}

export type LicenseRegistryVerifyMintLicenseTokenResponse = {
  isSet: boolean
  mintingFee: bigint
  licensingHook: Address
  hookData: Hex
}

/**
 * LicenseRegistryAttachLicenseTermsToIpRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryAttachLicenseTermsToIpRequest = {
  ipId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
}

/**
 * LicenseRegistryInitializeRequest
 *
 * @param accessManager address
 */
export type LicenseRegistryInitializeRequest = {
  accessManager: Address
}

/**
 * LicenseRegistryRegisterDerivativeIpRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTemplate address
 * @param licenseTermsIds uint256[]
 */
export type LicenseRegistryRegisterDerivativeIpRequest = {
  childIpId: Address
  parentIpIds: readonly Address[]
  licenseTemplate: Address
  licenseTermsIds: readonly bigint[]
}

/**
 * LicenseRegistryRegisterLicenseTemplateRequest
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryRegisterLicenseTemplateRequest = {
  licenseTemplate: Address
}

/**
 * LicenseRegistrySetAuthorityRequest
 *
 * @param newAuthority address
 */
export type LicenseRegistrySetAuthorityRequest = {
  newAuthority: Address
}

/**
 * LicenseRegistrySetDefaultLicenseTermsRequest
 *
 * @param newLicenseTemplate address
 * @param newLicenseTermsId uint256
 */
export type LicenseRegistrySetDefaultLicenseTermsRequest = {
  newLicenseTemplate: Address
  newLicenseTermsId: bigint
}

/**
 * LicenseRegistrySetExpireTimeRequest
 *
 * @param ipId address
 * @param expireTime uint256
 */
export type LicenseRegistrySetExpireTimeRequest = {
  ipId: Address
  expireTime: bigint
}

/**
 * LicenseRegistrySetLicensingConfigForIpRequest
 *
 * @param ipId address
 * @param licensingConfig tuple
 */
export type LicenseRegistrySetLicensingConfigForIpRequest = {
  ipId: Address
  licensingConfig: {
    isSet: boolean
    mintingFee: bigint
    licensingHook: Address
    hookData: Hex
  }
}

/**
 * LicenseRegistrySetLicensingConfigForLicenseRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param licensingConfig tuple
 */
export type LicenseRegistrySetLicensingConfigForLicenseRequest = {
  ipId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
  licensingConfig: {
    isSet: boolean
    mintingFee: bigint
    licensingHook: Address
    hookData: Hex
  }
}

/**
 * LicenseRegistryUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type LicenseRegistryUpgradeToAndCallRequest = {
  newImplementation: Address
  data: Hex
}

/**
 * contract LicenseRegistry event
 */
export class LicenseRegistryEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(licenseRegistryAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * event AuthorityUpdated for contract LicenseRegistry
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryAuthorityUpdatedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'AuthorityUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract LicenseRegistry
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryAuthorityUpdatedEvent> {
    const targetLogs: Array<LicenseRegistryAuthorityUpdatedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'AuthorityUpdated',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'AuthorityUpdated') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event ExpirationTimeSet for contract LicenseRegistry
   */
  public watchExpirationTimeSetEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryExpirationTimeSetEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'ExpirationTimeSet',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event ExpirationTimeSet for contract LicenseRegistry
   */
  public parseTxExpirationTimeSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryExpirationTimeSetEvent> {
    const targetLogs: Array<LicenseRegistryExpirationTimeSetEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'ExpirationTimeSet',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'ExpirationTimeSet') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Initialized for contract LicenseRegistry
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'Initialized',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Initialized for contract LicenseRegistry
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryInitializedEvent> {
    const targetLogs: Array<LicenseRegistryInitializedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'Initialized',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Initialized') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event LicenseTemplateRegistered for contract LicenseRegistry
   */
  public watchLicenseTemplateRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryLicenseTemplateRegisteredEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'LicenseTemplateRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event LicenseTemplateRegistered for contract LicenseRegistry
   */
  public parseTxLicenseTemplateRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicenseTemplateRegisteredEvent> {
    const targetLogs: Array<LicenseRegistryLicenseTemplateRegisteredEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'LicenseTemplateRegistered',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'LicenseTemplateRegistered')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event LicensingConfigSetForIP for contract LicenseRegistry
   */
  public watchLicensingConfigSetForIpEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryLicensingConfigSetForIpEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'LicensingConfigSetForIP',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event LicensingConfigSetForIP for contract LicenseRegistry
   */
  public parseTxLicensingConfigSetForIpEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicensingConfigSetForIpEvent> {
    const targetLogs: Array<LicenseRegistryLicensingConfigSetForIpEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'LicensingConfigSetForIP',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'LicensingConfigSetForIP')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event LicensingConfigSetForLicense for contract LicenseRegistry
   */
  public watchLicensingConfigSetForLicenseEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicenseRegistryLicensingConfigSetForLicenseEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'LicensingConfigSetForLicense',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event LicensingConfigSetForLicense for contract LicenseRegistry
   */
  public parseTxLicensingConfigSetForLicenseEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicensingConfigSetForLicenseEvent> {
    const targetLogs: Array<LicenseRegistryLicensingConfigSetForLicenseEvent> =
      []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'LicensingConfigSetForLicense',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'LicensingConfigSetForLicense')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Upgraded for contract LicenseRegistry
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: 'Upgraded',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Upgraded for contract LicenseRegistry
   */
  public parseTxUpgradedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryUpgradedEvent> {
    const targetLogs: Array<LicenseRegistryUpgradedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: 'Upgraded',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Upgraded') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract LicenseRegistry readonly method
 */
export class LicenseRegistryReadOnlyClient extends LicenseRegistryEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address)
  }

  /**
   * method DISPUTE_MODULE for contract LicenseRegistry
   *
   * @param request LicenseRegistryDisputeModuleRequest
   * @return Promise<LicenseRegistryDisputeModuleResponse>
   */
  public async disputeModule(): Promise<LicenseRegistryDisputeModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'DISPUTE_MODULE',
    })
  }

  /**
   * method EXPIRATION_TIME for contract LicenseRegistry
   *
   * @param request LicenseRegistryExpirationTimeRequest
   * @return Promise<LicenseRegistryExpirationTimeResponse>
   */
  public async expirationTime(): Promise<LicenseRegistryExpirationTimeResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'EXPIRATION_TIME',
    })
  }

  /**
   * method LICENSING_MODULE for contract LicenseRegistry
   *
   * @param request LicenseRegistryLicensingModuleRequest
   * @return Promise<LicenseRegistryLicensingModuleResponse>
   */
  public async licensingModule(): Promise<LicenseRegistryLicensingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'LICENSING_MODULE',
    })
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract LicenseRegistry
   *
   * @param request LicenseRegistryUpgradeInterfaceVersionRequest
   * @return Promise<LicenseRegistryUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<LicenseRegistryUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'UPGRADE_INTERFACE_VERSION',
    })
  }

  /**
   * method authority for contract LicenseRegistry
   *
   * @param request LicenseRegistryAuthorityRequest
   * @return Promise<LicenseRegistryAuthorityResponse>
   */
  public async authority(): Promise<LicenseRegistryAuthorityResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'authority',
    })
  }

  /**
   * method exists for contract LicenseRegistry
   *
   * @param request LicenseRegistryExistsRequest
   * @return Promise<LicenseRegistryExistsResponse>
   */
  public async exists(
    request: LicenseRegistryExistsRequest,
  ): Promise<LicenseRegistryExistsResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'exists',
      args: [request.licenseTemplate, request.licenseTermsId],
    })
  }

  /**
   * method getAttachedLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetAttachedLicenseTermsRequest
   * @return Promise<LicenseRegistryGetAttachedLicenseTermsResponse>
   */
  public async getAttachedLicenseTerms(
    request: LicenseRegistryGetAttachedLicenseTermsRequest,
  ): Promise<LicenseRegistryGetAttachedLicenseTermsResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getAttachedLicenseTerms',
      args: [request.ipId, request.index],
    })
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    }
  }

  /**
   * method getAttachedLicenseTermsCount for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetAttachedLicenseTermsCountRequest
   * @return Promise<LicenseRegistryGetAttachedLicenseTermsCountResponse>
   */
  public async getAttachedLicenseTermsCount(
    request: LicenseRegistryGetAttachedLicenseTermsCountRequest,
  ): Promise<LicenseRegistryGetAttachedLicenseTermsCountResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getAttachedLicenseTermsCount',
      args: [request.ipId],
    })
  }

  /**
   * method getDefaultLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetDefaultLicenseTermsRequest
   * @return Promise<LicenseRegistryGetDefaultLicenseTermsResponse>
   */
  public async getDefaultLicenseTerms(): Promise<LicenseRegistryGetDefaultLicenseTermsResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getDefaultLicenseTerms',
    })
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    }
  }

  /**
   * method getDerivativeIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetDerivativeIpRequest
   * @return Promise<LicenseRegistryGetDerivativeIpResponse>
   */
  public async getDerivativeIp(
    request: LicenseRegistryGetDerivativeIpRequest,
  ): Promise<LicenseRegistryGetDerivativeIpResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getDerivativeIp',
      args: [request.parentIpId, request.index],
    })
    return {
      childIpId: result,
    }
  }

  /**
   * method getDerivativeIpCount for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetDerivativeIpCountRequest
   * @return Promise<LicenseRegistryGetDerivativeIpCountResponse>
   */
  public async getDerivativeIpCount(
    request: LicenseRegistryGetDerivativeIpCountRequest,
  ): Promise<LicenseRegistryGetDerivativeIpCountResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getDerivativeIpCount',
      args: [request.parentIpId],
    })
  }

  /**
   * method getExpireTime for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetExpireTimeRequest
   * @return Promise<LicenseRegistryGetExpireTimeResponse>
   */
  public async getExpireTime(
    request: LicenseRegistryGetExpireTimeRequest,
  ): Promise<LicenseRegistryGetExpireTimeResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getExpireTime',
      args: [request.ipId],
    })
  }

  /**
   * method getLicensingConfig for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetLicensingConfigRequest
   * @return Promise<LicenseRegistryGetLicensingConfigResponse>
   */
  public async getLicensingConfig(
    request: LicenseRegistryGetLicensingConfigRequest,
  ): Promise<LicenseRegistryGetLicensingConfigResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getLicensingConfig',
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    })
  }

  /**
   * method getParentIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetParentIpRequest
   * @return Promise<LicenseRegistryGetParentIpResponse>
   */
  public async getParentIp(
    request: LicenseRegistryGetParentIpRequest,
  ): Promise<LicenseRegistryGetParentIpResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getParentIp',
      args: [request.childIpId, request.index],
    })
    return {
      parentIpId: result,
    }
  }

  /**
   * method getParentIpCount for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetParentIpCountRequest
   * @return Promise<LicenseRegistryGetParentIpCountResponse>
   */
  public async getParentIpCount(
    request: LicenseRegistryGetParentIpCountRequest,
  ): Promise<LicenseRegistryGetParentIpCountResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'getParentIpCount',
      args: [request.childIpId],
    })
  }

  /**
   * method hasDerivativeIps for contract LicenseRegistry
   *
   * @param request LicenseRegistryHasDerivativeIpsRequest
   * @return Promise<LicenseRegistryHasDerivativeIpsResponse>
   */
  public async hasDerivativeIps(
    request: LicenseRegistryHasDerivativeIpsRequest,
  ): Promise<LicenseRegistryHasDerivativeIpsResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'hasDerivativeIps',
      args: [request.parentIpId],
    })
  }

  /**
   * method hasIpAttachedLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryHasIpAttachedLicenseTermsRequest
   * @return Promise<LicenseRegistryHasIpAttachedLicenseTermsResponse>
   */
  public async hasIpAttachedLicenseTerms(
    request: LicenseRegistryHasIpAttachedLicenseTermsRequest,
  ): Promise<LicenseRegistryHasIpAttachedLicenseTermsResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'hasIpAttachedLicenseTerms',
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    })
  }

  /**
   * method isConsumingScheduledOp for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsConsumingScheduledOpRequest
   * @return Promise<LicenseRegistryIsConsumingScheduledOpResponse>
   */
  public async isConsumingScheduledOp(): Promise<LicenseRegistryIsConsumingScheduledOpResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isConsumingScheduledOp',
    })
  }

  /**
   * method isDerivativeIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsDerivativeIpRequest
   * @return Promise<LicenseRegistryIsDerivativeIpResponse>
   */
  public async isDerivativeIp(
    request: LicenseRegistryIsDerivativeIpRequest,
  ): Promise<LicenseRegistryIsDerivativeIpResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isDerivativeIp',
      args: [request.childIpId],
    })
  }

  /**
   * method isExpiredNow for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsExpiredNowRequest
   * @return Promise<LicenseRegistryIsExpiredNowResponse>
   */
  public async isExpiredNow(
    request: LicenseRegistryIsExpiredNowRequest,
  ): Promise<LicenseRegistryIsExpiredNowResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isExpiredNow',
      args: [request.ipId],
    })
  }

  /**
   * method isParentIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsParentIpRequest
   * @return Promise<LicenseRegistryIsParentIpResponse>
   */
  public async isParentIp(
    request: LicenseRegistryIsParentIpRequest,
  ): Promise<LicenseRegistryIsParentIpResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isParentIp',
      args: [request.parentIpId, request.childIpId],
    })
  }

  /**
   * method isRegisteredLicenseTemplate for contract LicenseRegistry
   *
   * @param request LicenseRegistryIsRegisteredLicenseTemplateRequest
   * @return Promise<LicenseRegistryIsRegisteredLicenseTemplateResponse>
   */
  public async isRegisteredLicenseTemplate(
    request: LicenseRegistryIsRegisteredLicenseTemplateRequest,
  ): Promise<LicenseRegistryIsRegisteredLicenseTemplateResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'isRegisteredLicenseTemplate',
      args: [request.licenseTemplate],
    })
  }

  /**
   * method proxiableUUID for contract LicenseRegistry
   *
   * @param request LicenseRegistryProxiableUuidRequest
   * @return Promise<LicenseRegistryProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<LicenseRegistryProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'proxiableUUID',
    })
  }

  /**
   * method verifyMintLicenseToken for contract LicenseRegistry
   *
   * @param request LicenseRegistryVerifyMintLicenseTokenRequest
   * @return Promise<LicenseRegistryVerifyMintLicenseTokenResponse>
   */
  public async verifyMintLicenseToken(
    request: LicenseRegistryVerifyMintLicenseTokenRequest,
  ): Promise<LicenseRegistryVerifyMintLicenseTokenResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'verifyMintLicenseToken',
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.isMintedByIpOwner,
      ],
    })
  }
}

/**
 * contract LicenseRegistry write method
 */
export class LicenseRegistryClient extends LicenseRegistryReadOnlyClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method attachLicenseTermsToIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryAttachLicenseTermsToIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async attachLicenseTermsToIp(
    request: LicenseRegistryAttachLicenseTermsToIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'attachLicenseTermsToIp',
      account: this.wallet.account,
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method initialize for contract LicenseRegistry
   *
   * @param request LicenseRegistryInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: LicenseRegistryInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'initialize',
      account: this.wallet.account,
      args: [request.accessManager],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method registerDerivativeIp for contract LicenseRegistry
   *
   * @param request LicenseRegistryRegisterDerivativeIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivativeIp(
    request: LicenseRegistryRegisterDerivativeIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'registerDerivativeIp',
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTemplate,
        request.licenseTermsIds,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method registerLicenseTemplate for contract LicenseRegistry
   *
   * @param request LicenseRegistryRegisterLicenseTemplateRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerLicenseTemplate(
    request: LicenseRegistryRegisterLicenseTemplateRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'registerLicenseTemplate',
      account: this.wallet.account,
      args: [request.licenseTemplate],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setAuthority for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetAuthorityRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAuthority(
    request: LicenseRegistrySetAuthorityRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setAuthority',
      account: this.wallet.account,
      args: [request.newAuthority],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setDefaultLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetDefaultLicenseTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setDefaultLicenseTerms(
    request: LicenseRegistrySetDefaultLicenseTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setDefaultLicenseTerms',
      account: this.wallet.account,
      args: [request.newLicenseTemplate, request.newLicenseTermsId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setExpireTime for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetExpireTimeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setExpireTime(
    request: LicenseRegistrySetExpireTimeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setExpireTime',
      account: this.wallet.account,
      args: [request.ipId, request.expireTime],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setLicensingConfigForIp for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetLicensingConfigForIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setLicensingConfigForIp(
    request: LicenseRegistrySetLicensingConfigForIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setLicensingConfigForIp',
      account: this.wallet.account,
      args: [request.ipId, request.licensingConfig],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setLicensingConfigForLicense for contract LicenseRegistry
   *
   * @param request LicenseRegistrySetLicensingConfigForLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setLicensingConfigForLicense(
    request: LicenseRegistrySetLicensingConfigForLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'setLicensingConfigForLicense',
      account: this.wallet.account,
      args: [
        request.ipId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.licensingConfig,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method upgradeToAndCall for contract LicenseRegistry
   *
   * @param request LicenseRegistryUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: LicenseRegistryUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: 'upgradeToAndCall',
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract LicenseToken =============================================================

/**
 * LicenseTokenOwnerOfRequest
 *
 * @param tokenId uint256
 */
export type LicenseTokenOwnerOfRequest = {
  tokenId: bigint
}

export type LicenseTokenOwnerOfResponse = Address

/**
 * contract LicenseToken readonly method
 */
export class LicenseTokenReadOnlyClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(licenseTokenAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * method ownerOf for contract LicenseToken
   *
   * @param request LicenseTokenOwnerOfRequest
   * @return Promise<LicenseTokenOwnerOfResponse>
   */
  public async ownerOf(
    request: LicenseTokenOwnerOfRequest,
  ): Promise<LicenseTokenOwnerOfResponse> {
    return await this.rpcClient.readContract({
      abi: licenseTokenAbi,
      address: this.address,
      functionName: 'ownerOf',
      args: [request.tokenId],
    })
  }
}

// Contract LicensingModule =============================================================

/**
 * LicensingModuleLicenseTokensMintedEvent
 *
 * @param caller address
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param amount uint256
 * @param receiver address
 * @param startLicenseTokenId uint256
 */
export type LicensingModuleLicenseTokensMintedEvent = {
  caller: Address
  licensorIpId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
  amount: bigint
  receiver: Address
  startLicenseTokenId: bigint
}

/**
 * LicensingModuleAttachLicenseTermsRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicensingModuleAttachLicenseTermsRequest = {
  ipId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
}

/**
 * LicensingModuleMintLicenseTokensRequest
 *
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param amount uint256
 * @param receiver address
 * @param royaltyContext bytes
 */
export type LicensingModuleMintLicenseTokensRequest = {
  licensorIpId: Address
  licenseTemplate: Address
  licenseTermsId: bigint
  amount: bigint
  receiver: Address
  royaltyContext: Hex
}

/**
 * LicensingModuleRegisterDerivativeRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTermsIds uint256[]
 * @param licenseTemplate address
 * @param royaltyContext bytes
 */
export type LicensingModuleRegisterDerivativeRequest = {
  childIpId: Address
  parentIpIds: readonly Address[]
  licenseTermsIds: readonly bigint[]
  licenseTemplate: Address
  royaltyContext: Hex
}

/**
 * LicensingModuleRegisterDerivativeWithLicenseTokensRequest
 *
 * @param childIpId address
 * @param licenseTokenIds uint256[]
 * @param royaltyContext bytes
 */
export type LicensingModuleRegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Address
  licenseTokenIds: readonly bigint[]
  royaltyContext: Hex
}

/**
 * contract LicensingModule event
 */
export class LicensingModuleEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(licensingModuleAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * event LicenseTokensMinted for contract LicensingModule
   */
  public watchLicenseTokensMintedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<LicensingModuleLicenseTokensMintedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: 'LicenseTokensMinted',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event LicenseTokensMinted for contract LicensingModule
   */
  public parseTxLicenseTokensMintedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicensingModuleLicenseTokensMintedEvent> {
    const targetLogs: Array<LicensingModuleLicenseTokensMintedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licensingModuleAbi,
          eventName: 'LicenseTokensMinted',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'LicenseTokensMinted')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract LicensingModule write method
 */
export class LicensingModuleClient extends LicensingModuleEventClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method attachLicenseTerms for contract LicensingModule
   *
   * @param request LicensingModuleAttachLicenseTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async attachLicenseTerms(
    request: LicensingModuleAttachLicenseTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'attachLicenseTerms',
      account: this.wallet.account,
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method mintLicenseTokens for contract LicensingModule
   *
   * @param request LicensingModuleMintLicenseTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintLicenseTokens(
    request: LicensingModuleMintLicenseTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'mintLicenseTokens',
      account: this.wallet.account,
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.amount,
        request.receiver,
        request.royaltyContext,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method registerDerivative for contract LicensingModule
   *
   * @param request LicensingModuleRegisterDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivative(
    request: LicensingModuleRegisterDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'registerDerivative',
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTermsIds,
        request.licenseTemplate,
        request.royaltyContext,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method registerDerivativeWithLicenseTokens for contract LicensingModule
   *
   * @param request LicensingModuleRegisterDerivativeWithLicenseTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerDerivativeWithLicenseTokens(
    request: LicensingModuleRegisterDerivativeWithLicenseTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: 'registerDerivativeWithLicenseTokens',
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.licenseTokenIds,
        request.royaltyContext,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
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
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(moduleRegistryAddress, rpcClient.chain?.id)
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

// Contract PILicenseTemplate =============================================================

/**
 * PiLicenseTemplateAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type PiLicenseTemplateAuthorityUpdatedEvent = {
  authority: Address
}

/**
 * PiLicenseTemplateDerivativeApprovedEvent
 *
 * @param licenseTermsId uint256
 * @param ipId address
 * @param caller address
 * @param approved bool
 */
export type PiLicenseTemplateDerivativeApprovedEvent = {
  licenseTermsId: bigint
  ipId: Address
  caller: Address
  approved: boolean
}

/**
 * PiLicenseTemplateInitializedEvent
 *
 * @param version uint64
 */
export type PiLicenseTemplateInitializedEvent = {
  version: bigint
}

/**
 * PiLicenseTemplateLicenseTermsRegisteredEvent
 *
 * @param licenseTermsId uint256
 * @param licenseTemplate address
 * @param licenseTerms bytes
 */
export type PiLicenseTemplateLicenseTermsRegisteredEvent = {
  licenseTermsId: bigint
  licenseTemplate: Address
  licenseTerms: Hex
}

/**
 * PiLicenseTemplateUpgradedEvent
 *
 * @param implementation address
 */
export type PiLicenseTemplateUpgradedEvent = {
  implementation: Address
}

export type PiLicenseTemplateAccessControllerResponse = Address

export type PiLicenseTemplateIpAccountRegistryResponse = Address

export type PiLicenseTemplateLicenseRegistryResponse = Address

export type PiLicenseTemplateRoyaltyModuleResponse = Address

export type PiLicenseTemplateUpgradeInterfaceVersionResponse = string

export type PiLicenseTemplateAuthorityResponse = Address

/**
 * PiLicenseTemplateExistsRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateExistsRequest = {
  licenseTermsId: bigint
}

export type PiLicenseTemplateExistsResponse = boolean

/**
 * PiLicenseTemplateGetEarlierExpireTimeRequest
 *
 * @param licenseTermsIds uint256[]
 * @param start uint256
 */
export type PiLicenseTemplateGetEarlierExpireTimeRequest = {
  licenseTermsIds: readonly bigint[]
  start: bigint
}

export type PiLicenseTemplateGetEarlierExpireTimeResponse = bigint

/**
 * PiLicenseTemplateGetExpireTimeRequest
 *
 * @param licenseTermsId uint256
 * @param start uint256
 */
export type PiLicenseTemplateGetExpireTimeRequest = {
  licenseTermsId: bigint
  start: bigint
}

export type PiLicenseTemplateGetExpireTimeResponse = bigint

/**
 * PiLicenseTemplateGetLicenseTermsRequest
 *
 * @param selectedLicenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsRequest = {
  selectedLicenseTermsId: bigint
}

/**
 * PiLicenseTemplateGetLicenseTermsResponse
 *
 * @param terms tuple
 */
export type PiLicenseTemplateGetLicenseTermsResponse = {
  terms: {
    transferable: boolean
    royaltyPolicy: Address
    mintingFee: bigint
    expiration: bigint
    commercialUse: boolean
    commercialAttribution: boolean
    commercializerChecker: Address
    commercializerCheckerData: Hex
    commercialRevShare: number
    commercialRevCelling: bigint
    derivativesAllowed: boolean
    derivativesAttribution: boolean
    derivativesApproval: boolean
    derivativesReciprocal: boolean
    derivativeRevCelling: bigint
    currency: Address
    uri: string
  }
}

/**
 * PiLicenseTemplateGetLicenseTermsIdRequest
 *
 * @param terms tuple
 */
export type PiLicenseTemplateGetLicenseTermsIdRequest = {
  terms: {
    transferable: boolean
    royaltyPolicy: Address
    mintingFee: bigint
    expiration: bigint
    commercialUse: boolean
    commercialAttribution: boolean
    commercializerChecker: Address
    commercializerCheckerData: Hex
    commercialRevShare: number
    commercialRevCelling: bigint
    derivativesAllowed: boolean
    derivativesAttribution: boolean
    derivativesApproval: boolean
    derivativesReciprocal: boolean
    derivativeRevCelling: bigint
    currency: Address
    uri: string
  }
}

/**
 * PiLicenseTemplateGetLicenseTermsIdResponse
 *
 * @param selectedLicenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsIdResponse = {
  selectedLicenseTermsId: bigint
}

/**
 * PiLicenseTemplateGetLicenseTermsUriRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsUriRequest = {
  licenseTermsId: bigint
}

export type PiLicenseTemplateGetLicenseTermsUriResponse = string

export type PiLicenseTemplateGetMetadataUriResponse = string

/**
 * PiLicenseTemplateGetRoyaltyPolicyRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateGetRoyaltyPolicyRequest = {
  licenseTermsId: bigint
}

/**
 * PiLicenseTemplateGetRoyaltyPolicyResponse
 *
 * @param royaltyPolicy address
 * @param royaltyData bytes
 * @param mintingFee uint256
 * @param currency address
 */
export type PiLicenseTemplateGetRoyaltyPolicyResponse = {
  royaltyPolicy: Address
  royaltyData: Hex
  mintingFee: bigint
  currency: Address
}

export type PiLicenseTemplateIsConsumingScheduledOpResponse = Hex

/**
 * PiLicenseTemplateIsDerivativeApprovedRequest
 *
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param childIpId address
 */
export type PiLicenseTemplateIsDerivativeApprovedRequest = {
  parentIpId: Address
  licenseTermsId: bigint
  childIpId: Address
}

export type PiLicenseTemplateIsDerivativeApprovedResponse = boolean

/**
 * PiLicenseTemplateIsLicenseTransferableRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateIsLicenseTransferableRequest = {
  licenseTermsId: bigint
}

export type PiLicenseTemplateIsLicenseTransferableResponse = boolean

export type PiLicenseTemplateNameResponse = string

export type PiLicenseTemplateProxiableUuidResponse = Hex

/**
 * PiLicenseTemplateSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type PiLicenseTemplateSupportsInterfaceRequest = {
  interfaceId: Hex
}

export type PiLicenseTemplateSupportsInterfaceResponse = boolean

/**
 * PiLicenseTemplateToJsonRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateToJsonRequest = {
  licenseTermsId: bigint
}

export type PiLicenseTemplateToJsonResponse = string

export type PiLicenseTemplateTotalRegisteredLicenseTermsResponse = bigint

/**
 * PiLicenseTemplateVerifyCompatibleLicensesRequest
 *
 * @param licenseTermsIds uint256[]
 */
export type PiLicenseTemplateVerifyCompatibleLicensesRequest = {
  licenseTermsIds: readonly bigint[]
}

export type PiLicenseTemplateVerifyCompatibleLicensesResponse = boolean

/**
 * PiLicenseTemplateInitializeRequest
 *
 * @param accessManager address
 * @param name string
 * @param metadataURI string
 */
export type PiLicenseTemplateInitializeRequest = {
  accessManager: Address
  name: string
  metadataURI: string
}

/**
 * PiLicenseTemplateRegisterLicenseTermsRequest
 *
 * @param terms tuple
 */
export type PiLicenseTemplateRegisterLicenseTermsRequest = {
  terms: {
    transferable: boolean
    royaltyPolicy: Address
    mintingFee: bigint
    expiration: bigint
    commercialUse: boolean
    commercialAttribution: boolean
    commercializerChecker: Address
    commercializerCheckerData: Hex
    commercialRevShare: number
    commercialRevCelling: bigint
    derivativesAllowed: boolean
    derivativesAttribution: boolean
    derivativesApproval: boolean
    derivativesReciprocal: boolean
    derivativeRevCelling: bigint
    currency: Address
    uri: string
  }
}

/**
 * PiLicenseTemplateSetApprovalRequest
 *
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param childIpId address
 * @param approved bool
 */
export type PiLicenseTemplateSetApprovalRequest = {
  parentIpId: Address
  licenseTermsId: bigint
  childIpId: Address
  approved: boolean
}

/**
 * PiLicenseTemplateSetAuthorityRequest
 *
 * @param newAuthority address
 */
export type PiLicenseTemplateSetAuthorityRequest = {
  newAuthority: Address
}

/**
 * PiLicenseTemplateUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type PiLicenseTemplateUpgradeToAndCallRequest = {
  newImplementation: Address
  data: Hex
}

/**
 * PiLicenseTemplateVerifyMintLicenseTokenRequest
 *
 * @param 0 uint256
 * @param 1 address
 * @param 2 address
 * @param 3 uint256
 */
export type PiLicenseTemplateVerifyMintLicenseTokenRequest = readonly [
  bigint,
  Address,
  Address,
  bigint,
]

/**
 * PiLicenseTemplateVerifyRegisterDerivativeRequest
 *
 * @param childIpId address
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param licensee address
 */
export type PiLicenseTemplateVerifyRegisterDerivativeRequest = {
  childIpId: Address
  parentIpId: Address
  licenseTermsId: bigint
  licensee: Address
}

/**
 * PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTermsIds uint256[]
 * @param childIpOwner address
 */
export type PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest = {
  childIpId: Address
  parentIpIds: readonly Address[]
  licenseTermsIds: readonly bigint[]
  childIpOwner: Address
}

/**
 * contract PILicenseTemplate event
 */
export class PiLicenseTemplateEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(piLicenseTemplateAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * event AuthorityUpdated for contract PILicenseTemplate
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<PiLicenseTemplateAuthorityUpdatedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: 'AuthorityUpdated',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract PILicenseTemplate
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateAuthorityUpdatedEvent> {
    const targetLogs: Array<PiLicenseTemplateAuthorityUpdatedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: 'AuthorityUpdated',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'AuthorityUpdated') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event DerivativeApproved for contract PILicenseTemplate
   */
  public watchDerivativeApprovedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<PiLicenseTemplateDerivativeApprovedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: 'DerivativeApproved',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event DerivativeApproved for contract PILicenseTemplate
   */
  public parseTxDerivativeApprovedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateDerivativeApprovedEvent> {
    const targetLogs: Array<PiLicenseTemplateDerivativeApprovedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: 'DerivativeApproved',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'DerivativeApproved')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Initialized for contract PILicenseTemplate
   */
  public watchInitializedEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<PiLicenseTemplateInitializedEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: 'Initialized',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Initialized for contract PILicenseTemplate
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateInitializedEvent> {
    const targetLogs: Array<PiLicenseTemplateInitializedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: 'Initialized',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Initialized') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event LicenseTermsRegistered for contract PILicenseTemplate
   */
  public watchLicenseTermsRegisteredEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<PiLicenseTemplateLicenseTermsRegisteredEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: 'LicenseTermsRegistered',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event LicenseTermsRegistered for contract PILicenseTemplate
   */
  public parseTxLicenseTermsRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateLicenseTermsRegisteredEvent> {
    const targetLogs: Array<PiLicenseTemplateLicenseTermsRegisteredEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: 'LicenseTermsRegistered',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'LicenseTermsRegistered')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Upgraded for contract PILicenseTemplate
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: 'Upgraded',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Upgraded for contract PILicenseTemplate
   */
  public parseTxUpgradedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateUpgradedEvent> {
    const targetLogs: Array<PiLicenseTemplateUpgradedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: 'Upgraded',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Upgraded') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract PILicenseTemplate readonly method
 */
export class PiLicenseTemplateReadOnlyClient extends PiLicenseTemplateEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address)
  }

  /**
   * method ACCESS_CONTROLLER for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateAccessControllerRequest
   * @return Promise<PiLicenseTemplateAccessControllerResponse>
   */
  public async accessController(): Promise<PiLicenseTemplateAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'ACCESS_CONTROLLER',
    })
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIpAccountRegistryRequest
   * @return Promise<PiLicenseTemplateIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<PiLicenseTemplateIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'IP_ACCOUNT_REGISTRY',
    })
  }

  /**
   * method LICENSE_REGISTRY for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateLicenseRegistryRequest
   * @return Promise<PiLicenseTemplateLicenseRegistryResponse>
   */
  public async licenseRegistry(): Promise<PiLicenseTemplateLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'LICENSE_REGISTRY',
    })
  }

  /**
   * method ROYALTY_MODULE for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateRoyaltyModuleRequest
   * @return Promise<PiLicenseTemplateRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<PiLicenseTemplateRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'ROYALTY_MODULE',
    })
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateUpgradeInterfaceVersionRequest
   * @return Promise<PiLicenseTemplateUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<PiLicenseTemplateUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'UPGRADE_INTERFACE_VERSION',
    })
  }

  /**
   * method authority for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateAuthorityRequest
   * @return Promise<PiLicenseTemplateAuthorityResponse>
   */
  public async authority(): Promise<PiLicenseTemplateAuthorityResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'authority',
    })
  }

  /**
   * method exists for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateExistsRequest
   * @return Promise<PiLicenseTemplateExistsResponse>
   */
  public async exists(
    request: PiLicenseTemplateExistsRequest,
  ): Promise<PiLicenseTemplateExistsResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'exists',
      args: [request.licenseTermsId],
    })
  }

  /**
   * method getEarlierExpireTime for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetEarlierExpireTimeRequest
   * @return Promise<PiLicenseTemplateGetEarlierExpireTimeResponse>
   */
  public async getEarlierExpireTime(
    request: PiLicenseTemplateGetEarlierExpireTimeRequest,
  ): Promise<PiLicenseTemplateGetEarlierExpireTimeResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getEarlierExpireTime',
      args: [request.licenseTermsIds, request.start],
    })
  }

  /**
   * method getExpireTime for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetExpireTimeRequest
   * @return Promise<PiLicenseTemplateGetExpireTimeResponse>
   */
  public async getExpireTime(
    request: PiLicenseTemplateGetExpireTimeRequest,
  ): Promise<PiLicenseTemplateGetExpireTimeResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getExpireTime',
      args: [request.licenseTermsId, request.start],
    })
  }

  /**
   * method getLicenseTerms for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetLicenseTermsRequest
   * @return Promise<PiLicenseTemplateGetLicenseTermsResponse>
   */
  public async getLicenseTerms(
    request: PiLicenseTemplateGetLicenseTermsRequest,
  ): Promise<PiLicenseTemplateGetLicenseTermsResponse> {
    const result = await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getLicenseTerms',
      args: [request.selectedLicenseTermsId],
    })
    return {
      terms: result,
    }
  }

  /**
   * method getLicenseTermsId for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetLicenseTermsIdRequest
   * @return Promise<PiLicenseTemplateGetLicenseTermsIdResponse>
   */
  public async getLicenseTermsId(
    request: PiLicenseTemplateGetLicenseTermsIdRequest,
  ): Promise<PiLicenseTemplateGetLicenseTermsIdResponse> {
    const result = await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getLicenseTermsId',
      args: [request.terms],
    })
    return {
      selectedLicenseTermsId: result,
    }
  }

  /**
   * method getLicenseTermsURI for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetLicenseTermsUriRequest
   * @return Promise<PiLicenseTemplateGetLicenseTermsUriResponse>
   */
  public async getLicenseTermsUri(
    request: PiLicenseTemplateGetLicenseTermsUriRequest,
  ): Promise<PiLicenseTemplateGetLicenseTermsUriResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getLicenseTermsURI',
      args: [request.licenseTermsId],
    })
  }

  /**
   * method getMetadataURI for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetMetadataUriRequest
   * @return Promise<PiLicenseTemplateGetMetadataUriResponse>
   */
  public async getMetadataUri(): Promise<PiLicenseTemplateGetMetadataUriResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getMetadataURI',
    })
  }

  /**
   * method getRoyaltyPolicy for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateGetRoyaltyPolicyRequest
   * @return Promise<PiLicenseTemplateGetRoyaltyPolicyResponse>
   */
  public async getRoyaltyPolicy(
    request: PiLicenseTemplateGetRoyaltyPolicyRequest,
  ): Promise<PiLicenseTemplateGetRoyaltyPolicyResponse> {
    const result = await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'getRoyaltyPolicy',
      args: [request.licenseTermsId],
    })
    return {
      royaltyPolicy: result[0],
      royaltyData: result[1],
      mintingFee: result[2],
      currency: result[3],
    }
  }

  /**
   * method isConsumingScheduledOp for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIsConsumingScheduledOpRequest
   * @return Promise<PiLicenseTemplateIsConsumingScheduledOpResponse>
   */
  public async isConsumingScheduledOp(): Promise<PiLicenseTemplateIsConsumingScheduledOpResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'isConsumingScheduledOp',
    })
  }

  /**
   * method isDerivativeApproved for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIsDerivativeApprovedRequest
   * @return Promise<PiLicenseTemplateIsDerivativeApprovedResponse>
   */
  public async isDerivativeApproved(
    request: PiLicenseTemplateIsDerivativeApprovedRequest,
  ): Promise<PiLicenseTemplateIsDerivativeApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'isDerivativeApproved',
      args: [request.parentIpId, request.licenseTermsId, request.childIpId],
    })
  }

  /**
   * method isLicenseTransferable for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateIsLicenseTransferableRequest
   * @return Promise<PiLicenseTemplateIsLicenseTransferableResponse>
   */
  public async isLicenseTransferable(
    request: PiLicenseTemplateIsLicenseTransferableRequest,
  ): Promise<PiLicenseTemplateIsLicenseTransferableResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'isLicenseTransferable',
      args: [request.licenseTermsId],
    })
  }

  /**
   * method name for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateNameRequest
   * @return Promise<PiLicenseTemplateNameResponse>
   */
  public async name(): Promise<PiLicenseTemplateNameResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  /**
   * method proxiableUUID for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateProxiableUuidRequest
   * @return Promise<PiLicenseTemplateProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<PiLicenseTemplateProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'proxiableUUID',
    })
  }

  /**
   * method supportsInterface for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateSupportsInterfaceRequest
   * @return Promise<PiLicenseTemplateSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: PiLicenseTemplateSupportsInterfaceRequest,
  ): Promise<PiLicenseTemplateSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  /**
   * method toJson for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateToJsonRequest
   * @return Promise<PiLicenseTemplateToJsonResponse>
   */
  public async toJson(
    request: PiLicenseTemplateToJsonRequest,
  ): Promise<PiLicenseTemplateToJsonResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'toJson',
      args: [request.licenseTermsId],
    })
  }

  /**
   * method totalRegisteredLicenseTerms for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateTotalRegisteredLicenseTermsRequest
   * @return Promise<PiLicenseTemplateTotalRegisteredLicenseTermsResponse>
   */
  public async totalRegisteredLicenseTerms(): Promise<PiLicenseTemplateTotalRegisteredLicenseTermsResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'totalRegisteredLicenseTerms',
    })
  }

  /**
   * method verifyCompatibleLicenses for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyCompatibleLicensesRequest
   * @return Promise<PiLicenseTemplateVerifyCompatibleLicensesResponse>
   */
  public async verifyCompatibleLicenses(
    request: PiLicenseTemplateVerifyCompatibleLicensesRequest,
  ): Promise<PiLicenseTemplateVerifyCompatibleLicensesResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'verifyCompatibleLicenses',
      args: [request.licenseTermsIds],
    })
  }
}

/**
 * contract PILicenseTemplate write method
 */
export class PiLicenseTemplateClient extends PiLicenseTemplateReadOnlyClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method initialize for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: PiLicenseTemplateInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'initialize',
      account: this.wallet.account,
      args: [request.accessManager, request.name, request.metadataURI],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method registerLicenseTerms for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateRegisterLicenseTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerLicenseTerms(
    request: PiLicenseTemplateRegisterLicenseTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'registerLicenseTerms',
      account: this.wallet.account,
      args: [request.terms],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setApproval for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateSetApprovalRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApproval(
    request: PiLicenseTemplateSetApprovalRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'setApproval',
      account: this.wallet.account,
      args: [
        request.parentIpId,
        request.licenseTermsId,
        request.childIpId,
        request.approved,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setAuthority for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateSetAuthorityRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAuthority(
    request: PiLicenseTemplateSetAuthorityRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'setAuthority',
      account: this.wallet.account,
      args: [request.newAuthority],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method upgradeToAndCall for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: PiLicenseTemplateUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'upgradeToAndCall',
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method verifyMintLicenseToken for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyMintLicenseTokenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyMintLicenseToken(
    request: PiLicenseTemplateVerifyMintLicenseTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'verifyMintLicenseToken',
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3]],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method verifyRegisterDerivative for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyRegisterDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyRegisterDerivative(
    request: PiLicenseTemplateVerifyRegisterDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'verifyRegisterDerivative',
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpId,
        request.licenseTermsId,
        request.licensee,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method verifyRegisterDerivativeForAllParents for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async verifyRegisterDerivativeForAllParents(
    request: PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: 'verifyRegisterDerivativeForAllParents',
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTermsIds,
        request.childIpOwner,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
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
  protected readonly wallet: SimpleWalletClient
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    this.address =
      address || getAddress(royaltyModuleAddress, rpcClient.chain?.id)
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
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract RoyaltyPolicyLAP =============================================================

/**
 * RoyaltyPolicyLapGetRoyaltyDataRequest
 *
 * @param ipId address
 */
export type RoyaltyPolicyLapGetRoyaltyDataRequest = {
  ipId: Address
}

/**
 * RoyaltyPolicyLapGetRoyaltyDataResponse
 *
 * @param 0 bool
 * @param 1 address
 * @param 2 uint32
 * @param 3 address[]
 * @param 4 uint32[]
 */
export type RoyaltyPolicyLapGetRoyaltyDataResponse = readonly [
  boolean,
  Address,
  number,
  readonly Address[],
  readonly number[],
]

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
 * contract RoyaltyPolicyLAP readonly method
 */
export class RoyaltyPolicyLapReadOnlyClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(royaltyPolicyLapAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * method getRoyaltyData for contract RoyaltyPolicyLAP
   *
   * @param request RoyaltyPolicyLapGetRoyaltyDataRequest
   * @return Promise<RoyaltyPolicyLapGetRoyaltyDataResponse>
   */
  public async getRoyaltyData(
    request: RoyaltyPolicyLapGetRoyaltyDataRequest,
  ): Promise<RoyaltyPolicyLapGetRoyaltyDataResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLapAbi,
      address: this.address,
      functionName: 'getRoyaltyData',
      args: [request.ipId],
    })
  }
}

/**
 * contract RoyaltyPolicyLAP write method
 */
export class RoyaltyPolicyLapClient extends RoyaltyPolicyLapReadOnlyClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    super(rpcClient, address)
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
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract SPG =============================================================

/**
 * SpgMintAndRegisterIpAndAttachPilTermsRequest
 *
 * @param nftContract address
 * @param recipient address
 * @param metadata tuple
 * @param terms tuple
 */
export type SpgMintAndRegisterIpAndAttachPilTermsRequest = {
  nftContract: Address
  recipient: Address
  metadata: {
    metadataURI: string
    metadataHash: Hex
    nftMetadataHash: Hex
  }
  terms: {
    transferable: boolean
    royaltyPolicy: Address
    mintingFee: bigint
    expiration: bigint
    commercialUse: boolean
    commercialAttribution: boolean
    commercializerChecker: Address
    commercializerCheckerData: Hex
    commercialRevShare: number
    commercialRevCelling: bigint
    derivativesAllowed: boolean
    derivativesAttribution: boolean
    derivativesApproval: boolean
    derivativesReciprocal: boolean
    derivativeRevCelling: bigint
    currency: Address
    uri: string
  }
}

/**
 * SpgRegisterIpAndMakeDerivativeRequest
 *
 * @param nftContract address
 * @param tokenId uint256
 * @param derivData tuple
 * @param metadata tuple
 * @param sigMetadata tuple
 * @param sigRegister tuple
 */
export type SpgRegisterIpAndMakeDerivativeRequest = {
  nftContract: Address
  tokenId: bigint
  derivData: {
    parentIpIds: readonly Address[]
    licenseTemplate: Address
    licenseTermsIds: readonly bigint[]
    royaltyContext: Hex
  }
  metadata: {
    metadataURI: string
    metadataHash: Hex
    nftMetadataHash: Hex
  }
  sigMetadata: {
    signer: Address
    deadline: bigint
    signature: Hex
  }
  sigRegister: {
    signer: Address
    deadline: bigint
    signature: Hex
  }
}

/**
 * contract SPG write method
 */
export class SpgClient {
  protected readonly wallet: SimpleWalletClient
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    this.address = address || getAddress(spgAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
    this.wallet = wallet
  }

  /**
   * method mintAndRegisterIpAndAttachPILTerms for contract SPG
   *
   * @param request SpgMintAndRegisterIpAndAttachPilTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintAndRegisterIpAndAttachPilTerms(
    request: SpgMintAndRegisterIpAndAttachPilTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgAbi,
      address: this.address,
      functionName: 'mintAndRegisterIpAndAttachPILTerms',
      account: this.wallet.account,
      args: [
        request.nftContract,
        request.recipient,
        request.metadata,
        request.terms,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method registerIpAndMakeDerivative for contract SPG
   *
   * @param request SpgRegisterIpAndMakeDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAndMakeDerivative(
    request: SpgRegisterIpAndMakeDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgAbi,
      address: this.address,
      functionName: 'registerIpAndMakeDerivative',
      account: this.wallet.account,
      args: [
        request.nftContract,
        request.tokenId,
        request.derivData,
        request.metadata,
        request.sigMetadata,
        request.sigRegister,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract SPGNFTBeacon =============================================================

/**
 * SpgnftBeaconOwnershipTransferredEvent
 *
 * @param previousOwner address
 * @param newOwner address
 */
export type SpgnftBeaconOwnershipTransferredEvent = {
  previousOwner: Address
  newOwner: Address
}

/**
 * SpgnftBeaconUpgradedEvent
 *
 * @param implementation address
 */
export type SpgnftBeaconUpgradedEvent = {
  implementation: Address
}

export type SpgnftBeaconImplementationResponse = Address

export type SpgnftBeaconOwnerResponse = Address

/**
 * SpgnftBeaconTransferOwnershipRequest
 *
 * @param newOwner address
 */
export type SpgnftBeaconTransferOwnershipRequest = {
  newOwner: Address
}

/**
 * SpgnftBeaconUpgradeToRequest
 *
 * @param newImplementation address
 */
export type SpgnftBeaconUpgradeToRequest = {
  newImplementation: Address
}

/**
 * contract SPGNFTBeacon event
 */
export class SpgnftBeaconEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address =
      address || getAddress(spgnftBeaconAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * event OwnershipTransferred for contract SPGNFTBeacon
   */
  public watchOwnershipTransferredEvent(
    onLogs: (
      txHash: Hex,
      ev: Partial<SpgnftBeaconOwnershipTransferredEvent>,
    ) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftBeaconAbi,
      address: this.address,
      eventName: 'OwnershipTransferred',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event OwnershipTransferred for contract SPGNFTBeacon
   */
  public parseTxOwnershipTransferredEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftBeaconOwnershipTransferredEvent> {
    const targetLogs: Array<SpgnftBeaconOwnershipTransferredEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftBeaconAbi,
          eventName: 'OwnershipTransferred',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'OwnershipTransferred')
          targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Upgraded for contract SPGNFTBeacon
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftBeaconUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftBeaconAbi,
      address: this.address,
      eventName: 'Upgraded',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Upgraded for contract SPGNFTBeacon
   */
  public parseTxUpgradedEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftBeaconUpgradedEvent> {
    const targetLogs: Array<SpgnftBeaconUpgradedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftBeaconAbi,
          eventName: 'Upgraded',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Upgraded') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract SPGNFTBeacon readonly method
 */
export class SpgnftBeaconReadOnlyClient extends SpgnftBeaconEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address)
  }

  /**
   * method implementation for contract SPGNFTBeacon
   *
   * @param request SpgnftBeaconImplementationRequest
   * @return Promise<SpgnftBeaconImplementationResponse>
   */
  public async implementation(): Promise<SpgnftBeaconImplementationResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftBeaconAbi,
      address: this.address,
      functionName: 'implementation',
    })
  }

  /**
   * method owner for contract SPGNFTBeacon
   *
   * @param request SpgnftBeaconOwnerRequest
   * @return Promise<SpgnftBeaconOwnerResponse>
   */
  public async owner(): Promise<SpgnftBeaconOwnerResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftBeaconAbi,
      address: this.address,
      functionName: 'owner',
    })
  }
}

/**
 * contract SPGNFTBeacon write method
 */
export class SpgnftBeaconClient extends SpgnftBeaconReadOnlyClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method renounceOwnership for contract SPGNFTBeacon
   *
   * @param request SpgnftBeaconRenounceOwnershipRequest
   * @return Promise<WriteContractReturnType>
   */
  public async renounceOwnership(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftBeaconAbi,
      address: this.address,
      functionName: 'renounceOwnership',
      account: this.wallet.account,
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method transferOwnership for contract SPGNFTBeacon
   *
   * @param request SpgnftBeaconTransferOwnershipRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferOwnership(
    request: SpgnftBeaconTransferOwnershipRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftBeaconAbi,
      address: this.address,
      functionName: 'transferOwnership',
      account: this.wallet.account,
      args: [request.newOwner],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method upgradeTo for contract SPGNFTBeacon
   *
   * @param request SpgnftBeaconUpgradeToRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeTo(
    request: SpgnftBeaconUpgradeToRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftBeaconAbi,
      address: this.address,
      functionName: 'upgradeTo',
      account: this.wallet.account,
      args: [request.newImplementation],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}

// Contract SPGNFTImpl =============================================================

/**
 * SpgnftImplApprovalEvent
 *
 * @param owner address
 * @param approved address
 * @param tokenId uint256
 */
export type SpgnftImplApprovalEvent = {
  owner: Address
  approved: Address
  tokenId: bigint
}

/**
 * SpgnftImplApprovalForAllEvent
 *
 * @param owner address
 * @param operator address
 * @param approved bool
 */
export type SpgnftImplApprovalForAllEvent = {
  owner: Address
  operator: Address
  approved: boolean
}

/**
 * SpgnftImplInitializedEvent
 *
 * @param version uint64
 */
export type SpgnftImplInitializedEvent = {
  version: bigint
}

/**
 * SpgnftImplRoleAdminChangedEvent
 *
 * @param role bytes32
 * @param previousAdminRole bytes32
 * @param newAdminRole bytes32
 */
export type SpgnftImplRoleAdminChangedEvent = {
  role: Hex
  previousAdminRole: Hex
  newAdminRole: Hex
}

/**
 * SpgnftImplRoleGrantedEvent
 *
 * @param role bytes32
 * @param account address
 * @param sender address
 */
export type SpgnftImplRoleGrantedEvent = {
  role: Hex
  account: Address
  sender: Address
}

/**
 * SpgnftImplRoleRevokedEvent
 *
 * @param role bytes32
 * @param account address
 * @param sender address
 */
export type SpgnftImplRoleRevokedEvent = {
  role: Hex
  account: Address
  sender: Address
}

/**
 * SpgnftImplTransferEvent
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplTransferEvent = {
  from: Address
  to: Address
  tokenId: bigint
}

export type SpgnftImplDefaultAdminRoleResponse = Hex

export type SpgnftImplSpgAddressResponse = Address

/**
 * SpgnftImplBalanceOfRequest
 *
 * @param owner address
 */
export type SpgnftImplBalanceOfRequest = {
  owner: Address
}

export type SpgnftImplBalanceOfResponse = bigint

/**
 * SpgnftImplGetApprovedRequest
 *
 * @param tokenId uint256
 */
export type SpgnftImplGetApprovedRequest = {
  tokenId: bigint
}

export type SpgnftImplGetApprovedResponse = Address

/**
 * SpgnftImplGetRoleAdminRequest
 *
 * @param role bytes32
 */
export type SpgnftImplGetRoleAdminRequest = {
  role: Hex
}

export type SpgnftImplGetRoleAdminResponse = Hex

/**
 * SpgnftImplHasRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type SpgnftImplHasRoleRequest = {
  role: Hex
  account: Address
}

export type SpgnftImplHasRoleResponse = boolean

/**
 * SpgnftImplIsApprovedForAllRequest
 *
 * @param owner address
 * @param operator address
 */
export type SpgnftImplIsApprovedForAllRequest = {
  owner: Address
  operator: Address
}

export type SpgnftImplIsApprovedForAllResponse = boolean

export type SpgnftImplMintCostResponse = bigint

export type SpgnftImplMintTokenResponse = Address

export type SpgnftImplNameResponse = string

/**
 * SpgnftImplOwnerOfRequest
 *
 * @param tokenId uint256
 */
export type SpgnftImplOwnerOfRequest = {
  tokenId: bigint
}

export type SpgnftImplOwnerOfResponse = Address

/**
 * SpgnftImplSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type SpgnftImplSupportsInterfaceRequest = {
  interfaceId: Hex
}

export type SpgnftImplSupportsInterfaceResponse = boolean

export type SpgnftImplSymbolResponse = string

/**
 * SpgnftImplTokenUriRequest
 *
 * @param tokenId uint256
 */
export type SpgnftImplTokenUriRequest = {
  tokenId: bigint
}

export type SpgnftImplTokenUriResponse = string

export type SpgnftImplTotalSupplyResponse = bigint

/**
 * SpgnftImplApproveRequest
 *
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplApproveRequest = {
  to: Address
  tokenId: bigint
}

/**
 * SpgnftImplGrantRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type SpgnftImplGrantRoleRequest = {
  role: Hex
  account: Address
}

/**
 * SpgnftImplInitializeRequest
 *
 * @param name string
 * @param symbol string
 * @param maxSupply uint32
 * @param mintCost uint256
 * @param mintToken address
 * @param owner address
 */
export type SpgnftImplInitializeRequest = {
  name: string
  symbol: string
  maxSupply: number
  mintCost: bigint
  mintToken: Address
  owner: Address
}

/**
 * SpgnftImplMintRequest
 *
 * @param to address
 */
export type SpgnftImplMintRequest = {
  to: Address
}

/**
 * SpgnftImplMintBySpgRequest
 *
 * @param to address
 * @param payer address
 */
export type SpgnftImplMintBySpgRequest = {
  to: Address
  payer: Address
}

/**
 * SpgnftImplRenounceRoleRequest
 *
 * @param role bytes32
 * @param callerConfirmation address
 */
export type SpgnftImplRenounceRoleRequest = {
  role: Hex
  callerConfirmation: Address
}

/**
 * SpgnftImplRevokeRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type SpgnftImplRevokeRoleRequest = {
  role: Hex
  account: Address
}

/**
 * SpgnftImplSafeTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplSafeTransferFromRequest = {
  from: Address
  to: Address
  tokenId: bigint
}

/**
 * SpgnftImplSafeTransferFrom2Request
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 * @param data bytes
 */
export type SpgnftImplSafeTransferFrom2Request = {
  from: Address
  to: Address
  tokenId: bigint
  data: Hex
}

/**
 * SpgnftImplSetApprovalForAllRequest
 *
 * @param operator address
 * @param approved bool
 */
export type SpgnftImplSetApprovalForAllRequest = {
  operator: Address
  approved: boolean
}

/**
 * SpgnftImplSetMintCostRequest
 *
 * @param cost uint256
 */
export type SpgnftImplSetMintCostRequest = {
  cost: bigint
}

/**
 * SpgnftImplSetMintTokenRequest
 *
 * @param token address
 */
export type SpgnftImplSetMintTokenRequest = {
  token: Address
}

/**
 * SpgnftImplTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplTransferFromRequest = {
  from: Address
  to: Address
  tokenId: bigint
}

/**
 * SpgnftImplWithdrawTokenRequest
 *
 * @param token address
 * @param recipient address
 */
export type SpgnftImplWithdrawTokenRequest = {
  token: Address
  recipient: Address
}

/**
 * contract SPGNFTImpl event
 */
export class SpgnftImplEventClient {
  protected readonly rpcClient: PublicClient
  public readonly address: Address

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(spgnftImplAddress, rpcClient.chain?.id)
    this.rpcClient = rpcClient
  }

  /**
   * event Approval for contract SPGNFTImpl
   */
  public watchApprovalEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplApprovalEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'Approval',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Approval for contract SPGNFTImpl
   */
  public parseTxApprovalEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplApprovalEvent> {
    const targetLogs: Array<SpgnftImplApprovalEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'Approval',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Approval') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event ApprovalForAll for contract SPGNFTImpl
   */
  public watchApprovalForAllEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplApprovalForAllEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'ApprovalForAll',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event ApprovalForAll for contract SPGNFTImpl
   */
  public parseTxApprovalForAllEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplApprovalForAllEvent> {
    const targetLogs: Array<SpgnftImplApprovalForAllEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'ApprovalForAll',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'ApprovalForAll') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Initialized for contract SPGNFTImpl
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'Initialized',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Initialized for contract SPGNFTImpl
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplInitializedEvent> {
    const targetLogs: Array<SpgnftImplInitializedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'Initialized',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Initialized') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event RoleAdminChanged for contract SPGNFTImpl
   */
  public watchRoleAdminChangedEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplRoleAdminChangedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'RoleAdminChanged',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event RoleAdminChanged for contract SPGNFTImpl
   */
  public parseTxRoleAdminChangedEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplRoleAdminChangedEvent> {
    const targetLogs: Array<SpgnftImplRoleAdminChangedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'RoleAdminChanged',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'RoleAdminChanged') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event RoleGranted for contract SPGNFTImpl
   */
  public watchRoleGrantedEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplRoleGrantedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'RoleGranted',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event RoleGranted for contract SPGNFTImpl
   */
  public parseTxRoleGrantedEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplRoleGrantedEvent> {
    const targetLogs: Array<SpgnftImplRoleGrantedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'RoleGranted',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'RoleGranted') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event RoleRevoked for contract SPGNFTImpl
   */
  public watchRoleRevokedEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplRoleRevokedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'RoleRevoked',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event RoleRevoked for contract SPGNFTImpl
   */
  public parseTxRoleRevokedEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplRoleRevokedEvent> {
    const targetLogs: Array<SpgnftImplRoleRevokedEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'RoleRevoked',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'RoleRevoked') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }

  /**
   * event Transfer for contract SPGNFTImpl
   */
  public watchTransferEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplTransferEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: 'Transfer',
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args))
      },
    })
  }

  /**
   * parse tx receipt event Transfer for contract SPGNFTImpl
   */
  public parseTxTransferEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplTransferEvent> {
    const targetLogs: Array<SpgnftImplTransferEvent> = []
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: 'Transfer',
          data: log.data,
          topics: log.topics,
        })
        if (event.eventName === 'Transfer') targetLogs.push(event.args)
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs
  }
}

/**
 * contract SPGNFTImpl readonly method
 */
export class SpgnftImplReadOnlyClient extends SpgnftImplEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address)
  }

  /**
   * method DEFAULT_ADMIN_ROLE for contract SPGNFTImpl
   *
   * @param request SpgnftImplDefaultAdminRoleRequest
   * @return Promise<SpgnftImplDefaultAdminRoleResponse>
   */
  public async defaultAdminRole(): Promise<SpgnftImplDefaultAdminRoleResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'DEFAULT_ADMIN_ROLE',
    })
  }

  /**
   * method SPG_ADDRESS for contract SPGNFTImpl
   *
   * @param request SpgnftImplSpgAddressRequest
   * @return Promise<SpgnftImplSpgAddressResponse>
   */
  public async spgAddress(): Promise<SpgnftImplSpgAddressResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'SPG_ADDRESS',
    })
  }

  /**
   * method balanceOf for contract SPGNFTImpl
   *
   * @param request SpgnftImplBalanceOfRequest
   * @return Promise<SpgnftImplBalanceOfResponse>
   */
  public async balanceOf(
    request: SpgnftImplBalanceOfRequest,
  ): Promise<SpgnftImplBalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'balanceOf',
      args: [request.owner],
    })
  }

  /**
   * method getApproved for contract SPGNFTImpl
   *
   * @param request SpgnftImplGetApprovedRequest
   * @return Promise<SpgnftImplGetApprovedResponse>
   */
  public async getApproved(
    request: SpgnftImplGetApprovedRequest,
  ): Promise<SpgnftImplGetApprovedResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'getApproved',
      args: [request.tokenId],
    })
  }

  /**
   * method getRoleAdmin for contract SPGNFTImpl
   *
   * @param request SpgnftImplGetRoleAdminRequest
   * @return Promise<SpgnftImplGetRoleAdminResponse>
   */
  public async getRoleAdmin(
    request: SpgnftImplGetRoleAdminRequest,
  ): Promise<SpgnftImplGetRoleAdminResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'getRoleAdmin',
      args: [request.role],
    })
  }

  /**
   * method hasRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplHasRoleRequest
   * @return Promise<SpgnftImplHasRoleResponse>
   */
  public async hasRole(
    request: SpgnftImplHasRoleRequest,
  ): Promise<SpgnftImplHasRoleResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'hasRole',
      args: [request.role, request.account],
    })
  }

  /**
   * method isApprovedForAll for contract SPGNFTImpl
   *
   * @param request SpgnftImplIsApprovedForAllRequest
   * @return Promise<SpgnftImplIsApprovedForAllResponse>
   */
  public async isApprovedForAll(
    request: SpgnftImplIsApprovedForAllRequest,
  ): Promise<SpgnftImplIsApprovedForAllResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'isApprovedForAll',
      args: [request.owner, request.operator],
    })
  }

  /**
   * method mintCost for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintCostRequest
   * @return Promise<SpgnftImplMintCostResponse>
   */
  public async mintCost(): Promise<SpgnftImplMintCostResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'mintCost',
    })
  }

  /**
   * method mintToken for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintTokenRequest
   * @return Promise<SpgnftImplMintTokenResponse>
   */
  public async mintToken(): Promise<SpgnftImplMintTokenResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'mintToken',
    })
  }

  /**
   * method name for contract SPGNFTImpl
   *
   * @param request SpgnftImplNameRequest
   * @return Promise<SpgnftImplNameResponse>
   */
  public async name(): Promise<SpgnftImplNameResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'name',
    })
  }

  /**
   * method ownerOf for contract SPGNFTImpl
   *
   * @param request SpgnftImplOwnerOfRequest
   * @return Promise<SpgnftImplOwnerOfResponse>
   */
  public async ownerOf(
    request: SpgnftImplOwnerOfRequest,
  ): Promise<SpgnftImplOwnerOfResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'ownerOf',
      args: [request.tokenId],
    })
  }

  /**
   * method supportsInterface for contract SPGNFTImpl
   *
   * @param request SpgnftImplSupportsInterfaceRequest
   * @return Promise<SpgnftImplSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: SpgnftImplSupportsInterfaceRequest,
  ): Promise<SpgnftImplSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'supportsInterface',
      args: [request.interfaceId],
    })
  }

  /**
   * method symbol for contract SPGNFTImpl
   *
   * @param request SpgnftImplSymbolRequest
   * @return Promise<SpgnftImplSymbolResponse>
   */
  public async symbol(): Promise<SpgnftImplSymbolResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'symbol',
    })
  }

  /**
   * method tokenURI for contract SPGNFTImpl
   *
   * @param request SpgnftImplTokenUriRequest
   * @return Promise<SpgnftImplTokenUriResponse>
   */
  public async tokenUri(
    request: SpgnftImplTokenUriRequest,
  ): Promise<SpgnftImplTokenUriResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'tokenURI',
      args: [request.tokenId],
    })
  }

  /**
   * method totalSupply for contract SPGNFTImpl
   *
   * @param request SpgnftImplTotalSupplyRequest
   * @return Promise<SpgnftImplTotalSupplyResponse>
   */
  public async totalSupply(): Promise<SpgnftImplTotalSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'totalSupply',
    })
  }
}

/**
 * contract SPGNFTImpl write method
 */
export class SpgnftImplClient extends SpgnftImplReadOnlyClient {
  protected readonly wallet: SimpleWalletClient

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address?: Address,
  ) {
    super(rpcClient, address)
    this.wallet = wallet
  }

  /**
   * method approve for contract SPGNFTImpl
   *
   * @param request SpgnftImplApproveRequest
   * @return Promise<WriteContractReturnType>
   */
  public async approve(
    request: SpgnftImplApproveRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'approve',
      account: this.wallet.account,
      args: [request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method grantRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplGrantRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async grantRole(
    request: SpgnftImplGrantRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'grantRole',
      account: this.wallet.account,
      args: [request.role, request.account],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method initialize for contract SPGNFTImpl
   *
   * @param request SpgnftImplInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: SpgnftImplInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'initialize',
      account: this.wallet.account,
      args: [
        request.name,
        request.symbol,
        request.maxSupply,
        request.mintCost,
        request.mintToken,
        request.owner,
      ],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method mint for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mint(
    request: SpgnftImplMintRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'mint',
      account: this.wallet.account,
      args: [request.to],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method mintBySPG for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintBySpgRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintBySpg(
    request: SpgnftImplMintBySpgRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'mintBySPG',
      account: this.wallet.account,
      args: [request.to, request.payer],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method renounceRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplRenounceRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async renounceRole(
    request: SpgnftImplRenounceRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'renounceRole',
      account: this.wallet.account,
      args: [request.role, request.callerConfirmation],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method revokeRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplRevokeRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async revokeRole(
    request: SpgnftImplRevokeRoleRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'revokeRole',
      account: this.wallet.account,
      args: [request.role, request.account],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method safeTransferFrom for contract SPGNFTImpl
   *
   * @param request SpgnftImplSafeTransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async safeTransferFrom(
    request: SpgnftImplSafeTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'safeTransferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method safeTransferFrom for contract SPGNFTImpl
   *
   * @param request SpgnftImplSafeTransferFrom2Request
   * @return Promise<WriteContractReturnType>
   */
  public async safeTransferFrom2(
    request: SpgnftImplSafeTransferFrom2Request,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'safeTransferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId, request.data],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setApprovalForAll for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetApprovalForAllRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setApprovalForAll(
    request: SpgnftImplSetApprovalForAllRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'setApprovalForAll',
      account: this.wallet.account,
      args: [request.operator, request.approved],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setMintCost for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetMintCostRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintCost(
    request: SpgnftImplSetMintCostRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'setMintCost',
      account: this.wallet.account,
      args: [request.cost],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method setMintToken for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetMintTokenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintToken(
    request: SpgnftImplSetMintTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'setMintToken',
      account: this.wallet.account,
      args: [request.token],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method transferFrom for contract SPGNFTImpl
   *
   * @param request SpgnftImplTransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferFrom(
    request: SpgnftImplTransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'transferFrom',
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }

  /**
   * method withdrawToken for contract SPGNFTImpl
   *
   * @param request SpgnftImplWithdrawTokenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async withdrawToken(
    request: SpgnftImplWithdrawTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: 'withdrawToken',
      account: this.wallet.account,
      args: [request.token, request.recipient],
    })
    return await this.wallet.writeContract(call as WriteContractParameters)
  }
}
