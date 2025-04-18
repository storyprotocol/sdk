import { Address, encodeFunctionData, Hex, PublicClient, toHex, zeroAddress } from "viem";

import {
  coreMetadataModuleAbi,
  coreMetadataModuleAddress,
  royaltyTokenDistributionWorkflowsAddress,
  RoyaltyTokenDistributionWorkflowsClient,
  derivativeWorkflowsAddress,
  licenseAttachmentWorkflowsAddress,
  licensingModuleAbi,
  licensingModuleAddress,
  SpgnftImplReadOnlyClient,
  registrationWorkflowsAddress,
  ipRoyaltyVaultImplAbi,
  IpAccountImplClient,
  IpRoyaltyVaultImplReadOnlyClient,
  LicenseAttachmentWorkflowsClient,
  piLicenseTemplateAddress,
  DerivativeWorkflowsClient,
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  royaltyTokenDistributionWorkflowsAbi,
  licenseAttachmentWorkflowsAbi,
  derivativeWorkflowsAbi,
  RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest,
} from "../abi/generated";
import { chain, validateAddress } from "./utils";
import {
  AggregateRegistrationRequest,
  CalculateDerivativeMintingFeeConfig,
  GeneratePrefixRegisterSignatureRequest,
  GetIpIdAddressConfig,
  HandleDistributeRoyaltyTokensRequestConfig,
  HandleMulticallConfig,
  HandleMintAndRegisterRequestConfig,
  PrepareDistributeRoyaltyTokensRequestConfig,
  SignatureMethodType,
  TransformRegistrationRequestConfig,
  ValidateDerivativeDataConfig,
  HandleRegisterRequestConfig,
  TransferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultConfig,
  TransferRegisterIpAndAttachPilTermsConfig,
  TransferRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequestConfig,
  TransferRegisterDerivativeIpRequestConfig,
  TransferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensConfig,
  TransformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  TransferMintAndRegisterIpAssetWithPilTermsConfig,
  TransferMintAndRegisterIpAndMakeDerivativeRequestConfig,
} from "../types/utils/registerHelper";
import {
  AccessPermission,
  PermissionSignatureRequest,
  SignatureRequest,
} from "../types/resources/permission";
import { getSignature, getPermissionSignature, getDeadline } from "./sign";
import { getFunctionSignature } from "./getFunctionSignature";
import {
  DerivativeData,
  LicenseTermsData,
  LicenseTermsDataInput,
  RoyaltyShare,
  TransformIpRegistrationWorkflowRequest,
  TransformIpRegistrationWorkflowResponse,
} from "../types/resources/ipAsset";
import {
  calculateLicenseWipMintFee,
  calculateSPGWipMintFee,
  contractCallWithFees,
} from "./feeUtils";
import { getIpMetadataForWorkflow } from "./getIpMetadataForWorkflow";
import { LicenseTerms } from "../types/resources/license";
import { getRevenueShare, validateLicenseTerms } from "./licenseTermsHelper";
import { validateLicenseConfig } from "./validateLicenseConfig";
import { MAX_ROYALTY_TOKEN, royaltySharesTotalSupply } from "../constants/common";
import { RevShareType } from "../types/common";
import { Erc20Spender } from "../types/utils/wip";
import { TransactionResponse } from "../types/options";

export const getPublicMinting = async (
  spgNftContract: Address,
  rpcClient: PublicClient,
): Promise<boolean> => {
  const spgNftContractImpl = new SpgnftImplReadOnlyClient(rpcClient, spgNftContract);
  return await spgNftContractImpl.publicMinting();
};

