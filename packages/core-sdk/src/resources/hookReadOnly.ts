import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import { handleError } from "../utils/errors";
import {
  GetHookRequest,
  GetHookResponse,
  ListHookRequest,
  ListHookResponse,
} from "../types/resources/hook";

/**
 * HookReadOnlyClient allows you to get and search hooks on Story Protocol.
 */
export class HookReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get hook data based on the specified hook id.
   *
   * @param request - the request object for getting the hook
   * @returns the response object that contains the fetched hook object
   */
  public async get(request: GetHookRequest): Promise<GetHookResponse> {
    try {
      const response = await this.httpClient.get(`/protocol/hook/${request.hookId}`);
      return response.data as GetHookResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get hook");
    }
  }

  /**
   * Get hook data based on the specified hook id.
   *
   * @param request - the request object for getting the hooks
   * @returns the response object that contains the fetched hook object
   */
  public async list(request?: ListHookRequest): Promise<ListHookResponse> {
    try {
      const response = await this.httpClient.post(`/protocol/hook`, request || {}, {
        params: {
          moduleId: request?.moduleId,
        },
      });
      return response.data as ListHookResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to get hooks`);
    }
  }
}
