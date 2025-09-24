import { Address, Hash, Hex, TransactionReceipt, WaitForTransactionReceiptParameters } from "viem";

import {
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  EncodedTxData,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  RoyaltyModuleIpRoyaltyVaultDeployedEvent,
  RoyaltyTokenDistributionWorkflowsClient,
  RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest,
} from "../../abi/generated";
import {
  DeadlineInput,
  FeeInput,
  IpMetadataAndTxOptions,
  LicenseTermsIdInput,
  LicensingConfig,
  RevShareInput,
  TokenIdInput,
} from "../common";
import { TxOptions, WipOptions, WithWipOptions } from "../options";
import { LicenseTerms, LicenseTermsDataInput } from "./license";
import { Erc20Spender } from "../utils/wip";

export type MaxRtsInput = number;
export type DerivativeDataInput = {
  parentIpIds: Address[];
  /** The IDs of the license terms that the parent IP supports. */
  licenseTermsIds: LicenseTermsIdInput[];
  /**
   * The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   * @default 0
   */
  maxMintingFee?: FeeInput;
  /**
   *  The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   * @default 100_000_000
   */
  maxRts?: MaxRtsInput;
  /**
   * The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100 (where 100% represents 100_000_000).
   * @default 100
   */
  maxRevenueShare?: RevShareInput;
  /**
   * The address of the license template.
   * Defaults to {@link https://docs.story.foundation/docs/programmable-ip-license | License Template} address if not provided.
   */
  licenseTemplate?: Address;
};
export type DerivativeData = {
  parentIpIds: readonly Address[];
  licenseTermsIds: readonly bigint[];
  royaltyContext: Hex;
  maxMintingFee: bigint;
  maxRts: number;
  maxRevenueShare: number;
  licenseTemplate: Address;
};
export type RegisterIpResponse = RegistrationResponse & {
  encodedTxData?: EncodedTxData;
};

export type RegisterRequest = {
  /** The address of the NFT. */
  nftContract: Address;
  /** The token identifier of the NFT. */
  tokenId: TokenIdInput;
  /**
   * The deadline of the transaction signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
} & IpMetadataAndTxOptions;

export type RegisterDerivativeWithLicenseTokensRequest = {
  /** The derivative IP ID. */
  childIpId: Address;
  /** The IDs of the license tokens. */
  licenseTokenIds: LicenseTermsIdInput[];
  /**
   * The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   * @default 100_000_000
   */
  maxRts?: MaxRtsInput;
  txOptions?: TxOptions;
};

export type RegisterDerivativeRequest = WithWipOptions &
  DerivativeDataInput & {
    txOptions?: TxOptions;
    childIpId: Address;
  };

export type LicenseTermsData = Omit<
  LicenseTermsDataInput<LicenseTerms, LicensingConfig>,
  "licensingConfig"
> & {
  licensingConfig: LicensingConfig;
};

export type MintAndRegisterIpAssetWithPilTermsRequest = {
  spgNftContract: Address;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /** The address to receive the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type MintAndRegisterIpAssetWithPilTermsResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
  receipt?: TransactionReceipt;
  licenseTermsIds?: bigint[];
  maxLicenseTokensTxHashes?: Hash[];
};

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: TokenIdInput;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
  /** The derivative data to be used for register derivative. */
  derivData: DerivativeDataInput;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type RegisterIpAndMakeDerivativeResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
  receipt?: TransactionReceipt;
};

export type RegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: TokenIdInput;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
} & IpMetadataAndTxOptions;

export type RegisterIpAndAttachPilTermsResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  licenseTermsIds?: bigint[];
  tokenId?: bigint;
  maxLicenseTokensTxHashes?: Hash[];
};
export type MintAndRegisterIpAndMakeDerivativeRequest = {
  spgNftContract: Address;
  /** The derivative data to be used for register derivative. */
  derivData: DerivativeDataInput;
  /** The address to receive the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type MintAndRegisterIpAndMakeDerivativeResponse = RegistrationResponse & {
  encodedTxData?: EncodedTxData;
};

export type WithIpMetadata = {
  ipMetadata?: {
    ipMetadataURI?: string;
    ipMetadataHash?: Hex;
    nftMetadataURI?: string;
    nftMetadataHash?: Hex;
  };
};

export type MintAndRegisterIpRequest = IpMetadataAndTxOptions &
  WithWipOptions & {
    spgNftContract: Address;
    /** The address of the recipient of the minted NFT. If not provided, the client's own wallet address will be used. */
    recipient?: Address;
    /**
     * Set to true to allow minting an NFT with a duplicate metadata hash.
     * @default true
     */
    allowDuplicates?: boolean;
  };

