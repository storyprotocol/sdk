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
import { withLoadingErrorHandling } from "../withLoadingErrorHandling";

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
  const registerNonComSocialRemixingPIL = withLoadingErrorHandling<
    RegisterNonComSocialRemixingPILRequest,
    RegisterPILResponse
  >(
    "registerNonComSocialRemixingPIL",
    client.license.registerNonComSocialRemixingPIL.bind(client.license),
    setLoadings,
    setErrors
  );

  /**
   * Convenient function to register a PIL commercial use license to the registry.
   * @param request - The request object that contains all data needed to register a PIL commercial use license.
   *   @param request.mintingFee The fee to be paid when minting a license.
   *   @param request.currency The ERC20 token to be used to pay the minting fee and the token must be registered in story protocol.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  const registerCommercialUsePIL = withLoadingErrorHandling<
    RegisterCommercialUsePILRequest,
    RegisterPILResponse
  >(
    "registerCommercialUsePIL",
    client.license.registerCommercialUsePIL.bind(client.license),
    setLoadings,
    setErrors
  );

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
  const registerCommercialRemixPIL = withLoadingErrorHandling<
    RegisterCommercialRemixPILRequest,
    RegisterPILResponse
  >(
    "registerCommercialRemixPIL",
    client.license.registerCommercialRemixPIL.bind(client.license),
    setLoadings,
    setErrors
  );

  /**
   * Attaches license terms to an IP.
   * @param request - The request object that contains all data needed to attach license terms.
   *   @param request.ipId The address of the IP to which the license terms are attached.
   *   @param request.licenseTemplate The address of the license template.
   *   @param request.licenseTermsId The ID of the license terms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const attachLicenseTerms = withLoadingErrorHandling<
    AttachLicenseTermsRequest,
    AttachLicenseTermsResponse
  >(
    "attachLicenseTerms",
    client.license.attachLicenseTerms.bind(client.license),
    setLoadings,
    setErrors
  );

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
  const mintLicenseTokens = withLoadingErrorHandling<
    MintLicenseTokensRequest,
    MintLicenseTokensResponse
  >(
    "mintLicenseTokens",
    client.license.mintLicenseTokens.bind(client.license),
    setLoadings,
    setErrors
  );

  /**
   * Gets license terms of the given ID.
   * @param selectedLicenseTermsId The ID of the license terms.
   * @returns A Promise that resolves to an object containing the PILTerms associate with the given ID.
   */
  const getLicenseTerms = withLoadingErrorHandling<
    LicenseTermsId,
    PiLicenseTemplateGetLicenseTermsResponse
  >(
    "getLicenseTerms",
    client.license.getLicenseTerms.bind(client.license),
    setLoadings,
    setErrors
  );

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
