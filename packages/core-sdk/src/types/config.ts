import { Account, Transport, Address } from "viem";

import { SimpleWalletClient } from "../abi/generated";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 *
 * @public
 */
export type SupportedChainIds = "11155111" | "sepolia";

/**
 * Configuration for the SDK Client.
 *
 * @public
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
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
  readonly wallet?: SimpleWalletClient;
  readonly account?: Account | Address;
};

export type ContractAddress = { [key in SupportedChainIds]: Record<string, string> };