export type MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  spgNftContract: Address;
  /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
  licenseTokenIds: LicenseTermsIdInput[];
  /** The address of the recipient of the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
  /**
   * The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   * @default 100_000_000
   */
  maxRts?: MaxRtsInput;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type RegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: TokenIdInput;
  /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
  licenseTokenIds: LicenseTermsIdInput[];
  /**
   * The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   * @default 100_000_000
   */
  maxRts?: MaxRtsInput;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type BatchMintAndRegisterIpAssetWithPilTermsRequest = {
  args: Omit<MintAndRegisterIpAssetWithPilTermsRequest, "txOptions">[];
  txOptions?: Omit<TxOptions, "EncodedTxData">;
};
export type BatchMintAndRegisterIpAssetWithPilTermsResult = {
  ipId: Address;
  tokenId: bigint;
  licenseTermsIds: bigint[];
  spgNftContract: Address;
  maxLicenseTokensTxHashes?: Hash[];
};
export type BatchMintAndRegisterIpAssetWithPilTermsResponse = {
  txHash: Hash;
  results?: BatchMintAndRegisterIpAssetWithPilTermsResult[];
};

export type BatchRegisterDerivativeRequest = {
  args: RegisterDerivativeRequest[];
  /** The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type BatchRegisterDerivativeResponse = {
  txHash: Hash;
};
export type BatchMintAndRegisterIpAndMakeDerivativeRequest = {
  args: Omit<MintAndRegisterIpAndMakeDerivativeRequest, "txOptions">[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};
export type BatchMintAndRegisterIpAndMakeDerivativeResponse = {
  txHash: Hash;
  results?: IpIdAndTokenId<"spgNftContract">[];
};

export type BatchRegisterRequest = {
  args: Omit<RegisterRequest, "txOptions">[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type BatchRegisterResponse = {
  txHash?: Hash;
  spgTxHash?: Hash;
  results?: IpIdAndTokenId<"nftContract">[];
};
export type RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest = {
  nftContract: Address;
  tokenId: TokenIdInput;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithIpMetadata;
export type RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse = {
  registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash: Hash;
  distributeRoyaltyTokensTxHash: Hash;
  ipId: Address;
  licenseTermsIds: bigint[];
  ipRoyaltyVault: Address;
  maxLicenseTokensTxHashes?: Hash[];
};
export type DistributeRoyaltyTokens = {
  ipId: Address;
  deadline?: DeadlineInput;
  ipRoyaltyVault: Address;
  royaltyShares: RoyaltyShare[];
  totalAmount: number;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};
export type RoyaltyShare = {
  /** The address of the recipient. */
  recipient: Address;
  /**
   *  The percentage of the total royalty share. For example, a value of 10 represents 10% of max royalty shares, which is 10,000,000.
   *  @example 10
   */
  percentage: number;
};
export type IpIdAndTokenId<T extends string | undefined> = T extends undefined
  ? { ipId: Address; tokenId: bigint }
  : { ipId: Address; tokenId: bigint } & { [T: string]: Address };

