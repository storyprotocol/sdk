/**
 * Generates a signature for various IP registration and management operations.
 * This function handles different signature types based on the provided method type,
 * including distributing royalty tokens, registering PIL terms, making derivatives, etc.
 */

import { Hex, toHex } from "viem";

import { getFunctionSignature } from "./getFunctionSignature";
import { getPermissionSignature, getSignature } from "./sign";
import { chain } from "./utils";
import {
  coreMetadataModuleAbi,
  coreMetadataModuleAddress,
  derivativeWorkflowsAddress,
  licenseAttachmentWorkflowsAddress,
  licensingModuleAbi,
  licensingModuleAddress,
  registrationWorkflowsAddress,
  royaltyTokenDistributionWorkflowsAddress,
} from "../abi/generated";
import {
  AccessPermission,
  PermissionSignatureRequest,
  SignatureRequest,
} from "../types/resources/permission";
import {
  GenerateOperationSignatureRequest,
  SignatureMethodType,
} from "../types/utils/registerHelper";

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
}: GenerateOperationSignatureRequest): Promise<Hex> => {
  const baseConfig = {
    ipId: ipIdAddress,
    deadline,
    state: toHex(0, { size: 32 }),
    wallet: wallet,
    chainId: chain[chainId],
  };

  // Validate required parameters based on method type
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

  // Get contract addresses for the current chain
  const royaltyTokenDistributionWorkflowsAddr = royaltyTokenDistributionWorkflowsAddress[chainId];
  const coreMetadataModuleAddr = coreMetadataModuleAddress[chainId];
  const licensingModuleAddr = licensingModuleAddress[chainId];
  const derivativeWorkflowsAddr = derivativeWorkflowsAddress[chainId];
  const licenseAttachmentWorkflowsAddr = licenseAttachmentWorkflowsAddress[chainId];
  const registrationWorkflowsAddr = registrationWorkflowsAddress[chainId];

  // Define signature configurations for each method type
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

  // Get the appropriate signature configuration for the requested method type
  const signatureRequest = signatureConfigs[methodType];

  // Generate the appropriate signature type based on the method
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
