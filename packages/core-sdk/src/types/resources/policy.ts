import { TxOptions } from "../options";

export type RegisterUMLPolicyRequest = {
  transferable: boolean;
  royaltyPolicy?: `0x${string}`;
  attribution?: boolean;
  commercialUse?: boolean;
  commercialAttribution?: boolean;
  commercialRevShare?: number;
  derivativesAllowed?: boolean;
  derivativesAttribution?: boolean;
  derivativesApproval?: boolean;
  derivativesReciprocal?: boolean;
  derivativesRevShare?: number;
  territories?: string[];
  distributionChannels?: string[];
  contentRestrictions?: string[];
  commercializers?: string[];
  txOptions?: TxOptions;
};

export type RegisterUMLPolicyResponse = {
  txHash: string;
  policyId?: string;
};

export type AddPolicyToIpRequest = {
  ipId: string;
  policyId: string;
  txOptions?: TxOptions;
};

export type AddPolicyToIpResponse = {
  txHash: string;
  index?: string;
};
