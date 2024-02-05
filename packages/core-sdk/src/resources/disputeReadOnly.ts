import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

/**
 * DisputeReadOnlyClient allows you to view and search disputes on Story Protocol.
 */
export class DisputeReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }
}
