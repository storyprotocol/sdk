import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";

export type RegisterIpResponse = {
  txHash?: string;
  ipId?: Hex;
};

export type RegisterRequest = {
  tokenContract: Hex;
  tokenId: string;
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Hex;
  licenseTokenIds: string[];
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash: string;
};

export type RegisterDerivativeRequest = {
  childIpId: Hex;
  parentIpIds: Hex[];
  licenseTermsIds: string[];
  licenseTemplate?: Hex;
  txOptions?: TxOptions;
};

export type RegisterDerivativeResponse = {
  txHash?: string;
  childIpId?: Hex;
};

export type CreateIpAssetWithPilTermsRequest = {
  nftContract: Address;
  pilType: PIL_TYPE;
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  recipient?: Hex;
  mintingFee?: string;
  currency?: Hex;
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
    signature: Hex;
  };
  sigRegister: {
    signer: Address;
    deadline: string;
    signature: Hex;
  };
};
