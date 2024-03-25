import { Account, Transport } from "viem";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 *
 * @public
 */
export type SupportedChainIds =
  | "11155111"
  | "sepolia"
  | "1"
  | "mainnet"
  | "80001"
  | "mumbai"
  | "polygonMumbai"
  | "1513"
  | "renaissance";

/**
 * Configuration for the SDK Client.
 *
 * @public
 */
export interface StoryConfig {
  readonly account: Account;
  readonly chainId?: SupportedChainIds;
  readonly transport: Transport;
}
