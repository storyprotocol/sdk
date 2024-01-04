import { expect } from "chai";
import {
  StoryClient,
  StoryReadOnlyConfig,
  ReadOnlyClient,
  ListRelationshipRequest,
  Relationship,
} from "../../src";

describe("Relationship Read Only Functions", function () {
  let client: ReadOnlyClient;

  before(async function () {
    const config: StoryReadOnlyConfig = {};
    client = StoryClient.newReadOnlyClient(config);
  });

  describe("Get Relationship", async function () {
    it("should retrieve a relationship by its ID", async function () {
      const response = await expect(
        client.relationship.get({
          relationshipId: process.env.TEST_RELATIONSHIP_ID as string, // Provide a valid ID
        }),
      ).to.not.be.rejected;
      expect(response).to.have.property("relationship");
      expectRelationshipFields(response.relationship);
    });

    it("should throw errors when retrieving an invalid relationship", async function () {
      return expect(
        client.relationship.get({
          relationshipId: "invalid_id", // Provide an invalid ID
        }),
      ).to.be.rejected;
    });
  });

  describe("List Relationships", async function () {
    it("should list all relationships", async function () {
      const mockListRelationshipRequest: ListRelationshipRequest = {
        tokenId: process.env.TEST_IPASSET_ID2 as string,
        contract: process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT as string,
        options: {
          pagination: {
            limit: 1,
            offset: 0,
          },
        },
      };
      const response = await client.relationship.list(mockListRelationshipRequest);

      expect(response).to.have.property("relationships");
      expect(response.relationships).to.be.an("array");
      expect(response.relationships.length).to.gt(0);
      expectRelationshipFields(response.relationships[0]);
    });

    it("should handle errors when listing licenses with invalid id", async function () {
      const mockInvalidListRelationshipRequest: ListRelationshipRequest = {
        tokenId: "aaa",
        contract: process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT as string,
        options: {
          pagination: {
            limit: 1,
            offset: 0,
          },
        },
      };
      return expect(client.relationship.list(mockInvalidListRelationshipRequest)).to.be.rejected;
    });
  });

  function expectRelationshipFields(relationship: Relationship) {
    expect(relationship).to.have.property("id");
    expect(relationship).to.have.property("type");
    expect(relationship).to.have.property("srcContract");
    expect(relationship).to.have.property("srcTokenId");
    expect(relationship).to.have.property("dstContract");
    expect(relationship).to.have.property("dstTokenId");
    expect(relationship).to.have.property("registeredAt");
    expect(relationship).to.have.property("txHash");

    expect(relationship.id).to.be.a("string");
    expect(relationship.type).to.be.a("string");
    expect(relationship.srcContract).to.be.a("string");
    expect(relationship.srcTokenId).to.be.a("string");
    expect(relationship.dstContract).to.be.a("string");
    expect(relationship.dstTokenId).to.be.a("string");
    expect(relationship.registeredAt).to.be.a("string");
    expect(relationship.txHash).to.be.a("string");
  }
});
