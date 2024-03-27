import { Hex } from "viem";
import { TxOptions } from "../options";

export type RegisterRootIpRequest = {
  tokenContractAddress: Hex;
  tokenId: string;
  policyId?: string;
  ipName?: string;
  contentHash?: Hex;
  uri?: string;
  txOptions?: TxOptions;
};

export type RegisterRootIpResponse = {
  txHash?: string;
  ipId?: string;
};

export type RegisterDerivativeIpRequest = {
  licenseIds: string[];
  tokenContractAddress: Hex;
  tokenId: string;
  ipName?: string;
  contentHash?: Hex;
  uri?: string;
  txOptions?: TxOptions;
};

export type RegisterDerivativeIpResponse = {
  txHash?: string;
  ipId?: string;
};
