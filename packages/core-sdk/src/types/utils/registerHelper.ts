import { Hex, Address, PublicClient } from "viem";

import { ChainIds } from "../config";
import { SimpleWalletClient } from "../../abi/generated";
import {
  DerivativeData,
  DerivativeDataInput,
  DistributeRoyaltyTokens,
  IpRegistrationWorkflowRequest,
  MintSpgNftRegistrationRequest,
  RegisterRegistrationRequest,
} from "../resources/ipAsset";

export type GeneratePrefixRegisterSignatureRequest = {
  deadline: bigint;
  ipIdAddress: Address;
  methodType: SignatureMethodType;
  wallet: SimpleWalletClient;
  chainId: ChainIds;
  ipRoyaltyVault?: Address;
  totalAmount?: number;
  state?: Hex;
  encodeData?: Hex;
};

export enum SignatureMethodType {
  REGISTER_IP_AND_MAKE_DERIVATIVE_AND_DEPLOY_ROYALTY_VAULT = "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
  DISTRIBUTE_ROYALTY_TOKENS = "distributeRoyaltyTokens",
  REGISTER_DERIVATIVE_IP = "registerDerivativeIp",
  REGISTER_IP_AND_ATTACH_PIL_TERMS_AND_DEPLOY_ROYALTY_VAULT = "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
  REGISTER_IP_AND_ATTACH_PIL_TERMS = "registerIpAndAttachPilTerms",
  REGISTER_IP_AND_MAKE_DERIVATIVE_WITH_LICENSE_TOKENS = "registerIpAndMakeDerivativeWithLicenseTokens",
  REGISTER_PIL_TERMS_AND_ATTACH = "registerPilTermsAndAttach",
  REGISTER = "register",
  BATCH_REGISTER_DERIVATIVE = "batchRegisterDerivative",
}
export type BasicConfig = {
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  chainId: ChainIds;
};

export type TransformRegistrationRequestConfig = BasicConfig & {
  request: IpRegistrationWorkflowRequest;
};

export type HandleSpgNftRequestConfig = BasicConfig & {
  request: MintSpgNftRegistrationRequest;
};

export type HandleNftRequestConfig = BasicConfig & {
  request: RegisterRegistrationRequest;
};

export type HandleDistributeRoyaltyTokensRequestConfig = BasicConfig & {
  request: DistributeRoyaltyTokens;
};

export type CalculateDerivativeMintingFeeConfig = BasicConfig & {
  derivData: DerivativeData;
};
export type GetIpIdAddressConfig = BasicConfig & {
  nftContract: Address;
  tokenId: bigint | number;
};
export type ValidateDerivativeDataConfig = BasicConfig & {
  derivativeDataInput: DerivativeDataInput;
};
