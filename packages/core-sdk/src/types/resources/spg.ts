import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";

export type CreateSPGNFTCollectionRequest = {
  name: string;
  symbol: string;
  maxSupply: number;
  mintCost: string | number | bigint;
  mintToken?: Address;
  owner?: Address;
  txOptions?: TxOptions;
};

export type CreateSPGNFTCollectionResponse = {
  txHash: string;
  nftContract?: Hex;
};

export type MintAndRegisterIpAndAttachPilTermsRequest = {
  nftContract: Address;
  pilType: PIL_TYPE;
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  recipient?: Hex;
  mintingFee?: string;
  currency?: Hex;
  commercialRevShare?: number;
  txOptions?: TxOptions;
};

export type RegisterIpAndMakeDerivativeRequest = {
  nftContract: Address;
  tokenId: string | number | bigint;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[] | bigint[] | number[];
    licenseTemplate?: Address;
  };
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  sigMetadata?: {
    signer: Address;
    deadline: string | number | bigint;
    signature: Hex;
  };
  sigRegister: {
    signer: Address;
    deadline: string | number | bigint;
    signature: Hex;
  };
};