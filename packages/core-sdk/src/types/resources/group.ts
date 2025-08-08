import { Address, Hash, TransactionReceipt } from "viem";

import {
  EncodedTxData,
  GroupingModuleClaimedRewardEvent,
  GroupingModuleCollectedRoyaltiesToGroupPoolEvent,
} from "../../abi/generated";
import { IpMetadataAndTxOptions, LicensingConfig, LicensingConfigInput } from "../common";
import { TxOptions } from "../options";

export type LicenseDataInput = {
  licenseTermsId: bigint | number | string;
  /**
   * The address of the license template.
   * Defaults to {@link https://docs.story.foundation/docs/programmable-ip-license | PIL} address if not provided.
   */
  licensingConfig?: LicensingConfigInput;
  licenseTemplate?: Address;
};

export type LicenseData = {
  licenseTermsId: bigint;
  licensingConfig: LicensingConfig;
  licenseTemplate: Address;
};
export type MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
  spgNftContract: Address;
  /** The ID of the group IP to add the newly registered IP. */
  groupId: Address;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default true
   */
  allowDuplicates?: boolean;
  /** The maximum reward share percentage that can be allocated to each member IP. */
  maxAllowedRewardShare: number;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseDataInput[];
  /** The address of the recipient of the minted NFT. If not provided, the function will use the user's own wallet address. */
  recipient?: Address;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint | number;
} & IpMetadataAndTxOptions;

export type MintAndRegisterIpAndAttachLicenseAndAddToGroupResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};
export type RegisterGroupRequest = {
  /** The address specifying how royalty will be split amongst the pool of IPs in the group. */
  groupPool: Address;
  txOptions?: TxOptions;
};

export type RegisterGroupResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};
export type RegisterIpAndAttachLicenseAndAddToGroupRequest = {
  nftContract: Address;
  tokenId: bigint | number | string;
  /** The ID of the group IP to add the newly registered IP. */
  groupId: Address;
  /**
   * The deadline for the signature in seconds.
   * @default 1000
   */
  deadline?: bigint;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseDataInput[];
  /** The maximum reward share percentage that can be allocated to each member IP. */
  maxAllowedRewardShare: number;
} & IpMetadataAndTxOptions;

export type RegisterIpAndAttachLicenseAndAddToGroupResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  ipId?: Address;
  tokenId?: bigint;
};
export type RegisterGroupAndAttachLicenseRequest = {
  /** The address specifying how royalty will be split amongst the pool of IPs in the group. */
  groupPool: Address;
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseDataInput;
  txOptions?: TxOptions;
};

export type RegisterGroupAndAttachLicenseResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};
export type RegisterGroupAndAttachLicenseAndAddIpsRequest = {
  /** The address specifying how royalty will be split amongst the pool of IPs in the group. */
  groupPool: Address;
  /** The IP IDs of the IPs to be added to the group. */
  ipIds: Address[];
  /** The data of the license and its configuration to be attached to the new group IP. */
  licenseData: LicenseDataInput;
  /** The maximum reward share percentage that can be allocated to each member IP. */
  maxAllowedRewardShare: number;
  txOptions?: TxOptions;
};

export type RegisterGroupAndAttachLicenseAndAddIpsResponse = {
  txHash?: Hash;
  encodedTxData?: EncodedTxData;
  groupId?: Address;
};

export type CollectAndDistributeGroupRoyaltiesRequest = {
  groupIpId: Address;
  /** The addresses of the currency (revenue) tokens to claim. */
  currencyTokens: Address[];
  /** The IDs of the member IPs to distribute the rewards to. */
  memberIpIds: Address[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type CollectAndDistributeGroupRoyaltiesResponse = {
  txHash: Hash;
  receipts?: TransactionReceipt[];
  collectedRoyalties?: Omit<GroupingModuleCollectedRoyaltiesToGroupPoolEvent, "pool">[];
  royaltiesDistributed?: {
    ipId: Address;
    amount: bigint;
    token: Address;
    /**
     * Amount after the fee to the royalty module treasury.
     */
    amountAfterFee: bigint;
  }[];
};

export type AddIpRequest = {
  groupIpId: Address;
  /**
   * The addresses of the IPs to add to the Group IP.
   * IP IDs must be attached to the group IP license terms.
   */
  ipIds: Address[];
  /**
   * The maximum reward share percentage that can be allocated to each member IP.
   * Must be between 0 and 100 (where 100% represents 100_000_000).
   * @default 100
   */
  maxAllowedRewardSharePercentage?: number;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type ClaimRewardRequest = {
  groupIpId: Address;
  /** The address of the currency (revenue) token to claim. */
  currencyToken: Address;
  /** The IDs of the member IPs to distribute the rewards to. */
  memberIpIds: Address[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type ClaimRewardResponse = {
  txHash: Hash;
  claimedReward?: GroupingModuleClaimedRewardEvent[];
};
export type GetClaimableRewardRequest = {
  groupIpId: Address;
  currencyToken: Address;
  memberIpIds: Address[];
};

export type RemoveIpsFromGroupRequest = {
  groupIpId: Address;
  ipIds: Address[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type CollectRoyaltiesRequest = {
  groupIpId: Address;
  currencyToken: Address;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type CollectRoyaltiesResponse = {
  txHash: Hash;
  /** The amount of royalties collected. */
  collectedRoyalties?: bigint;
};
