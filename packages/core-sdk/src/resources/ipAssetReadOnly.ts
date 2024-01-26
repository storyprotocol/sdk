import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import {
  GetIpAssetRequest,
  GetIpAssetResponse,
  ListIpAssetRequest,
  ListIpAssetResponse,
} from "../types/resources/ipAsset";
import { handleError } from "../utils/errors";
import { isIntegerString } from "../utils/utils";

/**
 * IPAssetReadOnlyClient allows you to view and search IP Assets on Story Protocol.
 */
export class IPAssetReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get an IP Asset based on the specified IP asset ID.
   *
   * @param request - the request object for getting an IP Asset.
   * @returns the response object the contains the fetched IP Asset.
   */
  public async get(request: GetIpAssetRequest): Promise<GetIpAssetResponse> {
    try {
      if (!isIntegerString(request.ipId)) {
        throw new Error(`Invalid chain id. Must be an integer. But get: ${request.ipId}`);
      }
      const response = await this.httpClient.get(`/accounts/${request.ipId}`);
      return response.data as GetIpAssetResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get IP account");
    }
  }

  /**
   * List IP accounts.
   *
   * @returns the response object that contains results from listing query.
   */
  public async list(request?: ListIpAssetRequest): Promise<ListIpAssetResponse> {
    try {
      const response = await this.httpClient.post(`/accounts`, request || {});
      return response.data as ListIpAssetResponse;
    } catch (error) {
      handleError(error, "Failed to list IP Asset.");
    }
  }

  public async getIpId() {}
}
