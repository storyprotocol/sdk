import axios, { AxiosInstance } from "axios";

import { RoyaltyPolicy, RoyaltyPolicyApiResponse } from "../types/resources/royalty";
import { License, LicenseApiResponse } from "../types/resources/license";
import { Policy, PolicyApiResponse } from "../types/resources/policy";

export class StoryAPIClient {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: "https://api.storyprotocol.net",
      timeout: 60000,
      headers: {
        "x-api-key": "U3RvcnlQcm90b2NvbFRlc3RBUElLRVk=",
      },
    });
  }

  public async getRoyaltyPolicy(ipId: string): Promise<RoyaltyPolicy> {
    const royaltyPolicyResp = await this.httpClient.get(`/api/v1/royalties/policies/${ipId}`);
    return (royaltyPolicyResp.data as RoyaltyPolicyApiResponse).data;
  }

  public async getLicense(licenseId: string): Promise<License> {
    const licenseResp = await this.httpClient.get(`/api/v1/licenses/${licenseId}`);
    return (licenseResp.data as LicenseApiResponse).data;
  }

  public async getPolicy(policyId: string): Promise<Policy> {
    const policyResp = await this.httpClient.get(`/api/v1/policies/${policyId}`);
    return (policyResp.data as PolicyApiResponse).data;
  }
}
