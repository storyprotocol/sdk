//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xf82EEe73c2c81D14DF9bC29DC154dD3c079d80a0)
 */
export const spgAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'accessController', internalType: 'address', type: 'address' },
      { name: 'ipAssetRegistry', internalType: 'address', type: 'address' },
      { name: 'licensingModule', internalType: 'address', type: 'address' },
      {
        name: 'pilPolicyFrameworkManager',
        internalType: 'address',
        type: 'address',
      },
      { name: 'resolver', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'ERC1167FailedCreateClone' },
  { type: 'error', inputs: [], name: 'SPG__CollectionNotInitialized' },
  { type: 'error', inputs: [], name: 'SPG__CollectionTypeUnsupported' },
  { type: 'error', inputs: [], name: 'SPG__InvalidOwner' },
  { type: 'error', inputs: [], name: 'SPG__MintingAlreadyEnded' },
  { type: 'error', inputs: [], name: 'SPG__MintingNotYetStarted' },
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
    name: 'IP_ASSET_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IPAssetRegistry', type: 'address' },
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
    name: 'METADATA_PROVIDER_IMPL',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PIL_POLICY_FRAMEWORK_MANAGER',
    outputs: [
      {
        name: '',
        internalType: 'contract PILPolicyFrameworkManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SP_NFT_IMPL',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pilPolicy',
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
      { name: 'transferable', internalType: 'bool', type: 'bool' },
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
      { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    name: 'addPILPolicyToIp',
    outputs: [
      { name: 'policyGlobalId', internalType: 'uint256', type: 'uint256' },
      { name: 'policyIndexOnIpId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'mintSettings',
        internalType: 'struct SPG.MintSettings',
        type: 'tuple',
        components: [
          { name: 'start', internalType: 'uint256', type: 'uint256' },
          { name: 'end', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'configureMintSettings',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'collectionType',
        internalType: 'enum SPG.CollectionType',
        type: 'uint8',
      },
      {
        name: 'collectionSettings',
        internalType: 'struct SPG.CollectionSettings',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'symbol', internalType: 'string', type: 'string' },
          { name: 'maxSupply', internalType: 'uint256', type: 'uint256' },
          { name: 'contractMetadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'mintSettings',
        internalType: 'struct SPG.MintSettings',
        type: 'tuple',
        components: [
          { name: 'start', internalType: 'uint256', type: 'uint256' },
          { name: 'end', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'createIpCollection',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pilPolicy',
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
      { name: 'transferable', internalType: 'bool', type: 'bool' },
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
      { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
    ],
    name: 'createPolicyPIL',
    outputs: [{ name: 'policyId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ipCollection', internalType: 'address', type: 'address' },
    ],
    name: 'getMintSettings',
    outputs: [
      {
        name: '',
        internalType: 'struct SPG.MintSettings',
        type: 'tuple',
        components: [
          { name: 'start', internalType: 'uint256', type: 'uint256' },
          { name: 'end', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'metadataResolver',
    outputs: [
      { name: '', internalType: 'contract IPResolver', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'licenseIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenMetadata', internalType: 'bytes', type: 'bytes' },
      {
        name: 'ipMetadata',
        internalType: 'struct Metadata.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'url', internalType: 'string', type: 'string' },
          {
            name: 'customMetadata',
            internalType: 'struct Metadata.Attribute[]',
            type: 'tuple[]',
            components: [
              { name: 'key', internalType: 'string', type: 'string' },
              { name: 'value', internalType: 'string', type: 'string' },
            ],
          },
        ],
      },
      {
        name: 'signature',
        internalType: 'struct SPG.Signature',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'mintAndRegisterDerivativeIpWithSig',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenMetadata', internalType: 'bytes', type: 'bytes' },
      {
        name: 'ipMetadata',
        internalType: 'struct Metadata.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'url', internalType: 'string', type: 'string' },
          {
            name: 'customMetadata',
            internalType: 'struct Metadata.Attribute[]',
            type: 'tuple[]',
            components: [
              { name: 'key', internalType: 'string', type: 'string' },
              { name: 'value', internalType: 'string', type: 'string' },
            ],
          },
        ],
      },
      {
        name: 'signature',
        internalType: 'struct SPG.Signature',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'mintAndRegisterIpWithSig',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'ipId', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'licensorTokenContract',
        internalType: 'address',
        type: 'address',
      },
      { name: 'licensorTokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mintLicense',
    outputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mintLicense',
    outputs: [{ name: 'licenseId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pilPolicy',
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
      { name: 'licensorIpId', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
      { name: 'transferable', internalType: 'bool', type: 'bool' },
      { name: 'royaltyPolicy', internalType: 'address', type: 'address' },
      { name: 'mintingFee', internalType: 'uint256', type: 'uint256' },
      { name: 'mintingFeeToken', internalType: 'address', type: 'address' },
    ],
    name: 'mintLicensePIL',
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
    inputs: [
      { name: 'licenseIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'royaltyContext', internalType: 'bytes', type: 'bytes' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'ipMetadata',
        internalType: 'struct Metadata.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'url', internalType: 'string', type: 'string' },
          {
            name: 'customMetadata',
            internalType: 'struct Metadata.Attribute[]',
            type: 'tuple[]',
            components: [
              { name: 'key', internalType: 'string', type: 'string' },
              { name: 'value', internalType: 'string', type: 'string' },
            ],
          },
        ],
      },
      {
        name: 'signature',
        internalType: 'struct SPG.Signature',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'registerDerivativeIpWithSig',
    outputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'policyId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenContract', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'ipMetadata',
        internalType: 'struct Metadata.IPMetadata',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'url', internalType: 'string', type: 'string' },
          {
            name: 'customMetadata',
            internalType: 'struct Metadata.Attribute[]',
            type: 'tuple[]',
            components: [
              { name: 'key', internalType: 'string', type: 'string' },
              { name: 'value', internalType: 'string', type: 'string' },
            ],
          },
        ],
      },
      {
        name: 'signature',
        internalType: 'struct SPG.Signature',
        type: 'tuple',
        components: [
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'registerIpWithSig',
    outputs: [{ name: 'ipId', internalType: 'address', type: 'address' }],
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

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xf82EEe73c2c81D14DF9bC29DC154dD3c079d80a0)
 */
export const spgAddress = {
  11155111: '0xf82EEe73c2c81D14DF9bC29DC154dD3c079d80a0',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xf82EEe73c2c81D14DF9bC29DC154dD3c079d80a0)
 */
export const spgConfig = { address: spgAddress, abi: spgAbi } as const
