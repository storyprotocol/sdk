import { Account, Transport, Address } from "viem";

import { SimpleWalletClient } from "../abi/generated";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 */
export type SupportedChainIds = "aeneid" | "mainnet" | ChainIds;

/**
 * Configuration for the SDK Client.
 */
export type UseAccountStoryConfig = {
  readonly account: Account | Address;
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
};

export type UseWalletStoryConfig = {
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
  readonly wallet: SimpleWalletClient;
};

export type StoryConfig = {
  readonly transport: Transport;
  readonly chainId?: SupportedChainIds;
  readonly wallet?: SimpleWalletClient;
  readonly account?: Account | Address;
};

export type ContractAddress = { [key in SupportedChainIds]: Record<string, string> };

export type ChainIds = "1315" | "1514";
