import { Address } from "viem";

import { IpMetadataAndTxOption } from "../common";
import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";

export type MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
  spgNftContract: Address;
  licenseTermsId: string | bigint | number;
  groupId: Address;
  recipient?: Address;
  licenseTemplate?: Address;
  deadline?: string | number | bigint;
} & IpMetadataAndTxOption;

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
  licenseTemplate: Address;
  licenseTermsId: bigint | string | number;
  deadline?: bigint;
} & IpMetadataAndTxOption;

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
