import { Address, Hex } from "viem";

import { WithTxOptions } from "./options";
import { IpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";

export type TypedData = {
  interface: string;
  data: unknown[];
};

export type IpMetadataAndTxOptions = WithTxOptions & {
  /** The desired metadata for the newly minted NFT and newly registered IP. */
  ipMetadataInput?: Partial<IpMetadataForWorkflow>;
};

/**
 * This data used IP owners to define the configuration
 * when others are minting license tokens of their IP through the LicensingModule.
 * @see {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/lib/Licensing.sol#L27 | Licensing.sol}
 */
export type LicensingConfigInput = {
  /** Whether the configuration is set or not */
  isSet: boolean;
  /** The minting fee to be paid when minting license tokens. */
  mintingFee: bigint | string | number;
  /** The hook contract address for the licensing module, or zero address if none. */
  licensingHook: Address;
  /**
   * The data to be used by the licensing hook.
   * Set to a zero hash if no data is provided.
   */
  hookData: Hex;
  /** The commercial revenue share percentage (from 0 to 100%, represented as 100_000_000). */
  commercialRevShare: number | string;
  /** Whether the licensing is disabled or not. */
  disabled: boolean;
  /** The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100_000_000) that can be allocated to the IP when it is added to the group. */
  expectMinimumGroupRewardShare: number | string;
  /** The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or zero address if the IP does not want to be added to any group. */
  expectGroupRewardPool: Address;
};

export type LicensingConfig = LicensingConfigInput & {
  mintingFee: bigint;
  commercialRevShare: number;
  expectMinimumGroupRewardShare: number;
};

/**
 * Input for token amount, can be bigint or number.
 * Will be converted to bigint for contract calls.
 */
export type TokenAmountInput = bigint | number;

/**
 * The type of revenue share.
 * It is used to determine the type of revenue share to be used in the revenue share calculation and throw error when the revenue share is not valid.
 */
export enum RevShareType {
  COMMERCIAL_REVENUE_SHARE = "CommercialRevShare",
  MAX_REVENUE_SHARE = "MaxRevenueShare",
  MAX_ALLOWED_REWARD_SHARE = "MaxAllowedRewardShare",
}
