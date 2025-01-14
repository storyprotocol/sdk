import { Address, Hex } from "viem";

import { TxOptions } from "./options";

export type TypedData = {
  interface: string;
  data: unknown[];
};

export type IpMetadataAndTxOption = {
  ipMetadata?: {
    ipMetadataURI?: string;
    ipMetadataHash?: Hex;
    nftMetadataURI?: string;
    nftMetadataHash?: Hex;
  };
  txOptions?: TxOptions;
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
