import { Hex } from "viem";

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
