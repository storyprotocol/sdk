import { TxOptions } from "../options";

export type MintLicenseRequest = {
  policyId: string;
  licensorIpId: `0x${string}`;
  mintAmount: number;
  receiverAddress: `0x${string}`;
  txOptions?: TxOptions;
};

export type MintLicenseResponse = {
  txHash: string;
  licenseId?: string;
};

export type LinkIpToParentRequest = {
  licenseIds: string[];
  childIpId: `0x${string}`;
  minRoyalty: number;
  txOptions?: TxOptions;
};

export type LinkIpToParentResponse = {
  txHash: string;
  success?: boolean;
};
