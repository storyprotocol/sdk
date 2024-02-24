import sinon from "sinon";
import { expect } from "chai";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { StoryAPIClient } from "../../../src/clients/storyAPI";

describe("Test StoryAPIClient", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("test for getRoyaltyPolicy", () => {
    afterEach(() => {
      sinon.restore();
    });
    it("should resolve error if network error occurs", async () => {
      sinon.stub(axios, "create").returns({
        get: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
          Promise.reject(new Error("http 500")),
      } as AxiosInstance);
      const storyClient: StoryAPIClient = new StoryAPIClient();
      await expect(storyClient.getRoyaltyPolicy("1")).to.be.rejectedWith("http 500");
    });

    it("should resolve royalty policy when request succeeded", async () => {
      sinon.stub(axios, "create").returns({
        get: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
          Promise.resolve({
            status: 200,
            data: {
              data: {
                id: "3",
                targetAncestors: ["0x222222222222222222222222222222222"],
                targetRoyaltyAmount: ["1"],
              },
            },
          } as AxiosResponse),
      } as AxiosInstance);
      const storyClient: StoryAPIClient = new StoryAPIClient();
      const { id, targetAncestors, targetRoyaltyAmount } = await storyClient.getRoyaltyPolicy("1");
      expect(id).to.equal("3");
      expect(targetAncestors[0]).to.equal("0x222222222222222222222222222222222");
      expect(targetRoyaltyAmount[0]).to.equal("1");
    });
  });

  describe("test for getLicense", () => {
    afterEach(() => {
      sinon.restore();
    });
    it("should resolve error if network error occurs", async () => {
      sinon.stub(axios, "create").returns({
        get: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
          Promise.reject(new Error("http 500")),
      } as AxiosInstance);
      const storyClient: StoryAPIClient = new StoryAPIClient();
      await expect(storyClient.getLicense("1")).to.be.rejectedWith("http 500");
    });

    it("should resolve license when request succeeded", async () => {
      sinon.stub(axios, "create").returns({
        get: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
          Promise.resolve({
            status: 200,
            data: {
              data: {
                id: "3",
                policyId: "2",
                licensorIpId: "1",
              },
            },
          } as AxiosResponse),
      } as AxiosInstance);
      const storyClient: StoryAPIClient = new StoryAPIClient();
      const { id, policyId, licensorIpId } = await storyClient.getLicense("1");
      expect(id).to.equal("3");
      expect(policyId).to.equal("2");
      expect(licensorIpId).to.equal("1");
    });
  });

  describe("test for getPolicy", () => {
    afterEach(() => {
      sinon.restore();
    });
    it("should resolve error if network error occurs", async () => {
      sinon.stub(axios, "create").returns({
        get: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
          Promise.reject(new Error("http 500")),
      } as AxiosInstance);
      const storyClient: StoryAPIClient = new StoryAPIClient();
      await expect(storyClient.getPolicy("1")).to.be.rejectedWith("http 500");
    });

    it("should resolve license when request succeeded", async () => {
      sinon.stub(axios, "create").returns({
        get: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
          Promise.resolve({
            status: 200,
            data: {
              data: {
                id: "3",
                pil: {
                  commercialRevShare: "commercial_rev_share",
                },
              },
            },
          } as AxiosResponse),
      } as AxiosInstance);
      const storyClient: StoryAPIClient = new StoryAPIClient();
      const { id, pil } = await storyClient.getPolicy("1");
      expect(id).to.equal("3");
      expect(pil.commercialRevShare).to.equal("commercial_rev_share");
    });
  });
});
