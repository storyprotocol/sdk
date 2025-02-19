import { Address } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";
import { IpMetadataAndTxOptions, LicensingConfig, ValidatedLicensingConfig } from "../common";

export type LicenseData = {
  licenseTermsId: string | bigint | number;
  licensingConfig?: LicensingConfig;
  licenseTemplate?: Address;
};

export type ValidatedLicenseData = {
  licenseTermsId: bigint;
  licensingConfig: ValidatedLicensingConfig;
  licenseTemplate: Address;
};
export type MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
  spgNftContract: Address;
  /** The ID of the group IP to add the newly registered IP. */
  groupId: Address;
  /** Set to true to allow minting an NFT with a duplicate metadata hash. */
  allowDuplicates: boolean;
  /** The maximum reward share percentage that can be allocated to each member IP. */
  maxAllowedRewardShare: number | string;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseData[];
  /**
   * The address of the recipient of the minted NFT.
   * @default wallet address
   */
  recipient?: Address;
  /**
   * The deadline for the signature in seconds.
   * @default 1000s
   */
  deadline?: string | number | bigint;
} & IpMetadataAndTxOptions;

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
  /** The ID of the group IP to add the newly registered IP. */
  groupId: Address;
  /**
   * The deadline for the signature in seconds.
   * @default 1000s
   */
  deadline?: bigint;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseData[];
  /** The maximum reward share percentage that can be allocated to each member IP. */
  maxAllowedRewardShare: number | string;
} & IpMetadataAndTxOptions;

export type RegisterIpAndAttachLicenseAndAddToGroupResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};
export type RegisterGroupAndAttachLicenseRequest = {
  /** The address specifying how royalty will be split amongst the pool of IPs in the group. */
  groupPool: Address;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseData;
  txOptions?: TxOptions;
};

export type RegisterGroupAndAttachLicenseResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};
export type RegisterGroupAndAttachLicenseAndAddIpsRequest = {
  /** The address specifying how royalty will be split amongst the pool of IPs in the group. */
  groupPool: Address;
  /** The IP IDs of the IPs to be added to the group. */
  ipIds: Address[];
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseData;
  /** The maximum reward share percentage that can be allocated to each member IP. */
  maxAllowedRewardShare: number | string;
  txOptions?: TxOptions;
};

export type RegisterGroupAndAttachLicenseAndAddIpsResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};
