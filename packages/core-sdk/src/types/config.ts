import { Account, Transport, Address } from "viem";

import { SimpleWalletClient } from "../abi/generated";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 *
 * @public
 */
export type SupportedChainIds = "aeneid" | "mainnet" | ChainIds;

/**
 * Configuration for the SDK Client.
 *
 * @public
 */
export type UseAccountStoryConfig = {
  readonly account: Account | Address;
  /**
   * The chain ID to use, the default is `aeneid`.
   *
   * @default 13_15
   */
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
};

export type UseWalletStoryConfig = {
  /**
   * The chain ID to use, the default is `aeneid`.
   *
   * @default 13_15
   */
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
  readonly wallet: SimpleWalletClient;
};

export type StoryConfig = {
  readonly transport: Transport;
  /**
   * The chain ID to use, the default is `aeneid`.
   *
   * @default 13_15
   */
  readonly chainId?: SupportedChainIds;
  readonly wallet?: SimpleWalletClient;
  readonly account?: Account | Address;
};

export type ContractAddress = { [key in SupportedChainIds]: Record<string, string> };

export type ChainIds = "1512" | "1514";
