import {
  Hex,
  PublicClient,
  zeroAddress,
  Address,
  zeroHash,
  WalletClient,
  toHex,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  toFunctionSelector,
  TransactionReceipt,
} from "viem";

import { chain, getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import {
  CreateIpAssetWithPilTermsRequest,
  CreateIpAssetWithPilTermsResponse,
  GenerateCreatorMetadataParam,
  GenerateIpMetadataParam,
  IpCreator,
  IpMetadata,
  MintAndRegisterIpAndMakeDerivativeRequest,
  MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  MintAndRegisterIpRequest,
  RegisterDerivativeRequest,
  RegisterDerivativeResponse,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
  RegisterIpAndAttachPilTermsRequest,
  RegisterIpAndAttachPilTermsResponse,
  RegisterIpAndMakeDerivativeRequest,
  RegisterIpAndMakeDerivativeResponse,
  RegisterIpResponse,
  RegisterPilTermsAndAttachRequest,
  RegisterPilTermsAndAttachResponse,
  RegisterRequest,
} from "../types/resources/ipAsset";
import {
  AccessControllerClient,
  CoreMetadataModuleClient,
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  GroupingWorkflowsClient,
  IpAccountImplClient,
  IpAssetRegistryClient,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  RegistrationWorkflowsClient,
  RegistrationWorkflowsMintAndRegisterIpRequest,
  RegistrationWorkflowsRegisterIpRequest,
  SimpleWalletClient,
  accessControllerAbi,
  ipAccountImplAbi,
  royaltyPolicyLapAddress,
} from "../abi/generated";
import { getLicenseTermByType, validateLicenseTerms } from "../utils/licenseTermsHelper";
import { getDeadline, getPermissionSignature } from "../utils/sign";
import { AccessPermission, SetPermissionsRequest } from "../types/resources/permission";

export class IPAssetClient {
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public licenseTokenReadOnlyClient: LicenseTokenReadOnlyClient;
  public accessControllerClient: AccessControllerClient;
  public coreMetadataModuleClient: CoreMetadataModuleClient;
  public registrationWorkflowsClient: RegistrationWorkflowsClient;
  public licenseAttachmentWorkflowsClient: LicenseAttachmentWorkflowsClient;
  public derivativeWorkflowsClient: DerivativeWorkflowsClient;
  public groupGroupClient: GroupingWorkflowsClient;
  public royaltyWorkflowsClient: GroupingWorkflowsClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: SupportedChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.licenseTokenReadOnlyClient = new LicenseTokenReadOnlyClient(rpcClient);
    this.accessControllerClient = new AccessControllerClient(rpcClient, wallet);
    this.coreMetadataModuleClient = new CoreMetadataModuleClient(rpcClient, wallet);
    this.registrationWorkflowsClient = new RegistrationWorkflowsClient(rpcClient, wallet);
    this.licenseAttachmentWorkflowsClient = new LicenseAttachmentWorkflowsClient(rpcClient, wallet);
    this.derivativeWorkflowsClient = new DerivativeWorkflowsClient(rpcClient, wallet);
    this.groupGroupClient = new GroupingWorkflowsClient(rpcClient, wallet);
    this.royaltyWorkflowsClient = new GroupingWorkflowsClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
  }

  /**
   * Create a new `IpCreator` object with the specified details.
   * @param params - The parameters required to create the `IpCreator` object.
   *   @param params.name The name of the creator.
   *   @param params.address The wallet address of the creator.
   *   @param params.description [Optional] A description of the creator.
   *   @param params.image [Optional] The URL or path to an image representing the creator.
   *   @param params.socialMedia [Optional] An array of social media profiles associated with the creator.
   *     @param params.socialMedia[].platform The name of the social media platform.
   *     @param params.socialMedia[].url The URL to the creator's profile on the platform.
   *  @param params.contributionPercent The percentage of contribution by the creator, must add up to 100.
   *  @param params.role [Optional] The role of the creator in relation to the IP.
   * @returns An `IpCreator` object containing the provided details.
   */
  public generateCreatorMetadata(param: GenerateCreatorMetadataParam): IpCreator {
    const {
      name,
      address,
      description = "",
      image = "",
      socialMedia = [],
      contributionPercent,
      role = "",
    } = param;
    return {
      name,
      address,
      description,
      image,
      socialMedia,
      contributionPercent,
      role,
    };
  }

  /**
   * Create a new `IpMetadata` object with the specified details.
   * @param params - The parameters required to create the `IpMetadata` object.
   *   @param params.title [Optional] The title of the IP.
   *   @param params.description [Optional] A description of the IP.
   *   @param params.ipType [Optional] The type of the IP asset (e.g., "character", "chapter").
   *   @param params.relationships [Optional] An array of relationships between this IP and its parent IPs.
   *     @param params.relationships[].ipId The ID of the parent IP.
   *     @param params.relationships[].type The type of relationship (e.g., "APPEARS_IN").
   *   @param params.createdAt [Optional] The creation date and time of the IP in ISO 8601 format.
   *   @param params.watermarkImg [Optional] The URL or path to an image used as a watermark for the IP.
   *   @param params.creators [Optional] An array of creators associated with the IP.
   *     @param params.creators[].name The name of the creator.
   *     @param params.creators[].address The address of the creator.
   *     @param params.creators[].description [Optional] A description of the creator.
   *     @param params.creators[].image [Optional] The URL or path to an image representing the creator.
   *     @param params.creators[].socialMedia [Optional] An array of social media profiles for the creator.
   *     @param params.creators[].socialMedia[].platform The social media platform name.
   *     @param params.creators[].socialMedia[].url The URL to the creator's profile.
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
  public generateIpMetadata(param: GenerateIpMetadataParam): IpMetadata {
    const {
      title = "",
      description = "",
      ipType = "",
      relationships = [],
      createdAt = "",
      watermarkImg = "",
      creators = [],
      media = [],
      attributes = [],
      app,
      tags = [],
      robotTerms,
      ...additionalProperties
    } = param;
    return {
      title,
      description,
      ipType,
      relationships,
      createdAt,
      watermarkImg,
      creators,
      media,
      attributes,
      app,
      tags,
      robotTerms,
      ...additionalProperties, // Include any additional properties
    };
  }

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
  public async register(request: RegisterRequest): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, tokenId);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        return { ipId: ipIdAddress };
      }
      const object: RegistrationWorkflowsRegisterIpRequest = {
        tokenId,
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        if (request.ipMetadata) {
          return { encodedTxData: this.registrationWorkflowsClient.registerIpEncode(object) };
        } else {
          return {
            encodedTxData: this.ipAssetRegistryClient.registerEncode({
              tokenContract: object.nftContract,
              tokenId: object.tokenId,
              chainid: chain[this.chainId],
            }),
          };
        }
      } else {
        let txHash: Hex;
        if (request.ipMetadata) {
          const calculatedDeadline = getDeadline(request.deadline);
          const signature = await getPermissionSignature({
            ipId: ipIdAddress,
            deadline: calculatedDeadline,
            state: toHex(0, { size: 32 }),
            wallet: this.wallet as WalletClient,
            chainId: chain[this.chainId],
            permissions: [
              {
                ipId: ipIdAddress,
                signer: getAddress(
                  this.registrationWorkflowsClient.address,
                  "registrationWorkflowsClient",
                ),
                to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
                permission: AccessPermission.ALLOW,
                func: "function setAll(address,string,bytes32,bytes32)",
              },
            ],
          });
          object.sigMetadata = {
            signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
            deadline: calculatedDeadline,
            signature,
          };
          txHash = await this.registrationWorkflowsClient.registerIp(object);
        } else {
          txHash = await this.ipAssetRegistryClient.register({
            tokenContract: object.nftContract,
            tokenId: object.tokenId,
            chainid: chain[this.chainId],
          });
        }
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
          return { txHash: txHash, ipId: targetLogs[0].ipId };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register IP");
    }
  }

  /**
   * Registers a derivative directly with parent IP's license terms, without needing license tokens,
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
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
    try {
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      for (const parentId of request.parentIpIds) {
        const isParentIpIdRegistered = await this.isRegistered(
          getAddress(parentId, "request.parentIpIds"),
        );
        if (!isParentIpIdRegistered) {
          throw new Error(`The parent IP with id ${parentId} is not registered.`);
        }
      }
      if (request.parentIpIds.length !== request.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (let i = 0; i < request.parentIpIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: getAddress(request.parentIpIds[i], "request.parentIpIds"),
            licenseTemplate:
              (request.licenseTemplate &&
                getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
              this.licenseTemplateClient.address,
            licenseTermsId: BigInt(request.licenseTermsIds[i]),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms id ${request.licenseTermsIds[i]} must be attached to the parent ipId ${request.parentIpIds[i]} before registering derivative.`,
          );
        }
      }

      const req = {
        childIpId: request.childIpId,
        parentIpIds: request.parentIpIds,
        licenseTermsIds: request.licenseTermsIds.map((id) => BigInt(id)),
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        royaltyContext: zeroAddress,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.licensingModuleClient.registerDerivativeEncode(req) };
      } else {
        const txHash = await this.licensingModuleClient.registerDerivative(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register derivative");
    }
  }

  /**
   * Registers a derivative with license tokens.
   * the derivative IP is registered with license tokens minted from the parent IP's license terms.
   * the license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * the caller must be the derivative IP owner or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative license tokens.
   *   @param request.childIpId The derivative IP ID.
   *   @param request.licenseTokenIds The IDs of the license tokens.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async registerDerivativeWithLicenseTokens(
    request: RegisterDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterDerivativeWithLicenseTokensResponse> {
    try {
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      request.licenseTokenIds = request.licenseTokenIds.map((id) => BigInt(id));
      for (const licenseTokenId of request.licenseTokenIds) {
        const tokenOwnerAddress = await this.licenseTokenReadOnlyClient.ownerOf({
          tokenId: licenseTokenId,
        });
        if (!tokenOwnerAddress) {
          throw new Error(`License token id ${licenseTokenId} must be owned by the caller.`);
        }
      }
      const req = {
        childIpId: getAddress(request.childIpId, "request.childIpId"),
        licenseTokenIds: request.licenseTokenIds,
        royaltyContext: zeroAddress,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.licensingModuleClient.registerDerivativeWithLicenseTokensEncode(req),
        };
      } else {
        const txHash = await this.licensingModuleClient.registerDerivativeWithLicenseTokens(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash: txHash };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register derivative with license tokens");
    }
  }

  /**
   * Mint an NFT from a collection and register it as an IP.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.spgNftContract The address of the NFT collection.
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
  public async mintAndRegisterIpAssetWithPilTerms(
    request: CreateIpAssetWithPilTermsRequest,
  ): Promise<CreateIpAssetWithPilTermsResponse> {
    try {
      if (request.pilType === undefined || request.pilType === null) {
        throw new Error("PIL type is required.");
      }
      const licenseTerm = getLicenseTermByType(request.pilType, {
        defaultMintingFee: request.mintingFee,
        currency: request.currency,
        commercialRevShare: request.commercialRevShare,
        royaltyPolicyLAPAddress:
          royaltyPolicyLapAddress[
            chain[this.chainId] as unknown as keyof typeof royaltyPolicyLapAddress
          ],
      });
      const object: LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest = {
        spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
        recipient:
          (request.recipient && getAddress(request.recipient, "request.recipient")) ||
          this.wallet.account!.address,

        terms: licenseTerm,
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTermsEncode(object),
        };
      } else {
        const txHash =
          await this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms(object);
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const iPRegisteredLog = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt)[0];
          const licenseTermsId = await this.getLicenseTermsId(txReceipt);
          return {
            txHash: txHash,
            ipId: iPRegisteredLog.ipId,
            licenseTermsId,
            tokenId: iPRegisteredLog.tokenId,
          };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and attach PIL terms");
    }
  }
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
  public async registerIpAndAttachPilTerms(
    request: RegisterIpAndAttachPilTermsRequest,
  ): Promise<RegisterIpAndAttachPilTermsResponse> {
    try {
      if (request.pilType === undefined || request.pilType === null) {
        throw new Error("PIL type is required.");
      }
      request.tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, request.tokenId);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const licenseTerm = getLicenseTermByType(request.pilType, {
        defaultMintingFee: request.mintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress:
          royaltyPolicyLapAddress[
            chain[this.chainId] as unknown as keyof typeof royaltyPolicyLapAddress
          ],
        commercialRevShare: request.commercialRevShare,
      });
      const calculatedDeadline = getDeadline(request.deadline);

      const sigAttachSignature = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: this.getSigSignatureState({
          ipId: ipIdAddress,
          signer: getAddress(
            this.licenseAttachmentWorkflowsClient.address,
            "licenseAttachmentWorkflowsClient",
          ),
          to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
          permission: AccessPermission.ALLOW,
          func: "function setAll(address,string,bytes32,bytes32)",
        }),
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: getAddress(
              this.licenseAttachmentWorkflowsClient.address,
              "licenseAttachmentWorkflowsClient",
            ),
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: "function attachLicenseTerms(address,address,uint256)",
          },
        ],
      });
      const object: LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        tokenId: request.tokenId,
        terms: licenseTerm,
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
        sigAttach: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigAttachSignature,
        },
      };
      const sigMetadataSignature = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: toHex(0, { size: 32 }),
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: getAddress(
              this.licenseAttachmentWorkflowsClient.address,
              "licenseAttachmentWorkflowsClient",
            ),
            to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
      });
      object.sigMetadata = {
        signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
        deadline: calculatedDeadline,
        signature: sigMetadataSignature,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.licenseAttachmentWorkflowsClient.registerIpAndAttachPilTermsEncode(object),
        };
      } else {
        const txHash = await this.licenseAttachmentWorkflowsClient.registerIpAndAttachPilTerms(
          object,
        );
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const ipRegisterEvent = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
          const licenseTermsId = await this.getLicenseTermsId(txReceipt);
          return { txHash, licenseTermsId: licenseTermsId, ipId: ipRegisterEvent[0].ipId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register IP and attach PIL terms");
    }
  }
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
  public async registerDerivativeIp(
    request: RegisterIpAndMakeDerivativeRequest,
  ): Promise<RegisterIpAndMakeDerivativeResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, tokenId);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${tokenId} is already registered as IP.`);
      }
      if (request.derivData.parentIpIds.length !== request.derivData.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (let i = 0; i < request.derivData.parentIpIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: getAddress(request.derivData.parentIpIds[i], "request.derivData.parentIpIds"),
            licenseTemplate:
              (request.derivData.licenseTemplate &&
                getAddress(
                  request.derivData.licenseTemplate,
                  "request.derivData.licenseTemplate",
                )) ||
              this.licenseTemplateClient.address,
            licenseTermsId: BigInt(request.derivData.licenseTermsIds[i]),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms id ${request.derivData.licenseTermsIds[i]} must be attached to the parent ipId ${request.derivData.parentIpIds[i]} before registering derivative.`,
          );
        }
      }
      const calculatedDeadline = getDeadline(request.deadline);

      const sigRegisterSignature = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: this.getSigSignatureState({
          ipId: ipIdAddress,
          signer: getAddress(this.derivativeWorkflowsClient.address, "derivativeWorkflowsClient"),
          to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
          permission: AccessPermission.ALLOW,
          func: "function setAll(address,string,bytes32,bytes32)",
        }),
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: getAddress(this.derivativeWorkflowsClient.address, "derivativeWorkflowsClient"),
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: "function registerDerivative(address,address[],uint256[],address,bytes)",
          },
        ],
      });
      const object: DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        tokenId: BigInt(request.tokenId),
        derivData: {
          parentIpIds: request.derivData.parentIpIds.map((id) =>
            getAddress(id, "request.derivData.parentIpIds"),
          ),
          licenseTermsIds: request.derivData.licenseTermsIds.map((id) => BigInt(id)),
          licenseTemplate:
            (request.derivData.licenseTemplate &&
              getAddress(request.derivData.licenseTemplate, "request.derivData.licenseTemplate")) ||
            this.licenseTemplateClient.address,
          royaltyContext: zeroAddress,
        },
        sigRegister: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigRegisterSignature,
        },
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };
      const sigMetadataSignature = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: toHex(0, { size: 32 }),
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: getAddress(this.derivativeWorkflowsClient.address, "derivativeWorkflowsClient"),
            to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: "function setAll(address,string,bytes32,bytes32)",
          },
        ],
      });
      object.sigMetadata = {
        signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
        deadline: calculatedDeadline,
        signature: sigMetadataSignature,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.derivativeWorkflowsClient.registerIpAndMakeDerivativeEncode(object),
        };
      } else {
        const txHash = await this.derivativeWorkflowsClient.registerIpAndMakeDerivative(object);
        if (request.txOptions?.waitForTransaction) {
          const receipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
          return { txHash, ipId: log.ipId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }

  /**
   * Mint an NFT from a collection and register it as a derivative IP without license tokens.
   * @param request - The request object that contains all data needed to mint and register ip and make derivative.
   *   @param request.spgNftContract The address of the NFT collection.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *   @param request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *   @param request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *   @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async mintAndRegisterIpAndMakeDerivative(
    request: MintAndRegisterIpAndMakeDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
    try {
      if (request.derivData.parentIpIds.length !== request.derivData.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (let i = 0; i < request.derivData.parentIpIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: getAddress(request.derivData.parentIpIds[i], "request.derivData.parentIpIds"),
            licenseTemplate:
              (request.derivData.licenseTemplate &&
                getAddress(
                  request.derivData.licenseTemplate,
                  "request.derivData.licenseTemplate",
                )) ||
              this.licenseTemplateClient.address,
            licenseTermsId: BigInt(request.derivData.licenseTermsIds[i]),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms id ${request.derivData.licenseTermsIds[i]} must be attached to the parent ipId ${request.derivData.parentIpIds[i]} before registering derivative.`,
          );
        }
      }
      const object: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest = {
        ...request,
        derivData: {
          ...request.derivData,
          royaltyContext: zeroAddress,
          licenseTemplate: request.derivData.licenseTemplate || this.licenseTemplateClient.address,
          licenseTermsIds: request.derivData.licenseTermsIds.map((id) => BigInt(id)),
        },
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
        recipient:
          (request.recipient && getAddress(request.recipient, "request.recipient")) ||
          this.wallet.account!.address,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeEncode(object),
        };
      } else {
        const txHash = await this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivative(
          object,
        );
        if (request.txOptions?.waitForTransaction) {
          const receipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
          return { txHash, childIpId: log.ipId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative");
    }
  }
  /**
   * Mint an NFT from a SPGNFT collection and register it with metadata as an IP.
   * @param request - The request object that contains all data needed to attach license terms.
   *   @param request.spgNftContract The address of the SPGNFT collection.
   *   @param request.recipient The address of the recipient of the minted NFT.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.*
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, or if waitForTransaction is true, includes IP ID and Token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async mintAndRegisterIp(request: MintAndRegisterIpRequest): Promise<RegisterIpResponse> {
    try {
      const object: RegistrationWorkflowsMintAndRegisterIpRequest = {
        spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
        recipient:
          (request.recipient && getAddress(request.recipient, "request.recipient")) ||
          this.wallet.account!.address,
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.registrationWorkflowsClient.mintAndRegisterIpEncode(object) };
      } else {
        const txHash = await this.registrationWorkflowsClient.mintAndRegisterIp(object);
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const ipRegisterEvent = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
          return { txHash, ipId: ipRegisterEvent[0].ipId, tokenId: ipRegisterEvent[0].tokenId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP");
    }
  }
  /**
   * Register Programmable IP License Terms (if unregistered) and attach it to IP.
   * @param request - The request object that contains all data needed to attach license terms.
   *   @param request.ipId The ID of the IP.
   *   @param request.terms The PIL terms to be registered.
   *     @param request.terms.transferable Indicates whether the license is transferable or not.
   *     @param request.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *     @param request.terms.mintingFee The fee to be paid when minting a license.
   *     @param request.terms.expiration The expiration period of the license.
   *     @param request.terms.commercialUse Indicates whether the work can be used commercially or not.
   *     @param request.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *     @param request.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *     @param request.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *     @param request.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *     @param request.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *     @param request.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *     @param request.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *     @param request.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *     @param request.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *     @param request.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *     @param request.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *     @param request.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds,default is 1000ms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async registerPilTermsAndAttach(
    request: RegisterPilTermsAndAttachRequest,
  ): Promise<RegisterPilTermsAndAttachResponse> {
    try {
      //TODO: Invalid Signature registerIpAndAttachPilTerms
      const { ipId, terms } = request;
      const isRegistered = await this.isRegistered(ipId);
      if (!isRegistered) {
        throw new Error(`The IP with id ${ipId} is not registered.`);
      }
      const licenseTerms = await validateLicenseTerms(terms, this.rpcClient);
      const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({
        terms: licenseTerms,
      });
      if (licenseRes.selectedLicenseTermsId !== 0n) {
        throw new Error(
          `The license terms with id ${licenseRes.selectedLicenseTermsId} is already registered.`,
        );
      }
      const calculatedDeadline = getDeadline(request.deadline);
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, ipId);
      const { result: state } = await ipAccount.state();
      const sigAttachSignature = await getPermissionSignature({
        ipId: ipId,
        deadline: calculatedDeadline,
        state,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipId,
            signer: getAddress(
              this.licenseAttachmentWorkflowsClient.address,
              "licenseAttachmentWorkflowsClient",
            ),
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: "function attachLicenseTerms(address,address,uint256)",
          },
        ],
      });
      const object: LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest = {
        ipId: ipId,
        terms: licenseTerms,
        sigAttach: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: getDeadline(request.deadline),
          signature: sigAttachSignature,
        },
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.licenseAttachmentWorkflowsClient.registerPilTermsAndAttachEncode(object),
        };
      } else {
        const txHash = await this.licenseAttachmentWorkflowsClient.registerPilTermsAndAttach(
          object,
        );
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash, licenseTermsId: licenseRes.selectedLicenseTermsId };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register PIL terms and attach");
    }
  }
  /**
   *  Mint an NFT from a collection and register it as a derivative IP using license tokens
   * @param request - The request object that contains all data needed to mint and register ip and make derivative with license tokens.
   *   @param request.spgNftContract The address of the NFT collection.
   *   @param request.licenseTokenIds The IDs of the license tokens to be burned for linking the IP to parent IPs.
   *   @param request.royaltyContext The context for royalty module, should be empty for Royalty Policy LAP.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.recipient - [Optional] The address to receive the minted NFT.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, or if waitForTransaction is true, includes IP ID and Token ID.
   */
  public async mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
    request: MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterIpResponse> {
    try {
      //TODO: how to approve ERC721 token for license token
      if (request.licenseTokenIds.length === 0) {
        throw new Error("License token IDs must be provided.");
      }
      const licenseTokenIds = request.licenseTokenIds.map((id) => BigInt(id));
      for (const licenseTokenId of licenseTokenIds) {
        const tokenOwnerAddress = await this.licenseTokenReadOnlyClient.ownerOf({
          tokenId: licenseTokenId,
        });
        if (!tokenOwnerAddress) {
          throw new Error(`License token id ${licenseTokenId} must be owned by the caller.`);
        }
      }
      const object: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest =
        {
          spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
          recipient:
            (request.recipient && getAddress(request.recipient, "request.recipient")) ||
            this.wallet.account!.address,
          ipMetadata: {
            ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
            ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
            nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
            nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
          },
          licenseTokenIds: licenseTokenIds,
          royaltyContext: zeroAddress,
        };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokensEncode(
              object,
            ),
        };
      } else {
        const txHash =
          await this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
            object,
          );
        if (request.txOptions?.waitForTransaction) {
          const receipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
          return { txHash, ipId: log.ipId, tokenId: log.tokenId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative with license tokens");
    }
  }
  private async getIpIdAddress(
    nftContract: Address,
    tokenId: bigint | string | number,
  ): Promise<Address> {
    const ipId = await this.ipAssetRegistryClient.ipId({
      chainId: chain[this.chainId],
      tokenContract: getAddress(nftContract, "nftContract"),
      tokenId: BigInt(tokenId),
    });
    return ipId;
  }

  private async isRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: getAddress(ipId, "ipId") });
  }

  private getSigSignatureState(permission: Omit<SetPermissionsRequest, "txOptions">) {
    const data = encodeFunctionData({
      abi: accessControllerAbi,
      functionName: "setPermission",
      args: [
        getAddress(permission.ipId, "permission.ipId"),
        getAddress(permission.signer, "permission.signer"),
        getAddress(permission.to, "permission.to"),
        toFunctionSelector(permission.func!),
        permission.permission,
      ],
    });
    const sigAttachState = keccak256(
      encodeAbiParameters(
        [
          { name: "", type: "bytes32" },
          { name: "", type: "bytes" },
        ],
        [
          toHex(0, { size: 32 }),
          encodeFunctionData({
            abi: ipAccountImplAbi,
            functionName: "execute",
            args: [this.accessControllerClient.address, 0n, data],
          }),
        ],
      ),
    );
    return sigAttachState;
  }

  private async getLicenseTermsId(txReceipt: TransactionReceipt): Promise<bigint> {
    const licensingModuleLicenseTermsAttachedEvent =
      this.licensingModuleClient.parseTxLicenseTermsAttachedEvent(txReceipt);
    let licenseTermsId =
      licensingModuleLicenseTermsAttachedEvent.length >= 1 &&
      licensingModuleLicenseTermsAttachedEvent[0].licenseTermsId;
    if (licenseTermsId === false) {
      const defaultLicenseTerms = await this.licenseRegistryReadOnlyClient.getDefaultLicenseTerms();
      licenseTermsId = defaultLicenseTerms.licenseTermsId;
    }
    return licenseTermsId;
  }
}
