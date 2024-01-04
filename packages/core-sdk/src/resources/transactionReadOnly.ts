import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import { handleError } from "../utils/errors";
import {
  GetTransactionRequest,
  GetTransactionResponse,
  ListTransactionRequest,
  ListTransactionResponse,
} from "../types/resources/transaction";

/**
 * TransactionClient allows you to view and monitor transactions on Story Protocol.
 */
export class TransactionReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get transaction data based on the specified transaction id.
   *
   * @param request - the request object for getting the transaction
   * @returns the response object that contains the fetched transaction object
   */
  public async get(request: GetTransactionRequest): Promise<GetTransactionResponse> {
    try {
      const response = await this.httpClient.get(`/protocol/transaction/${request.transactionId}`);
      return response.data as GetTransactionResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get transaction");
    }
  }

  /**
   * List Transactions.
   *
   * @returns the response object that contains a list of transactions
   */
  public async list(request?: ListTransactionRequest): Promise<ListTransactionResponse> {
    try {
      const response = await this.httpClient.post(`/protocol/transaction`, request || {});
      return response.data as ListTransactionResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to list transactions`);
    }
  }
}
