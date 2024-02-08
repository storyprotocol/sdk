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
export type addPolicyRequest = {
  frameworkId: string;
  mintingParamValues: string[];
  activationParamValues: string[];
  needsActivation: boolean;
  linkParentParamValues: string[];
  // ipId: string;
  // policyId: string;
  txOptions?: TxOptions;
};

export type addPolicyResponse = {
  txHash: string;
  policyId?: number;
  isNew?: boolean;
};

export type addPolicyToIpRequest = {
  ipId: string;
  policyId: string;
  txOptions?: TxOptions;
};

export type addPolicyToIpResponse = {
  // indexOnIpId: number;
  txHash: string;
};