export const generateOperationSignature = async ({
  deadline,
  ipIdAddress,
  methodType,
  ipRoyaltyVault,
  totalAmount,
  state,
  encodeData,
  wallet,
  chainId,
}: GeneratePrefixRegisterSignatureRequest): Promise<Hex> => {
  const baseConfig = {
    ipId: ipIdAddress,
    deadline,
    state: toHex(0, { size: 32 }),
    wallet: wallet,
    chainId: chain[chainId],
  };
  if (
    methodType === SignatureMethodType.DISTRIBUTE_ROYALTY_TOKENS &&
    (!ipRoyaltyVault || !state || !totalAmount || !encodeData)
  ) {
    throw new Error(
      "ipRoyaltyVault, state, totalAmount, and encodeData are required for distributing royalty tokens.",
    );
  } else if (methodType === SignatureMethodType.REGISTER_PIL_TERMS_AND_ATTACH && !state) {
    throw new Error("State is required for registering PIL terms and attaching.");
  } else if (
    methodType === SignatureMethodType.BATCH_REGISTER_DERIVATIVE &&
    (!state || !encodeData)
  ) {
    throw new Error("State and encodeData are required for batch registering derivative.");
  }
  const royaltyTokenDistributionWorkflowsAddr = royaltyTokenDistributionWorkflowsAddress[chainId];
  const coreMetadataModuleAddr = coreMetadataModuleAddress[chainId];
  const licensingModuleAddr = licensingModuleAddress[chainId];
  const derivativeWorkflowsAddr = derivativeWorkflowsAddress[chainId];
  const licenseAttachmentWorkflowsAddr = licenseAttachmentWorkflowsAddress[chainId];
  const registrationWorkflowsAddr = registrationWorkflowsAddress[chainId];
  const signatureConfigs: Record<
    SignatureMethodType,
    PermissionSignatureRequest | SignatureRequest
  > = {
    [SignatureMethodType.REGISTER_IP_AND_MAKE_DERIVATIVE_AND_DEPLOY_ROYALTY_VAULT]: {
      ...baseConfig,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: royaltyTokenDistributionWorkflowsAddr,
          to: coreMetadataModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
        },
        {
          ipId: ipIdAddress,
          signer: royaltyTokenDistributionWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "registerDerivative"),
        },
      ],
    },
    [SignatureMethodType.DISTRIBUTE_ROYALTY_TOKENS]: {
      ...baseConfig,
      verifyingContract: ipIdAddress,
      deadline,
      state: state!,
      to: ipRoyaltyVault!,
      encodeData: encodeData!,
    },
    [SignatureMethodType.REGISTER_DERIVATIVE_IP]: {
      ...baseConfig,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: derivativeWorkflowsAddr,
          to: coreMetadataModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
        },
        {
          ipId: ipIdAddress,
          signer: derivativeWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "registerDerivative"),
        },
      ],
    },
    [SignatureMethodType.REGISTER_IP_AND_ATTACH_PIL_TERMS_AND_DEPLOY_ROYALTY_VAULT]: {
      ...baseConfig,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: royaltyTokenDistributionWorkflowsAddr,
          to: coreMetadataModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
        },
        {
          ipId: ipIdAddress,
          signer: royaltyTokenDistributionWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
        },
        {
          ipId: ipIdAddress,
          signer: royaltyTokenDistributionWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
        },
      ],
    },
    [SignatureMethodType.REGISTER_IP_AND_ATTACH_PIL_TERMS]: {
      ...baseConfig,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: licenseAttachmentWorkflowsAddr,
          to: coreMetadataModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
        },
        {
          ipId: ipIdAddress,
          signer: licenseAttachmentWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
        },
        {
          ipId: ipIdAddress,
          signer: licenseAttachmentWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
        },
      ],
    },
    [SignatureMethodType.REGISTER_IP_AND_MAKE_DERIVATIVE_WITH_LICENSE_TOKENS]: {
      ...baseConfig,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: derivativeWorkflowsAddr,
          to: coreMetadataModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
        },
        {
          ipId: ipIdAddress,
          signer: derivativeWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "registerDerivativeWithLicenseTokens"),
        },
      ],
    },
    [SignatureMethodType.REGISTER_PIL_TERMS_AND_ATTACH]: {
      ...baseConfig,
      state: state!,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: licenseAttachmentWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
        },
        {
          ipId: ipIdAddress,
          signer: licenseAttachmentWorkflowsAddr,
          to: licensingModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
        },
      ],
    },
    [SignatureMethodType.REGISTER]: {
      ...baseConfig,
      permissions: [
        {
          ipId: ipIdAddress,
          signer: registrationWorkflowsAddr,
          to: coreMetadataModuleAddr,
          permission: AccessPermission.ALLOW,
          func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
        },
      ],
    },
    [SignatureMethodType.BATCH_REGISTER_DERIVATIVE]: {
      ...baseConfig,
      state: state!,
      to: licensingModuleAddr,
      encodeData: encodeData!,
      verifyingContract: ipIdAddress,
    },
  };
  const signatureRequest = signatureConfigs[methodType];
  if (
    (methodType === SignatureMethodType.DISTRIBUTE_ROYALTY_TOKENS ||
      methodType === SignatureMethodType.BATCH_REGISTER_DERIVATIVE) &&
    signatureRequest
  ) {
    const { signature } = await getSignature(signatureRequest as SignatureRequest);
    return signature;
  } else {
    const { signature } = await getPermissionSignature(
      signatureRequest as PermissionSignatureRequest,
    );
    return signature;
  }
};

export const handleDistributeRoyaltyTokensRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleDistributeRoyaltyTokensRequestConfig): Promise<
  TransformIpRegistrationWorkflowResponse<T>
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
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    contractCall: () => {
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

export const handleMintAndRegisterRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleMintAndRegisterRequestConfig): Promise<TransformIpRegistrationWorkflowResponse<T>> => {
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
    const { licenseTermsData } = await validateLicenseTermsData(
      request.licenseTermsData as LicenseTermsDataInput[],
      rpcClient,
    );
    const requestWithTerms = { ...baseRequest, licenseTermsData } as const;

    if ("royaltyShares" in request) {
      return transformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest({
        request: {
          ...requestWithTerms,
          royaltyShares: request.royaltyShares,
        },
        royaltyTokenDistributionWorkflowsClient,
        nftMintFee,
        chainId,
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
      chainId,
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
        chainId,
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
      chainId,
      totalDerivativeMintingFee,
    });
  }
  throw new Error("Invalid mint and register request type");
};
export const validateLicenseTermsData = async (
  licenseTermsData: LicenseTermsDataInput[],
  rpcClient: PublicClient,
): Promise<{
  licenseTerms: LicenseTerms[];
  licenseTermsData: LicenseTermsData[];
}> => {
  const licenseTerms: LicenseTerms[] = [];
  const processedLicenseTermsData: LicenseTermsData[] = [];
  for (let i = 0; i < licenseTermsData.length; i++) {
    const licenseTerm = await validateLicenseTerms(licenseTermsData[i].terms, rpcClient);
    const licensingConfig = validateLicenseConfig(licenseTermsData[i].licensingConfig);
    if (licensingConfig.mintingFee > 0 && licenseTerm.royaltyPolicy === zeroAddress) {
      throw new Error("A royalty policy must be provided when the minting fee is greater than 0.");
    }
    licenseTerms.push(licenseTerm);
    processedLicenseTermsData.push({
      terms: licenseTerm,
      licensingConfig: licensingConfig,
    });
  }
  return { licenseTerms, licenseTermsData: processedLicenseTermsData };
};

export const getRoyaltyShares = (royaltyShares: RoyaltyShare[]) => {
  let actualTotal = 0;
  let sum = 0;
  const shares = royaltyShares.map((share) => {
    if (share.percentage <= 0) {
      throw new Error("The percentage of the royalty shares must be greater than 0.");
    }
    if (share.percentage > 100) {
      throw new Error("The percentage of the royalty shares must be less than or equal to 100.");
    }
    sum += share.percentage;
    if (sum > 100) {
      throw new Error("The sum of the royalty shares cannot exceeds 100.");
    }
    const value = (share.percentage / 100) * royaltySharesTotalSupply;
    actualTotal += value;
    return { ...share, percentage: value };
  });
  return { royaltyShares: shares, totalAmount: actualTotal } as const;
};

