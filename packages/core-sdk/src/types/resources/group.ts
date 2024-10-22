import { Address } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";
import { IpMetadataAndTxOption } from "../common";

export type MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
  spgNftContract: Address;
  licenseTermsId: string | bigint | number;
  groupId: Address;
  recipient?: Address;
  licenseTemplate?: Address;
  deadline?: string | number | bigint;
} & IpMetadataAndTxOption;

export type MintAndRegisterIpAndAttachLicenseAndAddToGroupResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};
export type RegisterGroupRequest = {
  groupPool: Address;
  txOptions?: TxOptions;
};

export type RegisterGroupResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};

export type RegisterIpAndAttachLicenseAndAddToGroupRequest = {
  nftContract: Address;
  tokenId: bigint | string | number;
  groupId: Address;
  licenseTermsId: bigint | string | number;
  licenseTemplate?: Address;
  deadline?: bigint;
} & IpMetadataAndTxOption;

export type RegisterIpAndAttachLicenseAndAddToGroupResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};
export type RegisterGroupAndAttachLicenseRequest = {
  groupPool: Address;
  licenseTermsId: bigint | string | number;
  licenseTemplate?: Address;
  txOptions?: TxOptions;
};

export type RegisterGroupAndAttachLicenseResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};

export type RegisterGroupAndAttachLicenseAndAddIpsRequest = {
  groupPool: Address;
  ipIds: Address[];
  licenseTermsId: bigint | string | number;
  licenseTemplate?: Address;
  txOptions?: TxOptions;
};

export type RegisterGroupAndAttachLicenseAndAddIpsResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};
