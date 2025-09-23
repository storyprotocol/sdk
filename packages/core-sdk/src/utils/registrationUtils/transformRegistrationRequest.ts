import { encodeFunctionData, Hash } from "viem";

import {
  derivativeWorkflowsAbi,
  DerivativeWorkflowsClient,
  IpAccountImplClient,
  ipRoyaltyVaultImplAbi,
  IpRoyaltyVaultImplReadOnlyClient,
  licenseAttachmentWorkflowsAbi,
  LicenseAttachmentWorkflowsClient,
  royaltyTokenDistributionWorkflowsAbi,
  royaltyTokenDistributionWorkflowsAddress,
  RoyaltyTokenDistributionWorkflowsClient,
  RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest,
  SpgnftImplReadOnlyClient,
} from "../../abi/generated";
import {
  TransformedIpRegistrationWorkflowRequest,
  TransformIpRegistrationWorkflowRequest,
} from "../../types/resources/ipAsset";
import {
  HandleDistributeRoyaltyTokensRequestConfig,
  HandleMintAndRegisterRequestConfig,
  HandleRegisterRequestConfig,
  PrepareDistributeRoyaltyTokensRequestConfig,
  SignatureMethodType,
  TransferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensConfig,
  TransferMintAndRegisterIpAndMakeDerivativeRequestConfig,
  TransferMintAndRegisterIpAssetWithPilTermsConfig,
  TransferRegisterDerivativeIpRequestConfig,
  TransferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultConfig,
  TransferRegisterIpAndAttachPilTermsConfig,
  TransferRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequestConfig,
  TransformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  TransformRegistrationRequestConfig,
} from "../../types/utils/registerHelper";
import { calculateDerivativeMintingFee, calculateSPGWipMintFee } from "../calculateMintFee";
import { generateOperationSignature } from "../generateOperationSignature";
import { getIpMetadataForWorkflow } from "../getIpMetadataForWorkflow";
import { validateAddress } from "../utils";
import {
  getCalculatedDeadline,
  getIpIdAddress,
  getPublicMinting,
  getRoyaltyShares,
  validateDerivativeData,
  validateLicenseTermsData,
} from "./registerValidation";
import { LicenseTermsDataInput } from "../../types/resources/license";
/**
 * Transforms the registration request to the appropriate format based on workflow type.
 *
 * @remarks
 * This utility function serves as the entry point for processing both `register*` and
 * `mintAndRegister*` workflows. It analyzes the request structure and routes it to the
 * appropriate handler:
 *
 * - For minting + registration workflows (containing `spgNftContract`): Routes to `handleMintAndRegisterRequest`
 * - For registration-only workflows (containing `nftContract` and `tokenId`): Routes to `handleRegisterRequest`
 *
 * Each handler then applies the necessary transformations, validates inputs, calculates fees,
 * generates required signatures, and prepares the transaction data for submission.
 *
 * @throws Error if the request doesn't match any supported workflow pattern
 */

export const transformRegistrationRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  rpcClient,
  wallet,
  chainId,
}: TransformRegistrationRequestConfig): Promise<TransformedIpRegistrationWorkflowRequest<T>> => {
  if ("spgNftContract" in request) {
    return handleMintAndRegisterRequest<T>({ request, rpcClient, wallet, chainId });
  } else if ("nftContract" in request && "tokenId" in request) {
    return handleRegisterRequest<T>({ request, rpcClient, wallet, chainId });
  }

  throw new Error("Invalid registration request type");
};

