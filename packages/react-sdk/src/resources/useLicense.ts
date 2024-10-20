import {
  RegisterPILTermsRequest,
  RegisterPILResponse,
  RegisterNonComSocialRemixingPILRequest,
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
    registerPILTerms: false,
    registerNonComSocialRemixingPIL: false,
    registerCommercialUsePIL: false,
    registerCommercialRemixPIL: false,
    attachLicenseTerms: false,
    mintLicenseTokens: false,
    getLicenseTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    registerPILTerms: null,
    registerNonComSocialRemixingPIL: null,
    registerCommercialUsePIL: null,
    registerCommercialRemixPIL: null,
    attachLicenseTerms: null,
    mintLicenseTokens: null,
    getLicenseTerms: null,
  });

  if (!client) {
    return {
      loadings,
      errors,
      registerPILTerms: undefined,
      registerNonComSocialRemixingPIL: undefined,
      registerCommercialUsePIL: undefined,
      registerCommercialRemixPIL: undefined,
      attachLicenseTerms: undefined,
      mintLicenseTokens: undefined,
      getLicenseTerms: undefined,
    };
  }

  /**
   * Registers new license terms and return the ID of the newly registered license terms.
   * @param request - The request object that contains all data needed to register a license term.
   *   @param request.transferable Indicates whether the license is transferable or not.
   *   @param request.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *   @param request.mintingFee The fee to be paid when minting a license.
   *   @param request.expiration The expiration period of the license.
   *   @param request.commercialUse Indicates whether the work can be used commercially or not.
   *   @param request.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *   @param request.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *   @param request.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *   @param request.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *   @param request.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *   @param request.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *   @param request.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *   @param request.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *   @param request.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *   @param request.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *   @param request.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash, optional transaction encodedTxData and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  const registerPILTerms = withLoadingErrorHandling<
    RegisterPILTermsRequest,
    RegisterPILResponse
  >(
    "registerPILTerms",
    client.license.registerPILTerms.bind(client.license),
    setLoadings,
    setErrors,
  );

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
    setErrors,
  );

  /**
   * Convenient function to register a PIL commercial use license to the registry.
   * @param request - The request object that contains all data needed to register a PIL commercial use license.
   *   @param request.defaultMintingFee The fee to be paid when minting a license.
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
    setErrors,
  );

  /**
   * Convenient function to register a PIL commercial Remix license to the registry.
   * @param request - The request object that contains all data needed to register license.
   *   @param request.defaultMintingFee The fee to be paid when minting a license.
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
    setErrors,
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
    setErrors,
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
    setErrors,
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
    setErrors,
  );

  return {
    loadings,
    errors,
    registerPILTerms,
    registerNonComSocialRemixingPIL,
    registerCommercialUsePIL,
    registerCommercialRemixPIL,
    attachLicenseTerms,
    mintLicenseTokens,
    getLicenseTerms,
  };
};
export default useLicense;
