import { Address, Hash, Hex, TransactionReceipt, WaitForTransactionReceiptParameters } from "viem";

import { TxOptions, WithWipOptions } from "../options";
import { LicenseTerms, LicenseTermsInput } from "./license";
import {
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  EncodedTxData,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  RoyaltyTokenDistributionWorkflowsClient,
  RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest,
} from "../../abi/generated";
import { IpMetadataAndTxOptions, LicensingConfig, LicensingConfigInput } from "../common";
import { Erc20Spender } from "../utils/wip";

export type DerivativeDataInput = {
  parentIpIds: Address[];
  /** The IDs of the license terms that the parent IP supports. */
  licenseTermsIds: bigint[] | string[] | number[];
  /**
   * The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   * @default 0
   */
  maxMintingFee?: bigint | string | number;
  /**
   *  The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   * @default 100_000_000
   */
  maxRts?: number | string;
  /**
   * The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100 (where 100% represents 100_000_000).
   * @default 100
   */
  maxRevenueShare?: number | string;
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
  tokenId: string | number | bigint;
  /**
   * The deadline of the transaction signature in seconds.
   * @default 1000
   */
  deadline?: string | number | bigint;
} & IpMetadataAndTxOptions;

export type RegisterDerivativeWithLicenseTokensRequest = {
  /** The derivative IP ID. */
  childIpId: Address;
  /** The IDs of the license tokens. */
  licenseTokenIds: string[] | bigint[] | number[];
  /** The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000). */
  maxRts: number | string;
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};

export type RegisterDerivativeRequest = WithWipOptions &
  DerivativeDataInput & {
    txOptions?: TxOptions;
    childIpId: Address;
  };

export type RegisterDerivativeResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};
export type LicenseTermsDataInput<T = LicenseTermsInput, C = LicensingConfigInput> = {
  terms: T;
  licensingConfig?: C;
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
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
  receipt?: TransactionReceipt;
  licenseTermsIds?: bigint[];
};

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: string | number | bigint;
  /** The derivative data to be used for register derivative. */
  derivData: DerivativeDataInput;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type RegisterIpAndMakeDerivativeResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
  receipt?: TransactionReceipt;
};

export type RegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number | string;
} & IpMetadataAndTxOptions;

export type RegisterIpAndAttachPilTermsResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  licenseTermsIds?: bigint[];
  tokenId?: bigint;
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
  deadline?: string | number | bigint;
  txOptions?: TxOptions;
};

export type RegisterPilTermsAndAttachResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  licenseTermsIds?: bigint[];
};

export type MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  spgNftContract: Address;
  /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
  licenseTokenIds: string[] | bigint[] | number[];
  /** The address of the recipient of the minted NFT. If not provided, the client's own wallet address will be used. */
  recipient?: Address;
  /** The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000). */
  maxRts: number | string;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type RegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  /** The IDs of the license tokens to be burned for linking the IP to parent IPs. */
  licenseTokenIds: string[] | bigint[] | number[];
  /** The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000). */
  maxRts: number | string;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: string | number | bigint;
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
};
export type BatchMintAndRegisterIpAssetWithPilTermsResponse = {
  txHash: Hex;
  results?: BatchMintAndRegisterIpAssetWithPilTermsResult[];
};