/**
 * Handles a request for the `register*` contract methods.
 *
 * @remarks
 * This method processes various IP registration workflows including:
 *
 * - {@link registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens} - Registers derivative IP with license terms and royalty distribution
 * - {@link registerIpAndAttachPilTerms} - Registers IP and attaches PIL (Programmable IP License) terms
 * - {@link registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens} - Registers IP with license terms and royalty distribution
 * - {@link registerDerivativeIp} - Registers a derivative work based on existing IP
 * - {@link registerIpAndMakeDerivativeAndDeployRoyaltyVault} - Registers IP, creates derivative, and deploys royalty vault
 *
 * Key features:
 * - Automatically calculates all required license fees
 * - Generates appropriate operation signatures based on workflow type using EIP-712
 * - Does not support `multicall3` integration because the signature signer must be the transaction caller
 * - Uses SPG's native transaction handling for multicall
 * - Validates all input parameters
 */
const handleRegisterRequest = async <T extends TransformIpRegistrationWorkflowRequest>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleRegisterRequestConfig): Promise<TransformedIpRegistrationWorkflowRequest<T>> => {
  const ipIdAddress = await getIpIdAddress({
    nftContract: validateAddress(request.nftContract),
    tokenId: BigInt(request.tokenId),
    rpcClient,
    wallet,
    chainId,
  });

  const baseRequest = {
    nftContract: validateAddress(request.nftContract),
    tokenId: BigInt(request.tokenId),
    ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
  };
  const calculatedDeadline = await getCalculatedDeadline(rpcClient, request.deadline);
  const royaltyTokenDistributionWorkflowsClient = new RoyaltyTokenDistributionWorkflowsClient(
    rpcClient,
    wallet,
  );
  const licenseAttachmentWorkflowsClient = new LicenseAttachmentWorkflowsClient(rpcClient, wallet);
  const derivativeWorkflowsClient = new DerivativeWorkflowsClient(rpcClient, wallet);

  if ("licenseTermsData" in request) {
    const { licenseTermsData, maxLicenseTokens } = await validateLicenseTermsData(
      request.licenseTermsData,
      rpcClient,
      chainId,
    );
    const requestWithTerms = { ...baseRequest, licenseTermsData };

    if ("royaltyShares" in request) {
      return await transferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest({
        request: requestWithTerms,
        royaltyTokenDistributionWorkflowsClient,
        chainId,
        wallet,
        calculatedDeadline,
        ipIdAddress,
        royaltyShares: request.royaltyShares,
        maxLicenseTokens,
      });
    }

    return await transferRegisterIpAndAttachPilTermsRequest({
      request: requestWithTerms,
      licenseAttachmentWorkflowsClient,
      calculatedDeadline,
      ipIdAddress,
      wallet,
      chainId,
      maxLicenseTokens,
    });
  }

  if ("derivData" in request) {
    const derivData = await validateDerivativeData({
      derivativeDataInput: request.derivData,
      rpcClient,
      chainId,
      wallet,
    });
    const totalFees = await calculateDerivativeMintingFee({
      derivData,
      rpcClient,
      chainId,
      wallet,
    });
    if ("royaltyShares" in request) {
      return await transferRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest({
        request: {
          ...baseRequest,
          derivData,
        },
        calculatedDeadline,
        ipIdAddress,
        wallet,
        chainId,
        royaltyTokenDistributionWorkflowsClient,
        totalFees,
        royaltyShares: request.royaltyShares,
      });
    }

    return await transferRegisterDerivativeIpRequest({
      request: {
        ...baseRequest,
        derivData,
      },
      calculatedDeadline,
      ipIdAddress,
      wallet,
      chainId,
      derivativeWorkflowsClient,
      totalFees,
    });
  }

  throw new Error("Invalid register request type");
};

/**
 * Transforms a request for the `registerDerivativeIp` contract method.
 */
const transferRegisterDerivativeIpRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  calculatedDeadline,
  ipIdAddress,
  wallet,
  chainId,
  derivativeWorkflowsClient,
  totalFees,
}: TransferRegisterDerivativeIpRequestConfig): Promise<
  TransformedIpRegistrationWorkflowRequest<T>
