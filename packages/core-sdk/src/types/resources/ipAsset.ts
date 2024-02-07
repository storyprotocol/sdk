import { TxOptions } from "../options";

// -----------------------------------------------------
// IPAccountRegistry
// -----------------------------------------------------
export type IpAsset = {
  id: string;
  ipId: string;
  chainId: number;
  tokenContract: string;
  tokenId: number;
  metadataResolverAddress: string;
};

export type RegisterIpAssetRequest = {
  chainId: string;
  tokenContractAddress: string;
  tokenId: string;
  txOptions?: TxOptions;
};

export type RegisterIpAssetResponse = {
  txHash: string;
  ipAccountId?: string;
};

// RegisrationModule
export type RegisterRootIpRequest = {
  policyId: string;
  tokenContractAddress: string;
  tokenId: string;
  txOptions?: TxOptions;
};

export type RegisterRootIpResponse = {
  txHash: string;
  ipAccountId?: string;
};

export type RegisterDerivativeIpRequest = {
  licenseId: string;
  tokenContractAddress: string;
  tokenId: string;
  ipName: string;
  ipDescription: string;
  hash: string;
  txOptions?: TxOptions;
};

export type RegisterDerivativeIpResponse = {
  txHash: string;
  ipAccountId?: string;
};

// LicenseRegistry
export type AddPolicyRequest = {
  frameworkId: string;
  mintingParamValues: string[];
  activationParamValues: string[];
  needsActivation: boolean;
  linkParentParamValues: string[];
  // ipId: string;
  // policyId: string;
  txOptions?: TxOptions;
};

export type AddPolicyToIpRequest = {
  ipId: string;
  policyId: string;
};

export type AddPolicyResponse = {
  txHash: string;
  policyId?: number;
  isNew?: boolean;
};

export type AddPolicyToIpResponse = {
  indexOnIpId: number;
};
