import { AxiosInstance } from "axios";
import { PublicClient, WalletClient } from "viem";

import { TransactionReadOnlyClient } from "./transactionReadOnly";

/**
 * TransactionClient allows you to view and monitor transactions on Story Protocol.
 */
export class TransactionClient extends TransactionReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }
}
