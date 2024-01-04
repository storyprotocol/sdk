import { QueryOptions, TxOptions } from "../options";
import { TypedData } from "../common";

/**
 * Core data model for IP Asset.
 *
 * @public
 */
export type IPAsset = {
  id: string;
  name: string;
  type: IPAssetType;
  ipOrgId: string;
  owner: string;
  mediaUrl: string;
  contentHash?: string;
  createdAt: string; // ISO 8601
  txHash: string;
};

export type IPAssetType = {
  index: number;
  value: string;
};

/**
 * Request type for ipAsset.get method.
 *
 * @public
 */
export type GetIpAssetRequest = {
  ipAssetId: string;
};

/**
 * Response type for ipAsset.get method.
 *
 * @public
 */
export type GetIpAssetResponse = {
  ipAsset: IPAsset;
};

/**
 * Request type for ipAsset.create method.
 *
 * @public
 */
export type CreateIpAssetRequest = {
  name: string;
  typeIndex: number;
  ipOrgId: string;
  licenseId?: number;
  owner?: string;
  mediaUrl?: string;
  contentHash?: `0x${string}`;
  preHookData?: Array<TypedData>;
  postHookData?: Array<TypedData>;
  txOptions?: TxOptions;
};

/**
 * Response type for ipAsset.create method.
 *
 * @public
 */
export type CreateIpAssetResponse = {
  txHash: string;
  ipAssetId?: string;
};

/**
 * Request type for ipAsset.list method.
 *
 * @public
 */
export type ListIpAssetRequest = {
  ipOrgId?: string;
  options?: QueryOptions;
};

/**
 * Response type for ipAsset.list method.
 *
 * @public
 */
export type ListIpAssetResponse = {
  ipAssets: IPAsset[];
};
