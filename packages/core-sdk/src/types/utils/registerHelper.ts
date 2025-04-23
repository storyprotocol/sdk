import { Hex, Address, PublicClient, Hash } from "viem";

import { ChainIds } from "../config";
import {
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  EncodedTxData,
  IpAssetRegistryIpRegisteredEvent,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  RoyaltyModuleIpRoyaltyVaultDeployedEvent,
  RoyaltyTokenDistributionWorkflowsClient,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest,
  SimpleWalletClient,
} from "../../abi/generated";
import {
  DerivativeData,
  DerivativeDataInput,
  DistributeRoyaltyTokens,
  IpRegistrationWorkflowRequest,
  MintSpgNftRegistrationRequest,
  RegisterRegistrationRequest,
  RoyaltyShare,
  TransformIpRegistrationWorkflowResponse,
} from "../resources/ipAsset";
import { Erc20Spender } from "./wip";
import { WipOptions } from "../options";

export type GenerateOperationSignatureRequest = {
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

type BasicConfig = {
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  chainId: ChainIds;
};

export type TransformRegistrationRequestConfig = BasicConfig & {
  request: IpRegistrationWorkflowRequest;
};

export type HandleMintAndRegisterRequestConfig = BasicConfig & {
  request: MintSpgNftRegistrationRequest;
};

export type HandleRegisterRequestConfig = BasicConfig & {
  request: RegisterRegistrationRequest;
};

export type HandleDistributeRoyaltyTokensRequestConfig = BasicConfig & {
  request: Omit<DistributeRoyaltyTokens, "txOptions">;
};

export type CalculateDerivativeMintingFeeConfig = BasicConfig & {
  derivData: DerivativeData;
  sender?: Address;
};
export type GetIpIdAddressConfig = BasicConfig & {
  nftContract: Address;
  tokenId: bigint | number;
};
export type ValidateDerivativeDataConfig = BasicConfig & {
  derivativeDataInput: DerivativeDataInput;
};

export type PrepareDistributeRoyaltyTokensRequestConfig = BasicConfig & {
  royaltyDistributionRequests: RoyaltyDistributionRequest[];
  ipRegisteredLog: IpAssetRegistryIpRegisteredEvent[];
  ipRoyaltyVault: RoyaltyModuleIpRoyaltyVaultDeployedEvent[];
};
export type RoyaltyDistributionRequest = {
  nftContract: Address;
  tokenId: bigint;
  royaltyShares: RoyaltyShare[];
  deadline?: bigint;
};

export type AggregateRegistrationRequest = Record<
  string,
  {
    spenders: Erc20Spender[];
    totalFees: bigint;
    encodedTxData: EncodedTxData[];
    contractCall: Array<() => Promise<Hash>>;
  }
>;

export type HandleMulticallConfig = BasicConfig & {
  transferWorkflowResponses: TransformIpRegistrationWorkflowResponse[];
  multicall3Address: Address;
  wipOptions?: WipOptions;
  walletAddress: Address;
};

export type TransferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultConfig = {
  request: Omit<
    RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest,
    "sigMetadataAndAttachAndConfig"
  >;
  royaltyTokenDistributionWorkflowsClient: RoyaltyTokenDistributionWorkflowsClient;
  chainId: ChainIds;
  wallet: SimpleWalletClient;
  calculatedDeadline: bigint;
  ipIdAddress: Hex;
  royaltyShares: RoyaltyShare[];
};

export type TransferRegisterIpAndAttachPilTermsConfig = {
  request: Omit<
    LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
    "sigMetadataAndAttachAndConfig"
  >;
  licenseAttachmentWorkflowsClient: LicenseAttachmentWorkflowsClient;
  calculatedDeadline: bigint;
  ipIdAddress: Hex;
  wallet: SimpleWalletClient;
  chainId: ChainIds;
};

export type TransferRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequestConfig = {
  request: Omit<DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest, "sigMetadataAndRegister">;
  calculatedDeadline: bigint;
  ipIdAddress: Address;
  wallet: SimpleWalletClient;
  chainId: ChainIds;
  royaltyTokenDistributionWorkflowsClient: RoyaltyTokenDistributionWorkflowsClient;
  totalFees: bigint;
  royaltyShares: RoyaltyShare[];
};
export type TransferRegisterDerivativeIpRequestConfig = {
  request: Omit<DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest, "sigMetadataAndRegister">;
  calculatedDeadline: bigint;
  ipIdAddress: Address;
  wallet: SimpleWalletClient;
  chainId: ChainIds;
  derivativeWorkflowsClient: DerivativeWorkflowsClient;
  totalFees: bigint;
};

export type TransferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensConfig = {
  request: RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest;
  nftMintFee: bigint;
  isPublicMinting: boolean;
  totalDerivativeMintingFee: bigint;
  royaltyTokenDistributionWorkflowsClient: RoyaltyTokenDistributionWorkflowsClient;
};

export type TransformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest = {
  request: RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest;
  royaltyTokenDistributionWorkflowsClient: RoyaltyTokenDistributionWorkflowsClient;
  nftMintFee: bigint;
};

export type TransferMintAndRegisterIpAssetWithPilTermsConfig = {
  request: LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest;
  licenseAttachmentWorkflowsClient: LicenseAttachmentWorkflowsClient;
  nftMintFee: bigint;
  isPublicMinting: boolean;
};

export type TransferMintAndRegisterIpAndMakeDerivativeRequestConfig = {
  request: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest;
  derivativeWorkflowsClient: DerivativeWorkflowsClient;
  nftMintFee: bigint;
  isPublicMinting: boolean;
  totalDerivativeMintingFee: bigint;
};
