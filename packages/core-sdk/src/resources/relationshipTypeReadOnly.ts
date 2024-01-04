import { AxiosInstance, AxiosResponse } from "axios";
import { isAddress, PublicClient } from "viem";

import {
  GetRelationshipTypeRequest,
  GetRelationshipTypeResponse,
  ListRelationshipTypesRequest,
  ListRelationshipTypesResponse,
} from "../types/resources/relationshipType";
import { dictToQueryParams } from "../utils/utils";
import { handleError } from "../utils/errors";

/**
 * RelationshipTypeReadOnlyClient allows you to view and search relationship types on Story Protocol.
 */
export class RelationshipTypeReadOnlyClient {
  protected readonly httpClient: AxiosInstance;
  protected readonly rpcClient: PublicClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient) {
    this.httpClient = httpClient;
    this.rpcClient = rpcClient;
  }

  /**
   * Get a RelationshipType by ipOrgId or relType.
   *
   * @param request - the request object for getting the relationship type
   * @returns the response object that contains the fetched relationship type object
   */
  public async get(request: GetRelationshipTypeRequest): Promise<GetRelationshipTypeResponse> {
    if (!isAddress(request.ipOrgId)) {
      return handleError(
        new Error(`Invalid ipOrgId. Must be an address. But got: ${request.ipOrgId}`),
        `Failed to get relationship type`,
      );
    }

    try {
      const params = dictToQueryParams(request);
      const response: AxiosResponse = await this.httpClient.get(
        `/protocol/relationship-type?${params}`,
      );

      return response.data as GetRelationshipTypeResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to get relationship type`);
    }
  }

  /**
   * List RelationshipTypes.
   *
   * @returns the response object that contains a list of relationship types
   */
  public async list(request: ListRelationshipTypesRequest): Promise<ListRelationshipTypesResponse> {
    try {
      const response: AxiosResponse = await this.httpClient.post(
        `/protocol/relationship-type`,
        request,
        {
          params: {
            ipOrgId: request?.ipOrgId,
            options: request?.options,
          },
        },
      );

      return response.data as ListRelationshipTypesResponse;
    } catch (error: unknown) {
      handleError(error, `Failed to list relationship types`);
    }
  }
}
