import { Hex } from "viem";

import { TxOptions } from "../options";

export type CreateSPGNFTCollectionRequest = {
  name: string;
  symbol: string;
  maxSupply?: number;
  mintCost?: bigint;
  mintToken?: Hex;
  owner?: Hex;
  txOptions?: TxOptions;
};

export type CreateSPGNFTCollectionResponse<TReq extends CreateSPGNFTCollectionRequest> =
  TReq["txOptions"] extends { waitForTransaction: true }
    ? { txHash: string; nftContract: Hex }
    : { txHash: string; nftContract?: Hex };