> => {
  const signature = await generateOperationSignature({
    ipIdAddress,
    methodType: SignatureMethodType.REGISTER_DERIVATIVE_IP,
    deadline: calculatedDeadline,
    wallet,
    chainId,
  });
  const transformRequest = {
    ...request,
    sigMetadataAndRegister: {
      signer: wallet.account!.address,
      deadline: calculatedDeadline,
      signature,
    },
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    spenders: [{ address: derivativeWorkflowsClient.address, amount: totalFees }],
    totalFees,
    contractCall: (): Promise<Hash> => {
      return derivativeWorkflowsClient.registerIpAndMakeDerivative(transformRequest);
    },
    workflowClient: derivativeWorkflowsClient,
    encodedTxData: {
      to: derivativeWorkflowsClient.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "registerIpAndMakeDerivative",
        args: [
          transformRequest.nftContract,
          transformRequest.tokenId,
          transformRequest.derivData,
          transformRequest.ipMetadata,
          transformRequest.sigMetadataAndRegister,
        ],
      }),
    },
  };
};

/**
 * Transforms a request for the `registerIpAndAttachPilTermsAndDeployRoyaltyVault` contract method.
 */
const transferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  royaltyTokenDistributionWorkflowsClient,
  chainId,
  wallet,
  calculatedDeadline,
  ipIdAddress,
  royaltyShares,
  maxLicenseTokens,
}: TransferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultConfig): Promise<
  TransformedIpRegistrationWorkflowRequest<T>
> => {
  const signature = await generateOperationSignature({
    ipIdAddress,
    methodType: SignatureMethodType.REGISTER_IP_AND_ATTACH_PIL_TERMS_AND_DEPLOY_ROYALTY_VAULT,
    deadline: calculatedDeadline,
    wallet,
    chainId,
  });
  const transformRequest = {
    ...request,
    sigMetadataAndAttachAndConfig: {
      signer: wallet.account!.address,
      deadline: calculatedDeadline,
      signature,
    },
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    contractCall: (): Promise<Hash> => {
      return royaltyTokenDistributionWorkflowsClient.registerIpAndAttachPilTermsAndDeployRoyaltyVault(
        transformRequest,
      );
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsClient.address,
      data: encodeFunctionData({
        abi: royaltyTokenDistributionWorkflowsAbi,
        functionName: "registerIpAndAttachPILTermsAndDeployRoyaltyVault",
        args: [
          transformRequest.nftContract,
          transformRequest.tokenId,
          transformRequest.ipMetadata,
          transformRequest.licenseTermsData,
          transformRequest.sigMetadataAndAttachAndConfig,
        ],
      }),
    },
    extraData: {
      royaltyShares,
      deadline: calculatedDeadline,
      maxLicenseTokens,
      licenseTermsData: request.licenseTermsData,
    },
  };
};

/**
 * Transforms a request for the `registerIpAndAttachPilTerms` contract method.
 */
const transferRegisterIpAndAttachPilTermsRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  licenseAttachmentWorkflowsClient,
  calculatedDeadline,
  ipIdAddress,
  wallet,
  chainId,
  maxLicenseTokens,
}: TransferRegisterIpAndAttachPilTermsConfig): Promise<
  TransformedIpRegistrationWorkflowRequest<T>
> => {
  const signature = await generateOperationSignature({
    ipIdAddress,
    methodType: SignatureMethodType.REGISTER_IP_AND_ATTACH_PIL_TERMS,
    deadline: calculatedDeadline,
    wallet,
    chainId,
  });
  const transformRequest = {
    ...request,
    sigMetadataAndAttachAndConfig: {
      signer: wallet.account!.address,
      deadline: calculatedDeadline,
      signature,
    },
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    contractCall: (): Promise<Hash> => {
      return licenseAttachmentWorkflowsClient.registerIpAndAttachPilTerms(transformRequest);
    },
    workflowClient: licenseAttachmentWorkflowsClient,
    encodedTxData: {
      to: licenseAttachmentWorkflowsClient.address,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: "registerIpAndAttachPILTerms",
        args: [
          transformRequest.nftContract,
          transformRequest.tokenId,
          transformRequest.ipMetadata,
          transformRequest.licenseTermsData,
          transformRequest.sigMetadataAndAttachAndConfig,
        ],
      }),
    },
    extraData: {
      maxLicenseTokens,
      licenseTermsData: request.licenseTermsData,
    },
  };
};

