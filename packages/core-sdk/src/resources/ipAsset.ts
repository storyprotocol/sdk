import {
  Hex,
  PublicClient,
  zeroAddress,
  Address,
  zeroHash,
  WalletClient,
  toHex,
  encodeFunctionData,
  TransactionReceipt,
} from "viem";

import { chain, getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import {
  BatchMintAndRegisterIpAndMakeDerivativeRequest,
  BatchMintAndRegisterIpAndMakeDerivativeResponse,
  BatchMintAndRegisterIpAssetWithPilTermsRequest,
  BatchMintAndRegisterIpAssetWithPilTermsResponse,
  BatchRegisterDerivativeRequest,
  BatchRegisterDerivativeResponse,
  BatchRegisterRequest,
  BatchRegisterResponse,
  MintAndRegisterIpAssetWithPilTermsRequest,
  MintAndRegisterIpAssetWithPilTermsResponse,
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
  RegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  RegisterIpResponse,
  RegisterPilTermsAndAttachRequest,
  RegisterPilTermsAndAttachResponse,
  RegisterRequest,
  MintAndRegisterIpAndMakeDerivativeResponse,
  RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  DistributeRoyaltyTokens,
  RoyaltyShare,
  RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse,
  BatchMintAndRegisterIpAssetWithPilTermsResult,
  IpIdAndTokenId,
  RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse,
  MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest,
  MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse,
  MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse,
} from "../types/resources/ipAsset";
import {
  AccessControllerClient,
  CoreMetadataModuleClient,
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokens2Request,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  IpAccountImplClient,
  IpAssetRegistryClient,
  IpRoyaltyVaultImplReadOnlyClient,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTerms3Request,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTerms3Request,
  LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  LicensingModuleClient,
  Multicall3Client,
  PiLicenseTemplateClient,
  RegistrationWorkflowsClient,
  RegistrationWorkflowsMintAndRegisterIpRequest,
  RegistrationWorkflowsRegisterIpRequest,
  RoyaltyModuleEventClient,
  RoyaltyTokenDistributionWorkflowsClient,
  SimpleWalletClient,
  coreMetadataModuleAbi,
  ipAccountImplAbi,
  ipRoyaltyVaultImplAbi,
  licensingModuleAbi,
} from "../abi/generated";
import { getRevenueShare, validateLicenseTerms } from "../utils/licenseTermsHelper";
import { getDeadline, getPermissionSignature, getSignature } from "../utils/sign";
import { AccessPermission } from "../types/resources/permission";
import { LicenseTerms } from "../types/resources/license";
import { MAX_ROYALTY_TOKEN, royaltySharesTotalSupply } from "../constants/common";
import { getFunctionSignature } from "../utils/getFunctionSignature";

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
  public multicall3Client: Multicall3Client;
  public royaltyTokenDistributionWorkflowsClient: RoyaltyTokenDistributionWorkflowsClient;
  public royaltyModuleEventClient: RoyaltyModuleEventClient;

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
    this.royaltyTokenDistributionWorkflowsClient = new RoyaltyTokenDistributionWorkflowsClient(
      rpcClient,
      wallet,
    );
    this.royaltyModuleEventClient = new RoyaltyModuleEventClient(rpcClient);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
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
   *   @param {Array} params.socialMedia [Optional] An array of social media profiles associated with the creator.
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
   *   @param {Array} params.relationships [Optional] An array of relationships between this IP and its parent IPs.
   *     @param params.relationships[].ipId The ID of the parent IP.
   *     @param params.relationships[].type The type of relationship (e.g., "APPEARS_IN").
   *   @param params.createdAt [Optional] The creation date and time of the IP in ISO 8601 format.
   *   @param params.watermarkImg [Optional] The URL or path to an image used as a watermark for the IP.
   *   @param {Array} params.creators [Optional] An array of creators associated with the IP.
   *     @param params.creators[].name The name of the creator.
   *     @param params.creators[].address The address of the creator.
   *     @param params.creators[].description [Optional] A description of the creator.
   *     @param params.creators[].image [Optional] The URL or path to an image representing the creator.
   *     @param params.creators[].socialMedia [Optional] An array of social media profiles for the creator.
   *     @param params.creators[].socialMedia[].platform The social media platform name.
   *     @param params.creators[].socialMedia[].url The URL to the creator's profile.
   *     @param params.creators[].role [Optional] The role of the creator in relation to the IP.
   *     @param params.creators[].contributionPercent The percentage of contribution by the creator.
   *   @param {Array} params.media [Optional] An array of media related to the IP.
   *     @param params.media[].name The name of the media.
   *     @param params.media[].url The URL to the media.
   *     @param params.media[].mimeType The MIME type of the media.
   *   @param {Array} params.attributes [Optional] An array of key-value pairs providing additional metadata.
   *     @param params.attributes[].key The key for the attribute.
   *     @param params.attributes[].value The value for the attribute, can be a string or number.
   *   @param {Object} params.app [Optional] Information about the application associated with the IP.
   *     @param params.app.id The ID of the application.
   *     @param params.app.name The name of the application.
   *     @param params.app.website The website URL of the application.
   *   @param {Array} params.tags [Optional] An array of tags associated with the IP.
   *   @param {Object} params.robotTerms [Optional] Robot terms for the IP, specifying access rules.
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
      ...additionalProperties,
    };
  }

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request - The request object that contains all data needed to register IP.
   *   @param request.nftContract The address of the NFT.
   *   @param request.tokenId The token identifier of the NFT.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes IP ID, token ID.
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
        ipMetadata: this.getIpMetadata(request.ipMetadata),
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };
      if (request.ipMetadata) {
        const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
        const { signature } = await getPermissionSignature({
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
              func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
            },
          ],
        });
        object.sigMetadata = {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
        };
      }
      if (request.txOptions?.encodedTxDataOnly) {
        if (request.ipMetadata) {
          return { encodedTxData: this.registrationWorkflowsClient.registerIpEncode(object) };
        } else {
          return {
            encodedTxData: this.ipAssetRegistryClient.registerEncode({
              tokenContract: object.nftContract,
              tokenId: object.tokenId,
              chainid: BigInt(chain[this.chainId]),
            }),
          };
        }
      } else {
        let txHash: Hex;
        if (request.ipMetadata) {
          txHash = await this.registrationWorkflowsClient.registerIp(object);
        } else {
          txHash = await this.ipAssetRegistryClient.register({
            tokenContract: object.nftContract,
            tokenId: object.tokenId,
            chainid: BigInt(this.chainId),
          });
        }
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
          return { txHash, ...log };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register IP");
    }
  }

  /**
   * Batch registers an NFT as IP, creating a corresponding IP record.
   * @param request - The request object that contains all data needed to batch register IP.
   *  @param {Array} request.args The array of objects containing the data needed to register IP.
   *   @param request.args.nftContract The address of the NFT.
   *   @param request.args.tokenId The token identifier of the NFT.
   *   @param {Object} request.args.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *    @param request.args.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *    @param request.args.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *    @param request.args.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *    @param request.args.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxDataOnly option.
   * @returns A Promise that resolves to a transaction hash, if waitForTransaction is true, return an array of containing IP ID, Token ID, NFT Contract.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async batchRegister(request: BatchRegisterRequest): Promise<BatchRegisterResponse> {
    try {
      const contracts = [];
      let encodedTxData: Hex;
      for (const arg of request.args) {
        try {
          const result = await this.register({
            ...arg,
            txOptions: {
              encodedTxDataOnly: true,
            },
          });
          encodedTxData = result.encodedTxData!.data;
        } catch (error) {
          throw new Error((error as Error).message.replace("Failed to register IP:", "").trim());
        }
        const isSpg = !!arg.ipMetadata;
        contracts.push({
          target: isSpg
            ? this.registrationWorkflowsClient.address
            : this.ipAssetRegistryClient.address,
          allowFailure: false,
          callData: encodedTxData,
        });
      }
      const txHash = await this.multicall3Client.aggregate3({ calls: contracts });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const results = this.getIpIdAndTokenIdsFromEvent(txReceipt, "nftContract");
        return { txHash, results };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to batch register IP");
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
   *   @param {Array} request.parentIpIds The parent IP IDs.
   *   @param {Array} request.licenseTermsIds The IDs of the license terms that the parent IP supports.
   *   @param request.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *   @param request.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100000000).
   *   @param request.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
   *   @param request.licenseTemplate [Optional] The license template address.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data.
   */
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
    try {
      const req = {
        childIpId: getAddress(request.childIpId, "request.childIpId"),
        parentIpIds: request.parentIpIds,
        licenseTermsIds: request.licenseTermsIds.map((id) => BigInt(id)),
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        royaltyContext: zeroAddress,
        maxMintingFee: BigInt(request.maxMintingFee),
        maxRts: Number(request.maxRts),
        maxRevenueShare: getRevenueShare(request.maxRevenueShare),
      } as const;
      if (req.maxMintingFee < 0) {
        throw new Error(`maxMintingFee must be greater than 0.`);
      }
      if (req.maxRts < 0 || req.maxRts > MAX_ROYALTY_TOKEN) {
        throw new Error(`maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`);
      }
      const isChildIpIdRegistered = await this.isRegistered(req.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${req.childIpId} is not registered.`);
      }
      if (req.parentIpIds.length !== req.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (const [i, parentId] of req.parentIpIds.entries()) {
        const isParentIpIdRegistered = await this.isRegistered(
          getAddress(parentId, "request.parentIpIds"),
        );
        if (!isParentIpIdRegistered) {
          throw new Error(`The parent IP with id ${parentId} is not registered.`);
        }
        const { royaltyPercent } = await this.licenseRegistryReadOnlyClient.getRoyaltyPercent({
          ipId: getAddress(parentId, "request.parentIpIds"),
          licenseTemplate: req.licenseTemplate,
          licenseTermsId: req.licenseTermsIds[i],
        });
        if (req.maxRevenueShare !== 0 && royaltyPercent > req.maxRevenueShare) {
          throw new Error(
            `The royalty percent for the parent IP with id ${parentId} is greater than the maximum revenue share ${req.maxRevenueShare}.`,
          );
        }
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
   * Batch registers a derivative directly with parent IP's license terms.
   * @param request - The request object that contains all data needed to batch register derivative IP.
   *  @param {Array} request.args The array of objects containing the data needed to register derivative IP.
   *    @param request.args.childIpId The derivative IP ID.
   *    @param {Array} request.args.parentIpIds The parent IP IDs.
   *    @param {Array} request.args.licenseTermsIds The IDs of the license terms that the parent IP supports.
   *    @param request.args.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *    @param request.args.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100000000).
   *    @param request.args.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
   *  @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *  @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxDataOnly option.
   * @returns A Promise that resolves to a transaction hash.
   */
  public async batchRegisterDerivative(
    request: BatchRegisterDerivativeRequest,
  ): Promise<BatchRegisterDerivativeResponse> {
    try {
      const contracts = [];
      const licenseModuleAddress = getAddress(
        this.licensingModuleClient.address,
        "licensingModuleAddress",
      );
      for (const arg of request.args) {
        try {
          await this.registerDerivative({
            ...arg,
            txOptions: {
              encodedTxDataOnly: true,
            },
          });
        } catch (error) {
          throw new Error(
            (error as Error).message.replace("Failed to register derivative:", "").trim(),
          );
        }
        const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);

        const ipAccount = new IpAccountImplClient(
          this.rpcClient,
          this.wallet,
          getAddress(arg.childIpId, "arg.childIpId"),
        );
        const data = encodeFunctionData({
          abi: licensingModuleAbi,
          functionName: "registerDerivative",
          args: [
            arg.childIpId,
            arg.parentIpIds,
            arg.licenseTermsIds.map((id) => BigInt(id)),
            arg.licenseTemplate || this.licenseTemplateClient.address,
            zeroAddress,
            BigInt(arg.maxMintingFee),
            Number(arg.maxRts),
            getRevenueShare(arg.maxRevenueShare),
          ],
        });
        const { result: state } = await ipAccount.state();
        const { signature } = await getSignature({
          state,
          to: licenseModuleAddress,
          encodeData: data,
          wallet: this.wallet,
          verifyingContract: arg.childIpId,
          deadline: calculatedDeadline,
          chainId: chain[this.chainId],
        });
        contracts.push({
          target: arg.childIpId,
          allowFailure: false,
          callData: encodeFunctionData({
            abi: ipAccountImplAbi,
            functionName: "executeWithSig",
            args: [
              licenseModuleAddress,
              BigInt(0),
              data,
              this.wallet.account!.address,
              calculatedDeadline,
              signature,
            ],
          }),
        });
      }
      const txHash = await this.multicall3Client.aggregate3({ calls: contracts });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        return { txHash };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to batch register derivative");
    }
  }
  /**
   * Registers a derivative with license tokens. The derivative IP is registered with license tokens minted from the parent IP's license terms.
   * The license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * The caller must be the derivative IP owner or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative license tokens.
   *   @param request.childIpId The derivative IP ID.
   *   @param {Array} request.licenseTokenIds The IDs of the license tokens.
   *    @param request.args.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100000000).
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async registerDerivativeWithLicenseTokens(
    request: RegisterDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterDerivativeWithLicenseTokensResponse> {
    try {
      const req = {
        childIpId: getAddress(request.childIpId, "request.childIpId"),
        licenseTokenIds: request.licenseTokenIds.map((id) => BigInt(id)),
        royaltyContext: zeroAddress,
        maxRts: Number(request.maxRts),
      };
      if (req.maxRts < 0 || req.maxRts > MAX_ROYALTY_TOKEN) {
        throw new Error(`maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`);
      }
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      if (request.licenseTokenIds.length === 0) {
        throw new Error("licenseTokenIds must be provided.");
      }
      request.licenseTokenIds = await this.validateLicenseTokenIds(request.licenseTokenIds);

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
   *   @param {Array} request.terms The array of license terms to be attached.
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
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT,default value is your wallet address.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, including IP ID, Token ID, License Terms Ids.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async mintAndRegisterIpAssetWithPilTerms(
    request: MintAndRegisterIpAssetWithPilTermsRequest,
  ): Promise<MintAndRegisterIpAssetWithPilTermsResponse> {
    try {
      const licenseTerms: LicenseTerms[] = [];
      for (let i = 0; i < request.terms.length; i++) {
        const licenseTerm = await validateLicenseTerms(request.terms[i], this.rpcClient);
        licenseTerms.push(licenseTerm);
      }
      const object: LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTerms3Request = {
        spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
        recipient:
          (request.recipient && getAddress(request.recipient, "request.recipient")) ||
          this.wallet.account!.address,

        terms: licenseTerms,
        ipMetadata: this.getIpMetadata(request.ipMetadata),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms3Encode(object),
        };
      } else {
        const txHash =
          await this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms3(object);
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const ipIdAndTokenId = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
          const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
          return {
            txHash,
            ...ipIdAndTokenId,
            licenseTermsIds,
          };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and attach PIL terms");
    }
  }
  /**
   * Batch mint an NFT from a collection and register it as an IP.
   * @param request - The request object that contains all data needed to batch mint and register ip.
   *   @param {Array} request.args The array of mint and register IP requests.
   *     @param request.args.spgNftContract The address of the NFT collection.
   *     @param {Array} request.args.terms The array of license terms to be attached.
   *       @param request.args.terms.transferable Indicates whether the license is transferable or not.
   *       @param request.args.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *       @param request.args.terms.mintingFee The fee to be paid when minting a license.
   *       @param request.args.terms.expiration The expiration period of the license.
   *       @param request.args.terms.commercialUse Indicates whether the work can be used commercially or not.
   *       @param request.args.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *       @param request.args.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *       @param request.args.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *       @param request.args.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *       @param request.args.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *       @param request.args.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *       @param request.args.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *       @param request.args.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *       @param request.args.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *       @param request.args.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *       @param request.args.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *       @param request.args.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *     @param {Object} request.args.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *       @param request.args.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *       @param request.args.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *       @param request.args.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *       @param request.args.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *     @param request.args.recipient [Optional] The address of the recipient of the minted NFT,default value is your wallet address.
   *    @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxData option.
   * @returns A Promise that resolves to a transaction hash, if waitForTransaction is true, return an array containing IP ID, Token ID, License Terms Ids, SPG NFT Contract.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async batchMintAndRegisterIpAssetWithPilTerms(
    request: BatchMintAndRegisterIpAssetWithPilTermsRequest,
  ): Promise<BatchMintAndRegisterIpAssetWithPilTermsResponse> {
    try {
      const calldata: Hex[] = [];
      for (const arg of request.args) {
        const result = await this.mintAndRegisterIpAssetWithPilTerms({
          ...arg,
          txOptions: {
            encodedTxDataOnly: true,
          },
        });
        calldata.push(result.encodedTxData!.data);
      }
      const txHash = await this.licenseAttachmentWorkflowsClient.multicall({ data: calldata });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const results: BatchMintAndRegisterIpAssetWithPilTermsResult[] = this.ipAssetRegistryClient
          .parseTxIpRegisteredEvent(txReceipt)
          .map((log) => ({
            ipId: log.ipId,
            tokenId: log.tokenId,
            spgNftContract: log.tokenContract,
            licenseTermsIds: [],
          }));
        // Due to emit event log by sequence, we need to get license terms id from request.args
        for (let j = 0; j < request.args.length; j++) {
          const licenseTerms: LicenseTerms[] = [];
          const terms = request.args[j].terms;
          for (let i = 0; i < terms.length; i++) {
            const licenseTerm = await validateLicenseTerms(terms[i], this.rpcClient);
            licenseTerms.push(licenseTerm);
          }
          const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
          results[j].licenseTermsIds = licenseTermsIds;
        }
        return {
          txHash: txHash,
          results,
        };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to batch mint and register IP and attach PIL terms");
    }
  }
  /**
   * Register a given NFT as an IP and attach Programmable IP License Terms.R.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param {Array} request.terms The array of license terms to be attached.
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
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, if waitForTransaction is true, including IP ID, token ID and License terms IDs.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async registerIpAndAttachPilTerms(
    request: RegisterIpAndAttachPilTermsRequest,
  ): Promise<RegisterIpAndAttachPilTermsResponse> {
    try {
      request.tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, request.tokenId);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const licenseTerms: LicenseTerms[] = [];
      for (let i = 0; i < request.terms.length; i++) {
        const licenseTerm = await validateLicenseTerms(request.terms[i], this.rpcClient);
        licenseTerms.push(licenseTerm);
      }
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const { signature: sigMetadataSignature, nonce: sigMetadataState } =
        await getPermissionSignature({
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
              func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
            },
          ],
        });

      const { signature: sigAttachSignature } = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: sigMetadataState,
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
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
        ],
      });
      const object: LicenseAttachmentWorkflowsRegisterIpAndAttachPilTerms3Request = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        tokenId: request.tokenId,
        terms: licenseTerms,
        ipMetadata: this.getIpMetadata(request.ipMetadata),
        sigMetadata: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigMetadataSignature,
        },
        sigAttach: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigAttachSignature,
        },
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.licenseAttachmentWorkflowsClient.registerIpAndAttachPilTerms3Encode(object),
        };
      } else {
        const txHash = await this.licenseAttachmentWorkflowsClient.registerIpAndAttachPilTerms3(
          object,
        );
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
          return {
            txHash,
            licenseTermsIds: await this.getLicenseTermsId(licenseTerms),
            ...log,
          };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register IP and attach PIL terms");
    }
  }
  /**
   * @deprecated This method is deprecated and will be removed in the future.
   * Register the given NFT as a derivative IP with metadata without using license tokens.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, included IP ID, Token ID.
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
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const { signature: sigMetadataSignature, nonce: sigMetadataState } =
        await getPermissionSignature({
          ipId: ipIdAddress,
          deadline: calculatedDeadline,
          state: toHex(0, { size: 32 }),
          wallet: this.wallet as WalletClient,
          chainId: chain[this.chainId],
          permissions: [
            {
              ipId: ipIdAddress,
              signer: getAddress(
                this.derivativeWorkflowsClient.address,
                "derivativeWorkflowsClient",
              ),
              to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
              permission: AccessPermission.ALLOW,
              func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
            },
          ],
        });
      const { signature: sigRegisterSignature } = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: sigMetadataState,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: this.derivativeWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "registerDerivative"),
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
        ipMetadata: this.getIpMetadata(request.ipMetadata),
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };

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
          const log = this.getIpIdAndTokenIdsFromEvent(receipt)[0];
          return { txHash, ...log };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }
  /**
   * @deprecated This method is deprecated and will be removed in a future version
   * Mint an NFT from a collection and register it as a derivative IP without license tokens.
   * @param request - The request object that contains all data needed to mint and register ip and make derivative.
   *   @param request.spgNftContract The address of the NFT collection.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT,default value is your wallet address.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes child IP ID and token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async mintAndRegisterIpAndMakeDerivative(
    request: MintAndRegisterIpAndMakeDerivativeRequest,
  ): Promise<MintAndRegisterIpAndMakeDerivativeResponse> {
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
        ipMetadata: this.getIpMetadata(request.ipMetadata),
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
          const log = this.getIpIdAndTokenIdsFromEvent(receipt)[0];
          return { txHash, childIpId: log.ipId, tokenId: log.tokenId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative");
    }
  }
  /**
   * @deprecated This method is deprecated and will be removed in a future version
   * Batch mint an NFT from a collection and register it as a derivative IP without license tokens.
   * @param request - The request object that contains all data needed to batch mint and register ip and make derivative.
   *  @param {Array} request.args The array of mint and register IP requests.
   *   @param request.args.spgNftContract The address of the NFT collection.
   *   @param request.args.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.args.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param {Array} request.args.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.args.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param {Object} request.args.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.args.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.args.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.args.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.args.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.arg.recipient [Optional] The address of the recipient of the minted NFT,default value is your wallet address.
   *  @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxData option.
   * @returns A Promise that resolves to a transaction hash, if waitForTransaction is true, return an array of containing IP ID and token ID, SPG NFT Contract.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async batchMintAndRegisterIpAndMakeDerivative(
    request: BatchMintAndRegisterIpAndMakeDerivativeRequest,
  ): Promise<BatchMintAndRegisterIpAndMakeDerivativeResponse> {
    try {
      const calldata: Hex[] = [];
      for (const arg of request.args) {
        try {
          const result = await this.mintAndRegisterIpAndMakeDerivative({
            ...arg,
            txOptions: { encodedTxDataOnly: true },
          });
          calldata.push(result.encodedTxData!.data);
        } catch (error) {
          throw new Error(
            (error as Error).message
              .replace("Failed to mint and register IP and make derivative: ", "")
              .trim(),
          );
        }
      }
      const txHash = await this.derivativeWorkflowsClient.multicall({ data: calldata });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        return {
          txHash,
          results: this.getIpIdAndTokenIdsFromEvent(txReceipt, "spgNftContract"),
        };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to batch mint and register IP and make derivative");
    }
  }
  /**
   * Mint an NFT from a SPGNFT collection and register it with metadata as an IP.
   * @param request - The request object that contains all data needed to attach license terms.
   *   @param request.spgNftContract The address of the SPGNFT collection.
   *   @param request.recipient The address of the recipient of the minted NFT,default value is your wallet address.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
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
        ipMetadata: this.getIpMetadata(request.ipMetadata),
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
          const log = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
          return { txHash, ...log };
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
   *   @param {Array} request.terms The array of license terms to be attached.
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
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000s.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, returns an array containing the license terms ID.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async registerPilTermsAndAttach(
    request: RegisterPilTermsAndAttachRequest,
  ): Promise<RegisterPilTermsAndAttachResponse> {
    try {
      const { ipId, terms } = request;
      const isRegistered = await this.isRegistered(ipId);
      if (!isRegistered) {
        throw new Error(`The IP with id ${ipId} is not registered.`);
      }
      const licenseTerms: LicenseTerms[] = [];
      for (let i = 0; i < terms.length; i++) {
        const licenseTerm = await validateLicenseTerms(terms[i], this.rpcClient);
        licenseTerms.push(licenseTerm);
      }
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, ipId);
      const { result: state } = await ipAccount.state();
      const { signature: sigAttachSignature } = await getPermissionSignature({
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
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
        ],
      });
      const object: LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest = {
        ipId: ipId,
        terms: licenseTerms,
        sigAttach: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
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
          const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
          return { txHash, licenseTermsIds };
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
   * Requires caller to have the minter role or the SPG NFT to allow public minting. Caller must own the license tokens and have approved DerivativeWorkflows to transfer them.
   * @param request - The request object that contains all data needed to mint and register ip and make derivative with license tokens.
   *   @param request.spgNftContract The address of the NFT collection.
   *   @param request.licenseTokenIds The IDs of the license tokens to be burned for linking the IP to parent IPs.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.recipient - [Optional] The address to receive the minted NFT,default value is your wallet address.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, or if waitForTransaction is true, includes IP ID and Token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
    request: MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterIpResponse> {
    try {
      const licenseTokenIds = await this.validateLicenseTokenIds(request.licenseTokenIds);
      const object: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokens2Request =
        {
          spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
          recipient:
            (request.recipient && getAddress(request.recipient, "request.recipient")) ||
            this.wallet.account!.address,
          ipMetadata: this.getIpMetadata(request.ipMetadata),
          licenseTokenIds: licenseTokenIds,
          royaltyContext: zeroAddress,
        };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens2Encode(
              object,
            ),
        };
      } else {
        const txHash =
          await this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens2(
            object,
          );
        if (request.txOptions?.waitForTransaction) {
          const receipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.getIpIdAndTokenIdsFromEvent(receipt)[0];
          return { txHash, ...log };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative with license tokens");
    }
  }
  /**
   * @deprecated This method is deprecated and will be removed in the future.
   * Register the given NFT as a derivative IP using license tokens.
   * @param request - The request object that contains all data needed to register ip and make derivative with license tokens.
   *   @param request.nftContract The address of the NFT collection.
   *   @param {Array} request.licenseTokenIds The IDs of the license tokens to be burned for linking the IP to parent IPs.
   *   @param request.tokenId The ID of the NFT.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, or if waitForTransaction is true, includes IP ID, Token ID.
   */
  public async registerIpAndMakeDerivativeWithLicenseTokens(
    request: RegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, tokenId);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${tokenId} is already registered as IP.`);
      }
      const licenseTokenIds = await this.validateLicenseTokenIds(request.licenseTokenIds);
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const { signature: sigMetadataSignature, nonce: sigMetadataState } =
        await getPermissionSignature({
          ipId: ipIdAddress,
          deadline: calculatedDeadline,
          state: toHex(0, { size: 32 }),
          wallet: this.wallet as WalletClient,
          chainId: chain[this.chainId],
          permissions: [
            {
              ipId: ipIdAddress,
              signer: getAddress(
                this.derivativeWorkflowsClient.address,
                "derivativeWorkflowsClient",
              ),
              to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
              permission: AccessPermission.ALLOW,
              func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
            },
          ],
        });
      const { signature: sigRegisterSignature } = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: sigMetadataState,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: getAddress(this.derivativeWorkflowsClient.address, "derivativeWorkflowsClient"),
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "registerDerivativeWithLicenseTokens"),
          },
        ],
      });
      const object: DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
        ...request,
        tokenId,
        licenseTokenIds,
        royaltyContext: zeroAddress,
        ipMetadata: this.getIpMetadata(request.ipMetadata),
        sigMetadata: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigMetadataSignature,
        },
        sigRegister: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigRegisterSignature,
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.derivativeWorkflowsClient.registerIpAndMakeDerivativeWithLicenseTokensEncode(
              object,
            ),
        };
      } else {
        const txHash =
          await this.derivativeWorkflowsClient.registerIpAndMakeDerivativeWithLicenseTokens(object);
        if (request.txOptions?.waitForTransaction) {
          const receipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.getIpIdAndTokenIdsFromEvent(receipt)[0];
          return { txHash, ...log };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register IP and make derivative with license tokens");
    }
  }
  /**
   * Register the given NFT and attach license terms and distribute royalty tokens. In order to successfully distribute royalty tokens, the first license terms attached to the IP must be
   * a commercial license.
   * @param request - The request object that contains all data needed to register ip and attach license terms and distribute royalty tokens.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param {Array} request.terms The array of license terms to be attached.
   *     @param request.terms.transferable Indicates whether the license is transferable or not.
   *     @param request.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *     @param request.terms.mintingFee The fee to be paid when minting a license.
   *     @param request.terms.expiration The expiration period of the license.
   *     @param request.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
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
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *  @param {Array} request.royaltyShares Authors of the IP and their shares of the royalty tokens.
   *    @param request.royaltyShares.recipient The address of the recipient.
   *    @param request.royaltyShares.percentage The percentage of the royalty share, 10 represents 10%.
   *  @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *  @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxData option.
   * @returns A Promise that resolves to a transaction hashes, IP ID, IP royalty vault and an array containing the license terms ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits IpRoyaltyVaultDeployed (ipId, ipRoyaltyVault)
   */
  public async registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
    request: RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  ): Promise<RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse> {
    try {
      const { royaltyShares, totalAmount } = this.getRoyaltyShares(request.royaltyShares);
      const licenseTerms: LicenseTerms[] = [];
      for (let i = 0; i < request.terms.length; i++) {
        const term = request.terms[i];
        if (i === 0 && !term.commercialUse) {
          throw new Error("The first license term must be a commercial license.");
        }
        const licenseTerm = await validateLicenseTerms(term, this.rpcClient);
        licenseTerms.push(licenseTerm);
      }
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const ipIdAddress = await this.getIpIdAddress(
        getAddress(request.nftContract, "request.nftContract"),
        request.tokenId,
      );
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const { signature: sigMetadataSignature, nonce: sigMetadataState } =
        await getPermissionSignature({
          ipId: ipIdAddress,
          deadline: calculatedDeadline,
          state: toHex(0, { size: 32 }),
          wallet: this.wallet as WalletClient,
          chainId: chain[this.chainId],
          permissions: [
            {
              ipId: ipIdAddress,
              signer: getAddress(
                this.royaltyTokenDistributionWorkflowsClient.address,
                "royaltyTokenDistributionWorkflowsClient",
              ),
              to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
              permission: AccessPermission.ALLOW,
              func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
            },
          ],
        });
      const { signature: sigAttachSignature } = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: sigMetadataState,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: this.royaltyTokenDistributionWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
        ],
      });
      const registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash =
        await this.royaltyTokenDistributionWorkflowsClient.registerIpAndAttachPilTermsAndDeployRoyaltyVault(
          {
            nftContract: request.nftContract,
            tokenId: BigInt(request.tokenId),
            ipMetadata: this.getIpMetadata(request.ipMetadata),
            terms: licenseTerms,
            sigMetadata: {
              signer: this.wallet.account!.address,
              deadline: calculatedDeadline,
              signature: sigMetadataSignature,
            },
            sigAttach: {
              signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
              deadline: calculatedDeadline,
              signature: sigAttachSignature,
            },
          },
        );
      const txReceipt = await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash,
      });
      const { ipId } = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
      const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
      const { ipRoyaltyVault } =
        this.royaltyModuleEventClient.parseTxIpRoyaltyVaultDeployedEvent(txReceipt)[0];
      const distributeRoyaltyTokensTxHash = await this.distributeRoyaltyTokens({
        ipId,
        deadline: calculatedDeadline,
        ipRoyaltyVault,
        royaltyShares: royaltyShares,
        totalAmount: totalAmount,
        txOptions: request.txOptions,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: distributeRoyaltyTokensTxHash,
        });
      }
      return {
        registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash,
        distributeRoyaltyTokensTxHash,
        ipId,
        licenseTermsIds,
        ipRoyaltyVault,
      };
    } catch (error) {
      handleError(
        error,
        "Failed to register IP and attach license terms and distribute royalty tokens",
      );
    }
  }
  /**
   * Register the given NFT as a derivative IP and attach license terms and distribute royalty tokens.  In order to successfully distribute royalty tokens, the license terms attached to the IP must be
   * a commercial license.
   * @param request - The request object that contains all data needed to register derivative IP and distribute royalty tokens.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *     @param request.derivData.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100000000).
   *     @param request.derivData.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param {Array} request.royaltyShares Authors of the IP and their shares of the royalty tokens.
   *      @param request.royaltyShares.recipient The address of the recipient.
   *     @param request.royaltyShares.percentage The percentage of the royalty share, 10 represents 10%.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxData option.
   * @returns A Promise that resolves to a transaction hashes, IP ID and IP royalty vault, token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits IpRoyaltyVaultDeployed (ipId, ipRoyaltyVault)
   */
  public async registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens(
    request: RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  ): Promise<RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse> {
    try {
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, request.tokenId);
      const { signature } = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: toHex(0, { size: 32 }),
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissionFunc: "setBatchPermissions",
        permissions: [
          {
            ipId: ipIdAddress,
            signer: getAddress(
              this.royaltyTokenDistributionWorkflowsClient.address,
              "royaltyTokenDistributionWorkflowsClient",
            ),
            to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
          },
          {
            ipId: ipIdAddress,
            signer: this.royaltyTokenDistributionWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "registerDerivative"),
          },
        ],
      });
      const req = {
        nftContract: request.nftContract,
        tokenId: BigInt(request.tokenId),
        ipMetadata: this.getIpMetadata(request.ipMetadata),
        derivData: {
          ...request.derivData,
          licenseTemplate:
            (request.derivData.licenseTemplate &&
              getAddress(request.derivData.licenseTemplate, "request.derivData.licenseTemplate")) ||
            this.licenseTemplateClient.address,
          royaltyContext: zeroAddress,
          maxMintingFee: BigInt(request.derivData.maxMintingFee),
          maxRts: Number(request.derivData.maxRts),
          maxRevenueShare: getRevenueShare(request.derivData.maxRevenueShare),
        },
        sigMetadataAndRegister: {
          signer: this.wallet.account!.address,
          deadline: calculatedDeadline,
          signature: signature,
        },
      } as const;
      if (req.derivData.maxRts < 0 || req.derivData.maxRts > MAX_ROYALTY_TOKEN) {
        throw new Error(`maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`);
      }
      if (req.derivData.maxMintingFee < 0) {
        throw new Error(`maxMintingFee must be greater than 0.`);
      }
      const { royaltyShares, totalAmount } = this.getRoyaltyShares(request.royaltyShares);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      if (request.derivData.parentIpIds.length !== request.derivData.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (const [i, parentId] of request.derivData.parentIpIds.entries()) {
        const isParentIpRegistered = await this.isRegistered(parentId);
        if (!isParentIpRegistered) {
          throw new Error(`The parent IP with id ${parentId} is not registered.`);
        }
        const { royaltyPercent } = await this.licenseRegistryReadOnlyClient.getRoyaltyPercent({
          ipId: getAddress(parentId, "request.parentIpIds"),
          licenseTemplate: req.derivData.licenseTemplate,
          licenseTermsId: req.derivData.licenseTermsIds[i],
        });
        if (req.derivData.maxRevenueShare !== 0 && royaltyPercent > req.derivData.maxRevenueShare) {
          throw new Error(
            `The royalty percent for the parent IP with id ${parentId} is greater than the maximum revenue share ${req.derivData.maxRevenueShare}.`,
          );
        }
      }
      const txHash =
        await this.royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVault(
          req,
        );
      const txReceipt = await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      const { ipId, tokenId } = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
      const { ipRoyaltyVault } = this.royaltyModuleEventClient
        .parseTxIpRoyaltyVaultDeployedEvent(txReceipt)
        .filter((item) => item.ipId === ipId)[0];
      const distributeRoyaltyTokensTxHash = await this.distributeRoyaltyTokens({
        ipId,
        deadline: calculatedDeadline,
        ipRoyaltyVault,
        royaltyShares: royaltyShares,
        totalAmount: totalAmount,
        txOptions: request.txOptions,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: distributeRoyaltyTokensTxHash,
        });
      }
      return {
        registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: txHash,
        distributeRoyaltyTokensTxHash,
        ipId,
        tokenId,
        ipRoyaltyVault,
      };
    } catch (error) {
      handleError(
        error,
        "Failed to register derivative IP and attach license terms and distribute royalty tokens",
      );
    }
  }

  /**
   * Mint an NFT and register the IP, attach PIL terms, and distribute royalty tokens. In order to successfully distribute royalty tokens, First the license terms attached to the IP must be
   * a commercial license.
   * @param request - The request object that contains all data needed to mint an NFT and register the IP, attach PIL terms, and distribute royalty tokens.
   *   @param request.spgNftContract The address of the SPG NFT contract.
   *   @param {Array} request.terms The array of license terms to be attached.
   *     @param request.terms.transferable Indicates whether the license is transferable or not.
   *     @param request.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *     @param request.terms.mintingFee The fee to be paid when minting a license.
   *     @param request.terms.expiration The expiration period of the license.
   *     @param request.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
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
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *  @param {Array} request.royaltyShares Authors of the IP and their shares of the royalty tokens.
   *    @param request.royaltyShares.recipient The address of the recipient.
   *    @param request.royaltyShares.percentage The percentage of the royalty share, 10 represents 10%.
   *   @param request.recipient - [Optional] The address to receive the minted NFT,default value is your wallet address.
   *  @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxData option.
   * @returns A Promise that resolves to a transaction hash, IP ID, IP royalty vault, Token ID, and an array containing the license terms ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits IpRoyaltyVaultDeployed (ipId, ipRoyaltyVault)
   */
  public async mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
    request: MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest,
  ): Promise<MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse> {
    try {
      const licenseTerms: LicenseTerms[] = [];
      for (let i = 0; i < request.terms.length; i++) {
        const term = request.terms[i];
        if (i === 0 && !term.commercialUse) {
          throw new Error("First license term must be a commercial license.");
        }
        const licenseTerm = await validateLicenseTerms(term, this.rpcClient);
        licenseTerms.push(licenseTerm);
      }
      const { royaltyShares } = this.getRoyaltyShares(request.royaltyShares);
      const txHash =
        await this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
          {
            spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
            recipient:
              (request.recipient && getAddress(request.recipient, "request.recipient")) ||
              this.wallet.account!.address,
            ipMetadata: this.getIpMetadata(request.ipMetadata),
            terms: licenseTerms,
            royaltyShares,
          },
        );
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const { ipId, tokenId } = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
        const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
        const { ipRoyaltyVault } =
          this.royaltyModuleEventClient.parseTxIpRoyaltyVaultDeployedEvent(txReceipt)[0];
        return {
          txHash,
          ipId,
          licenseTermsIds,
          ipRoyaltyVault,
          tokenId,
        };
      }
      return { txHash };
    } catch (error) {
      handleError(
        error,
        "Failed to mint and register IP and attach PIL terms and distribute royalty tokens",
      );
    }
  }
  /**
   * Mint an NFT and register the IP, make a derivative, and distribute royalty tokens. In order to successfully distribute royalty tokens, the license terms attached to the IP must be
   * a commercial license.
   * @param request - The request object that contains all data needed to mint an NFT and register the IP, make a derivative, and distribute royalty tokens.
   *   @param request.spgNftContract The address of the SPG NFT collection.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *     @param  {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *     @param request.derivData.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies.
   *     @param request.derivData.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param {Array} request.royaltyShares Authors of the IP and their shares of the royalty tokens.
   *     @param request.royaltyShares.recipient The address of the recipient.
   *     @param request.royaltyShares.percentage The percentage of the royalty share, 10 represents 10%.
   *  @param request.allowDuplicates Set to true to allow minting an NFT with a duplicate metadata hash.
   *  @param request.recipient - [Optional] The address to receive the minted NFT,default value is your wallet address.
   *  @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property, without encodedTxData option..
   * @returns A Promise that resolves to a transaction hash, IP ID and token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
    request: MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  ): Promise<MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse> {
    try {
      const licenseTerms: bigint[] = [];
      for (const id of request.derivData.licenseTermsIds) {
        const licenseTermsId = BigInt(id);
        const { terms } = await this.licenseTemplateClient.getLicenseTerms({
          selectedLicenseTermsId: licenseTermsId,
        });
        if (!terms.commercialUse) {
          throw new Error(
            "The license terms attached to the IP must be a commercial license to distribute royalty tokens.",
          );
        }
        licenseTerms.push(licenseTermsId);
      }
      const { royaltyShares } = this.getRoyaltyShares(request.royaltyShares);
      const txHash =
        await this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
          {
            spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
            recipient:
              (request.recipient && getAddress(request.recipient, "request.recipient")) ||
              this.wallet.account!.address,
            ipMetadata: this.getIpMetadata(request.ipMetadata),
            derivData: {
              ...request.derivData,
              licenseTemplate:
                (request.derivData.licenseTemplate &&
                  getAddress(
                    request.derivData.licenseTemplate,
                    "request.derivData.licenseTemplate",
                  )) ||
                this.licenseTemplateClient.address,
              royaltyContext: zeroAddress,
              licenseTermsIds: licenseTerms,
              maxMintingFee: BigInt(request.derivData.maxMintingFee),
              maxRts: Number(request.derivData.maxRts),
              maxRevenueShare: Number(request.derivData.maxRevenueShare),
            },
            royaltyShares: royaltyShares,
            allowDuplicates: request.allowDuplicates,
          },
        );
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const { ipId, tokenId } = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
        return { txHash, ipId, tokenId };
      }
      return { txHash };
    } catch (error) {
      handleError(
        error,
        "Failed to mint and register IP and make derivative and distribute royalty tokens",
      );
    }
  }
  private getRoyaltyShares(royaltyShares: RoyaltyShare[]) {
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
  }

  private async distributeRoyaltyTokens(request: DistributeRoyaltyTokens): Promise<Hex> {
    const { ipId, deadline, ipRoyaltyVault, totalAmount } = request;
    const ipRoyaltyVaultImpl = new IpRoyaltyVaultImplReadOnlyClient(this.rpcClient, ipRoyaltyVault);
    const balance = await ipRoyaltyVaultImpl.balanceOf({ account: ipId });
    if (BigInt(balance) < BigInt(totalAmount)) {
      throw new Error(
        `The balance of the IP account in the IP Royalty Vault is insufficient to distribute the royalty tokens.`,
      );
    }
    const ipAccount = new IpAccountImplClient(
      this.rpcClient,
      this.wallet,
      getAddress(ipId, "arg.childIpId"),
    );
    const { result: state } = await ipAccount.state();
    const { signature: signatureApproveRoyaltyTokens } = await getSignature({
      verifyingContract: ipId,
      deadline: deadline,
      state,
      wallet: this.wallet as WalletClient,
      chainId: chain[this.chainId],
      to: ipRoyaltyVault,
      encodeData: encodeFunctionData({
        abi: ipRoyaltyVaultImplAbi,
        functionName: "approve",
        args: [this.royaltyTokenDistributionWorkflowsClient.address, BigInt(totalAmount)],
      }),
    });
    const txHash = await this.royaltyTokenDistributionWorkflowsClient.distributeRoyaltyTokens({
      ipId,
      royaltyShares: request.royaltyShares,
      sigApproveRoyaltyTokens: {
        signer: this.wallet.account!.address,
        deadline: deadline,
        signature: signatureApproveRoyaltyTokens,
      },
    });
    if (request.txOptions?.waitForTransaction) {
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      return txHash;
    }
    return txHash;
  }
  private async getIpIdAddress(
    nftContract: Address,
    tokenId: bigint | string | number,
  ): Promise<Address> {
    const ipId = await this.ipAssetRegistryClient.ipId({
      chainId: BigInt(chain[this.chainId]),
      tokenContract: getAddress(nftContract, "nftContract"),
      tokenId: BigInt(tokenId),
    });
    return ipId;
  }

  public async isRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: getAddress(ipId, "ipId") });
  }

  private async getLicenseTermsId(licenseTerms: LicenseTerms[]): Promise<bigint[]> {
    const licenseTermsIds: bigint[] = [];
    for (const licenseTerm of licenseTerms) {
      const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({
        terms: licenseTerm,
      });
      licenseTermsIds.push(licenseRes.selectedLicenseTermsId);
    }
    return licenseTermsIds;
  }

  private async validateLicenseTokenIds(
    licenseTokenIds: string[] | bigint[] | number[],
  ): Promise<bigint[]> {
    if (licenseTokenIds.length === 0) {
      throw new Error("License token IDs must be provided.");
    }
    const newLicenseTokenIds = licenseTokenIds.map((id) => BigInt(id));
    for (const licenseTokenId of newLicenseTokenIds) {
      const tokenOwnerAddress = await this.licenseTokenReadOnlyClient.ownerOf({
        tokenId: licenseTokenId,
      });
      if (!tokenOwnerAddress) {
        throw new Error(`License token id ${licenseTokenId} must be owned by the caller.`);
      }
    }
    return newLicenseTokenIds;
  }

  private getIpIdAndTokenIdsFromEvent<K extends "spgNftContract" | "nftContract" | undefined>(
    txReceipt: TransactionReceipt,
    key?: K,
  ): IpIdAndTokenId<K>[] {
    const IPRegisteredLog = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
    return IPRegisteredLog.map((log) => {
      const baseResult = { ipId: log.ipId, tokenId: log.tokenId };
      if (key) {
        return {
          ...baseResult,
          [key]: log.tokenContract,
        } as IpIdAndTokenId<K>;
      }
      return baseResult as IpIdAndTokenId<K>;
    });
  }

  private getIpMetadata(metadata?: {
    ipMetadataURI?: string;
    ipMetadataHash?: Hex;
    nftMetadataURI?: string;
    nftMetadataHash?: Hex;
  }) {
    return {
      ipMetadataURI: metadata?.ipMetadataURI || "",
      ipMetadataHash: metadata?.ipMetadataHash || zeroHash,
      nftMetadataURI: metadata?.nftMetadataURI || "",
      nftMetadataHash: metadata?.nftMetadataHash || zeroHash,
    };
  }

  private async getCalculatedDeadline(requestDeadline?: string | number | bigint): Promise<bigint> {
    const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
    return getDeadline(blockTimestamp, requestDeadline);
  }
}
