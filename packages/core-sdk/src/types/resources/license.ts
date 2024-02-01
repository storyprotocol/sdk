import { Address } from "viem";

import { QueryOptions, TxOptions } from "../options";

export type License = {
  id: string;
  amount: string;
  creator: string;
  licenseId: string;
  receiver: string;
  licenseData: Record<string, unknown>;
};

export type GetLicenseRequest = {
  licenseId: string;
};
export type GetLicenseResponse = {
  data: License;
};
export type ListLicensesRequest = {
  options?: QueryOptions;
};
export type ListLicensesResponse = {
  data: License[];
};

export type mintLicenseRequest = {
  policyId: string;
  licensorIps: Address[];

  mintAmount: string;
  receiverAddress: string;
  txOptions?: TxOptions;
};

export type mintLicenseResponse = {
  txHash: string;
  licenseId?: string;
  // isNew?: boolean;
};

export type linkIpToParentRequest = {
  licenseId: string;
  childIpId: string;
  holderAddress: string;
  txOptions?: TxOptions;
};

export type linkIpToParentResponse = {
  txHash: string;
  // licenseId?: number;
  // isNew?: boolean;
};

export type transferRequest = {
  // address indexed _operator,
  // address indexed _from,
  // address indexed _to,
  // uint256 _id,
  // uint256 _value
  operator: string;
  fromAddress: string;
  toAddress: string;
  id: string;
  value: string;
};

export type transferResponse = {
  txHash?: string;
};