export type BatchRegisterDerivativeRequest = {
  args: RegisterDerivativeRequest[];
  /** The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: string | number | bigint;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type BatchRegisterDerivativeResponse = {
  txHash: Hex;
};
export type BatchMintAndRegisterIpAndMakeDerivativeRequest = {
  args: Omit<MintAndRegisterIpAndMakeDerivativeRequest, "txOptions">[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};
export type BatchMintAndRegisterIpAndMakeDerivativeResponse = {
  txHash: string;
  results?: IpIdAndTokenId<"spgNftContract">[];
};

export type BatchRegisterRequest = {
  args: Omit<RegisterRequest, "txOptions">[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type BatchRegisterResponse = {
  txHash?: Hex;
  spgTxHash?: Hex;
  results?: IpIdAndTokenId<"nftContract">[];
};
export type RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseTermsData: LicenseTermsDataInput[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: string | number | bigint;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithIpMetadata;
export type RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse = {
  registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash: Hex;
  distributeRoyaltyTokensTxHash: Hex;
  ipId: Address;
  licenseTermsIds: bigint[];
  ipRoyaltyVault: Address;
};
export type DistributeRoyaltyTokens = {
  ipId: Address;
  deadline?: bigint | number | string;
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
  tokenId: bigint | string | number;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: string | number | bigint;
  /** The derivative data to be used for register derivative.*/
  derivData: DerivativeDataInput;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithWipOptions &
  WithIpMetadata;

export type RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse = {
  registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: Address;
  distributeRoyaltyTokensTxHash: Address;
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
  txHash: Hex;
  ipId?: Address;
  licenseTermsIds?: bigint[];
  ipRoyaltyVault?: Address;
  tokenId?: bigint;
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
  txHash: Hex;
  ipId?: Address;
  tokenId?: bigint;
};

export type CommonRegistrationParams = WithWipOptions & {
  contractCall: () => Promise<Hash>;
  encodedTxs: EncodedTxData[];
  spgNftContract?: Address;
  /** the spg contract in which the minting fee is paid to  */
  spgSpenderAddress: Address;
  derivData?: DerivativeData;
  sender: Address;
  txOptions?: TxOptions;
};

export type RegistrationResponse = {
  txHash?: Hex;
  receipt?: TransactionReceipt;
  ipId?: Address;
  tokenId?: bigint;
};

export type CommonRegistrationTxResponse = RegistrationResponse & {
  txHash: Hex;
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

export type TransformIpRegistrationWorkflowResponse<
  T extends TransformIpRegistrationWorkflowRequest,
> = {
  transformRequest: T;
  workflowClient?:
    | RoyaltyTokenDistributionWorkflowsClient
    | LicenseAttachmentWorkflowsClient
    | DerivativeWorkflowsClient; // if use multicall3, it undefined
  spenders?: Erc20Spender[];
  totalFees?: bigint;
};

export type BatchRegisterIpWithOptions = WithWipOptions & {
  requests: IpRegistrationWorkflowRequest[];
  txOptions?: Omit<WaitForTransactionReceiptParameters, "hash">;
};
export type BatchRegisterIpWithOptionsResponse = {
  results: {
    txHash: Hex;
    ipIds: Address[];
  }[];
};

export type BatchRegistrationMethodsConfig = {
  workflowClient?: DerivativeWorkflowsClient;
  spenders: Erc20Spender[];
  totalFees: bigint;
  callData: EncodedTxData[];
};

export type ProcessMintAndRegisterRequest = WithWipOptions & {
  requests: Omit<
    | MintAndRegisterIpAndMakeDerivativeRequest
    | MintAndRegisterIpAssetWithPilTermsRequest
    | MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest
    | MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
    "txOptions" | "wipOptions"
  >[];
  txOptions?: Omit<WaitForTransactionReceiptParameters, "hash">;
};

export type MintSpgNftRegistrationRequest = Omit<
  | MintAndRegisterIpAndMakeDerivativeRequest
  | MintAndRegisterIpAssetWithPilTermsRequest
  | MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest
  | MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  "txOptions" | "wipOptions"
>;
export type RegisterRegistrationRequest = Omit<
  | RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest
  | RegisterIpAndAttachPilTermsRequest
  | RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest
  | RegisterIpAndMakeDerivativeRequest,
  "txOptions" | "wipOptions"
>;

export type IpRegistrationWorkflowRequest =
  | MintSpgNftRegistrationRequest
  | RegisterRegistrationRequest
  | DistributeRoyaltyTokens;
