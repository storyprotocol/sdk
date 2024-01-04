import { AxiosInstance, AxiosResponse } from "axios";
import { PublicClient } from "viem";

import {
  GetLicenseRequest,
  GetLicenseResponse,
  LicenseParams,
  ListLicenseParamsRequest,
  ListLicenseParamsResponse,
  ListLicenseRequest,
  ListLicenseResponse,
} from "../types/resources/license";
import { handleError } from "../utils/errors";
import { isIntegerString, paramsTagValueDecoder } from "../utils/utils";

/**
 * LicenseReadOnlyClient allows you to view and search relationships on Story Protocol.
 */
export class LicenseReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get a license's data based on the specified license id.
   *
   * @param request - the request object for getting the license
   * @returns the response object that contains the fetched license object
   */
  public async get(request: GetLicenseRequest): Promise<GetLicenseResponse> {
    try {
      if (!isIntegerString(request.licenseId)) {
        throw new Error(`Invalid licenseId. Must be an integer. But got: ${request.licenseId}`);
      }

      const response: AxiosResponse = await this.httpClient.get(
        `/protocol/license/${request.licenseId}`,
      );

      return response.data as GetLicenseResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to get license`);
    }
  }

  /**
   * List licenses.
   *
   * @returns the response object that contains a list of licenses
   */
  public async list(request?: ListLicenseRequest): Promise<ListLicenseResponse> {
    try {
      const response = await this.httpClient.post("/protocol/license", request || {}, {
        params: {
          ipOrgId: request?.ipOrgId,
          ipAssetId: request?.ipAssetId,
          options: request?.options,
        },
      });

      return response.data as ListLicenseResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to get licenses`);
    }
  }

  /**
   * List licenses.
   *
   * @returns the response object that contains a list of licenses
   */
  public async listParams(request: ListLicenseParamsRequest): Promise<ListLicenseParamsResponse> {
    try {
      const response: AxiosResponse<{ licenseParams: LicenseParams[] }> =
        await this.httpClient.post("/protocol/license-params", request, {
          params: {
            ipOrgId: request.ipOrgId,
            options: request?.options,
          },
        });

      const formattedRes = {
        licenseParams: [
          {
            ...response.data.licenseParams?.[0],
            params: response.data.licenseParams?.[0].params.map(({ tag, value }) =>
              paramsTagValueDecoder(tag, value),
            ),
          },
        ],
      };

      return formattedRes;
    } catch (error: unknown) {
      handleError(error, `Failed to get license params`);
    }
  }
}
