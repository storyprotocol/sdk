import { Address, Hex } from "viem";

import { WithTxOptions } from "./options";
import { IpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";

export type TypedData = {
  interface: string;
  data: unknown[];
};

export type IpMetadataAndTxOptions = WithTxOptions & {
  ipMetadata?: Partial<IpMetadataForWorkflow>;
};

export type LicensingConfig = {
  isSet: boolean;
  mintingFee: bigint | string | number;
  licensingHook: Address;
  hookData: Hex;
  commercialRevShare: number | string;
  disabled: boolean;
  expectMinimumGroupRewardShare: number | string;
  expectGroupRewardPool: Address;
};

export type InnerLicensingConfig = {
  mintingFee: bigint;
  commercialRevShare: number;
  expectMinimumGroupRewardShare: number;
} & LicensingConfig;

/**
 * Input for token amount, can be bigint or number.
 * Will be converted to bigint for contract calls.
 */
export type TokenAmountInput = bigint | number;
