import { TxOptions } from "../options";

export type Term = {
  key: string;
  value: string;
};

export type Policy = {
  // id: string;
  // creator: string;
  // frameworkId: string;
  // terms: Term[];
  // url: string;
  policyId: string;
  creator: string;
  frameworkId: string;
  blockNumber: string;
  blockTimestamp: string;

  // "policyId": "1",
  // "creator": "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
  // "frameworkId": "1",
  // "blockNumber": "5148052",
  // blockTimestamp: "1706139240";
};

// LicenseRegistry
export type RegisterUMLPolicyRequest = {
  transferable: boolean;
  royaltyPolicy: `0x${string}`;
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
  // indexOnIpId: number;
  txHash: string;
};
