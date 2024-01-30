import { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { LicenseReadOnlyClient } from "../../../src";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient } from "viem";

chai.use(chaiAsPromised);

describe("Test LicenseReadOnlyClient", function () {
  let licenseClient: LicenseReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    licenseClient = new LicenseReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test licenseClient.get", function () {
    it("should return License", async function () {
      const expectedLicense = {
        id: "1",
        amount: "2",
        creator: "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
        licenseId: "1",
        receiver: "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
        licenseData: {},
      };
      axiosMock.get = sinon.stub().returns({
        data: expectedLicense,
      });

      const response = await licenseClient.get({
        licenseId: "1",
      });
      expect(response).to.deep.equal(expectedLicense);
    });

    it("should throw error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        licenseClient.get({
          licenseId: "1",
        }),
      ).to.be.rejectedWith("http 500");
    });

    it("should throw error if License id is invalid", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("http 500"));
      await expect(
        licenseClient.get({
          licenseId: "fake License id",
        }),
      ).to.be.rejectedWith("Failed to get License: http 500");
    });
  });

  describe("Test licenseClient.list", async function () {
    const LicenseMock = {
      id: "1",
      amount: "2",
      creator: "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
      licenseId: "1",
      receiver: "0xb6288e57bf7406b35ab4f70fd1135e907107e386",
      licenseData: {},
    };

    const mockResponse = sinon.stub().returns({
      data: { data: [LicenseMock] },
    });

    it("should return License on a successful query", async function () {
      axiosMock.post = mockResponse;
      const response = await licenseClient.list();

      expect(response.data[0]).to.deep.equal(LicenseMock);
    });

    it("should return License without the request object", async function () {
      axiosMock.post = mockResponse;
      const response = await licenseClient.list();

      expect(response.data[0]).to.deep.equal(LicenseMock);
    });

    it("should throw error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(licenseClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
