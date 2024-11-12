import {
  Address,
  Hex,
  Abi,
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  WriteContractParameters,
  WriteContractReturnType,
  PublicClient,
  decodeEventLog,
  WatchContractEventReturnType,
  TransactionReceipt,
  encodeFunctionData,
} from "viem";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const accessControllerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "AccessController__BothCallerAndRecipientAreNotRegisteredModule",
  },
  {
    type: "error",
    inputs: [],
    name: "AccessController__CallerIsNotIPAccountOrOwner",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessController__IPAccountIsNotValid",
  },
  {
    type: "error",
    inputs: [],
    name: "AccessController__IPAccountIsZeroAddress",
  },
  {
    type: "error",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "AccessController__PermissionDenied",
  },
  { type: "error", inputs: [], name: "AccessController__PermissionIsNotValid" },
  { type: "error", inputs: [], name: "AccessController__SignerIsZeroAddress" },
  {
    type: "error",
    inputs: [],
    name: "AccessController__ToAndFuncAreZeroAddressShouldCallSetAllPermissions",
  },
  { type: "error", inputs: [], name: "AccessController__ZeroAccessManager" },
  {
    type: "error",
    inputs: [],
    name: "AccessController__ZeroIPAccountRegistry",
  },
  { type: "error", inputs: [], name: "AccessController__ZeroModuleRegistry" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipAccountOwner",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ipAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "signer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "func", internalType: "bytes4", type: "bytes4", indexed: false },
      {
        name: "permission",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "PermissionSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MODULE_REGISTRY",
    outputs: [{ name: "", internalType: "contract IModuleRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "checkPermission",
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
    ],
    name: "getPermission",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "permission", internalType: "uint8", type: "uint8" },
    ],
    name: "setAllPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "permissions",
        internalType: "struct AccessPermission.Permission[]",
        type: "tuple[]",
        components: [
          { name: "ipAccount", internalType: "address", type: "address" },
          { name: "signer", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "func", internalType: "bytes4", type: "bytes4" },
          { name: "permission", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "setBatchPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipAccount", internalType: "address", type: "address" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "func", internalType: "bytes4", type: "bytes4" },
      { name: "permission", internalType: "uint8", type: "uint8" },
    ],
    name: "setPermission",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const accessControllerAddress = {
  1516: "0xf709c8001E94e2ca6F98b7fFBCd5BD3943E46D81",
} as const;

/**
 *
 */
export const accessControllerConfig = {
  address: accessControllerAddress,
  abi: accessControllerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CoreMetadataModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const coreMetadataModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [],
    name: "CoreMetadataModule__MetadataAlreadyFrozen",
  },
  { type: "error", inputs: [], name: "CoreMetadataModule__ZeroAccessManager" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "ipId", internalType: "address", type: "address", indexed: true }],
    name: "MetadataFrozen",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "metadataURI",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "metadataHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "MetadataURISet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "nftTokenURI",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "nftMetadataHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "NFTTokenURISet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "freezeMetadata",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "isMetadataFrozen",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "metadataURI", internalType: "string", type: "string" },
      { name: "metadataHash", internalType: "bytes32", type: "bytes32" },
      { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "metadataURI", internalType: "string", type: "string" },
      { name: "metadataHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setMetadataURI",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
    ],
    name: "updateNftTokenURI",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const coreMetadataModuleAddress = {
  1516: "0x89630Ccf23277417FBdfd3076C702F5248267e78",
} as const;

/**
 *
 */
