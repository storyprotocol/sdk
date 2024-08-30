import {
  RegisterNonComSocialRemixingPILRequest,
  RegisterPILResponse,
  RegisterCommercialUsePILRequest,
  RegisterCommercialRemixPILRequest,
  AttachLicenseTermsRequest,
  AttachLicenseTermsResponse,
  MintLicenseTokensRequest,
  MintLicenseTokensResponse,
  LicenseTermsId,
  PiLicenseTemplateGetLicenseTermsResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { handleError } from "../util";

const useLicense = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    registerNonComSocialRemixingPIL: false,
    registerCommercialUsePIL: false,
    registerCommercialRemixPIL: false,
    attachLicenseTerms: false,
    mintLicenseTokens: false,
    getLicenseTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    registerNonComSocialRemixingPIL: null,
    registerCommercialUsePIL: null,
    registerCommercialRemixPIL: null,
    attachLicenseTerms: null,
    mintLicenseTokens: null,
    getLicenseTerms: null,
  });

  /**
   * Convenient function to register a PIL non commercial social remix license to the registry
   * @param request - [Optional] The request object that contains all data needed to register a PIL non commercial social remix license.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  const registerNonComSocialRemixingPIL = async (
    request: RegisterNonComSocialRemixingPILRequest
  ): Promise<RegisterPILResponse> => {
    try {
      setLoadings((prev) => ({
        ...prev,
        registerNonComSocialRemixingPIL: true,
      }));
      setErrors((prev) => ({ ...prev, registerNonComSocialRemixingPIL: null }));
      const response = await client.license.registerNonComSocialRemixingPIL(
        request
      );
      setLoadings((prev) => ({
        ...prev,
        registerNonComSocialRemixingPIL: false,
      }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({
        ...prev,
        registerNonComSocialRemixingPIL: errorMessage,
      }));
      setLoadings((prev) => ({
        ...prev,
        registerNonComSocialRemixingPIL: false,
      }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Convenient function to register a PIL commercial use license to the registry.
   * @param request - The request object that contains all data needed to register a PIL commercial use license.
   *   @param request.mintingFee The fee to be paid when minting a license.
   *   @param request.currency The ERC20 token to be used to pay the minting fee and the token must be registered in story protocol.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  const registerCommercialUsePIL = async (
    request: RegisterCommercialUsePILRequest
  ): Promise<RegisterPILResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, registerCommercialUsePIL: true }));
      setErrors((prev) => ({ ...prev, registerCommercialUsePIL: null }));
      const response = await client.license.registerCommercialUsePIL(request);
      setLoadings((prev) => ({ ...prev, registerCommercialUsePIL: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({
        ...prev,
        registerCommercialUsePIL: errorMessage,
      }));
      setLoadings((prev) => ({ ...prev, registerCommercialUsePIL: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Convenient function to register a PIL commercial Remix license to the registry.
   * @param request - The request object that contains all data needed to register license.
   *   @param request.mintingFee The fee to be paid when minting a license.
   *   @param request.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *   @param request.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  const registerCommercialRemixPIL = async (
    request: RegisterCommercialRemixPILRequest
  ): Promise<RegisterPILResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, registerCommercialRemixPIL: true }));
      setErrors((prev) => ({ ...prev, registerCommercialRemixPIL: null }));
      const response = await client.license.registerCommercialRemixPIL(request);
      setLoadings((prev) => ({ ...prev, registerCommercialRemixPIL: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({
        ...prev,
        registerCommercialRemixPIL: errorMessage,
      }));
      setLoadings((prev) => ({ ...prev, registerCommercialRemixPIL: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Attaches license terms to an IP.
   * @param request - The request object that contains all data needed to attach license terms.
   *   @param request.ipId The address of the IP to which the license terms are attached.
   *   @param request.licenseTemplate The address of the license template.
   *   @param request.licenseTermsId The ID of the license terms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const attachLicenseTerms = async (
    request: AttachLicenseTermsRequest
  ): Promise<AttachLicenseTermsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, attachLicenseTerms: true }));
      setErrors((prev) => ({ ...prev, attachLicenseTerms: null }));
      const response = await client.license.attachLicenseTerms(request);
      setLoadings((prev) => ({ ...prev, attachLicenseTerms: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, attachLicenseTerms: errorMessage }));
      setLoadings((prev) => ({ ...prev, attachLicenseTerms: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Mints license tokens for the license terms attached to an IP.
   * The license tokens are minted to the receiver.
   * The license terms must be attached to the IP before calling this function.
   * But it can mint license token of default license terms without attaching the default license terms,
   * since it is attached to all IPs by default.
   * IP owners can mint license tokens for their IPs for arbitrary license terms
   * without attaching the license terms to IP.
   * It might require the caller pay the minting fee, depending on the license terms or configured by the iP owner.
   * The minting fee is paid in the minting fee token specified in the license terms or configured by the IP owner.
   * IP owners can configure the minting fee of their IPs or
   * configure the minting fee module to determine the minting fee.
   * @param request - The request object that contains all data needed to mint license tokens.
   *   @param request.licensorIpId The licensor IP ID.
   *   @param request.licenseTemplate The address of the license template.
   *   @param request.licenseTermsId The ID of the license terms within the license template.
   *   @param request.amount The amount of license tokens to mint.
   *   @param request.receiver The address of the receiver.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional license token IDs if waitForTxn is set to true.
   * @emits LicenseTokensMinted (msg.sender, licensorIpId, licenseTemplate, licenseTermsId, amount, receiver, startLicenseTokenId);
   */
  const mintLicenseTokens = async (
    request: MintLicenseTokensRequest
  ): Promise<MintLicenseTokensResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, mintLicenseTokens: true }));
      setErrors((prev) => ({ ...prev, mintLicenseTokens: null }));
      const response = await client.license.mintLicenseTokens(request);
      setLoadings((prev) => ({ ...prev, mintLicenseTokens: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, mintLicenseTokens: errorMessage }));
      setLoadings((prev) => ({ ...prev, mintLicenseTokens: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Gets license terms of the given ID.
   * @param selectedLicenseTermsId The ID of the license terms.
   * @returns A Promise that resolves to an object containing the PILTerms associate with the given ID.
   */
  const getLicenseTerms = async (
    selectedLicenseTermsId: LicenseTermsId
  ): Promise<PiLicenseTemplateGetLicenseTermsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, getLicenseTerms: true }));
      setErrors((prev) => ({ ...prev, getLicenseTerms: null }));
      const response = await client.license.getLicenseTerms(
        selectedLicenseTermsId
      );
      setLoadings((prev) => ({ ...prev, getLicenseTerms: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, getLicenseTerms: errorMessage }));
      setLoadings((prev) => ({ ...prev, getLicenseTerms: false }));
      throw new Error(errorMessage);
    }
  };

  return {
    loadings,
    errors,
    registerNonComSocialRemixingPIL,
    registerCommercialUsePIL,
    registerCommercialRemixPIL,
    attachLicenseTerms,
    mintLicenseTokens,
    getLicenseTerms,
  };
};
export default useLicense;
