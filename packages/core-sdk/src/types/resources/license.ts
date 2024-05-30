import { Address } from "viem";

import { TxOptions } from "../options";

export type LicenseApiResponse = {
  data: License;
};

export type License = {
  id: string;
  policyId: string;
  licensorIpId: Address;
};

export type RegisterNonComSocialRemixingPILRequest = {
  txOptions?: TxOptions;
};

export type LicenseTerms = {
  mintingFee: bigint;
  expiration: bigint;
  commercialRevCelling: bigint;
  derivativeRevCelling: bigint;
  commercializerCheckerData: Address;
  transferable: boolean;
  royaltyPolicy: Address;
  commercialUse: boolean;
  commercialAttribution: boolean;
  commercializerChecker: Address;
  commercialRevShare: number;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  derivativesApproval: boolean;
  derivativesReciprocal: boolean;
  currency: Address;
  uri: string;
};
export type LicenseTermsIdResponse = bigint;

export type RegisterPILResponse = {
  licenseTermsId?: bigint;
  txHash?: string;
};

export type RegisterCommercialUsePILRequest = {
  mintingFee: string | number | bigint;
  currency: Address;
  txOptions?: TxOptions;
};

export type RegisterCommercialRemixPILRequest = {
  mintingFee: string;
  commercialRevShare: number;
  currency: Address;
  txOptions?: TxOptions;
};

export type AttachLicenseTermsRequest = {
  ipId: Address;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: Address;
  txOptions?: TxOptions;
};

export type MintLicenseTokensRequest = {
  licensorIpId: Address;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: Address;
  amount?: number | string | bigint;
  receiver?: Address;
  txOptions?: TxOptions;
};

export type MintLicenseTokensResponse = {
  licenseTokenIds?: bigint[];
  txHash?: string;
};

export enum PIL_TYPE {
  NON_COMMERCIAL_REMIX,
  COMMERCIAL_USE,
  COMMERCIAL_REMIX,
}
