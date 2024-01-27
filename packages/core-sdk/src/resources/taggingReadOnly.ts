import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import { handleError } from "../utils/errors";
import {
  GetTagRequest,
  GetTagResponse,
  ListTagRequest,
  ListTagResponse,
} from "../types/resources/tagging";

/**
 * TaggingReadOnlyClient allows you to view and search IP Assets on Story Protocol.
 */
export class TaggingReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get tags.
   *
   * @returns the response object that contains results from get tag query.
   */
  public async get(request: GetTagRequest): Promise<GetTagResponse> {
    try {
      const response = await this.httpClient.get(`/tags/${request.id}`);
      return response.data as GetTagResponse;
    } catch (error) {
      handleError(error, "Failed to get tags.");
    }
  }
  /**
   * List tags.
   *
   * @returns the response object that contains results from list tags query.
   */
  public async list(request?: ListTagRequest): Promise<ListTagResponse> {
    try {
      const response = await this.httpClient.post(`/tags`, request || {});
      return response.data as ListTagResponse;
    } catch (error) {
      handleError(error, "Failed to list tags.");
    }
  }
}
