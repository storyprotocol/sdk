import {
  GenerateCreatorMetadataParam,
  IpCreator,
  GenerateIpMetadataParam,
  IpMetadata,
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
  MintAndRegisterIpAndMakeDerivativeRequest,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { withLoadingErrorHandling } from "../withLoadingErrorHandling";

const useIpAsset = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    register: false,
    registerDerivative: false,
    registerDerivativeWithLicenseTokens: false,
    mintAndRegisterIpAssetWithPilTerms: false,
    registerIpAndAttachPilTerms: false,
    registerDerivativeIp: false,
    mintAndRegisterIpAndMakeDerivative: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    register: null,
    registerDerivative: null,
    registerDerivativeWithLicenseTokens: null,
    mintAndRegisterIpAssetWithPilTerms: null,
    registerIpAndAttachPilTerms: null,
    registerDerivativeIp: null,
    mintAndRegisterIpAndMakeDerivative: null,
  });

  /**
   * Create a new `IpCreator` object with the specified details.
   * @param params - The parameters required to create the `IpCreator` object.
   *   @param params.name The name of the creator.
   *   @param params.address The wallet address of the creator.
   *   @param params.description [Optional] A description of the creator.
   *   @param params.image [Optional] The URL or path to an image representing the creator.
   *   @param params.socialMedia [Optional] An array of social media profiles associated with the creator.
   *     @param params.socialMedia[].platform The name of the social media platform.
   *     @param params.socialMedia[].url The URL to the creator&#39;s profile on the platform.
   *  @param params.contributionPercent The percentage of contribution by the creator, must add up to 100.
   *  @param params.role [Optional] The role of the creator in relation to the IP.
   * @returns An `IpCreator` object containing the provided details.
   */
  const generateCreatorMetadata = (
    param: GenerateCreatorMetadataParam
  ): IpCreator => {
    return client.ipAsset.generateCreatorMetadata(param);
  };

  /**
   * Create a new `IpMetadata` object with the specified details.
   * @param params - The parameters required to create the `IpMetadata` object.
   *   @param params.title [Optional] The title of the IP.
   *   @param params.description [Optional] A description of the IP.
   *   @param params.ipType [Optional] The type of the IP asset (e.g., &#34;character&#34;, &#34;chapter&#34;).
   *   @param params.relationships [Optional] An array of relationships between this IP and its parent IPs.
   *     @param params.relationships[].ipId The ID of the parent IP.
   *     @param params.relationships[].type The type of relationship (e.g., &#34;APPEARS_IN&#34;).
   *   @param params.createdAt [Optional] The creation date and time of the IP in ISO 8601 format.
   *   @param params.watermarkImg [Optional] The URL or path to an image used as a watermark for the IP.
   *   @param params.creators [Optional] An array of creators associated with the IP.
   *     @param params.creators[].name The name of the creator.
   *     @param params.creators[].address The address of the creator.
   *     @param params.creators[].description [Optional] A description of the creator.
   *     @param params.creators[].image [Optional] The URL or path to an image representing the creator.
   *     @param params.creators[].socialMedia [Optional] An array of social media profiles for the creator.
   *     @param params.creators[].socialMedia[].platform The social media platform name.
   *     @param params.creators[].socialMedia[].url The URL to the creator&#39;s profile.
   *     @param params.creators[].role [Optional] The role of the creator in relation to the IP.
   *     @param params.creators[].contributionPercent The percentage of contribution by the creator.
   *   @param params.media [Optional] An array of media related to the IP.
   *     @param params.media[].name The name of the media.
   *     @param params.media[].url The URL to the media.
   *     @param params.media[].mimeType The MIME type of the media.
   *   @param params.attributes [Optional] An array of key-value pairs providing additional metadata.
   *     @param params.attributes[].key The key for the attribute.
   *     @param params.attributes[].value The value for the attribute, can be a string or number.
   *   @param params.app [Optional] Information about the application associated with the IP.
   *     @param params.app.id The ID of the application.
   *     @param params.app.name The name of the application.
   *     @param params.app.website The website URL of the application.
   *   @param params.tags [Optional] An array of tags associated with the IP.
   *   @param params.robotTerms [Optional] Robot terms for the IP, specifying access rules.
   *     @param params.robotTerms.userAgent The user agent for which the rules apply.
   *     @param params.robotTerms.allow The rules allowing access.
   *   @param params.additionalProperties [Optional] Any additional key-value pairs to include in the metadata.
   * @returns An `IpMetadata` object containing the provided details and any additional properties.
   */
  const generateIpMetadata = (param: GenerateIpMetadataParam): IpMetadata => {
    return client.ipAsset.generateIpMetadata(param);
  };

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request - The request object that contains all data needed to register IP.
   *   @param request.nftContract The address of the NFT.
   *   @param request.tokenId The token identifier of the NFT.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  const register = withLoadingErrorHandling<
    RegisterRequest,
    RegisterIpResponse
  >(
    "register",
    client.ipAsset.register.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

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
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const registerDerivative = withLoadingErrorHandling<
    RegisterDerivativeRequest,
    RegisterDerivativeResponse
  >(
    "registerDerivative",
    client.ipAsset.registerDerivative.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

  /**
   * Registers a derivative with license tokens.
   * the derivative IP is registered with license tokens minted from the parent IP&#39;s license terms.
   * the license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * the caller must be the derivative IP owner or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative license tokens.
   *   @param request.childIpId The derivative IP ID.
   *   @param request.licenseTokenIds The IDs of the license tokens.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const registerDerivativeWithLicenseTokens = withLoadingErrorHandling<
    RegisterDerivativeWithLicenseTokensRequest,
    RegisterDerivativeWithLicenseTokensResponse
  >(
    "registerDerivativeWithLicenseTokens",
    client.ipAsset.registerDerivativeWithLicenseTokens.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

  /**
   * Mint an NFT from a collection and register it as an IP.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.pilType The type of the PIL.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID, Token ID, License Terms Id if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  const mintAndRegisterIpAssetWithPilTerms = withLoadingErrorHandling<
    CreateIpAssetWithPilTermsRequest,
    CreateIpAssetWithPilTermsResponse
  >(
    "mintAndRegisterIpAssetWithPilTerms",
    client.ipAsset.mintAndRegisterIpAssetWithPilTerms.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

  /**
   * Register a given NFT as an IP and attach Programmable IP License Terms.R.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.pilType The type of the PIL.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID, License Terms Id if waitForTxn is set to true.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  const registerIpAndAttachPilTerms = withLoadingErrorHandling<
    RegisterIpAndAttachPilTermsRequest,
    RegisterIpAndAttachPilTermsResponse
  >(
    "registerIpAndAttachPilTerms",
    client.ipAsset.registerIpAndAttachPilTerms.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

  /**
   * Register the given NFT as a derivative IP with metadata without using license tokens.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *   @param request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *   @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds,default is 1000ms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  const registerDerivativeIp = withLoadingErrorHandling<
    RegisterIpAndMakeDerivativeRequest,
    RegisterIpAndMakeDerivativeResponse
  >(
    "registerDerivativeIp",
    client.ipAsset.registerDerivativeIp.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

  /**
   * Mint an NFT from a collection and register it as a derivative IP without license tokens.
   * @param request - The request object that contains all data needed to mint and register ip and make derivative.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *   @param request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *   @param request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *   @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.*
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  const mintAndRegisterIpAndMakeDerivative = withLoadingErrorHandling<
    MintAndRegisterIpAndMakeDerivativeRequest,
    RegisterDerivativeResponse
  >(
    "mintAndRegisterIpAndMakeDerivative",
    client.ipAsset.mintAndRegisterIpAndMakeDerivative.bind(client.ipAsset),
    setLoadings,
    setErrors
  );

  return {
    loadings,
    errors,
    generateCreatorMetadata,
    generateIpMetadata,
    register,
    registerDerivative,
    registerDerivativeWithLicenseTokens,
    mintAndRegisterIpAssetWithPilTerms,
    registerIpAndAttachPilTerms,
    registerDerivativeIp,
    mintAndRegisterIpAndMakeDerivative,
  };
};
export default useIpAsset;