export const coreMetadataModuleConfig = {
  address: coreMetadataModuleAddress,
  abi: coreMetadataModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DerivativeWorkflows
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const derivativeWorkflowsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "coreMetadataModule", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "licenseToken", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "pilTemplate", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "caller", internalType: "address", type: "address" },
      { name: "actualTokenOwner", internalType: "address", type: "address" },
    ],
    name: "DerivativeWorkflows__CallerAndNotTokenOwner",
  },
  {
    type: "error",
    inputs: [],
    name: "DerivativeWorkflows__EmptyLicenseTokens",
  },
  { type: "error", inputs: [], name: "DerivativeWorkflows__ZeroAddressParam" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "Workflow__CallerNotAuthorizedToMint" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CORE_METADATA_MODULE",
    outputs: [
      {
        name: "",
        internalType: "contract ICoreMetadataModule",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_TOKEN",
    outputs: [{ name: "", internalType: "contract ILicenseToken", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "PIL_TEMPLATE",
    outputs: [
      {
        name: "",
        internalType: "contract IPILicenseTemplate",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spgNftContract", internalType: "address", type: "address" },
      {
        name: "derivData",
        internalType: "struct WorkflowStructs.MakeDerivative",
        type: "tuple",
        components: [
          { name: "parentIpIds", internalType: "address[]", type: "address[]" },
          { name: "licenseTemplate", internalType: "address", type: "address" },
          {
            name: "licenseTermsIds",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "royaltyContext", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      { name: "recipient", internalType: "address", type: "address" },
    ],
    name: "mintAndRegisterIpAndMakeDerivative",
    outputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "spgNftContract", internalType: "address", type: "address" },
      { name: "licenseTokenIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      { name: "recipient", internalType: "address", type: "address" },
    ],
    name: "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
    outputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC721Received",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "nftContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      {
        name: "derivData",
        internalType: "struct WorkflowStructs.MakeDerivative",
        type: "tuple",
        components: [
          { name: "parentIpIds", internalType: "address[]", type: "address[]" },
          { name: "licenseTemplate", internalType: "address", type: "address" },
          {
            name: "licenseTermsIds",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "royaltyContext", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "sigMetadata",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "sigRegister",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "registerIpAndMakeDerivative",
    outputs: [{ name: "ipId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "nftContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "licenseTokenIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "sigMetadata",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "sigRegister",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "registerIpAndMakeDerivativeWithLicenseTokens",
    outputs: [{ name: "ipId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newNftContractBeacon",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setNftContractBeacon",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const derivativeWorkflowsAddress = {
  1516: "0xa8815CEB96857FFb8f5F8ce920b1Ae6D70254C7B",
} as const;

/**
 *
 */
export const derivativeWorkflowsConfig = {
  address: derivativeWorkflowsAddress,
  abi: derivativeWorkflowsAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  { type: "error", inputs: [], name: "DisputeModule__NotAbleToResolve" },
  { type: "error", inputs: [], name: "DisputeModule__NotAllowedToWhitelist" },
  { type: "error", inputs: [], name: "DisputeModule__NotDerivative" },
  { type: "error", inputs: [], name: "DisputeModule__NotDisputeInitiator" },
  { type: "error", inputs: [], name: "DisputeModule__NotInDisputeState" },
  { type: "error", inputs: [], name: "DisputeModule__NotRegisteredIpId" },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationRelayer",
  },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__NotWhitelistedDisputeTag",
  },
  {
    type: "error",
    inputs: [],
    name: "DisputeModule__ParentDisputeNotResolved",
  },
  { type: "error", inputs: [], name: "DisputeModule__ParentIpIdMismatch" },
  { type: "error", inputs: [], name: "DisputeModule__ParentNotTagged" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroAccessController" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroAccessManager" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroArbitrationPolicy" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroArbitrationRelayer" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroDisputeEvidenceHash" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroDisputeTag" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroIPAssetRegistry" },
  { type: "error", inputs: [], name: "DisputeModule__ZeroLicenseRegistry" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "ArbitrationPolicySet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ArbitrationPolicyWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "arbitrationRelayer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ArbitrationRelayerWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "DefaultArbitrationPolicyUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "parentIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "derivativeIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "parentDisputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "tag", internalType: "bytes32", type: "bytes32", indexed: false },
    ],
    name: "DerivativeTaggedOnParentInfringement",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "DisputeCancelled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "decision", internalType: "bool", type: "bool", indexed: false },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "DisputeJudgementSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "targetIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "disputeInitiator",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "arbitrationPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "disputeEvidenceHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "targetTag",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "DisputeRaised",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "disputeId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DisputeResolved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "tag", internalType: "bytes32", type: "bytes32", indexed: false },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "TagWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IN_DISPUTE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "arbitrationPolicies",
    outputs: [{ name: "policy", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseArbitrationPolicy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "disputeId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "cancelDispute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "disputeCounter",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "disputeId", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "targetIpId", internalType: "address", type: "address" },
      { name: "disputeInitiator", internalType: "address", type: "address" },
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "disputeEvidenceHash", internalType: "bytes32", type: "bytes32" },
      { name: "targetTag", internalType: "bytes32", type: "bytes32" },
      { name: "currentTag", internalType: "bytes32", type: "bytes32" },
      { name: "parentDisputeId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "isIpTagged",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "arbitrationPolicy", internalType: "address", type: "address" }],
    name: "isWhitelistedArbitrationPolicy",
    outputs: [{ name: "allowed", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "arbitrationRelayer", internalType: "address", type: "address" },
    ],
    name: "isWhitelistedArbitrationRelayer",
    outputs: [{ name: "allowed", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tag", internalType: "bytes32", type: "bytes32" }],
    name: "isWhitelistedDisputeTag",
    outputs: [{ name: "allowed", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "targetIpId", internalType: "address", type: "address" },
      { name: "disputeEvidenceHash", internalType: "bytes32", type: "bytes32" },
      { name: "targetTag", internalType: "bytes32", type: "bytes32" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "raiseDispute",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "disputeId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "resolveDispute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
    ],
    name: "setArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "arbitrationPolicy", internalType: "address", type: "address" }],
    name: "setBaseArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "disputeId", internalType: "uint256", type: "uint256" },
      { name: "decision", internalType: "bool", type: "bool" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "setDisputeJudgement",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "derivativeIpId", internalType: "address", type: "address" },
      { name: "parentDisputeId", internalType: "uint256", type: "uint256" },
    ],
    name: "tagDerivativeIfParentInfringed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistArbitrationPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "arbitrationPolicy", internalType: "address", type: "address" },
      { name: "arbPolicyRelayer", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistArbitrationRelayer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tag", internalType: "bytes32", type: "bytes32" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistDisputeTag",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const disputeModuleAddress = {
  1516: "0x692B47fa72eE7Ac0Ec617ea384a0cAD41098F712",
} as const;

/**
 *
 */
export const disputeModuleConfig = {
  address: disputeModuleAddress,
  abi: disputeModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvenSplitGroupPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const evenSplitGroupPoolAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "groupingModule", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "EvenSplitGroupPool__CallerIsNotGroupingModule",
  },
  { type: "error", inputs: [], name: "EvenSplitGroupPool__ZeroGroupingModule" },
  {
    type: "error",
    inputs: [],
    name: "EvenSplitGroupPool__ZeroIPAssetRegistry",
  },
  { type: "error", inputs: [], name: "EvenSplitGroupPool__ZeroRoyaltyModule" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroAccessManager" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUPING_MODULE",
    outputs: [{ name: "", internalType: "contract IGroupingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUP_IP_ASSET_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IGroupIPAssetRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "addIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositReward",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "distributeRewards",
    outputs: [{ name: "rewards", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "getAvailableReward",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "getIpAddedTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "getIpRewardDebt",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "getTotalIps",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "isIPAdded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "removeIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const evenSplitGroupPoolAddress = {
  1516: "0xC384B56fD62d6679Cd62A2fE0dA3fe4560f33391",
} as const;

/**
 *
 */
export const evenSplitGroupPoolConfig = {
  address: evenSplitGroupPoolAddress,
  abi: evenSplitGroupPoolAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GroupingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const groupingModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "licenseToken", internalType: "address", type: "address" },
      { name: "groupNFT", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  {
    type: "error",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "childGroupId", internalType: "address", type: "address" },
    ],
    name: "GroupingModule__CannotAddGroupToGroup",
  },
  {
    type: "error",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "GroupingModule__GroupFrozenDueToAlreadyMintLicenseTokens",
  },
  {
    type: "error",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "GroupingModule__GroupFrozenDueToHasDerivativeIps",
  },
  {
    type: "error",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "GroupingModule__GroupIPHasMintingFee",
  },
  {
    type: "error",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "GroupingModule__GroupIPHasNoLicenseTerms",
  },
  {
    type: "error",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "GroupingModule__GroupRoyaltyVaultNotCreated",
  },
  {
    type: "error",
    inputs: [{ name: "groupNFT", internalType: "address", type: "address" }],
    name: "GroupingModule__InvalidGroupNFT",
  },
  {
    type: "error",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "GroupingModule__IpHasNoGroupLicenseTerms",
  },
  { type: "error", inputs: [], name: "GroupingModule__ZeroAccessManager" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroGroupNFT" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroGroupRewardPool" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroIpAssetRegistry" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroLicenseRegistry" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroLicenseToken" },
  { type: "error", inputs: [], name: "GroupingModule__ZeroRoyaltyModule" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "groupId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "ipIds",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
    ],
    name: "AddedIpToGroup",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "groupId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "ipId",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "ClaimedReward",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "groupId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "snapshots",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "CollectedRoyaltiesToGroupPool",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "groupId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "groupPool",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "IPGroupRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "groupId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "ipIds",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
    ],
    name: "RemovedIpFromGroup",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUP_IP_ASSET_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IGroupIPAssetRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUP_NFT",
    outputs: [{ name: "", internalType: "contract IGroupNFT", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_TOKEN",
    outputs: [{ name: "", internalType: "contract ILicenseToken", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupIpId", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "addIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "snapshotIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "collectRoyalties",
    outputs: [{ name: "royalties", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "getClaimableReward",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "groupPool", internalType: "address", type: "address" }],
    name: "registerGroup",
    outputs: [{ name: "groupId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupIpId", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "removeIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "rewardPool", internalType: "address", type: "address" }],
    name: "whitelistGroupRewardPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const groupingModuleAddress = {
  1516: "0xa731948cfE05135ad77d48C71f75066333Da78Bf",
} as const;

/**
 *
 */
export const groupingModuleConfig = {
  address: groupingModuleAddress,
  abi: groupingModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GroupingWorkflows
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const groupingWorkflowsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "coreMetadataModule", internalType: "address", type: "address" },
      { name: "groupingModule", internalType: "address", type: "address" },
      { name: "groupNft", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "pilTemplate", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "GroupingWorkflows__ZeroAddressParam" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "Workflow__CallerNotAuthorizedToMint" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CORE_METADATA_MODULE",
    outputs: [
      {
        name: "",
        internalType: "contract ICoreMetadataModule",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUPING_MODULE",
    outputs: [{ name: "", internalType: "contract IGroupingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUP_NFT",
    outputs: [{ name: "", internalType: "contract GroupNFT", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "PIL_TEMPLATE",
    outputs: [
      {
        name: "",
        internalType: "contract IPILicenseTemplate",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract RoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupIpId", internalType: "address", type: "address" },
      { name: "currencyTokens", internalType: "address[]", type: "address[]" },
      {
        name: "groupSnapshotIds",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      { name: "memberIpIds", internalType: "address[]", type: "address[]" },
    ],
    name: "collectRoyaltiesAndClaimReward",
    outputs: [
      {
        name: "collectedRoyalties",
        internalType: "uint256[]",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spgNftContract", internalType: "address", type: "address" },
      { name: "groupId", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "sigAddToGroup",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "mintAndRegisterIpAndAttachLicenseAndAddToGroup",
    outputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupPool", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "registerGroupAndAttachLicense",
    outputs: [{ name: "groupId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupPool", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "registerGroupAndAttachLicenseAndAddIps",
    outputs: [{ name: "groupId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "nftContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "groupId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "sigMetadataAndAttach",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "sigAddToGroup",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "registerIpAndAttachLicenseAndAddToGroup",
    outputs: [{ name: "ipId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newNftContractBeacon",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setNftContractBeacon",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const groupingWorkflowsAddress = {
  1516: "0xcd754994eBE5Ce16D432C1f936f98ac0d4aABA0e",
} as const;

/**
 *
 */
export const groupingWorkflowsConfig = {
  address: groupingWorkflowsAddress,
  abi: groupingWorkflowsAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAccountImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipAccountImplAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "FnSelectorNotRecognized" },
  { type: "error", inputs: [], name: "IPAccountStorage__InvalidBatchLengths" },
  {
    type: "error",
    inputs: [{ name: "module", internalType: "address", type: "address" }],
    name: "IPAccountStorage__NotRegisteredModule",
  },
  { type: "error", inputs: [], name: "IPAccountStorage__ZeroIpAssetRegistry" },
  { type: "error", inputs: [], name: "IPAccountStorage__ZeroLicenseRegistry" },
  { type: "error", inputs: [], name: "IPAccountStorage__ZeroModuleRegistry" },
  { type: "error", inputs: [], name: "IPAccount__ExpiredSignature" },
  { type: "error", inputs: [], name: "IPAccount__InvalidCalldata" },
  { type: "error", inputs: [], name: "IPAccount__InvalidOperation" },
  { type: "error", inputs: [], name: "IPAccount__InvalidSignature" },
  { type: "error", inputs: [], name: "IPAccount__InvalidSigner" },
  { type: "error", inputs: [], name: "IPAccount__ZeroAccessController" },
  { type: "error", inputs: [], name: "OperationNotSupported" },
  { type: "error", inputs: [], name: "SelfOwnDetected" },
  { type: "error", inputs: [], name: "Unauthorized" },
  { type: "error", inputs: [], name: "UnauthorizedCallContext" },
  { type: "error", inputs: [], name: "UpgradeFailed" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      {
        name: "nonce",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "Executed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      {
        name: "nonce",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "signer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "ExecutedWithSig",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  { type: "fallback", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MODULE_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "bytes32Data",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "bytes32", type: "bytes32" },
    ],
    name: "bytesData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", internalType: "bytes1", type: "bytes1" },
      { name: "name", internalType: "string", type: "string" },
      { name: "version", internalType: "string", type: "string" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "verifyingContract", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "extensions", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "operation", internalType: "uint8", type: "uint8" },
    ],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct ERC6551.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "value", internalType: "uint256", type: "uint256" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "operation", internalType: "uint8", type: "uint8" },
    ],
    name: "executeBatch",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "signer", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "executeWithSig",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "getBytes",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "namespace", internalType: "bytes32", type: "bytes32" },
      { name: "key", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getBytes",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "namespace", internalType: "bytes32", type: "bytes32" },
      { name: "key", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getBytes32",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "getBytes32",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "namespaces", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "keys", internalType: "bytes32[]", type: "bytes32[]" },
    ],
    name: "getBytes32Batch",
    outputs: [{ name: "values", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "namespaces", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "keys", internalType: "bytes32[]", type: "bytes32[]" },
    ],
    name: "getBytesBatch",
    outputs: [{ name: "values", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ name: "result", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "signer", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSigner",
    outputs: [{ name: "result", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "signer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSigner",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "bytes", type: "bytes" },
    ],
    name: "setBytes",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setBytes32",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "keys", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "values", internalType: "bytes32[]", type: "bytes32[]" },
    ],
    name: "setBytes32Batch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "keys", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "values", internalType: "bytes[]", type: "bytes[]" },
    ],
    name: "setBytesBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "state",
    outputs: [{ name: "result", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 *
 */
export const ipAccountImplAddress = {
  1516: "0x24F08796561d6E1AC08e82b68BF4d9500B374Af6",
} as const;

/**
 *
 */
export const ipAccountImplConfig = {
  address: ipAccountImplAddress,
  abi: ipAccountImplAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipAssetRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "erc6551Registry", internalType: "address", type: "address" },
      { name: "ipAccountImpl", internalType: "address", type: "address" },
      { name: "groupingModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "GroupIPAssetRegistry__CallerIsNotGroupingModule",
  },
  {
    type: "error",
    inputs: [{ name: "groupPool", internalType: "address", type: "address" }],
    name: "GroupIPAssetRegistry__GroupRewardPoolNotRegistered",
  },
  {
    type: "error",
    inputs: [{ name: "rewardPool", internalType: "address", type: "address" }],
    name: "GroupIPAssetRegistry__InvalidGroupRewardPool",
  },
  {
    type: "error",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "GroupIPAssetRegistry__NotRegisteredGroupIP",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "GroupIPAssetRegistry__NotRegisteredIP",
  },
  { type: "error", inputs: [], name: "IPAccountRegistry_ZeroERC6551Registry" },
  { type: "error", inputs: [], name: "IPAccountRegistry_ZeroIpAccountImpl" },
  { type: "error", inputs: [], name: "IPAssetRegistry__AlreadyRegistered" },
  {
    type: "error",
    inputs: [
      { name: "contractAddress", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "IPAssetRegistry__InvalidToken",
  },
  {
    type: "error",
    inputs: [{ name: "contractAddress", internalType: "address", type: "address" }],
    name: "IPAssetRegistry__UnsupportedIERC721",
  },
  {
    type: "error",
    inputs: [{ name: "contractAddress", internalType: "address", type: "address" }],
    name: "IPAssetRegistry__UnsupportedIERC721Metadata",
  },
  { type: "error", inputs: [], name: "IPAssetRegistry__ZeroAccessManager" },
  {
    type: "error",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "IPAssetRegistry__ZeroAddress",
  },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  {
    type: "error",
    inputs: [
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "StringsInsufficientHexLength",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "chainId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenContract",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IPAccountRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "chainId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "name", internalType: "string", type: "string", indexed: false },
      { name: "uri", internalType: "string", type: "string", indexed: false },
      {
        name: "registrationDate",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IPRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "payer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "treasury",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "feeToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint96",
        type: "uint96",
        indexed: false,
      },
    ],
    name: "IPRegistrationFeePaid",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "treasury",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "feeToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "feeAmount",
        internalType: "uint96",
        type: "uint96",
        indexed: false,
      },
    ],
    name: "RegistrationFeeSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ERC6551_PUBLIC_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUPING_MODULE",
    outputs: [{ name: "", internalType: "contract IGroupingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_IMPL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_SALT",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "addGroupMember",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipId", internalType: "address", type: "address" },
    ],
    name: "containsIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getFeeAmount",
    outputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getFeeToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "startIndex", internalType: "uint256", type: "uint256" },
      { name: "size", internalType: "uint256", type: "uint256" },
    ],
    name: "getGroupMembers",
    outputs: [{ name: "results", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "getGroupRewardPool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getIPAccountImpl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTreasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipAccount",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "isRegisteredGroup",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "rewardPool", internalType: "address", type: "address" }],
    name: "isWhitelistedGroupRewardPool",
    outputs: [{ name: "isWhitelisted", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainid", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "register",
    outputs: [{ name: "id", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupNft", internalType: "address", type: "address" },
      { name: "groupNftId", internalType: "uint256", type: "uint256" },
      { name: "rewardPool", internalType: "address", type: "address" },
    ],
    name: "registerGroup",
    outputs: [{ name: "groupId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "groupId", internalType: "address", type: "address" },
      { name: "ipIds", internalType: "address[]", type: "address[]" },
    ],
    name: "removeGroupMember",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "treasury", internalType: "address", type: "address" },
      { name: "feeToken", internalType: "address", type: "address" },
      { name: "feeAmount", internalType: "uint96", type: "uint96" },
    ],
    name: "setRegistrationFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "groupId", internalType: "address", type: "address" }],
    name: "totalMembers",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "rewardPool", internalType: "address", type: "address" }],
    name: "whitelistGroupRewardPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const ipAssetRegistryAddress = {
  1516: "0x28E59E91C0467e89fd0f0438D47Ca839cDfEc095",
} as const;

/**
 *
 */
export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IpRoyaltyVaultImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipRoyaltyVaultImplAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "disputeModule", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "IpRoyaltyVault__EnforcedPause" },
  {
    type: "error",
    inputs: [],
    name: "IpRoyaltyVault__InsufficientTimeElapsedSinceLastSnapshot",
  },
  { type: "error", inputs: [], name: "IpRoyaltyVault__InvalidTargetIpId" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__NoClaimableTokens" },
  {
    type: "error",
    inputs: [],
    name: "IpRoyaltyVault__NoNewRevenueSinceLastSnapshot",
  },
  {
    type: "error",
    inputs: [],
    name: "IpRoyaltyVault__NotAllowedToAddTokenToVault",
  },
  {
    type: "error",
    inputs: [],
    name: "IpRoyaltyVault__NotWhitelistedRoyaltyToken",
  },
  {
    type: "error",
    inputs: [],
    name: "IpRoyaltyVault__VaultDoesNotBelongToAnAncestor",
  },
  { type: "error", inputs: [], name: "IpRoyaltyVault__VaultsMustClaimAsSelf" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ZeroAmount" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "IpRoyaltyVault__ZeroRoyaltyModule" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RevenueTokenAddedToVault",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "claimer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RevenueTokenClaimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "id", internalType: "uint256", type: "uint256", indexed: false }],
    name: "Snapshot",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "snapshotId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "snapshotTimestamp",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SnapshotCompleted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
    ],
    name: "balanceOfAt",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "token", internalType: "address", type: "address" },
      { name: "targetIpId", internalType: "address", type: "address" },
    ],
    name: "claimBySnapshotBatchAsSelf",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "tokenList", internalType: "address[]", type: "address[]" },
      { name: "targetIpId", internalType: "address", type: "address" },
    ],
    name: "claimByTokenBatchAsSelf",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "token", internalType: "address", type: "address" },
      { name: "claimer", internalType: "address", type: "address" },
    ],
    name: "claimRevenueOnBehalfBySnapshotBatch",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "tokenList", internalType: "address[]", type: "address[]" },
      { name: "claimer", internalType: "address", type: "address" },
    ],
    name: "claimRevenueOnBehalfByTokenBatch",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "claimVaultAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claimableAtSnapshot",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claimableRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentSnapshotId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "symbol", internalType: "string", type: "string" },
      { name: "supply", internalType: "uint32", type: "uint32" },
      { name: "ipIdAddress", internalType: "address", type: "address" },
      { name: "rtReceiver", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "ipId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "claimer", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "isClaimedAtSnapshot",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastSnapshotTimestamp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "pendingVaultAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "snapshot",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokens",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "snapshotId", internalType: "uint256", type: "uint256" }],
    name: "totalSupplyAt",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "updateVaultBalance",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const ipRoyaltyVaultImplAddress = {
  1516: "0x1081250219B16cc3903Aa2d2d1403A75c6A2F9f5",
} as const;

/**
 *
 */
export const ipRoyaltyVaultImplConfig = {
  address: ipRoyaltyVaultImplAddress,
  abi: ipRoyaltyVaultImplAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseAttachmentWorkflows
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const licenseAttachmentWorkflowsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "coreMetadataModule", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "pilTemplate", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  {
    type: "error",
    inputs: [],
    name: "LicenseAttachmentWorkflows__ZeroAddressParam",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "Workflow__CallerNotAuthorizedToMint" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CORE_METADATA_MODULE",
    outputs: [
      {
        name: "",
        internalType: "contract ICoreMetadataModule",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "PIL_TEMPLATE",
    outputs: [
      {
        name: "",
        internalType: "contract IPILicenseTemplate",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spgNftContract", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address", type: "address" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          {
            name: "defaultMintingFee",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
    ],
    name: "mintAndRegisterIpAndAttachPILTerms",
    outputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "nftContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          {
            name: "defaultMintingFee",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
      {
        name: "sigMetadata",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "sigAttach",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "registerIpAndAttachPILTerms",
    outputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          {
            name: "defaultMintingFee",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
      {
        name: "sigAttach",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "registerPILTermsAndAttach",
    outputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newNftContractBeacon",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setNftContractBeacon",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const licenseAttachmentWorkflowsAddress = {
  1516: "0x44Bad1E4035a44eAC1606B222873E4a85E8b7D9c",
} as const;

/**
 *
 */
export const licenseAttachmentWorkflowsConfig = {
  address: licenseAttachmentWorkflowsAddress,
  abi: licenseAttachmentWorkflowsAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const licenseRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
      { name: "ipGraphAcl", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  {
    type: "error",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
    ],
    name: "LicenseRegistry__AddParentIpToIPGraphFailed",
  },
  {
    type: "error",
    inputs: [],
    name: "LicenseRegistry__CallerNotLicensingModule",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeAlreadyRegistered",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeIpAlreadyHasChild",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeIpAlreadyHasLicense",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__DerivativeIsParent",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__DuplicateLicense",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__IndexOutOfBounds",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__IpExpired",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__LicenseTermsAlreadyAttached",
  },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__LicenseTermsNotExists",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__LicensorIpHasNoLicenseTerms",
  },
  {
    type: "error",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "LicenseRegistry__NotLicenseTemplate",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__ParentIpExpired",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicenseRegistry__ParentIpHasNoLicenseTerms",
  },
  {
    type: "error",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "LicenseRegistry__ParentIpTagged",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
    ],
    name: "LicenseRegistry__ParentIpUnmatchedLicenseTemplate",
  },
  {
    type: "error",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "newLicenseTemplate", internalType: "address", type: "address" },
    ],
    name: "LicenseRegistry__UnmatchedLicenseTemplate",
  },
  {
    type: "error",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "LicenseRegistry__UnregisteredLicenseTemplate",
  },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroAccessManager" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroIPGraphACL" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroLicenseTemplate" },
  { type: "error", inputs: [], name: "LicenseRegistry__ZeroLicensingModule" },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__DerivativesCannotAddLicenseTerms",
  },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicensingModule__LicenseTermsNotFound",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DefaultLicenseTermsSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "expireTime",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ExpirationTimeSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "LicenseTemplateRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "licensingConfig",
        internalType: "struct Licensing.LicensingConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "licensingHook", internalType: "address", type: "address" },
          { name: "hookData", internalType: "bytes", type: "bytes" },
        ],
        indexed: false,
      },
    ],
    name: "LicensingConfigSetForIP",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "LicensingConfigSetForLicense",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "EXPIRATION_TIME",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH_ACL",
    outputs: [{ name: "", internalType: "contract IPGraphACL", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "attachLicenseTermsToIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "exists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getAttachedLicenseTerms",
    outputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getAttachedLicenseTermsCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDefaultLicenseTerms",
    outputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getDerivativeIp",
    outputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "parentIpId", internalType: "address", type: "address" }],
    name: "getDerivativeIpCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getExpireTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "getLicensingConfig",
    outputs: [
      {
        name: "",
        internalType: "struct Licensing.LicensingConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "licensingHook", internalType: "address", type: "address" },
          { name: "hookData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "getParentIp",
    outputs: [{ name: "parentIpId", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "getParentIpCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpId", internalType: "address", type: "address" },
    ],
    name: "getParentLicenseTerms",
    outputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "parentIpId", internalType: "address", type: "address" }],
    name: "hasDerivativeIps",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "hasIpAttachedLicenseTerms",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "isDerivativeIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "isExpiredNow",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isParentIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "isRegisteredLicenseTemplate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "isUsingLicenseToken", internalType: "bool", type: "bool" },
    ],
    name: "registerDerivativeIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTemplate", internalType: "address", type: "address" }],
    name: "registerLicenseTemplate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newLicenseTemplate", internalType: "address", type: "address" },
      { name: "newLicenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "setDefaultLicenseTerms",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      {
        name: "licensingConfig",
        internalType: "struct Licensing.LicensingConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "licensingHook", internalType: "address", type: "address" },
          { name: "hookData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "setLicensingConfigForIp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      {
        name: "licensingConfig",
        internalType: "struct Licensing.LicensingConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "licensingHook", internalType: "address", type: "address" },
          { name: "hookData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "setLicensingConfigForLicense",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "isMintedByIpOwner", internalType: "bool", type: "bool" },
    ],
    name: "verifyMintLicenseToken",
    outputs: [
      {
        name: "",
        internalType: "struct Licensing.LicensingConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "licensingHook", internalType: "address", type: "address" },
          { name: "hookData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const licenseRegistryAddress = {
  1516: "0xBda3992c49E98392e75E78d82B934F3598bA495f",
} as const;

/**
 *
 */
export const licenseRegistryConfig = {
  address: licenseRegistryAddress,
  abi: licenseRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicenseToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const licenseTokenAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "ERC721EnumerableForbiddenBatchMint" },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "ERC721IncorrectOwner",
  },
  {
    type: "error",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC721InsufficientApproval",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC721InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "operator", internalType: "address", type: "address" }],
    name: "ERC721InvalidOperator",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "ERC721InvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC721InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC721InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ERC721NonexistentToken",
  },
  {
    type: "error",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC721OutOfBoundsIndex",
  },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      {
        name: "anotherLicenseTemplate",
        internalType: "address",
        type: "address",
      },
    ],
    name: "LicenseToken__AllLicenseTokensMustFromSameLicenseTemplate",
  },
  {
    type: "error",
    inputs: [
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "caller", internalType: "address", type: "address" },
      { name: "childIpIp", internalType: "address", type: "address" },
      { name: "actualTokenOwner", internalType: "address", type: "address" },
    ],
    name: "LicenseToken__CallerAndChildIPNotTokenOwner",
  },
  { type: "error", inputs: [], name: "LicenseToken__CallerNotLicensingModule" },
  { type: "error", inputs: [], name: "LicenseToken__NotTransferable" },
  {
    type: "error",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "LicenseToken__RevokedLicense",
  },
  { type: "error", inputs: [], name: "LicenseToken__ZeroAccessManager" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "StringsInsufficientHexLength",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_fromTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_toTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "BatchMetadataUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "LicenseTokenMinted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "holder", internalType: "address", type: "address" },
      { name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "burnLicenseTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getLicenseTemplate",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getLicenseTermsId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getLicenseTokenMetadata",
    outputs: [
      {
        name: "",
        internalType: "struct ILicenseToken.LicenseTokenMetadata",
        type: "tuple",
        components: [
          { name: "licensorIpId", internalType: "address", type: "address" },
          { name: "licenseTemplate", internalType: "address", type: "address" },
          { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
          { name: "transferable", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getLicensorIpId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licensorIpId", internalType: "address", type: "address" }],
    name: "getTotalTokensByLicensor",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "accessManager", internalType: "address", type: "address" },
      { name: "imageUrl", internalType: "string", type: "string" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "isLicenseTokenRevoked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "minter", internalType: "address", type: "address" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mintLicenseTokens",
    outputs: [{ name: "startLicenseTokenId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "url", internalType: "string", type: "string" }],
    name: "setLicensingImageUrl",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "index", internalType: "uint256", type: "uint256" }],
    name: "tokenByIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalMintedTokens",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "validateLicenseTokensForDerivative",
    outputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licensorIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const licenseTokenAddress = {
  1516: "0xB138aEd64814F2845554f9DBB116491a077eEB2D",
} as const;

/**
 *
 */
export const licenseTokenConfig = {
  address: licenseTokenAddress,
  abi: licenseTokenAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LicensingModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const licensingModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "moduleRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
      { name: "licenseToken", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "LicensingModule__DisputedIpId" },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "LicensingModule__InvalidLicenseTermsId",
  },
  {
    type: "error",
    inputs: [{ name: "hook", internalType: "address", type: "address" }],
    name: "LicensingModule__InvalidLicensingHook",
  },
  {
    type: "error",
    inputs: [
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "licensorIpId", internalType: "address", type: "address" },
    ],
    name: "LicensingModule__LicenseDenyMintLicenseToken",
  },
  {
    type: "error",
    inputs: [{ name: "childIpId", internalType: "address", type: "address" }],
    name: "LicensingModule__LicenseNotCompatibleForDerivative",
  },
  {
    type: "error",
    inputs: [
      { name: "ipLength", internalType: "uint256", type: "uint256" },
      { name: "licenseTermsLength", internalType: "uint256", type: "uint256" },
    ],
    name: "LicensingModule__LicenseTermsLengthMismatch",
  },
  {
    type: "error",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "licenseTokenIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "LicensingModule__LicenseTokenNotCompatibleForDerivative",
  },
  {
    type: "error",
    inputs: [],
    name: "LicensingModule__LicensorIpNotRegistered",
  },
  { type: "error", inputs: [], name: "LicensingModule__MintAmountZero" },
  { type: "error", inputs: [], name: "LicensingModule__NoLicenseToken" },
  { type: "error", inputs: [], name: "LicensingModule__NoParentIp" },
  { type: "error", inputs: [], name: "LicensingModule__ReceiverZeroAddress" },
  { type: "error", inputs: [], name: "LicensingModule__ZeroAccessManager" },
  { type: "error", inputs: [], name: "LicensingModule__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "LicensingModule__ZeroLicenseRegistry" },
  { type: "error", inputs: [], name: "LicensingModule__ZeroLicenseToken" },
  { type: "error", inputs: [], name: "LicensingModule__ZeroModuleRegistry" },
  { type: "error", inputs: [], name: "LicensingModule__ZeroRoyaltyModule" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "childIpId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTokenIds",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "parentIpIds",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
      {
        name: "licenseTermsIds",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "DerivativeRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LicenseTermsAttached",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licensorIpId",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "startLicenseTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LicenseTokensMinted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_NFT",
    outputs: [{ name: "", internalType: "contract ILicenseToken", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MODULE_REGISTRY",
    outputs: [{ name: "", internalType: "contract IModuleRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract RoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
    ],
    name: "attachLicenseTerms",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "mintLicenseTokens",
    outputs: [{ name: "startLicenseTokenId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "predictMintingLicenseFee",
    outputs: [
      { name: "currencyToken", internalType: "address", type: "address" },
      { name: "tokenAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "registerDerivative",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "licenseTokenIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "royaltyContext", internalType: "bytes", type: "bytes" },
    ],
    name: "registerDerivativeWithLicenseTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licenseTemplate", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      {
        name: "licensingConfig",
        internalType: "struct Licensing.LicensingConfig",
        type: "tuple",
        components: [
          { name: "isSet", internalType: "bool", type: "bool" },
          { name: "mintingFee", internalType: "uint256", type: "uint256" },
          { name: "licensingHook", internalType: "address", type: "address" },
          { name: "hookData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "setLicensingConfig",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const licensingModuleAddress = {
  1516: "0x5a7D9Fa17DE09350F481A53B470D798c1c1aabae",
} as const;

/**
 *
 */
export const licensingModuleConfig = {
  address: licensingModuleAddress,
  abi: licensingModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const mockErc20Abi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const mockErc20Address = {
  1516: "0x12A8b0DcC6e3bB0915638361D9D49942Da07F455",
} as const;

/**
 *
 */
export const mockErc20Config = {
  address: mockErc20Address,
  abi: mockErc20Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ModuleRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const moduleRegistryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "ModuleRegistry__InterfaceIdZero" },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleAddressNotContract",
  },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleAddressZeroAddress",
  },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleAlreadyRegistered",
  },
  { type: "error", inputs: [], name: "ModuleRegistry__ModuleNotRegistered" },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleNotSupportExpectedModuleTypeInterfaceId",
  },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleTypeAlreadyRegistered",
  },
  { type: "error", inputs: [], name: "ModuleRegistry__ModuleTypeEmptyString" },
  {
    type: "error",
    inputs: [],
    name: "ModuleRegistry__ModuleTypeNotRegistered",
  },
  { type: "error", inputs: [], name: "ModuleRegistry__NameAlreadyRegistered" },
  { type: "error", inputs: [], name: "ModuleRegistry__NameDoesNotMatch" },
  { type: "error", inputs: [], name: "ModuleRegistry__NameEmptyString" },
  { type: "error", inputs: [], name: "ModuleRegistry__ZeroAccessManager" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "name", internalType: "string", type: "string", indexed: false },
      {
        name: "module",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "moduleTypeInterfaceId",
        internalType: "bytes4",
        type: "bytes4",
        indexed: true,
      },
      {
        name: "moduleType",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "ModuleAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "name", internalType: "string", type: "string", indexed: false },
      {
        name: "module",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ModuleRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "getModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "moduleAddress", internalType: "address", type: "address" }],
    name: "getModuleType",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "moduleType", internalType: "string", type: "string" }],
    name: "getModuleTypeInterfaceId",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "moduleAddress", internalType: "address", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "moduleAddress", internalType: "address", type: "address" },
    ],
    name: "registerModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "moduleAddress", internalType: "address", type: "address" },
      { name: "moduleType", internalType: "string", type: "string" },
    ],
    name: "registerModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "name", internalType: "string", type: "string" },
      { name: "interfaceId", internalType: "bytes4", type: "bytes4" },
    ],
    name: "registerModuleType",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "removeModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "name", internalType: "string", type: "string" }],
    name: "removeModuleType",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const moduleRegistryAddress = {
  1516: "0x9F18c5723BC4Ee447CF9B01a8543D3b08b7F09C7",
} as const;

/**
 *
 */
export const moduleRegistryConfig = {
  address: moduleRegistryAddress,
  abi: moduleRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Multicall3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const multicall3Abi = [
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct Multicall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "returnData", internalType: "bytes[]", type: "bytes[]" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct Multicall3.Call3[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "allowFailure", internalType: "bool", type: "bool" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        name: "returnData",
        internalType: "struct Multicall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct Multicall3.Call3Value[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "allowFailure", internalType: "bool", type: "bool" },
          { name: "value", internalType: "uint256", type: "uint256" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate3Value",
    outputs: [
      {
        name: "returnData",
        internalType: "struct Multicall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct Multicall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "blockAndAggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "blockHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "returnData",
        internalType: "struct Multicall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "getBasefee",
    outputs: [{ name: "basefee", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "blockNumber", internalType: "uint256", type: "uint256" }],
    name: "getBlockHash",
    outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getBlockNumber",
    outputs: [{ name: "blockNumber", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getChainId",
    outputs: [{ name: "chainid", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockCoinbase",
    outputs: [{ name: "coinbase", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockDifficulty",
    outputs: [{ name: "difficulty", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockGasLimit",
    outputs: [{ name: "gaslimit", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockTimestamp",
    outputs: [{ name: "timestamp", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "getEthBalance",
    outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getLastBlockHash",
    outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "requireSuccess", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct Multicall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "tryAggregate",
    outputs: [
      {
        name: "returnData",
        internalType: "struct Multicall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "requireSuccess", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct Multicall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "tryBlockAndAggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "blockHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "returnData",
        internalType: "struct Multicall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const multicall3Address = {
  1516: "0xcA11bde05977b3631167028862bE2a173976CA11",
} as const;

/**
 *
 */
export const multicall3Config = {
  address: multicall3Address,
  abi: multicall3Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PILicenseTemplate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const piLicenseTemplateAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "ipAccountRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "royaltyModule", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "ipAccount", internalType: "address", type: "address" }],
    name: "AccessControlled__NotIpAccount",
  },
  { type: "error", inputs: [], name: "AccessControlled__ZeroAddress" },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddCommercializers",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddDerivativeRevCeiling",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddRevCeiling",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddRevShare",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialDisabled_CantAddRoyaltyPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CommercialEnabled_RoyaltyPolicyRequired",
  },
  {
    type: "error",
    inputs: [{ name: "checker", internalType: "address", type: "address" }],
    name: "PILicenseTemplate__CommercializerCheckerDoesNotSupportHook",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__CurrencyTokenNotWhitelisted",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddApproval",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddAttribution",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddDerivativeRevCeiling",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__DerivativesDisabled_CantAddReciprocal",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__RoyaltyPolicyNotWhitelisted",
  },
  {
    type: "error",
    inputs: [],
    name: "PILicenseTemplate__RoyaltyPolicyRequiresCurrencyToken",
  },
  { type: "error", inputs: [], name: "PILicenseTemplate__ZeroAccessManager" },
  { type: "error", inputs: [], name: "PILicenseTemplate__ZeroLicenseRegistry" },
  { type: "error", inputs: [], name: "PILicenseTemplate__ZeroRoyaltyModule" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "ipId", internalType: "address", type: "address", indexed: true },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "DerivativeApproved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "licenseTermsId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "licenseTemplate",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "licenseTerms",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "LicenseTermsRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IIPAccountRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "TERMS_RENDERER",
    outputs: [{ name: "", internalType: "contract PILTermsRenderer", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "exists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "start", internalType: "uint256", type: "uint256" },
    ],
    name: "getEarlierExpireTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "start", internalType: "uint256", type: "uint256" },
    ],
    name: "getExpireTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "selectedLicenseTermsId",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getLicenseTerms",
    outputs: [
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          {
            name: "defaultMintingFee",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          {
            name: "defaultMintingFee",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
    ],
    name: "getLicenseTermsId",
    outputs: [
      {
        name: "selectedLicenseTermsId",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "getLicenseTermsURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getMetadataURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "getRoyaltyPolicy",
    outputs: [
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "royaltyPercent", internalType: "uint32", type: "uint32" },
      { name: "mintingFee", internalType: "uint256", type: "uint256" },
      { name: "currency", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "accessManager", internalType: "address", type: "address" },
      { name: "name", internalType: "string", type: "string" },
      { name: "metadataURI", internalType: "string", type: "string" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
    ],
    name: "isDerivativeApproved",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "isLicenseTransferable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "terms",
        internalType: "struct PILTerms",
        type: "tuple",
        components: [
          { name: "transferable", internalType: "bool", type: "bool" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          {
            name: "defaultMintingFee",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "expiration", internalType: "uint256", type: "uint256" },
          { name: "commercialUse", internalType: "bool", type: "bool" },
          { name: "commercialAttribution", internalType: "bool", type: "bool" },
          {
            name: "commercializerChecker",
            internalType: "address",
            type: "address",
          },
          {
            name: "commercializerCheckerData",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "commercialRevShare",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "commercialRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "derivativesAllowed", internalType: "bool", type: "bool" },
          {
            name: "derivativesAttribution",
            internalType: "bool",
            type: "bool",
          },
          { name: "derivativesApproval", internalType: "bool", type: "bool" },
          { name: "derivativesReciprocal", internalType: "bool", type: "bool" },
          {
            name: "derivativeRevCeiling",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "currency", internalType: "address", type: "address" },
          { name: "uri", internalType: "string", type: "string" },
        ],
      },
    ],
    name: "registerLicenseTerms",
    outputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApproval",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsId", internalType: "uint256", type: "uint256" }],
    name: "toJson",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalRegisteredLicenseTerms",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" }],
    name: "verifyCompatibleLicenses",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "licensee", internalType: "address", type: "address" },
      { name: "licensorIpId", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "verifyMintLicenseToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpId", internalType: "address", type: "address" },
      { name: "licenseTermsId", internalType: "uint256", type: "uint256" },
      { name: "licensee", internalType: "address", type: "address" },
    ],
    name: "verifyRegisterDerivative",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "childIpId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      { name: "licenseTermsIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "childIpOwner", internalType: "address", type: "address" },
    ],
    name: "verifyRegisterDerivativeForAllParents",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const piLicenseTemplateAddress = {
  1516: "0x58E2c909D557Cd23EF90D14f8fd21667A5Ae7a93",
} as const;

/**
 *
 */
export const piLicenseTemplateConfig = {
  address: piLicenseTemplateAddress,
  abi: piLicenseTemplateAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RegistrationWorkflows
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const registrationWorkflowsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "accessController", internalType: "address", type: "address" },
      { name: "coreMetadataModule", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "pilTemplate", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [],
    name: "RegistrationWorkflows__ZeroAddressParam",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "Workflow__CallerNotAuthorizedToMint" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "spgNftContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CollectionCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ACCESS_CONTROLLER",
    outputs: [{ name: "", internalType: "contract IAccessController", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CORE_METADATA_MODULE",
    outputs: [
      {
        name: "",
        internalType: "contract ICoreMetadataModule",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [{ name: "", internalType: "contract IIPAssetRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "PIL_TEMPLATE",
    outputs: [
      {
        name: "",
        internalType: "contract IPILicenseTemplate",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "spgNftInitParams",
        internalType: "struct ISPGNFT.InitParams",
        type: "tuple",
        components: [
          { name: "name", internalType: "string", type: "string" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "baseURI", internalType: "string", type: "string" },
          { name: "contractURI", internalType: "string", type: "string" },
          { name: "maxSupply", internalType: "uint32", type: "uint32" },
          { name: "mintFee", internalType: "uint256", type: "uint256" },
          { name: "mintFeeToken", internalType: "address", type: "address" },
          {
            name: "mintFeeRecipient",
            internalType: "address",
            type: "address",
          },
          { name: "owner", internalType: "address", type: "address" },
          { name: "mintOpen", internalType: "bool", type: "bool" },
          { name: "isPublicMinting", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "createCollection",
    outputs: [{ name: "spgNftContract", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spgNftContract", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address", type: "address" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
    ],
    name: "mintAndRegisterIp",
    outputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "nftContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      {
        name: "ipMetadata",
        internalType: "struct WorkflowStructs.IPMetadata",
        type: "tuple",
        components: [
          { name: "ipMetadataURI", internalType: "string", type: "string" },
          { name: "ipMetadataHash", internalType: "bytes32", type: "bytes32" },
          { name: "nftMetadataURI", internalType: "string", type: "string" },
          { name: "nftMetadataHash", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "sigMetadata",
        internalType: "struct WorkflowStructs.SignatureData",
        type: "tuple",
        components: [
          { name: "signer", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "registerIp",
    outputs: [{ name: "ipId", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newNftContractBeacon",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setNftContractBeacon",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newNftContract", internalType: "address", type: "address" }],
    name: "upgradeCollections",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const registrationWorkflowsAddress = {
  1516: "0xde13Be395E1cd753471447Cf6A656979ef87881c",
} as const;

/**
 *
 */
export const registrationWorkflowsConfig = {
  address: registrationWorkflowsAddress,
  abi: registrationWorkflowsAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const royaltyModuleAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "licensingModule", internalType: "address", type: "address" },
      { name: "disputeModule", internalType: "address", type: "address" },
      { name: "licenseRegistry", internalType: "address", type: "address" },
      { name: "ipAssetRegistry", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__AboveAccumulatedRoyaltyPoliciesLimit",
  },
  { type: "error", inputs: [], name: "RoyaltyModule__AboveAncestorsLimit" },
  { type: "error", inputs: [], name: "RoyaltyModule__AboveMaxPercent" },
  { type: "error", inputs: [], name: "RoyaltyModule__AboveParentLimit" },
  { type: "error", inputs: [], name: "RoyaltyModule__IpIsTagged" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__LastPositionNotAbleToMintLicense",
  },
  { type: "error", inputs: [], name: "RoyaltyModule__NoParentsOnLinking" },
  { type: "error", inputs: [], name: "RoyaltyModule__NotAllowedCaller" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__NotWhitelistedOrRegisteredRoyaltyPolicy",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__NotWhitelistedRoyaltyToken",
  },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__PolicyAlreadyWhitelistedOrRegistered",
  },
  { type: "error", inputs: [], name: "RoyaltyModule__UnlinkableToParents" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroAccessManager" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyModule__ZeroAccumulatedRoyaltyPoliciesLimit",
  },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroAmount" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroDisputeModule" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroIpAssetRegistry" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroLicenseRegistry" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroLicensingModule" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroMaxAncestors" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroMaxParents" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroParentIpId" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroReceiverVault" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroRoyaltyPolicy" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroRoyaltyToken" },
  { type: "error", inputs: [], name: "RoyaltyModule__ZeroTreasury" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "error",
    inputs: [],
    name: "VaultController__ZeroIpRoyaltyVaultBeacon",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "externalRoyaltyPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "ExternalRoyaltyPolicyRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxParents",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "maxAncestors",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "accumulatedRoyaltyPoliciesLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IpGraphLimitsUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ipRoyaltyVault",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "IpRoyaltyVaultDeployed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "receiverIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "payerAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "amountAfterFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LicenseMintingFeePaid",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "royaltyPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "licensePercent",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "externalData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "LicensedWithRoyalty",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "parentIpIds",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
      {
        name: "licenseRoyaltyPolicies",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
      {
        name: "licensesPercent",
        internalType: "uint32[]",
        type: "uint32[]",
        indexed: false,
      },
      {
        name: "externalData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "LinkedToParents",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "royaltyFeePercent",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RoyaltyFeePercentSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "receiverIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "payerIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "amountAfterFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RoyaltyPaid",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "royaltyPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "RoyaltyPolicyWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "RoyaltyTokenWhitelistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "treasury",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "TreasurySet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "DISPUTE_MODULE",
    outputs: [{ name: "", internalType: "contract IDisputeModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ASSET_REGISTRY",
    outputs: [
      {
        name: "",
        internalType: "contract IGroupIPAssetRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_REGISTRY",
    outputs: [{ name: "", internalType: "contract ILicenseRegistry", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSING_MODULE",
    outputs: [{ name: "", internalType: "contract ILicensingModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_PERCENT",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "accumulatedRoyaltyPolicies",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getAncestorsCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "globalRoyaltyStack",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
    ],
    name: "hasAncestorIp",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "accessManager", internalType: "address", type: "address" },
      { name: "parentLimit", internalType: "uint256", type: "uint256" },
      { name: "ancestorLimit", internalType: "uint256", type: "uint256" },
      {
        name: "accumulatedRoyaltyPoliciesLimit",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "ipRoyaltyVaultBeacon",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "ipRoyaltyVaults",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "ipRoyaltyVault", internalType: "address", type: "address" }],
    name: "isIpRoyaltyVault",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "externalRoyaltyPolicy",
        internalType: "address",
        type: "address",
      },
    ],
    name: "isRegisteredExternalRoyaltyPolicy",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "royaltyPolicy", internalType: "address", type: "address" }],
    name: "isWhitelistedRoyaltyPolicy",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isWhitelistedRoyaltyToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxAccumulatedRoyaltyPolicies",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxAncestors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxParents",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxPercent",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "licensePercent", internalType: "uint32", type: "uint32" },
      { name: "externalData", internalType: "bytes", type: "bytes" },
    ],
    name: "onLicenseMinting",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      {
        name: "licenseRoyaltyPolicies",
        internalType: "address[]",
        type: "address[]",
      },
      { name: "licensesPercent", internalType: "uint32[]", type: "uint32[]" },
      { name: "externalData", internalType: "bytes", type: "bytes" },
    ],
    name: "onLinkToParents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "receiverIpId", internalType: "address", type: "address" },
      { name: "payerAddress", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "payLicenseMintingFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiverIpId", internalType: "address", type: "address" },
      { name: "payerIpId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "payRoyaltyOnBehalf",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "externalRoyaltyPolicy",
        internalType: "address",
        type: "address",
      },
    ],
    name: "registerExternalRoyaltyPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "royaltyFeePercent",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "parentLimit", internalType: "uint256", type: "uint256" },
      { name: "ancestorLimit", internalType: "uint256", type: "uint256" },
      {
        name: "accumulatedRoyaltyPoliciesLimit",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "setIpGraphLimits",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "beacon", internalType: "address", type: "address" }],
    name: "setIpRoyaltyVaultBeacon",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "royaltyFeePercent", internalType: "uint32", type: "uint32" }],
    name: "setRoyaltyFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "timestampInterval", internalType: "uint256", type: "uint256" }],
    name: "setSnapshotInterval",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "treasury", internalType: "address", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "snapshotInterval",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "totalRevenueTokensReceived",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "newVault", internalType: "address", type: "address" }],
    name: "upgradeVaults",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "royaltyPolicy", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistRoyaltyPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "allowed", internalType: "bool", type: "bool" },
    ],
    name: "whitelistRoyaltyToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const royaltyModuleAddress = {
  1516: "0xEa6eD700b11DfF703665CCAF55887ca56134Ae3B",
} as const;

/**
 *
 */
export const royaltyModuleConfig = {
  address: royaltyModuleAddress,
  abi: royaltyModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyPolicyLAP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const royaltyPolicyLapAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "ipGraphAcl", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__AboveMaxPercent" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLAP__ExceedsClaimableRoyalty",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__NotRoyaltyModule" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroAccessManager" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroAmount" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroClaimableRoyalty" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroIPGraphACL" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLAP__ZeroRoyaltyModule" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ancestorIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RevenueTransferredToVault",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH_ACL",
    outputs: [{ name: "", internalType: "contract IPGraphACL", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
    ],
    name: "getPolicyRoyalty",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getPolicyRoyaltyStack",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licensePercent", internalType: "uint32", type: "uint32" },
    ],
    name: "getPolicyRtsRequiredToLink",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getTransferredTokens",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licensePercent", internalType: "uint32", type: "uint32" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onLicenseMinting",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      {
        name: "licenseRoyaltyPolicies",
        internalType: "address[]",
        type: "address[]",
      },
      { name: "licensesPercent", internalType: "uint32[]", type: "uint32[]" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onLinkToParents",
    outputs: [{ name: "newRoyaltyStackLAP", internalType: "uint32", type: "uint32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferToVault",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const royaltyPolicyLapAddress = {
  1516: "0x28b4F70ffE5ba7A26aEF979226f77Eb57fb9Fdb6",
} as const;

/**
 *
 */
export const royaltyPolicyLapConfig = {
  address: royaltyPolicyLapAddress,
  abi: royaltyPolicyLapAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyPolicyLRP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const royaltyPolicyLrpAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "royaltyModule", internalType: "address", type: "address" },
      { name: "ipGraphAcl", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__AboveMaxPercent" },
  {
    type: "error",
    inputs: [],
    name: "RoyaltyPolicyLRP__ExceedsClaimableRoyalty",
  },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__NotRoyaltyModule" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__ZeroAccessManager" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__ZeroAmount" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__ZeroClaimableRoyalty" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__ZeroIPGraphACL" },
  { type: "error", inputs: [], name: "RoyaltyPolicyLRP__ZeroRoyaltyModule" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "ancestorIpId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RevenueTransferredToVault",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_GRAPH_ACL",
    outputs: [{ name: "", internalType: "contract IPGraphACL", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
    ],
    name: "getPolicyRoyalty",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "ipId", internalType: "address", type: "address" }],
    name: "getPolicyRoyaltyStack",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licensePercent", internalType: "uint32", type: "uint32" },
    ],
    name: "getPolicyRtsRequiredToLink",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getTransferredTokens",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "licensePercent", internalType: "uint32", type: "uint32" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onLicenseMinting",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "parentIpIds", internalType: "address[]", type: "address[]" },
      {
        name: "licenseRoyaltyPolicies",
        internalType: "address[]",
        type: "address[]",
      },
      { name: "licensesPercent", internalType: "uint32[]", type: "uint32[]" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onLinkToParents",
    outputs: [{ name: "newRoyaltyStackLRP", internalType: "uint32", type: "uint32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "ancestorIpId", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferToVault",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const royaltyPolicyLrpAddress = {
  1516: "0x7D2d9af4E4ab14Afcfd86436BC348928B40963Dd",
} as const;

/**
 *
 */
export const royaltyPolicyLrpConfig = {
  address: royaltyPolicyLrpAddress,
  abi: royaltyPolicyLrpAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RoyaltyWorkflows
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const royaltyWorkflowsAbi = [
  {
    type: "constructor",
    inputs: [{ name: "royaltyModule", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "RoyaltyWorkflows__ZeroAddressParam" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ name: "", internalType: "contract IRoyaltyModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "claimer", internalType: "address", type: "address" },
      {
        name: "unclaimedSnapshotIds",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      { name: "currencyTokens", internalType: "address[]", type: "address[]" },
    ],
    name: "snapshotAndClaimBySnapshotBatch",
    outputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "amountsClaimed", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ipId", internalType: "address", type: "address" },
      { name: "claimer", internalType: "address", type: "address" },
      { name: "currencyTokens", internalType: "address[]", type: "address[]" },
    ],
    name: "snapshotAndClaimByTokenBatch",
    outputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "amountsClaimed", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ancestorIpId", internalType: "address", type: "address" },
      { name: "claimer", internalType: "address", type: "address" },
      {
        name: "unclaimedSnapshotIds",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "royaltyClaimDetails",
        internalType: "struct IRoyaltyWorkflows.RoyaltyClaimDetails[]",
        type: "tuple[]",
        components: [
          { name: "childIpId", internalType: "address", type: "address" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "currencyToken", internalType: "address", type: "address" },
          { name: "amount", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
    outputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "amountsClaimed", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ancestorIpId", internalType: "address", type: "address" },
      { name: "claimer", internalType: "address", type: "address" },
      {
        name: "royaltyClaimDetails",
        internalType: "struct IRoyaltyWorkflows.RoyaltyClaimDetails[]",
        type: "tuple[]",
        components: [
          { name: "childIpId", internalType: "address", type: "address" },
          { name: "royaltyPolicy", internalType: "address", type: "address" },
          { name: "currencyToken", internalType: "address", type: "address" },
          { name: "amount", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "transferToVaultAndSnapshotAndClaimByTokenBatch",
    outputs: [
      { name: "snapshotId", internalType: "uint256", type: "uint256" },
      { name: "amountsClaimed", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const royaltyWorkflowsAddress = {
  1516: "0xAf922379B8e1abc6B0D78547128579221C7F7A22",
} as const;

/**
 *
 */
export const royaltyWorkflowsConfig = {
  address: royaltyWorkflowsAddress,
  abi: royaltyWorkflowsAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPGNFTBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const spgnftBeaconAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "implementation_", internalType: "address", type: "address" },
      { name: "initialOwner", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "BeaconInvalidImplementation",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const spgnftBeaconAddress = {
  1516: "0x4b913A9da52806A0fd0b031bdf32fa33634d082a",
} as const;

/**
 *
 */
export const spgnftBeaconConfig = {
  address: spgnftBeaconAddress,
  abi: spgnftBeaconAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPGNFTImpl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const spgnftImplAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "derivativeWorkflows", internalType: "address", type: "address" },
      { name: "groupingWorkflows", internalType: "address", type: "address" },
      {
        name: "licenseAttachmentWorkflows",
        internalType: "address",
        type: "address",
      },
      {
        name: "registrationWorkflows",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "AccessControlBadConfirmation" },
  {
    type: "error",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "neededRole", internalType: "bytes32", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "ERC721IncorrectOwner",
  },
  {
    type: "error",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC721InsufficientApproval",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC721InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "operator", internalType: "address", type: "address" }],
    name: "ERC721InvalidOperator",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "ERC721InvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC721InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC721InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ERC721NonexistentToken",
  },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "SPGNFT__CallerNotFeeRecipient" },
  { type: "error", inputs: [], name: "SPGNFT__CallerNotPeripheryContract" },
  { type: "error", inputs: [], name: "SPGNFT__MaxSupplyReached" },
  { type: "error", inputs: [], name: "SPGNFT__MintingClosed" },
  { type: "error", inputs: [], name: "SPGNFT__MintingDenied" },
  { type: "error", inputs: [], name: "SPGNFT__ZeroAddressParam" },
  { type: "error", inputs: [], name: "SPGNFT__ZeroMaxSupply" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_fromTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_toTokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "BatchMetadataUpdate",
  },
  { type: "event", anonymous: false, inputs: [], name: "ContractURIUpdated" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MetadataUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "previousAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RoleAdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleGranted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleRevoked",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "DERIVATIVE_WORKFLOWS_ADDRESS",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "GROUPING_WORKFLOWS_ADDRESS",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LICENSE_ATTACHMENT_WORKFLOWS_ADDRESS",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "REGISTRATION_WORKFLOWS_ADDRESS",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "initParams",
        internalType: "struct ISPGNFT.InitParams",
        type: "tuple",
        components: [
          { name: "name", internalType: "string", type: "string" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "baseURI", internalType: "string", type: "string" },
          { name: "contractURI", internalType: "string", type: "string" },
          { name: "maxSupply", internalType: "uint32", type: "uint32" },
          { name: "mintFee", internalType: "uint256", type: "uint256" },
          { name: "mintFeeToken", internalType: "address", type: "address" },
          {
            name: "mintFeeRecipient",
            internalType: "address",
            type: "address",
          },
          { name: "owner", internalType: "address", type: "address" },
          { name: "mintOpen", internalType: "bool", type: "bool" },
          { name: "isPublicMinting", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "nftMetadataURI", internalType: "string", type: "string" },
    ],
    name: "mint",
    outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "payer", internalType: "address", type: "address" },
      { name: "nftMetadataURI", internalType: "string", type: "string" },
    ],
    name: "mintByPeriphery",
    outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "mintFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mintFeeRecipient",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mintFeeToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mintOpen",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "publicMinting",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "callerConfirmation", internalType: "address", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "baseURI", internalType: "string", type: "string" }],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "contractURI", internalType: "string", type: "string" }],
    name: "setContractURI",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "fee", internalType: "uint256", type: "uint256" }],
    name: "setMintFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newFeeRecipient", internalType: "address", type: "address" }],
    name: "setMintFeeRecipient",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "setMintFeeToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "mintOpen", internalType: "bool", type: "bool" }],
    name: "setMintOpen",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "isPublicMinting", internalType: "bool", type: "bool" }],
    name: "setPublicMinting",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "withdrawToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const spgnftImplAddress = {
  1516: "0x32c03CD2B4CC3456aCD86C7d5BA8E0405665DbF9",
} as const;

/**
 *
 */
export const spgnftImplConfig = {
  address: spgnftImplAddress,
  abi: spgnftImplAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// COMMON =============================================================

function getAddress(address: Record<number, Address>, chainId?: number): Address {
  return address[chainId || 0] || "0x";
}

export type EncodedTxData = { to: Address; data: Hex };

export type SimpleWalletClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = {
  account?: TAccount;
  writeContract: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "payable" | "nonpayable">,
    args extends ContractFunctionArgs<abi, "payable" | "nonpayable", functionName>,
    TChainOverride extends Chain | undefined = undefined,
  >(
    args: WriteContractParameters<abi, functionName, args, TChain, TAccount, TChainOverride>,
  ) => Promise<WriteContractReturnType>;
};

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
  ipAccountOwner: Address;
  ipAccount: Address;
  signer: Address;
  to: Address;
  func: Hex;
  permission: number;
};

/**
 * AccessControllerSetAllPermissionsRequest
 *
 * @param ipAccount address
 * @param signer address
 * @param permission uint8
 */
export type AccessControllerSetAllPermissionsRequest = {
  ipAccount: Address;
  signer: Address;
  permission: number;
};

/**
 * AccessControllerSetBatchPermissionsRequest
 *
 * @param permissions tuple[]
 */
export type AccessControllerSetBatchPermissionsRequest = {
  permissions: {
    ipAccount: Address;
    signer: Address;
    to: Address;
    func: Hex;
    permission: number;
  }[];
};

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
  ipAccount: Address;
  signer: Address;
  to: Address;
  func: Hex;
  permission: number;
};

/**
 * contract AccessController event
 */
export class AccessControllerEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(accessControllerAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event PermissionSet for contract AccessController
   */
  public watchPermissionSetEvent(
    onLogs: (txHash: Hex, ev: Partial<AccessControllerPermissionSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: accessControllerAbi,
      address: this.address,
      eventName: "PermissionSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event PermissionSet for contract AccessController
   */
  public parseTxPermissionSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<AccessControllerPermissionSetEvent> {
    const targetLogs: Array<AccessControllerPermissionSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: accessControllerAbi,
          eventName: "PermissionSet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "PermissionSet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract AccessController write method
 */
export class AccessControllerClient extends AccessControllerEventClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method setAllPermissions for contract AccessController
   *
   * @param request AccessControllerSetAllPermissionsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAllPermissions(
    request: AccessControllerSetAllPermissionsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "setAllPermissions",
      account: this.wallet.account,
      args: [request.ipAccount, request.signer, request.permission],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAllPermissions for contract AccessController with only encode
   *
   * @param request AccessControllerSetAllPermissionsRequest
   * @return EncodedTxData
   */
  public setAllPermissionsEncode(request: AccessControllerSetAllPermissionsRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setAllPermissions",
        args: [request.ipAccount, request.signer, request.permission],
      }),
    };
  }

  /**
   * method setBatchPermissions for contract AccessController
   *
   * @param request AccessControllerSetBatchPermissionsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setBatchPermissions(
    request: AccessControllerSetBatchPermissionsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: accessControllerAbi,
      address: this.address,
      functionName: "setBatchPermissions",
      account: this.wallet.account,
      args: [request.permissions],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setBatchPermissions for contract AccessController with only encode
   *
   * @param request AccessControllerSetBatchPermissionsRequest
   * @return EncodedTxData
   */
  public setBatchPermissionsEncode(
    request: AccessControllerSetBatchPermissionsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setBatchPermissions",
        args: [request.permissions],
      }),
    };
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
      functionName: "setPermission",
      account: this.wallet.account,
      args: [request.ipAccount, request.signer, request.to, request.func, request.permission],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setPermission for contract AccessController with only encode
   *
   * @param request AccessControllerSetPermissionRequest
   * @return EncodedTxData
   */
  public setPermissionEncode(request: AccessControllerSetPermissionRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setPermission",
        args: [request.ipAccount, request.signer, request.to, request.func, request.permission],
      }),
    };
  }
}

// Contract CoreMetadataModule =============================================================

/**
 * CoreMetadataModuleAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type CoreMetadataModuleAuthorityUpdatedEvent = {
  authority: Address;
};

/**
 * CoreMetadataModuleInitializedEvent
 *
 * @param version uint64
 */
export type CoreMetadataModuleInitializedEvent = {
  version: bigint;
};

/**
 * CoreMetadataModuleMetadataFrozenEvent
 *
 * @param ipId address
 */
export type CoreMetadataModuleMetadataFrozenEvent = {
  ipId: Address;
};

/**
 * CoreMetadataModuleMetadataUriSetEvent
 *
 * @param ipId address
 * @param metadataURI string
 * @param metadataHash bytes32
 */
export type CoreMetadataModuleMetadataUriSetEvent = {
  ipId: Address;
  metadataURI: string;
  metadataHash: Hex;
};

/**
 * CoreMetadataModuleNftTokenUriSetEvent
 *
 * @param ipId address
 * @param nftTokenURI string
 * @param nftMetadataHash bytes32
 */
export type CoreMetadataModuleNftTokenUriSetEvent = {
  ipId: Address;
  nftTokenURI: string;
  nftMetadataHash: Hex;
};

/**
 * CoreMetadataModuleUpgradedEvent
 *
 * @param implementation address
 */
export type CoreMetadataModuleUpgradedEvent = {
  implementation: Address;
};

export type CoreMetadataModuleAccessControllerResponse = Address;

export type CoreMetadataModuleIpAccountRegistryResponse = Address;

export type CoreMetadataModuleUpgradeInterfaceVersionResponse = string;

export type CoreMetadataModuleAuthorityResponse = Address;

export type CoreMetadataModuleIsConsumingScheduledOpResponse = Hex;

/**
 * CoreMetadataModuleIsMetadataFrozenRequest
 *
 * @param ipId address
 */
export type CoreMetadataModuleIsMetadataFrozenRequest = {
  ipId: Address;
};

export type CoreMetadataModuleIsMetadataFrozenResponse = boolean;

export type CoreMetadataModuleNameResponse = string;

export type CoreMetadataModuleProxiableUuidResponse = Hex;

/**
 * CoreMetadataModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type CoreMetadataModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type CoreMetadataModuleSupportsInterfaceResponse = boolean;

/**
 * CoreMetadataModuleFreezeMetadataRequest
 *
 * @param ipId address
 */
export type CoreMetadataModuleFreezeMetadataRequest = {
  ipId: Address;
};

/**
 * CoreMetadataModuleInitializeRequest
 *
 * @param accessManager address
 */
export type CoreMetadataModuleInitializeRequest = {
  accessManager: Address;
};

/**
 * CoreMetadataModuleSetAllRequest
 *
 * @param ipId address
 * @param metadataURI string
 * @param metadataHash bytes32
 * @param nftMetadataHash bytes32
 */
export type CoreMetadataModuleSetAllRequest = {
  ipId: Address;
  metadataURI: string;
  metadataHash: Hex;
  nftMetadataHash: Hex;
};

/**
 * CoreMetadataModuleSetAuthorityRequest
 *
 * @param newAuthority address
 */
export type CoreMetadataModuleSetAuthorityRequest = {
  newAuthority: Address;
};

/**
 * CoreMetadataModuleSetMetadataUriRequest
 *
 * @param ipId address
 * @param metadataURI string
 * @param metadataHash bytes32
 */
export type CoreMetadataModuleSetMetadataUriRequest = {
  ipId: Address;
  metadataURI: string;
  metadataHash: Hex;
};

/**
 * CoreMetadataModuleUpdateNftTokenUriRequest
 *
 * @param ipId address
 * @param nftMetadataHash bytes32
 */
export type CoreMetadataModuleUpdateNftTokenUriRequest = {
  ipId: Address;
  nftMetadataHash: Hex;
};

/**
 * CoreMetadataModuleUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type CoreMetadataModuleUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

/**
 * contract CoreMetadataModule event
 */
export class CoreMetadataModuleEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(coreMetadataModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event AuthorityUpdated for contract CoreMetadataModule
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<CoreMetadataModuleAuthorityUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: coreMetadataModuleAbi,
      address: this.address,
      eventName: "AuthorityUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract CoreMetadataModule
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<CoreMetadataModuleAuthorityUpdatedEvent> {
    const targetLogs: Array<CoreMetadataModuleAuthorityUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: coreMetadataModuleAbi,
          eventName: "AuthorityUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AuthorityUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract CoreMetadataModule
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<CoreMetadataModuleInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: coreMetadataModuleAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract CoreMetadataModule
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<CoreMetadataModuleInitializedEvent> {
    const targetLogs: Array<CoreMetadataModuleInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: coreMetadataModuleAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event MetadataFrozen for contract CoreMetadataModule
   */
  public watchMetadataFrozenEvent(
    onLogs: (txHash: Hex, ev: Partial<CoreMetadataModuleMetadataFrozenEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: coreMetadataModuleAbi,
      address: this.address,
      eventName: "MetadataFrozen",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event MetadataFrozen for contract CoreMetadataModule
   */
  public parseTxMetadataFrozenEvent(
    txReceipt: TransactionReceipt,
  ): Array<CoreMetadataModuleMetadataFrozenEvent> {
    const targetLogs: Array<CoreMetadataModuleMetadataFrozenEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: coreMetadataModuleAbi,
          eventName: "MetadataFrozen",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "MetadataFrozen") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event MetadataURISet for contract CoreMetadataModule
   */
  public watchMetadataUriSetEvent(
    onLogs: (txHash: Hex, ev: Partial<CoreMetadataModuleMetadataUriSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: coreMetadataModuleAbi,
      address: this.address,
      eventName: "MetadataURISet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event MetadataURISet for contract CoreMetadataModule
   */
  public parseTxMetadataUriSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<CoreMetadataModuleMetadataUriSetEvent> {
    const targetLogs: Array<CoreMetadataModuleMetadataUriSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: coreMetadataModuleAbi,
          eventName: "MetadataURISet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "MetadataURISet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event NFTTokenURISet for contract CoreMetadataModule
   */
  public watchNftTokenUriSetEvent(
    onLogs: (txHash: Hex, ev: Partial<CoreMetadataModuleNftTokenUriSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: coreMetadataModuleAbi,
      address: this.address,
      eventName: "NFTTokenURISet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event NFTTokenURISet for contract CoreMetadataModule
   */
  public parseTxNftTokenUriSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<CoreMetadataModuleNftTokenUriSetEvent> {
    const targetLogs: Array<CoreMetadataModuleNftTokenUriSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: coreMetadataModuleAbi,
          eventName: "NFTTokenURISet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "NFTTokenURISet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Upgraded for contract CoreMetadataModule
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<CoreMetadataModuleUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: coreMetadataModuleAbi,
      address: this.address,
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract CoreMetadataModule
   */
  public parseTxUpgradedEvent(
    txReceipt: TransactionReceipt,
  ): Array<CoreMetadataModuleUpgradedEvent> {
    const targetLogs: Array<CoreMetadataModuleUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: coreMetadataModuleAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract CoreMetadataModule readonly method
 */
export class CoreMetadataModuleReadOnlyClient extends CoreMetadataModuleEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method ACCESS_CONTROLLER for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleAccessControllerRequest
   * @return Promise<CoreMetadataModuleAccessControllerResponse>
   */
  public async accessController(): Promise<CoreMetadataModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleIpAccountRegistryRequest
   * @return Promise<CoreMetadataModuleIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<CoreMetadataModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleUpgradeInterfaceVersionRequest
   * @return Promise<CoreMetadataModuleUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<CoreMetadataModuleUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
  }

  /**
   * method authority for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleAuthorityRequest
   * @return Promise<CoreMetadataModuleAuthorityResponse>
   */
  public async authority(): Promise<CoreMetadataModuleAuthorityResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "authority",
    });
  }

  /**
   * method isConsumingScheduledOp for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleIsConsumingScheduledOpRequest
   * @return Promise<CoreMetadataModuleIsConsumingScheduledOpResponse>
   */
  public async isConsumingScheduledOp(): Promise<CoreMetadataModuleIsConsumingScheduledOpResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "isConsumingScheduledOp",
    });
  }

  /**
   * method isMetadataFrozen for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleIsMetadataFrozenRequest
   * @return Promise<CoreMetadataModuleIsMetadataFrozenResponse>
   */
  public async isMetadataFrozen(
    request: CoreMetadataModuleIsMetadataFrozenRequest,
  ): Promise<CoreMetadataModuleIsMetadataFrozenResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "isMetadataFrozen",
      args: [request.ipId],
    });
  }

  /**
   * method name for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleNameRequest
   * @return Promise<CoreMetadataModuleNameResponse>
   */
  public async name(): Promise<CoreMetadataModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method proxiableUUID for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleProxiableUuidRequest
   * @return Promise<CoreMetadataModuleProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<CoreMetadataModuleProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "proxiableUUID",
    });
  }

  /**
   * method supportsInterface for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleSupportsInterfaceRequest
   * @return Promise<CoreMetadataModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: CoreMetadataModuleSupportsInterfaceRequest,
  ): Promise<CoreMetadataModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract CoreMetadataModule write method
 */
export class CoreMetadataModuleClient extends CoreMetadataModuleReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method freezeMetadata for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleFreezeMetadataRequest
   * @return Promise<WriteContractReturnType>
   */
  public async freezeMetadata(
    request: CoreMetadataModuleFreezeMetadataRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "freezeMetadata",
      account: this.wallet.account,
      args: [request.ipId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method freezeMetadata for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleFreezeMetadataRequest
   * @return EncodedTxData
   */
  public freezeMetadataEncode(request: CoreMetadataModuleFreezeMetadataRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "freezeMetadata",
        args: [request.ipId],
      }),
    };
  }

  /**
   * method initialize for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: CoreMetadataModuleInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: CoreMetadataModuleInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "initialize",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method setAll for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleSetAllRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAll(request: CoreMetadataModuleSetAllRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "setAll",
      account: this.wallet.account,
      args: [request.ipId, request.metadataURI, request.metadataHash, request.nftMetadataHash],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAll for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleSetAllRequest
   * @return EncodedTxData
   */
  public setAllEncode(request: CoreMetadataModuleSetAllRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "setAll",
        args: [request.ipId, request.metadataURI, request.metadataHash, request.nftMetadataHash],
      }),
    };
  }

  /**
   * method setAuthority for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleSetAuthorityRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAuthority(
    request: CoreMetadataModuleSetAuthorityRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "setAuthority",
      account: this.wallet.account,
      args: [request.newAuthority],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAuthority for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleSetAuthorityRequest
   * @return EncodedTxData
   */
  public setAuthorityEncode(request: CoreMetadataModuleSetAuthorityRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "setAuthority",
        args: [request.newAuthority],
      }),
    };
  }

  /**
   * method setMetadataURI for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleSetMetadataUriRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMetadataUri(
    request: CoreMetadataModuleSetMetadataUriRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "setMetadataURI",
      account: this.wallet.account,
      args: [request.ipId, request.metadataURI, request.metadataHash],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMetadataURI for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleSetMetadataUriRequest
   * @return EncodedTxData
   */
  public setMetadataUriEncode(request: CoreMetadataModuleSetMetadataUriRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "setMetadataURI",
        args: [request.ipId, request.metadataURI, request.metadataHash],
      }),
    };
  }

  /**
   * method updateNftTokenURI for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleUpdateNftTokenUriRequest
   * @return Promise<WriteContractReturnType>
   */
  public async updateNftTokenUri(
    request: CoreMetadataModuleUpdateNftTokenUriRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "updateNftTokenURI",
      account: this.wallet.account,
      args: [request.ipId, request.nftMetadataHash],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method updateNftTokenURI for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleUpdateNftTokenUriRequest
   * @return EncodedTxData
   */
  public updateNftTokenUriEncode(
    request: CoreMetadataModuleUpdateNftTokenUriRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "updateNftTokenURI",
        args: [request.ipId, request.nftMetadataHash],
      }),
    };
  }

  /**
   * method upgradeToAndCall for contract CoreMetadataModule
   *
   * @param request CoreMetadataModuleUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: CoreMetadataModuleUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: coreMetadataModuleAbi,
      address: this.address,
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract CoreMetadataModule with only encode
   *
   * @param request CoreMetadataModuleUpgradeToAndCallRequest
   * @return EncodedTxData
   */
  public upgradeToAndCallEncode(request: CoreMetadataModuleUpgradeToAndCallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "upgradeToAndCall",
        args: [request.newImplementation, request.data],
      }),
    };
  }
}

// Contract DerivativeWorkflows =============================================================

/**
 * DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest
 *
 * @param spgNftContract address
 * @param derivData tuple
 * @param ipMetadata tuple
 * @param recipient address
 */
export type DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest = {
  spgNftContract: Address;
  derivData: {
    parentIpIds: readonly Address[];
    licenseTemplate: Address;
    licenseTermsIds: readonly bigint[];
    royaltyContext: Hex;
  };
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  recipient: Address;
};

/**
 * DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest
 *
 * @param spgNftContract address
 * @param licenseTokenIds uint256[]
 * @param royaltyContext bytes
 * @param ipMetadata tuple
 * @param recipient address
 */
export type DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  spgNftContract: Address;
  licenseTokenIds: readonly bigint[];
  royaltyContext: Hex;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  recipient: Address;
};

/**
 * DerivativeWorkflowsMulticallRequest
 *
 * @param data bytes[]
 */
export type DerivativeWorkflowsMulticallRequest = {
  data: readonly Hex[];
};

/**
 * DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest
 *
 * @param nftContract address
 * @param tokenId uint256
 * @param derivData tuple
 * @param ipMetadata tuple
 * @param sigMetadata tuple
 * @param sigRegister tuple
 */
export type DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: bigint;
  derivData: {
    parentIpIds: readonly Address[];
    licenseTemplate: Address;
    licenseTermsIds: readonly bigint[];
    royaltyContext: Hex;
  };
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  sigMetadata: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
  sigRegister: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest
 *
 * @param nftContract address
 * @param tokenId uint256
 * @param licenseTokenIds uint256[]
 * @param royaltyContext bytes
 * @param ipMetadata tuple
 * @param sigMetadata tuple
 * @param sigRegister tuple
 */
export type DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: bigint;
  licenseTokenIds: readonly bigint[];
  royaltyContext: Hex;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  sigMetadata: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
  sigRegister: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * contract DerivativeWorkflows write method
 */
export class DerivativeWorkflowsClient {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(derivativeWorkflowsAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method mintAndRegisterIpAndMakeDerivative for contract DerivativeWorkflows
   *
   * @param request DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintAndRegisterIpAndMakeDerivative(
    request: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: derivativeWorkflowsAbi,
      address: this.address,
      functionName: "mintAndRegisterIpAndMakeDerivative",
      account: this.wallet.account,
      args: [request.spgNftContract, request.derivData, request.ipMetadata, request.recipient],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintAndRegisterIpAndMakeDerivative for contract DerivativeWorkflows with only encode
   *
   * @param request DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest
   * @return EncodedTxData
   */
  public mintAndRegisterIpAndMakeDerivativeEncode(
    request: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "mintAndRegisterIpAndMakeDerivative",
        args: [request.spgNftContract, request.derivData, request.ipMetadata, request.recipient],
      }),
    };
  }

  /**
   * method mintAndRegisterIpAndMakeDerivativeWithLicenseTokens for contract DerivativeWorkflows
   *
   * @param request DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
    request: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: derivativeWorkflowsAbi,
      address: this.address,
      functionName: "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
      account: this.wallet.account,
      args: [
        request.spgNftContract,
        request.licenseTokenIds,
        request.royaltyContext,
        request.ipMetadata,
        request.recipient,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintAndRegisterIpAndMakeDerivativeWithLicenseTokens for contract DerivativeWorkflows with only encode
   *
   * @param request DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest
   * @return EncodedTxData
   */
  public mintAndRegisterIpAndMakeDerivativeWithLicenseTokensEncode(
    request: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        args: [
          request.spgNftContract,
          request.licenseTokenIds,
          request.royaltyContext,
          request.ipMetadata,
          request.recipient,
        ],
      }),
    };
  }

  /**
   * method multicall for contract DerivativeWorkflows
   *
   * @param request DerivativeWorkflowsMulticallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async multicall(
    request: DerivativeWorkflowsMulticallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: derivativeWorkflowsAbi,
      address: this.address,
      functionName: "multicall",
      account: this.wallet.account,
      args: [request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method multicall for contract DerivativeWorkflows with only encode
   *
   * @param request DerivativeWorkflowsMulticallRequest
   * @return EncodedTxData
   */
  public multicallEncode(request: DerivativeWorkflowsMulticallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "multicall",
        args: [request.data],
      }),
    };
  }

  /**
   * method registerIpAndMakeDerivative for contract DerivativeWorkflows
   *
   * @param request DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAndMakeDerivative(
    request: DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: derivativeWorkflowsAbi,
      address: this.address,
      functionName: "registerIpAndMakeDerivative",
      account: this.wallet.account,
      args: [
        request.nftContract,
        request.tokenId,
        request.derivData,
        request.ipMetadata,
        request.sigMetadata,
        request.sigRegister,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerIpAndMakeDerivative for contract DerivativeWorkflows with only encode
   *
   * @param request DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest
   * @return EncodedTxData
   */
  public registerIpAndMakeDerivativeEncode(
    request: DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "registerIpAndMakeDerivative",
        args: [
          request.nftContract,
          request.tokenId,
          request.derivData,
          request.ipMetadata,
          request.sigMetadata,
          request.sigRegister,
        ],
      }),
    };
  }

  /**
   * method registerIpAndMakeDerivativeWithLicenseTokens for contract DerivativeWorkflows
   *
   * @param request DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAndMakeDerivativeWithLicenseTokens(
    request: DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: derivativeWorkflowsAbi,
      address: this.address,
      functionName: "registerIpAndMakeDerivativeWithLicenseTokens",
      account: this.wallet.account,
      args: [
        request.nftContract,
        request.tokenId,
        request.licenseTokenIds,
        request.royaltyContext,
        request.ipMetadata,
        request.sigMetadata,
        request.sigRegister,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerIpAndMakeDerivativeWithLicenseTokens for contract DerivativeWorkflows with only encode
   *
   * @param request DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest
   * @return EncodedTxData
   */
  public registerIpAndMakeDerivativeWithLicenseTokensEncode(
    request: DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "registerIpAndMakeDerivativeWithLicenseTokens",
        args: [
          request.nftContract,
          request.tokenId,
          request.licenseTokenIds,
          request.royaltyContext,
          request.ipMetadata,
          request.sigMetadata,
          request.sigRegister,
        ],
      }),
    };
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
  disputeId: bigint;
  data: Hex;
};

/**
 * DisputeModuleDisputeRaisedEvent
 *
 * @param disputeId uint256
 * @param targetIpId address
 * @param disputeInitiator address
 * @param arbitrationPolicy address
 * @param disputeEvidenceHash bytes32
 * @param targetTag bytes32
 * @param data bytes
 */
export type DisputeModuleDisputeRaisedEvent = {
  disputeId: bigint;
  targetIpId: Address;
  disputeInitiator: Address;
  arbitrationPolicy: Address;
  disputeEvidenceHash: Hex;
  targetTag: Hex;
  data: Hex;
};

/**
 * DisputeModuleDisputeResolvedEvent
 *
 * @param disputeId uint256
 */
export type DisputeModuleDisputeResolvedEvent = {
  disputeId: bigint;
};

/**
 * DisputeModuleCancelDisputeRequest
 *
 * @param disputeId uint256
 * @param data bytes
 */
export type DisputeModuleCancelDisputeRequest = {
  disputeId: bigint;
  data: Hex;
};

/**
 * DisputeModuleRaiseDisputeRequest
 *
 * @param targetIpId address
 * @param disputeEvidenceHash bytes32
 * @param targetTag bytes32
 * @param data bytes
 */
export type DisputeModuleRaiseDisputeRequest = {
  targetIpId: Address;
  disputeEvidenceHash: Hex;
  targetTag: Hex;
  data: Hex;
};

/**
 * DisputeModuleResolveDisputeRequest
 *
 * @param disputeId uint256
 * @param data bytes
 */
export type DisputeModuleResolveDisputeRequest = {
  disputeId: bigint;
  data: Hex;
};

/**
 * contract DisputeModule event
 */
export class DisputeModuleEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(disputeModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event DisputeCancelled for contract DisputeModule
   */
  public watchDisputeCancelledEvent(
    onLogs: (txHash: Hex, ev: Partial<DisputeModuleDisputeCancelledEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DisputeCancelled",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DisputeCancelled for contract DisputeModule
   */
  public parseTxDisputeCancelledEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeCancelledEvent> {
    const targetLogs: Array<DisputeModuleDisputeCancelledEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: "DisputeCancelled",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DisputeCancelled") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "DisputeRaised",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DisputeRaised for contract DisputeModule
   */
  public parseTxDisputeRaisedEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeRaisedEvent> {
    const targetLogs: Array<DisputeModuleDisputeRaisedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: "DisputeRaised",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DisputeRaised") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event DisputeResolved for contract DisputeModule
   */
  public watchDisputeResolvedEvent(
    onLogs: (txHash: Hex, ev: Partial<DisputeModuleDisputeResolvedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: disputeModuleAbi,
      address: this.address,
      eventName: "DisputeResolved",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DisputeResolved for contract DisputeModule
   */
  public parseTxDisputeResolvedEvent(
    txReceipt: TransactionReceipt,
  ): Array<DisputeModuleDisputeResolvedEvent> {
    const targetLogs: Array<DisputeModuleDisputeResolvedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: disputeModuleAbi,
          eventName: "DisputeResolved",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DisputeResolved") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract DisputeModule write method
 */
export class DisputeModuleClient extends DisputeModuleEventClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
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
      functionName: "cancelDispute",
      account: this.wallet.account,
      args: [request.disputeId, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method cancelDispute for contract DisputeModule with only encode
   *
   * @param request DisputeModuleCancelDisputeRequest
   * @return EncodedTxData
   */
  public cancelDisputeEncode(request: DisputeModuleCancelDisputeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: disputeModuleAbi,
        functionName: "cancelDispute",
        args: [request.disputeId, request.data],
      }),
    };
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
      functionName: "raiseDispute",
      account: this.wallet.account,
      args: [request.targetIpId, request.disputeEvidenceHash, request.targetTag, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method raiseDispute for contract DisputeModule with only encode
   *
   * @param request DisputeModuleRaiseDisputeRequest
   * @return EncodedTxData
   */
  public raiseDisputeEncode(request: DisputeModuleRaiseDisputeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: disputeModuleAbi,
        functionName: "raiseDispute",
        args: [request.targetIpId, request.disputeEvidenceHash, request.targetTag, request.data],
      }),
    };
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
      functionName: "resolveDispute",
      account: this.wallet.account,
      args: [request.disputeId, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method resolveDispute for contract DisputeModule with only encode
   *
   * @param request DisputeModuleResolveDisputeRequest
   * @return EncodedTxData
   */
  public resolveDisputeEncode(request: DisputeModuleResolveDisputeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: disputeModuleAbi,
        functionName: "resolveDispute",
        args: [request.disputeId, request.data],
      }),
    };
  }
}

// Contract EvenSplitGroupPool =============================================================

/**
 * EvenSplitGroupPoolAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type EvenSplitGroupPoolAuthorityUpdatedEvent = {
  authority: Address;
};

/**
 * EvenSplitGroupPoolInitializedEvent
 *
 * @param version uint64
 */
export type EvenSplitGroupPoolInitializedEvent = {
  version: bigint;
};

/**
 * EvenSplitGroupPoolPausedEvent
 *
 * @param account address
 */
export type EvenSplitGroupPoolPausedEvent = {
  account: Address;
};

/**
 * EvenSplitGroupPoolUnpausedEvent
 *
 * @param account address
 */
export type EvenSplitGroupPoolUnpausedEvent = {
  account: Address;
};

/**
 * EvenSplitGroupPoolUpgradedEvent
 *
 * @param implementation address
 */
export type EvenSplitGroupPoolUpgradedEvent = {
  implementation: Address;
};

export type EvenSplitGroupPoolGroupingModuleResponse = Address;

export type EvenSplitGroupPoolGroupIpAssetRegistryResponse = Address;

export type EvenSplitGroupPoolRoyaltyModuleResponse = Address;

export type EvenSplitGroupPoolUpgradeInterfaceVersionResponse = string;

export type EvenSplitGroupPoolAuthorityResponse = Address;

/**
 * EvenSplitGroupPoolGetAvailableRewardRequest
 *
 * @param groupId address
 * @param token address
 * @param ipIds address[]
 */
export type EvenSplitGroupPoolGetAvailableRewardRequest = {
  groupId: Address;
  token: Address;
  ipIds: readonly Address[];
};

export type EvenSplitGroupPoolGetAvailableRewardResponse = readonly bigint[];

/**
 * EvenSplitGroupPoolGetIpAddedTimeRequest
 *
 * @param groupId address
 * @param ipId address
 */
export type EvenSplitGroupPoolGetIpAddedTimeRequest = {
  groupId: Address;
  ipId: Address;
};

export type EvenSplitGroupPoolGetIpAddedTimeResponse = bigint;

/**
 * EvenSplitGroupPoolGetIpRewardDebtRequest
 *
 * @param groupId address
 * @param token address
 * @param ipId address
 */
export type EvenSplitGroupPoolGetIpRewardDebtRequest = {
  groupId: Address;
  token: Address;
  ipId: Address;
};

export type EvenSplitGroupPoolGetIpRewardDebtResponse = bigint;

/**
 * EvenSplitGroupPoolGetTotalIpsRequest
 *
 * @param groupId address
 */
export type EvenSplitGroupPoolGetTotalIpsRequest = {
  groupId: Address;
};

export type EvenSplitGroupPoolGetTotalIpsResponse = bigint;

export type EvenSplitGroupPoolIsConsumingScheduledOpResponse = Hex;

/**
 * EvenSplitGroupPoolIsIpAddedRequest
 *
 * @param groupId address
 * @param ipId address
 */
export type EvenSplitGroupPoolIsIpAddedRequest = {
  groupId: Address;
  ipId: Address;
};

export type EvenSplitGroupPoolIsIpAddedResponse = boolean;

export type EvenSplitGroupPoolPausedResponse = boolean;

export type EvenSplitGroupPoolProxiableUuidResponse = Hex;

/**
 * EvenSplitGroupPoolProtocolPausableInitRequest
 *
 * @param accessManager address
 */
export type EvenSplitGroupPoolProtocolPausableInitRequest = {
  accessManager: Address;
};

/**
 * EvenSplitGroupPoolAddIpRequest
 *
 * @param groupId address
 * @param ipId address
 */
export type EvenSplitGroupPoolAddIpRequest = {
  groupId: Address;
  ipId: Address;
};

/**
 * EvenSplitGroupPoolDepositRewardRequest
 *
 * @param groupId address
 * @param token address
 * @param amount uint256
 */
export type EvenSplitGroupPoolDepositRewardRequest = {
  groupId: Address;
  token: Address;
  amount: bigint;
};

/**
 * EvenSplitGroupPoolDistributeRewardsRequest
 *
 * @param groupId address
 * @param token address
 * @param ipIds address[]
 */
export type EvenSplitGroupPoolDistributeRewardsRequest = {
  groupId: Address;
  token: Address;
  ipIds: readonly Address[];
};

/**
 * EvenSplitGroupPoolInitializeRequest
 *
 * @param accessManager address
 */
export type EvenSplitGroupPoolInitializeRequest = {
  accessManager: Address;
};

/**
 * EvenSplitGroupPoolRemoveIpRequest
 *
 * @param groupId address
 * @param ipId address
 */
export type EvenSplitGroupPoolRemoveIpRequest = {
  groupId: Address;
  ipId: Address;
};

/**
 * EvenSplitGroupPoolSetAuthorityRequest
 *
 * @param newAuthority address
 */
export type EvenSplitGroupPoolSetAuthorityRequest = {
  newAuthority: Address;
};

/**
 * EvenSplitGroupPoolUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type EvenSplitGroupPoolUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

/**
 * contract EvenSplitGroupPool event
 */
export class EvenSplitGroupPoolEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(evenSplitGroupPoolAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event AuthorityUpdated for contract EvenSplitGroupPool
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<EvenSplitGroupPoolAuthorityUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      eventName: "AuthorityUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract EvenSplitGroupPool
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<EvenSplitGroupPoolAuthorityUpdatedEvent> {
    const targetLogs: Array<EvenSplitGroupPoolAuthorityUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: evenSplitGroupPoolAbi,
          eventName: "AuthorityUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AuthorityUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract EvenSplitGroupPool
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<EvenSplitGroupPoolInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract EvenSplitGroupPool
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<EvenSplitGroupPoolInitializedEvent> {
    const targetLogs: Array<EvenSplitGroupPoolInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: evenSplitGroupPoolAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Paused for contract EvenSplitGroupPool
   */
  public watchPausedEvent(
    onLogs: (txHash: Hex, ev: Partial<EvenSplitGroupPoolPausedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      eventName: "Paused",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Paused for contract EvenSplitGroupPool
   */
  public parseTxPausedEvent(txReceipt: TransactionReceipt): Array<EvenSplitGroupPoolPausedEvent> {
    const targetLogs: Array<EvenSplitGroupPoolPausedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: evenSplitGroupPoolAbi,
          eventName: "Paused",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Paused") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Unpaused for contract EvenSplitGroupPool
   */
  public watchUnpausedEvent(
    onLogs: (txHash: Hex, ev: Partial<EvenSplitGroupPoolUnpausedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      eventName: "Unpaused",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Unpaused for contract EvenSplitGroupPool
   */
  public parseTxUnpausedEvent(
    txReceipt: TransactionReceipt,
  ): Array<EvenSplitGroupPoolUnpausedEvent> {
    const targetLogs: Array<EvenSplitGroupPoolUnpausedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: evenSplitGroupPoolAbi,
          eventName: "Unpaused",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Unpaused") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Upgraded for contract EvenSplitGroupPool
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<EvenSplitGroupPoolUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract EvenSplitGroupPool
   */
  public parseTxUpgradedEvent(
    txReceipt: TransactionReceipt,
  ): Array<EvenSplitGroupPoolUpgradedEvent> {
    const targetLogs: Array<EvenSplitGroupPoolUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: evenSplitGroupPoolAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract EvenSplitGroupPool readonly method
 */
export class EvenSplitGroupPoolReadOnlyClient extends EvenSplitGroupPoolEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method GROUPING_MODULE for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolGroupingModuleRequest
   * @return Promise<EvenSplitGroupPoolGroupingModuleResponse>
   */
  public async groupingModule(): Promise<EvenSplitGroupPoolGroupingModuleResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "GROUPING_MODULE",
    });
  }

  /**
   * method GROUP_IP_ASSET_REGISTRY for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolGroupIpAssetRegistryRequest
   * @return Promise<EvenSplitGroupPoolGroupIpAssetRegistryResponse>
   */
  public async groupIpAssetRegistry(): Promise<EvenSplitGroupPoolGroupIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "GROUP_IP_ASSET_REGISTRY",
    });
  }

  /**
   * method ROYALTY_MODULE for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolRoyaltyModuleRequest
   * @return Promise<EvenSplitGroupPoolRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<EvenSplitGroupPoolRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolUpgradeInterfaceVersionRequest
   * @return Promise<EvenSplitGroupPoolUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<EvenSplitGroupPoolUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
  }

  /**
   * method authority for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolAuthorityRequest
   * @return Promise<EvenSplitGroupPoolAuthorityResponse>
   */
  public async authority(): Promise<EvenSplitGroupPoolAuthorityResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "authority",
    });
  }

  /**
   * method getAvailableReward for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolGetAvailableRewardRequest
   * @return Promise<EvenSplitGroupPoolGetAvailableRewardResponse>
   */
  public async getAvailableReward(
    request: EvenSplitGroupPoolGetAvailableRewardRequest,
  ): Promise<EvenSplitGroupPoolGetAvailableRewardResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "getAvailableReward",
      args: [request.groupId, request.token, request.ipIds],
    });
  }

  /**
   * method getIpAddedTime for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolGetIpAddedTimeRequest
   * @return Promise<EvenSplitGroupPoolGetIpAddedTimeResponse>
   */
  public async getIpAddedTime(
    request: EvenSplitGroupPoolGetIpAddedTimeRequest,
  ): Promise<EvenSplitGroupPoolGetIpAddedTimeResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "getIpAddedTime",
      args: [request.groupId, request.ipId],
    });
  }

  /**
   * method getIpRewardDebt for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolGetIpRewardDebtRequest
   * @return Promise<EvenSplitGroupPoolGetIpRewardDebtResponse>
   */
  public async getIpRewardDebt(
    request: EvenSplitGroupPoolGetIpRewardDebtRequest,
  ): Promise<EvenSplitGroupPoolGetIpRewardDebtResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "getIpRewardDebt",
      args: [request.groupId, request.token, request.ipId],
    });
  }

  /**
   * method getTotalIps for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolGetTotalIpsRequest
   * @return Promise<EvenSplitGroupPoolGetTotalIpsResponse>
   */
  public async getTotalIps(
    request: EvenSplitGroupPoolGetTotalIpsRequest,
  ): Promise<EvenSplitGroupPoolGetTotalIpsResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "getTotalIps",
      args: [request.groupId],
    });
  }

  /**
   * method isConsumingScheduledOp for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolIsConsumingScheduledOpRequest
   * @return Promise<EvenSplitGroupPoolIsConsumingScheduledOpResponse>
   */
  public async isConsumingScheduledOp(): Promise<EvenSplitGroupPoolIsConsumingScheduledOpResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "isConsumingScheduledOp",
    });
  }

  /**
   * method isIPAdded for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolIsIpAddedRequest
   * @return Promise<EvenSplitGroupPoolIsIpAddedResponse>
   */
  public async isIpAdded(
    request: EvenSplitGroupPoolIsIpAddedRequest,
  ): Promise<EvenSplitGroupPoolIsIpAddedResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "isIPAdded",
      args: [request.groupId, request.ipId],
    });
  }

  /**
   * method paused for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolPausedRequest
   * @return Promise<EvenSplitGroupPoolPausedResponse>
   */
  public async paused(): Promise<EvenSplitGroupPoolPausedResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "paused",
    });
  }

  /**
   * method proxiableUUID for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolProxiableUuidRequest
   * @return Promise<EvenSplitGroupPoolProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<EvenSplitGroupPoolProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "proxiableUUID",
    });
  }
}

/**
 * contract EvenSplitGroupPool write method
 */
export class EvenSplitGroupPoolClient extends EvenSplitGroupPoolReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method __ProtocolPausable_init for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolProtocolPausableInitRequest
   * @return Promise<WriteContractReturnType>
   */
  public async protocolPausableInit(
    request: EvenSplitGroupPoolProtocolPausableInitRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "__ProtocolPausable_init",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method __ProtocolPausable_init for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolProtocolPausableInitRequest
   * @return EncodedTxData
   */
  public protocolPausableInitEncode(
    request: EvenSplitGroupPoolProtocolPausableInitRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "__ProtocolPausable_init",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method addIp for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolAddIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async addIp(request: EvenSplitGroupPoolAddIpRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "addIp",
      account: this.wallet.account,
      args: [request.groupId, request.ipId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method addIp for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolAddIpRequest
   * @return EncodedTxData
   */
  public addIpEncode(request: EvenSplitGroupPoolAddIpRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "addIp",
        args: [request.groupId, request.ipId],
      }),
    };
  }

  /**
   * method depositReward for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolDepositRewardRequest
   * @return Promise<WriteContractReturnType>
   */
  public async depositReward(
    request: EvenSplitGroupPoolDepositRewardRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "depositReward",
      account: this.wallet.account,
      args: [request.groupId, request.token, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method depositReward for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolDepositRewardRequest
   * @return EncodedTxData
   */
  public depositRewardEncode(request: EvenSplitGroupPoolDepositRewardRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "depositReward",
        args: [request.groupId, request.token, request.amount],
      }),
    };
  }

  /**
   * method distributeRewards for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolDistributeRewardsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async distributeRewards(
    request: EvenSplitGroupPoolDistributeRewardsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "distributeRewards",
      account: this.wallet.account,
      args: [request.groupId, request.token, request.ipIds],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method distributeRewards for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolDistributeRewardsRequest
   * @return EncodedTxData
   */
  public distributeRewardsEncode(
    request: EvenSplitGroupPoolDistributeRewardsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "distributeRewards",
        args: [request.groupId, request.token, request.ipIds],
      }),
    };
  }

  /**
   * method initialize for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: EvenSplitGroupPoolInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: EvenSplitGroupPoolInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "initialize",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method pause for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolPauseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async pause(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "pause",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method pause for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolPauseRequest
   * @return EncodedTxData
   */
  public pauseEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "pause",
      }),
    };
  }

  /**
   * method removeIp for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolRemoveIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async removeIp(
    request: EvenSplitGroupPoolRemoveIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "removeIp",
      account: this.wallet.account,
      args: [request.groupId, request.ipId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method removeIp for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolRemoveIpRequest
   * @return EncodedTxData
   */
  public removeIpEncode(request: EvenSplitGroupPoolRemoveIpRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "removeIp",
        args: [request.groupId, request.ipId],
      }),
    };
  }

  /**
   * method setAuthority for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolSetAuthorityRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAuthority(
    request: EvenSplitGroupPoolSetAuthorityRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "setAuthority",
      account: this.wallet.account,
      args: [request.newAuthority],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAuthority for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolSetAuthorityRequest
   * @return EncodedTxData
   */
  public setAuthorityEncode(request: EvenSplitGroupPoolSetAuthorityRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "setAuthority",
        args: [request.newAuthority],
      }),
    };
  }

  /**
   * method unpause for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolUnpauseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async unpause(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "unpause",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method unpause for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolUnpauseRequest
   * @return EncodedTxData
   */
  public unpauseEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "unpause",
      }),
    };
  }

  /**
   * method upgradeToAndCall for contract EvenSplitGroupPool
   *
   * @param request EvenSplitGroupPoolUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: EvenSplitGroupPoolUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: evenSplitGroupPoolAbi,
      address: this.address,
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract EvenSplitGroupPool with only encode
   *
   * @param request EvenSplitGroupPoolUpgradeToAndCallRequest
   * @return EncodedTxData
   */
  public upgradeToAndCallEncode(request: EvenSplitGroupPoolUpgradeToAndCallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: evenSplitGroupPoolAbi,
        functionName: "upgradeToAndCall",
        args: [request.newImplementation, request.data],
      }),
    };
  }
}

