import { QueryOptions, TxOptions } from "../options";
import { TypedData } from "../common";

export type Relationship = {
  id: string;
  type: string; // i.e. "APPEARS_IN"
  srcContract: string;
  srcTokenId: string;
  dstContract: string;
  dstTokenId: string;
  registeredAt: string; // ISO 8601
  txHash: string;
};

/**
 * Request type for relationship.register method.
 *
 * @public
 */
export type RegisterRelationshipRequest = {
  ipOrgId: string;
  relType: string;
  srcContract: string;
  srcTokenId: string;
  dstContract: string;
  dstTokenId: string;
  preHookData?: Array<TypedData>;
  postHookData?: Array<TypedData>;
  txOptions?: TxOptions;
};

/**
 * Response type for relationship.register method.
 *
 * @public
 */
export type RegisterRelationshipResponse = {
  txHash: string;
  relationshipId?: string;
};

/**
 * Request type for relationship.get method.
 *
 * @public
 */
export type GetRelationshipRequest = {
  relationshipId: string;
  options?: QueryOptions;
};

/**
 * Response type for relationship.get method.
 *
 * @public
 */
export type GetRelationshipResponse = {
  relationship: Relationship;
};

/**
 * Request type for relationship.list method.
 *
 * @public
 */
export type ListRelationshipRequest = {
  tokenId: string;
  contract: string;
  options?: QueryOptions;
};

/**
 * Response type for relationship.list method.
 *
 * @public
 */
export type ListRelationshipResponse = {
  relationships: Relationship[];
};
