import { createPublicClient, createWalletClient, PublicClient } from "viem";
import * as dotenv from "dotenv";

import {
  StoryConfig,
  SupportedChainIds,
  UseAccountStoryConfig,
  UseWalletStoryConfig,
} from "./types/config";
import { IPAssetClient } from "./resources/ipAsset";
import { PermissionClient } from "./resources/permission";
import { LicenseClient } from "./resources/license";
import { DisputeClient } from "./resources/dispute";
import { IPAccountClient } from "./resources/ipAccount";
import { chain, chainStringToViemChain } from "./utils/utils";
import { RoyaltyClient } from "./resources/royalty";
import { NftClient } from "./resources/nftClient";
import { GroupClient } from "./resources/group";
import { SimpleWalletClient } from "./abi/generated";

if (typeof process !== "undefined") {
  dotenv.config();
}
/**
 * The StoryClient is the main entry point for the SDK.
 */
export class StoryClient {
  private readonly config: StoryConfig & { chainId: SupportedChainIds };
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private _ipAsset: IPAssetClient | null = null;
  private _permission: PermissionClient | null = null;
  private _license: LicenseClient | null = null;
  private _dispute: DisputeClient | null = null;
  private _ipAccount: IPAccountClient | null = null;
  private _royalty: RoyaltyClient | null = null;
  private _nftClient: NftClient | null = null;
  private _group: GroupClient | null = null;

  /**
   * @param config - the configuration for the SDK client
   */
  private constructor(config: StoryConfig) {
    this.config = {
      ...config,
      chainId: chain[config.chainId || "odyssey"],
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

    if (this.config.wallet) {
      this.wallet = this.config.wallet;
    } else if (this.config.account) {
      const account = this.config.account;

      this.wallet = createWalletClient({
        ...clientConfig,
        account: account,
      });
    } else {
      throw new Error("must specify a wallet or account");
    }
  }

  /**
   * Factory method for creating a SDK client with a signer.
   *
   * @param config StoryClient - the configuration for a new SDK client
   */
  static newClient(config: StoryConfig): StoryClient {
    return new StoryClient(config);
  }

  /**
   * Factory method for creating a SDK client with a signer.
   *
   * @param config WalletClientConfig - the configuration for a new SDK client
   */
  static newClientUseWallet(config: UseWalletStoryConfig): StoryClient {
    return new StoryClient({
      chainId: config.chainId,
      transport: config.transport,
      wallet: config.wallet,
    });
  }

  /**
   * Factory method for creating a SDK client with a signer.
   *
   * @param config UseAccountStoryConfig - the configuration for a new SDK client
   */
  static newClientUseAccount(config: UseAccountStoryConfig): StoryClient {
    return new StoryClient({
      account: config.account,
      chainId: config.chainId,
      transport: config.transport,
    });
  }

  /**
   * Getter for the ip asset client. The client is lazily created when
   * this method is called.
   *
   * @returns the IPAssetClient instance
   */
  public get ipAsset(): IPAssetClient {
    if (this._ipAsset === null) {
      this._ipAsset = new IPAssetClient(this.rpcClient, this.wallet, this.config.chainId);
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
      this._license = new LicenseClient(this.rpcClient, this.wallet, this.config.chainId);
    }

    return this._license;
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

  /**
   * Getter for the royalty client. The client is lazily created when
   * this method is called.
   *
   * @returns the RoyaltyClient instance
   */
  public get royalty(): RoyaltyClient {
    if (this._royalty === null) {
      this._royalty = new RoyaltyClient(this.rpcClient, this.wallet);
    }

    return this._royalty;
  }

  /**
   * Getter for the NFT client. The client is lazily created when
   * this method is called.
   *
   * @returns the NftClient instance
   */
  public get nftClient(): NftClient {
    if (this._nftClient === null) {
      this._nftClient = new NftClient(this.rpcClient, this.wallet);
    }

    return this._nftClient;
  }

  /**
   * Getter for the group client. The client is lazily created when
   * this method is called.
   *
   * @returns the GroupClient instance
   */
  public get groupClient(): GroupClient {
    if (this._group === null) {
      this._group = new GroupClient(this.rpcClient, this.wallet, this.config.chainId);
    }

    return this._group;
  }
}
