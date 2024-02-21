import { TxOptions } from "../options";

export type RegisterRootIpRequest = {
  tokenContractAddress: string;
  tokenId: string;
  policyId?: string;
  ipName?: string;
  contentHash?: `0x${string}`;
  uri?: string;
  txOptions?: TxOptions;
};

export type RegisterRootIpResponse = {
  txHash: string;
  ipId?: string;
};

export type RegisterDerivativeIpRequest = {
  licenseIds: string[];
  tokenContractAddress: string;
  tokenId: string;
  ipName?: string;
  contentHash?: `0x${string}`;
  uri?: string;
  minRoyalty?: number;
  txOptions?: TxOptions;
};

export type RegisterDerivativeIpResponse = {
  txHash: string;
  ipId?: string;
};
