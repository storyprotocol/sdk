import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { RegisterPILTermsRequest } from "./license";
import { EncodedTxData } from "../../abi/generated";
import { IpMetadataAndTxOption, LicensingConfig } from "../common";
import { IpMetadataForWorkflow } from "../../utils/getIpMetadataForWorkflow";

export type DerivativeData = {
  parentIpIds: Address[];
  licenseTermsIds: bigint[] | string[] | number[];
  maxMintingFee: bigint | string | number;
  maxRts: number | string;
  maxRevenueShare: number | string;
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
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};

export type RegisterRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  deadline?: string | number | bigint;
} & IpMetadataAndTxOption;

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
  licensingConfig: U;
};
export type MintAndRegisterIpAssetWithPilTermsRequest = {
  spgNftContract: Address;
  allowDuplicates: boolean;
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  recipient?: Address;
  royaltyPolicyAddress?: Address;
} & IpMetadataAndTxOption;

export type MintAndRegisterIpAssetWithPilTermsResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
  licenseTermsIds?: bigint[];
};

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  deadline?: string | number | bigint;
  derivData: DerivativeData;
  sigMetadataAndRegister?: {
    signer: Address;
    deadline: bigint | string | number;
    signature: Hex;
  };
} & IpMetadataAndTxOption;

export type RegisterIpAndMakeDerivativeResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};

export type RegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  deadline?: bigint | number | string;
} & IpMetadataAndTxOption;

export type RegisterIpAndAttachPilTermsResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  licenseTermsIds?: bigint[];
  tokenId?: bigint;
};

export type MintAndRegisterIpAndMakeDerivativeRequest = {
  spgNftContract: Address;
  derivData: DerivativeData;
  recipient?: Address;
  allowDuplicates: boolean;
} & IpMetadataAndTxOption;

export type MintAndRegisterIpAndMakeDerivativeResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  childIpId?: Address;
  tokenId?: bigint;
};
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
} & IpMetadataAndTxOption;

export type RegisterPilTermsAndAttachRequest = {
  ipId: Address;
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
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
} & IpMetadataAndTxOption;

export type RegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  licenseTokenIds: string[] | bigint[] | number[];
  deadline?: string | number | bigint;
  maxRts: number | string;
} & IpMetadataAndTxOption;

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
  txHash: Hex;
  results?: IpIdAndTokenId<"nftContract">[];
};

export type RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[];
  deadline?: string | number | bigint;
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
  recipient: Address;
  percentage: number;
};
export type IpIdAndTokenId<T extends string | undefined> = T extends undefined
  ? { ipId: Address; tokenId: bigint }
  : { ipId: Address; tokenId: bigint } & { [T: string]: Address };

export type RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  deadline?: string | number | bigint;
  derivData: DerivativeData;
  royaltyShares: RoyaltyShare[];
  ipMetadata?: IpMetadataForWorkflow;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse = {
  registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: Address;
  distributeRoyaltyTokensTxHash: Address;
  ipId: Address;
  tokenId: bigint;
  ipRoyaltyVault: Address;
};

export type MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest = {
  spgNftContract: Address;
  allowDuplicates: boolean;
  licenseTermsData: {
    terms: RegisterPILTermsRequest;
    licensingConfig: LicensingConfig;
  }[];
  royaltyShares: RoyaltyShare[];
  recipient?: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & IPMetadataInfo;

export type MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse = {
  txHash: Hex;
  ipId?: Address;
  licenseTermsIds?: bigint[];
  ipRoyaltyVault?: Address;
  tokenId?: bigint;
};
export type MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest = {
  spgNftContract: Address;
  derivData: DerivativeData;
  royaltyShares: RoyaltyShare[];
  allowDuplicates: boolean;
  recipient?: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
} & IPMetadataInfo;

export type MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse = {
  txHash: Hex;
  ipId?: Address;
  tokenId?: bigint;
};
