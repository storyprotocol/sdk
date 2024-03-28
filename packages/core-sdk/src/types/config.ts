import { Account, Transport, Address } from "viem";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 *
 * @public
 */
export type SupportedChainIds = "11155111" | "sepolia" | "1513" | "storyTestnet";

/**
 * Configuration for the SDK Client.
 *
 * @public
 */
export interface StoryConfig {
  readonly account: Account | Address;
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
}

export type ContractAddress = { [key in SupportedChainIds]: Record<string, string> };
