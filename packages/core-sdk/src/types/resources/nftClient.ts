import { Address, Hash } from "viem";

import { TxOptions } from "../options";

export type CreateNFTCollectionRequest = {
  name: string;
  symbol: string;
  /** If true, anyone can mint from the collection. If false, only the addresses with the minter role can mint. */
  isPublicMinting: boolean;
  /** Whether the collection is open for minting on creation. */
  mintOpen: boolean;
  /** The address to receive mint fees. */
  mintFeeRecipient: Address;
  /** The contract URI for the collection. Follows ERC-7572 standard. See https://eips.ethereum.org/EIPS/eip-7572. */
  contractURI: string;
  /** The base URI for the collection. If baseURI is not empty, tokenURI will be either baseURI + token ID (if nftMetadataURI is empty) or baseURI + nftMetadataURI. */
  baseURI?: string;
  maxSupply?: number;
  /** The cost to mint a token. */
  mintFee?: bigint;
  /** The token to mint. */
  mintFeeToken?: Address;
  /** The owner of the collection. */
  owner?: Address;
  txOptions?: TxOptions;
};

export type CreateNFTCollectionResponse = {
  txHash?: Hash;
  spgNftContract?: Address;
};

export type SetTokenURIRequest = {
  tokenId: bigint | number;
  /** The new metadata URI to associate with the token. */
  tokenURI: string;
  spgNftContract: Address;
  txOptions?: TxOptions;
};

export type GetTokenURIRequest = {
  tokenId: bigint | number;
  spgNftContract: Address;
};