export type RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest = {
  nftContract: Address;
  tokenId: TokenIdInput;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: DeadlineInput;
  /** The derivative data to be used for register derivative.*/
  derivData: DerivativeDataInput;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithWipOptions &
  WithIpMetadata;

export type RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse = {
  registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: Hash;
  distributeRoyaltyTokensTxHash: Hash;
  ipId: Address;
  tokenId: bigint;
  ipRoyaltyVault: Address;
};
export type MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest = {
  /** The address of the SPG NFT contract. */
  spgNftContract: Address;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /** Authors of the IP and their shares of the royalty tokens */
  royaltyShares: RoyaltyShare[];
  /** The address to receive the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithIpMetadata &
  WithWipOptions;

export type MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse = {
  txHash: Hash;
  ipId?: Address;
  licenseTermsIds?: bigint[];
  ipRoyaltyVault?: Address;
  tokenId?: bigint;
  maxLicenseTokensTxHashes?: Hash[];
};

export type MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest = {
  spgNftContract: Address;
  /** The derivative data to be used for register derivative. */
  derivData: DerivativeDataInput;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
  /** The address to receive the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithIpMetadata &
  WithWipOptions;

export type MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse = {
  txHash: Hash;
  ipId?: Address;
  tokenId?: bigint;
};

export type CommonRegistrationParams = {
  contractCall: () => Promise<Hash>;
  encodedTxs: EncodedTxData[];
  spgNftContract?: Address;
  /** the spg contract in which the minting fee is paid to  */
  spgSpenderAddress: Address;
  derivData?: DerivativeData;
  sender: Address;
  txOptions?: TxOptions;
  wipOptions?: WipOptions;
};

export type RegistrationResponse = {
  txHash?: Hash;
  receipt?: TransactionReceipt;
  ipId?: Address;
  tokenId?: bigint;
};

export type CommonRegistrationTxResponse = RegistrationResponse & {
  txHash: Hash;
};

export type TransformIpRegistrationWorkflowRequest =
  | RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest
  | LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest
  | RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest
  | DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest
  | RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest
  | LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest
  | RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest
  | DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest
  | RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest;

export type TransformedIpRegistrationWorkflowRequest<
  T extends TransformIpRegistrationWorkflowRequest = TransformIpRegistrationWorkflowRequest,
> = {
  transformRequest: T;
  contractCall: () => Promise<Hash>;
  encodedTxData: EncodedTxData;
  isUseMulticall3: boolean;
  workflowClient:
    | DerivativeWorkflowsClient
    | LicenseAttachmentWorkflowsClient
    | RoyaltyTokenDistributionWorkflowsClient;
  spenders?: Erc20Spender[];
  totalFees?: bigint;
  extraData?: ExtraData;
};

/**
 * Utility type that removes option-related fields (txOptions and wipOptions) from a type.
 * This preserves discriminated unions unlike using Omit directly.
 */
type RemoveOptionsFields<Type> = {
  [Property in keyof Type as Exclude<Property, "txOptions" | "wipOptions">]: Type[Property];
};

export type MintSpgNftRegistrationRequest = RemoveOptionsFields<
  | MintAndRegisterIpAndMakeDerivativeRequest
  | MintAndRegisterIpAssetWithPilTermsRequest
  | MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest
  | MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest
>;

export type IpRegistrationWorkflowRequest =
  | MintSpgNftRegistrationRequest
  | RegisterRegistrationRequest;

export type RegisterRegistrationRequest = RemoveOptionsFields<
  | RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest
  | RegisterIpAndAttachPilTermsRequest
  | RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest
  | RegisterIpAndMakeDerivativeRequest
>;

export type BatchRegistrationResult = {
  txHash: Hash;
  receipt: TransactionReceipt;
  /**
   * The IP royalty vault addresses.
   * Only available for requests that include royalty token distribution, such as:
   * - {@link RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest}
   * - {@link RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest}
   */
  ipRoyaltyVault?: RoyaltyModuleIpRoyaltyVaultDeployedEvent[];
  /**
   * The IP assets with license terms.
   */
  ipAssetsWithLicenseTerms: {
    ipId: Address;
    tokenId: bigint;
    /**
     * The IDs of the license terms that the IP supports.
     * Only available if the IP has license terms attached.
     */
    licenseTermsIds?: bigint[];
    /**
     * The transaction hashes for setting max license token limits.
     * Only available when {@link LicenseTermsDataInput.maxLicenseTokens} is configured.
     */
    maxLicenseTokensTxHashes?: Hash[];
  }[];
};

export type BatchRegisterIpAssetsWithOptimizedWorkflowsRequest = WithWipOptions & {
  requests: IpRegistrationWorkflowRequest[];
  txOptions?: Omit<WaitForTransactionReceiptParameters, "hash">;
};

export type BatchRegisterIpAssetsWithOptimizedWorkflowsResponse = {
  distributeRoyaltyTokensTxHashes?: Hash[];
  registrationResults: BatchRegistrationResult[];
};

export type ExtraData = {
  royaltyShares?: RoyaltyShare[];
  deadline?: bigint;
  maxLicenseTokens?: (bigint | undefined)[];
  licenseTermsData?: LicenseTermsData[];
};

export type BatchMintAndRegisterIpRequest = {
  requests: Omit<MintAndRegisterIpRequest, "txOptions" | "wipOptions">[];
  wipOptions?: WipOptions;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type BatchMintAndRegisterIpResponse = {
  registrationResults: {
    txHash: Hash;
    ipIdsAndTokenIds: IpIdAndTokenId<"spgNftContract">[];
    receipt: TransactionReceipt;
  }[];
};

/**
 * Mint an NFT from an SPG NFT contract.
 */
export type MintNFT = {
  type: "mint";

  /**
   * The address of the SPG NFT contract.
   * You can create one via `client.nftClient.createNFTCollection`.
   */
  spgNftContract: Address;
  /**
   * The address to receive the NFT.
   * Defaults to client's wallet address if not provided.
   */
  recipient?: Address;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
};
/**
 * Minted NFT for registration IP asset.
 */
export type MintedNFT = {
  type: "minted";

  /** The address of the NFT contract. */
  nftContract: Address;
  tokenId: TokenIdInput;
};
/**
 * Request configuration for registering IP assets with flexible licensing and royalty options.
 *
 * @template T - The NFT type (MintNFT and MintedNFT)
 *
 * @example
 * **Basic IP Registration:**
 * ```typescript
 * const request: RegisterIpAssetRequest<MintedNFT> = {
 *   nft: {
 *     type: "minted",
 *     nftContract: "0x1234567890123456789012345678901234567890",
 *     tokenId: 1n
 *   }
 * };
 * ```
 *
 * @example
 * **IP Registration with License Terms:**
 * ```typescript
 * const request: RegisterIpAssetRequest<MintedNFT> = {
 *   nft: {
 *     type: "minted",
 *     nftContract: "0x1234567890123456789012345678901234567890",
 *     tokenId: 1n
 *   },
 *   licenseTermsData: [
 *     {
 *       terms: PILFlavor.commercialUse({
 *         defaultMintingFee: 10000n,
 *         currency: WIP_TOKEN_ADDRESS
 *       })
 *     }
 *   ]
 * };
 * ```
 * @example
 * **Mint New NFT and with License Terms and Royalty Distribution:**
 * ```typescript
 * const request: RegisterIpAssetRequest<MintNFT> = {
 *   nft: {
 *     type: "mint",
 *     spgNftContract: "0x1234567890123456789012345678901234567890",
 *     recipient: "0xRecipient...",
 *     allowDuplicates: false
 *   },
 *   licenseTermsData: [
 *     {
 *       terms: PILFlavor.nonCommercialSocialRemixing()
 *     }
 *   ],
 *  royaltyShares: [
 *     { recipient: "0xArtist...", percentage: 70 },
 *     { recipient: "0xCollaborator...", percentage: 30 }
 *   ],
 * };
 * ```
 */
export type RegisterIpAssetRequest<T extends MintNFT | MintedNFT> = WithWipOptions &
  WithIpMetadata & {
    /** The NFT to be registered as an IP asset. */
    nft: T;

    /**
     * License terms and configuration to be attached to the IP asset.
     *
     * @remarks
     * Can be specified independently or together with `royaltyShares` for revenue distribution.
     */
    licenseTermsData?: LicenseTermsDataInput[];

    /**
     * Authors of the IP and their shares of the royalty tokens.
     *
     * @remarks
     * Can only be specified when `licenseTermsData` is also provided, ensuring
     * that distribute royalty.
     */
    royaltyShares?: RoyaltyShare[];

    /**
     * The deadline for the signature in seconds.
     * @default 1000
     */
    deadline?: DeadlineInput;
    txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
  };

/**
 * Response type for IP asset registration with conditional return types based on input parameters.
 *
 * @template T - The request type extending `RegisterIpAssetRequest`
 *
 * @remarks
 * The response structure varies based on the registration type:
 *
 * **Full Registration (with license terms + royalty shares):**
 * - Returns detailed response with royalty vault information
 * - Includes transaction hashes for both registration and royalty distribution
 *
 * **License Terms Only:**
 * - Returns response with license terms IDs
 * - Includes IP registration details
 *
 * **Basic Registration:**
 * - Returns minimal response with IP ID and transaction hash
 *
 */
export type RegisterIpAssetResponse<T extends RegisterIpAssetRequest<MintedNFT | MintNFT>> =
  T extends { licenseTermsData: LicenseTermsDataInput[]; royaltyShares: RoyaltyShare[] }
    ? T extends { nft: { type: "minted" } }
      ? RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse
      : MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse
    : T extends { licenseTermsData: LicenseTermsDataInput[] }
    ? T extends { nft: { type: "minted" } }
      ? RegisterIpAndAttachPilTermsResponse
      : MintAndRegisterIpAssetWithPilTermsResponse
    : RegisterIpResponse;

/**
 * Request type for registering derivative IP assets with flexible workflow support.
 *
 * @template T - The NFT type (MintedNFT or MintNFT)
 *
 * @example
 * **Minted NFT with License Terms and Royalty Distribution:**
 * ```typescript
 * const request: RegisterDerivativeIpAssetRequest<MintedNFT> = {
 *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n },
 *   derivData: {
 *     parentIpIds: ["0x..."],
 *     licenseTermsIds: [1n],
 *     maxMintingFee: 10000n,
 *     maxRts: 100,
 *     maxRevenueShare: 100
 *   },
 *   royaltyShares: [
 *     { recipient: "0x...", percentage: 100 }
 *   ]
 * };
 * ```
 *
 * @example
 * **Minted NFT with Basic Derivative Registration:**
 * ```typescript
 * const request: RegisterDerivativeIpAssetRequest<MintedNFT> = {
 *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n },
 *   derivData: {
 *     parentIpIds: ["0x..."],
 *     licenseTermsIds: [1n],
 *     maxMintingFee: 10000n,
 *     maxRts: 100,
 *     maxRevenueShare: 100
 *   }
 * };
 * ```
 *
 * @example
 * **Mint NFT with License Terms and Royalty Distribution:**
 * ```typescript
 * const request: RegisterDerivativeIpAssetRequest<MintNFT> = {
 *   nft: { type: "mint", spgNftContract: "0x...", recipient: "0x...", allowDuplicates: false },
 *   derivData: {
 *     parentIpIds: ["0x..."],
 *     licenseTermsIds: [1n],
 *     maxMintingFee: 10000n,
 *     maxRts: 100,
 *     maxRevenueShare: 100
 *   },
 *   royaltyShares: [
 *     { recipient: "0x...", percentage: 100 }
 *   ]
 * };
 * ```
 *
 * @example
 * **Using Existing License Tokens (for both minted and mint NFTs):**
 * ```typescript
 * const request: RegisterDerivativeIpAssetRequest<MintedNFT> = {
 *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n }, // or type: "mint"
 *   licenseTokenIds: [1, 2, 3],
 *   maxRts: 100000
 * };
 * ```
 */
export type RegisterDerivativeIpAssetRequest<T extends MintedNFT | MintNFT> = WithWipOptions &
  WithIpMetadata & {
    nft: T;
    /**
     * Authors of the IP and their shares of the royalty tokens.
     *
     * @remarks
     * Royalty shares can only be specified if `derivData` is also provided.
     * This ensures that royalty distribution is always associated with derivative IP registration.
     * The shares define how royalty tokens will be distributed among IP authors.
     */
    royaltyShares?: RoyaltyShare[];
    /**
     * The derivative data containing parent IP information and licensing terms.
     * Can be used independently or together with `royaltyShares` for royalty distribution.
     */
    derivData?: DerivativeDataInput;
    /**
     * The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
     * @default 100_000_000
     */
    maxRts?: MaxRtsInput;
    /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
    licenseTokenIds?: LicenseTermsIdInput[];
    /**
     * The deadline for the signature in seconds.
     * @default 1000
     */
    deadline?: DeadlineInput;
    txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
  };

/**
 * Response type for derivative IP asset registration with conditional return types.
 *
 * @template T - The request type extending RegisterDerivativeIpAssetRequest
 *
 * @remarks
 * The response type varies based on the input parameters:
 * - If `derivData` and `royaltyShares` are provided with a minted NFT, returns detailed royalty distribution response
 * - Otherwise, returns basic registration response
 *
 * @example
 * **With Royalty Distribution:**
 * ```typescript
 * const response: RegisterDerivativeIpAssetResponse<typeof request> = {
 *   registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: "0x...",
 *   distributeRoyaltyTokensTxHash: "0x...",
 *   ipId: "0x...",
 *   tokenId: 1n,
 *   ipRoyaltyVault: "0x..."
 * };
 * ```
 *
 * @example
 * **Basic Registration:**
 * ```typescript
 * const response: RegisterDerivativeIpAssetResponse<typeof request> = {
 *   txHash: "0x...",
 *   ipId: "0x...",
 *   tokenId: 1n
 * };
 * ```
 */
export type RegisterDerivativeIpAssetResponse<
  T extends RegisterDerivativeIpAssetRequest<MintedNFT | MintNFT>,
> = T extends {
  derivData: DerivativeDataInput;
  royaltyShares: RoyaltyShare[];
  nft: { type: "minted" };
}
  ? RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse
  : RegisterIpResponse;

export type LinkDerivativeResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
};
