import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE, RegisterPILTermsRequest } from "./license";
import { EncodedTxData } from "../../abi/generated";

type IpMetadataAndTxOption = {
  ipMetadata?: {
    ipMetadataURI?: string;
    ipMetadataHash?: Hex;
    nftMetadataURI?: string;
    nftMetadataHash?: Hex;
  };
  txOptions?: TxOptions;
};

export type RegisterIpResponse = {
  txHash?: string;
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
  txHash?: string;
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
  txHash?: string;
  encodedTxData?: EncodedTxData;
  childIpId?: Address;
};

export type CreateIpAssetWithPilTermsRequest = {
  spgNftContract: Address;
  pilType: PIL_TYPE;
  currency?: Address;
  mintingFee?: string | number | bigint;
  recipient?: Address;
  commercialRevShare?: number;
} & IpMetadataAndTxOption;

export type CreateIpAssetWithPilTermsResponse = {
  txHash?: string;
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
  txHash?: string;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
};

export type RegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  pilType: PIL_TYPE;
  mintingFee: string | number | bigint;
  currency: Address;
  deadline?: bigint | number | string;
  commercialRevShare?: number;
} & IpMetadataAndTxOption;

export type RegisterIpAndAttachPilTermsResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  licenseTermsId?: bigint;
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
  txHash?: string;
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
