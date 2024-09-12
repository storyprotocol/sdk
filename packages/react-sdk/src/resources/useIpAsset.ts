import {
  RegisterRequest,
  RegisterIpResponse,
  RegisterDerivativeRequest,
  RegisterDerivativeResponse,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
  CreateIpAssetWithPilTermsRequest,
  CreateIpAssetWithPilTermsResponse,
  RegisterIpAndAttachPilTermsRequest,
  RegisterIpAndAttachPilTermsResponse,
  RegisterIpAndMakeDerivativeRequest,
  RegisterIpAndMakeDerivativeResponse,
} from "@story-protocol/core-sdk";

import { useStoryContext } from "../StoryProtocolContext";
import { handleError } from "../util";
import { useLoading } from "../hooks/useLoading";
import { useErrors } from "../hooks/useError";

const useIpAsset = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useLoading({
    register: false,
    registerDerivative: false,
    registerDerivativeWithLicenseTokens: false,
    mintAndRegisterIpAssetWithPilTerms: false,
    registerIpAndAttachPilTerms: false,
    registerDerivativeIp: false,
  });
  const [errors, setErrors] = useErrors({
    register: null,
    registerDerivative: null,
    registerDerivativeWithLicenseTokens: null,
    mintAndRegisterIpAssetWithPilTerms: null,
    registerIpAndAttachPilTerms: null,
    registerDerivativeIp: null,
  });

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request - The request object that contains all data needed to register IP.
   *   @param request.nftContract The address of the NFT.
   *   @param request.tokenId The token identifier of the NFT.
   *   @param request.metadata - [Optional] The metadata for the IP.
   *   @param request.metadata.metadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  const register = async (
    request: RegisterRequest
  ): Promise<RegisterIpResponse> => {
    try {
      setLoadings("register", true);
      setErrors("register", null);
      const response = await client.ipAsset.register(request);
      setLoadings("register", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("register", errorMessage);
      setLoadings("register", false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Registers a derivative directly with parent IP&#39;s license terms, without needing license tokens,
   * and attaches the license terms of the parent IPs to the derivative IP.
   * The license terms must be attached to the parent IP before calling this function.
   * All IPs attached default license terms by default.
   * The derivative IP owner must be the caller or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.childIpId The derivative IP ID.
   *   @param request.parentIpIds The parent IP IDs.
   *   @param request.licenseTermsIds The IDs of the license terms that the parent IP supports.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const registerDerivative = async (
    request: RegisterDerivativeRequest
  ): Promise<RegisterDerivativeResponse> => {
    try {
      setLoadings("registerDerivative", true);
      setErrors("registerDerivative", null);
      const response = await client.ipAsset.registerDerivative(request);
      setLoadings("registerDerivative", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("registerDerivative", errorMessage);
      setLoadings("registerDerivative", false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Registers a derivative with license tokens.
   * the derivative IP is registered with license tokens minted from the parent IP&#39;s license terms.
   * the license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * the caller must be the derivative IP owner or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative license tokens.
   *   @param request.childIpId The derivative IP ID.
   *   @param request.licenseTokenIds The IDs of the license tokens.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const registerDerivativeWithLicenseTokens = async (
    request: RegisterDerivativeWithLicenseTokensRequest
  ): Promise<RegisterDerivativeWithLicenseTokensResponse> => {
    try {
      setLoadings("registerDerivativeWithLicenseTokens", true);
      setErrors("registerDerivativeWithLicenseTokens", null);
      const response = await client.ipAsset.registerDerivativeWithLicenseTokens(
        request
      );
      setLoadings("registerDerivativeWithLicenseTokens", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("registerDerivativeWithLicenseTokens", errorMessage);
      setLoadings("registerDerivativeWithLicenseTokens", false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Mint an NFT from a collection and register it as an IP.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.pilType The type of the PIL.
   *   @param request.metadata - [Optional] The metadata for the IP.
   *   @param request.metadata.metadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID, Token ID, License Terms Id if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  const mintAndRegisterIpAssetWithPilTerms = async (
    request: CreateIpAssetWithPilTermsRequest
  ): Promise<CreateIpAssetWithPilTermsResponse> => {
    try {
      setLoadings("mintAndRegisterIpAssetWithPilTerms", true);
      setErrors("mintAndRegisterIpAssetWithPilTerms", null);
      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms(
        request
      );
      setLoadings("mintAndRegisterIpAssetWithPilTerms", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("mintAndRegisterIpAssetWithPilTerms", errorMessage);
      setLoadings("mintAndRegisterIpAssetWithPilTerms", false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Register a given NFT as an IP and attach Programmable IP License Terms.R.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.pilType The type of the PIL.
   *   @param request.metadata - [Optional] The desired metadata for the newly registered IP.
   *   @param request.metadata.metadataURI [Optional] The the metadata for the IP hash.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID, License Terms Id if waitForTxn is set to true.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  const registerIpAndAttachPilTerms = async (
    request: RegisterIpAndAttachPilTermsRequest
  ): Promise<RegisterIpAndAttachPilTermsResponse> => {
    try {
      setLoadings("registerIpAndAttachPilTerms", true);
      setErrors("registerIpAndAttachPilTerms", null);
      const response = await client.ipAsset.registerIpAndAttachPilTerms(
        request
      );
      setLoadings("registerIpAndAttachPilTerms", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("registerIpAndAttachPilTerms", errorMessage);
      setLoadings("registerIpAndAttachPilTerms", false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Register the given NFT as a derivative IP with metadata without using license tokens.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *   @param request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *   @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *   @param request.metadata - [Optional] The desired metadata for the newly registered IP.
   *   @param request.metadata.metadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds,default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  const registerDerivativeIp = async (
    request: RegisterIpAndMakeDerivativeRequest
  ): Promise<RegisterIpAndMakeDerivativeResponse> => {
    try {
      setLoadings("registerDerivativeIp", true);
      setErrors("registerDerivativeIp", null);
      const response = await client.ipAsset.registerDerivativeIp(request);
      setLoadings("registerDerivativeIp", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("registerDerivativeIp", errorMessage);
      setLoadings("registerDerivativeIp", false);
      throw new Error(errorMessage);
    }
  };

  return {
    loadings,
    errors,
    register,
    registerDerivative,
    registerDerivativeWithLicenseTokens,
    mintAndRegisterIpAssetWithPilTerms,
    registerIpAndAttachPilTerms,
    registerDerivativeIp,
  };
};
export default useIpAsset;