// Contract GroupingModule =============================================================

/**
 * GroupingModuleAddedIpToGroupEvent
 *
 * @param groupId address
 * @param ipIds address[]
 */
export type GroupingModuleAddedIpToGroupEvent = {
  groupId: Address;
  ipIds: readonly Address[];
};

/**
 * GroupingModuleAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type GroupingModuleAuthorityUpdatedEvent = {
  authority: Address;
};

/**
 * GroupingModuleClaimedRewardEvent
 *
 * @param groupId address
 * @param token address
 * @param ipId address[]
 * @param amount uint256[]
 */
export type GroupingModuleClaimedRewardEvent = {
  groupId: Address;
  token: Address;
  ipId: readonly Address[];
  amount: readonly bigint[];
};

/**
 * GroupingModuleCollectedRoyaltiesToGroupPoolEvent
 *
 * @param groupId address
 * @param token address
 * @param pool address
 * @param amount uint256
 * @param snapshots uint256[]
 */
export type GroupingModuleCollectedRoyaltiesToGroupPoolEvent = {
  groupId: Address;
  token: Address;
  pool: Address;
  amount: bigint;
  snapshots: readonly bigint[];
};

/**
 * GroupingModuleIpGroupRegisteredEvent
 *
 * @param groupId address
 * @param groupPool address
 */