export const validateDerivativeData = async ({
  derivativeDataInput,
  rpcClient,
  wallet,
  chainId,
}: ValidateDerivativeDataConfig): Promise<DerivativeData> => {
  const licenseTemplateAddress = piLicenseTemplateAddress[chainId];
  const ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
  const licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
  const derivativeData: DerivativeData = {
    parentIpIds: derivativeDataInput.parentIpIds,
    licenseTermsIds: derivativeDataInput.licenseTermsIds.map((id) => BigInt(id)),
    licenseTemplate: validateAddress(derivativeDataInput.licenseTemplate || licenseTemplateAddress),
    royaltyContext: zeroAddress,
    maxMintingFee: BigInt(derivativeDataInput.maxMintingFee || 0),
    maxRts: Number(derivativeDataInput.maxRts || MAX_ROYALTY_TOKEN),
    maxRevenueShare: getRevenueShare(
      derivativeDataInput.maxRevenueShare || 100,
      RevShareType.MAX_REVENUE_SHARE,
    ),
  };
  if (derivativeData.parentIpIds.length === 0) {
    throw new Error("The parent IP IDs must be provided.");
  }
  if (derivativeData.licenseTermsIds.length === 0) {
    throw new Error("The license terms IDs must be provided.");
  }
  if (derivativeData.parentIpIds.length !== derivativeData.licenseTermsIds.length) {
    throw new Error("The number of parent IP IDs must match the number of license terms IDs.");
  }
  if (derivativeData.maxMintingFee < 0) {
    throw new Error(`The maxMintingFee must be greater than 0.`);
  }
  validateMaxRts(derivativeData.maxRts);
  for (let i = 0; i < derivativeData.parentIpIds.length; i++) {
    const parentId = derivativeData.parentIpIds[i];
    const isParentIpRegistered = await ipAssetRegistryClient.isRegistered({
      id: validateAddress(parentId),
    });
    if (!isParentIpRegistered) {
      throw new Error(`The parent IP with id ${parentId} is not registered.`);
    }
    const isAttachedLicenseTerms = await licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
      ipId: parentId,
      licenseTemplate: derivativeData.licenseTemplate,
      licenseTermsId: derivativeData.licenseTermsIds[i],
    });
    if (!isAttachedLicenseTerms) {
      throw new Error(
        `License terms id ${derivativeData.licenseTermsIds[i]} must be attached to the parent ipId ${derivativeData.parentIpIds[i]} before registering derivative.`,
      );
    }
    const { royaltyPercent } = await licenseRegistryReadOnlyClient.getRoyaltyPercent({
      ipId: parentId,
      licenseTemplate: derivativeData.licenseTemplate,
      licenseTermsId: derivativeData.licenseTermsIds[i],
    });
    if (derivativeData.maxRevenueShare !== 0 && royaltyPercent > derivativeData.maxRevenueShare) {
      throw new Error(
        `The royalty percent for the parent IP with id ${parentId} is greater than the maximum revenue share ${derivativeData.maxRevenueShare}.`,
      );
    }
  }
  return derivativeData;
};

export const validateMaxRts = (maxRts: number) => {
  if (isNaN(maxRts)) {
    throw new Error(`The maxRts must be a number.`);
  }
  if (maxRts < 0 || maxRts > MAX_ROYALTY_TOKEN) {
    throw new Error(`The maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`);
  }
};

export const calculateDerivativeMintingFee = async ({
  derivData,
  rpcClient,
  chainId,
  wallet,
}: CalculateDerivativeMintingFeeConfig): Promise<bigint> => {
  const walletAddress = wallet.account!.address;
  let totalDerivativeMintingFee = 0n;
  for (let i = 0; i < derivData.parentIpIds.length; i++) {
    const derivativeMintingFee = await calculateLicenseWipMintFee({
      predictMintingFeeRequest: {
        licensorIpId: derivData.parentIpIds[i],
        licenseTemplate: derivData.licenseTemplate,
        licenseTermsId: derivData.licenseTermsIds[i],
        receiver: walletAddress,
        amount: 1n,
        royaltyContext: zeroAddress,
      },
      rpcClient,
      chainId,
      walletAddress,
    });
    totalDerivativeMintingFee += derivativeMintingFee;
  }
  return totalDerivativeMintingFee;
};

const transformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  royaltyTokenDistributionWorkflowsClient,
  nftMintFee,
  chainId,
}: TransformMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest): TransformIpRegistrationWorkflowResponse<T> => {
  const { royaltyShares } = getRoyaltyShares(request.royaltyShares);
  const transformRequest = {
    ...request,
    royaltyShares,
  };
  return {
    transformRequest: transformRequest as T,
    // Because mint tokens is given `msg.sender` as the recipient, so we need to set `useMulticall3` to false.
    isUseMulticall3: false,
    contractCall: () => {
      return royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
        transformRequest,
      );
    },
    spenders: [{ address: transformRequest.spgNftContract, amount: nftMintFee }],
    totalFees: nftMintFee,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsAddress[chainId],
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
  };
};
const transferMintAndRegisterIpAssetWithPilTermsRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  licenseAttachmentWorkflowsClient,
  nftMintFee,
  isPublicMinting,
  chainId,
}: TransferMintAndRegisterIpAssetWithPilTermsConfig): TransformIpRegistrationWorkflowResponse<T> => {
  return {
    transformRequest: request as T,
    isUseMulticall3: isPublicMinting,
    spenders: [{ address: request.spgNftContract, amount: nftMintFee }],
    totalFees: nftMintFee,
    encodedTxData: {
      to: licenseAttachmentWorkflowsAddress[chainId],
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
    contractCall: () => {
      return licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms(request);
    },
    workflowClient: licenseAttachmentWorkflowsClient,
  };
};

const transferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  nftMintFee,
  isPublicMinting,
  chainId,
  totalDerivativeMintingFee,
  royaltyTokenDistributionWorkflowsClient,
}: TransferMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensConfig): TransformIpRegistrationWorkflowResponse<T> => {
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
      to: royaltyTokenDistributionWorkflowsAddress[chainId],
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
    contractCall: () => {
      return royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
        transformRequest,
      );
    },
  };
};

