import { Hex } from "viem";

import { TxOptions } from "../options";

export type CreateNFTCollectionRequest = {
  name: string;
  symbol: string;
  maxSupply?: number;
  mintFee?: bigint;
  mintFeeToken?: Hex;
  owner?: Hex;
  txOptions?: TxOptions;
};

export type CreateNFTCollectionResponse<TReq extends CreateNFTCollectionRequest> =
  TReq["txOptions"] extends { waitForTransaction: true }
    ? { txHash: string; nftContract: Hex }
    : { txHash: string; nftContract?: Hex };