export type GroupingModuleIpGroupRegisteredEvent = {
  groupId: Address;
  groupPool: Address;
};

/**
 * GroupingModuleInitializedEvent
 *
 * @param version uint64
 */
export type GroupingModuleInitializedEvent = {
  version: bigint;
};

/**
 * GroupingModulePausedEvent
 *
 * @param account address
 */
export type GroupingModulePausedEvent = {
  account: Address;
};

/**
 * GroupingModuleRemovedIpFromGroupEvent
 *
 * @param groupId address
 * @param ipIds address[]
 */
export type GroupingModuleRemovedIpFromGroupEvent = {
  groupId: Address;
  ipIds: readonly Address[];
};

/**
 * GroupingModuleUnpausedEvent
 *
 * @param account address
 */
export type GroupingModuleUnpausedEvent = {
  account: Address;
};

/**
 * GroupingModuleUpgradedEvent
 *
 * @param implementation address
 */
export type GroupingModuleUpgradedEvent = {
  implementation: Address;
};

export type GroupingModuleAccessControllerResponse = Address;

export type GroupingModuleGroupIpAssetRegistryResponse = Address;

export type GroupingModuleGroupNftResponse = Address;

export type GroupingModuleIpAccountRegistryResponse = Address;

export type GroupingModuleLicenseRegistryResponse = Address;

export type GroupingModuleLicenseTokenResponse = Address;

export type GroupingModuleRoyaltyModuleResponse = Address;

export type GroupingModuleUpgradeInterfaceVersionResponse = string;

export type GroupingModuleAuthorityResponse = Address;

/**
 * GroupingModuleGetClaimableRewardRequest
 *
 * @param groupId address
 * @param token address
 * @param ipIds address[]
 */
export type GroupingModuleGetClaimableRewardRequest = {
  groupId: Address;
  token: Address;
  ipIds: readonly Address[];
};

export type GroupingModuleGetClaimableRewardResponse = readonly bigint[];

export type GroupingModuleIsConsumingScheduledOpResponse = Hex;

export type GroupingModuleNameResponse = string;

export type GroupingModulePausedResponse = boolean;

export type GroupingModuleProxiableUuidResponse = Hex;

/**
 * GroupingModuleSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type GroupingModuleSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type GroupingModuleSupportsInterfaceResponse = boolean;

/**
 * GroupingModuleProtocolPausableInitRequest
 *
 * @param accessManager address
 */
export type GroupingModuleProtocolPausableInitRequest = {
  accessManager: Address;
};

/**
 * GroupingModuleAddIpRequest
 *
 * @param groupIpId address
 * @param ipIds address[]
 */
export type GroupingModuleAddIpRequest = {
  groupIpId: Address;
  ipIds: readonly Address[];
};

/**
 * GroupingModuleClaimRewardRequest
 *
 * @param groupId address
 * @param token address
 * @param ipIds address[]
 */
export type GroupingModuleClaimRewardRequest = {
  groupId: Address;
  token: Address;
  ipIds: readonly Address[];
};

/**
 * GroupingModuleCollectRoyaltiesRequest
 *
 * @param groupId address
 * @param token address
 * @param snapshotIds uint256[]
 */
export type GroupingModuleCollectRoyaltiesRequest = {
  groupId: Address;
  token: Address;
  snapshotIds: readonly bigint[];
};

/**
 * GroupingModuleInitializeRequest
 *
 * @param accessManager address
 */
export type GroupingModuleInitializeRequest = {
  accessManager: Address;
};

/**
 * GroupingModuleRegisterGroupRequest
 *
 * @param groupPool address
 */
export type GroupingModuleRegisterGroupRequest = {
  groupPool: Address;
};

/**
 * GroupingModuleRemoveIpRequest
 *
 * @param groupIpId address
 * @param ipIds address[]
 */
export type GroupingModuleRemoveIpRequest = {
  groupIpId: Address;
  ipIds: readonly Address[];
};

/**
 * GroupingModuleSetAuthorityRequest
 *
 * @param newAuthority address
 */
export type GroupingModuleSetAuthorityRequest = {
  newAuthority: Address;
};

/**
 * GroupingModuleUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type GroupingModuleUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

/**
 * GroupingModuleWhitelistGroupRewardPoolRequest
 *
 * @param rewardPool address
 */
export type GroupingModuleWhitelistGroupRewardPoolRequest = {
  rewardPool: Address;
};

/**
 * contract GroupingModule event
 */
export class GroupingModuleEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(groupingModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event AddedIpToGroup for contract GroupingModule
   */
  public watchAddedIpToGroupEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleAddedIpToGroupEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "AddedIpToGroup",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AddedIpToGroup for contract GroupingModule
   */
  public parseTxAddedIpToGroupEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleAddedIpToGroupEvent> {
    const targetLogs: Array<GroupingModuleAddedIpToGroupEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "AddedIpToGroup",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AddedIpToGroup") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event AuthorityUpdated for contract GroupingModule
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleAuthorityUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "AuthorityUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract GroupingModule
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleAuthorityUpdatedEvent> {
    const targetLogs: Array<GroupingModuleAuthorityUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "AuthorityUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AuthorityUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event ClaimedReward for contract GroupingModule
   */
  public watchClaimedRewardEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleClaimedRewardEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "ClaimedReward",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event ClaimedReward for contract GroupingModule
   */
  public parseTxClaimedRewardEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleClaimedRewardEvent> {
    const targetLogs: Array<GroupingModuleClaimedRewardEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "ClaimedReward",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "ClaimedReward") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event CollectedRoyaltiesToGroupPool for contract GroupingModule
   */
  public watchCollectedRoyaltiesToGroupPoolEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleCollectedRoyaltiesToGroupPoolEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "CollectedRoyaltiesToGroupPool",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event CollectedRoyaltiesToGroupPool for contract GroupingModule
   */
  public parseTxCollectedRoyaltiesToGroupPoolEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleCollectedRoyaltiesToGroupPoolEvent> {
    const targetLogs: Array<GroupingModuleCollectedRoyaltiesToGroupPoolEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "CollectedRoyaltiesToGroupPool",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "CollectedRoyaltiesToGroupPool") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event IPGroupRegistered for contract GroupingModule
   */
  public watchIpGroupRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleIpGroupRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "IPGroupRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event IPGroupRegistered for contract GroupingModule
   */
  public parseTxIpGroupRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleIpGroupRegisteredEvent> {
    const targetLogs: Array<GroupingModuleIpGroupRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "IPGroupRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "IPGroupRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract GroupingModule
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract GroupingModule
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleInitializedEvent> {
    const targetLogs: Array<GroupingModuleInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Paused for contract GroupingModule
   */
  public watchPausedEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModulePausedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "Paused",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Paused for contract GroupingModule
   */
  public parseTxPausedEvent(txReceipt: TransactionReceipt): Array<GroupingModulePausedEvent> {
    const targetLogs: Array<GroupingModulePausedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "Paused",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Paused") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event RemovedIpFromGroup for contract GroupingModule
   */
  public watchRemovedIpFromGroupEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleRemovedIpFromGroupEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "RemovedIpFromGroup",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RemovedIpFromGroup for contract GroupingModule
   */
  public parseTxRemovedIpFromGroupEvent(
    txReceipt: TransactionReceipt,
  ): Array<GroupingModuleRemovedIpFromGroupEvent> {
    const targetLogs: Array<GroupingModuleRemovedIpFromGroupEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "RemovedIpFromGroup",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RemovedIpFromGroup") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Unpaused for contract GroupingModule
   */
  public watchUnpausedEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleUnpausedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "Unpaused",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Unpaused for contract GroupingModule
   */
  public parseTxUnpausedEvent(txReceipt: TransactionReceipt): Array<GroupingModuleUnpausedEvent> {
    const targetLogs: Array<GroupingModuleUnpausedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "Unpaused",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Unpaused") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Upgraded for contract GroupingModule
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<GroupingModuleUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: groupingModuleAbi,
      address: this.address,
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract GroupingModule
   */
  public parseTxUpgradedEvent(txReceipt: TransactionReceipt): Array<GroupingModuleUpgradedEvent> {
    const targetLogs: Array<GroupingModuleUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: groupingModuleAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract GroupingModule readonly method
 */
export class GroupingModuleReadOnlyClient extends GroupingModuleEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method ACCESS_CONTROLLER for contract GroupingModule
   *
   * @param request GroupingModuleAccessControllerRequest
   * @return Promise<GroupingModuleAccessControllerResponse>
   */
  public async accessController(): Promise<GroupingModuleAccessControllerResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "ACCESS_CONTROLLER",
    });
  }

  /**
   * method GROUP_IP_ASSET_REGISTRY for contract GroupingModule
   *
   * @param request GroupingModuleGroupIpAssetRegistryRequest
   * @return Promise<GroupingModuleGroupIpAssetRegistryResponse>
   */
  public async groupIpAssetRegistry(): Promise<GroupingModuleGroupIpAssetRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "GROUP_IP_ASSET_REGISTRY",
    });
  }

  /**
   * method GROUP_NFT for contract GroupingModule
   *
   * @param request GroupingModuleGroupNftRequest
   * @return Promise<GroupingModuleGroupNftResponse>
   */
  public async groupNft(): Promise<GroupingModuleGroupNftResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "GROUP_NFT",
    });
  }

  /**
   * method IP_ACCOUNT_REGISTRY for contract GroupingModule
   *
   * @param request GroupingModuleIpAccountRegistryRequest
   * @return Promise<GroupingModuleIpAccountRegistryResponse>
   */
  public async ipAccountRegistry(): Promise<GroupingModuleIpAccountRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "IP_ACCOUNT_REGISTRY",
    });
  }

  /**
   * method LICENSE_REGISTRY for contract GroupingModule
   *
   * @param request GroupingModuleLicenseRegistryRequest
   * @return Promise<GroupingModuleLicenseRegistryResponse>
   */
  public async licenseRegistry(): Promise<GroupingModuleLicenseRegistryResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "LICENSE_REGISTRY",
    });
  }

  /**
   * method LICENSE_TOKEN for contract GroupingModule
   *
   * @param request GroupingModuleLicenseTokenRequest
   * @return Promise<GroupingModuleLicenseTokenResponse>
   */
  public async licenseToken(): Promise<GroupingModuleLicenseTokenResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "LICENSE_TOKEN",
    });
  }

  /**
   * method ROYALTY_MODULE for contract GroupingModule
   *
   * @param request GroupingModuleRoyaltyModuleRequest
   * @return Promise<GroupingModuleRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<GroupingModuleRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract GroupingModule
   *
   * @param request GroupingModuleUpgradeInterfaceVersionRequest
   * @return Promise<GroupingModuleUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<GroupingModuleUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
  }

  /**
   * method authority for contract GroupingModule
   *
   * @param request GroupingModuleAuthorityRequest
   * @return Promise<GroupingModuleAuthorityResponse>
   */
  public async authority(): Promise<GroupingModuleAuthorityResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "authority",
    });
  }

  /**
   * method getClaimableReward for contract GroupingModule
   *
   * @param request GroupingModuleGetClaimableRewardRequest
   * @return Promise<GroupingModuleGetClaimableRewardResponse>
   */
  public async getClaimableReward(
    request: GroupingModuleGetClaimableRewardRequest,
  ): Promise<GroupingModuleGetClaimableRewardResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "getClaimableReward",
      args: [request.groupId, request.token, request.ipIds],
    });
  }

  /**
   * method isConsumingScheduledOp for contract GroupingModule
   *
   * @param request GroupingModuleIsConsumingScheduledOpRequest
   * @return Promise<GroupingModuleIsConsumingScheduledOpResponse>
   */
  public async isConsumingScheduledOp(): Promise<GroupingModuleIsConsumingScheduledOpResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "isConsumingScheduledOp",
    });
  }

  /**
   * method name for contract GroupingModule
   *
   * @param request GroupingModuleNameRequest
   * @return Promise<GroupingModuleNameResponse>
   */
  public async name(): Promise<GroupingModuleNameResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method paused for contract GroupingModule
   *
   * @param request GroupingModulePausedRequest
   * @return Promise<GroupingModulePausedResponse>
   */
  public async paused(): Promise<GroupingModulePausedResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "paused",
    });
  }

  /**
   * method proxiableUUID for contract GroupingModule
   *
   * @param request GroupingModuleProxiableUuidRequest
   * @return Promise<GroupingModuleProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<GroupingModuleProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "proxiableUUID",
    });
  }

  /**
   * method supportsInterface for contract GroupingModule
   *
   * @param request GroupingModuleSupportsInterfaceRequest
   * @return Promise<GroupingModuleSupportsInterfaceResponse>
   */
  public async supportsInterface(
    request: GroupingModuleSupportsInterfaceRequest,
  ): Promise<GroupingModuleSupportsInterfaceResponse> {
    return await this.rpcClient.readContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
  }
}

/**
 * contract GroupingModule write method
 */
export class GroupingModuleClient extends GroupingModuleReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method __ProtocolPausable_init for contract GroupingModule
   *
   * @param request GroupingModuleProtocolPausableInitRequest
   * @return Promise<WriteContractReturnType>
   */
  public async protocolPausableInit(
    request: GroupingModuleProtocolPausableInitRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "__ProtocolPausable_init",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method __ProtocolPausable_init for contract GroupingModule with only encode
   *
   * @param request GroupingModuleProtocolPausableInitRequest
   * @return EncodedTxData
   */
  public protocolPausableInitEncode(
    request: GroupingModuleProtocolPausableInitRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "__ProtocolPausable_init",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method addIp for contract GroupingModule
   *
   * @param request GroupingModuleAddIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async addIp(request: GroupingModuleAddIpRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "addIp",
      account: this.wallet.account,
      args: [request.groupIpId, request.ipIds],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method addIp for contract GroupingModule with only encode
   *
   * @param request GroupingModuleAddIpRequest
   * @return EncodedTxData
   */
  public addIpEncode(request: GroupingModuleAddIpRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "addIp",
        args: [request.groupIpId, request.ipIds],
      }),
    };
  }

  /**
   * method claimReward for contract GroupingModule
   *
   * @param request GroupingModuleClaimRewardRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimReward(
    request: GroupingModuleClaimRewardRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "claimReward",
      account: this.wallet.account,
      args: [request.groupId, request.token, request.ipIds],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method claimReward for contract GroupingModule with only encode
   *
   * @param request GroupingModuleClaimRewardRequest
   * @return EncodedTxData
   */
  public claimRewardEncode(request: GroupingModuleClaimRewardRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "claimReward",
        args: [request.groupId, request.token, request.ipIds],
      }),
    };
  }

  /**
   * method collectRoyalties for contract GroupingModule
   *
   * @param request GroupingModuleCollectRoyaltiesRequest
   * @return Promise<WriteContractReturnType>
   */
  public async collectRoyalties(
    request: GroupingModuleCollectRoyaltiesRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "collectRoyalties",
      account: this.wallet.account,
      args: [request.groupId, request.token, request.snapshotIds],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method collectRoyalties for contract GroupingModule with only encode
   *
   * @param request GroupingModuleCollectRoyaltiesRequest
   * @return EncodedTxData
   */
  public collectRoyaltiesEncode(request: GroupingModuleCollectRoyaltiesRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "collectRoyalties",
        args: [request.groupId, request.token, request.snapshotIds],
      }),
    };
  }

  /**
   * method initialize for contract GroupingModule
   *
   * @param request GroupingModuleInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: GroupingModuleInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract GroupingModule with only encode
   *
   * @param request GroupingModuleInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: GroupingModuleInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "initialize",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method pause for contract GroupingModule
   *
   * @param request GroupingModulePauseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async pause(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "pause",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method pause for contract GroupingModule with only encode
   *
   * @param request GroupingModulePauseRequest
   * @return EncodedTxData
   */
  public pauseEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "pause",
      }),
    };
  }

  /**
   * method registerGroup for contract GroupingModule
   *
   * @param request GroupingModuleRegisterGroupRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerGroup(
    request: GroupingModuleRegisterGroupRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "registerGroup",
      account: this.wallet.account,
      args: [request.groupPool],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerGroup for contract GroupingModule with only encode
   *
   * @param request GroupingModuleRegisterGroupRequest
   * @return EncodedTxData
   */
  public registerGroupEncode(request: GroupingModuleRegisterGroupRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "registerGroup",
        args: [request.groupPool],
      }),
    };
  }

  /**
   * method removeIp for contract GroupingModule
   *
   * @param request GroupingModuleRemoveIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async removeIp(request: GroupingModuleRemoveIpRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "removeIp",
      account: this.wallet.account,
      args: [request.groupIpId, request.ipIds],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method removeIp for contract GroupingModule with only encode
   *
   * @param request GroupingModuleRemoveIpRequest
   * @return EncodedTxData
   */
  public removeIpEncode(request: GroupingModuleRemoveIpRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "removeIp",
        args: [request.groupIpId, request.ipIds],
      }),
    };
  }

  /**
   * method setAuthority for contract GroupingModule
   *
   * @param request GroupingModuleSetAuthorityRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAuthority(
    request: GroupingModuleSetAuthorityRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "setAuthority",
      account: this.wallet.account,
      args: [request.newAuthority],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAuthority for contract GroupingModule with only encode
   *
   * @param request GroupingModuleSetAuthorityRequest
   * @return EncodedTxData
   */
  public setAuthorityEncode(request: GroupingModuleSetAuthorityRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "setAuthority",
        args: [request.newAuthority],
      }),
    };
  }

  /**
   * method unpause for contract GroupingModule
   *
   * @param request GroupingModuleUnpauseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async unpause(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "unpause",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method unpause for contract GroupingModule with only encode
   *
   * @param request GroupingModuleUnpauseRequest
   * @return EncodedTxData
   */
  public unpauseEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "unpause",
      }),
    };
  }

  /**
   * method upgradeToAndCall for contract GroupingModule
   *
   * @param request GroupingModuleUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: GroupingModuleUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract GroupingModule with only encode
   *
   * @param request GroupingModuleUpgradeToAndCallRequest
   * @return EncodedTxData
   */
  public upgradeToAndCallEncode(request: GroupingModuleUpgradeToAndCallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "upgradeToAndCall",
        args: [request.newImplementation, request.data],
      }),
    };
  }

  /**
   * method whitelistGroupRewardPool for contract GroupingModule
   *
   * @param request GroupingModuleWhitelistGroupRewardPoolRequest
   * @return Promise<WriteContractReturnType>
   */
  public async whitelistGroupRewardPool(
    request: GroupingModuleWhitelistGroupRewardPoolRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingModuleAbi,
      address: this.address,
      functionName: "whitelistGroupRewardPool",
      account: this.wallet.account,
      args: [request.rewardPool],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method whitelistGroupRewardPool for contract GroupingModule with only encode
   *
   * @param request GroupingModuleWhitelistGroupRewardPoolRequest
   * @return EncodedTxData
   */
  public whitelistGroupRewardPoolEncode(
    request: GroupingModuleWhitelistGroupRewardPoolRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingModuleAbi,
        functionName: "whitelistGroupRewardPool",
        args: [request.rewardPool],
      }),
    };
  }
}

// Contract GroupingWorkflows =============================================================

/**
 * GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest
 *
 * @param spgNftContract address
 * @param groupId address
 * @param recipient address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param ipMetadata tuple
 * @param sigAddToGroup tuple
 */
export type GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
  spgNftContract: Address;
  groupId: Address;
  recipient: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  sigAddToGroup: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * GroupingWorkflowsRegisterGroupAndAttachLicenseRequest
 *
 * @param groupPool address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type GroupingWorkflowsRegisterGroupAndAttachLicenseRequest = {
  groupPool: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest
 *
 * @param groupPool address
 * @param ipIds address[]
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest = {
  groupPool: Address;
  ipIds: readonly Address[];
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest
 *
 * @param nftContract address
 * @param tokenId uint256
 * @param groupId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param ipMetadata tuple
 * @param sigMetadataAndAttach tuple
 * @param sigAddToGroup tuple
 */
export type GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest = {
  nftContract: Address;
  tokenId: bigint;
  groupId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  sigMetadataAndAttach: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
  sigAddToGroup: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * contract GroupingWorkflows write method
 */
export class GroupingWorkflowsClient {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(groupingWorkflowsAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method mintAndRegisterIpAndAttachLicenseAndAddToGroup for contract GroupingWorkflows
   *
   * @param request GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintAndRegisterIpAndAttachLicenseAndAddToGroup(
    request: GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingWorkflowsAbi,
      address: this.address,
      functionName: "mintAndRegisterIpAndAttachLicenseAndAddToGroup",
      account: this.wallet.account,
      args: [
        request.spgNftContract,
        request.groupId,
        request.recipient,
        request.licenseTemplate,
        request.licenseTermsId,
        request.ipMetadata,
        request.sigAddToGroup,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintAndRegisterIpAndAttachLicenseAndAddToGroup for contract GroupingWorkflows with only encode
   *
   * @param request GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest
   * @return EncodedTxData
   */
  public mintAndRegisterIpAndAttachLicenseAndAddToGroupEncode(
    request: GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingWorkflowsAbi,
        functionName: "mintAndRegisterIpAndAttachLicenseAndAddToGroup",
        args: [
          request.spgNftContract,
          request.groupId,
          request.recipient,
          request.licenseTemplate,
          request.licenseTermsId,
          request.ipMetadata,
          request.sigAddToGroup,
        ],
      }),
    };
  }

  /**
   * method registerGroupAndAttachLicense for contract GroupingWorkflows
   *
   * @param request GroupingWorkflowsRegisterGroupAndAttachLicenseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerGroupAndAttachLicense(
    request: GroupingWorkflowsRegisterGroupAndAttachLicenseRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingWorkflowsAbi,
      address: this.address,
      functionName: "registerGroupAndAttachLicense",
      account: this.wallet.account,
      args: [request.groupPool, request.licenseTemplate, request.licenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerGroupAndAttachLicense for contract GroupingWorkflows with only encode
   *
   * @param request GroupingWorkflowsRegisterGroupAndAttachLicenseRequest
   * @return EncodedTxData
   */
  public registerGroupAndAttachLicenseEncode(
    request: GroupingWorkflowsRegisterGroupAndAttachLicenseRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingWorkflowsAbi,
        functionName: "registerGroupAndAttachLicense",
        args: [request.groupPool, request.licenseTemplate, request.licenseTermsId],
      }),
    };
  }

  /**
   * method registerGroupAndAttachLicenseAndAddIps for contract GroupingWorkflows
   *
   * @param request GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerGroupAndAttachLicenseAndAddIps(
    request: GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingWorkflowsAbi,
      address: this.address,
      functionName: "registerGroupAndAttachLicenseAndAddIps",
      account: this.wallet.account,
      args: [request.groupPool, request.ipIds, request.licenseTemplate, request.licenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerGroupAndAttachLicenseAndAddIps for contract GroupingWorkflows with only encode
   *
   * @param request GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest
   * @return EncodedTxData
   */
  public registerGroupAndAttachLicenseAndAddIpsEncode(
    request: GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingWorkflowsAbi,
        functionName: "registerGroupAndAttachLicenseAndAddIps",
        args: [request.groupPool, request.ipIds, request.licenseTemplate, request.licenseTermsId],
      }),
    };
  }

  /**
   * method registerIpAndAttachLicenseAndAddToGroup for contract GroupingWorkflows
   *
   * @param request GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAndAttachLicenseAndAddToGroup(
    request: GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: groupingWorkflowsAbi,
      address: this.address,
      functionName: "registerIpAndAttachLicenseAndAddToGroup",
      account: this.wallet.account,
      args: [
        request.nftContract,
        request.tokenId,
        request.groupId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.ipMetadata,
        request.sigMetadataAndAttach,
        request.sigAddToGroup,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerIpAndAttachLicenseAndAddToGroup for contract GroupingWorkflows with only encode
   *
   * @param request GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest
   * @return EncodedTxData
   */
  public registerIpAndAttachLicenseAndAddToGroupEncode(
    request: GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: groupingWorkflowsAbi,
        functionName: "registerIpAndAttachLicenseAndAddToGroup",
        args: [
          request.nftContract,
          request.tokenId,
          request.groupId,
          request.licenseTemplate,
          request.licenseTermsId,
          request.ipMetadata,
          request.sigMetadataAndAttach,
          request.sigAddToGroup,
        ],
      }),
    };
  }
}

