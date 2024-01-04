import chai, { expect } from "chai";
import { RelationshipTypeReadOnlyClient } from "../../../src/resources/relationshipTypeReadOnly";
import { createMock } from "../testUtils";
import * as sinon from "sinon";

import chaiAsPromised from "chai-as-promised";
import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, stringToHex } from "viem";
import {
  GetRelationshipTypeRequest,
  GetRelationshipTypeResponse,
  ListRelationshipTypesRequest,
  ListRelationshipTypesResponse,
} from "../../../src/types/resources/relationshipType";

chai.use(chaiAsPromised);

describe("Test RelationshipTypeReadOnlyClient", function () {
  let relationshipTypeClient: RelationshipTypeReadOnlyClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    relationshipTypeClient = new RelationshipTypeReadOnlyClient(axiosMock, rpcMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("test RelationshipTypeClient.get", () => {
    it("should retrieve a RelationshipType by its ip org id", async () => {
      const mockGetRequest: GetRelationshipTypeRequest = {
        ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
        relType: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84fc3",
      };
      const mockResponse: { data: GetRelationshipTypeResponse } = {
        data: {
          relationshipType: {
            dstContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
            dstRelatable: 1,
            dstSubtypesMask: 0,
            ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
            type: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84fc3",
            srcContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
            srcRelatable: 1,
            srcSubtypesMask: 0,
            txHash: "0x02230010bf433393ad3999c95a2af63c73bf8e5c620c5e607de7648d7a8565a6",
            registeredAt: "2021-09-14T00:00:00Z",
          },
        },
      };

      axiosMock.get = sinon.stub().resolves(mockResponse);
      const response = await relationshipTypeClient.get(mockGetRequest);
      expect(response).to.deep.equal(mockResponse.data);
    });

    it("should handle errors when retrieving a RelationshipType", async () => {
      const mockGetRequest: GetRelationshipTypeRequest = {
        ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
        relType: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84ac3", // incorrect relType
      };
      axiosMock.get = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(relationshipTypeClient.get(mockGetRequest)).to.be.rejectedWith("HTTP 500");
    });

    it("should throw error if asset id is invalid", async function () {
      const mockResponse: { data: GetRelationshipTypeResponse } = {
        data: {
          relationshipType: {
            dstContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
            dstRelatable: 1,
            dstSubtypesMask: 0,
            ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
            type: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84fc3",
            srcContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
            srcRelatable: 1,
            srcSubtypesMask: 0,
            txHash: "0x02230010bf433393ad3999c95a2af63c73bf8e5c620c5e607de7648d7a8565a6",
            registeredAt: "2021-09-14T00:00:00Z",
          },
        },
      };

      axiosMock.get = sinon.stub().resolves(mockResponse);
      await expect(
        relationshipTypeClient.get({
          ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a61", // invalid ipOrgId
          relType: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84fc3",
        }),
      ).to.be.rejectedWith(
        `Failed to get relationship type: Invalid ipOrgId. Must be an address. But got: 0xb422e54932c1dae83e78267a4dd2805aa64a61`,
      );
    });
  });

  describe("test RelationshipTypeReadOnlyClient.list", () => {
    const mockListRequest: ListRelationshipTypesRequest = {
      ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
      options: {
        pagination: {
          offset: 0,
          limit: 10,
        },
      },
    };

    it("should list all RelationshipTypes", async () => {
      const mockResponse: { data: ListRelationshipTypesResponse } = {
        data: {
          relationshipTypes: [
            {
              dstContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
              dstRelatable: 1,
              dstSubtypesMask: 0,
              ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
              type: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84fc3",
              srcContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
              srcRelatable: 1,
              srcSubtypesMask: 0,
              txHash: "0x02230010bf433393ad3999c95a2af63c73bf8e5c620c5e607de7648d7a8565a6",
              registeredAt: "2021-09-14T00:00:00Z",
            },
            // ... Add more dummy RelationshipTypes as needed
          ],
        },
      };

      axiosMock.post = sinon.stub().resolves(mockResponse);
      const response = await relationshipTypeClient.list(mockListRequest);
      expect(response).to.deep.equal(mockResponse.data);
    });

    describe("test RelationshipTypeReadOnlyClient.list without specifying an iporgid", () => {
      const mockListRequest: ListRelationshipTypesRequest = {
        options: {
          pagination: {
            offset: 0,
            limit: 10,
          },
        },
      };

      it("should list all RelationshipTypes", async () => {
        const mockResponse: { data: ListRelationshipTypesResponse } = {
          data: {
            relationshipTypes: [
              {
                dstContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
                dstRelatable: 1,
                dstSubtypesMask: 0,
                ipOrgId: "0xb422e54932c1dae83e78267a4dd2805aa64a8061",
                type: "0xc12a5f0d1e5a95f4fc32ff629c53defa11273a372e29ae51ab24323e4af84fc3",
                srcContract: "0x177175a4b26f6ea050676f8c9a14d395f896492c",
                srcRelatable: 1,
                srcSubtypesMask: 0,
                txHash: "0x02230010bf433393ad3999c95a2af63c73bf8e5c620c5e607de7648d7a8565a6",
                registeredAt: "2021-09-14T00:00:00Z",
              },
              // ... Add more dummy RelationshipTypes as needed
            ],
          },
        };

        axiosMock.post = sinon.stub().resolves(mockResponse);
        const response = await relationshipTypeClient.list(mockListRequest);
        expect(response).to.deep.equal(mockResponse.data);
      });

      it("should handle errors when listing RelationshipTypes", async () => {
        axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
        await expect(relationshipTypeClient.list(mockListRequest)).to.be.rejectedWith("HTTP 500");
      });
    });
  });
});
