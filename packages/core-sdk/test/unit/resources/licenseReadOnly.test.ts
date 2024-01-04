import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient } from "viem";
import { ListLicenseRequest, LicenseReadOnlyClient } from "../../../src";
import { ListLicenseParamsRequest } from "../../../src/types/resources/license";

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

  describe("Test license.get", function () {
    const licenseMock = {
      id: "24",
      status: 3,
      isReciprocal: true,
      derivativeNeedsApproval: true,
      derivativesAllowed: true,
      licensor: "0xf398c12a45bc409b6c652e25bb0a3e702492a4ab",
      revoker: "0xf398c12a45bc409b6c652e25bb0a3e702492a4ab",
      ipOrgId: process.env.TEST_IPORG_ID as string,
      ipAssetId: "1",
      parentLicenseId: "0",
      createdAt: "2023-11-23T02:55:36Z",
      txHash: "0x000645882d175d1facd646f3ecca0bbf31a9b9697d3d3f3a564ce9c885d7eeb2",
    };
    it("should return a license when the license ID is valid", async function () {
      axiosMock.get = sinon.stub().returns({
        data: {
          license: licenseMock,
        },
      });

      const response = await licenseClient.get({
        licenseId: "49",
      });
      expect(response.license).to.deep.equal(licenseMock);
    });

    it("should throw an error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("HTTP 500"));

      await expect(
        licenseClient.get({
          licenseId: "123",
        }),
      ).to.be.rejectedWith("HTTP 500");
    });

    it("should throw an error when the license ID is invalid", async function () {
      await expect(
        licenseClient.get({
          licenseId: "abc",
        }),
      ).to.be.rejectedWith(`Invalid licenseId. Must be an integer. But got: abc`);
    });
  });

  describe("Test license.list", function () {
    const mockListLicenseRequest: ListLicenseRequest = {
      ipOrgId: process.env.TEST_IPORG_ID as string,
      ipAssetId: "5",
    };
    const licenseMock1 = {
      id: "24",
      status: 3,
      isReciprocal: true,
      derivativeNeedsApproval: true,
      derivativesAllowed: true,
      licensor: "0xf398c12a45bc409b6c652e25bb0a3e702492a4ab",
      revoker: "0xf398c12a45bc409b6c652e25bb0a3e702492a4ab",
      ipOrgId: "0x1eBb43775fCC45CF05eaa96182C8762220e17941",
      ipAssetId: "1",
      parentLicenseId: "0",
      createdAt: "2023-11-23T02:55:36Z",
      txHash: "0x000645882d175d1facd646f3ecca0bbf31a9b9697d3d3f3a564ce9c885d7eeb2",
    };
    const licenseMock2 = {
      id: "13",
      status: 3,
      isReciprocal: true,
      derivativeNeedsApproval: true,
      derivativesAllowed: true,
      licensor: "0xf398c12a45bc409b6c652e25bb0a3e702492a4ab",
      revoker: "0xf398c12a45bc409b6c652e25bb0a3e702492a4ab",
      ipOrgId: "0x1eBb43775fCC45CF05eaa96182C8762220e17941",
      ipAssetId: "0",
      parentLicenseId: "0",
      createdAt: "2023-11-23T02:12:24Z",
      txHash: "0x08c49125f2f91f8eda0b2a799424a41a825e6051541fd620727a96bdc4bc7a8a",
    };
    const mockResponse = sinon.stub().returns({
      data: {
        licenses: [licenseMock1, licenseMock2],
      },
    });

    it("should return a list of licenses", async function () {
      axiosMock.post = mockResponse;

      const response = await licenseClient.list(mockListLicenseRequest);
      expect(response.licenses).to.be.an("array");
      expect(response.licenses[0]).to.deep.equal(licenseMock1);
      expect(response.licenses[1]).to.deep.equal(licenseMock2);
    });

    it("should return a list of licenses without the request object", async function () {
      axiosMock.post = mockResponse;

      const response = await licenseClient.list();
      expect(response.licenses).to.be.an("array");
      expect(response.licenses[0]).to.deep.equal(licenseMock1);
    });

    it("should throw an error if wrong request object", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      //@ts-ignore
      await expect(licenseClient.list({ foo: "bar" })).to.be.rejectedWith("HTTP 500");
    });
  });

  describe("Test license.listParams", function () {
    const mockListLicenseParamsRequest: ListLicenseParamsRequest = {
      ipOrgId: process.env.TEST_IPORG_ID as string,
    };
    const licenseParamMock = [
      {
        ipOrgId: "0x7eb6248eaba29cf7a6c5a9c63a8416cb67cd1898",
        frameworkId: "SPUML-1.0",
        url: "https://github.com/storyprotocol/protocol-contracts/blob/main/SPUML-v1.pdf",
        licensorConfig: 1,
        params: [
          {
            tag: "0x4368616e6e656c732d4f662d446973747269627574696f6e0000000000000018",
            value:
              "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000274657374310000000000000000000000000000000000000000000000000000057465737432000000000000000000000000000000000000000000000000000005",
          },
          {
            tag: "0x4174747269627574696f6e00000000000000000000000000000000000000000b",
            value: "0x",
          },
          {
            tag: "0x44657269766174697665732d416c6c6f77656400000000000000000000000013",
            value: "0x0000000000000000000000000000000000000000000000000000000000000001",
          },
          {
            tag: "0x44657269766174697665732d416c6c6f7765642d4f7074696f6e73000000001b",
            value: "0x0000000000000000000000000000000000000000000000000000000000000003",
          },
        ],
        createdAt: "1702039260",
        txHash: "0xb2ce442fe9b685f7817ee2fbebbaeee063fb441ea60ad1c233b827c772a6fc46",
      },
    ];

    const expectedOutput = [
      {
        ipOrgId: "0x7eb6248eaba29cf7a6c5a9c63a8416cb67cd1898",
        frameworkId: "SPUML-1.0",
        url: "https://github.com/storyprotocol/protocol-contracts/blob/main/SPUML-v1.pdf",
        licensorConfig: 1,
        params: [
          {
            tag: "Channels-Of-Distribution",
            value: ["", "", "test1", "test2"],
            type: "string[]",
          },
          {
            tag: "Attribution",
            type: "boolean",
            value: false,
          },
          {
            tag: "Derivatives-Allowed",
            type: "boolean",
            value: true,
          },
          {
            tag: "Derivatives-Allowed-Options",
            type: "string[]",
            value: ["Allowed-Reciprocal-License", "Allowed-With-Attribution"],
          },
        ],
        createdAt: "1702039260",
        txHash: "0xb2ce442fe9b685f7817ee2fbebbaeee063fb441ea60ad1c233b827c772a6fc46",
      },
    ];

    const mockResponse = sinon.stub().returns({
      data: {
        licenseParams: licenseParamMock,
      },
    });

    it("should return a list of license params", async function () {
      axiosMock.post = mockResponse;

      const response = await licenseClient.listParams(mockListLicenseParamsRequest);
      expect(response.licenseParams).to.be.an("array");
      expect(response.licenseParams).to.deep.equal(expectedOutput);
    });

    it("should throw an error if wrong request object", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      //@ts-ignore
      await expect(licenseClient.listParams({ foo: "bar" })).to.be.rejectedWith("HTTP 500");
    });
  });
});
