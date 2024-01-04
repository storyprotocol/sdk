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
   * Get module data based on the specified module id.
   *
   * @param request - the request object for getting the module
   * @returns the response object that contains the fetched module object
   */
  public async get(request: GetModuleRequest): Promise<GetModuleResponse> {
    try {
      const response = await this.httpClient.get(`/protocol/module/${request.moduleId}`);
      return response.data as GetModuleResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get module");
    }
  }

  /**
   * List Modules.
   *
   * @returns the response object that contains a list of modules
   */
  public async list(request?: ListModuleRequest): Promise<ListModuleResponse> {
    try {
      const response = await this.httpClient.post(`/protocol/module`, request || {}, {
        params: {
          ipOrgId: request?.ipOrgId,
        },
      });
      return response.data as ListModuleResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to list modules`);
    }
  }
}
