import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

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
  { type: 'error', inputs: [], name: 'RegistrationModule__InvalidOwner' },
] as const

export const registrationModuleAddress =
  '0x8b3f6b736b520F69c37a575293D3c1ff6383D495' as const

export const registrationModuleConfig = {
  address: registrationModuleAddress,
  abi: registrationModuleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useReadRegistrationModule = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"ipResolver"`
 */
export const useReadIpResolver = /*#__PURE__*/ createUseReadContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: 'ipResolver',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"name"`
 */
export const useReadRegistrationModuleName =
  /*#__PURE__*/ createUseReadContract({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    functionName: 'name',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadRegistrationModuleSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useWriteRegistrationModule = /*#__PURE__*/ createUseWriteContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerDerivativeIp"`
 */
export const useRegisterDerivativeIp = /*#__PURE__*/ createUseWriteContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: 'registerDerivativeIp',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerRootIp"`
 */
export const useRegisterRootIp = /*#__PURE__*/ createUseWriteContract({
  abi: registrationModuleAbi,
  address: registrationModuleAddress,
  functionName: 'registerRootIp',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useSimulateRegistrationModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerDerivativeIp"`
 */
export const useSimulateRegisterDerivativeIp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    functionName: 'registerDerivativeIp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registrationModuleAbi}__ and `functionName` set to `"registerRootIp"`
 */
export const useSimulateRegisterRootIp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    functionName: 'registerRootIp',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registrationModuleAbi}__
 */
export const useWatchRegistrationModule =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registrationModuleAbi}__ and `eventName` set to `"DerivativeIPRegistered"`
 */
export const useWatchDerivativeIpRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    eventName: 'DerivativeIPRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registrationModuleAbi}__ and `eventName` set to `"RootIPRegistered"`
 */
export const useWatchRootIpRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registrationModuleAbi,
    address: registrationModuleAddress,
    eventName: 'RootIPRegistered',
  })
