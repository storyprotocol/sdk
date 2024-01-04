import { AxiosInstance } from "axios";
import { PublicClient, WalletClient } from "viem";

import { HookReadOnlyClient } from "./hookReadOnly";

/**
 * HookClient allows you to view and search hooks on Story Protocol.
 */
export class HookClient extends HookReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }
}
