import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

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
] as const

export const licenseRegistryAddress =
  '0xc2BC7a2d5784768BDEd98436f2522A4931e2FBb4' as const

export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useReadLicenseRegistry = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"DISPUTE_MODULE"`
 */
export const useReadDisputeModule = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'DISPUTE_MODULE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"LICENSING_MODULE"`
 */
export const useReadLicensingModule = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'LICENSING_MODULE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const useReadBalanceOfBatch = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'balanceOfBatch',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"getGovernance"`
 */
export const useReadGetGovernance = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'getGovernance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"governance"`
 */
export const useReadGovernance = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'governance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"imageUrl"`
 */
export const useReadImageUrl = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'imageUrl',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'isApprovedForAll',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"isLicenseRevoked"`
 */
export const useReadIsLicenseRevoked = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'isLicenseRevoked',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"isLicensee"`
 */
export const useReadIsLicensee = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'isLicensee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"license"`
 */
export const useReadLicense = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'license',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"licensorIpId"`
 */
export const useReadLicensorIpId = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'licensorIpId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"mintedLicenses"`
 */
export const useReadMintedLicenses = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'mintedLicenses',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"name"`
 */
export const useReadLicenseRegistryName = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"policyIdForLicense"`
 */
export const useReadPolicyIdForLicense = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'policyIdForLicense',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLicenseRegistrySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadSymbol = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"uri"`
 */
export const useReadUri = /*#__PURE__*/ createUseReadContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'uri',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useWriteLicenseRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"burnLicenses"`
 */
export const useBurnLicenses = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'burnLicenses',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"mintLicense"`
 */
export const useMintLicense = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'mintLicense',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSafeBatchTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'safeBatchTransferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSafeTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSetApprovalForAll = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'setApprovalForAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setDisputeModule"`
 */
export const useSetDisputeModule = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'setDisputeModule',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSetGovernance = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'setGovernance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setLicensingImageUrl"`
 */
export const useSetLicensingImageUrl = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'setLicensingImageUrl',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setLicensingModule"`
 */
export const useSetLicensingModule = /*#__PURE__*/ createUseWriteContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'setLicensingModule',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useSimulateLicenseRegistry =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"burnLicenses"`
 */
export const useSimulateBurnLicenses = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'burnLicenses',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"mintLicense"`
 */
export const useSimulateMintLicense = /*#__PURE__*/ createUseSimulateContract({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  functionName: 'mintLicense',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSimulateSafeBatchTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setDisputeModule"`
 */
export const useSimulateSetDisputeModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'setDisputeModule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setGovernance"`
 */
export const useSimulateSetGovernance = /*#__PURE__*/ createUseSimulateContract(
  {
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'setGovernance',
  },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setLicensingImageUrl"`
 */
export const useSimulateSetLicensingImageUrl =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'setLicensingImageUrl',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link licenseRegistryAbi}__ and `functionName` set to `"setLicensingModule"`
 */
export const useSimulateSetLicensingModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    functionName: 'setLicensingModule',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__
 */
export const useWatchLicenseRegistry =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchApprovalForAll = /*#__PURE__*/ createUseWatchContractEvent(
  {
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    eventName: 'ApprovalForAll',
  },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"BatchMetadataUpdate"`
 */
export const useWatchBatchMetadataUpdate =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    eventName: 'BatchMetadataUpdate',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"GovernanceUpdated"`
 */
export const useWatchGovernanceUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    eventName: 'GovernanceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"LicenseMinted"`
 */
export const useWatchLicenseMinted = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: 'LicenseMinted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const useWatchTransferBatch = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: 'TransferBatch',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const useWatchTransferSingle = /*#__PURE__*/ createUseWatchContractEvent(
  {
    abi: licenseRegistryAbi,
    address: licenseRegistryAddress,
    eventName: 'TransferSingle',
  },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link licenseRegistryAbi}__ and `eventName` set to `"URI"`
 */
export const useWatchUri = /*#__PURE__*/ createUseWatchContractEvent({
  abi: licenseRegistryAbi,
  address: licenseRegistryAddress,
  eventName: 'URI',
})
