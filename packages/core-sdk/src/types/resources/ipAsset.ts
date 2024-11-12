import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE, RegisterPILTermsRequest } from "./license";
import { EncodedTxData } from "../../abi/generated";
import { IpMetadataAndTxOption } from "../common";

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
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};

export type RegisterDerivativeRequest = {
  childIpId: Address;
  parentIpIds: Address[];
  licenseTermsIds: string[] | bigint[] | number[];
  licenseTemplate?: Address;
  txOptions?: TxOptions;
};

export type RegisterDerivativeResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};

export type CreateIpAssetWithPilTermsRequest = {
  spgNftContract: Address;
  pilType: PIL_TYPE;
  currency?: Address;
  mintingFee?: string | number | bigint;
  recipient?: Address;
  commercialRevShare?: number;
  royaltyPolicyAddress?: Address;
} & IpMetadataAndTxOption;

export type CreateIpAssetWithPilTermsResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
  licenseTermsId?: bigint;
};

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  deadline?: string | number | bigint;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[] | bigint[] | number[];
    licenseTemplate?: Address;
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
  pilType: PIL_TYPE;
  mintingFee: string | number | bigint;
  currency: Address;
  deadline?: bigint | number | string;
  commercialRevShare?: number;
  royaltyPolicyAddress?: Address;
} & IpMetadataAndTxOption;

export type RegisterIpAndAttachPilTermsResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  licenseTermsId?: bigint;
  tokenId?: bigint;
};

export type MintAndRegisterIpAndMakeDerivativeRequest = {
  spgNftContract: Address;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[] | bigint[] | number[];
    licenseTemplate?: Address;
  };
  recipient?: Address;
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
} & IpMetadataAndTxOption;

export type RegisterPilTermsAndAttachRequest = {
  ipId: Address;
  terms: RegisterPILTermsRequest;
  deadline?: string | number | bigint;
  txOptions?: TxOptions;
};

export type RegisterPilTermsAndAttachResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
  licenseTermsId?: bigint;
};

export type MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  spgNftContract: Address;
  licenseTokenIds: string[] | bigint[] | number[];
  recipient?: Address;
} & IpMetadataAndTxOption;

export type RegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  licenseTokenIds: string[] | bigint[] | number[];
  deadline?: string | number | bigint;
} & IpMetadataAndTxOption;

export type BatchMintAndRegisterIpAssetWithPilTermsRequest = {
  args: Omit<CreateIpAssetWithPilTermsRequest, "txOptions">[];
  txOptions?: Omit<TxOptions, "EncodedTxData">;
};

export type BatchMintAndRegisterIpAssetWithPilTermsResponse = {
  txHash: Hex;
  results?: Omit<RegisterIpResponse, "encodedTxData">[];
};

export type BatchRegisterDerivativeRequest = {
  args: RegisterDerivativeRequest[];
  deadline?: string | number | bigint;
  txOptions?: TxOptions;
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
  results?: { ipId: Address; tokenId: bigint }[];
};

export type BatchRegisterRequest = {
  args: Omit<RegisterRequest, "txOptions">[];
  txOptions?: TxOptions;
};

export type BatchRegisterResponse = {
  txHash: Hex;
  results?: { ipId: Address; tokenId: bigint }[];
};
