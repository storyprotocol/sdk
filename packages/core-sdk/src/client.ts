import axios, { AxiosInstance } from "axios";
import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem";
import * as dotenv from "dotenv";

import { StoryConfig, StoryReadOnlyConfig } from "./types/config";
import { IPOrgClient } from "./resources/ipOrg";
import { IPOrgReadOnlyClient } from "./resources/ipOrgReadOnly";
import { RelationshipReadOnlyClient } from "./resources/relationshipReadOnly";
import { IPAssetClient } from "./resources/ipAsset";
import { IPAssetReadOnlyClient } from "./resources/ipAssetReadOnly";
import { LicenseReadOnlyClient } from "./resources/licenseReadOnly";
import { TransactionClient } from "./resources/transaction";
import { TransactionReadOnlyClient } from "./resources/transactionReadOnly";
import { HTTP_TIMEOUT } from "./constants/http";
import { Client, ReadOnlyClient } from "./types/client";
import { ModuleClient } from "./resources/module";
import { ModuleReadOnlyClient } from "./resources/moduleReadOnly";
import { HookClient } from "./resources/hook";
import { HookReadOnlyClient } from "./resources/hookReadOnly";
import { PlatformClient } from "./utils/platform";
import { LicenseClient } from "./resources/license";
import { RelationshipClient } from "./resources/relationship";
import { RelationshipTypeClient } from "./resources/relationshipType";
import { RelationshipTypeReadOnlyClient } from "./resources/relationshipTypeReadOnly";
import { chainStringToViemChain } from "./utils/utils";

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

  private _ipOrg: IPOrgClient | IPOrgReadOnlyClient | null = null;
  private _license: LicenseReadOnlyClient | null = null;
  private _transaction: TransactionClient | TransactionReadOnlyClient | null = null;
  private _ipAsset: IPAssetClient | IPAssetReadOnlyClient | null = null;
  private _relationship: RelationshipReadOnlyClient | null = null;
  private _relationshipType: RelationshipTypeReadOnlyClient | null = null;
  private _module: ModuleClient | ModuleReadOnlyClient | null = null;
  private _hook: HookClient | HookReadOnlyClient | null = null;
  private _platform: PlatformClient | null = null;

  /**
   * @param config - the configuration for the SDK client
   * @param isReadOnly
   */
  private constructor(config: StoryConfig | StoryReadOnlyConfig, isReadOnly: boolean = false) {
    this.config = config;
    this.isReadOnly = isReadOnly;

    const clientConfig = {
      chain: chainStringToViemChain(this.config.chainId || "sepolia"),
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
   * Getter for the ipOrg client. The client is lazily created when
   * this method is called.
   *
   * @returns the IPOrgClient or IPOrgReadOnlyClient instance
   */
  public get ipOrg(): IPOrgClient | IPOrgReadOnlyClient {
    if (this._ipOrg === null) {
      this._ipOrg = this.isReadOnly
        ? new IPOrgReadOnlyClient(this.httpClient, this.rpcClient)
        : new IPOrgClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._ipOrg;
  }

  /**
   * Getter for the relationship client. The client is lazily created when
   * this method is called.
   *
   * @returns the RelationshipReadOnlyClient or RelationshipClient instance
   */
  public get relationship(): RelationshipClient | RelationshipReadOnlyClient {
    if (this._relationship === null) {
      this._relationship = this.isReadOnly
        ? new RelationshipReadOnlyClient(this.httpClient, this.rpcClient)
        : new RelationshipClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._relationship;
  }

  /**
   * Getter for the relationship type client. The client is lazily created when
   * this method is called.
   *
   * @returns the RelationshipTypeReadOnlyClient or RelationshipTypeClient instance
   */
  public get relationshipType(): RelationshipTypeClient | RelationshipTypeReadOnlyClient {
    if (this._relationshipType === null) {
      this._relationshipType = this.isReadOnly
        ? new RelationshipTypeReadOnlyClient(this.httpClient, this.rpcClient)
        : new RelationshipTypeClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._relationshipType;
  }

  /**
   * Getter for the IP Asset client. The client is lazily created when
   * this method is called.
   *
   * @returns the IPAssetReadOnlyClient or IpAssetClient instance
   */
  public get ipAsset(): IPAssetClient | IPAssetReadOnlyClient {
    if (this._ipAsset === null) {
      this._ipAsset = this.isReadOnly
        ? new IPAssetReadOnlyClient(this.httpClient, this.rpcClient)
        : new IPAssetClient(this.httpClient, this.rpcClient, this.wallet!);
    }
    return this._ipAsset;
  }

  /**
   * Getter for the license client. The client is lazily created when
   * this method is called.
   *
   * @returns the LicenseReadOnlyClient or LicenseClient instance
   */
  public get license(): LicenseClient | LicenseReadOnlyClient {
    if (this._license === null) {
      this._license = this.isReadOnly
        ? new LicenseReadOnlyClient(this.httpClient, this.rpcClient)
        : new LicenseClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._license;
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
   * Getter for the module client. The client is lazily created when
   * this method is called.
   *
   * @returns the ModuleReadOnlyClient or ModuleClient instance
   */
  public get module(): ModuleClient | ModuleReadOnlyClient {
    if (this._module === null) {
      this._module = this.isReadOnly
        ? new ModuleReadOnlyClient(this.httpClient, this.rpcClient)
        : new ModuleClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._module;
  }

  /**
   * Getter for the hook client. The client is lazily created when
   * this method is called.
   *
   * @returns the HookReadOnlyClient or HookClient instance
   */
  public get hook(): HookClient | HookReadOnlyClient {
    if (this._hook === null) {
      this._hook = this.isReadOnly
        ? new HookReadOnlyClient(this.httpClient, this.rpcClient)
        : new HookClient(this.httpClient, this.rpcClient, this.wallet!);
    }

    return this._hook;
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
