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
import { chainStringToViemChain } from "./utils/utils";
import { RoyaltyClient } from "./resources/royalty";
import { NftClient } from "./resources/nftClient";
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
  private _clients: { [key: string]: any } = {};

  /**
   * @param config - the configuration for the SDK client
   */
  private constructor(config: StoryConfig) {
    this.config = {
      ...config,
      chainId: config.chainId || "iliad",
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
   * Generic getter for clients. The client is lazily created when
   * this method is called.
   *
   * @param clientName - the name of the client
   * @param ClientClass - the class of the client
   * @returns the client instance
   */
  private getClient<T>(clientName: string, ClientClass: new (...args: any[]) => T): T {
    if (!this._clients[clientName]) {
      this._clients[clientName] = new ClientClass(this.rpcClient, this.wallet, this.config.chainId);
    }
    return this._clients[clientName];
  }

  public get ipAsset(): IPAssetClient {
    return this.getClient('ipAsset', IPAssetClient);
  }

  public get permission(): PermissionClient {
    return this.getClient('permission', PermissionClient);
  }

  public get license(): LicenseClient {
    return this.getClient('license', LicenseClient);
  }

  public get dispute(): DisputeClient {
    return this.getClient('dispute', DisputeClient);
  }

  public get ipAccount(): IPAccountClient {
    return this.getClient('ipAccount', IPAccountClient);
  }

  public get royalty(): RoyaltyClient {
    return this.getClient('royalty', RoyaltyClient);
  }

  public get nftClient(): NftClient {
    return this.getClient('nftClient', NftClient);
  }
}
