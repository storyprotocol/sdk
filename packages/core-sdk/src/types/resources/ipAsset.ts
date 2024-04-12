import { Hex } from "viem";

import { TxOptions } from "../options";

export type RegisterIpResponse = {
  txHash?: string;
  ipId?: Hex;
};

export type RegisterRequest = {
  tokenContract: Hex;
  tokenId: string;
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensRequest = {
  childIpId: Hex;
  licenseTokenIds: string[];
  txOptions?: TxOptions;
};

export type RegisterDerivativeWithLicenseTokensResponse = {
  txHash: string;
};

export type RegisterDerivativeRequest = {
  childIpId: Hex;
  parentIpIds: Hex[];
  licenseTermsIds: string[];
  licenseTemplate?: Hex;
  txOptions?: TxOptions;
};

export type RegisterDerivativeResponse = {
  txHash?: string;
  childIpId?: Hex;
};
