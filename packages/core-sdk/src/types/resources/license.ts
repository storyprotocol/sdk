import { Hex } from "viem";

import { TxOptions } from "../options";

export type LicenseApiResponse = {
  data: License;
};

export type License = {
  id: string;
  policyId: string;
  licensorIpId: Hex;
};

export type RegisterNonComSocialRemixingPILRequest = {
  txOptions?: TxOptions;
};

export type LicenseTerms = {
  mintingFee: bigint;
  expiration: bigint;
  commercialRevCelling: bigint;
  derivativeRevCelling: bigint;
  commercializerCheckerData: Hex;
  transferable: boolean;
  royaltyPolicy: Hex;
  commercialUse: boolean;
  commercialAttribution: boolean;
  commercializerChecker: Hex;
  commercialRevShare: number;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  derivativesApproval: boolean;
  derivativesReciprocal: boolean;
  currency: Hex;
  uri: string;
};
export type LicenseTermsIdResponse = bigint;

export type RegisterPILResponse = {
  licenseTermsId?: bigint;
  txHash?: string;
};

export type RegisterCommercialUsePILRequest = {
  mintingFee: string | number | bigint;
  currency: Hex;
  txOptions?: TxOptions;
};

export type RegisterCommercialRemixPILRequest = {
  mintingFee: string;
  commercialRevShare: number;
  currency: Hex;
  txOptions?: TxOptions;
};

export type AttachLicenseTermsRequest = {
  ipId: Hex;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: Hex;
  txOptions?: TxOptions;
};

export type MintLicenseTokensRequest = {
  licensorIpId: Hex;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: Hex;
  amount?: number | string | bigint;
  receiver?: Hex;
  txOptions?: TxOptions;
};

export type MintLicenseTokensResponse = {
  licenseTokenId?: bigint;
  txHash?: string;
};

export enum PIL_TYPE {
  NON_COMMERCIAL_REMIX,
  COMMERCIAL_USE,
  COMMERCIAL_REMIX,
}
