import { Hex } from "viem";

import { TypedData } from "../common";
import { QueryOptions, TxOptions } from "../options";

/**
 * Core data model for License.
 *
 * @public
 */
export type License = {
  id: string;
  isReciprocal: boolean;
  derivativeNeedsApproval: boolean;
  derivativesAllowed: boolean;
  status: number;
  licensor: string;
  revoker: string;
  ipOrgId: string;
  ipAssetId: string;
  parentLicenseId: string;
  createdAt: string;
  txHash: string;
};

/**
 * Core data model for Param
 *
 * @public
 */
export type Param = {
  tag: Hex;
  value: Hex;
};

/**
 * Core data model for Param
 *
 * @public
 */
export type FormattedParam = {
  tag: string;
  value: unknown;
  type: string;
};

/**
 * Core data model for License Params
 *
 * @public
 */
export type LicenseParams = {
  ipOrgId: string;
  frameworkId: string;
  url: string;
  licensorConfig: number;
  params: Param[];
  createdAt: string; // ISO 8601
  txHash: string;
};

/**
 * Core data model for License Params
 *
 * @public
 */
export type FormattedLicenseParams = {
  ipOrgId: string;
  frameworkId: string;
  url: string;
  licensorConfig: number;
  params: FormattedParam[];
  createdAt: string; // ISO 8601
  txHash: string;
};

export type ParamValues = {
  tag: Hex;
  value: TypedData;
};

export enum LicensorConfigEnum {
  Unset,
  IpOrgOwnerAlways,
  Source,
}

export type LicensingConfig = {
  frameworkId: string;
  params: ParamValues[];
  licensor: LicensorConfigEnum;
};

/**
 * Represents the response structure for configuring a license using the `license.create` method.
 *
 * @public
 */

export type CreateLicenseRequest = {
  ipOrgId: string;
  parentLicenseId: string;
  ipaId: string;
  params: ParamValues[];
  preHookData: Array<TypedData>;
  postHookData: Array<TypedData>;
  txOptions?: TxOptions;
};

/**
 * Represents the response structure for creating a new license using the `license.create` method.
 *
 * @public
 */
export type CreateLicenseResponse = {
  txHash: string; // Transaction hash of the license creation transaction.
  licenseId?: string;
};

/**
 * Represents the response structure for configuring a license using the `license.configure` method.
 *
 * @public
 */
export type ConfigureLicenseRequest = {
  ipOrg: string;
  frameworkId: string;
  params: ParamValues[];
  licensor: LicensorConfigEnum;
  txOptions?: TxOptions;
};

/**
 * Represents the response structure for creating a new license using the `license.configure` method.
 *
 * @public
 */
export type ConfigureLicenseResponse = {
  txHash: string;
  success?: boolean;
};

/**
 * Request type for license.get method.
 *
 * @public
 */
export type GetLicenseRequest = {
  licenseId: string;
};

/**
 * Response type for license.get method.
 *
 * @public
 */
export type GetLicenseResponse = {
  license: License;
};

/**
 * Request type for license.list method.
 *
 * @public
 */
export type ListLicenseRequest = {
  ipOrgId?: string;
  ipAssetId?: string;
  options?: QueryOptions;
};

/**
 * Response type for license.list method.
 *
 * @public
 */
export type ListLicenseResponse = {
  licenses: License[];
};

/**
 * Request type for license.listParams method.
 *
 * @public
 */
export type ListLicenseParamsRequest = {
  ipOrgId: string;
  options?: QueryOptions;
};

/**
 * Response type for license.listParams method.
 *
 * @public
 */
export type ListLicenseParamsResponse = {
  licenseParams: FormattedLicenseParams[];
};
