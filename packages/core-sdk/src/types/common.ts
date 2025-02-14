import { Address, Hex } from "viem";

import { WithTxOptions } from "./options";
import { IpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";

export type TypedData = {
  interface: string;
  data: unknown[];
};

export type IpMetadataAndTxOptions = WithTxOptions & {
  /** The desired metadata for the newly minted NFT and newly registered IP. */
  ipMetadata?: Partial<IpMetadataForWorkflow>;
};
export type LicensingConfig = {
  /** Whether the configuration is set or not
   * @default false
   */
  isSet?: boolean;
  /** The minting fee to be paid when minting license tokens.
   * @default 0
   */
  mintingFee?: bigint | string | number;
  /** The hook contract address for the licensing module, or address(0) if none.
   * @default address(0)
   */
  licensingHook?: Address;
  /** The data to be used by the licensing hook.
   * @default address(0)
   */
  hookData?: Hex;
  /** The commercial revenue share percentage (from 0 to 100%, represented as 100_000_000).
   * @default 0
   */
  commercialRevShare?: number | string;
  /** Whether the licensing is disabled or not.
   * @default false
   */
  disabled?: boolean;
  /** The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   * If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   * @default 0
   */
  expectMinimumGroupRewardShare?: number | string;
  /** The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
   * @default address(0)
   */
  expectGroupRewardPool?: Address;
};

export type ValidatedLicensingConfig = {
  mintingFee: bigint;
  commercialRevShare: number;
  expectMinimumGroupRewardShare: number;
} & MakeRequired<LicensingConfig>;

/**
 * Input for token amount, can be bigint or number.
 * Will be converted to bigint for contract calls.
 */
export type TokenAmountInput = bigint | number;
// Make all properties in T required
export type MakeRequired<T> = {
  [P in keyof T]-?: T[P];
};
