import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import {
  GetPermissionRequest,
  GetPermissionResponse,
  ListPermissionsRequest,
  ListPermissionsResponse,
} from "../types/resources/permission";
import { handleError } from "../utils/errors";
// import { isIntegerString } from "../utils/utils";

/**
 * IPAssetReadOnlyClient allows you to view and search IP Assets on Story Protocol.
 */
export class PermissionReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get permission based on based on the specified IP id.
   *
   * @param request - the request object for getting an IP Asset.
   * @returns the response object the contains the fetched IP Asset.
   */
  public async get(request: GetPermissionRequest): Promise<GetPermissionResponse> {
    try {
      // if (!(request.permissionId)) {
      //   throw new Error(
      //     `Invalid permissionId. Must be an integer. But get: ${request.permissionId}`,
      //   );
      // }
      const response = await this.httpClient.get(`/permissions/${request.permissionId}`);
      return response.data as GetPermissionResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get IP account");
    }
  }

  /**
   * List IP accounts.
   *
   * @returns the response object that contains results from listing query.
   */
  public async list(request?: ListPermissionsRequest): Promise<ListPermissionsResponse> {
    try {
      const response = await this.httpClient.post(`/permissions`, request || {});
      return response as ListPermissionsResponse;
    } catch (error) {
      handleError(error, "Failed to list IP Asset.");
    }
  }
}