/**
 * Transforms a request for the `registerIpAndMakeDerivativeAndDeployRoyaltyVault` contract method.
 */
const transferRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  calculatedDeadline,
  ipIdAddress,
  wallet,
  chainId,
  royaltyTokenDistributionWorkflowsClient,
  totalFees,
  royaltyShares,
}: TransferRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequestConfig): Promise<
  TransformedIpRegistrationWorkflowRequest<T>
> => {
  const signature = await generateOperationSignature({
    ipIdAddress,
    methodType: SignatureMethodType.REGISTER_IP_AND_MAKE_DERIVATIVE_AND_DEPLOY_ROYALTY_VAULT,
    deadline: calculatedDeadline,
    wallet,
    chainId,
  });
  const transformRequest = {
    ...request,
    sigMetadataAndRegister: {
      signer: wallet.account!.address,
      deadline: calculatedDeadline,
      signature,
    },
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    spenders: [{ address: royaltyTokenDistributionWorkflowsClient.address, amount: totalFees }],
    totalFees,
    contractCall: (): Promise<Hash> => {
      return royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVault(
        transformRequest,
      );
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsClient.address,
      data: encodeFunctionData({
        abi: royaltyTokenDistributionWorkflowsAbi,
        functionName: "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
        args: [
          transformRequest.nftContract,
          transformRequest.tokenId,
          transformRequest.ipMetadata,
          transformRequest.derivData,
          transformRequest.sigMetadataAndRegister,
        ],
      }),
    },
    extraData: {
      royaltyShares,
      deadline: calculatedDeadline,
    },
  };
};

/**
 * Handles a request for the `mintAndRegister*` contract methods.
 *
 * @remarks
 * This method processes various mint and register workflows including:
 *
 * - {@link mintAndRegisterIpAndMakeDerivative} - Mints NFT and registers IP with derivative creation
 * - {@link mintAndRegisterIpAssetWithPilTerms} - Mints NFT and registers IP with PIL terms
 * - {@link mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens} - Mints, registers, attaches terms and distributes royalties
 * - {@link mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens} - Mints, registers with derivative and distributes royalties
 *
 * Key features and optimizations:
 * - Automatically calculates all required fees (SPG mint fees and license mint fees)
 * - Transaction batching strategy varies by contract type:
 *   - Public minting contracts: Uses `multicall3` for gas-efficient batching
 *   - Private minting contracts: Uses SPG's native `multicall` implementation
 *   - Special case: {@link mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens} always
 *     uses SPG's native multicall due to specific signature requirements
 */
