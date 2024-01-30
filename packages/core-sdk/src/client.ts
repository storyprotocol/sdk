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
import { ModuleReadOnlyClient } from "./resources/moduleReadOnly";
import { TaggingClient } from "./resources/tagging";
import { TaggingReadOnlyClient } from "./resources/taggingReadOnly";
import { IPAssetClient } from "./resources/ipAsset";
import { IPAssetReadOnlyClient } from "./resources/ipAssetReadOnly";
import { PermissionClient } from "./resources/permission";
import { PermissionReadOnlyClient } from "./resources/permissionReadOnly";
import { LicenseReadOnlyClient } from "./resources/licenseReadOnly";
import { PolicyReadOnlyClient } from "./resources/policyReadOnly";
import { LicenseClient } from "./resources/license";
import { PolicyClient } from "./resources/policy";

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

  private _ipAccount: IPAssetClient | IPAssetReadOnlyClient | null = null;
  private _permission: PermissionClient | PermissionReadOnlyClient | null = null;
  private _license: LicenseClient | LicenseReadOnlyClient | null = null;
  private _policy: PolicyClient | PolicyReadOnlyClient | null = null;
  private _transaction: TransactionClient | TransactionReadOnlyClient | null = null;
  private _platform: PlatformClient | null = null;
  private _module: ModuleReadOnlyClient | null = null;
  private _tagging: TaggingClient | TaggingReadOnlyClient | null = null;

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

  public get ipAsset(): IPAssetClient | IPAssetReadOnlyClient {
    if (this._ipAccount === null) {
      this._ipAccount = this.isReadOnly
        ? new IPAssetReadOnlyClient(this.httpClient, this.rpcClient)
        : new IPAssetClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._ipAccount;
  }

  public get permission(): PermissionClient | PermissionReadOnlyClient {
    if (this._permission === null) {
      this._permission = this.isReadOnly
        ? new PermissionReadOnlyClient(this.httpClient, this.rpcClient)
        : new PermissionClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._permission;
  }

  public get license(): LicenseClient | LicenseReadOnlyClient {
    if (this._license === null) {
      this._license = this.isReadOnly
        ? new LicenseReadOnlyClient(this.httpClient, this.rpcClient)
        : new LicenseClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._license;
  }

  public get policy(): PolicyClient | PolicyReadOnlyClient {
    if (this._policy === null) {
      this._policy = this.isReadOnly
        ? new PolicyReadOnlyClient(this.httpClient, this.rpcClient)
        : new PolicyClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._policy;
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
   * Getter for the tagging client. The client is lazily created when
   * this method is called.
   *
   * @returns the TaggingReadOnlyClient or TaggingClient instance
   */
  public get tagging(): TaggingClient | TaggingReadOnlyClient {
    if (this._tagging === null) {
      this._tagging = this.isReadOnly
        ? new TaggingReadOnlyClient(this.httpClient, this.rpcClient)
        : new TaggingClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._tagging;
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

  /**
   * Getter for the module client. The client is lazily created when
   * this method is called.
   *
   * @returns the Module instance
   */
  public get module(): ModuleReadOnlyClient {
    if (this._module === null) {
      this._module = new ModuleReadOnlyClient(this.httpClient, this.rpcClient);
    }

    return this._module;
  }
}