const transferMintAndRegisterIpAndMakeDerivativeRequest = <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  derivativeWorkflowsClient,
  nftMintFee,
  isPublicMinting,
  chainId,
  totalDerivativeMintingFee,
}: TransferMintAndRegisterIpAndMakeDerivativeRequestConfig): TransformIpRegistrationWorkflowResponse<T> => {
  // mintAndRegisterIpAndMakeDerivative request
  return {
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
      to: derivativeWorkflowsAddress[chainId],
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
    contractCall: () => {
      return derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivative(request);
    },
    workflowClient: derivativeWorkflowsClient,
  };
};

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
}: TransferRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultConfig): Promise<
  TransformIpRegistrationWorkflowResponse<T>
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
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    contractCall: () => {
      return royaltyTokenDistributionWorkflowsClient.registerIpAndAttachPilTermsAndDeployRoyaltyVault(
        transformRequest,
      );
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsAddress[chainId],
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
    },
  };
};
const transferRegisterIpAndAttachPilTermsRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  licenseAttachmentWorkflowsClient,
  calculatedDeadline,
  ipIdAddress,
  wallet,
  chainId,
}: TransferRegisterIpAndAttachPilTermsConfig): Promise<
  TransformIpRegistrationWorkflowResponse<T>
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
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    contractCall: () => {
      return licenseAttachmentWorkflowsClient.registerIpAndAttachPilTerms(transformRequest);
    },
    workflowClient: licenseAttachmentWorkflowsClient,
    encodedTxData: {
      to: licenseAttachmentWorkflowsAddress[chainId],
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
  };
};

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
  TransformIpRegistrationWorkflowResponse<T>
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
  // registerIpAndMakeDerivativeAndDeployRoyaltyVault request
  return {
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    spenders: [{ address: royaltyTokenDistributionWorkflowsAddress[chainId], amount: totalFees }],
    totalFees,
    contractCall: () => {
      return royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVault(
        transformRequest,
      );
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
    encodedTxData: {
      to: royaltyTokenDistributionWorkflowsAddress[chainId],
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
  TransformIpRegistrationWorkflowResponse<T>
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
  // registerDerivativeIp request
  return {
    transformRequest: transformRequest as T,
    isUseMulticall3: false,
    spenders: [{ address: derivativeWorkflowsClient.address, amount: totalFees }],
    totalFees,
    contractCall: () => {
      return derivativeWorkflowsClient.registerIpAndMakeDerivative(transformRequest);
    },
    workflowClient: derivativeWorkflowsClient,
    encodedTxData: {
      to: derivativeWorkflowsAddress[chainId],
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

export const getIpIdAddress = async ({
  nftContract,
  tokenId,
  rpcClient,
  wallet,
  chainId,
}: GetIpIdAddressConfig): Promise<Address> => {
  const ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
  const ipId = await ipAssetRegistryClient.ipId({
    chainId: BigInt(chain[chainId]),
    tokenContract: validateAddress(nftContract),
    tokenId: BigInt(tokenId),
  });
  return ipId;
};

export const getCalculatedDeadline = async (
  rpcClient: PublicClient,
  requestDeadline?: string | number | bigint,
): Promise<bigint> => {
  const blockTimestamp = (await rpcClient.getBlock()).timestamp;
  return getDeadline(blockTimestamp, requestDeadline);
};

export const mergeSpenders = (
  previousSpenders: Erc20Spender[],
  newSpenders: Erc20Spender[],
): Erc20Spender[] => {
  if (!newSpenders || newSpenders.length === 0) {
    return previousSpenders;
  }

  return newSpenders.reduce(
    (acc, spender) => {
      if (!spender || !spender.address) {
        return acc;
      }

      const existingSpender = acc.find((s) => s.address === spender.address);
      if (!existingSpender) {
        acc.push({ ...spender, amount: spender.amount || 0n });
      } else {
        existingSpender.amount = (existingSpender.amount || 0n) + (spender.amount || 0n);
      }

      return acc;
    },
    [...previousSpenders],
  );
};

export const prepareRoyaltyTokensDistribution = async ({
  royaltyDistributionRequests,
  ipRegisteredLog,
  ipRoyaltyVault,
  rpcClient,
  wallet,
  chainId,
}: PrepareDistributeRoyaltyTokensRequestConfig): Promise<
  TransformIpRegistrationWorkflowResponse[]
> => {
  if (royaltyDistributionRequests.length === 0) {
    return [];
  }

  const results: TransformIpRegistrationWorkflowResponse[] = [];

  for (const req of royaltyDistributionRequests) {
    const filterIpIdAndTokenId = ipRegisteredLog.find(
      ({ tokenContract, tokenId }) => tokenContract === req.nftContract && tokenId === req.tokenId,
    );

    if (filterIpIdAndTokenId) {
      const { royaltyShares, totalAmount } = getRoyaltyShares(req.royaltyShares ?? []);
      const calculatedDeadline = await getCalculatedDeadline(rpcClient, req.deadline);

      const response =
        await transformRegistrationRequest<RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest>(
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

const aggregateTransformIpRegistrationWorkflow = (
  transferWorkflowResponses: TransformIpRegistrationWorkflowResponse[],
  multicall3Address: Address,
  disableMulticallWhenPossible: boolean,
): AggregateRegistrationRequest => {
  const aggregateRegistrationRequest: AggregateRegistrationRequest = {};
  for (const res of transferWorkflowResponses) {
    const { spenders, totalFees, encodedTxData, workflowClient, isUseMulticall3 } = res;
    const shouldUseMulticall = !disableMulticallWhenPossible && isUseMulticall3;
    const targetAddress = shouldUseMulticall ? multicall3Address : workflowClient.address;

    if (!aggregateRegistrationRequest[targetAddress]) {
      aggregateRegistrationRequest[targetAddress] = {
        spenders: [],
        totalFees: 0n,
        encodedTxData: [],
        contractCall: [],
      };
    }

    const currentRequest = aggregateRegistrationRequest[targetAddress];
    currentRequest.spenders = mergeSpenders(currentRequest.spenders, spenders || []);
    currentRequest.totalFees += totalFees || 0n;
    currentRequest.encodedTxData = currentRequest.encodedTxData.concat(encodedTxData);
    if (isUseMulticall3 || disableMulticallWhenPossible) {
      currentRequest.contractCall = currentRequest.contractCall.concat(res.contractCall);
    } else {
      currentRequest.contractCall = [
        () => {
          return workflowClient.multicall({
            data: currentRequest.encodedTxData.map((tx) => tx.data),
          });
        },
      ];
    }
  }

  return aggregateRegistrationRequest;
};

export const handleMulticall = async ({
  transferWorkflowResponses,
  multicall3Address,
  wipOptions,
  rpcClient,
  wallet,
  walletAddress,
}: HandleMulticallConfig): Promise<TransactionResponse[]> => {
  const aggregateRegistrationRequest = aggregateTransformIpRegistrationWorkflow(
    transferWorkflowResponses,
    multicall3Address,
    wipOptions?.useMulticallWhenPossible === false,
  );
  const txResponses: TransactionResponse[] = [];
  for (const key in aggregateRegistrationRequest) {
    const { spenders, totalFees, encodedTxData, contractCall } = aggregateRegistrationRequest[key];
    const contractCalls = async () => {
      const txHashes: Hex[] = [];
      for (const call of contractCall) {
        const txHash = await call();
        txHashes.push(txHash);
      }
      return txHashes;
    };
    const useMulticallWhenPossible =
      key === multicall3Address ? wipOptions?.useMulticallWhenPossible !== false : false;
    const txResponse = await contractCallWithFees({
      totalFees,
      options: {
        wipOptions: {
          ...wipOptions,
          useMulticallWhenPossible,
        },
      },
      multicall3Address,
      rpcClient,
      tokenSpenders: spenders,
      contractCall: contractCalls,
      sender: walletAddress,
      wallet,
      encodedTxs: encodedTxData,
      txOptions: { waitForTransaction: true },
    });
    txResponses.push(...(Array.isArray(txResponse) ? txResponse : [txResponse]));
  }
  return txResponses;
};

export const handleRegisterRequest = async <T extends TransformIpRegistrationWorkflowRequest>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleRegisterRequestConfig): Promise<TransformIpRegistrationWorkflowResponse<T>> => {
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
    const { licenseTermsData } = await validateLicenseTermsData(
      request.licenseTermsData as LicenseTermsDataInput[],
      rpcClient,
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
      });
    }

    return await transferRegisterIpAndAttachPilTermsRequest({
      request: requestWithTerms,
      licenseAttachmentWorkflowsClient,
      calculatedDeadline,
      ipIdAddress,
      wallet,
      chainId,
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

export const transformRegistrationRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  rpcClient,
  wallet,
  chainId,
}: TransformRegistrationRequestConfig): Promise<TransformIpRegistrationWorkflowResponse<T>> => {
  if ("spgNftContract" in request) {
    return handleMintAndRegisterRequest<T>({ request, rpcClient, wallet, chainId });
  } else if ("nftContract" in request && "tokenId" in request) {
    return handleRegisterRequest<T>({ request, rpcClient, wallet, chainId });
  } else if ("ipRoyaltyVault" in request) {
    return handleDistributeRoyaltyTokensRequest<T>({ request, rpcClient, wallet, chainId });
  }

  throw new Error("Invalid registration request type");
};
