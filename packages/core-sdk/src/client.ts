import { createPublicClient, createWalletClient, PublicClient, WalletClient } from "viem";
import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";

import { StoryConfig } from "./types/config";
import { TaggingClient } from "./resources/tagging";
import { IPAssetClient } from "./resources/ipAsset";
import { PermissionClient } from "./resources/permission";
import { LicenseClient } from "./resources/license";
import { PolicyClient } from "./resources/policy";
import { DisputeClient } from "./resources/dispute";
import { chainStringToViemChain } from "./utils/utils";
import { PlatformClient } from "./utils/platform";

if (typeof process !== "undefined") {
  dotenv.config();
}
/**
 * The StoryClient is the main entry point for the SDK.
 */
export class StoryClient {
  private readonly config: StoryConfig;
  private readonly rpcClient: PublicClient;
  private readonly wallet: WalletClient;
  private readonly httpClient: AxiosInstance;

  private _ipAccount: IPAssetClient | null = null;
  private _permission: PermissionClient | null = null;
  private _license: LicenseClient | null = null;
  private _policy: PolicyClient | null = null;
  private _platform: PlatformClient | null = null;
  private _tagging: TaggingClient | null = null;
  private _dispute: DisputeClient | null = null;

  /**
   * @param config - the configuration for the SDK client
   */
  private constructor(config: StoryConfig) {
    this.config = config;
    if (!this.config.transport) {
      throw new Error(
        "transport is null, please pass in a valid RPC Provider URL as the transport.",
      );
    }

    this.httpClient = axios.create({
      baseURL: "https://stag.api.storyprotocol.net",
      timeout: 5000,
      headers: {
        version: "v0-alpha",
      },
    });

    const clientConfig = {
      chain: chainStringToViemChain(this.config.chainId || "sepolia"),
      transport: this.config.transport,
    };

    this.rpcClient = createPublicClient(clientConfig);

    const account = this.config.account;
    if (!account) {
      throw new Error("account is null");
    }

    this.wallet = createWalletClient({
      ...clientConfig,
      account: account,
    });
  }

  /**
   * Factory method for creating a SDK client with a signer.
   *
   * @param config - the configuration for a new SDK client
   */
  static newClient(config: StoryConfig): StoryClient {
    return new StoryClient(config);
  }

  public get ipAsset(): IPAssetClient {
    if (this._ipAccount === null) {
      this._ipAccount = new IPAssetClient(this.rpcClient, this.wallet);
    }

    return this._ipAccount;
  }

  public get permission(): PermissionClient {
    if (this._permission === null) {
      this._permission = new PermissionClient(this.rpcClient, this.wallet);
    }

    return this._permission;
  }

  public get license(): LicenseClient {
    if (this._license === null) {
      this._license = new LicenseClient(this.rpcClient, this.wallet);
    }

    return this._license;
  }

  public get policy(): PolicyClient {
    if (this._policy === null) {
      this._policy = new PolicyClient(this.rpcClient, this.wallet);
    }

    return this._policy;
  }

  /**
   * Getter for the tagging client. The client is lazily created when
   * this method is called.
   *
   * @returns the TaggingClient instance
   */
  public get tagging(): TaggingClient {
    if (this._tagging === null) {
      this._tagging = new TaggingClient(this.rpcClient, this.wallet);
    }

    return this._tagging;
  }

  /**
   * Getter for the dispute client. The client is lazily created when
   * this method is called.
   *
   * @returns the DisputeClient instance
   */
  public get dispute(): DisputeClient {
    if (this._dispute === null) {
      this._dispute = new DisputeClient(this.rpcClient, this.wallet);
    }

    return this._dispute;
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
