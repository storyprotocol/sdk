import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

/**
 * IPAssetReadOnlyClient allows you to view and search IP Assets on Story Protocol.
 */
export class AccessControlReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }
}
