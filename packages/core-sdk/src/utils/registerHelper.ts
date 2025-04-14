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
} from "../abi/generated";
import { chain, validateAddress } from "./utils";
import {
  CalculateDerivativeMintingFeeConfig,
  GeneratePrefixRegisterSignatureRequest,
  GetIpIdAddressConfig,
  HandleDistributeRoyaltyTokensRequestConfig,
  HandleNftRequestConfig,
  HandleSpgNftRequestConfig,
  SignatureMethodType,
  TransformRegistrationRequestConfig,
  ValidateDerivativeDataConfig,
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
  DerivativeDataInput,
  LicenseTermsData,
  LicenseTermsDataInput,
  RoyaltyShare,
  TransformIpRegistrationWorkflowRequest,
  TransformIpRegistrationWorkflowResponse,
} from "../types/resources/ipAsset";
import { calculateLicenseWipMintFee, calculateSPGWipMintFee } from "./feeUtils";
import { getIpMetadataForWorkflow } from "./getIpMetadataForWorkflow";
import { LicenseTerms } from "../types/resources/license";
import { getRevenueShare, validateLicenseTerms } from "./licenseTermsHelper";
import { validateLicenseConfig } from "./validateLicenseConfig";
import { MAX_ROYALTY_TOKEN, royaltySharesTotalSupply } from "../constants/common";
import { RevShareType } from "../types/common";

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
  const blockTimestamp = (await rpcClient.getBlock()).timestamp;
  const calculatedDeadline = getDeadline(blockTimestamp, deadline);
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
  return {
    transformRequest: {
      ipId,
      royaltyShares: request.royaltyShares,
      sigApproveRoyaltyTokens: {
        signer: wallet.account!.address,
        deadline: calculatedDeadline,
        signature: signatureApproveRoyaltyTokens,
      },
    },
    workflowClient: royaltyTokenDistributionWorkflowsClient,
  } as TransformIpRegistrationWorkflowResponse<T>;
};

