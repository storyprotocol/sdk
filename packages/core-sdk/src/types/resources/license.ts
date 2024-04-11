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

export type RegisterLicenseTermsRequest = {
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
};
export type LicenseTermsIdResponse = number;

export type RegisterLicenseTermsResponse = {
  licenseId?: string;
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
  licenseTemplate?: Hex;
  licenseTermsId: string;
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

export type PolicyApiResponse = {
  data: Policy;
};

export type Policy = {
  id: string;
  pil: PILData;
};

export type PILData = {
  commercialRevShare: string;
};
