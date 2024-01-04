import { Account, Transport } from "viem";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 *
 * @public
 */
export type SupportedChainIds = "11155111" | "sepolia" | "1" | "mainnet";

/**
 * Configuration for the SDK Client.
 *
 * @public
 */
export interface StoryConfig extends StoryReadOnlyConfig {
  readonly account: Account;
}

/**
 * Configuration for the read-only SDK Client.
 *
 * @public
 */
export interface StoryReadOnlyConfig {
  readonly chainId?: SupportedChainIds;
  readonly transport?: Transport;
}