export const handleSpgNftRequest = async <T extends TransformIpRegistrationWorkflowRequest>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleSpgNftRequestConfig): Promise<TransformIpRegistrationWorkflowResponse<T>> => {
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
    const requestWithTerms = { ...baseRequest, licenseTermsData };

    if ("royaltyShares" in request) {
      const { royaltyShares } = getRoyaltyShares(request.royaltyShares as RoyaltyShare[]);
      // mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens request
      return {
        transformRequest: {
          ...requestWithTerms,
          royaltyShares,
        },
        workflowClient: isPublicMinting ? undefined : royaltyTokenDistributionWorkflowsClient,
        spenders: [{ address: baseRequest.spgNftContract, amount: nftMintFee }],
        totalFees: nftMintFee,
      } as TransformIpRegistrationWorkflowResponse<T>;
    }
    // mintAndRegisterIpAssetWithPilTerms request
    return {
      transformRequest: {
        ...requestWithTerms,
        licenseTermsData,
      },
      workflowClient: isPublicMinting ? undefined : licenseAttachmentWorkflowsClient,
      spenders: [{ address: baseRequest.spgNftContract, amount: nftMintFee }],
      totalFees: nftMintFee,
    } as TransformIpRegistrationWorkflowResponse<T>;
  }
  if ("derivData" in request) {
    const derivData = await validateDerivativeData({
      derivativeDataInput: request.derivData as DerivativeDataInput,
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
    const totalFees = nftMintFee + totalDerivativeMintingFee;
    const requestWithDeriv = { ...baseRequest, derivData };

    if ("royaltyShares" in request) {
      const { royaltyShares } = getRoyaltyShares(request.royaltyShares as RoyaltyShare[]);
      /**
       * TODO: Consider the scenario where the SPG token is WIP and the derivative token is ERC20.
       * The SDK should handle both cases in the `contractCallWithFees` method.
       * Currently, it only supports WIP tokens and does not handle ERC20 tokens, such as approving ERC20 tokens.
       * In the future, ensure that the SDK checks whether the token is WIP or ERC20, as all WIP options should be supported.
       */
      // mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens request
      return {
        transformRequest: {
          ...requestWithDeriv,
          royaltyShares,
        },
        workflowClient: isPublicMinting ? undefined : royaltyTokenDistributionWorkflowsClient,
        spenders: [
          {
            address: royaltyTokenDistributionWorkflowsClient.address,
            amount: totalDerivativeMintingFee,
          },
          { address: baseRequest.spgNftContract, amount: nftMintFee },
        ],
        totalFees,
      } as TransformIpRegistrationWorkflowResponse<T>;
    }
    // mintAndRegisterIpAndMakeDerivative request
    return {
      transformRequest: {
        ...requestWithDeriv,
        derivData,
      },
      workflowClient: isPublicMinting ? undefined : derivativeWorkflowsClient,
      spenders: [
        {
          address: derivativeWorkflowsClient.address,
          amount: totalDerivativeMintingFee,
        },
        { address: baseRequest.spgNftContract, amount: nftMintFee },
      ],
      totalFees,
    } as TransformIpRegistrationWorkflowResponse<T>;
  }

  throw new Error("Invalid SPG NFT request type");
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

export const handleNftRequest = async <T extends TransformIpRegistrationWorkflowRequest>({
  request,
  rpcClient,
  wallet,
  chainId,
}: HandleNftRequestConfig): Promise<TransformIpRegistrationWorkflowResponse<T>> => {
  const walletAddress = wallet.account!.address;
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
      const signature = await generateOperationSignature({
        ipIdAddress,
        methodType: SignatureMethodType.REGISTER_IP_AND_ATTACH_PIL_TERMS_AND_DEPLOY_ROYALTY_VAULT,
        deadline: calculatedDeadline,
        wallet,
        chainId,
      });
      // registerIpAndAttachPilTermsAndDeployRoyaltyVault request
      return {
        transformRequest: {
          ...requestWithTerms,
          sigMetadataAndAttachAndConfig: {
            signer: walletAddress,
            deadline: calculatedDeadline,
            signature,
          },
        },
        workflowClient: royaltyTokenDistributionWorkflowsClient,
      } as TransformIpRegistrationWorkflowResponse<T>;
    }

    const signature = await generateOperationSignature({
      ipIdAddress,
      methodType: SignatureMethodType.REGISTER_IP_AND_ATTACH_PIL_TERMS,
      deadline: calculatedDeadline,
      wallet,
      chainId,
    });
    // registerIpAndAttachPilTerms request
    return {
      transformRequest: {
        ...requestWithTerms,
        sigMetadataAndAttachAndConfig: {
          signer: walletAddress,
          deadline: calculatedDeadline,
          signature,
        },
      },
      workflowClient: licenseAttachmentWorkflowsClient,
    } as TransformIpRegistrationWorkflowResponse<T>;
  }

  if ("derivData" in request) {
    const derivData = await validateDerivativeData({
      derivativeDataInput: request.derivData as DerivativeDataInput,
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
      const signature = await generateOperationSignature({
        ipIdAddress,
        methodType: SignatureMethodType.REGISTER_IP_AND_MAKE_DERIVATIVE_AND_DEPLOY_ROYALTY_VAULT,
        deadline: calculatedDeadline,
        wallet,
        chainId,
      });
      // registerIpAndMakeDerivativeAndDeployRoyaltyVault request
      return {
        transformRequest: {
          ...baseRequest,
          derivData,
          sigMetadataAndRegister: {
            signer: walletAddress,
            deadline: calculatedDeadline,
            signature,
          },
        },
        workflowClient: royaltyTokenDistributionWorkflowsClient,
        spenders: [{ address: royaltyTokenDistributionWorkflowsClient.address, amount: totalFees }],
        totalFees,
      } as TransformIpRegistrationWorkflowResponse<T>;
    }

    const signature = await generateOperationSignature({
      ipIdAddress,
      methodType: SignatureMethodType.REGISTER_DERIVATIVE_IP,
      deadline: calculatedDeadline,
      wallet,
      chainId,
    });
    // registerDerivativeIp request
    return {
      transformRequest: {
        ...baseRequest,
        derivData,
        sigMetadataAndRegister: {
          signer: walletAddress,
          deadline: calculatedDeadline,
          signature,
        },
      },
      workflowClient: derivativeWorkflowsClient,
      spenders: [{ address: derivativeWorkflowsClient.address, amount: totalFees }],
      totalFees,
    } as TransformIpRegistrationWorkflowResponse<T>;
  }

  throw new Error("Invalid existing NFT request type");
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

export const transformRegistrationRequest = async <
  T extends TransformIpRegistrationWorkflowRequest,
>({
  request,
  rpcClient,
  wallet,
  chainId,
}: TransformRegistrationRequestConfig): Promise<TransformIpRegistrationWorkflowResponse<T>> => {
  if ("spgNftContract" in request) {
    return handleSpgNftRequest<T>({ request, rpcClient, wallet, chainId });
  } else if ("nftContract" in request && "tokenId" in request) {
    return handleNftRequest<T>({ request, rpcClient, wallet, chainId });
  } else if ("ipRoyaltyVault" in request) {
    return handleDistributeRoyaltyTokensRequest<T>({ request, rpcClient, wallet, chainId });
  }

  throw new Error("Invalid registration request type");
};
