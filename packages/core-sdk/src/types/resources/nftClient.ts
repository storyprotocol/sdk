import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";

export type CreateNFTCollectionRequest = {
  name: string;
  symbol: string;
  isPublicMinting: boolean;
  mintOpen: boolean;
  mintFeeRecipient: Address;
  contractURI: string;
  baseURI?: string;
  maxSupply?: number;
  mintFee?: bigint;
  mintFeeToken?: Hex;
  owner?: Hex;
  txOptions?: TxOptions;
};

export type CreateNFTCollectionResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  spgNftContract?: Address;
};