const handleMintAndRegisterRequest = async <T extends TransformIpRegistrationWorkflowRequest>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleMintAndRegisterRequestConfig): Promise<TransformedIpRegistrationWorkflowRequest<T>> => {
  const royaltyTokenDistributionWorkflowsClient = new RoyaltyTokenDistributionWorkflowsClient(
    rpcClient,
    wallet,
  );
  const licenseAttachmentWorkflowsClient = new LicenseAttachmentWorkflowsClient(rpcClient, wallet);
  const derivativeWorkflowsClient = new DerivativeWorkflowsClient(rpcClient, wallet);
  const isPublicMinting = await getPublicMinting(request.spgNftContract, rpcClient);
  const nftMintFee = await calculateSPGWipMintFee(
    new SpgnftImplReadOnlyClient(rpcClient, request.spgNftContract),
  );
  const baseRequest = {
    spgNftContract: validateAddress(request.spgNftContract),
    recipient: validateAddress(request.recipient || wallet.account!.address),
    ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
    allowDuplicates: request.allowDuplicates ?? true,
  };
  if ("licenseTermsData" in request) {
    const { licenseTermsData, maxLicenseTokens } = await validateLicenseTermsData(
      request.licenseTermsData,
      rpcClient,
      chainId,
    );
    const requestWithTerms = { ...baseRequest, licenseTermsData };

    if ("royaltyShares" in request) {
      return transformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest({
        request: {
          ...requestWithTerms,
          royaltyShares: request.royaltyShares,
        },
        royaltyTokenDistributionWorkflowsClient,
        nftMintFee,
        maxLicenseTokens,
      });
    }
    return transferMintAndRegisterIpAssetWithPilTermsRequest({
      request: {
        ...requestWithTerms,
        licenseTermsData,
      },
      licenseAttachmentWorkflowsClient,
      nftMintFee,
      isPublicMinting,
      maxLicenseTokens,
    });
  }

  if ("derivData" in request) {
    const derivData = await validateDerivativeData({
      derivativeDataInput: request.derivData,
      rpcClient,
      wallet,
      chainId,
    });
    const totalDerivativeMintingFee = await calculateDerivativeMintingFee({
      derivData,
      rpcClient,
      chainId,
      wallet,
    });
    const requestWithDeriv = { ...baseRequest, derivData };

    if ("royaltyShares" in request) {
      return transferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest({
        request: {
          ...requestWithDeriv,
          royaltyShares: request.royaltyShares,
        },
        nftMintFee,
        isPublicMinting,
        totalDerivativeMintingFee,
        royaltyTokenDistributionWorkflowsClient,
      });
    }
    return transferMintAndRegisterIpAndMakeDerivativeRequest({
      request: {
        ...requestWithDeriv,
        derivData,
      },
      derivativeWorkflowsClient,
      nftMintFee,
      isPublicMinting,
      totalDerivativeMintingFee,
    });
  }
  throw new Error("Invalid mint and register request type");
};

/**
 * Transforms a request for the `mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens` contract method.
 */
const transformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  royaltyTokenDistributionWorkflowsClient,
  nftMintFee,
  maxLicenseTokens,
}: TransformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest): TransformedIpRegistrationWorkflowRequest<T> => {
  const { royaltyShares } = getRoyaltyShares(request.royaltyShares);
  const transformRequest = {
    ...request,
    royaltyShares,
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    // Because mint tokens is given `msg.sender` as the recipient, so we need to set `useMulticall3` to false.
    isUseMulticall3: false,
    contractCall: (): Promise<Hash> => {
      return royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
        transformRequest,
      );
    },
    spenders: [{ address: transformRequest.spgNftContract, amount: nftMintFee }],
    totalFees: nftMintFee,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsClient.address,
      data: encodeFunctionData({
        abi: royaltyTokenDistributionWorkflowsAbi,
        functionName: "mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens",
        args: [
          transformRequest.spgNftContract,
          transformRequest.recipient,
          transformRequest.ipMetadata,
          transformRequest.licenseTermsData,
          transformRequest.royaltyShares,
          transformRequest.allowDuplicates,
        ],
      }),
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    extraData: {
      maxLicenseTokens,
      licenseTermsData: transformRequest.licenseTermsData,
    },
  };
};

/**
 * Transforms a request for the `mintAndRegisterIpAssetWithPilTerms` contract method.
 */
