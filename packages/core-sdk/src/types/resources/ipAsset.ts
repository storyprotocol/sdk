import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";
import { MethodEncode } from "../../abi/generated";

type Metadata = {
  metadata?: {
    metadataURI?: string;
    metadataHash?: Hex;
    nftMetadataHash?: Hex;
  };
};

export type RegisterIpResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
  ipId?: Address;
};

export type RegisterRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  txOptions?: TxOptions;
  deadline?: string | number | bigint;
} & Metadata;

export type RegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Address;
  licenseTokenIds: string[] | bigint[] | number[];
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
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
  encodedTx?: MethodEncode;
  childIpId?: Address;
};

export type CreateIpAssetWithPilTermsRequest = {
  nftContract: Address;
  pilType: PIL_TYPE;
  recipient?: Address;
  mintingFee?: string;
  currency?: Address;
  commercialRevShare?: number;
  txOptions?: TxOptions;
} & Metadata;

export type CreateIpAssetWithPilTermsResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
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
  txOptions?: TxOptions;
} & Metadata;

export type RegisterIpAndMakeDerivativeResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
  ipId?: Address;
};

export type RegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  pilType: PIL_TYPE;
  deadline?: bigint | number | string;
  mintingFee?: string;
  currency?: Address;
  commercialRevShare?: number;
  txOptions?: TxOptions;
} & Metadata;

export type RegisterIpAndAttachPilTermsResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
  ipId?: Address;
  licenseTermsId?: bigint;
};
