import axios, { AxiosInstance } from "axios";
import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

import { StoryConfig, StoryReadOnlyConfig } from "./types/config";
import { TransactionClient } from "./resources/transaction";
import { TransactionReadOnlyClient } from "./resources/transactionReadOnly";
import { HTTP_TIMEOUT } from "./constants/http";
import { Client, ReadOnlyClient } from "./types/client";
import { PlatformClient } from "./utils/platform";

if (typeof process !== "undefined") {
  dotenv.config();
}
/**
 * The StoryClient is the main entry point for the SDK.
 */
export class StoryClient {
  private readonly config: StoryConfig | StoryReadOnlyConfig;
  private readonly httpClient: AxiosInstance;
  private readonly isReadOnly: boolean = false;
  private readonly rpcClient: PublicClient;
  private readonly wallet?: WalletClient;

  private _transaction: TransactionClient | TransactionReadOnlyClient | null = null;
  private _platform: PlatformClient | null = null;

  /**
   * @param config - the configuration for the SDK client
   * @param isReadOnly
   */
  private constructor(config: StoryConfig | StoryReadOnlyConfig, isReadOnly: boolean = false) {
    this.config = config;
    this.isReadOnly = isReadOnly;

    const clientConfig = {
      chain: this.config.chain || sepolia,
      transport: this.config.transport || http(process.env.RPC_PROVIDER_URL),
    };

    this.rpcClient = createPublicClient(clientConfig);

    if (!isReadOnly) {
      const account = (this.config as StoryConfig).account;
      if (!account) {
        throw new Error("account is null");
      }

      this.wallet = createWalletClient({
        ...clientConfig,
        account: account,
      });
    }

    this.httpClient = axios.create({
      baseURL: process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: HTTP_TIMEOUT,
      headers: {
        version: "v0-alpha",
      },
    });
  }

  /**
   * Factory method for creating a read only SDK client.
   *
   * @param config - the configuration for a read only SDK client
   */
  static newReadOnlyClient(config: StoryReadOnlyConfig): ReadOnlyClient {
    return new StoryClient(config, true) as ReadOnlyClient;
  }

  /**
   * Factory method for creating a SDK client with a signer.
   *
   * @param config - the configuration for a new read/write SDK client
   */
  static newClient(config: StoryConfig): Client {
    return new StoryClient(config, false) as Client;
  }

  /**
   * Getter for the transaction client. The client is lazily created when
   * this method is called.
   *
   * @returns the TransactionReadOnlyClient or TransactionClient instance
   */
  public get transaction(): TransactionClient | TransactionReadOnlyClient {
    if (this._transaction === null) {
      this._transaction = this.isReadOnly
        ? new TransactionReadOnlyClient(this.httpClient, this.rpcClient)
        : new TransactionClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._transaction;
  }

  /**
   * Getter for the platform client. The client is lazily created when
   * this method is called.
   *
   * @returns the PlatformClient instance
   */
  public get platform(): PlatformClient {
    if (this._platform === null) {
      this._platform = new PlatformClient(this.httpClient);
    }

    return this._platform;
  }
}
