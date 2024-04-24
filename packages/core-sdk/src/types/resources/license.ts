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
export type LicenseTermsIdResponse = number;

export type RegisterPILResponse = {
  licenseTermsId?: string;
  txHash?: string;
};

export type RegisterCommercialUsePILRequest = {
  mintingFee: string;
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
  licenseTermsId: string;
  licenseTemplate?: Hex;
  txOptions?: TxOptions;
};

export type MintLicenseTokensRequest = {
  licensorIpId: Hex;
  licenseTermsId: string;
  licenseTemplate?: Hex;
  amount?: number;
  receiver?: Hex;
  txOptions?: TxOptions;
};

export type MintLicenseTokensResponse = {
  licenseTokenId?: string;
  txHash?: string;
};
