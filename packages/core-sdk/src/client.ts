import { createPublicClient, createWalletClient, PublicClient, WalletClient } from "viem";
import * as dotenv from "dotenv";

import { StoryConfig, SupportedChainIds } from "./types/config";
import { IPAssetClient } from "./resources/ipAsset";
import { PermissionClient } from "./resources/permission";
import { LicenseClient } from "./resources/license";
import { PolicyClient } from "./resources/policy";
import { DisputeClient } from "./resources/dispute";
import { IPAccountClient } from "./resources/ipAccount";
import { chainStringToViemChain } from "./utils/utils";
import { StoryAPIClient } from "./clients/storyAPI";

if (typeof process !== "undefined") {
  dotenv.config();
}
/**
 * The StoryClient is the main entry point for the SDK.
 */
export class StoryClient {
  private readonly config: StoryConfig & { chainId: SupportedChainIds };
  private readonly rpcClient: PublicClient;
  private readonly wallet: WalletClient;
  private readonly storyClient: StoryAPIClient;
  private _ipAsset: IPAssetClient | null = null;
  private _permission: PermissionClient | null = null;
  private _license: LicenseClient | null = null;
  private _policy: PolicyClient | null = null;
  private _dispute: DisputeClient | null = null;
  private _ipAccount: IPAccountClient | null = null;

  /**
   * @param config - the configuration for the SDK client
   */
  private constructor(config: StoryConfig) {
    this.config = {
      ...config,
      chainId: config.chainId || "sepolia",
    };
    if (!this.config.transport) {
      throw new Error(
        "transport is null, please pass in a valid RPC Provider URL as the transport.",
      );
    }

    const clientConfig = {
      chain: chainStringToViemChain(this.config.chainId),
      transport: this.config.transport,
    };

    this.rpcClient = createPublicClient(clientConfig);
    this.storyClient = new StoryAPIClient();

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

  /**
   * Getter for the ip asset client. The client is lazily created when
   * this method is called.
   *
   * @returns the IPAssetClient instance
   */
  public get ipAsset(): IPAssetClient {
    if (this._ipAsset === null) {
      this._ipAsset = new IPAssetClient(
        this.rpcClient,
        this.wallet,
        this.storyClient,
        this.config.chainId,
      );
    }

    return this._ipAsset;
  }

  /**
   * Getter for the permission client. The client is lazily created when
   * this method is called.
   *
   * @returns the PermissionClient instance
   */
  public get permission(): PermissionClient {
    if (this._permission === null) {
      this._permission = new PermissionClient(this.rpcClient, this.wallet, this.config.chainId);
    }

    return this._permission;
  }

  /**
   * Getter for the license client. The client is lazily created when
   * this method is called.
   *
   * @returns the LicenseClient instance
   */
  public get license(): LicenseClient {
    if (this._license === null) {
      this._license = new LicenseClient(
        this.rpcClient,
        this.wallet,
        this.storyClient,
        this.config.chainId,
      );
    }

    return this._license;
  }

  /**
   * Getter for the policy client. The client is lazily created when
   * this method is called.
   *
   * @returns the PolicyClient instance
   */
  public get policy(): PolicyClient {
    if (this._policy === null) {
      this._policy = new PolicyClient(this.rpcClient, this.wallet, this.config.chainId);
    }

    return this._policy;
  }

  /**
   * Getter for the dispute client. The client is lazily created when
   * this method is called.
   *
   * @returns the DisputeClient instance
   */
  public get dispute(): DisputeClient {
    if (this._dispute === null) {
      this._dispute = new DisputeClient(this.rpcClient, this.wallet, this.config.chainId);
    }

    return this._dispute;
  }

  /**
   * Getter for the ip account client. The client is lazily created when
   * this method is called.
   *
   * @returns the IPAccountClient instance
   */
  public get ipAccount(): IPAccountClient {
    if (this._ipAccount === null) {
      this._ipAccount = new IPAccountClient(this.rpcClient, this.wallet);
    }

    return this._ipAccount;
  }
}
