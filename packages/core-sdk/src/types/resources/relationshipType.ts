import { QueryOptions, TxOptions } from "../options";
import { TypedData } from "../common";
import { Relatables } from "../../enums/Relatables";

/**
 * Core data model for Relationship Type.
 *
 * @public
 */
export type RelationshipType = {
  type: string;
  ipOrgId: string;
  srcContract: string;
  srcRelatable: number;
  srcSubtypesMask: number;
  dstContract: string;
  dstRelatable: number;
  dstSubtypesMask: number;
  registeredAt: string;
  txHash: string;
};

/**
 * Request type for relationshipType.get method.
 *
 * @public
 */
export type GetRelationshipTypeRequest = {
  ipOrgId: string;
  relType: string;
};

/**
 * Response type for relationshipType.get method.
 *
 * @public
 */
export type GetRelationshipTypeResponse = {
  relationshipType: RelationshipType;
};

/**
 * Request type for relationshipType.list method.
 *
 * @public
 */
export type ListRelationshipTypesRequest = {
  ipOrgId?: string;
  options?: QueryOptions;
};

/**
 * Response type for relationshipType.list method.
 *
 * @public
 */
export type ListRelationshipTypesResponse = {
  relationshipTypes: RelationshipType[];
};

/**
 * RelatedElements contains relatables from the source and the destination entity.
 *
 * @public
 */
export type RelatedElements = {
  src: Relatables;
  dst: Relatables;
};

/**
 * Request type for relationshipType.register method.
 *
 * @public
 */
export type RegisterRelationshipTypeRequest = {
  ipOrgId: string;
  relType: string;
  relatedElements: RelatedElements;
  allowedSrcIpAssetTypes: number[]; // the number is the index of the ip asset type array defined in ip org
  allowedDstIpAssetTypes: number[];
  preHooksConfig?: Array<TypedData>;
  postHooksConfig?: Array<TypedData>;
  txOptions?: TxOptions;
};

/**
 * Response type for relationshipType.register method.
 *
 * @public
 */
export type RegisterRelationshipTypeResponse = {
  txHash: string;
  success?: boolean;
};
