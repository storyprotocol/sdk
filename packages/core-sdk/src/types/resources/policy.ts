import { TxOptions } from "../options";

export type RegisterPILPolicyRequest = {
  transferable: boolean;
  royaltyPolicy?: `0x${string}`;
  mintingFee?: string;
  mintingFeeToken?: `0x${string}`;
  attribution?: boolean;
  commercialUse?: boolean;
  commercialAttribution?: boolean;
  commercialRevShare?: number;
  derivativesAllowed?: boolean;
  derivativesAttribution?: boolean;
  derivativesApproval?: boolean;
  derivativesReciprocal?: boolean;
  territories?: string[];
  distributionChannels?: string[];
  contentRestrictions?: string[];
  commercializerChecker?: `0x${string}`;
  commercializerCheckerData?: string;
  txOptions?: TxOptions;
};

export type RegisterPILPolicyResponse = {
  txHash: string;
  policyId?: string;
};

export type RegisterPILSocialRemixPolicyRequest = {
  territories?: string[];
  distributionChannels?: string[];
  contentRestrictions?: string[];
  txOptions?: TxOptions;
};

export type RegisterPILSocialRemixPolicyResponse = {
  txHash: string;
  policyId?: string;
};

export type RegisterPILCommercialUsePolicyRequest = {
  commercialRevShare: number;
  mintingFee?: string;
  mintingFeeToken?: `0x${string}`;
  territories?: string[];
  distributionChannels?: string[];
  contentRestrictions?: string[];
  txOptions?: TxOptions;
};

export type RegisterPILCommercialUsePolicyResponse = {
  txHash: string;
  policyId?: string;
};

export type AddPolicyToIpRequest = {
  ipId: `0x${string}`;
  policyId: string;
  txOptions?: TxOptions;
};

export type AddPolicyToIpResponse = {
  txHash: string;
  index?: string;
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