// Contract IPAccountImpl =============================================================

/**
 * IpAccountImplStateResponse
 *
 * @param result bytes32
 */
export type IpAccountImplStateResponse = {
  result: Hex;
};

/**
 * IpAccountImplTokenResponse
 *
 * @param 0 uint256
 * @param 1 address
 * @param 2 uint256
 */
export type IpAccountImplTokenResponse = readonly [bigint, Address, bigint];

/**
 * IpAccountImplExecuteRequest
 *
 * @param to address
 * @param value uint256
 * @param data bytes
 * @param operation uint8
 */
export type IpAccountImplExecuteRequest = {
  to: Address;
  value: bigint;
  data: Hex;
  operation: number;
};

/**
 * IpAccountImplExecute2Request
 *
 * @param to address
 * @param value uint256
 * @param data bytes
 */
export type IpAccountImplExecute2Request = {
  to: Address;
  value: bigint;
  data: Hex;
};

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
  to: Address;
  value: bigint;
  data: Hex;
  signer: Address;
  deadline: bigint;
  signature: Hex;
};

/**
 * contract IPAccountImpl readonly method
 */
export class IpAccountImplReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(ipAccountImplAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * method state for contract IPAccountImpl
   *
   * @param request IpAccountImplStateRequest
   * @return Promise<IpAccountImplStateResponse>
   */
  public async state(): Promise<IpAccountImplStateResponse> {
    const result = await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "state",
    });
    return {
      result: result,
    };
  }

  /**
   * method token for contract IPAccountImpl
   *
   * @param request IpAccountImplTokenRequest
   * @return Promise<IpAccountImplTokenResponse>
   */
  public async token(): Promise<IpAccountImplTokenResponse> {
    return await this.rpcClient.readContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "token",
    });
  }
}

/**
 * contract IPAccountImpl write method
 */
export class IpAccountImplClient extends IpAccountImplReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method execute for contract IPAccountImpl
   *
   * @param request IpAccountImplExecuteRequest
   * @return Promise<WriteContractReturnType>
   */
  public async execute(request: IpAccountImplExecuteRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "execute",
      account: this.wallet.account,
      args: [request.to, request.value, request.data, request.operation],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method execute for contract IPAccountImpl with only encode
   *
   * @param request IpAccountImplExecuteRequest
   * @return EncodedTxData
   */
  public executeEncode(request: IpAccountImplExecuteRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: ipAccountImplAbi,
        functionName: "execute",
        args: [request.to, request.value, request.data, request.operation],
      }),
    };
  }

  /**
   * method execute for contract IPAccountImpl
   *
   * @param request IpAccountImplExecute2Request
   * @return Promise<WriteContractReturnType>
   */
  public async execute2(request: IpAccountImplExecute2Request): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAccountImplAbi,
      address: this.address,
      functionName: "execute",
      account: this.wallet.account,
      args: [request.to, request.value, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method execute for contract IPAccountImpl with only encode
   *
   * @param request IpAccountImplExecute2Request
   * @return EncodedTxData
   */
  public execute2Encode(request: IpAccountImplExecute2Request): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: ipAccountImplAbi,
        functionName: "execute",
        args: [request.to, request.value, request.data],
      }),
    };
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
      functionName: "executeWithSig",
      account: this.wallet.account,
      args: [
        request.to,
        request.value,
        request.data,
        request.signer,
        request.deadline,
        request.signature,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method executeWithSig for contract IPAccountImpl with only encode
   *
   * @param request IpAccountImplExecuteWithSigRequest
   * @return EncodedTxData
   */
  public executeWithSigEncode(request: IpAccountImplExecuteWithSigRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: ipAccountImplAbi,
        functionName: "executeWithSig",
        args: [
          request.to,
          request.value,
          request.data,
          request.signer,
          request.deadline,
          request.signature,
        ],
      }),
    };
  }
}

// Contract IPAssetRegistry =============================================================

/**
 * IpAssetRegistryIpAccountRegisteredEvent
 *
 * @param account address
 * @param implementation address
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryIpAccountRegisteredEvent = {
  account: Address;
  implementation: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

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
  ipId: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  name: string;
  uri: string;
  registrationDate: bigint;
};

/**
 * IpAssetRegistryIpIdRequest
 *
 * @param chainId uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryIpIdRequest = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

export type IpAssetRegistryIpIdResponse = Address;

/**
 * IpAssetRegistryIsRegisteredRequest
 *
 * @param id address
 */
export type IpAssetRegistryIsRegisteredRequest = {
  id: Address;
};

export type IpAssetRegistryIsRegisteredResponse = boolean;

/**
 * IpAssetRegistryRegisterRequest
 *
 * @param chainid uint256
 * @param tokenContract address
 * @param tokenId uint256
 */
export type IpAssetRegistryRegisterRequest = {
  chainid: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

/**
 * contract IPAssetRegistry event
 */
export class IpAssetRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(ipAssetRegistryAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event IPAccountRegistered for contract IPAssetRegistry
   */
  public watchIpAccountRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<IpAssetRegistryIpAccountRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "IPAccountRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event IPAccountRegistered for contract IPAssetRegistry
   */
  public parseTxIpAccountRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpAssetRegistryIpAccountRegisteredEvent> {
    const targetLogs: Array<IpAssetRegistryIpAccountRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipAssetRegistryAbi,
          eventName: "IPAccountRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "IPAccountRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event IPRegistered for contract IPAssetRegistry
   */
  public watchIpRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<IpAssetRegistryIpRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipAssetRegistryAbi,
      address: this.address,
      eventName: "IPRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event IPRegistered for contract IPAssetRegistry
   */
  public parseTxIpRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpAssetRegistryIpRegisteredEvent> {
    const targetLogs: Array<IpAssetRegistryIpRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipAssetRegistryAbi,
          eventName: "IPRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "IPRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract IPAssetRegistry readonly method
 */
export class IpAssetRegistryReadOnlyClient extends IpAssetRegistryEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method ipId for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryIpIdRequest
   * @return Promise<IpAssetRegistryIpIdResponse>
   */
  public async ipId(request: IpAssetRegistryIpIdRequest): Promise<IpAssetRegistryIpIdResponse> {
    return await this.rpcClient.readContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "ipId",
      args: [request.chainId, request.tokenContract, request.tokenId],
    });
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
      functionName: "isRegistered",
      args: [request.id],
    });
  }
}

/**
 * contract IPAssetRegistry write method
 */
export class IpAssetRegistryClient extends IpAssetRegistryReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method register for contract IPAssetRegistry
   *
   * @param request IpAssetRegistryRegisterRequest
   * @return Promise<WriteContractReturnType>
   */
  public async register(request: IpAssetRegistryRegisterRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipAssetRegistryAbi,
      address: this.address,
      functionName: "register",
      account: this.wallet.account,
      args: [request.chainid, request.tokenContract, request.tokenId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method register for contract IPAssetRegistry with only encode
   *
   * @param request IpAssetRegistryRegisterRequest
   * @return EncodedTxData
   */
  public registerEncode(request: IpAssetRegistryRegisterRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: ipAssetRegistryAbi,
        functionName: "register",
        args: [request.chainid, request.tokenContract, request.tokenId],
      }),
    };
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
  claimer: Address;
  token: Address;
  amount: bigint;
};

/**
 * IpRoyaltyVaultImplSnapshotCompletedEvent
 *
 * @param snapshotId uint256
 * @param snapshotTimestamp uint256
 */
export type IpRoyaltyVaultImplSnapshotCompletedEvent = {
  snapshotId: bigint;
  snapshotTimestamp: bigint;
};

/**
 * IpRoyaltyVaultImplClaimableRevenueRequest
 *
 * @param account address
 * @param snapshotId uint256
 * @param token address
 */
export type IpRoyaltyVaultImplClaimableRevenueRequest = {
  account: Address;
  snapshotId: bigint;
  token: Address;
};

export type IpRoyaltyVaultImplClaimableRevenueResponse = bigint;

export type IpRoyaltyVaultImplIpIdResponse = Address;

/**
 * IpRoyaltyVaultImplClaimRevenueOnBehalfBySnapshotBatchRequest
 *
 * @param snapshotIds uint256[]
 * @param token address
 * @param claimer address
 */
export type IpRoyaltyVaultImplClaimRevenueOnBehalfBySnapshotBatchRequest = {
  snapshotIds: readonly bigint[];
  token: Address;
  claimer: Address;
};

/**
 * contract IpRoyaltyVaultImpl event
 */
export class IpRoyaltyVaultImplEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(ipRoyaltyVaultImplAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event RevenueTokenClaimed for contract IpRoyaltyVaultImpl
   */
  public watchRevenueTokenClaimedEvent(
    onLogs: (txHash: Hex, ev: Partial<IpRoyaltyVaultImplRevenueTokenClaimedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: "RevenueTokenClaimed",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RevenueTokenClaimed for contract IpRoyaltyVaultImpl
   */
  public parseTxRevenueTokenClaimedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplRevenueTokenClaimedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplRevenueTokenClaimedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: "RevenueTokenClaimed",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RevenueTokenClaimed") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event SnapshotCompleted for contract IpRoyaltyVaultImpl
   */
  public watchSnapshotCompletedEvent(
    onLogs: (txHash: Hex, ev: Partial<IpRoyaltyVaultImplSnapshotCompletedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      eventName: "SnapshotCompleted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event SnapshotCompleted for contract IpRoyaltyVaultImpl
   */
  public parseTxSnapshotCompletedEvent(
    txReceipt: TransactionReceipt,
  ): Array<IpRoyaltyVaultImplSnapshotCompletedEvent> {
    const targetLogs: Array<IpRoyaltyVaultImplSnapshotCompletedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: ipRoyaltyVaultImplAbi,
          eventName: "SnapshotCompleted",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "SnapshotCompleted") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract IpRoyaltyVaultImpl readonly method
 */
export class IpRoyaltyVaultImplReadOnlyClient extends IpRoyaltyVaultImplEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
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
      functionName: "claimableRevenue",
      args: [request.account, request.snapshotId, request.token],
    });
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
      functionName: "ipId",
    });
  }
}

/**
 * contract IpRoyaltyVaultImpl write method
 */
export class IpRoyaltyVaultImplClient extends IpRoyaltyVaultImplReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method claimRevenueOnBehalfBySnapshotBatch for contract IpRoyaltyVaultImpl
   *
   * @param request IpRoyaltyVaultImplClaimRevenueOnBehalfBySnapshotBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async claimRevenueOnBehalfBySnapshotBatch(
    request: IpRoyaltyVaultImplClaimRevenueOnBehalfBySnapshotBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: ipRoyaltyVaultImplAbi,
      address: this.address,
      functionName: "claimRevenueOnBehalfBySnapshotBatch",
      account: this.wallet.account,
      args: [request.snapshotIds, request.token, request.claimer],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method claimRevenueOnBehalfBySnapshotBatch for contract IpRoyaltyVaultImpl with only encode
   *
   * @param request IpRoyaltyVaultImplClaimRevenueOnBehalfBySnapshotBatchRequest
   * @return EncodedTxData
   */
  public claimRevenueOnBehalfBySnapshotBatchEncode(
    request: IpRoyaltyVaultImplClaimRevenueOnBehalfBySnapshotBatchRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: ipRoyaltyVaultImplAbi,
        functionName: "claimRevenueOnBehalfBySnapshotBatch",
        args: [request.snapshotIds, request.token, request.claimer],
      }),
    };
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
      functionName: "snapshot",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method snapshot for contract IpRoyaltyVaultImpl with only encode
   *
   * @param request IpRoyaltyVaultImplSnapshotRequest
   * @return EncodedTxData
   */
  public snapshotEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: ipRoyaltyVaultImplAbi,
        functionName: "snapshot",
      }),
    };
  }
}

// Contract LicenseAttachmentWorkflows =============================================================

/**
 * LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest
 *
 * @param spgNftContract address
 * @param recipient address
 * @param ipMetadata tuple
 * @param terms tuple
 */
export type LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest = {
  spgNftContract: Address;
  recipient: Address;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    defaultMintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCeiling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: bigint;
    currency: Address;
    uri: string;
  };
};

/**
 * LicenseAttachmentWorkflowsMulticallRequest
 *
 * @param data bytes[]
 */
export type LicenseAttachmentWorkflowsMulticallRequest = {
  data: readonly Hex[];
};

/**
 * LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest
 *
 * @param nftContract address
 * @param tokenId uint256
 * @param ipMetadata tuple
 * @param terms tuple
 * @param sigMetadata tuple
 * @param sigAttach tuple
 */
export type LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: bigint;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    defaultMintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCeiling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: bigint;
    currency: Address;
    uri: string;
  };
  sigMetadata: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
  sigAttach: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest
 *
 * @param ipId address
 * @param terms tuple
 * @param sigAttach tuple
 */
export type LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest = {
  ipId: Address;
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    defaultMintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCeiling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: bigint;
    currency: Address;
    uri: string;
  };
  sigAttach: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * contract LicenseAttachmentWorkflows write method
 */
export class LicenseAttachmentWorkflowsClient {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(licenseAttachmentWorkflowsAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method mintAndRegisterIpAndAttachPILTerms for contract LicenseAttachmentWorkflows
   *
   * @param request LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintAndRegisterIpAndAttachPilTerms(
    request: LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseAttachmentWorkflowsAbi,
      address: this.address,
      functionName: "mintAndRegisterIpAndAttachPILTerms",
      account: this.wallet.account,
      args: [request.spgNftContract, request.recipient, request.ipMetadata, request.terms],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintAndRegisterIpAndAttachPILTerms for contract LicenseAttachmentWorkflows with only encode
   *
   * @param request LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest
   * @return EncodedTxData
   */
  public mintAndRegisterIpAndAttachPilTermsEncode(
    request: LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: "mintAndRegisterIpAndAttachPILTerms",
        args: [request.spgNftContract, request.recipient, request.ipMetadata, request.terms],
      }),
    };
  }

  /**
   * method multicall for contract LicenseAttachmentWorkflows
   *
   * @param request LicenseAttachmentWorkflowsMulticallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async multicall(
    request: LicenseAttachmentWorkflowsMulticallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseAttachmentWorkflowsAbi,
      address: this.address,
      functionName: "multicall",
      account: this.wallet.account,
      args: [request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method multicall for contract LicenseAttachmentWorkflows with only encode
   *
   * @param request LicenseAttachmentWorkflowsMulticallRequest
   * @return EncodedTxData
   */
  public multicallEncode(request: LicenseAttachmentWorkflowsMulticallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: "multicall",
        args: [request.data],
      }),
    };
  }

  /**
   * method registerIpAndAttachPILTerms for contract LicenseAttachmentWorkflows
   *
   * @param request LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIpAndAttachPilTerms(
    request: LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseAttachmentWorkflowsAbi,
      address: this.address,
      functionName: "registerIpAndAttachPILTerms",
      account: this.wallet.account,
      args: [
        request.nftContract,
        request.tokenId,
        request.ipMetadata,
        request.terms,
        request.sigMetadata,
        request.sigAttach,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerIpAndAttachPILTerms for contract LicenseAttachmentWorkflows with only encode
   *
   * @param request LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest
   * @return EncodedTxData
   */
  public registerIpAndAttachPilTermsEncode(
    request: LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: "registerIpAndAttachPILTerms",
        args: [
          request.nftContract,
          request.tokenId,
          request.ipMetadata,
          request.terms,
          request.sigMetadata,
          request.sigAttach,
        ],
      }),
    };
  }

  /**
   * method registerPILTermsAndAttach for contract LicenseAttachmentWorkflows
   *
   * @param request LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerPilTermsAndAttach(
    request: LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licenseAttachmentWorkflowsAbi,
      address: this.address,
      functionName: "registerPILTermsAndAttach",
      account: this.wallet.account,
      args: [request.ipId, request.terms, request.sigAttach],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerPILTermsAndAttach for contract LicenseAttachmentWorkflows with only encode
   *
   * @param request LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest
   * @return EncodedTxData
   */
  public registerPilTermsAndAttachEncode(
    request: LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: "registerPILTermsAndAttach",
        args: [request.ipId, request.terms, request.sigAttach],
      }),
    };
  }
}

// Contract LicenseRegistry =============================================================

/**
 * LicenseRegistryAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type LicenseRegistryAuthorityUpdatedEvent = {
  authority: Address;
};

/**
 * LicenseRegistryDefaultLicenseTermsSetEvent
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryDefaultLicenseTermsSetEvent = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryExpirationTimeSetEvent
 *
 * @param ipId address
 * @param expireTime uint256
 */
export type LicenseRegistryExpirationTimeSetEvent = {
  ipId: Address;
  expireTime: bigint;
};

/**
 * LicenseRegistryInitializedEvent
 *
 * @param version uint64
 */
export type LicenseRegistryInitializedEvent = {
  version: bigint;
};

/**
 * LicenseRegistryLicenseTemplateRegisteredEvent
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryLicenseTemplateRegisteredEvent = {
  licenseTemplate: Address;
};

/**
 * LicenseRegistryLicensingConfigSetForIpEvent
 *
 * @param ipId address
 * @param licensingConfig tuple
 */
export type LicenseRegistryLicensingConfigSetForIpEvent = {
  ipId: Address;
  licensingConfig: {
    isSet: boolean;
    mintingFee: bigint;
    licensingHook: Address;
    hookData: Hex;
  };
};

/**
 * LicenseRegistryLicensingConfigSetForLicenseEvent
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryLicensingConfigSetForLicenseEvent = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryUpgradedEvent
 *
 * @param implementation address
 */
export type LicenseRegistryUpgradedEvent = {
  implementation: Address;
};

export type LicenseRegistryDisputeModuleResponse = Address;

export type LicenseRegistryExpirationTimeResponse = Hex;

export type LicenseRegistryIpGraphResponse = Address;

export type LicenseRegistryIpGraphAclResponse = Address;

export type LicenseRegistryLicensingModuleResponse = Address;

export type LicenseRegistryUpgradeInterfaceVersionResponse = string;

export type LicenseRegistryAuthorityResponse = Address;

/**
 * LicenseRegistryExistsRequest
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryExistsRequest = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

export type LicenseRegistryExistsResponse = boolean;

/**
 * LicenseRegistryGetAttachedLicenseTermsRequest
 *
 * @param ipId address
 * @param index uint256
 */
export type LicenseRegistryGetAttachedLicenseTermsRequest = {
  ipId: Address;
  index: bigint;
};

/**
 * LicenseRegistryGetAttachedLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetAttachedLicenseTermsResponse = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryGetAttachedLicenseTermsCountRequest
 *
 * @param ipId address
 */
export type LicenseRegistryGetAttachedLicenseTermsCountRequest = {
  ipId: Address;
};

export type LicenseRegistryGetAttachedLicenseTermsCountResponse = bigint;

/**
 * LicenseRegistryGetDefaultLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetDefaultLicenseTermsResponse = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryGetDerivativeIpRequest
 *
 * @param parentIpId address
 * @param index uint256
 */
export type LicenseRegistryGetDerivativeIpRequest = {
  parentIpId: Address;
  index: bigint;
};

/**
 * LicenseRegistryGetDerivativeIpResponse
 *
 * @param childIpId address
 */
export type LicenseRegistryGetDerivativeIpResponse = {
  childIpId: Address;
};

/**
 * LicenseRegistryGetDerivativeIpCountRequest
 *
 * @param parentIpId address
 */
export type LicenseRegistryGetDerivativeIpCountRequest = {
  parentIpId: Address;
};

export type LicenseRegistryGetDerivativeIpCountResponse = bigint;

/**
 * LicenseRegistryGetExpireTimeRequest
 *
 * @param ipId address
 */
export type LicenseRegistryGetExpireTimeRequest = {
  ipId: Address;
};

export type LicenseRegistryGetExpireTimeResponse = bigint;

/**
 * LicenseRegistryGetLicensingConfigRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetLicensingConfigRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

export type LicenseRegistryGetLicensingConfigResponse = {
  isSet: boolean;
  mintingFee: bigint;
  licensingHook: Address;
  hookData: Hex;
};

/**
 * LicenseRegistryGetParentIpRequest
 *
 * @param childIpId address
 * @param index uint256
 */
export type LicenseRegistryGetParentIpRequest = {
  childIpId: Address;
  index: bigint;
};

/**
 * LicenseRegistryGetParentIpResponse
 *
 * @param parentIpId address
 */
export type LicenseRegistryGetParentIpResponse = {
  parentIpId: Address;
};

/**
 * LicenseRegistryGetParentIpCountRequest
 *
 * @param childIpId address
 */
export type LicenseRegistryGetParentIpCountRequest = {
  childIpId: Address;
};

export type LicenseRegistryGetParentIpCountResponse = bigint;

/**
 * LicenseRegistryGetParentLicenseTermsRequest
 *
 * @param childIpId address
 * @param parentIpId address
 */
export type LicenseRegistryGetParentLicenseTermsRequest = {
  childIpId: Address;
  parentIpId: Address;
};

/**
 * LicenseRegistryGetParentLicenseTermsResponse
 *
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryGetParentLicenseTermsResponse = {
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryHasDerivativeIpsRequest
 *
 * @param parentIpId address
 */
export type LicenseRegistryHasDerivativeIpsRequest = {
  parentIpId: Address;
};

export type LicenseRegistryHasDerivativeIpsResponse = boolean;

/**
 * LicenseRegistryHasIpAttachedLicenseTermsRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryHasIpAttachedLicenseTermsRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

export type LicenseRegistryHasIpAttachedLicenseTermsResponse = boolean;

export type LicenseRegistryIsConsumingScheduledOpResponse = Hex;

/**
 * LicenseRegistryIsDerivativeIpRequest
 *
 * @param childIpId address
 */
export type LicenseRegistryIsDerivativeIpRequest = {
  childIpId: Address;
};

export type LicenseRegistryIsDerivativeIpResponse = boolean;

/**
 * LicenseRegistryIsExpiredNowRequest
 *
 * @param ipId address
 */
export type LicenseRegistryIsExpiredNowRequest = {
  ipId: Address;
};

export type LicenseRegistryIsExpiredNowResponse = boolean;

/**
 * LicenseRegistryIsParentIpRequest
 *
 * @param parentIpId address
 * @param childIpId address
 */
export type LicenseRegistryIsParentIpRequest = {
  parentIpId: Address;
  childIpId: Address;
};

export type LicenseRegistryIsParentIpResponse = boolean;

/**
 * LicenseRegistryIsRegisteredLicenseTemplateRequest
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryIsRegisteredLicenseTemplateRequest = {
  licenseTemplate: Address;
};

export type LicenseRegistryIsRegisteredLicenseTemplateResponse = boolean;

export type LicenseRegistryProxiableUuidResponse = Hex;

/**
 * LicenseRegistryVerifyMintLicenseTokenRequest
 *
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param isMintedByIpOwner bool
 */
export type LicenseRegistryVerifyMintLicenseTokenRequest = {
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  isMintedByIpOwner: boolean;
};

export type LicenseRegistryVerifyMintLicenseTokenResponse = {
  isSet: boolean;
  mintingFee: bigint;
  licensingHook: Address;
  hookData: Hex;
};

/**
 * LicenseRegistryAttachLicenseTermsToIpRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicenseRegistryAttachLicenseTermsToIpRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

/**
 * LicenseRegistryInitializeRequest
 *
 * @param accessManager address
 */
export type LicenseRegistryInitializeRequest = {
  accessManager: Address;
};

/**
 * LicenseRegistryRegisterDerivativeIpRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTemplate address
 * @param licenseTermsIds uint256[]
 * @param isUsingLicenseToken bool
 */
export type LicenseRegistryRegisterDerivativeIpRequest = {
  childIpId: Address;
  parentIpIds: readonly Address[];
  licenseTemplate: Address;
  licenseTermsIds: readonly bigint[];
  isUsingLicenseToken: boolean;
};

/**
 * LicenseRegistryRegisterLicenseTemplateRequest
 *
 * @param licenseTemplate address
 */
export type LicenseRegistryRegisterLicenseTemplateRequest = {
  licenseTemplate: Address;
};

/**
 * LicenseRegistrySetAuthorityRequest
 *
 * @param newAuthority address
 */
export type LicenseRegistrySetAuthorityRequest = {
  newAuthority: Address;
};

/**
 * LicenseRegistrySetDefaultLicenseTermsRequest
 *
 * @param newLicenseTemplate address
 * @param newLicenseTermsId uint256
 */
export type LicenseRegistrySetDefaultLicenseTermsRequest = {
  newLicenseTemplate: Address;
  newLicenseTermsId: bigint;
};

/**
 * LicenseRegistrySetLicensingConfigForIpRequest
 *
 * @param ipId address
 * @param licensingConfig tuple
 */
export type LicenseRegistrySetLicensingConfigForIpRequest = {
  ipId: Address;
  licensingConfig: {
    isSet: boolean;
    mintingFee: bigint;
    licensingHook: Address;
    hookData: Hex;
  };
};

/**
 * LicenseRegistrySetLicensingConfigForLicenseRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param licensingConfig tuple
 */
export type LicenseRegistrySetLicensingConfigForLicenseRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  licensingConfig: {
    isSet: boolean;
    mintingFee: bigint;
    licensingHook: Address;
    hookData: Hex;
  };
};

/**
 * LicenseRegistryUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type LicenseRegistryUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

/**
 * contract LicenseRegistry event
 */
export class LicenseRegistryEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(licenseRegistryAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event AuthorityUpdated for contract LicenseRegistry
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryAuthorityUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "AuthorityUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract LicenseRegistry
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryAuthorityUpdatedEvent> {
    const targetLogs: Array<LicenseRegistryAuthorityUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "AuthorityUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AuthorityUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event DefaultLicenseTermsSet for contract LicenseRegistry
   */
  public watchDefaultLicenseTermsSetEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryDefaultLicenseTermsSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "DefaultLicenseTermsSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DefaultLicenseTermsSet for contract LicenseRegistry
   */
  public parseTxDefaultLicenseTermsSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryDefaultLicenseTermsSetEvent> {
    const targetLogs: Array<LicenseRegistryDefaultLicenseTermsSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "DefaultLicenseTermsSet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DefaultLicenseTermsSet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event ExpirationTimeSet for contract LicenseRegistry
   */
  public watchExpirationTimeSetEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryExpirationTimeSetEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "ExpirationTimeSet",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event ExpirationTimeSet for contract LicenseRegistry
   */
  public parseTxExpirationTimeSetEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryExpirationTimeSetEvent> {
    const targetLogs: Array<LicenseRegistryExpirationTimeSetEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "ExpirationTimeSet",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "ExpirationTimeSet") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract LicenseRegistry
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryInitializedEvent> {
    const targetLogs: Array<LicenseRegistryInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicenseTemplateRegistered for contract LicenseRegistry
   */
  public watchLicenseTemplateRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryLicenseTemplateRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "LicenseTemplateRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTemplateRegistered for contract LicenseRegistry
   */
  public parseTxLicenseTemplateRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicenseTemplateRegisteredEvent> {
    const targetLogs: Array<LicenseRegistryLicenseTemplateRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "LicenseTemplateRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTemplateRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicensingConfigSetForIP for contract LicenseRegistry
   */
  public watchLicensingConfigSetForIpEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryLicensingConfigSetForIpEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "LicensingConfigSetForIP",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicensingConfigSetForIP for contract LicenseRegistry
   */
  public parseTxLicensingConfigSetForIpEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicensingConfigSetForIpEvent> {
    const targetLogs: Array<LicenseRegistryLicensingConfigSetForIpEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "LicensingConfigSetForIP",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicensingConfigSetForIP") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicensingConfigSetForLicense for contract LicenseRegistry
   */
  public watchLicensingConfigSetForLicenseEvent(
    onLogs: (txHash: Hex, ev: Partial<LicenseRegistryLicensingConfigSetForLicenseEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licenseRegistryAbi,
      address: this.address,
      eventName: "LicensingConfigSetForLicense",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicensingConfigSetForLicense for contract LicenseRegistry
   */
  public parseTxLicensingConfigSetForLicenseEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicenseRegistryLicensingConfigSetForLicenseEvent> {
    const targetLogs: Array<LicenseRegistryLicensingConfigSetForLicenseEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "LicensingConfigSetForLicense",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicensingConfigSetForLicense") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract LicenseRegistry
   */
  public parseTxUpgradedEvent(txReceipt: TransactionReceipt): Array<LicenseRegistryUpgradedEvent> {
    const targetLogs: Array<LicenseRegistryUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licenseRegistryAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract LicenseRegistry readonly method
 */
export class LicenseRegistryReadOnlyClient extends LicenseRegistryEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
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
      functionName: "DISPUTE_MODULE",
    });
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
      functionName: "EXPIRATION_TIME",
    });
  }

  /**
   * method IP_GRAPH for contract LicenseRegistry
   *
   * @param request LicenseRegistryIpGraphRequest
   * @return Promise<LicenseRegistryIpGraphResponse>
   */
  public async ipGraph(): Promise<LicenseRegistryIpGraphResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "IP_GRAPH",
    });
  }

  /**
   * method IP_GRAPH_ACL for contract LicenseRegistry
   *
   * @param request LicenseRegistryIpGraphAclRequest
   * @return Promise<LicenseRegistryIpGraphAclResponse>
   */
  public async ipGraphAcl(): Promise<LicenseRegistryIpGraphAclResponse> {
    return await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "IP_GRAPH_ACL",
    });
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
      functionName: "LICENSING_MODULE",
    });
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
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
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
      functionName: "authority",
    });
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
      functionName: "exists",
      args: [request.licenseTemplate, request.licenseTermsId],
    });
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
      functionName: "getAttachedLicenseTerms",
      args: [request.ipId, request.index],
    });
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    };
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
      functionName: "getAttachedLicenseTermsCount",
      args: [request.ipId],
    });
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
      functionName: "getDefaultLicenseTerms",
    });
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    };
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
      functionName: "getDerivativeIp",
      args: [request.parentIpId, request.index],
    });
    return {
      childIpId: result,
    };
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
      functionName: "getDerivativeIpCount",
      args: [request.parentIpId],
    });
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
      functionName: "getExpireTime",
      args: [request.ipId],
    });
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
      functionName: "getLicensingConfig",
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
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
      functionName: "getParentIp",
      args: [request.childIpId, request.index],
    });
    return {
      parentIpId: result,
    };
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
      functionName: "getParentIpCount",
      args: [request.childIpId],
    });
  }

  /**
   * method getParentLicenseTerms for contract LicenseRegistry
   *
   * @param request LicenseRegistryGetParentLicenseTermsRequest
   * @return Promise<LicenseRegistryGetParentLicenseTermsResponse>
   */
  public async getParentLicenseTerms(
    request: LicenseRegistryGetParentLicenseTermsRequest,
  ): Promise<LicenseRegistryGetParentLicenseTermsResponse> {
    const result = await this.rpcClient.readContract({
      abi: licenseRegistryAbi,
      address: this.address,
      functionName: "getParentLicenseTerms",
      args: [request.childIpId, request.parentIpId],
    });
    return {
      licenseTemplate: result[0],
      licenseTermsId: result[1],
    };
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
      functionName: "hasDerivativeIps",
      args: [request.parentIpId],
    });
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
      functionName: "hasIpAttachedLicenseTerms",
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
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
      functionName: "isConsumingScheduledOp",
    });
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
      functionName: "isDerivativeIp",
      args: [request.childIpId],
    });
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
      functionName: "isExpiredNow",
      args: [request.ipId],
    });
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
      functionName: "isParentIp",
      args: [request.parentIpId, request.childIpId],
    });
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
      functionName: "isRegisteredLicenseTemplate",
      args: [request.licenseTemplate],
    });
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
      functionName: "proxiableUUID",
    });
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
      functionName: "verifyMintLicenseToken",
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.isMintedByIpOwner,
      ],
    });
  }
}

/**
 * contract LicenseRegistry write method
 */
