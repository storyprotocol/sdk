import { Address, Hash, Hex, TransactionReceipt } from "viem";

import { TxOptions, WithWipOptions } from "../options";
import { RegisterPILTermsRequest } from "./license";
import { EncodedTxData } from "../../abi/generated";
import { IpMetadataAndTxOptions, LicensingConfig } from "../common";
import { IpMetadataForWorkflow } from "../../utils/getIpMetadataForWorkflow";

export type DerivativeData = {
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
  /** The license template address, default value is Programmable IP License. */
  licenseTemplate?: Address;
};
export type InternalDerivativeData = {
  parentIpIds: readonly Address[];
  licenseTermsIds: readonly bigint[];
  royaltyContext: Hex;
  maxMintingFee: bigint;
  maxRts: number;
  maxRevenueShare: number;
  licenseTemplate: Address;
};
export type RegisterIpResponse = {
  encodedTxData?: EncodedTxData;
} & CommonRegistrationResponse;

export type RegisterRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  deadline?: string | number | bigint;
} & IpMetadataAndTxOptions;

export type RegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Address;
  licenseTokenIds: string[] | bigint[] | number[];
  maxRts: number | string;
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};

export type RegisterDerivativeRequest = {
  txOptions?: TxOptions;
  childIpId: Address;
} & DerivativeData;

export type RegisterDerivativeResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};
export type LicenseTermsData<T, U> = {
  terms: T;
  licensingConfig?: U;
};

export type ValidatedLicenseTermsData<T, U> = LicenseTermsData<T, U> & {
  licensingConfig: U;
};
export type MintAndRegisterIpAssetWithPilTermsRequest = {
  spgNftContract: Address;
  /** Indicates whether the license terms can be attached to the same IP ID or not. */
  allowDuplicates: boolean;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  /**
   * The address to receive the minted NFT.
   * @default wallet address
   */
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
   * @default 1000s
   */
  deadline?: string | number | bigint;
  /** The derivative data to be used for register derivative. */
  derivData: DerivativeData;
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
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000s
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
  derivData: DerivativeData;
  /**
   * Authors of the IP and their shares of the royalty tokens.
   * @default wallet address
   */
  recipient?: Address;
  /** Set to true to allow minting an NFT with a duplicate metadata hash. */
  allowDuplicates: boolean;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type MintAndRegisterIpAndMakeDerivativeResponse = {
  encodedTxData?: EncodedTxData;
} & CommonRegistrationResponse;

export type IpRelationship = {
  parentIpId: Address;
  type: string;
};

export type IpCreator = {
  name: string;
  address: Address;
  description?: string;
  image?: string;
  socialMedia?: IpCreatorSocial[];
  role?: string;
  contributionPercent: number; // add up to 100
};

export type IpCreatorSocial = {
  platform: string;
  url: string;
};

export type IpMedia = {
  name: string;
  url: string;
  mimeType: string;
};

export type IpAttribute = {
  key: string;
  value: string | number;
};

export type StoryProtocolApp = {
  id: string;
  name: string;
  website: string;
  action?: string;
};

export type GenerateCreatorMetadataParam = {
  name: string;
  address: Address;
  contributionPercent: number;
  description?: string;
  image?: string;
  socialMedia?: IpCreatorSocial[];
  role?: string;
};
export type IPRobotTerms = {
  userAgent: string;
  allow: string;
};

type IPMetadataInfo = {
  ipMetadata?: {
    ipMetadataURI?: string;
    ipMetadataHash?: Hex;
    nftMetadataURI?: string;
    nftMetadataHash?: Hex;
  };
};

export type GenerateIpMetadataParam = {
  title?: string;
  description?: string;
  ipType?: string;
  relationships?: IpRelationship[];
  createdAt?: string;
  watermarkImg?: string;
  creators?: IpCreator[];
  media?: IpMedia[];
  attributes?: IpAttribute[];
  app?: StoryProtocolApp;
  tags?: string[];
  robotTerms?: IPRobotTerms;
  additionalProperties?: { [key: string]: unknown };
};
export type IpMetadata = {
  title?: string;
  description?: string;
  ipType?: string;
  relationships?: IpRelationship[];
  createdAt?: string;
  watermarkImg?: string;
  creators?: IpCreator[];
  media?: IpMedia[];
  attributes?: IpAttribute[];
  appInfo?: StoryProtocolApp[];
  tags?: string[];
  robotTerms?: IPRobotTerms;
  [key: string]: unknown;
};

export type MintAndRegisterIpRequest = {
  spgNftContract: Address;
  recipient?: Address;
  allowDuplicates: boolean;
} & IpMetadataAndTxOptions;
export type RegisterPilTermsAndAttachRequest = {
  ipId: Address;
  /** The data of the license and its configuration to be attached to the IP. */
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  /** The deadline for the signature in seconds.
   * @default 1000s
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
  licenseTokenIds: string[] | bigint[] | number[];
  recipient?: Address;
  maxRts: number | string;
  allowDuplicates: boolean;
} & IpMetadataAndTxOptions &
  WithWipOptions;

export type RegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  licenseTokenIds: string[] | bigint[] | number[];
  deadline?: string | number | bigint;
  maxRts: number | string;
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
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  /**
   * The deadline for the signature in seconds.
   * @default 1000s
   */
  deadline?: string | number | bigint;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & IPMetadataInfo;
export type RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse = {
  registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash: Hex;
  distributeRoyaltyTokensTxHash: Hex;
  ipId: Address;
  licenseTermsIds: bigint[];
  ipRoyaltyVault: Address;
};
export type DistributeRoyaltyTokens = {
  ipId: Address;
  deadline: bigint;
  ipRoyaltyVault: Address;
  royaltyShares: RoyaltyShare[];
  totalAmount: number;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};
export type RoyaltyShare = {
  /** The address of the recipient. */
  recipient: Address;
  /**
   *  The percentage of the royalty share.
   *  @example 10 represents 10% which is 100_000_00.
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
   * @default 1000s
   */
  deadline?: string | number | bigint;
  /** The derivative data to be used for register derivative.*/
  derivData: DerivativeData;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  /** The desired metadata for the newly minted NFT and newly registered IP. */
  ipMetadata?: IpMetadataForWorkflow;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & WithWipOptions;

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
  /** Set to true to allow minting an NFT with a duplicate metadata hash. */
  allowDuplicates: boolean;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  /** Authors of the IP and their shares of the royalty tokens */
  royaltyShares: RoyaltyShare[];
  /**
   * The address to receive the minted NFT.
   * @default wallet address
   */
  recipient?: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & IPMetadataInfo &
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
  derivData: DerivativeData;
  /** Authors of the IP and their shares of the royalty tokens. */
  royaltyShares: RoyaltyShare[];
  /** Set to true to allow minting an NFT with a duplicate metadata hash. */
  allowDuplicates: boolean;
  /**
   * The address to receive the minted NFT
   * @default wallet address
   */
  recipient?: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & IPMetadataInfo &
  WithWipOptions;

export type MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse = {
  txHash: Hex;
  ipId?: Address;
  tokenId?: bigint;
};

export type CommonRegistrationHandlerParams = WithWipOptions & {
  contractCall: () => Promise<Hash>;
  encodedTxs: EncodedTxData[];
  spgNftContract?: Address;
  /** the spg contract in which the minting fee is paid to  */
  spgSpenderAddress: Address;
  derivData?: InternalDerivativeData;
  sender: Address;
  txOptions?: TxOptions;
};

export type CommonRegistrationResponse = {
  txHash?: Hex;
  ipId?: Address;
  tokenId?: bigint;
  receipt?: TransactionReceipt;
};
