import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { PIL_TYPE } from "./license";

export type CreateSPGNFTCollectionRequest = {
  name: string;
  symbol: string;
  maxSupply: number;
  mintCost: string;
  mintToken?: Hex;
  owner?: Hex;
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
  tokenId: string;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[];
    licenseTemplate?: Address;
  };
  metadata?: {
    metadataURI: string;
    metadata: string;
    nftMetadata: string;
  };
  sigMetadata?: {
    signer: Address;
    deadline: string;
    signature: Hex;
  };
  sigRegister: {
    signer: Address;
    deadline: string;
    signature: Hex;
  };
};