export class LicenseRegistryClient extends LicenseRegistryReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
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
      functionName: "attachLicenseTermsToIp",
      account: this.wallet.account,
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method attachLicenseTermsToIp for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistryAttachLicenseTermsToIpRequest
   * @return EncodedTxData
   */
  public attachLicenseTermsToIpEncode(
    request: LicenseRegistryAttachLicenseTermsToIpRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "attachLicenseTermsToIp",
        args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
      }),
    };
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
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistryInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: LicenseRegistryInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "initialize",
        args: [request.accessManager],
      }),
    };
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
      functionName: "registerDerivativeIp",
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTemplate,
        request.licenseTermsIds,
        request.isUsingLicenseToken,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerDerivativeIp for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistryRegisterDerivativeIpRequest
   * @return EncodedTxData
   */
  public registerDerivativeIpEncode(
    request: LicenseRegistryRegisterDerivativeIpRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "registerDerivativeIp",
        args: [
          request.childIpId,
          request.parentIpIds,
          request.licenseTemplate,
          request.licenseTermsIds,
          request.isUsingLicenseToken,
        ],
      }),
    };
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
      functionName: "registerLicenseTemplate",
      account: this.wallet.account,
      args: [request.licenseTemplate],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerLicenseTemplate for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistryRegisterLicenseTemplateRequest
   * @return EncodedTxData
   */
  public registerLicenseTemplateEncode(
    request: LicenseRegistryRegisterLicenseTemplateRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "registerLicenseTemplate",
        args: [request.licenseTemplate],
      }),
    };
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
      functionName: "setAuthority",
      account: this.wallet.account,
      args: [request.newAuthority],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAuthority for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistrySetAuthorityRequest
   * @return EncodedTxData
   */
  public setAuthorityEncode(request: LicenseRegistrySetAuthorityRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "setAuthority",
        args: [request.newAuthority],
      }),
    };
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
      functionName: "setDefaultLicenseTerms",
      account: this.wallet.account,
      args: [request.newLicenseTemplate, request.newLicenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setDefaultLicenseTerms for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistrySetDefaultLicenseTermsRequest
   * @return EncodedTxData
   */
  public setDefaultLicenseTermsEncode(
    request: LicenseRegistrySetDefaultLicenseTermsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "setDefaultLicenseTerms",
        args: [request.newLicenseTemplate, request.newLicenseTermsId],
      }),
    };
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
      functionName: "setLicensingConfigForIp",
      account: this.wallet.account,
      args: [request.ipId, request.licensingConfig],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setLicensingConfigForIp for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistrySetLicensingConfigForIpRequest
   * @return EncodedTxData
   */
  public setLicensingConfigForIpEncode(
    request: LicenseRegistrySetLicensingConfigForIpRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "setLicensingConfigForIp",
        args: [request.ipId, request.licensingConfig],
      }),
    };
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
      functionName: "setLicensingConfigForLicense",
      account: this.wallet.account,
      args: [
        request.ipId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.licensingConfig,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setLicensingConfigForLicense for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistrySetLicensingConfigForLicenseRequest
   * @return EncodedTxData
   */
  public setLicensingConfigForLicenseEncode(
    request: LicenseRegistrySetLicensingConfigForLicenseRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "setLicensingConfigForLicense",
        args: [
          request.ipId,
          request.licenseTemplate,
          request.licenseTermsId,
          request.licensingConfig,
        ],
      }),
    };
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
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract LicenseRegistry with only encode
   *
   * @param request LicenseRegistryUpgradeToAndCallRequest
   * @return EncodedTxData
   */
  public upgradeToAndCallEncode(request: LicenseRegistryUpgradeToAndCallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licenseRegistryAbi,
        functionName: "upgradeToAndCall",
        args: [request.newImplementation, request.data],
      }),
    };
  }
}

// Contract LicenseToken =============================================================

/**
 * LicenseTokenOwnerOfRequest
 *
 * @param tokenId uint256
 */
export type LicenseTokenOwnerOfRequest = {
  tokenId: bigint;
};

export type LicenseTokenOwnerOfResponse = Address;

/**
 * contract LicenseToken readonly method
 */
export class LicenseTokenReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(licenseTokenAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * method ownerOf for contract LicenseToken
   *
   * @param request LicenseTokenOwnerOfRequest
   * @return Promise<LicenseTokenOwnerOfResponse>
   */
  public async ownerOf(request: LicenseTokenOwnerOfRequest): Promise<LicenseTokenOwnerOfResponse> {
    return await this.rpcClient.readContract({
      abi: licenseTokenAbi,
      address: this.address,
      functionName: "ownerOf",
      args: [request.tokenId],
    });
  }
}

// Contract LicensingModule =============================================================

/**
 * LicensingModuleLicenseTermsAttachedEvent
 *
 * @param caller address
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicensingModuleLicenseTermsAttachedEvent = {
  caller: Address;
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

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
  caller: Address;
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  amount: bigint;
  receiver: Address;
  startLicenseTokenId: bigint;
};

/**
 * LicensingModulePredictMintingLicenseFeeRequest
 *
 * @param licensorIpId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param amount uint256
 * @param receiver address
 * @param royaltyContext bytes
 */
export type LicensingModulePredictMintingLicenseFeeRequest = {
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  amount: bigint;
  receiver: Address;
  royaltyContext: Hex;
};

/**
 * LicensingModulePredictMintingLicenseFeeResponse
 *
 * @param currencyToken address
 * @param tokenAmount uint256
 */
export type LicensingModulePredictMintingLicenseFeeResponse = {
  currencyToken: Address;
  tokenAmount: bigint;
};

/**
 * LicensingModuleAttachLicenseTermsRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 */
export type LicensingModuleAttachLicenseTermsRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
};

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
  licensorIpId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  amount: bigint;
  receiver: Address;
  royaltyContext: Hex;
};

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
  childIpId: Address;
  parentIpIds: readonly Address[];
  licenseTermsIds: readonly bigint[];
  licenseTemplate: Address;
  royaltyContext: Hex;
};

/**
 * LicensingModuleRegisterDerivativeWithLicenseTokensRequest
 *
 * @param childIpId address
 * @param licenseTokenIds uint256[]
 * @param royaltyContext bytes
 */
export type LicensingModuleRegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Address;
  licenseTokenIds: readonly bigint[];
  royaltyContext: Hex;
};

/**
 * LicensingModuleSetLicensingConfigRequest
 *
 * @param ipId address
 * @param licenseTemplate address
 * @param licenseTermsId uint256
 * @param licensingConfig tuple
 */
export type LicensingModuleSetLicensingConfigRequest = {
  ipId: Address;
  licenseTemplate: Address;
  licenseTermsId: bigint;
  licensingConfig: {
    isSet: boolean;
    mintingFee: bigint;
    licensingHook: Address;
    hookData: Hex;
  };
};

/**
 * contract LicensingModule event
 */
export class LicensingModuleEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(licensingModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event LicenseTermsAttached for contract LicensingModule
   */
  public watchLicenseTermsAttachedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicensingModuleLicenseTermsAttachedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "LicenseTermsAttached",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTermsAttached for contract LicensingModule
   */
  public parseTxLicenseTermsAttachedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicensingModuleLicenseTermsAttachedEvent> {
    const targetLogs: Array<LicensingModuleLicenseTermsAttachedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licensingModuleAbi,
          eventName: "LicenseTermsAttached",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTermsAttached") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicenseTokensMinted for contract LicensingModule
   */
  public watchLicenseTokensMintedEvent(
    onLogs: (txHash: Hex, ev: Partial<LicensingModuleLicenseTokensMintedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: licensingModuleAbi,
      address: this.address,
      eventName: "LicenseTokensMinted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTokensMinted for contract LicensingModule
   */
  public parseTxLicenseTokensMintedEvent(
    txReceipt: TransactionReceipt,
  ): Array<LicensingModuleLicenseTokensMintedEvent> {
    const targetLogs: Array<LicensingModuleLicenseTokensMintedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: licensingModuleAbi,
          eventName: "LicenseTokensMinted",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTokensMinted") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract LicensingModule readonly method
 */
export class LicensingModuleReadOnlyClient extends LicensingModuleEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method predictMintingLicenseFee for contract LicensingModule
   *
   * @param request LicensingModulePredictMintingLicenseFeeRequest
   * @return Promise<LicensingModulePredictMintingLicenseFeeResponse>
   */
  public async predictMintingLicenseFee(
    request: LicensingModulePredictMintingLicenseFeeRequest,
  ): Promise<LicensingModulePredictMintingLicenseFeeResponse> {
    const result = await this.rpcClient.readContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "predictMintingLicenseFee",
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.amount,
        request.receiver,
        request.royaltyContext,
      ],
    });
    return {
      currencyToken: result[0],
      tokenAmount: result[1],
    };
  }
}

/**
 * contract LicensingModule write method
 */
export class LicensingModuleClient extends LicensingModuleReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
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
      functionName: "attachLicenseTerms",
      account: this.wallet.account,
      args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method attachLicenseTerms for contract LicensingModule with only encode
   *
   * @param request LicensingModuleAttachLicenseTermsRequest
   * @return EncodedTxData
   */
  public attachLicenseTermsEncode(
    request: LicensingModuleAttachLicenseTermsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licensingModuleAbi,
        functionName: "attachLicenseTerms",
        args: [request.ipId, request.licenseTemplate, request.licenseTermsId],
      }),
    };
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
      functionName: "mintLicenseTokens",
      account: this.wallet.account,
      args: [
        request.licensorIpId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.amount,
        request.receiver,
        request.royaltyContext,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintLicenseTokens for contract LicensingModule with only encode
   *
   * @param request LicensingModuleMintLicenseTokensRequest
   * @return EncodedTxData
   */
  public mintLicenseTokensEncode(request: LicensingModuleMintLicenseTokensRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licensingModuleAbi,
        functionName: "mintLicenseTokens",
        args: [
          request.licensorIpId,
          request.licenseTemplate,
          request.licenseTermsId,
          request.amount,
          request.receiver,
          request.royaltyContext,
        ],
      }),
    };
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
      functionName: "registerDerivative",
      account: this.wallet.account,
      args: [
        request.childIpId,
        request.parentIpIds,
        request.licenseTermsIds,
        request.licenseTemplate,
        request.royaltyContext,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerDerivative for contract LicensingModule with only encode
   *
   * @param request LicensingModuleRegisterDerivativeRequest
   * @return EncodedTxData
   */
  public registerDerivativeEncode(
    request: LicensingModuleRegisterDerivativeRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licensingModuleAbi,
        functionName: "registerDerivative",
        args: [
          request.childIpId,
          request.parentIpIds,
          request.licenseTermsIds,
          request.licenseTemplate,
          request.royaltyContext,
        ],
      }),
    };
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
      functionName: "registerDerivativeWithLicenseTokens",
      account: this.wallet.account,
      args: [request.childIpId, request.licenseTokenIds, request.royaltyContext],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerDerivativeWithLicenseTokens for contract LicensingModule with only encode
   *
   * @param request LicensingModuleRegisterDerivativeWithLicenseTokensRequest
   * @return EncodedTxData
   */
  public registerDerivativeWithLicenseTokensEncode(
    request: LicensingModuleRegisterDerivativeWithLicenseTokensRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licensingModuleAbi,
        functionName: "registerDerivativeWithLicenseTokens",
        args: [request.childIpId, request.licenseTokenIds, request.royaltyContext],
      }),
    };
  }

  /**
   * method setLicensingConfig for contract LicensingModule
   *
   * @param request LicensingModuleSetLicensingConfigRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setLicensingConfig(
    request: LicensingModuleSetLicensingConfigRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: licensingModuleAbi,
      address: this.address,
      functionName: "setLicensingConfig",
      account: this.wallet.account,
      args: [
        request.ipId,
        request.licenseTemplate,
        request.licenseTermsId,
        request.licensingConfig,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setLicensingConfig for contract LicensingModule with only encode
   *
   * @param request LicensingModuleSetLicensingConfigRequest
   * @return EncodedTxData
   */
  public setLicensingConfigEncode(
    request: LicensingModuleSetLicensingConfigRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: licensingModuleAbi,
        functionName: "setLicensingConfig",
        args: [
          request.ipId,
          request.licenseTemplate,
          request.licenseTermsId,
          request.licensingConfig,
        ],
      }),
    };
  }
}

// Contract MockERC20 =============================================================

/**
 * MockErc20ApprovalEvent
 *
 * @param owner address
 * @param spender address
 * @param value uint256
 */
export type MockErc20ApprovalEvent = {
  owner: Address;
  spender: Address;
  value: bigint;
};

/**
 * MockErc20TransferEvent
 *
 * @param from address
 * @param to address
 * @param value uint256
 */
export type MockErc20TransferEvent = {
  from: Address;
  to: Address;
  value: bigint;
};

/**
 * MockErc20AllowanceRequest
 *
 * @param owner address
 * @param spender address
 */
export type MockErc20AllowanceRequest = {
  owner: Address;
  spender: Address;
};

export type MockErc20AllowanceResponse = bigint;

/**
 * MockErc20BalanceOfRequest
 *
 * @param account address
 */
export type MockErc20BalanceOfRequest = {
  account: Address;
};

export type MockErc20BalanceOfResponse = bigint;

export type MockErc20DecimalsResponse = number;

export type MockErc20NameResponse = string;

export type MockErc20SymbolResponse = string;

export type MockErc20TotalSupplyResponse = bigint;

/**
 * MockErc20ApproveRequest
 *
 * @param spender address
 * @param value uint256
 */
export type MockErc20ApproveRequest = {
  spender: Address;
  value: bigint;
};

/**
 * MockErc20BurnRequest
 *
 * @param from address
 * @param amount uint256
 */
export type MockErc20BurnRequest = {
  from: Address;
  amount: bigint;
};

/**
 * MockErc20MintRequest
 *
 * @param to address
 * @param amount uint256
 */
export type MockErc20MintRequest = {
  to: Address;
  amount: bigint;
};

/**
 * MockErc20TransferRequest
 *
 * @param to address
 * @param value uint256
 */
export type MockErc20TransferRequest = {
  to: Address;
  value: bigint;
};

/**
 * MockErc20TransferFromRequest
 *
 * @param from address
 * @param to address
 * @param value uint256
 */
export type MockErc20TransferFromRequest = {
  from: Address;
  to: Address;
  value: bigint;
};

/**
 * contract MockERC20 event
 */
export class MockErc20EventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(mockErc20Address, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event Approval for contract MockERC20
   */
  public watchApprovalEvent(
    onLogs: (txHash: Hex, ev: Partial<MockErc20ApprovalEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc20Abi,
      address: this.address,
      eventName: "Approval",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Approval for contract MockERC20
   */
  public parseTxApprovalEvent(txReceipt: TransactionReceipt): Array<MockErc20ApprovalEvent> {
    const targetLogs: Array<MockErc20ApprovalEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: mockErc20Abi,
          eventName: "Approval",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Approval") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Transfer for contract MockERC20
   */
  public watchTransferEvent(
    onLogs: (txHash: Hex, ev: Partial<MockErc20TransferEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: mockErc20Abi,
      address: this.address,
      eventName: "Transfer",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Transfer for contract MockERC20
   */
  public parseTxTransferEvent(txReceipt: TransactionReceipt): Array<MockErc20TransferEvent> {
    const targetLogs: Array<MockErc20TransferEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: mockErc20Abi,
          eventName: "Transfer",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Transfer") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract MockERC20 readonly method
 */
export class MockErc20ReadOnlyClient extends MockErc20EventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method allowance for contract MockERC20
   *
   * @param request MockErc20AllowanceRequest
   * @return Promise<MockErc20AllowanceResponse>
   */
  public async allowance(request: MockErc20AllowanceRequest): Promise<MockErc20AllowanceResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "allowance",
      args: [request.owner, request.spender],
    });
  }

  /**
   * method balanceOf for contract MockERC20
   *
   * @param request MockErc20BalanceOfRequest
   * @return Promise<MockErc20BalanceOfResponse>
   */
  public async balanceOf(request: MockErc20BalanceOfRequest): Promise<MockErc20BalanceOfResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "balanceOf",
      args: [request.account],
    });
  }

  /**
   * method decimals for contract MockERC20
   *
   * @param request MockErc20DecimalsRequest
   * @return Promise<MockErc20DecimalsResponse>
   */
  public async decimals(): Promise<MockErc20DecimalsResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "decimals",
    });
  }

  /**
   * method name for contract MockERC20
   *
   * @param request MockErc20NameRequest
   * @return Promise<MockErc20NameResponse>
   */
  public async name(): Promise<MockErc20NameResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "name",
    });
  }

  /**
   * method symbol for contract MockERC20
   *
   * @param request MockErc20SymbolRequest
   * @return Promise<MockErc20SymbolResponse>
   */
  public async symbol(): Promise<MockErc20SymbolResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "symbol",
    });
  }

  /**
   * method totalSupply for contract MockERC20
   *
   * @param request MockErc20TotalSupplyRequest
   * @return Promise<MockErc20TotalSupplyResponse>
   */
  public async totalSupply(): Promise<MockErc20TotalSupplyResponse> {
    return await this.rpcClient.readContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "totalSupply",
    });
  }
}

/**
 * contract MockERC20 write method
 */
export class MockErc20Client extends MockErc20ReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method approve for contract MockERC20
   *
   * @param request MockErc20ApproveRequest
   * @return Promise<WriteContractReturnType>
   */
  public async approve(request: MockErc20ApproveRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "approve",
      account: this.wallet.account,
      args: [request.spender, request.value],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method approve for contract MockERC20 with only encode
   *
   * @param request MockErc20ApproveRequest
   * @return EncodedTxData
   */
  public approveEncode(request: MockErc20ApproveRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: mockErc20Abi,
        functionName: "approve",
        args: [request.spender, request.value],
      }),
    };
  }

  /**
   * method burn for contract MockERC20
   *
   * @param request MockErc20BurnRequest
   * @return Promise<WriteContractReturnType>
   */
  public async burn(request: MockErc20BurnRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "burn",
      account: this.wallet.account,
      args: [request.from, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method burn for contract MockERC20 with only encode
   *
   * @param request MockErc20BurnRequest
   * @return EncodedTxData
   */
  public burnEncode(request: MockErc20BurnRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: mockErc20Abi,
        functionName: "burn",
        args: [request.from, request.amount],
      }),
    };
  }

  /**
   * method mint for contract MockERC20
   *
   * @param request MockErc20MintRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mint(request: MockErc20MintRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "mint",
      account: this.wallet.account,
      args: [request.to, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mint for contract MockERC20 with only encode
   *
   * @param request MockErc20MintRequest
   * @return EncodedTxData
   */
  public mintEncode(request: MockErc20MintRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: mockErc20Abi,
        functionName: "mint",
        args: [request.to, request.amount],
      }),
    };
  }

  /**
   * method transfer for contract MockERC20
   *
   * @param request MockErc20TransferRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transfer(request: MockErc20TransferRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "transfer",
      account: this.wallet.account,
      args: [request.to, request.value],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transfer for contract MockERC20 with only encode
   *
   * @param request MockErc20TransferRequest
   * @return EncodedTxData
   */
  public transferEncode(request: MockErc20TransferRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: mockErc20Abi,
        functionName: "transfer",
        args: [request.to, request.value],
      }),
    };
  }

  /**
   * method transferFrom for contract MockERC20
   *
   * @param request MockErc20TransferFromRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferFrom(
    request: MockErc20TransferFromRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: mockErc20Abi,
      address: this.address,
      functionName: "transferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.value],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transferFrom for contract MockERC20 with only encode
   *
   * @param request MockErc20TransferFromRequest
   * @return EncodedTxData
   */
  public transferFromEncode(request: MockErc20TransferFromRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: mockErc20Abi,
        functionName: "transferFrom",
        args: [request.from, request.to, request.value],
      }),
    };
  }
}

// Contract ModuleRegistry =============================================================

/**
 * ModuleRegistryIsRegisteredRequest
 *
 * @param moduleAddress address
 */
export type ModuleRegistryIsRegisteredRequest = {
  moduleAddress: Address;
};

export type ModuleRegistryIsRegisteredResponse = boolean;

/**
 * contract ModuleRegistry readonly method
 */
export class ModuleRegistryReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(moduleRegistryAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
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
      functionName: "isRegistered",
      args: [request.moduleAddress],
    });
  }
}

// Contract Multicall3 =============================================================

/**
 * Multicall3Aggregate3Request
 *
 * @param calls tuple[]
 */
export type Multicall3Aggregate3Request = {
  calls: {
    target: Address;
    allowFailure: boolean;
    callData: Hex;
  }[];
};

/**
 * contract Multicall3 write method
 */
export class Multicall3Client {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(multicall3Address, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method aggregate3 for contract Multicall3
   *
   * @param request Multicall3Aggregate3Request
   * @return Promise<WriteContractReturnType>
   */
  public async aggregate3(request: Multicall3Aggregate3Request): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: multicall3Abi,
      address: this.address,
      functionName: "aggregate3",
      account: this.wallet.account,
      args: [request.calls],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method aggregate3 for contract Multicall3 with only encode
   *
   * @param request Multicall3Aggregate3Request
   * @return EncodedTxData
   */
  public aggregate3Encode(request: Multicall3Aggregate3Request): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: multicall3Abi,
        functionName: "aggregate3",
        args: [request.calls],
      }),
    };
  }
}

// Contract PILicenseTemplate =============================================================

/**
 * PiLicenseTemplateAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type PiLicenseTemplateAuthorityUpdatedEvent = {
  authority: Address;
};

/**
 * PiLicenseTemplateDerivativeApprovedEvent
 *
 * @param licenseTermsId uint256
 * @param ipId address
 * @param caller address
 * @param approved bool
 */
export type PiLicenseTemplateDerivativeApprovedEvent = {
  licenseTermsId: bigint;
  ipId: Address;
  caller: Address;
  approved: boolean;
};

/**
 * PiLicenseTemplateInitializedEvent
 *
 * @param version uint64
 */
export type PiLicenseTemplateInitializedEvent = {
  version: bigint;
};

/**
 * PiLicenseTemplateLicenseTermsRegisteredEvent
 *
 * @param licenseTermsId uint256
 * @param licenseTemplate address
 * @param licenseTerms bytes
 */
export type PiLicenseTemplateLicenseTermsRegisteredEvent = {
  licenseTermsId: bigint;
  licenseTemplate: Address;
  licenseTerms: Hex;
};

/**
 * PiLicenseTemplateUpgradedEvent
 *
 * @param implementation address
 */
export type PiLicenseTemplateUpgradedEvent = {
  implementation: Address;
};

export type PiLicenseTemplateAccessControllerResponse = Address;

export type PiLicenseTemplateIpAccountRegistryResponse = Address;

export type PiLicenseTemplateLicenseRegistryResponse = Address;

export type PiLicenseTemplateRoyaltyModuleResponse = Address;

export type PiLicenseTemplateTermsRendererResponse = Address;

export type PiLicenseTemplateUpgradeInterfaceVersionResponse = string;

export type PiLicenseTemplateAuthorityResponse = Address;

/**
 * PiLicenseTemplateExistsRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateExistsRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateExistsResponse = boolean;

/**
 * PiLicenseTemplateGetEarlierExpireTimeRequest
 *
 * @param licenseTermsIds uint256[]
 * @param start uint256
 */
export type PiLicenseTemplateGetEarlierExpireTimeRequest = {
  licenseTermsIds: readonly bigint[];
  start: bigint;
};

export type PiLicenseTemplateGetEarlierExpireTimeResponse = bigint;

/**
 * PiLicenseTemplateGetExpireTimeRequest
 *
 * @param licenseTermsId uint256
 * @param start uint256
 */
export type PiLicenseTemplateGetExpireTimeRequest = {
  licenseTermsId: bigint;
  start: bigint;
};

export type PiLicenseTemplateGetExpireTimeResponse = bigint;

/**
 * PiLicenseTemplateGetLicenseTermsRequest
 *
 * @param selectedLicenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsRequest = {
  selectedLicenseTermsId: bigint;
};

/**
 * PiLicenseTemplateGetLicenseTermsResponse
 *
 * @param terms tuple
 */
export type PiLicenseTemplateGetLicenseTermsResponse = {
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    defaultMintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCeiling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: bigint;
    currency: Address;
    uri: string;
  };
};

/**
 * PiLicenseTemplateGetLicenseTermsIdRequest
 *
 * @param terms tuple
 */
export type PiLicenseTemplateGetLicenseTermsIdRequest = {
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    defaultMintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCeiling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: bigint;
    currency: Address;
    uri: string;
  };
};

/**
 * PiLicenseTemplateGetLicenseTermsIdResponse
 *
 * @param selectedLicenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsIdResponse = {
  selectedLicenseTermsId: bigint;
};

/**
 * PiLicenseTemplateGetLicenseTermsUriRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateGetLicenseTermsUriRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateGetLicenseTermsUriResponse = string;

export type PiLicenseTemplateGetMetadataUriResponse = string;

/**
 * PiLicenseTemplateGetRoyaltyPolicyRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateGetRoyaltyPolicyRequest = {
  licenseTermsId: bigint;
};

/**
 * PiLicenseTemplateGetRoyaltyPolicyResponse
 *
 * @param royaltyPolicy address
 * @param royaltyPercent uint32
 * @param mintingFee uint256
 * @param currency address
 */
export type PiLicenseTemplateGetRoyaltyPolicyResponse = {
  royaltyPolicy: Address;
  royaltyPercent: number;
  mintingFee: bigint;
  currency: Address;
};

export type PiLicenseTemplateIsConsumingScheduledOpResponse = Hex;

/**
 * PiLicenseTemplateIsDerivativeApprovedRequest
 *
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param childIpId address
 */
export type PiLicenseTemplateIsDerivativeApprovedRequest = {
  parentIpId: Address;
  licenseTermsId: bigint;
  childIpId: Address;
};

export type PiLicenseTemplateIsDerivativeApprovedResponse = boolean;

/**
 * PiLicenseTemplateIsLicenseTransferableRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateIsLicenseTransferableRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateIsLicenseTransferableResponse = boolean;

export type PiLicenseTemplateNameResponse = string;

export type PiLicenseTemplateProxiableUuidResponse = Hex;

/**
 * PiLicenseTemplateSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type PiLicenseTemplateSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type PiLicenseTemplateSupportsInterfaceResponse = boolean;

/**
 * PiLicenseTemplateToJsonRequest
 *
 * @param licenseTermsId uint256
 */
export type PiLicenseTemplateToJsonRequest = {
  licenseTermsId: bigint;
};

export type PiLicenseTemplateToJsonResponse = string;

export type PiLicenseTemplateTotalRegisteredLicenseTermsResponse = bigint;

/**
 * PiLicenseTemplateVerifyCompatibleLicensesRequest
 *
 * @param licenseTermsIds uint256[]
 */
export type PiLicenseTemplateVerifyCompatibleLicensesRequest = {
  licenseTermsIds: readonly bigint[];
};

export type PiLicenseTemplateVerifyCompatibleLicensesResponse = boolean;

/**
 * PiLicenseTemplateInitializeRequest
 *
 * @param accessManager address
 * @param name string
 * @param metadataURI string
 */
export type PiLicenseTemplateInitializeRequest = {
  accessManager: Address;
  name: string;
  metadataURI: string;
};

/**
 * PiLicenseTemplateRegisterLicenseTermsRequest
 *
 * @param terms tuple
 */
export type PiLicenseTemplateRegisterLicenseTermsRequest = {
  terms: {
    transferable: boolean;
    royaltyPolicy: Address;
    defaultMintingFee: bigint;
    expiration: bigint;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: Hex;
    commercialRevShare: number;
    commercialRevCeiling: bigint;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: bigint;
    currency: Address;
    uri: string;
  };
};

/**
 * PiLicenseTemplateSetApprovalRequest
 *
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param childIpId address
 * @param approved bool
 */
export type PiLicenseTemplateSetApprovalRequest = {
  parentIpId: Address;
  licenseTermsId: bigint;
  childIpId: Address;
  approved: boolean;
};

/**
 * PiLicenseTemplateSetAuthorityRequest
 *
 * @param newAuthority address
 */
export type PiLicenseTemplateSetAuthorityRequest = {
  newAuthority: Address;
};

/**
 * PiLicenseTemplateUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type PiLicenseTemplateUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

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
];

/**
 * PiLicenseTemplateVerifyRegisterDerivativeRequest
 *
 * @param childIpId address
 * @param parentIpId address
 * @param licenseTermsId uint256
 * @param licensee address
 */
export type PiLicenseTemplateVerifyRegisterDerivativeRequest = {
  childIpId: Address;
  parentIpId: Address;
  licenseTermsId: bigint;
  licensee: Address;
};

/**
 * PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest
 *
 * @param childIpId address
 * @param parentIpIds address[]
 * @param licenseTermsIds uint256[]
 * @param childIpOwner address
 */
export type PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest = {
  childIpId: Address;
  parentIpIds: readonly Address[];
  licenseTermsIds: readonly bigint[];
  childIpOwner: Address;
};

/**
 * contract PILicenseTemplate event
 */
export class PiLicenseTemplateEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(piLicenseTemplateAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event AuthorityUpdated for contract PILicenseTemplate
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateAuthorityUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "AuthorityUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract PILicenseTemplate
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateAuthorityUpdatedEvent> {
    const targetLogs: Array<PiLicenseTemplateAuthorityUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "AuthorityUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AuthorityUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event DerivativeApproved for contract PILicenseTemplate
   */
  public watchDerivativeApprovedEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateDerivativeApprovedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "DerivativeApproved",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event DerivativeApproved for contract PILicenseTemplate
   */
  public parseTxDerivativeApprovedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateDerivativeApprovedEvent> {
    const targetLogs: Array<PiLicenseTemplateDerivativeApprovedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "DerivativeApproved",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "DerivativeApproved") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract PILicenseTemplate
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract PILicenseTemplate
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateInitializedEvent> {
    const targetLogs: Array<PiLicenseTemplateInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event LicenseTermsRegistered for contract PILicenseTemplate
   */
  public watchLicenseTermsRegisteredEvent(
    onLogs: (txHash: Hex, ev: Partial<PiLicenseTemplateLicenseTermsRegisteredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: piLicenseTemplateAbi,
      address: this.address,
      eventName: "LicenseTermsRegistered",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event LicenseTermsRegistered for contract PILicenseTemplate
   */
  public parseTxLicenseTermsRegisteredEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateLicenseTermsRegisteredEvent> {
    const targetLogs: Array<PiLicenseTemplateLicenseTermsRegisteredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "LicenseTermsRegistered",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "LicenseTermsRegistered") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract PILicenseTemplate
   */
  public parseTxUpgradedEvent(
    txReceipt: TransactionReceipt,
  ): Array<PiLicenseTemplateUpgradedEvent> {
    const targetLogs: Array<PiLicenseTemplateUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: piLicenseTemplateAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract PILicenseTemplate readonly method
 */
export class PiLicenseTemplateReadOnlyClient extends PiLicenseTemplateEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
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
      functionName: "ACCESS_CONTROLLER",
    });
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
      functionName: "IP_ACCOUNT_REGISTRY",
    });
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
      functionName: "LICENSE_REGISTRY",
    });
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
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method TERMS_RENDERER for contract PILicenseTemplate
   *
   * @param request PiLicenseTemplateTermsRendererRequest
   * @return Promise<PiLicenseTemplateTermsRendererResponse>
   */
  public async termsRenderer(): Promise<PiLicenseTemplateTermsRendererResponse> {
    return await this.rpcClient.readContract({
      abi: piLicenseTemplateAbi,
      address: this.address,
      functionName: "TERMS_RENDERER",
    });
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
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
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
      functionName: "authority",
    });
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
      functionName: "exists",
      args: [request.licenseTermsId],
    });
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
      functionName: "getEarlierExpireTime",
      args: [request.licenseTermsIds, request.start],
    });
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
      functionName: "getExpireTime",
      args: [request.licenseTermsId, request.start],
    });
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
      functionName: "getLicenseTerms",
      args: [request.selectedLicenseTermsId],
    });
    return {
      terms: result,
    };
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
      functionName: "getLicenseTermsId",
      args: [request.terms],
    });
    return {
      selectedLicenseTermsId: result,
    };
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
      functionName: "getLicenseTermsURI",
      args: [request.licenseTermsId],
    });
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
      functionName: "getMetadataURI",
    });
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
      functionName: "getRoyaltyPolicy",
      args: [request.licenseTermsId],
    });
    return {
      royaltyPolicy: result[0],
      royaltyPercent: result[1],
      mintingFee: result[2],
      currency: result[3],
    };
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
      functionName: "isConsumingScheduledOp",
    });
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
      functionName: "isDerivativeApproved",
      args: [request.parentIpId, request.licenseTermsId, request.childIpId],
    });
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
      functionName: "isLicenseTransferable",
      args: [request.licenseTermsId],
    });
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
      functionName: "name",
    });
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
      functionName: "proxiableUUID",
    });
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
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
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
      functionName: "toJson",
      args: [request.licenseTermsId],
    });
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
      functionName: "totalRegisteredLicenseTerms",
    });
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
      functionName: "verifyCompatibleLicenses",
      args: [request.licenseTermsIds],
    });
  }
}

/**
 * contract PILicenseTemplate write method
 */
