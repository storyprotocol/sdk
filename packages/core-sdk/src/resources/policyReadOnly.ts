import { AxiosInstance } from "axios";
import { PublicClient } from "viem";

import {
  GetPolicyRequest,
  GetPolicyResponse,
  ListPoliciesRequest,
  ListPoliciesResponse,
} from "../types/resources/policy";
import { handleError } from "../utils/errors";
import { isIntegerString } from "../utils/utils";

/**
 * PolicyReadOnlyClient allows you to view and search policy on Story Protocol.
 */
export class PolicyReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get a Policy based on the specified Policy ID.
   *
   * @param request - the request object for getting an Policy.
   * @returns the response object the contains the fetched Policy.
   */
  public async get(request: GetPolicyRequest): Promise<GetPolicyResponse> {
    try {
      if (!isIntegerString(request.policyId)) {
        throw new Error(`Invalid Policy id. Must be an integer. But get: ${request.policyId}`);
      }
      const response = await this.httpClient.get(`/policies/${request.policyId}`);
      return response.data as GetPolicyResponse;
    } catch (error: unknown) {
      handleError(error, "Failed to get Policy");
    }
  }

  /**
   * List Policies
   *
   * @returns the response object that contains results from listing query.
   */
  public async list(request?: ListPoliciesRequest): Promise<ListPoliciesResponse> {
    try {
      const response = await this.httpClient.post(`/policies`, request || {});
      return response.data as ListPoliciesResponse;
    } catch (error) {
      handleError(error, "Failed to list policy.");
    }
  }
}
