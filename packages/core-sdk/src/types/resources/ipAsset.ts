import { QueryOptions, TxOptions } from "../options";

/**
 * Core data model for IP Org.
 *
 * @public
 */
export type IPOrg = {
  id: string;
  name: string;
  symbol: string;
  owner: string;
  baseUri?: string;
  contractUri?: string;
  ipAssetTypes: Array<string>;
  createdAt: string; // ISO 8601
  txHash: string;
};

/**
 * Request type for iporg.get method.
 *
 * @public
 */
export type GetIPOrgRequest = {
  ipOrgId: string;
};

/**
 * Response type for iporg.get method.
 *
 * @public
 */
export type GetIPOrgResponse = {
  ipOrg: IPOrg;
};

/**
 * Request type for iporg.create method.
 *
 * @public
 */
export type CreateIPOrgRequest = {
  name: string;
  symbol: string;
  owner?: string;
  ipAssetTypes: Array<string>;
  txOptions?: TxOptions;
};

/**
 * Response type for iporg.create method.
 *
 * @public
 */
export type CreateIPOrgResponse = {
  txHash: string;
  ipOrgId?: string;
};

/**
 * Request type for iporg.list method.
 *
 * @public
 */
export type ListIPOrgRequest = {
  options?: QueryOptions;
};

/**
 * Response type for iporg.list method.
 *
 * @public
 */
export type ListIPOrgResponse = {
  ipOrgs: IPOrg[];
};

// IPAccountRegistry
export type IpAccount = {
  IpId: string;
};

export type GetIpAccountRequest = {
  ipId: string;

  // chainId: string;
  // tokenContractAddress: string;
  // tokenId: string;
};

export type GetIpAccountResponse = {
  ipAsset: IpAccount;
};

export type ListIpAccountRequest = {
  options?: QueryOptions;
};

export type ListIpAccountResponse = {
  data: IpAccount[];
};

export type RegisterIpAccountRequest = {
  chainId: string;
  tokenContractAddress: string;
  tokenId: string;
  txOptions?: TxOptions;
};

export type RegisterIpAccountResponse = {
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

export type addPolicyToIpRequest = {
  ipId: string;
  policyId: string;
};

export type addPolicyResponse = {
  txHash: string;
  policyId?: number;
  isNew?: boolean;
};

export type addPolicyToIpResponse = {
  indexOnIpId: number;
};
