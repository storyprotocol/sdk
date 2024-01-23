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
  ipAccount: IpAccount;
};

export type ListIpAccountRequest = {
  options?: object;
};

export type ListIpAccountResponse = {
  data: IpAccount[];
};

export type RegisterIpAccountRequest = {
  chainId: string;
  tokenContractAddress: string;
  tokenId: string;
};

// RegisrationModule
export type RegisterRootIpRequest = {
  policyId: string;
  tokenContractAddress: string;
  tokenId: string;
};

export type RegisterDerivativeIpRequest = {
  licenseId: string;
  tokenContractAddress: string;
  tokenId: string;
  ipName: string;
  ipDescription: string;
  hash: string;
};

// LicenseRegistry
export type addPolicyRequest = {
  ipId: string;
  policyId: string;
};

export type addPolicyToIpRequest = {
  ipId: string;
  policyId: string;
};

export type addPolicyResponse = {
  policyId: number;
  isNew: boolean;
};

export type addPolicyToIpResponse = {
  indexOnIpId: number;
};
