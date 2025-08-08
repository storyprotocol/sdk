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
  IpMetadataAndTxOptions,
  LicensingConfig,
  LicensingConfigInput,
  TokenAmountInput,
} from "../common";
import { TxOptions, WipOptions, WithWipOptions } from "../options";
import { LicenseTerms, LicenseTermsInput } from "./license";
import { Erc20Spender } from "../utils/wip";

export type DerivativeDataInput = {
  parentIpIds: Address[];
  /** The IDs of the license terms that the parent IP supports. */
  licenseTermsIds: bigint[] | number[];
  /**
   * The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   * @default 0
   */
  maxMintingFee?: TokenAmountInput;
  /**
   *  The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   * @default 100_000_000
   */
  maxRts?: number;
  /**
   * The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100 (where 100% represents 100_000_000).
   * @default 100
   */
  maxRevenueShare?: number;
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
  tokenId: bigint | number;
  /**
   * The deadline of the transaction signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
} & IpMetadataAndTxOptions;

export type RegisterDerivativeWithLicenseTokensRequest = {
  /** The derivative IP ID. */
  childIpId: Address;
  /** The IDs of the license tokens. */
  licenseTokenIds: bigint[] | number[];
  /** The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000). */
  maxRts: number;
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
};

export type RegisterDerivativeRequest = WithWipOptions &
  DerivativeDataInput & {
    txOptions?: TxOptions;
    childIpId: Address;
  };

export type RegisterDerivativeResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
};
export type LicenseTermsDataInput<T = LicenseTermsInput, C = LicensingConfigInput> = {
  /** Programmable IP License */
  terms: T;
  licensingConfig?: C;
  /**
   * The max number of license tokens that can be minted from this license term.
   *
   * - When not specified, there is no limit on license token minting
   * - When specified, minting is capped at this value and the {@link https://github.com/storyprotocol/protocol-periphery-v1/blob/release/1.3/contracts/hooks/TotalLicenseTokenLimitHook.sol | TotalLicenseTokenLimitHook}
   *   is automatically configured as the {@link LicensingConfigInput.licensingHook}
   */
  maxLicenseTokens?: TokenAmountInput;
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
  tokenId: bigint | number;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
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
  tokenId: bigint | number;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
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

type WithIpMetadata = {
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
export type RegisterPilTermsAndAttachRequest = {
  ipId: Address;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /** The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
  txOptions?: TxOptions;
};

export type RegisterPilTermsAndAttachResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  licenseTermsIds?: bigint[];
  maxLicenseTokensTxHashes?: Hash[];
};

export type MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  spgNftContract: Address;
  /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
  licenseTokenIds: bigint[] | number[];
  /** The address of the recipient of the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
  /** The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000). */
  maxRts: number;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type RegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: bigint | number;
  /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
  licenseTokenIds: bigint[] | number[];
  /** The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000). */
  maxRts: number;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
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
  deadline?: bigint | number;
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
  tokenId: bigint | number;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
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
  deadline?: bigint | number;
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
  tokenId: bigint | number;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
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

export type SetMaxLicenseTokens = {
  maxLicenseTokensData: (LicenseTermsDataInput | { maxLicenseTokens: bigint })[];
  licensorIpId: Address;
  licenseTermsIds: bigint[];
};

export type ExtraData = {
  royaltyShares?: RoyaltyShare[];
  deadline?: bigint;
  maxLicenseTokens?: (bigint | undefined)[];
  licenseTermsData?: LicenseTermsData[];
};
