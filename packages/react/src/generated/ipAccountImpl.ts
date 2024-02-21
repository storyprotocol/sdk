import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

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
  { type: 'receive', stateMutability: 'payable' },
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
  { type: 'error', inputs: [], name: 'IPAccount__ExpiredSignature' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidAccessController' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidCalldata' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidSignature' },
  { type: 'error', inputs: [], name: 'IPAccount__InvalidSigner' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__
 */
export const useReadIpAccountImpl = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"accessController"`
 */
export const useReadIpAccountImplAccessController3 =
  /*#__PURE__*/ createUseReadContract({
    abi: ipAccountImplAbi,
    functionName: 'accessController',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"isValidSigner"`
 */
export const useReadIsValidSigner = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
  functionName: 'isValidSigner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useReadOnErc1155BatchReceived =
  /*#__PURE__*/ createUseReadContract({
    abi: ipAccountImplAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useReadOnErc1155Received = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
  functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadOnErc721Received = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
  functionName: 'onERC721Received',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOwner = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"state"`
 */
export const useReadState = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
  functionName: 'state',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIpAccountImplSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: ipAccountImplAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"token"`
 */
export const useReadToken = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountImplAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAccountImplAbi}__
 */
export const useWriteIpAccountImpl = /*#__PURE__*/ createUseWriteContract({
  abi: ipAccountImplAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"execute"`
 */
export const useExecute = /*#__PURE__*/ createUseWriteContract({
  abi: ipAccountImplAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"executeWithSig"`
 */
export const useExecuteWithSig = /*#__PURE__*/ createUseWriteContract({
  abi: ipAccountImplAbi,
  functionName: 'executeWithSig',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAccountImplAbi}__
 */
export const useSimulateIpAccountImpl = /*#__PURE__*/ createUseSimulateContract(
  { abi: ipAccountImplAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateExecute = /*#__PURE__*/ createUseSimulateContract({
  abi: ipAccountImplAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAccountImplAbi}__ and `functionName` set to `"executeWithSig"`
 */
export const useSimulateExecuteWithSig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ipAccountImplAbi,
    functionName: 'executeWithSig',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAccountImplAbi}__
 */
export const useWatchIpAccountImpl = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAccountImplAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAccountImplAbi}__ and `eventName` set to `"Executed"`
 */
export const useWatchExecuted = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ipAccountImplAbi,
  eventName: 'Executed',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAccountImplAbi}__ and `eventName` set to `"ExecutedWithSig"`
 */
export const useWatchExecutedWithSig =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ipAccountImplAbi,
    eventName: 'ExecutedWithSig',
  })
