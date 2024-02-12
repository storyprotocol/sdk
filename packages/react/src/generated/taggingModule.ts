import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TaggingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const taggingModuleAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'MAX_TAG_PERMISSIONS_AT_ONCE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'tag', internalType: 'string', type: 'string' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'isTagged',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'tag', internalType: 'string', type: 'string' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'removeTag',
    outputs: [{ name: 'removed', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'tag', internalType: 'string', type: 'string' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'setTag',
    outputs: [{ name: 'added', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tagAtIndexForIp',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'ipId', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tagStringAtIndexForIp',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    name: 'totalTagsForIp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tag', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'ipId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TagRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tag', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'ipId',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TagSet',
  },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
] as const

export const taggingModuleAddress =
  '0x333BECf0FF68C02E4387005A89c30De885b8a38F' as const

export const taggingModuleConfig = {
  address: taggingModuleAddress,
  abi: taggingModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__
 */
export const useReadTaggingModule = /*#__PURE__*/ createUseReadContract({
  abi: taggingModuleAbi,
  address: taggingModuleAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"MAX_TAG_PERMISSIONS_AT_ONCE"`
 */
export const useReadTaggingModuleMaxTagPermissionsAtOnce =
  /*#__PURE__*/ createUseReadContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'MAX_TAG_PERMISSIONS_AT_ONCE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"isTagged"`
 */
export const useReadTaggingModuleIsTagged = /*#__PURE__*/ createUseReadContract(
  {
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'isTagged',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"name"`
 */
export const useReadTaggingModuleName = /*#__PURE__*/ createUseReadContract({
  abi: taggingModuleAbi,
  address: taggingModuleAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"tagAtIndexForIp"`
 */
export const useReadTaggingModuleTagAtIndexForIp =
  /*#__PURE__*/ createUseReadContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'tagAtIndexForIp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"tagStringAtIndexForIp"`
 */
export const useReadTaggingModuleTagStringAtIndexForIp =
  /*#__PURE__*/ createUseReadContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'tagStringAtIndexForIp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"totalTagsForIp"`
 */
export const useReadTaggingModuleTotalTagsForIp =
  /*#__PURE__*/ createUseReadContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'totalTagsForIp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link taggingModuleAbi}__
 */
export const useWriteTaggingModule = /*#__PURE__*/ createUseWriteContract({
  abi: taggingModuleAbi,
  address: taggingModuleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"removeTag"`
 */
export const useWriteTaggingModuleRemoveTag =
  /*#__PURE__*/ createUseWriteContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'removeTag',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"setTag"`
 */
export const useWriteTaggingModuleSetTag = /*#__PURE__*/ createUseWriteContract(
  {
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'setTag',
  },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link taggingModuleAbi}__
 */
export const useSimulateTaggingModule = /*#__PURE__*/ createUseSimulateContract(
  { abi: taggingModuleAbi, address: taggingModuleAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"removeTag"`
 */
export const useSimulateTaggingModuleRemoveTag =
  /*#__PURE__*/ createUseSimulateContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'removeTag',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link taggingModuleAbi}__ and `functionName` set to `"setTag"`
 */
export const useSimulateTaggingModuleSetTag =
  /*#__PURE__*/ createUseSimulateContract({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    functionName: 'setTag',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link taggingModuleAbi}__
 */
export const useWatchTaggingModuleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link taggingModuleAbi}__ and `eventName` set to `"TagRemoved"`
 */
export const useWatchTaggingModuleTagRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    eventName: 'TagRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link taggingModuleAbi}__ and `eventName` set to `"TagSet"`
 */
export const useWatchTaggingModuleTagSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: taggingModuleAbi,
    address: taggingModuleAddress,
    eventName: 'TagSet',
  })
