import { Account, Address, Hash, Transport } from "viem";

import { SimpleWalletClient } from "../abi/generated";

/**
 * Supported chains. For convenience, both name or chain ID are supported.
 *
 * @public
 */
export type SupportedChainIds = "aeneid" | "mainnet" | ChainIds;

/**
 * A function that resolves a hash returned by `writeContract` into an actual
 * transaction hash that can be used with `waitForTransactionReceipt`.
 *
 * This is required when using Account Abstraction wallets (e.g. ZeroDev, Dynamic)
 * because `writeContract` returns a UserOperation hash instead of a regular
 * transaction hash. The resolver should wait for the UserOperation to be bundled
 * and return the resulting on-chain transaction hash.
 *
 * @example ZeroDev
 * ```typescript
 * const client = StoryClient.newClientUseWallet({
 *   transport: http("https://..."),
 *   wallet: kernelClient,
 *   txHashResolver: async (userOpHash) => {
 *     const receipt = await bundlerClient.waitForUserOperationReceipt({
 *       hash: userOpHash,
 *     });
 *     return receipt.receipt.transactionHash;
 *   },
 * });
 * ```
 *
 * @param hash - The hash returned by `writeContract` (could be a userOpHash or txHash)
 * @returns The resolved on-chain transaction hash
 */
export type TxHashResolver = (hash: Hash) => Promise<Hash>;

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
  /**
   * Optional resolver for Account Abstraction wallets.
   * @see TxHashResolver
   */
  readonly txHashResolver?: TxHashResolver;
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
  /**
   * Optional resolver for Account Abstraction wallets.
   * @see TxHashResolver
   */
  readonly txHashResolver?: TxHashResolver;
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
  /**
   * Optional resolver for Account Abstraction wallets (e.g. ZeroDev, Dynamic).
   *
   * When provided, the SDK will call this function to resolve the hash returned
   * by `writeContract` into the actual on-chain transaction hash before waiting
   * for the transaction receipt.
   *
   * @see TxHashResolver
   */
  readonly txHashResolver?: TxHashResolver;
};

export type ContractAddress = { [key in SupportedChainIds]: Record<string, string> };

export type ChainIds = 1315 | 1514;