export class PiLicenseTemplateClient extends PiLicenseTemplateReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
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
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.accessManager, request.name, request.metadataURI],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: PiLicenseTemplateInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "initialize",
        args: [request.accessManager, request.name, request.metadataURI],
      }),
    };
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
      functionName: "registerLicenseTerms",
      account: this.wallet.account,
      args: [request.terms],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerLicenseTerms for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateRegisterLicenseTermsRequest
   * @return EncodedTxData
   */
  public registerLicenseTermsEncode(
    request: PiLicenseTemplateRegisterLicenseTermsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "registerLicenseTerms",
        args: [request.terms],
      }),
    };
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
      functionName: "setApproval",
      account: this.wallet.account,
      args: [request.parentIpId, request.licenseTermsId, request.childIpId, request.approved],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setApproval for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateSetApprovalRequest
   * @return EncodedTxData
   */
  public setApprovalEncode(request: PiLicenseTemplateSetApprovalRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "setApproval",
        args: [request.parentIpId, request.licenseTermsId, request.childIpId, request.approved],
      }),
    };
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
      functionName: "setAuthority",
      account: this.wallet.account,
      args: [request.newAuthority],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAuthority for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateSetAuthorityRequest
   * @return EncodedTxData
   */
  public setAuthorityEncode(request: PiLicenseTemplateSetAuthorityRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "setAuthority",
        args: [request.newAuthority],
      }),
    };
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
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateUpgradeToAndCallRequest
   * @return EncodedTxData
   */
  public upgradeToAndCallEncode(request: PiLicenseTemplateUpgradeToAndCallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "upgradeToAndCall",
        args: [request.newImplementation, request.data],
      }),
    };
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
      functionName: "verifyMintLicenseToken",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3]],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method verifyMintLicenseToken for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateVerifyMintLicenseTokenRequest
   * @return EncodedTxData
   */
  public verifyMintLicenseTokenEncode(
    request: PiLicenseTemplateVerifyMintLicenseTokenRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "verifyMintLicenseToken",
        args: [request[0], request[1], request[2], request[3]],
      }),
    };
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
      functionName: "verifyRegisterDerivative",
      account: this.wallet.account,
      args: [request.childIpId, request.parentIpId, request.licenseTermsId, request.licensee],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method verifyRegisterDerivative for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateVerifyRegisterDerivativeRequest
   * @return EncodedTxData
   */
  public verifyRegisterDerivativeEncode(
    request: PiLicenseTemplateVerifyRegisterDerivativeRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "verifyRegisterDerivative",
        args: [request.childIpId, request.parentIpId, request.licenseTermsId, request.licensee],
      }),
    };
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
      functionName: "verifyRegisterDerivativeForAllParents",
      account: this.wallet.account,
      args: [request.childIpId, request.parentIpIds, request.licenseTermsIds, request.childIpOwner],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method verifyRegisterDerivativeForAllParents for contract PILicenseTemplate with only encode
   *
   * @param request PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest
   * @return EncodedTxData
   */
  public verifyRegisterDerivativeForAllParentsEncode(
    request: PiLicenseTemplateVerifyRegisterDerivativeForAllParentsRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: piLicenseTemplateAbi,
        functionName: "verifyRegisterDerivativeForAllParents",
        args: [
          request.childIpId,
          request.parentIpIds,
          request.licenseTermsIds,
          request.childIpOwner,
        ],
      }),
    };
  }
}

// Contract RegistrationWorkflows =============================================================

/**
 * RegistrationWorkflowsCollectionCreatedEvent
 *
 * @param spgNftContract address
 */
export type RegistrationWorkflowsCollectionCreatedEvent = {
  spgNftContract: Address;
};

/**
 * RegistrationWorkflowsCreateCollectionRequest
 *
 * @param spgNftInitParams tuple
 */
export type RegistrationWorkflowsCreateCollectionRequest = {
  spgNftInitParams: {
    name: string;
    symbol: string;
    baseURI: string;
    contractURI: string;
    maxSupply: number;
    mintFee: bigint;
    mintFeeToken: Address;
    mintFeeRecipient: Address;
    owner: Address;
    mintOpen: boolean;
    isPublicMinting: boolean;
  };
};

/**
 * RegistrationWorkflowsMintAndRegisterIpRequest
 *
 * @param spgNftContract address
 * @param recipient address
 * @param ipMetadata tuple
 */
export type RegistrationWorkflowsMintAndRegisterIpRequest = {
  spgNftContract: Address;
  recipient: Address;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
};

/**
 * RegistrationWorkflowsMulticallRequest
 *
 * @param data bytes[]
 */
export type RegistrationWorkflowsMulticallRequest = {
  data: readonly Hex[];
};

/**
 * RegistrationWorkflowsRegisterIpRequest
 *
 * @param nftContract address
 * @param tokenId uint256
 * @param ipMetadata tuple
 * @param sigMetadata tuple
 */
export type RegistrationWorkflowsRegisterIpRequest = {
  nftContract: Address;
  tokenId: bigint;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: Hex;
    nftMetadataURI: string;
    nftMetadataHash: Hex;
  };
  sigMetadata: {
    signer: Address;
    deadline: bigint;
    signature: Hex;
  };
};

/**
 * contract RegistrationWorkflows event
 */
export class RegistrationWorkflowsEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(registrationWorkflowsAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event CollectionCreated for contract RegistrationWorkflows
   */
  public watchCollectionCreatedEvent(
    onLogs: (txHash: Hex, ev: Partial<RegistrationWorkflowsCollectionCreatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: registrationWorkflowsAbi,
      address: this.address,
      eventName: "CollectionCreated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event CollectionCreated for contract RegistrationWorkflows
   */
  public parseTxCollectionCreatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<RegistrationWorkflowsCollectionCreatedEvent> {
    const targetLogs: Array<RegistrationWorkflowsCollectionCreatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: registrationWorkflowsAbi,
          eventName: "CollectionCreated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "CollectionCreated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract RegistrationWorkflows write method
 */
export class RegistrationWorkflowsClient extends RegistrationWorkflowsEventClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method createCollection for contract RegistrationWorkflows
   *
   * @param request RegistrationWorkflowsCreateCollectionRequest
   * @return Promise<WriteContractReturnType>
   */
  public async createCollection(
    request: RegistrationWorkflowsCreateCollectionRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationWorkflowsAbi,
      address: this.address,
      functionName: "createCollection",
      account: this.wallet.account,
      args: [request.spgNftInitParams],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method createCollection for contract RegistrationWorkflows with only encode
   *
   * @param request RegistrationWorkflowsCreateCollectionRequest
   * @return EncodedTxData
   */
  public createCollectionEncode(
    request: RegistrationWorkflowsCreateCollectionRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: registrationWorkflowsAbi,
        functionName: "createCollection",
        args: [request.spgNftInitParams],
      }),
    };
  }

  /**
   * method mintAndRegisterIp for contract RegistrationWorkflows
   *
   * @param request RegistrationWorkflowsMintAndRegisterIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintAndRegisterIp(
    request: RegistrationWorkflowsMintAndRegisterIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationWorkflowsAbi,
      address: this.address,
      functionName: "mintAndRegisterIp",
      account: this.wallet.account,
      args: [request.spgNftContract, request.recipient, request.ipMetadata],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintAndRegisterIp for contract RegistrationWorkflows with only encode
   *
   * @param request RegistrationWorkflowsMintAndRegisterIpRequest
   * @return EncodedTxData
   */
  public mintAndRegisterIpEncode(
    request: RegistrationWorkflowsMintAndRegisterIpRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: registrationWorkflowsAbi,
        functionName: "mintAndRegisterIp",
        args: [request.spgNftContract, request.recipient, request.ipMetadata],
      }),
    };
  }

  /**
   * method multicall for contract RegistrationWorkflows
   *
   * @param request RegistrationWorkflowsMulticallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async multicall(
    request: RegistrationWorkflowsMulticallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationWorkflowsAbi,
      address: this.address,
      functionName: "multicall",
      account: this.wallet.account,
      args: [request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method multicall for contract RegistrationWorkflows with only encode
   *
   * @param request RegistrationWorkflowsMulticallRequest
   * @return EncodedTxData
   */
  public multicallEncode(request: RegistrationWorkflowsMulticallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: registrationWorkflowsAbi,
        functionName: "multicall",
        args: [request.data],
      }),
    };
  }

  /**
   * method registerIp for contract RegistrationWorkflows
   *
   * @param request RegistrationWorkflowsRegisterIpRequest
   * @return Promise<WriteContractReturnType>
   */
  public async registerIp(
    request: RegistrationWorkflowsRegisterIpRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: registrationWorkflowsAbi,
      address: this.address,
      functionName: "registerIp",
      account: this.wallet.account,
      args: [request.nftContract, request.tokenId, request.ipMetadata, request.sigMetadata],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method registerIp for contract RegistrationWorkflows with only encode
   *
   * @param request RegistrationWorkflowsRegisterIpRequest
   * @return EncodedTxData
   */
  public registerIpEncode(request: RegistrationWorkflowsRegisterIpRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: registrationWorkflowsAbi,
        functionName: "registerIp",
        args: [request.nftContract, request.tokenId, request.ipMetadata, request.sigMetadata],
      }),
    };
  }
}

// Contract RoyaltyModule =============================================================

/**
 * RoyaltyModuleIpRoyaltyVaultsRequest
 *
 * @param ipId address
 */
export type RoyaltyModuleIpRoyaltyVaultsRequest = {
  ipId: Address;
};

export type RoyaltyModuleIpRoyaltyVaultsResponse = Address;

/**
 * RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest
 *
 * @param royaltyPolicy address
 */
export type RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest = {
  royaltyPolicy: Address;
};

export type RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse = boolean;

/**
 * RoyaltyModuleIsWhitelistedRoyaltyTokenRequest
 *
 * @param token address
 */
export type RoyaltyModuleIsWhitelistedRoyaltyTokenRequest = {
  token: Address;
};

export type RoyaltyModuleIsWhitelistedRoyaltyTokenResponse = boolean;

/**
 * RoyaltyModulePayRoyaltyOnBehalfRequest
 *
 * @param receiverIpId address
 * @param payerIpId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyModulePayRoyaltyOnBehalfRequest = {
  receiverIpId: Address;
  payerIpId: Address;
  token: Address;
  amount: bigint;
};

/**
 * contract RoyaltyModule readonly method
 */
export class RoyaltyModuleReadOnlyClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(royaltyModuleAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * method ipRoyaltyVaults for contract RoyaltyModule
   *
   * @param request RoyaltyModuleIpRoyaltyVaultsRequest
   * @return Promise<RoyaltyModuleIpRoyaltyVaultsResponse>
   */
  public async ipRoyaltyVaults(
    request: RoyaltyModuleIpRoyaltyVaultsRequest,
  ): Promise<RoyaltyModuleIpRoyaltyVaultsResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "ipRoyaltyVaults",
      args: [request.ipId],
    });
  }

  /**
   * method isWhitelistedRoyaltyPolicy for contract RoyaltyModule
   *
   * @param request RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest
   * @return Promise<RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse>
   */
  public async isWhitelistedRoyaltyPolicy(
    request: RoyaltyModuleIsWhitelistedRoyaltyPolicyRequest,
  ): Promise<RoyaltyModuleIsWhitelistedRoyaltyPolicyResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "isWhitelistedRoyaltyPolicy",
      args: [request.royaltyPolicy],
    });
  }

  /**
   * method isWhitelistedRoyaltyToken for contract RoyaltyModule
   *
   * @param request RoyaltyModuleIsWhitelistedRoyaltyTokenRequest
   * @return Promise<RoyaltyModuleIsWhitelistedRoyaltyTokenResponse>
   */
  public async isWhitelistedRoyaltyToken(
    request: RoyaltyModuleIsWhitelistedRoyaltyTokenRequest,
  ): Promise<RoyaltyModuleIsWhitelistedRoyaltyTokenResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyModuleAbi,
      address: this.address,
      functionName: "isWhitelistedRoyaltyToken",
      args: [request.token],
    });
  }
}

/**
 * contract RoyaltyModule write method
 */
export class RoyaltyModuleClient extends RoyaltyModuleReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
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
      functionName: "payRoyaltyOnBehalf",
      account: this.wallet.account,
      args: [request.receiverIpId, request.payerIpId, request.token, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method payRoyaltyOnBehalf for contract RoyaltyModule with only encode
   *
   * @param request RoyaltyModulePayRoyaltyOnBehalfRequest
   * @return EncodedTxData
   */
  public payRoyaltyOnBehalfEncode(request: RoyaltyModulePayRoyaltyOnBehalfRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyModuleAbi,
        functionName: "payRoyaltyOnBehalf",
        args: [request.receiverIpId, request.payerIpId, request.token, request.amount],
      }),
    };
  }
}

// Contract RoyaltyPolicyLAP =============================================================

// Contract RoyaltyPolicyLRP =============================================================

/**
 * RoyaltyPolicyLrpAuthorityUpdatedEvent
 *
 * @param authority address
 */
export type RoyaltyPolicyLrpAuthorityUpdatedEvent = {
  authority: Address;
};

/**
 * RoyaltyPolicyLrpInitializedEvent
 *
 * @param version uint64
 */
export type RoyaltyPolicyLrpInitializedEvent = {
  version: bigint;
};

/**
 * RoyaltyPolicyLrpPausedEvent
 *
 * @param account address
 */
export type RoyaltyPolicyLrpPausedEvent = {
  account: Address;
};

/**
 * RoyaltyPolicyLrpRevenueTransferredToVaultEvent
 *
 * @param ipId address
 * @param ancestorIpId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyPolicyLrpRevenueTransferredToVaultEvent = {
  ipId: Address;
  ancestorIpId: Address;
  token: Address;
  amount: bigint;
};

/**
 * RoyaltyPolicyLrpUnpausedEvent
 *
 * @param account address
 */
export type RoyaltyPolicyLrpUnpausedEvent = {
  account: Address;
};

/**
 * RoyaltyPolicyLrpUpgradedEvent
 *
 * @param implementation address
 */
export type RoyaltyPolicyLrpUpgradedEvent = {
  implementation: Address;
};

export type RoyaltyPolicyLrpIpGraphResponse = Address;

export type RoyaltyPolicyLrpIpGraphAclResponse = Address;

export type RoyaltyPolicyLrpRoyaltyModuleResponse = Address;

export type RoyaltyPolicyLrpUpgradeInterfaceVersionResponse = string;

export type RoyaltyPolicyLrpAuthorityResponse = Address;

/**
 * RoyaltyPolicyLrpGetPolicyRoyaltyStackRequest
 *
 * @param ipId address
 */
export type RoyaltyPolicyLrpGetPolicyRoyaltyStackRequest = {
  ipId: Address;
};

export type RoyaltyPolicyLrpGetPolicyRoyaltyStackResponse = number;

/**
 * RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkRequest
 *
 * @param ipId address
 * @param licensePercent uint32
 */
export type RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkRequest = {
  ipId: Address;
  licensePercent: number;
};

export type RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkResponse = number;

/**
 * RoyaltyPolicyLrpGetTransferredTokensRequest
 *
 * @param ipId address
 * @param ancestorIpId address
 * @param token address
 */
export type RoyaltyPolicyLrpGetTransferredTokensRequest = {
  ipId: Address;
  ancestorIpId: Address;
  token: Address;
};

export type RoyaltyPolicyLrpGetTransferredTokensResponse = bigint;

export type RoyaltyPolicyLrpIsConsumingScheduledOpResponse = Hex;

export type RoyaltyPolicyLrpPausedResponse = boolean;

export type RoyaltyPolicyLrpProxiableUuidResponse = Hex;

/**
 * RoyaltyPolicyLrpProtocolPausableInitRequest
 *
 * @param accessManager address
 */
export type RoyaltyPolicyLrpProtocolPausableInitRequest = {
  accessManager: Address;
};

/**
 * RoyaltyPolicyLrpGetPolicyRoyaltyRequest
 *
 * @param ipId address
 * @param ancestorIpId address
 */
export type RoyaltyPolicyLrpGetPolicyRoyaltyRequest = {
  ipId: Address;
  ancestorIpId: Address;
};

/**
 * RoyaltyPolicyLrpInitializeRequest
 *
 * @param accessManager address
 */
export type RoyaltyPolicyLrpInitializeRequest = {
  accessManager: Address;
};

/**
 * RoyaltyPolicyLrpOnLicenseMintingRequest
 *
 * @param 0 address
 * @param 1 uint32
 * @param 2 bytes
 */
export type RoyaltyPolicyLrpOnLicenseMintingRequest = readonly [Address, number, Hex];

/**
 * RoyaltyPolicyLrpOnLinkToParentsRequest
 *
 * @param 0 address
 * @param 1 address[]
 * @param 2 address[]
 * @param 3 uint32[]
 * @param 4 bytes
 */
export type RoyaltyPolicyLrpOnLinkToParentsRequest = readonly [
  Address,
  readonly Address[],
  readonly Address[],
  readonly number[],
  Hex,
];

/**
 * RoyaltyPolicyLrpSetAuthorityRequest
 *
 * @param newAuthority address
 */
export type RoyaltyPolicyLrpSetAuthorityRequest = {
  newAuthority: Address;
};

/**
 * RoyaltyPolicyLrpTransferToVaultRequest
 *
 * @param ipId address
 * @param ancestorIpId address
 * @param token address
 * @param amount uint256
 */
export type RoyaltyPolicyLrpTransferToVaultRequest = {
  ipId: Address;
  ancestorIpId: Address;
  token: Address;
  amount: bigint;
};

/**
 * RoyaltyPolicyLrpUpgradeToAndCallRequest
 *
 * @param newImplementation address
 * @param data bytes
 */
export type RoyaltyPolicyLrpUpgradeToAndCallRequest = {
  newImplementation: Address;
  data: Hex;
};

/**
 * contract RoyaltyPolicyLRP event
 */
export class RoyaltyPolicyLrpEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(royaltyPolicyLrpAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event AuthorityUpdated for contract RoyaltyPolicyLRP
   */
  public watchAuthorityUpdatedEvent(
    onLogs: (txHash: Hex, ev: Partial<RoyaltyPolicyLrpAuthorityUpdatedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      eventName: "AuthorityUpdated",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event AuthorityUpdated for contract RoyaltyPolicyLRP
   */
  public parseTxAuthorityUpdatedEvent(
    txReceipt: TransactionReceipt,
  ): Array<RoyaltyPolicyLrpAuthorityUpdatedEvent> {
    const targetLogs: Array<RoyaltyPolicyLrpAuthorityUpdatedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: royaltyPolicyLrpAbi,
          eventName: "AuthorityUpdated",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "AuthorityUpdated") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Initialized for contract RoyaltyPolicyLRP
   */
  public watchInitializedEvent(
    onLogs: (txHash: Hex, ev: Partial<RoyaltyPolicyLrpInitializedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract RoyaltyPolicyLRP
   */
  public parseTxInitializedEvent(
    txReceipt: TransactionReceipt,
  ): Array<RoyaltyPolicyLrpInitializedEvent> {
    const targetLogs: Array<RoyaltyPolicyLrpInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: royaltyPolicyLrpAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Paused for contract RoyaltyPolicyLRP
   */
  public watchPausedEvent(
    onLogs: (txHash: Hex, ev: Partial<RoyaltyPolicyLrpPausedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      eventName: "Paused",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Paused for contract RoyaltyPolicyLRP
   */
  public parseTxPausedEvent(txReceipt: TransactionReceipt): Array<RoyaltyPolicyLrpPausedEvent> {
    const targetLogs: Array<RoyaltyPolicyLrpPausedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: royaltyPolicyLrpAbi,
          eventName: "Paused",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Paused") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event RevenueTransferredToVault for contract RoyaltyPolicyLRP
   */
  public watchRevenueTransferredToVaultEvent(
    onLogs: (txHash: Hex, ev: Partial<RoyaltyPolicyLrpRevenueTransferredToVaultEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      eventName: "RevenueTransferredToVault",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RevenueTransferredToVault for contract RoyaltyPolicyLRP
   */
  public parseTxRevenueTransferredToVaultEvent(
    txReceipt: TransactionReceipt,
  ): Array<RoyaltyPolicyLrpRevenueTransferredToVaultEvent> {
    const targetLogs: Array<RoyaltyPolicyLrpRevenueTransferredToVaultEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: royaltyPolicyLrpAbi,
          eventName: "RevenueTransferredToVault",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RevenueTransferredToVault") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Unpaused for contract RoyaltyPolicyLRP
   */
  public watchUnpausedEvent(
    onLogs: (txHash: Hex, ev: Partial<RoyaltyPolicyLrpUnpausedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      eventName: "Unpaused",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Unpaused for contract RoyaltyPolicyLRP
   */
  public parseTxUnpausedEvent(txReceipt: TransactionReceipt): Array<RoyaltyPolicyLrpUnpausedEvent> {
    const targetLogs: Array<RoyaltyPolicyLrpUnpausedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: royaltyPolicyLrpAbi,
          eventName: "Unpaused",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Unpaused") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event Upgraded for contract RoyaltyPolicyLRP
   */
  public watchUpgradedEvent(
    onLogs: (txHash: Hex, ev: Partial<RoyaltyPolicyLrpUpgradedEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract RoyaltyPolicyLRP
   */
  public parseTxUpgradedEvent(txReceipt: TransactionReceipt): Array<RoyaltyPolicyLrpUpgradedEvent> {
    const targetLogs: Array<RoyaltyPolicyLrpUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: royaltyPolicyLrpAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract RoyaltyPolicyLRP readonly method
 */
export class RoyaltyPolicyLrpReadOnlyClient extends RoyaltyPolicyLrpEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
  }

  /**
   * method IP_GRAPH for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpIpGraphRequest
   * @return Promise<RoyaltyPolicyLrpIpGraphResponse>
   */
  public async ipGraph(): Promise<RoyaltyPolicyLrpIpGraphResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "IP_GRAPH",
    });
  }

  /**
   * method IP_GRAPH_ACL for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpIpGraphAclRequest
   * @return Promise<RoyaltyPolicyLrpIpGraphAclResponse>
   */
  public async ipGraphAcl(): Promise<RoyaltyPolicyLrpIpGraphAclResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "IP_GRAPH_ACL",
    });
  }

  /**
   * method ROYALTY_MODULE for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpRoyaltyModuleRequest
   * @return Promise<RoyaltyPolicyLrpRoyaltyModuleResponse>
   */
  public async royaltyModule(): Promise<RoyaltyPolicyLrpRoyaltyModuleResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "ROYALTY_MODULE",
    });
  }

  /**
   * method UPGRADE_INTERFACE_VERSION for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpUpgradeInterfaceVersionRequest
   * @return Promise<RoyaltyPolicyLrpUpgradeInterfaceVersionResponse>
   */
  public async upgradeInterfaceVersion(): Promise<RoyaltyPolicyLrpUpgradeInterfaceVersionResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "UPGRADE_INTERFACE_VERSION",
    });
  }

  /**
   * method authority for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpAuthorityRequest
   * @return Promise<RoyaltyPolicyLrpAuthorityResponse>
   */
  public async authority(): Promise<RoyaltyPolicyLrpAuthorityResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "authority",
    });
  }

  /**
   * method getPolicyRoyaltyStack for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpGetPolicyRoyaltyStackRequest
   * @return Promise<RoyaltyPolicyLrpGetPolicyRoyaltyStackResponse>
   */
  public async getPolicyRoyaltyStack(
    request: RoyaltyPolicyLrpGetPolicyRoyaltyStackRequest,
  ): Promise<RoyaltyPolicyLrpGetPolicyRoyaltyStackResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "getPolicyRoyaltyStack",
      args: [request.ipId],
    });
  }

  /**
   * method getPolicyRtsRequiredToLink for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkRequest
   * @return Promise<RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkResponse>
   */
  public async getPolicyRtsRequiredToLink(
    request: RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkRequest,
  ): Promise<RoyaltyPolicyLrpGetPolicyRtsRequiredToLinkResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "getPolicyRtsRequiredToLink",
      args: [request.ipId, request.licensePercent],
    });
  }

  /**
   * method getTransferredTokens for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpGetTransferredTokensRequest
   * @return Promise<RoyaltyPolicyLrpGetTransferredTokensResponse>
   */
  public async getTransferredTokens(
    request: RoyaltyPolicyLrpGetTransferredTokensRequest,
  ): Promise<RoyaltyPolicyLrpGetTransferredTokensResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "getTransferredTokens",
      args: [request.ipId, request.ancestorIpId, request.token],
    });
  }

  /**
   * method isConsumingScheduledOp for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpIsConsumingScheduledOpRequest
   * @return Promise<RoyaltyPolicyLrpIsConsumingScheduledOpResponse>
   */
  public async isConsumingScheduledOp(): Promise<RoyaltyPolicyLrpIsConsumingScheduledOpResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "isConsumingScheduledOp",
    });
  }

  /**
   * method paused for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpPausedRequest
   * @return Promise<RoyaltyPolicyLrpPausedResponse>
   */
  public async paused(): Promise<RoyaltyPolicyLrpPausedResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "paused",
    });
  }

  /**
   * method proxiableUUID for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpProxiableUuidRequest
   * @return Promise<RoyaltyPolicyLrpProxiableUuidResponse>
   */
  public async proxiableUuid(): Promise<RoyaltyPolicyLrpProxiableUuidResponse> {
    return await this.rpcClient.readContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "proxiableUUID",
    });
  }
}

/**
 * contract RoyaltyPolicyLRP write method
 */
export class RoyaltyPolicyLrpClient extends RoyaltyPolicyLrpReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method __ProtocolPausable_init for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpProtocolPausableInitRequest
   * @return Promise<WriteContractReturnType>
   */
  public async protocolPausableInit(
    request: RoyaltyPolicyLrpProtocolPausableInitRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "__ProtocolPausable_init",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method __ProtocolPausable_init for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpProtocolPausableInitRequest
   * @return EncodedTxData
   */
  public protocolPausableInitEncode(
    request: RoyaltyPolicyLrpProtocolPausableInitRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "__ProtocolPausable_init",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method getPolicyRoyalty for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpGetPolicyRoyaltyRequest
   * @return Promise<WriteContractReturnType>
   */
  public async getPolicyRoyalty(
    request: RoyaltyPolicyLrpGetPolicyRoyaltyRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "getPolicyRoyalty",
      account: this.wallet.account,
      args: [request.ipId, request.ancestorIpId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method getPolicyRoyalty for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpGetPolicyRoyaltyRequest
   * @return EncodedTxData
   */
  public getPolicyRoyaltyEncode(request: RoyaltyPolicyLrpGetPolicyRoyaltyRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "getPolicyRoyalty",
        args: [request.ipId, request.ancestorIpId],
      }),
    };
  }

  /**
   * method initialize for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(
    request: RoyaltyPolicyLrpInitializeRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.accessManager],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: RoyaltyPolicyLrpInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "initialize",
        args: [request.accessManager],
      }),
    };
  }

  /**
   * method onLicenseMinting for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpOnLicenseMintingRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onLicenseMinting(
    request: RoyaltyPolicyLrpOnLicenseMintingRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "onLicenseMinting",
      account: this.wallet.account,
      args: [request[0], request[1], request[2]],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method onLicenseMinting for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpOnLicenseMintingRequest
   * @return EncodedTxData
   */
  public onLicenseMintingEncode(request: RoyaltyPolicyLrpOnLicenseMintingRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "onLicenseMinting",
        args: [request[0], request[1], request[2]],
      }),
    };
  }

  /**
   * method onLinkToParents for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpOnLinkToParentsRequest
   * @return Promise<WriteContractReturnType>
   */
  public async onLinkToParents(
    request: RoyaltyPolicyLrpOnLinkToParentsRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "onLinkToParents",
      account: this.wallet.account,
      args: [request[0], request[1], request[2], request[3], request[4]],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method onLinkToParents for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpOnLinkToParentsRequest
   * @return EncodedTxData
   */
  public onLinkToParentsEncode(request: RoyaltyPolicyLrpOnLinkToParentsRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "onLinkToParents",
        args: [request[0], request[1], request[2], request[3], request[4]],
      }),
    };
  }

  /**
   * method pause for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpPauseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async pause(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "pause",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method pause for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpPauseRequest
   * @return EncodedTxData
   */
  public pauseEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "pause",
      }),
    };
  }

  /**
   * method setAuthority for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpSetAuthorityRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setAuthority(
    request: RoyaltyPolicyLrpSetAuthorityRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "setAuthority",
      account: this.wallet.account,
      args: [request.newAuthority],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setAuthority for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpSetAuthorityRequest
   * @return EncodedTxData
   */
  public setAuthorityEncode(request: RoyaltyPolicyLrpSetAuthorityRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "setAuthority",
        args: [request.newAuthority],
      }),
    };
  }

  /**
   * method transferToVault for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpTransferToVaultRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferToVault(
    request: RoyaltyPolicyLrpTransferToVaultRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "transferToVault",
      account: this.wallet.account,
      args: [request.ipId, request.ancestorIpId, request.token, request.amount],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transferToVault for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpTransferToVaultRequest
   * @return EncodedTxData
   */
  public transferToVaultEncode(request: RoyaltyPolicyLrpTransferToVaultRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "transferToVault",
        args: [request.ipId, request.ancestorIpId, request.token, request.amount],
      }),
    };
  }

  /**
   * method unpause for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpUnpauseRequest
   * @return Promise<WriteContractReturnType>
   */
  public async unpause(): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "unpause",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method unpause for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpUnpauseRequest
   * @return EncodedTxData
   */
  public unpauseEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "unpause",
      }),
    };
  }

  /**
   * method upgradeToAndCall for contract RoyaltyPolicyLRP
   *
   * @param request RoyaltyPolicyLrpUpgradeToAndCallRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeToAndCall(
    request: RoyaltyPolicyLrpUpgradeToAndCallRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyPolicyLrpAbi,
      address: this.address,
      functionName: "upgradeToAndCall",
      account: this.wallet.account,
      args: [request.newImplementation, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeToAndCall for contract RoyaltyPolicyLRP with only encode
   *
   * @param request RoyaltyPolicyLrpUpgradeToAndCallRequest
   * @return EncodedTxData
   */
  public upgradeToAndCallEncode(request: RoyaltyPolicyLrpUpgradeToAndCallRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyPolicyLrpAbi,
        functionName: "upgradeToAndCall",
        args: [request.newImplementation, request.data],
      }),
    };
  }
}

// Contract RoyaltyWorkflows =============================================================

/**
 * RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest
 *
 * @param ipId address
 * @param claimer address
 * @param unclaimedSnapshotIds uint256[]
 * @param currencyTokens address[]
 */
export type RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest = {
  ipId: Address;
  claimer: Address;
  unclaimedSnapshotIds: readonly bigint[];
  currencyTokens: readonly Address[];
};

/**
 * RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest
 *
 * @param ipId address
 * @param claimer address
 * @param currencyTokens address[]
 */
export type RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest = {
  ipId: Address;
  claimer: Address;
  currencyTokens: readonly Address[];
};

/**
 * RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest
 *
 * @param ancestorIpId address
 * @param claimer address
 * @param unclaimedSnapshotIds uint256[]
 * @param royaltyClaimDetails tuple[]
 */
export type RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest = {
  ancestorIpId: Address;
  claimer: Address;
  unclaimedSnapshotIds: readonly bigint[];
  royaltyClaimDetails: {
    childIpId: Address;
    royaltyPolicy: Address;
    currencyToken: Address;
    amount: bigint;
  }[];
};

/**
 * RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest
 *
 * @param ancestorIpId address
 * @param claimer address
 * @param royaltyClaimDetails tuple[]
 */
export type RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest = {
  ancestorIpId: Address;
  claimer: Address;
  royaltyClaimDetails: {
    childIpId: Address;
    royaltyPolicy: Address;
    currencyToken: Address;
    amount: bigint;
  }[];
};

/**
 * contract RoyaltyWorkflows write method
 */
