import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import {
  GetLicenseRequest,
  GetLicenseResponse,
  ListLicensesRequest,
  ListLicensesResponse,
} from "../types/resources/license";
import { handleError } from "../utils/errors";
import { isIntegerString } from "../utils/utils";

/**
 * LicenseReadOnlyClient allows you to view and search Licenses on Story Protocol.
 */
export class LicenseReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get a License based on the specified License ID.
   *
   * @param request - the request object for getting an License.
   * @returns the response object the contains the fetched License.
   */
  public async get(request: GetLicenseRequest): Promise<GetLicenseResponse> {
    try {
      if (!isIntegerString(request.licenseId)) {
        throw new Error(`Invalid license id. Must be an integer. But get: ${request.licenseId}`);
      }
      const response = await this.httpClient.get(`/licenses/${request.licenseId}`);
      return response.data as GetLicenseResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get License");
    }
  }

  /**
   * List Licenses
   *
   * @returns the response object that contains results from listing query.
   */
  public async list(request?: ListLicensesRequest): Promise<ListLicensesResponse> {
    try {
      const response = await this.httpClient.post(`/licenses`, request || {});
      return response.data as ListLicensesResponse;
    } catch (error) {
      handleError(error, "Failed to list Licenses.");
    }
  }
}
