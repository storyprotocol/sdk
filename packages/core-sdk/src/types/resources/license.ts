import { TxOptions } from "../options";

export type License = {
  id: string;
  amount: string;
  creator: string;
  licenseId: string;
  receiver: string;
  licenseData: Record<string, unknown>;
};

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
  // isNew?: boolean;
};

export type LinkIpToParentRequest = {
  licenseIds: string[];
  childIpId: string;
  minRoyalty: number;
  txOptions?: TxOptions;
};

export type LinkIpToParentResponse = {
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
