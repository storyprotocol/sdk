import { Address } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";

export type RegisterIpResponse = {
  txHash?: string;
  ipId?: Address;
};

export type RegisterRequest = {
  tokenContract: Address;
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

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: string;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[];
    licenseTemplate?: Address;
  };
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  sigMetadata?: {
    signer: Address;
    deadline: string;
    signature: Address;
  };
  sigRegister: {
    signer: Address;
    deadline: string;
    signature: Address;
  };
};
