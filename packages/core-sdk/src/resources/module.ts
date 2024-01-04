import { AxiosInstance } from "axios";
import { PublicClient, WalletClient } from "viem";

import { ModuleReadOnlyClient } from "./moduleReadOnly";

/**
 * ModuleClient allows you to view and search modules on Story Protocol.
 */
export class ModuleClient extends ModuleReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }
}
