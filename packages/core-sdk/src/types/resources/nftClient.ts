import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";

export type CreateNFTCollectionRequest = {
  name: string;
  symbol: string;
  /** Whether the minting is public. */
  isPublicMinting: boolean;
  /** Whether the minting is open. */
  mintOpen: boolean;
  /** If true, anyone can mint from the collection. If false, only the addresses with the minter role can mint. */
  mintFeeRecipient: Address;
  /** The contract URI for the collection. Follows ERC-7572 standard. See https://eips.ethereum.org/EIPS/eip-7572. */
  contractURI: string;
  /** The base URI for the collection. If baseURI is not empty, tokenURI will be either baseURI + token ID (if nftMetadataURI is empty) or baseURI + nftMetadataURI. */
  baseURI?: string;
  maxSupply?: number;
  /** The cost to mint a token. */
  mintFee?: bigint;
  /** The token to mint. */
  mintFeeToken?: Hex;
  /** The owner of the collection. */
  owner?: Hex;
  txOptions?: TxOptions;
};

export type CreateNFTCollectionResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  spgNftContract?: Address;
};
