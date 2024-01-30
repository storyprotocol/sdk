import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PolicyReadOnlyClient } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient } from "viem";

chai.use(chaiAsPromised);

describe("Test PolicyReadOnlyClient", function () {
  let policyClient: PolicyReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    policyClient = new PolicyReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test policyClient.get", function () {
    it("should return Policy", async function () {
      const expectedPolicy = {
        policyId: "1",
        creator: "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
        frameworkId: "1",
        blockNumber: "5148052",
        blockTimestamp: "1706139240",
      };
      axiosMock.get = sinon.stub().returns({
        data: expectedPolicy,
      });

      const response = await policyClient.get({
        policyId: "1",
      });
      expect(response).to.deep.equal(expectedPolicy);
    });

    it("should throw error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        policyClient.get({
          policyId: "1",
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error if Policy id is invalid", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        policyClient.get({
          policyId: "fake Policy id",
        }),
      ).to.be.rejectedWith("Failed to get Policy: http 500");
    });
  });

  describe("Test policyClient.list", async function () {
    const PolicyMock = {
      policyId: "1",
      creator: "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
      frameworkId: "1",
      blockNumber: "5148052",
      blockTimestamp: "1706139240",
    };

    const mockResponse = sinon.stub().returns({
      data: { data: [PolicyMock] },
    });

    it("should return Policy on a successful query", async function () {
      axiosMock.post = mockResponse;
      const response = await policyClient.list();

      expect(response.data[0]).to.deep.equal(PolicyMock);
    });

    it("should return Policy without the request object", async function () {
      axiosMock.post = mockResponse;
      const response = await policyClient.list();

      expect(response.data[0]).to.deep.equal(PolicyMock);
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(policyClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