const transferMintAndRegisterIpAssetWithPilTermsRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  licenseAttachmentWorkflowsClient,
  nftMintFee,
  isPublicMinting,
  maxLicenseTokens,
}: TransferMintAndRegisterIpAssetWithPilTermsConfig): TransformedIpRegistrationWorkflowRequest<T> => {
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: request as T,
    isUseMulticall3: isPublicMinting,
    spenders: [{ address: request.spgNftContract, amount: nftMintFee }],
    totalFees: nftMintFee,
    encodedTxData: {
      to: licenseAttachmentWorkflowsClient.address,
      data: encodeFunctionData({
        abi: licenseAttachmentWorkflowsAbi,
        functionName: "mintAndRegisterIpAndAttachPILTerms",
        args: [
          request.spgNftContract,
          request.recipient,
          request.ipMetadata,
          request.licenseTermsData,
          request.allowDuplicates,
        ],
      }),
    },
    contractCall: (): Promise<Hash> => {
      return licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms(request);
    },
    workflowClient: licenseAttachmentWorkflowsClient,
    extraData: {
      maxLicenseTokens,
      licenseTermsData: request.licenseTermsData,
    },
  };
};

/**
 * Transforms a request for the `mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens` contract method.
 */
const transferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  nftMintFee,
  isPublicMinting,
  totalDerivativeMintingFee,
  royaltyTokenDistributionWorkflowsClient,
}: TransferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensConfig): TransformedIpRegistrationWorkflowRequest<T> => {
  const { royaltyShares } = getRoyaltyShares(request.royaltyShares);
  /**
   * TODO: Consider the scenario where the SPG token is WIP and the derivative token is ERC20.
   * The SDK should handle both cases in the `contractCallWithFees` method.
   * Currently, it only supports WIP tokens and does not handle ERC20 tokens, such as approving ERC20 tokens.
   */
  const transformRequest = {
    ...request,
    royaltyShares,
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    isUseMulticall3: isPublicMinting,
    spenders: [
      {
        address: royaltyTokenDistributionWorkflowsClient.address,
        amount: totalDerivativeMintingFee,
      },
      { address: request.spgNftContract, amount: nftMintFee },
    ],
    totalFees: totalDerivativeMintingFee + nftMintFee,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsClient.address,
      data: encodeFunctionData({
        abi: royaltyTokenDistributionWorkflowsAbi,
        functionName: "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        args: [
          request.spgNftContract,
          request.recipient,
          request.ipMetadata,
          request.derivData,
          request.royaltyShares,
          request.allowDuplicates,
        ],
      }),
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    contractCall: (): Promise<Hash> => {
      return royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
        transformRequest,
      );
    },
  };
};
/**
 * Transforms a request for the `mintAndRegisterIpAndMakeDerivative` contract method.
 */

const transferMintAndRegisterIpAndMakeDerivativeRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  derivativeWorkflowsClient,
  nftMintFee,
  isPublicMinting,
  totalDerivativeMintingFee,
}: TransferMintAndRegisterIpAndMakeDerivativeRequestConfig): TransformedIpRegistrationWorkflowRequest<T> => {
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: request as T,
    isUseMulticall3: isPublicMinting,
    spenders: [
      {
        address: derivativeWorkflowsClient.address,
        amount: totalDerivativeMintingFee,
      },
      { address: request.spgNftContract, amount: nftMintFee },
    ],
    totalFees: totalDerivativeMintingFee + nftMintFee,
    encodedTxData: {
      to: derivativeWorkflowsClient.address,
      data: encodeFunctionData({
        abi: derivativeWorkflowsAbi,
        functionName: "mintAndRegisterIpAndMakeDerivative",
        args: [
          request.spgNftContract,
          request.derivData,
          request.ipMetadata,
          request.recipient,
          request.allowDuplicates,
        ],
      }),
    },
    contractCall: (): Promise<Hash> => {
      return derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivative(request);
    },
    workflowClient: derivativeWorkflowsClient,
  };
};

/**
 * Transforms a request for the `distributeRoyaltyTokens` contract method.
 */
export const transferDistributeRoyaltyTokensRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleDistributeRoyaltyTokensRequestConfig): Promise<
  TransformedIpRegistrationWorkflowRequest<T>