export class RoyaltyWorkflowsClient {
  protected readonly wallet: SimpleWalletClient;
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    this.address = address || getAddress(royaltyWorkflowsAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * method snapshotAndClaimBySnapshotBatch for contract RoyaltyWorkflows
   *
   * @param request RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async snapshotAndClaimBySnapshotBatch(
    request: RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyWorkflowsAbi,
      address: this.address,
      functionName: "snapshotAndClaimBySnapshotBatch",
      account: this.wallet.account,
      args: [request.ipId, request.claimer, request.unclaimedSnapshotIds, request.currencyTokens],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method snapshotAndClaimBySnapshotBatch for contract RoyaltyWorkflows with only encode
   *
   * @param request RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest
   * @return EncodedTxData
   */
  public snapshotAndClaimBySnapshotBatchEncode(
    request: RoyaltyWorkflowsSnapshotAndClaimBySnapshotBatchRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyWorkflowsAbi,
        functionName: "snapshotAndClaimBySnapshotBatch",
        args: [request.ipId, request.claimer, request.unclaimedSnapshotIds, request.currencyTokens],
      }),
    };
  }

  /**
   * method snapshotAndClaimByTokenBatch for contract RoyaltyWorkflows
   *
   * @param request RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async snapshotAndClaimByTokenBatch(
    request: RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyWorkflowsAbi,
      address: this.address,
      functionName: "snapshotAndClaimByTokenBatch",
      account: this.wallet.account,
      args: [request.ipId, request.claimer, request.currencyTokens],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method snapshotAndClaimByTokenBatch for contract RoyaltyWorkflows with only encode
   *
   * @param request RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest
   * @return EncodedTxData
   */
  public snapshotAndClaimByTokenBatchEncode(
    request: RoyaltyWorkflowsSnapshotAndClaimByTokenBatchRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyWorkflowsAbi,
        functionName: "snapshotAndClaimByTokenBatch",
        args: [request.ipId, request.claimer, request.currencyTokens],
      }),
    };
  }

  /**
   * method transferToVaultAndSnapshotAndClaimBySnapshotBatch for contract RoyaltyWorkflows
   *
   * @param request RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferToVaultAndSnapshotAndClaimBySnapshotBatch(
    request: RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyWorkflowsAbi,
      address: this.address,
      functionName: "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
      account: this.wallet.account,
      args: [
        request.ancestorIpId,
        request.claimer,
        request.unclaimedSnapshotIds,
        request.royaltyClaimDetails,
      ],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transferToVaultAndSnapshotAndClaimBySnapshotBatch for contract RoyaltyWorkflows with only encode
   *
   * @param request RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest
   * @return EncodedTxData
   */
  public transferToVaultAndSnapshotAndClaimBySnapshotBatchEncode(
    request: RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimBySnapshotBatchRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyWorkflowsAbi,
        functionName: "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
        args: [
          request.ancestorIpId,
          request.claimer,
          request.unclaimedSnapshotIds,
          request.royaltyClaimDetails,
        ],
      }),
    };
  }

  /**
   * method transferToVaultAndSnapshotAndClaimByTokenBatch for contract RoyaltyWorkflows
   *
   * @param request RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest
   * @return Promise<WriteContractReturnType>
   */
  public async transferToVaultAndSnapshotAndClaimByTokenBatch(
    request: RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: royaltyWorkflowsAbi,
      address: this.address,
      functionName: "transferToVaultAndSnapshotAndClaimByTokenBatch",
      account: this.wallet.account,
      args: [request.ancestorIpId, request.claimer, request.royaltyClaimDetails],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transferToVaultAndSnapshotAndClaimByTokenBatch for contract RoyaltyWorkflows with only encode
   *
   * @param request RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest
   * @return EncodedTxData
   */
  public transferToVaultAndSnapshotAndClaimByTokenBatchEncode(
    request: RoyaltyWorkflowsTransferToVaultAndSnapshotAndClaimByTokenBatchRequest,
  ): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: royaltyWorkflowsAbi,
        functionName: "transferToVaultAndSnapshotAndClaimByTokenBatch",
        args: [request.ancestorIpId, request.claimer, request.royaltyClaimDetails],
      }),
    };
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
  previousOwner: Address;
  newOwner: Address;
};

/**
 * SpgnftBeaconUpgradedEvent
 *
 * @param implementation address
 */
export type SpgnftBeaconUpgradedEvent = {
  implementation: Address;
};

export type SpgnftBeaconImplementationResponse = Address;

export type SpgnftBeaconOwnerResponse = Address;

/**
 * SpgnftBeaconTransferOwnershipRequest
 *
 * @param newOwner address
 */
export type SpgnftBeaconTransferOwnershipRequest = {
  newOwner: Address;
};

/**
 * SpgnftBeaconUpgradeToRequest
 *
 * @param newImplementation address
 */
export type SpgnftBeaconUpgradeToRequest = {
  newImplementation: Address;
};

/**
 * contract SPGNFTBeacon event
 */
export class SpgnftBeaconEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(spgnftBeaconAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
  }

  /**
   * event OwnershipTransferred for contract SPGNFTBeacon
   */
  public watchOwnershipTransferredEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftBeaconOwnershipTransferredEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftBeaconAbi,
      address: this.address,
      eventName: "OwnershipTransferred",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event OwnershipTransferred for contract SPGNFTBeacon
   */
  public parseTxOwnershipTransferredEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftBeaconOwnershipTransferredEvent> {
    const targetLogs: Array<SpgnftBeaconOwnershipTransferredEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftBeaconAbi,
          eventName: "OwnershipTransferred",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "OwnershipTransferred") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "Upgraded",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Upgraded for contract SPGNFTBeacon
   */
  public parseTxUpgradedEvent(txReceipt: TransactionReceipt): Array<SpgnftBeaconUpgradedEvent> {
    const targetLogs: Array<SpgnftBeaconUpgradedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftBeaconAbi,
          eventName: "Upgraded",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Upgraded") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract SPGNFTBeacon readonly method
 */
export class SpgnftBeaconReadOnlyClient extends SpgnftBeaconEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
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
      functionName: "implementation",
    });
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
      functionName: "owner",
    });
  }
}

/**
 * contract SPGNFTBeacon write method
 */
export class SpgnftBeaconClient extends SpgnftBeaconReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
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
      functionName: "renounceOwnership",
      account: this.wallet.account,
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method renounceOwnership for contract SPGNFTBeacon with only encode
   *
   * @param request SpgnftBeaconRenounceOwnershipRequest
   * @return EncodedTxData
   */
  public renounceOwnershipEncode(): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftBeaconAbi,
        functionName: "renounceOwnership",
      }),
    };
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
      functionName: "transferOwnership",
      account: this.wallet.account,
      args: [request.newOwner],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transferOwnership for contract SPGNFTBeacon with only encode
   *
   * @param request SpgnftBeaconTransferOwnershipRequest
   * @return EncodedTxData
   */
  public transferOwnershipEncode(request: SpgnftBeaconTransferOwnershipRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftBeaconAbi,
        functionName: "transferOwnership",
        args: [request.newOwner],
      }),
    };
  }

  /**
   * method upgradeTo for contract SPGNFTBeacon
   *
   * @param request SpgnftBeaconUpgradeToRequest
   * @return Promise<WriteContractReturnType>
   */
  public async upgradeTo(request: SpgnftBeaconUpgradeToRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftBeaconAbi,
      address: this.address,
      functionName: "upgradeTo",
      account: this.wallet.account,
      args: [request.newImplementation],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method upgradeTo for contract SPGNFTBeacon with only encode
   *
   * @param request SpgnftBeaconUpgradeToRequest
   * @return EncodedTxData
   */
  public upgradeToEncode(request: SpgnftBeaconUpgradeToRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftBeaconAbi,
        functionName: "upgradeTo",
        args: [request.newImplementation],
      }),
    };
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
  owner: Address;
  approved: Address;
  tokenId: bigint;
};

/**
 * SpgnftImplApprovalForAllEvent
 *
 * @param owner address
 * @param operator address
 * @param approved bool
 */
export type SpgnftImplApprovalForAllEvent = {
  owner: Address;
  operator: Address;
  approved: boolean;
};

/**
 * SpgnftImplBatchMetadataUpdateEvent
 *
 * @param _fromTokenId uint256
 * @param _toTokenId uint256
 */
export type SpgnftImplBatchMetadataUpdateEvent = {
  _fromTokenId: bigint;
  _toTokenId: bigint;
};

/**
 * SpgnftImplInitializedEvent
 *
 * @param version uint64
 */
export type SpgnftImplInitializedEvent = {
  version: bigint;
};

/**
 * SpgnftImplMetadataUpdateEvent
 *
 * @param _tokenId uint256
 */
export type SpgnftImplMetadataUpdateEvent = {
  _tokenId: bigint;
};

/**
 * SpgnftImplRoleAdminChangedEvent
 *
 * @param role bytes32
 * @param previousAdminRole bytes32
 * @param newAdminRole bytes32
 */
export type SpgnftImplRoleAdminChangedEvent = {
  role: Hex;
  previousAdminRole: Hex;
  newAdminRole: Hex;
};

/**
 * SpgnftImplRoleGrantedEvent
 *
 * @param role bytes32
 * @param account address
 * @param sender address
 */
export type SpgnftImplRoleGrantedEvent = {
  role: Hex;
  account: Address;
  sender: Address;
};

/**
 * SpgnftImplRoleRevokedEvent
 *
 * @param role bytes32
 * @param account address
 * @param sender address
 */
export type SpgnftImplRoleRevokedEvent = {
  role: Hex;
  account: Address;
  sender: Address;
};

/**
 * SpgnftImplTransferEvent
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplTransferEvent = {
  from: Address;
  to: Address;
  tokenId: bigint;
};

export type SpgnftImplDefaultAdminRoleResponse = Hex;

export type SpgnftImplDerivativeWorkflowsAddressResponse = Address;

export type SpgnftImplGroupingWorkflowsAddressResponse = Address;

export type SpgnftImplLicenseAttachmentWorkflowsAddressResponse = Address;

export type SpgnftImplRegistrationWorkflowsAddressResponse = Address;

/**
 * SpgnftImplBalanceOfRequest
 *
 * @param owner address
 */
export type SpgnftImplBalanceOfRequest = {
  owner: Address;
};

export type SpgnftImplBalanceOfResponse = bigint;

export type SpgnftImplBaseUriResponse = string;

export type SpgnftImplContractUriResponse = string;

/**
 * SpgnftImplGetApprovedRequest
 *
 * @param tokenId uint256
 */
export type SpgnftImplGetApprovedRequest = {
  tokenId: bigint;
};

export type SpgnftImplGetApprovedResponse = Address;

/**
 * SpgnftImplGetRoleAdminRequest
 *
 * @param role bytes32
 */
export type SpgnftImplGetRoleAdminRequest = {
  role: Hex;
};

export type SpgnftImplGetRoleAdminResponse = Hex;

/**
 * SpgnftImplHasRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type SpgnftImplHasRoleRequest = {
  role: Hex;
  account: Address;
};

export type SpgnftImplHasRoleResponse = boolean;

/**
 * SpgnftImplIsApprovedForAllRequest
 *
 * @param owner address
 * @param operator address
 */
export type SpgnftImplIsApprovedForAllRequest = {
  owner: Address;
  operator: Address;
};

export type SpgnftImplIsApprovedForAllResponse = boolean;

export type SpgnftImplMintFeeResponse = bigint;

export type SpgnftImplMintFeeRecipientResponse = Address;

export type SpgnftImplMintFeeTokenResponse = Address;

export type SpgnftImplMintOpenResponse = boolean;

export type SpgnftImplNameResponse = string;

/**
 * SpgnftImplOwnerOfRequest
 *
 * @param tokenId uint256
 */
export type SpgnftImplOwnerOfRequest = {
  tokenId: bigint;
};

export type SpgnftImplOwnerOfResponse = Address;

export type SpgnftImplPublicMintingResponse = boolean;

/**
 * SpgnftImplSupportsInterfaceRequest
 *
 * @param interfaceId bytes4
 */
export type SpgnftImplSupportsInterfaceRequest = {
  interfaceId: Hex;
};

export type SpgnftImplSupportsInterfaceResponse = boolean;

export type SpgnftImplSymbolResponse = string;

/**
 * SpgnftImplTokenUriRequest
 *
 * @param tokenId uint256
 */
export type SpgnftImplTokenUriRequest = {
  tokenId: bigint;
};

export type SpgnftImplTokenUriResponse = string;

export type SpgnftImplTotalSupplyResponse = bigint;

/**
 * SpgnftImplApproveRequest
 *
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplApproveRequest = {
  to: Address;
  tokenId: bigint;
};

/**
 * SpgnftImplGrantRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type SpgnftImplGrantRoleRequest = {
  role: Hex;
  account: Address;
};

/**
 * SpgnftImplInitializeRequest
 *
 * @param initParams tuple
 */
export type SpgnftImplInitializeRequest = {
  initParams: {
    name: string;
    symbol: string;
    baseURI: string;
    contractURI: string;
    maxSupply: number;
    mintFee: bigint;
    mintFeeToken: Address;
    mintFeeRecipient: Address;
    owner: Address;
    mintOpen: boolean;
    isPublicMinting: boolean;
  };
};

/**
 * SpgnftImplMintRequest
 *
 * @param to address
 * @param nftMetadataURI string
 */
export type SpgnftImplMintRequest = {
  to: Address;
  nftMetadataURI: string;
};

/**
 * SpgnftImplMintByPeripheryRequest
 *
 * @param to address
 * @param payer address
 * @param nftMetadataURI string
 */
export type SpgnftImplMintByPeripheryRequest = {
  to: Address;
  payer: Address;
  nftMetadataURI: string;
};

/**
 * SpgnftImplRenounceRoleRequest
 *
 * @param role bytes32
 * @param callerConfirmation address
 */
export type SpgnftImplRenounceRoleRequest = {
  role: Hex;
  callerConfirmation: Address;
};

/**
 * SpgnftImplRevokeRoleRequest
 *
 * @param role bytes32
 * @param account address
 */
export type SpgnftImplRevokeRoleRequest = {
  role: Hex;
  account: Address;
};

/**
 * SpgnftImplSafeTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplSafeTransferFromRequest = {
  from: Address;
  to: Address;
  tokenId: bigint;
};

/**
 * SpgnftImplSafeTransferFrom2Request
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 * @param data bytes
 */
export type SpgnftImplSafeTransferFrom2Request = {
  from: Address;
  to: Address;
  tokenId: bigint;
  data: Hex;
};

/**
 * SpgnftImplSetApprovalForAllRequest
 *
 * @param operator address
 * @param approved bool
 */
export type SpgnftImplSetApprovalForAllRequest = {
  operator: Address;
  approved: boolean;
};

/**
 * SpgnftImplSetBaseUriRequest
 *
 * @param baseURI string
 */
export type SpgnftImplSetBaseUriRequest = {
  baseURI: string;
};

/**
 * SpgnftImplSetContractUriRequest
 *
 * @param contractURI string
 */
export type SpgnftImplSetContractUriRequest = {
  contractURI: string;
};

/**
 * SpgnftImplSetMintFeeRequest
 *
 * @param fee uint256
 */
export type SpgnftImplSetMintFeeRequest = {
  fee: bigint;
};

/**
 * SpgnftImplSetMintFeeRecipientRequest
 *
 * @param newFeeRecipient address
 */
export type SpgnftImplSetMintFeeRecipientRequest = {
  newFeeRecipient: Address;
};

/**
 * SpgnftImplSetMintFeeTokenRequest
 *
 * @param token address
 */
export type SpgnftImplSetMintFeeTokenRequest = {
  token: Address;
};

/**
 * SpgnftImplSetMintOpenRequest
 *
 * @param mintOpen bool
 */
export type SpgnftImplSetMintOpenRequest = {
  mintOpen: boolean;
};

/**
 * SpgnftImplSetPublicMintingRequest
 *
 * @param isPublicMinting bool
 */
export type SpgnftImplSetPublicMintingRequest = {
  isPublicMinting: boolean;
};

/**
 * SpgnftImplTransferFromRequest
 *
 * @param from address
 * @param to address
 * @param tokenId uint256
 */
export type SpgnftImplTransferFromRequest = {
  from: Address;
  to: Address;
  tokenId: bigint;
};

/**
 * SpgnftImplWithdrawTokenRequest
 *
 * @param token address
 */
export type SpgnftImplWithdrawTokenRequest = {
  token: Address;
};

/**
 * contract SPGNFTImpl event
 */
export class SpgnftImplEventClient {
  protected readonly rpcClient: PublicClient;
  public readonly address: Address;

  constructor(rpcClient: PublicClient, address?: Address) {
    this.address = address || getAddress(spgnftImplAddress, rpcClient.chain?.id);
    this.rpcClient = rpcClient;
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
      eventName: "Approval",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Approval for contract SPGNFTImpl
   */
  public parseTxApprovalEvent(txReceipt: TransactionReceipt): Array<SpgnftImplApprovalEvent> {
    const targetLogs: Array<SpgnftImplApprovalEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "Approval",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Approval") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "ApprovalForAll",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event ApprovalForAll for contract SPGNFTImpl
   */
  public parseTxApprovalForAllEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplApprovalForAllEvent> {
    const targetLogs: Array<SpgnftImplApprovalForAllEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "ApprovalForAll",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "ApprovalForAll") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event BatchMetadataUpdate for contract SPGNFTImpl
   */
  public watchBatchMetadataUpdateEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplBatchMetadataUpdateEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: "BatchMetadataUpdate",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event BatchMetadataUpdate for contract SPGNFTImpl
   */
  public parseTxBatchMetadataUpdateEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplBatchMetadataUpdateEvent> {
    const targetLogs: Array<SpgnftImplBatchMetadataUpdateEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "BatchMetadataUpdate",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "BatchMetadataUpdate") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "Initialized",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Initialized for contract SPGNFTImpl
   */
  public parseTxInitializedEvent(txReceipt: TransactionReceipt): Array<SpgnftImplInitializedEvent> {
    const targetLogs: Array<SpgnftImplInitializedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "Initialized",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Initialized") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }

  /**
   * event MetadataUpdate for contract SPGNFTImpl
   */
  public watchMetadataUpdateEvent(
    onLogs: (txHash: Hex, ev: Partial<SpgnftImplMetadataUpdateEvent>) => void,
  ): WatchContractEventReturnType {
    return this.rpcClient.watchContractEvent({
      abi: spgnftImplAbi,
      address: this.address,
      eventName: "MetadataUpdate",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event MetadataUpdate for contract SPGNFTImpl
   */
  public parseTxMetadataUpdateEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplMetadataUpdateEvent> {
    const targetLogs: Array<SpgnftImplMetadataUpdateEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "MetadataUpdate",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "MetadataUpdate") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "RoleAdminChanged",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RoleAdminChanged for contract SPGNFTImpl
   */
  public parseTxRoleAdminChangedEvent(
    txReceipt: TransactionReceipt,
  ): Array<SpgnftImplRoleAdminChangedEvent> {
    const targetLogs: Array<SpgnftImplRoleAdminChangedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "RoleAdminChanged",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RoleAdminChanged") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "RoleGranted",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RoleGranted for contract SPGNFTImpl
   */
  public parseTxRoleGrantedEvent(txReceipt: TransactionReceipt): Array<SpgnftImplRoleGrantedEvent> {
    const targetLogs: Array<SpgnftImplRoleGrantedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "RoleGranted",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RoleGranted") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "RoleRevoked",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event RoleRevoked for contract SPGNFTImpl
   */
  public parseTxRoleRevokedEvent(txReceipt: TransactionReceipt): Array<SpgnftImplRoleRevokedEvent> {
    const targetLogs: Array<SpgnftImplRoleRevokedEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "RoleRevoked",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "RoleRevoked") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
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
      eventName: "Transfer",
      onLogs: (evs) => {
        evs.forEach((it) => onLogs(it.transactionHash, it.args));
      },
    });
  }

  /**
   * parse tx receipt event Transfer for contract SPGNFTImpl
   */
  public parseTxTransferEvent(txReceipt: TransactionReceipt): Array<SpgnftImplTransferEvent> {
    const targetLogs: Array<SpgnftImplTransferEvent> = [];
    for (const log of txReceipt.logs) {
      try {
        const event = decodeEventLog({
          abi: spgnftImplAbi,
          eventName: "Transfer",
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "Transfer") {
          targetLogs.push(event.args);
        }
      } catch (e) {
        /* empty */
      }
    }
    return targetLogs;
  }
}

/**
 * contract SPGNFTImpl readonly method
 */
export class SpgnftImplReadOnlyClient extends SpgnftImplEventClient {
  constructor(rpcClient: PublicClient, address?: Address) {
    super(rpcClient, address);
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
      functionName: "DEFAULT_ADMIN_ROLE",
    });
  }

  /**
   * method DERIVATIVE_WORKFLOWS_ADDRESS for contract SPGNFTImpl
   *
   * @param request SpgnftImplDerivativeWorkflowsAddressRequest
   * @return Promise<SpgnftImplDerivativeWorkflowsAddressResponse>
   */
  public async derivativeWorkflowsAddress(): Promise<SpgnftImplDerivativeWorkflowsAddressResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "DERIVATIVE_WORKFLOWS_ADDRESS",
    });
  }

  /**
   * method GROUPING_WORKFLOWS_ADDRESS for contract SPGNFTImpl
   *
   * @param request SpgnftImplGroupingWorkflowsAddressRequest
   * @return Promise<SpgnftImplGroupingWorkflowsAddressResponse>
   */
  public async groupingWorkflowsAddress(): Promise<SpgnftImplGroupingWorkflowsAddressResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "GROUPING_WORKFLOWS_ADDRESS",
    });
  }

  /**
   * method LICENSE_ATTACHMENT_WORKFLOWS_ADDRESS for contract SPGNFTImpl
   *
   * @param request SpgnftImplLicenseAttachmentWorkflowsAddressRequest
   * @return Promise<SpgnftImplLicenseAttachmentWorkflowsAddressResponse>
   */
  public async licenseAttachmentWorkflowsAddress(): Promise<SpgnftImplLicenseAttachmentWorkflowsAddressResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "LICENSE_ATTACHMENT_WORKFLOWS_ADDRESS",
    });
  }

  /**
   * method REGISTRATION_WORKFLOWS_ADDRESS for contract SPGNFTImpl
   *
   * @param request SpgnftImplRegistrationWorkflowsAddressRequest
   * @return Promise<SpgnftImplRegistrationWorkflowsAddressResponse>
   */
  public async registrationWorkflowsAddress(): Promise<SpgnftImplRegistrationWorkflowsAddressResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "REGISTRATION_WORKFLOWS_ADDRESS",
    });
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
      functionName: "balanceOf",
      args: [request.owner],
    });
  }

  /**
   * method baseURI for contract SPGNFTImpl
   *
   * @param request SpgnftImplBaseUriRequest
   * @return Promise<SpgnftImplBaseUriResponse>
   */
  public async baseUri(): Promise<SpgnftImplBaseUriResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "baseURI",
    });
  }

  /**
   * method contractURI for contract SPGNFTImpl
   *
   * @param request SpgnftImplContractUriRequest
   * @return Promise<SpgnftImplContractUriResponse>
   */
  public async contractUri(): Promise<SpgnftImplContractUriResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "contractURI",
    });
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
      functionName: "getApproved",
      args: [request.tokenId],
    });
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
      functionName: "getRoleAdmin",
      args: [request.role],
    });
  }

  /**
   * method hasRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplHasRoleRequest
   * @return Promise<SpgnftImplHasRoleResponse>
   */
  public async hasRole(request: SpgnftImplHasRoleRequest): Promise<SpgnftImplHasRoleResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "hasRole",
      args: [request.role, request.account],
    });
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
      functionName: "isApprovedForAll",
      args: [request.owner, request.operator],
    });
  }

  /**
   * method mintFee for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintFeeRequest
   * @return Promise<SpgnftImplMintFeeResponse>
   */
  public async mintFee(): Promise<SpgnftImplMintFeeResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "mintFee",
    });
  }

  /**
   * method mintFeeRecipient for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintFeeRecipientRequest
   * @return Promise<SpgnftImplMintFeeRecipientResponse>
   */
  public async mintFeeRecipient(): Promise<SpgnftImplMintFeeRecipientResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "mintFeeRecipient",
    });
  }

  /**
   * method mintFeeToken for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintFeeTokenRequest
   * @return Promise<SpgnftImplMintFeeTokenResponse>
   */
  public async mintFeeToken(): Promise<SpgnftImplMintFeeTokenResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "mintFeeToken",
    });
  }

  /**
   * method mintOpen for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintOpenRequest
   * @return Promise<SpgnftImplMintOpenResponse>
   */
  public async mintOpen(): Promise<SpgnftImplMintOpenResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "mintOpen",
    });
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
      functionName: "name",
    });
  }

  /**
   * method ownerOf for contract SPGNFTImpl
   *
   * @param request SpgnftImplOwnerOfRequest
   * @return Promise<SpgnftImplOwnerOfResponse>
   */
  public async ownerOf(request: SpgnftImplOwnerOfRequest): Promise<SpgnftImplOwnerOfResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "ownerOf",
      args: [request.tokenId],
    });
  }

  /**
   * method publicMinting for contract SPGNFTImpl
   *
   * @param request SpgnftImplPublicMintingRequest
   * @return Promise<SpgnftImplPublicMintingResponse>
   */
  public async publicMinting(): Promise<SpgnftImplPublicMintingResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "publicMinting",
    });
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
      functionName: "supportsInterface",
      args: [request.interfaceId],
    });
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
      functionName: "symbol",
    });
  }

  /**
   * method tokenURI for contract SPGNFTImpl
   *
   * @param request SpgnftImplTokenUriRequest
   * @return Promise<SpgnftImplTokenUriResponse>
   */
  public async tokenUri(request: SpgnftImplTokenUriRequest): Promise<SpgnftImplTokenUriResponse> {
    return await this.rpcClient.readContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "tokenURI",
      args: [request.tokenId],
    });
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
      functionName: "totalSupply",
    });
  }
}

/**
 * contract SPGNFTImpl write method
 */
export class SpgnftImplClient extends SpgnftImplReadOnlyClient {
  protected readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {
    super(rpcClient, address);
    this.wallet = wallet;
  }

  /**
   * method approve for contract SPGNFTImpl
   *
   * @param request SpgnftImplApproveRequest
   * @return Promise<WriteContractReturnType>
   */
  public async approve(request: SpgnftImplApproveRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "approve",
      account: this.wallet.account,
      args: [request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method approve for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplApproveRequest
   * @return EncodedTxData
   */
  public approveEncode(request: SpgnftImplApproveRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "approve",
        args: [request.to, request.tokenId],
      }),
    };
  }

  /**
   * method grantRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplGrantRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async grantRole(request: SpgnftImplGrantRoleRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "grantRole",
      account: this.wallet.account,
      args: [request.role, request.account],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method grantRole for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplGrantRoleRequest
   * @return EncodedTxData
   */
  public grantRoleEncode(request: SpgnftImplGrantRoleRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "grantRole",
        args: [request.role, request.account],
      }),
    };
  }

  /**
   * method initialize for contract SPGNFTImpl
   *
   * @param request SpgnftImplInitializeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async initialize(request: SpgnftImplInitializeRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "initialize",
      account: this.wallet.account,
      args: [request.initParams],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method initialize for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplInitializeRequest
   * @return EncodedTxData
   */
  public initializeEncode(request: SpgnftImplInitializeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "initialize",
        args: [request.initParams],
      }),
    };
  }

  /**
   * method mint for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mint(request: SpgnftImplMintRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "mint",
      account: this.wallet.account,
      args: [request.to, request.nftMetadataURI],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mint for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplMintRequest
   * @return EncodedTxData
   */
  public mintEncode(request: SpgnftImplMintRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "mint",
        args: [request.to, request.nftMetadataURI],
      }),
    };
  }

  /**
   * method mintByPeriphery for contract SPGNFTImpl
   *
   * @param request SpgnftImplMintByPeripheryRequest
   * @return Promise<WriteContractReturnType>
   */
  public async mintByPeriphery(
    request: SpgnftImplMintByPeripheryRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "mintByPeriphery",
      account: this.wallet.account,
      args: [request.to, request.payer, request.nftMetadataURI],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method mintByPeriphery for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplMintByPeripheryRequest
   * @return EncodedTxData
   */
  public mintByPeripheryEncode(request: SpgnftImplMintByPeripheryRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "mintByPeriphery",
        args: [request.to, request.payer, request.nftMetadataURI],
      }),
    };
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
      functionName: "renounceRole",
      account: this.wallet.account,
      args: [request.role, request.callerConfirmation],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method renounceRole for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplRenounceRoleRequest
   * @return EncodedTxData
   */
  public renounceRoleEncode(request: SpgnftImplRenounceRoleRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "renounceRole",
        args: [request.role, request.callerConfirmation],
      }),
    };
  }

  /**
   * method revokeRole for contract SPGNFTImpl
   *
   * @param request SpgnftImplRevokeRoleRequest
   * @return Promise<WriteContractReturnType>
   */
  public async revokeRole(request: SpgnftImplRevokeRoleRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "revokeRole",
      account: this.wallet.account,
      args: [request.role, request.account],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method revokeRole for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplRevokeRoleRequest
   * @return EncodedTxData
   */
  public revokeRoleEncode(request: SpgnftImplRevokeRoleRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "revokeRole",
        args: [request.role, request.account],
      }),
    };
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
      functionName: "safeTransferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method safeTransferFrom for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSafeTransferFromRequest
   * @return EncodedTxData
   */
  public safeTransferFromEncode(request: SpgnftImplSafeTransferFromRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "safeTransferFrom",
        args: [request.from, request.to, request.tokenId],
      }),
    };
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
      functionName: "safeTransferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId, request.data],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method safeTransferFrom for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSafeTransferFrom2Request
   * @return EncodedTxData
   */
  public safeTransferFrom2Encode(request: SpgnftImplSafeTransferFrom2Request): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "safeTransferFrom",
        args: [request.from, request.to, request.tokenId, request.data],
      }),
    };
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
      functionName: "setApprovalForAll",
      account: this.wallet.account,
      args: [request.operator, request.approved],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setApprovalForAll for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetApprovalForAllRequest
   * @return EncodedTxData
   */
  public setApprovalForAllEncode(request: SpgnftImplSetApprovalForAllRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setApprovalForAll",
        args: [request.operator, request.approved],
      }),
    };
  }

  /**
   * method setBaseURI for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetBaseUriRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setBaseUri(request: SpgnftImplSetBaseUriRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setBaseURI",
      account: this.wallet.account,
      args: [request.baseURI],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setBaseURI for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetBaseUriRequest
   * @return EncodedTxData
   */
  public setBaseUriEncode(request: SpgnftImplSetBaseUriRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setBaseURI",
        args: [request.baseURI],
      }),
    };
  }

  /**
   * method setContractURI for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetContractUriRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setContractUri(
    request: SpgnftImplSetContractUriRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setContractURI",
      account: this.wallet.account,
      args: [request.contractURI],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setContractURI for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetContractUriRequest
   * @return EncodedTxData
   */
  public setContractUriEncode(request: SpgnftImplSetContractUriRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setContractURI",
        args: [request.contractURI],
      }),
    };
  }

  /**
   * method setMintFee for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetMintFeeRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintFee(request: SpgnftImplSetMintFeeRequest): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setMintFee",
      account: this.wallet.account,
      args: [request.fee],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMintFee for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetMintFeeRequest
   * @return EncodedTxData
   */
  public setMintFeeEncode(request: SpgnftImplSetMintFeeRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setMintFee",
        args: [request.fee],
      }),
    };
  }

  /**
   * method setMintFeeRecipient for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetMintFeeRecipientRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintFeeRecipient(
    request: SpgnftImplSetMintFeeRecipientRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setMintFeeRecipient",
      account: this.wallet.account,
      args: [request.newFeeRecipient],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMintFeeRecipient for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetMintFeeRecipientRequest
   * @return EncodedTxData
   */
  public setMintFeeRecipientEncode(request: SpgnftImplSetMintFeeRecipientRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setMintFeeRecipient",
        args: [request.newFeeRecipient],
      }),
    };
  }

  /**
   * method setMintFeeToken for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetMintFeeTokenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintFeeToken(
    request: SpgnftImplSetMintFeeTokenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setMintFeeToken",
      account: this.wallet.account,
      args: [request.token],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMintFeeToken for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetMintFeeTokenRequest
   * @return EncodedTxData
   */
  public setMintFeeTokenEncode(request: SpgnftImplSetMintFeeTokenRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setMintFeeToken",
        args: [request.token],
      }),
    };
  }

  /**
   * method setMintOpen for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetMintOpenRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setMintOpen(
    request: SpgnftImplSetMintOpenRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setMintOpen",
      account: this.wallet.account,
      args: [request.mintOpen],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setMintOpen for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetMintOpenRequest
   * @return EncodedTxData
   */
  public setMintOpenEncode(request: SpgnftImplSetMintOpenRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setMintOpen",
        args: [request.mintOpen],
      }),
    };
  }

  /**
   * method setPublicMinting for contract SPGNFTImpl
   *
   * @param request SpgnftImplSetPublicMintingRequest
   * @return Promise<WriteContractReturnType>
   */
  public async setPublicMinting(
    request: SpgnftImplSetPublicMintingRequest,
  ): Promise<WriteContractReturnType> {
    const { request: call } = await this.rpcClient.simulateContract({
      abi: spgnftImplAbi,
      address: this.address,
      functionName: "setPublicMinting",
      account: this.wallet.account,
      args: [request.isPublicMinting],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method setPublicMinting for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplSetPublicMintingRequest
   * @return EncodedTxData
   */
  public setPublicMintingEncode(request: SpgnftImplSetPublicMintingRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "setPublicMinting",
        args: [request.isPublicMinting],
      }),
    };
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
      functionName: "transferFrom",
      account: this.wallet.account,
      args: [request.from, request.to, request.tokenId],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method transferFrom for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplTransferFromRequest
   * @return EncodedTxData
   */
  public transferFromEncode(request: SpgnftImplTransferFromRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "transferFrom",
        args: [request.from, request.to, request.tokenId],
      }),
    };
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
      functionName: "withdrawToken",
      account: this.wallet.account,
      args: [request.token],
    });
    return await this.wallet.writeContract(call as WriteContractParameters);
  }

  /**
   * method withdrawToken for contract SPGNFTImpl with only encode
   *
   * @param request SpgnftImplWithdrawTokenRequest
   * @return EncodedTxData
   */
  public withdrawTokenEncode(request: SpgnftImplWithdrawTokenRequest): EncodedTxData {
    return {
      to: this.address,
      data: encodeFunctionData({
        abi: spgnftImplAbi,
        functionName: "withdrawToken",
        args: [request.token],
      }),
    };
  }
}
