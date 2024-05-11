import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";

export type RegisterIpResponse = {
  txHash?: string;
  ipId?: Address;
};

export type RegisterRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Address;
  licenseTokenIds: string[] | bigint[] | number[];
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash: string;
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
  childIpId?: Address;
};

export type CreateIpAssetWithPilTermsRequest = {
  nftContract: Address;
  pilType: PIL_TYPE;
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  recipient?: Address;
  mintingFee?: string;
  currency?: Address;
  commercialRevShare?: number;
  txOptions?: TxOptions;
};

export type CreateIpAssetWithPilTermsResponse = {
  txHash: string;
  ipId?: Address;
  tokenId?: bigint;
  licenseTermsId?: bigint;
};

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[] | bigint[] | number[];
    licenseTemplate?: Address;
  };
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  sigMetadata?: {
    signer: Address;
    deadline: string | number | bigint;
    signature: Hex;
  };
  sigRegister: {
    signer: Address;
    deadline: string | number | bigint;
    signature: Hex;
  };
  txOptions?: TxOptions;
};

export type RegisterIpAndMakeDerivativeResponse = {
  txHash: string;
  ipId?: Address;
};

export type RegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  metadata: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  pilType: PIL_TYPE;
  sigMetadata: {
    signer: Address;
    deadline: bigint | number | string;
    signature: Hex;
  };
  sigAttach: {
    signer: Address;
    deadline: bigint | number | string;
    signature: Hex;
  };
  mintingFee?: string;
  currency?: Address;
  commercialRevShare?: number;
  txOptions?: TxOptions;
};

export type RegisterIpAndAttachPilTermsResponse = {
  txHash: string;
  ipId?: Address;
  licenseTermsId?: bigint;
};
