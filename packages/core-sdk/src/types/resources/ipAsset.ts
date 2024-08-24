import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";
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
  nftContract: Address;
  pilType: PIL_TYPE;
  currency?: Address;
  mintingFee?: string | number | bigint;
  recipient?: Address;
  commercialRevShare?: number;
  nftMetadata?: string;
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
  nftContract: Address;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[] | bigint[] | number[];
    licenseTemplate?: Address;
  };
  nftMetadata?: string;
  recipient?: Address;
} & IpMetadataAndTxOption;
