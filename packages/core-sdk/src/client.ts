import * as dotenv from "dotenv";
import { createPublicClient, createWalletClient, PublicClient } from "viem";

import { SimpleWalletClient } from "./abi/generated";
import { DisputeClient } from "./resources/dispute";
import { GroupClient } from "./resources/group";
import { IPAccountClient } from "./resources/ipAccount";
import { IPAssetClient } from "./resources/ipAsset";
import { LicenseClient } from "./resources/license";
import { NftClient } from "./resources/nftClient";
import { PermissionClient } from "./resources/permission";
import { RoyaltyClient } from "./resources/royalty";
import { WipClient } from "./resources/wip";
import { ChainIds, StoryConfig, UseAccountStoryConfig, UseWalletStoryConfig } from "./types/config";
import { chain, chainStringToViemChain, validateAddress } from "./utils/utils";

if (typeof process !== "undefined") {
  dotenv.config();
}
/**
 * The StoryClient is the main entry point for the SDK.
 */
export class StoryClient {
  private readonly config: StoryConfig;
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
  private _wip: WipClient | null = null;

  private constructor(config: StoryConfig) {
    this.config = {
      ...config,
      chainId: chain[config.chainId || 1315],
    };
    if (!this.config.transport) {
      throw new Error(
        "transport is null, please pass in a valid RPC Provider URL as the transport.",
      );
    }

    const clientConfig = {
      chain: chainStringToViemChain(this.chainId),
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
  private get chainId(): ChainIds {
    return this.config.chainId as ChainIds;
  }
  /**
   * Factory method for creating an SDK client with a signer.
   *
   */
  static newClient(config: StoryConfig): StoryClient {
    return new StoryClient(config);
  }

  /**
   * Factory method for creating an SDK client with a signer.
   */
  static newClientUseWallet(config: UseWalletStoryConfig): StoryClient {
    return new StoryClient({
      chainId: config.chainId,
      transport: config.transport,
      wallet: config.wallet,
    });
  }

  /**
   * Factory method for creating an SDK client with a signer.
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
   */
  public get ipAsset(): IPAssetClient {
    if (this._ipAsset === null) {
      this._ipAsset = new IPAssetClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._ipAsset;
  }

  /**
   * Getter for the permission client. The client is lazily created when
   * this method is called.
   */
  public get permission(): PermissionClient {
    if (this._permission === null) {
      this._permission = new PermissionClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._permission;
  }

  /**
   * Getter for the license client. The client is lazily created when
   * this method is called.
   */
  public get license(): LicenseClient {
    if (this._license === null) {
      this._license = new LicenseClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._license;
  }

  /**
   * Getter for the dispute client. The client is lazily created when
   * this method is called.
   */
  public get dispute(): DisputeClient {
    if (this._dispute === null) {
      this._dispute = new DisputeClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._dispute;
  }

  /**
   * Getter for the ip account client. The client is lazily created when
   * this method is called.
   */
  public get ipAccount(): IPAccountClient {
    if (this._ipAccount === null) {
      this._ipAccount = new IPAccountClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._ipAccount;
  }

  /**
   * Getter for the royalty client. The client is lazily created when
   * this method is called.
   */
  public get royalty(): RoyaltyClient {
    if (this._royalty === null) {
      this._royalty = new RoyaltyClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._royalty;
  }

  /**
   * Getter for the NFT client. The client is lazily created when
   * this method is called.
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
   */
  public get groupClient(): GroupClient {
    if (this._group === null) {
      this._group = new GroupClient(this.rpcClient, this.wallet, this.chainId);
    }

    return this._group;
  }

  public get wipClient(): WipClient {
    if (this._wip === null) {
      this._wip = new WipClient(this.rpcClient, this.wallet);
    }
    return this._wip;
  }

  public async getWalletBalance(): Promise<bigint> {
    if (!this.wallet.account) {
      throw new Error("No account found in wallet");
    }
    return await this.getBalance(this.wallet.account.address);
  }

  public async getBalance(address: string): Promise<bigint> {
    const validAddress = validateAddress(address);
    return await this.rpcClient.getBalance({
      address: validAddress,
    });
  }
}
