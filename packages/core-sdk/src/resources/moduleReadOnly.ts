import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import { handleError } from "../utils/errors";
import {
  GetModuleRequest,
  GetModuleResponse,
  ListModuleRequest,
  ListModuleResponse,
} from "../types/resources/module";

/**
 * ModuleReadOnlyClient allows you to view and search modules on Story Protocol.
 */
export class ModuleReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get an module based on the module name.
   *
   * @param request - the request object for getting a module.
   * @returns the response object the contains the fetched module.
   */
  public async get(request: GetModuleRequest): Promise<GetModuleResponse> {
    try {
      const response = await this.httpClient.get(`/modules/${request.name}`);
      return response.data as GetModuleResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get module");
    }
  }

  /**
   * List modules.
   *
   * @returns the response object that contains results from listing query.
   */
  public async list(request?: ListModuleRequest): Promise<ListModuleResponse> {
    try {
      const response = await this.httpClient.post(`/modules`, request || {});
      return response.data as ListModuleResponse;
    } catch (error) {
      handleError(error, "Failed to list modules.");
    }
  }
}
