import { Address } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";
import { LicensingConfig } from "../common";

export interface CommercialLicenseTerms {
  /** The default minting fee to be paid when minting a license.*/
  defaultMintingFee: bigint | string | number;
  /** The ERC20 token to be used to pay the minting fee. The token must be registered in story protocol.*/
  currency: Address;
  /** The address of the royalty policy contract which required to StoryProtocol in advance.*/
  royaltyPolicy: Address;
}
export interface CommercialRemixLicenseTerms extends CommercialLicenseTerms {
  /** Percentage of revenue that must be shared with the licensor.*/
  commercialRevShare: number | string;
}

/**
 * This structure defines the terms for a Programmable IP License (PIL). These terms can be attached to IP Assets. The legal document of the PIL can be found in this repository.
 **/
export interface PILTermsInput extends CommercialLicenseTerms, CommercialRemixLicenseTerms {
  /** Indicates whether the license is transferable or not.*/
  transferable: boolean;
  /** The expiration period of the license.*/
  expiration: bigint | string | number;
  /** Indicates whether the work can be used commercially or not.*/
  commercialUse: boolean;
  /** Whether attribution is required when reproducing the work commercially or not.*/
  commercialAttribution: boolean;
  /** Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.*/
  commercializerChecker: Address;
  /** The data to be passed to the commercializer checker contract.*/
  commercializerCheckerData: Address;
  /** The maximum revenue that can be generated from the commercial use of the work.*/
  commercialRevCeiling: bigint | string | number;
  /** Indicates whether the licensee can create derivatives of his work or not.*/
  derivativesAllowed: boolean;
  /** Indicates whether attribution is required for derivatives of the work or not.*/
  derivativesAttribution: boolean;
  /** Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.*/
  derivativesApproval: boolean;
  /** Indicates whether the licensee must license derivatives of the work under the same terms or not.*/
  derivativesReciprocal: boolean;
  /** The maximum revenue that can be generated from the derivative use of the work.*/
  derivativeRevCeiling: bigint | string | number;
  /** The URI of the license terms, which can be used to fetch the offchain license terms.*/
  uri: string;
}
/**
 * The request object that contains all data needed to register a license term.
 */
export type RegisterPILTermsRequest<PILType extends PIL_TYPE> = {
  /**  The license terms to be registered. */
  terms:
    | (PILType extends PIL_TYPE.COMMERCIAL_USE ? CommercialLicenseTerms : never)
    | (PILType extends PIL_TYPE.COMMERCIAL_REMIX ? CommercialRemixLicenseTerms : never)
    | (PILType extends PIL_TYPE.NON_COMMERCIAL_REMIX ? undefined : never)
    | PILTermsInput;
  /** The type of the license terms to be registered, including no-commercial, commercial,commercial remix. */
  PILType?: PILType;
  /** This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property. */
  txOptions?: TxOptions;
};
export type RegisterPILResponse = {
  /** The ID of the registered license terms. */
  licenseTermsId?: bigint;
  /** The transaction hash of the register PIL terms. */
  txHash?: string;
  /** The encoded transaction data of the register PIL terms. */
  encodedTxData?: EncodedTxData;
};
export type PILTerms = Omit<
  PILTermsInput,
  | "defaultMintingFee"
  | "expiration"
  | "commercialRevCeiling"
  | "derivativeRevCeiling"
  | "commercialRevShare"
> & {
  defaultMintingFee: bigint;
  expiration: bigint;
  commercialRevCeiling: bigint;
  derivativeRevCeiling: bigint;
  commercialRevShare: number;
};
export type LicenseTermsIdResponse = bigint;

export type AttachLicenseTermsRequest = {
  ipId: Address;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: Address;
  txOptions?: TxOptions;
};

export type AttachLicenseTermsResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  success?: boolean;
};

export type MintLicenseTokensRequest = {
  licensorIpId: Address;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: Address;
  maxMintingFee: bigint | string | number;
  maxRevenueShare: number | string;
  amount?: number | string | bigint;
  receiver?: Address;
  txOptions?: TxOptions;
};

export type MintLicenseTokensResponse = {
  licenseTokenIds?: bigint[];
  txHash?: string;
  encodedTxData?: EncodedTxData;
};
/**
 * The type of the Programmable IP License (PIL).
 * @enum {number}
 * @readonly
 */
export enum PIL_TYPE {
  /*Non commercial remix*/
  NON_COMMERCIAL_REMIX,
  /** Commercial use*/
  COMMERCIAL_USE,
  /** Commercial remix*/
  COMMERCIAL_REMIX,
}

export type LicenseTermsId = string | number | bigint;

export type PredictMintingLicenseFeeRequest = {
  licensorIpId: Address;
  licenseTermsId: LicenseTermsId;
  amount: string | number | bigint;
  licenseTemplate?: Address;
  receiver?: Address;
  txOptions?: TxOptions;
};

export type InnerLicensingConfig = {
  mintingFee: bigint;
  commercialRevShare: number;
  expectMinimumGroupRewardShare: number;
} & LicensingConfig;
export type SetLicensingConfigRequest = {
  ipId: Address;
  licenseTermsId: string | number | bigint;
  licensingConfig: LicensingConfig;
  licenseTemplate: Address;
  txOptions?: TxOptions;
};

export type SetLicensingConfigResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  success?: boolean;
};