> => {
  const { ipId, deadline, ipRoyaltyVault, totalAmount } = request;
  const calculatedDeadline = await getCalculatedDeadline(rpcClient, deadline);
  const ipRoyaltyVaultImpl = new IpRoyaltyVaultImplReadOnlyClient(rpcClient, ipRoyaltyVault);
  const balance = await ipRoyaltyVaultImpl.balanceOf({ account: ipId });
  const royaltyTokenDistributionWorkflowsClient = new RoyaltyTokenDistributionWorkflowsClient(
    rpcClient,
    wallet,
  );
  if (BigInt(balance) < BigInt(totalAmount)) {
    throw new Error(
      `The balance of the IP account in the IP Royalty Vault is insufficient to distribute the royalty tokens.`,
    );
  }
  const ipAccount = new IpAccountImplClient(rpcClient, wallet, validateAddress(ipId));
  const { result: state } = await ipAccount.state();
  const signatureApproveRoyaltyTokens = await generateOperationSignature({
    ipIdAddress: ipId,
    methodType: SignatureMethodType.DISTRIBUTE_ROYALTY_TOKENS,
    deadline: calculatedDeadline,
    ipRoyaltyVault: ipRoyaltyVault,
    totalAmount: totalAmount,
    state,
    encodeData: encodeFunctionData({
      abi: ipRoyaltyVaultImplAbi,
      functionName: "approve",
      args: [royaltyTokenDistributionWorkflowsAddress[chainId], BigInt(totalAmount)],
    }),
    wallet: wallet,
    chainId: chainId,
  });
  const transformRequest = {
    ipId,
    royaltyShares: request.royaltyShares,
    sigApproveRoyaltyTokens: {
      signer: wallet.account!.address,
      deadline: calculatedDeadline,
      signature: signatureApproveRoyaltyTokens,
    },
  };
  return {
    // The `TransformIpRegistrationWorkflowResponse` is a union of all the possible requests, so we need to explicitly cast the type.
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    contractCall: (): Promise<Hash> => {
      return royaltyTokenDistributionWorkflowsClient.distributeRoyaltyTokens(transformRequest);
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsAddress[chainId],
      data: encodeFunctionData({
        abi: royaltyTokenDistributionWorkflowsAbi,
        functionName: "distributeRoyaltyTokens",
        args: [
          transformRequest.ipId,
          transformRequest.royaltyShares,
          transformRequest.sigApproveRoyaltyTokens,
        ],
      }),
    },
  };
};

export const prepareRoyaltyTokensDistributionRequests = async ({
  royaltyDistributionRequests,
  ipRegisteredLog,
  ipRoyaltyVault,
  rpcClient,
  wallet,
  chainId,
}: PrepareDistributeRoyaltyTokensRequestConfig): Promise<
  TransformedIpRegistrationWorkflowRequest[]
> => {
  if (royaltyDistributionRequests.length === 0) {
    return [];
  }

  const results: TransformedIpRegistrationWorkflowRequest[] = [];

  for (const req of royaltyDistributionRequests) {
    const filterIpIdAndTokenId = ipRegisteredLog.find(
      ({ tokenContract, tokenId }) => tokenContract === req.nftContract && tokenId === req.tokenId,
    );

    if (filterIpIdAndTokenId) {
      const { royaltyShares, totalAmount } = getRoyaltyShares(req.royaltyShares ?? []);
      const calculatedDeadline = await getCalculatedDeadline(rpcClient, req.deadline);

      const response =
        await transferDistributeRoyaltyTokensRequest<RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest>(
          {
            request: {
              ipId: filterIpIdAndTokenId.ipId,
              ipRoyaltyVault: ipRoyaltyVault.find(
                (item) => item.ipId === filterIpIdAndTokenId.ipId,
              )!.ipRoyaltyVault,
              royaltyShares,
              totalAmount,
              deadline: calculatedDeadline,
            },
            rpcClient,
            wallet,
            chainId,
          },
        );

      results.push(response);
    }
  }

  return results;
};
