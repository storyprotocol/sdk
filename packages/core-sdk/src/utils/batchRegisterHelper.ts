import { Address, Hex, PublicClient, toHex } from "viem";

import {
  coreMetadataModuleAbi,
  coreMetadataModuleAddress,
  royaltyTokenDistributionWorkflowsAddress,
  derivativeWorkflowsAddress,
  licenseAttachmentWorkflowsAddress,
  licensingModuleAbi,
  licensingModuleAddress,
  SpgnftImplReadOnlyClient,
  registrationWorkflowsAddress,
} from "../abi/generated";
import { chain } from "./utils";
import {
  GeneratePrefixRegisterSignatureRequest,
  SignatureMethodType,
} from "../types/utils/batchRegisterHelper";
import {
  AccessPermission,
  PermissionSignatureRequest,
  SignatureRequest,
} from "../types/resources/permission";
import { getSignature, getPermissionSignature } from "./sign";
import { getFunctionSignature } from "./getFunctionSignature";

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
