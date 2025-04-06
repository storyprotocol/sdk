import { Address, Hex, TransactionReceipt } from "viem";

import { TxOptions, WithTxOptions } from "../options";
import {
  IPMetadataInput,
  RoyaltyShare,
  LicenseTermsDataInput,
  DerivativeDataInput,
} from "./ipAsset";

export type TokenIDInput = string | number | bigint;

export interface LinkDerivativeBaseInput {
  /** The IP ID of the child IP. */
  childIpId: Address;
  /**
   * The maximum number of royalty tokens that can be distributed to the
   * external royalty policies.
   * @default 100_000_000
   */
  maxRts?: number | string;
  txOptions?: TxOptions;
}

export interface LinkDerivativeWithParentInput extends LinkDerivativeBaseInput {
  method: "parent-ip";
  parentIpIds: Address[];
  licenseTermsIds: bigint[] | string[] | number[];
  maxMintingFee: bigint | string | number;
  maxRevenueShare: number | string;
  licenseTemplate?: Address;
}

export interface RegisterDerivativeWithLicenseTokensInput extends LinkDerivativeBaseInput {
  method: "license-tokens";
  /**
   * The IDs of the license tokens.
   * These can be minted from the parent IP via `license.mintLicenseTokens`.
   */
  licenseTokenIds: bigint[] | string[] | number[];
}

/**
 * Mint an NFT from an SPG NFT contract.
 */
export type SPGNFTCollection = {
  type: "spg-collection";

  /**
   * The address of the SPG NFT contract.
   * You can create one via `client.nftClient.createNFTCollection`.
   */
  spgNftContract: Address;
  /**
   * The address to receive the NFT.
   * Defaults to client's wallet address if not provided.
   */
  recipient?: Address;
  /**
   * Set to true to allow minting an NFT with a duplicate metadata hash.
   * @default false
   */
  allowDuplicates?: boolean;
};

export type MintedNFT = {
  type: "minted";

  /** The address of the NFT contract. */
  nftContract: Address;
  tokenId: TokenIDInput;
};

/**
 * Link an existing IP as a derivative of another IP.
 * Supports linking using parent IP IDs or license tokens.
 */
export type LinkDerivativeInput =
  | LinkDerivativeWithParentInput
  | RegisterDerivativeWithLicenseTokensInput;

export type NewRegisterRequest = WithTxOptions & {
  nft: SPGNFTCollection | MintedNFT;
  license?: LicenseTermsDataInput[];
  ipMetadata?: IPMetadataInput;
  royaltyShares?: RoyaltyShare[];
};

export type NewRegisterResponse = {
  txHash?: Hex;
  receipt?: TransactionReceipt;

  /** the IP ID of the new ip that is created */
  ipId?: Address;
  /** the token id of the minted SPG token */
  tokenId?: bigint;
  /** the IP ID of the derivative that is created */
  childIpId?: Address;
  /**
   * The license terms IDs that are created. Empty if no license terms are created.
   */
  licenseTermsIds?: bigint[];
};

export type BaseRegisterDerivative = WithTxOptions & {
  nft: MintedNFT | SPGNFTCollection;
  ipMetadata?: IPMetadataInput;
  royaltyShares?: RoyaltyShare[];
};

export type RegisterDerivativeWithParent = BaseRegisterDerivative & {
  method: "parent-ip";
  derivative: DerivativeDataInput;
};

export type RegisterDerivativeWithLicenseTokens = BaseRegisterDerivative & {
  method: "license-tokens";
  licenseTokenIds: bigint[] | string[];
  /**
   * @default 100_000_000
   */
  maxRts?: number;
};

export type NewRegisterDerivativeRequest =
  | RegisterDerivativeWithLicenseTokens
  | RegisterDerivativeWithParent;
