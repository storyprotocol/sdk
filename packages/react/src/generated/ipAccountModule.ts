import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ipAccountRegistryAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getIPAccountImpl',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'chainId_', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract_', internalType: 'address', type: 'address' },
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ipAccount',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'chainId_', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract_', internalType: 'address', type: 'address' },
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerIpAccount',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__
 */
export const useReadIpAccountRegistry = /*#__PURE__*/ createUseReadContract({
  abi: ipAccountRegistryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__ and `functionName` set to `"getIPAccountImpl"`
 */
export const useReadIpAccountRegistryGetIpAccountImpl =
  /*#__PURE__*/ createUseReadContract({
    abi: ipAccountRegistryAbi,
    functionName: 'getIPAccountImpl',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__ and `functionName` set to `"ipAccount"`
 */
export const useReadIpAccountRegistryIpAccount =
  /*#__PURE__*/ createUseReadContract({
    abi: ipAccountRegistryAbi,
    functionName: 'ipAccount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__
 */
export const useWriteIpAccountRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: ipAccountRegistryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__ and `functionName` set to `"registerIpAccount"`
 */
export const useWriteIpAccountRegistryRegisterIpAccount =
  /*#__PURE__*/ createUseWriteContract({
    abi: ipAccountRegistryAbi,
    functionName: 'registerIpAccount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__
 */
export const useSimulateIpAccountRegistry =
  /*#__PURE__*/ createUseSimulateContract({ abi: ipAccountRegistryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ipAccountRegistryAbi}__ and `functionName` set to `"registerIpAccount"`
 */
export const useSimulateIpAccountRegistryRegisterIpAccount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ipAccountRegistryAbi,
    functionName: 'registerIpAccount',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAccountRegistryAbi}__
 */
export const useWatchIpAccountRegistryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ipAccountRegistryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ipAccountRegistryAbi}__ and `eventName` set to `"IPAccountRegistered"`
 */
export const useWatchIpAccountRegistryIpAccountRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ipAccountRegistryAbi,
    eventName: 'IPAccountRegistered',
  })
