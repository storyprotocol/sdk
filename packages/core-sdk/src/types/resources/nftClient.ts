import { Hex } from "viem";

import { TxOptions } from "../options";
import { MethodEncode } from "../../abi/generated";

export type CreateNFTCollectionRequest = {
  name: string;
  symbol: string;
  maxSupply?: number;
  mintFee?: bigint;
  mintFeeToken?: Hex;
  owner?: Hex;
  txOptions?: TxOptions;
};

export type CreateNFTCollectionResponse = {
  txHash?: string;
  encodedTx?: MethodEncode;
  nftContract?: Hex;
};
