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
  InternalDerivativeData,
  LicenseTermsData,
  DerivativeData,
  CommonRegistrationHandlerParams,
} from "../types/resources/ipAsset";
import {
  AccessControllerClient,
  CoreMetadataModuleClient,
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  Erc20TokenClient,
  IpAccountImplClient,
  IpAssetRegistryClient,
  IpRoyaltyVaultImplReadOnlyClient,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
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
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest,
  SimpleWalletClient,
  SpgnftImplReadOnlyClient,
  coreMetadataModuleAbi,
  ipAccountImplAbi,
  ipRoyaltyVaultImplAbi,
  licensingModuleAbi,
} from "../abi/generated";
import { getRevenueShare, validateLicenseTerms } from "../utils/licenseTermsHelper";
import { getDeadline, getPermissionSignature, getSignature } from "../utils/sign";
import { AccessPermission } from "../types/resources/permission";
import {
  InnerLicensingConfig,
  LicenseTerms,
  RegisterPILTermsRequest,
} from "../types/resources/license";
import { MAX_ROYALTY_TOKEN, royaltySharesTotalSupply } from "../constants/common";
import { getFunctionSignature } from "../utils/getFunctionSignature";
import { LicensingConfig } from "../types/common";
import { validateLicenseConfig } from "../utils/validateLicenseConfig";
import { getIpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";
import {
  calculateLicenseWipMintFee,
  calculateSPGWipMintFee,
  contractCallWithWipFees,
} from "../utils/wipFeeUtils";
import { WipSpender } from "../types/utils/wip";

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
  public wipClient: Erc20TokenClient;
  public spgNftClient: SpgnftImplReadOnlyClient;

  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: SupportedChainIds;
  private readonly walletAddress: Address;

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
    this.wipClient = new Erc20TokenClient(rpcClient, wallet);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.spgNftClient = new SpgnftImplReadOnlyClient(rpcClient);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.walletAddress = this.wallet.account!.address;
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
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
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
   *   @param request.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   *   @param request.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
   *   @param request.licenseTemplate [Optional] The license template address, default value is Programmable IP License.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data.
   */
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
    try {
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      const derivativeData = await this.validateDerivativeData(request);
      const object = {
        childIpId: request.childIpId,
        ...derivativeData,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.licensingModuleClient.registerDerivativeEncode(object) };
      } else {
        const txHash = await this.licensingModuleClient.registerDerivative(object);
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
   *    @param request.args.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
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
   *    @param request.args.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
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
      this.validateMaxRts(req.maxRts);
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      if (request.licenseTokenIds.length === 0) {
        throw new Error("The licenseTokenIds must be provided.");
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
   *   @param request.allowDuplicates Indicates whether the license terms can be attached to the same IP ID or not.
   *   @param {Array} request.licenseTermsData The PIL terms and licensing configuration data to be attached to the IP.
   *     @param {Object} request.licenseTermsData.terms The PIL terms to be used for the licensing.
   *       @param request.licenseTermsData.terms.transferable Indicates whether the license is transferable or not.
   *       @param request.licenseTermsData.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *       @param request.licenseTermsData.terms.mintingFee The fee to be paid when minting a license.
   *       @param request.licenseTermsData.terms.expiration The expiration period of the license.
   *       @param request.licenseTermsData.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
   *       @param request.licenseTermsData.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *       @param request.licenseTermsData.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *       @param request.licenseTermsData.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *       @param request.licenseTermsData.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *       @param request.licenseTermsData.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *       @param request.licenseTermsData.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *       @param request.licenseTermsData.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *       @param request.licenseTermsData.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *       @param request.licenseTermsData.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *       @param request.licenseTermsData.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *       @param request.licenseTermsData.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *       @param request.licenseTermsData.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *     @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *       @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *       @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *       @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *       @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *       @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *       @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *       @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *       If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *       @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
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
      const { licenseTerms, licenseTermsData } = await this.validateLicenseTermsData(
        request.licenseTermsData,
      );
      const object: LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest = {
        spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
        recipient:
          (request.recipient && getAddress(request.recipient, "request.recipient")) ||
          this.wallet.account!.address,
        licenseTermsData,
        allowDuplicates: request.allowDuplicates,
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
      };

      const encodedTxData =
        this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTermsEncode(object);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }
      const contractCall = () => {
        return this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms(object);
      };
      const rsp = await this.commonRegistrationHandler({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgNftContract: object.spgNftContract,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
      if (rsp.receipt) {
        const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
        return { ...rsp, licenseTermsIds };
      } else {
        return rsp;
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
   *     @param request.allowDuplicates Indicates whether the license terms can be attached to the same IP ID or not.
   *     @param {Array} request.args.licenseTermsData The PIL terms and licensing configuration data to be attached to the IP.
   *       @param {Object} request.args.licenseTermsData.terms The PIL terms to be used for the licensing.
   *         @param request.args.licenseTermsData.terms.transferable Indicates whether the license is transferable or not.
   *         @param request.args.licenseTermsData.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *         @param request.args.licenseTermsData.terms.mintingFee The fee to be paid when minting a license.
   *         @param request.args.licenseTermsData.terms.expiration The expiration period of the license.
   *         @param request.args.licenseTermsData.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
   *         @param request.args.licenseTermsData.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *         @param request.args.licenseTermsData.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *         @param request.args.licenseTermsData.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *         @param request.args.licenseTermsData.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *         @param request.args.licenseTermsData.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *         @param request.args.licenseTermsData.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *         @param request.args.licenseTermsData.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *         @param request.args.licenseTermsData.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *         @param request.args.licenseTermsData.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *         @param request.args.licenseTermsData.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *         @param request.args.licenseTermsData.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *         @param request.args.licenseTermsData.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *       @param {Object} request.args.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *         @param request.args.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *         @param request.args.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *         @param request.args.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *         @param request.args.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *         @param request.args.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *         @param request.args.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *         @param request.args.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *         If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *         @param request.args.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
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
          const licenseTermsData = request.args[j].licenseTermsData;
          for (let i = 0; i < licenseTermsData.length; i++) {
            const licenseTerm = await validateLicenseTerms(
              licenseTermsData[i].terms,
              this.rpcClient,
            );
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
   *   @param {Array} request.licenseTermsData The PIL terms and licensing configuration data to be attached to the IP.
   *     @param {Object} request.licenseTermsData.terms The PIL terms to be used for the licensing.
   *       @param request.licenseTermsData.terms.transferable Indicates whether the license is transferable or not.
   *       @param request.licenseTermsData.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *       @param request.licenseTermsData.terms.mintingFee The fee to be paid when minting a license.
   *       @param request.licenseTermsData.terms.expiration The expiration period of the license.
   *       @param request.licenseTermsData.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
   *       @param request.licenseTermsData.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *       @param request.licenseTermsData.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *       @param request.licenseTermsData.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *       @param request.licenseTermsData.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *       @param request.licenseTermsData.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *       @param request.licenseTermsData.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *       @param request.licenseTermsData.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *       @param request.licenseTermsData.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *       @param request.licenseTermsData.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *       @param request.licenseTermsData.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *       @param request.licenseTermsData.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *       @param request.licenseTermsData.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *     @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *       @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *       @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *       @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *       @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *       @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *       @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *       @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *       If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *       @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
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
      const { licenseTerms, licenseTermsData } = await this.validateLicenseTermsData(
        request.licenseTermsData,
      );
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
              this.licenseAttachmentWorkflowsClient.address,
              "licenseAttachmentWorkflowsClient",
            ),
            to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
          },
          {
            ipId: ipIdAddress,
            signer: getAddress(
              this.licenseAttachmentWorkflowsClient.address,
              "licenseAttachmentWorkflowsClient",
            ),
            to: getAddress(this.licensingModuleClient.address, "licensingModuleClient"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
          {
            ipId: ipIdAddress,
            signer: this.licenseAttachmentWorkflowsClient.address,
            to: this.licensingModuleClient.address,
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
          },
        ],
      });

      const object: LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        tokenId: request.tokenId,
        licenseTermsData,
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        sigMetadataAndAttachAndConfig: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
        },
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
   * Register the given NFT as a derivative IP with metadata without using license tokens.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param {Object} request.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking, default value is Programmable IP License.
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
            signer: getAddress(this.derivativeWorkflowsClient.address, "derivativeWorkflowsClient"),
            to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
          },
          {
            ipId: ipIdAddress,
            signer: this.derivativeWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "registerDerivative"),
          },
        ],
      });
      const derivData = await this.validateDerivativeData(request.derivData);
      const object: DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        tokenId: BigInt(request.tokenId),
        derivData,
        sigMetadataAndRegister: {
          signer: this.walletAddress,
          deadline: calculatedDeadline,
          signature,
        },
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
      };
      const encodedTxData =
        this.derivativeWorkflowsClient.registerIpAndMakeDerivativeEncode(object);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }
      const contractCall = () => {
        return this.derivativeWorkflowsClient.registerIpAndMakeDerivative(object);
      };
      return this.commonRegistrationHandler({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }
  /**
   * Mint an NFT from a collection and register it as a derivative IP without license tokens.
   * @param request - The request object that contains all data needed to mint and register ip and make derivative.
   *   @param request.spgNftContract The address of the NFT collection.
   *   @param request.allowDuplicates Set to true to allow minting an NFT with a duplicate metadata hash.
   *   @param {Object} request.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking, default value is Programmable IP License.
   *     @param request.derivData.royaltyContext The address of the royalty context to be used for the linking, default value is zero address.
   *     @param request.derivData.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *     @param request.derivData.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   *     @param request.derivData.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
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
      const derivData = await this.validateDerivativeData(request.derivData);
      const recipient =
        (request.recipient && getAddress(request.recipient, "request.recipient")) ||
        this.walletAddress;
      const spgNftContract = getAddress(request.spgNftContract, "spgNftContract");
      const object: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest = {
        ...request,
        derivData,
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        recipient,
        allowDuplicates: request.allowDuplicates,
        spgNftContract,
      };
      const encodedTxData =
        this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeEncode(object);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }
      const contractCall = () => {
        return this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivative(object);
      };
      return this.commonRegistrationHandler({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        spgNftContract,
        derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative");
    }
  }
  /**
   * Batch mint an NFT from a collection and register it as a derivative IP without license tokens.
   * @param request - The request object that contains all data needed to batch mint and register ip and make derivative.
   *  @param {Array} request.args The array of mint and register IP requests.
   *   @param request.args.spgNftContract The address of the NFT collection.
   *   @param {Object} request.args.derivData The derivative data to be used for registerDerivative.
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
   *  @param request.allowDuplicates Set to true to allow minting an NFT with a duplicate metadata hash.
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
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        allowDuplicates: request.allowDuplicates,
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
   *   @param {Array} request.licenseTermsData The PIL terms and licensing configuration data to be attached to the IP.
   *     @param {Object} request.licenseTermsData.terms The PIL terms to be used for the licensing.
   *       @param request.licenseTermsData.terms.transferable Indicates whether the license is transferable or not.
   *       @param request.licenseTermsData.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *       @param request.licenseTermsData.terms.mintingFee The fee to be paid when minting a license.
   *       @param request.licenseTermsData.terms.expiration The expiration period of the license.
   *       @param request.licenseTermsData.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
   *       @param request.licenseTermsData.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *       @param request.licenseTermsData.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *       @param request.licenseTermsData.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *       @param request.licenseTermsData.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *       @param request.licenseTermsData.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *       @param request.licenseTermsData.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *       @param request.licenseTermsData.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *       @param request.licenseTermsData.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *       @param request.licenseTermsData.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *       @param request.licenseTermsData.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *       @param request.licenseTermsData.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *       @param request.licenseTermsData.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *     @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *       @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *       @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *       @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *       @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *       @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *       @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *       @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *       If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *       @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000s.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, returns an array containing the license terms ID.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async registerPilTermsAndAttach(
    request: RegisterPilTermsAndAttachRequest,
  ): Promise<RegisterPilTermsAndAttachResponse> {
    try {
      const { ipId } = request;
      const isRegistered = await this.isRegistered(ipId);
      if (!isRegistered) {
        throw new Error(`The IP with id ${ipId} is not registered.`);
      }
      const { licenseTerms, licenseTermsData } = await this.validateLicenseTermsData(
        request.licenseTermsData,
      );
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, ipId);
      const { result: state } = await ipAccount.state();
      const { signature } = await getPermissionSignature({
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
          {
            ipId: ipId,
            signer: getAddress(
              this.licenseAttachmentWorkflowsClient.address,
              "licenseAttachmentWorkflowsClient",
            ),
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
          },
        ],
      });
      const object: LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest = {
        ipId: ipId,
        licenseTermsData,
        sigAttachAndConfig: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
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
   *   @param {Array} request.licenseTokenIds The IDs of the license tokens to be burned for linking the IP to parent IPs.
   *   @param request.allowDuplicates Set to true to allow minting an NFT with a duplicate metadata hash.
   *   @param request.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
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
      const object: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest =
        {
          spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
          recipient:
            (request.recipient && getAddress(request.recipient, "request.recipient")) ||
            this.walletAddress,
          ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
          licenseTokenIds: licenseTokenIds,
          royaltyContext: zeroAddress,
          maxRts: Number(request.maxRts),
          allowDuplicates: request.allowDuplicates,
        };
      this.validateMaxRts(object.maxRts);

      const encodedTxData =
        this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokensEncode(
          object,
        );
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }
      const contractCall = async () => {
        return this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
          object,
        );
      };
      return this.commonRegistrationHandler({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgNftContract: object.spgNftContract,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        encodedTxs: [],
        contractCall,
        // need to disable multicall to avoid needing to transfer the license
        // token to the multicall contract.
        disableMultiCall: true,
        txOptions: request.txOptions,
      });
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative with license tokens");
    }
  }
  /**
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
      const { signature } = await getPermissionSignature({
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
            func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
          },
          {
            ipId: ipIdAddress,
            signer: this.derivativeWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleClient"),
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
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        sigMetadataAndRegister: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
        },
        maxRts: Number(request.maxRts),
      };
      this.validateMaxRts(object.maxRts);
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
   *   @param {Array} request.licenseTermsData The PIL terms and licensing configuration data to be attached to the IP.
   *     @param {Object} request.licenseTermsData.terms The PIL terms to be used for the licensing.
   *       @param request.licenseTermsData.terms.transferable Indicates whether the license is transferable or not.
   *       @param request.licenseTermsData.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *       @param request.licenseTermsData.terms.mintingFee The fee to be paid when minting a license.
   *       @param request.licenseTermsData.terms.expiration The expiration period of the license.
   *       @param request.licenseTermsData.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
   *       @param request.licenseTermsData.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *       @param request.licenseTermsData.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *       @param request.licenseTermsData.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *       @param request.licenseTermsData.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *       @param request.licenseTermsData.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *       @param request.licenseTermsData.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *       @param request.licenseTermsData.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *       @param request.licenseTermsData.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *       @param request.licenseTermsData.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *       @param request.licenseTermsData.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *       @param request.licenseTermsData.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *       @param request.licenseTermsData.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *     @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *       @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *       @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *       @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *       @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *       @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *       @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *       @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *       If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *       @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
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
      const { licenseTerms, licenseTermsData } = await this.validateLicenseTermsData(
        request.licenseTermsData,
      );
      const calculatedDeadline = await this.getCalculatedDeadline(request.deadline);
      const ipIdAddress = await this.getIpIdAddress(
        getAddress(request.nftContract, "request.nftContract"),
        request.tokenId,
      );
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
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
            to: getAddress(this.licensingModuleClient.address, "licensingModuleClient"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
          {
            ipId: ipIdAddress,
            signer: this.royaltyTokenDistributionWorkflowsClient.address,
            to: this.licensingModuleClient.address,
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
          },
        ],
      });
      const registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash =
        await this.royaltyTokenDistributionWorkflowsClient.registerIpAndAttachPilTermsAndDeployRoyaltyVault(
          {
            nftContract: request.nftContract,
            tokenId: BigInt(request.tokenId),
            ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
            licenseTermsData,
            sigMetadataAndAttachAndConfig: {
              signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
              deadline: calculatedDeadline,
              signature,
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
   *   @param {Object} request.derivData The derivative data to be used for registerDerivative.
   *     @param {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking, default value is Programmable IP License.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *     @param request.derivData.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
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
      const derivData = await this.validateDerivativeData(request.derivData);
      const object: RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest =
        {
          nftContract: request.nftContract,
          tokenId: BigInt(request.tokenId),
          ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
          derivData,
          sigMetadataAndRegister: {
            signer: this.walletAddress,
            deadline: calculatedDeadline,
            signature: signature,
          },
        } as const;
      const { royaltyShares, totalAmount } = this.getRoyaltyShares(request.royaltyShares);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const encodedTxData =
        this.royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVaultEncode(
          object,
        );
      const contractCall = () => {
        return this.royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVault(
          object,
        );
      };
      const { txHash, ipId, tokenId, receipt } = await this.commonRegistrationHandler({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: { ...request.txOptions, waitForTransaction: true },
      });
      if (tokenId === undefined || ipId === undefined) {
        throw new Error("Failed to register derivative ip and deploy royalty vault");
      }
      const { ipRoyaltyVault } = this.royaltyModuleEventClient
        .parseTxIpRoyaltyVaultDeployedEvent(receipt)
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
   * Mint an NFT and register the IP, attach PIL terms, and distribute royalty tokens.
   * @param request - The request object that contains all data needed to mint an NFT and register the IP, attach PIL terms, and distribute royalty tokens.
   *   @param request.spgNftContract The address of the SPG NFT contract.
   *   @param request.allowDuplicates Set to true to allow minting an NFT with a duplicate metadata hash.
   *   @param {Array} request.licenseTermsData The PIL terms and licensing configuration data to attach to the IP.
   *     @param {Object} request.licenseTermsData.terms The PIL terms to be attached.
   *       @param request.licenseTermsData.terms.transferable Indicates whether the license is transferable or not.
   *       @param request.licenseTermsData.terms.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *       @param request.licenseTermsData.terms.mintingFee The fee to be paid when minting a license.
   *       @param request.licenseTermsData.terms.expiration The expiration period of the license.
   *       @param request.licenseTermsData.terms.commercialUse Indicates whether the work can be used commercially or not, Commercial use is required to deploy a royalty vault.
   *       @param request.licenseTermsData.terms.commercialAttribution Whether attribution is required when reproducing the work commercially or not.
   *       @param request.licenseTermsData.terms.commercializerChecker Commercializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *       @param request.licenseTermsData.terms.commercializerCheckerData The data to be passed to the commercializer checker contract.
   *       @param request.licenseTermsData.terms.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *       @param request.licenseTermsData.terms.commercialRevCeiling The maximum revenue that can be generated from the commercial use of the work.
   *       @param request.licenseTermsData.terms.derivativesAllowed Indicates whether the licensee can create derivatives of his work or not.
   *       @param request.licenseTermsData.terms.derivativesAttribution Indicates whether attribution is required for derivatives of the work or not.
   *       @param request.licenseTermsData.terms.derivativesApproval Indicates whether the licensor must approve derivatives of the work before they can be linked to the licensor IP ID or not.
   *       @param request.licenseTermsData.terms.derivativesReciprocal Indicates whether the licensee must license derivatives of the work under the same terms or not.
   *       @param request.licenseTermsData.terms.derivativeRevCeiling The maximum revenue that can be generated from the derivative use of the work.
   *       @param request.licenseTermsData.terms.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *       @param request.licenseTermsData.terms.uri The URI of the license terms, which can be used to fetch the offchain license terms.
   *     @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *       @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *       @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *       @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *       @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *       @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *       @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *       @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *       If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *       @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
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
      const { licenseTerms, licenseTermsData } = await this.validateLicenseTermsData(
        request.licenseTermsData,
      );
      const { royaltyShares } = this.getRoyaltyShares(request.royaltyShares);
      const object: RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest =
        {
          spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
          recipient:
            (request.recipient && getAddress(request.recipient, "request.recipient")) ||
            this.walletAddress,
          ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
          licenseTermsData,
          royaltyShares,
          allowDuplicates: request.allowDuplicates,
        };
      const encodedTxData =
        this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensEncode(
          object,
        );
      const contractCall = () => {
        return this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
          object,
        );
      };
      const { txHash, ipId, tokenId, receipt } = await this.commonRegistrationHandler({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgNftContract: object.spgNftContract,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
      if (!receipt) {
        return { txHash };
      }
      const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
      const { ipRoyaltyVault } =
        this.royaltyModuleEventClient.parseTxIpRoyaltyVaultDeployedEvent(receipt)[0];
      return {
        txHash,
        ipId,
        licenseTermsIds,
        ipRoyaltyVault,
        tokenId,
      };
    } catch (error) {
      handleError(
        error,
        "Failed to mint and register IP and attach PIL terms and distribute royalty tokens",
      );
    }
  }
  /**
   * Mint an NFT and register the IP, make a derivative, and distribute royalty tokens.
   * @param request - The request object that contains all data needed to mint an NFT and register the IP, make a derivative, and distribute royalty tokens.
   *   @param request.spgNftContract The address of the SPG NFT collection.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *     @param  {Array} request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *     @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking, default value is Programmable IP License.
   *     @param {Array} request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *     @param request.derivData.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *     @param request.derivData.maxRts The maximum number of royalty tokens that can be distributed to the external royalty policies (max: 100,000,000).
   *     @param request.derivData.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
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
      const nftRecipient =
        (request.recipient && getAddress(request.recipient, "request.recipient")) ||
        this.walletAddress;
      const { royaltyShares } = this.getRoyaltyShares(request.royaltyShares);
      const derivData = await this.validateDerivativeData(request.derivData);
      const object: RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest =
        {
          spgNftContract: getAddress(request.spgNftContract, "request.spgNftContract"),
          recipient: nftRecipient,
          ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
          derivData,
          royaltyShares: royaltyShares,
          allowDuplicates: request.allowDuplicates,
        };

      const encodedTxData =
        this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensEncode(
          object,
        );
      const contractCall = () => {
        return this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
          object,
        );
      };
      return this.commonRegistrationHandler({
        spgNftContract: object.spgNftContract,
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
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
  private async getCalculatedDeadline(requestDeadline?: string | number | bigint): Promise<bigint> {
    const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
    return getDeadline(blockTimestamp, requestDeadline);
  }

  private validateMaxRts(maxRts: number) {
    if (isNaN(maxRts)) {
      throw new Error(`The maxRts must be a number.`);
    }
    if (maxRts < 0 || maxRts > MAX_ROYALTY_TOKEN) {
      throw new Error(`The maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`);
    }
  }

  private async validateDerivativeData(
    derivativeData: DerivativeData,
  ): Promise<InternalDerivativeData> {
    const internalDerivativeData: InternalDerivativeData = {
      parentIpIds: derivativeData.parentIpIds,
      licenseTermsIds: derivativeData.licenseTermsIds.map((id) => BigInt(id)),
      licenseTemplate:
        (derivativeData.licenseTemplate &&
          getAddress(derivativeData.licenseTemplate, "derivativeData.licenseTemplate")) ||
        this.licenseTemplateClient.address,
      royaltyContext: zeroAddress,
      maxMintingFee: BigInt(derivativeData.maxMintingFee),
      maxRts: Number(derivativeData.maxRts),
      maxRevenueShare: getRevenueShare(derivativeData.maxRevenueShare),
    };
    if (internalDerivativeData.parentIpIds.length === 0) {
      throw new Error("The parent IP IDs must be provided.");
    }
    if (internalDerivativeData.licenseTermsIds.length === 0) {
      throw new Error("The license terms IDs must be provided.");
    }
    if (
      internalDerivativeData.parentIpIds.length !== internalDerivativeData.licenseTermsIds.length
    ) {
      throw new Error("The number of parent IP IDs must match the number of license terms IDs.");
    }
    if (internalDerivativeData.maxMintingFee < 0) {
      throw new Error(`The maxMintingFee must be greater than 0.`);
    }
    this.validateMaxRts(internalDerivativeData.maxRts);
    for (let i = 0; i < internalDerivativeData.parentIpIds.length; i++) {
      const parentId = internalDerivativeData.parentIpIds[i];
      const isParentIpRegistered = await this.isRegistered(parentId);
      if (!isParentIpRegistered) {
        throw new Error(`The parent IP with id ${parentId} is not registered.`);
      }
      const isAttachedLicenseTerms =
        await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
          ipId: parentId,
          licenseTemplate: internalDerivativeData.licenseTemplate,
          licenseTermsId: internalDerivativeData.licenseTermsIds[i],
        });
      if (!isAttachedLicenseTerms) {
        throw new Error(
          `License terms id ${internalDerivativeData.licenseTermsIds[i]} must be attached to the parent ipId ${internalDerivativeData.parentIpIds[i]} before registering derivative.`,
        );
      }
      const { royaltyPercent } = await this.licenseRegistryReadOnlyClient.getRoyaltyPercent({
        ipId: parentId,
        licenseTemplate: internalDerivativeData.licenseTemplate,
        licenseTermsId: internalDerivativeData.licenseTermsIds[i],
      });
      if (
        internalDerivativeData.maxRevenueShare !== 0 &&
        royaltyPercent > internalDerivativeData.maxRevenueShare
      ) {
        throw new Error(
          `The royalty percent for the parent IP with id ${parentId} is greater than the maximum revenue share ${internalDerivativeData.maxRevenueShare}.`,
        );
      }
    }
    return internalDerivativeData;
  }

  private async validateLicenseTermsData(
    licenseTermsData: LicenseTermsData<RegisterPILTermsRequest, LicensingConfig>[],
  ): Promise<{
    licenseTerms: LicenseTerms[];
    licenseTermsData: LicenseTermsData<LicenseTerms, InnerLicensingConfig>[];
  }> {
    const licenseTerms: LicenseTerms[] = [];
    const processedLicenseTermsData: LicenseTermsData<LicenseTerms, InnerLicensingConfig>[] = [];
    for (let i = 0; i < licenseTermsData.length; i++) {
      const licenseTerm = await validateLicenseTerms(licenseTermsData[i].terms, this.rpcClient);
      const licensingConfig = validateLicenseConfig(licenseTermsData[i].licensingConfig);
      if (licensingConfig.mintingFee > 0 && licenseTerm.royaltyPolicy === zeroAddress) {
        throw new Error(
          "A royalty policy must be provided when the minting fee is greater than 0.",
        );
      }
      licenseTerms.push(licenseTerm);
      processedLicenseTermsData.push({
        terms: licenseTerm,
        licensingConfig: licensingConfig,
      });
    }
    return { licenseTerms, licenseTermsData: processedLicenseTermsData };
  }

  private async commonRegistrationHandler({
    sender,
    derivData,
    spgNftContract,
    spgSpenderAddress,
    txOptions,
    wipOptions,
    encodedTxs,
    disableMultiCall,
    contractCall,
  }: CommonRegistrationHandlerParams) {
    let totalFees = 0n;
    const wipSpenders: WipSpender[] = [];

    // get spg minting fee
    if (spgNftContract) {
      const nftMintFee = await calculateSPGWipMintFee(
        new SpgnftImplReadOnlyClient(this.rpcClient, spgNftContract),
      );
      totalFees += nftMintFee;
      wipSpenders.push({
        address: spgNftContract,
        amount: nftMintFee,
      });
    }

    // get derivative minting fee
    if (derivData) {
      let totalDerivativeMintingFee = 0n;
      for (let i = 0; i < derivData.parentIpIds.length; i++) {
        const derivativeMintingFee = await calculateLicenseWipMintFee({
          multicall3Client: this.multicall3Client,
          licenseTemplateClient: this.licenseTemplateClient,
          licensingModuleClient: this.licensingModuleClient,
          parentIpId: derivData.parentIpIds[i],
          licenseTermsId: derivData.licenseTermsIds[i],
          receiver: sender,
          amount: 1n,
        });
        totalDerivativeMintingFee += derivativeMintingFee;
      }
      totalFees += totalDerivativeMintingFee;
      if (totalDerivativeMintingFee > 0) {
        wipSpenders.push({
          address: spgSpenderAddress,
          amount: totalDerivativeMintingFee,
        });
      }
    }

    if (totalFees < 0) {
      throw new Error(
        `Total fees for registering derivative should never be negative: ${totalFees}`,
      );
    }

    const { txHash, receipt } = await contractCallWithWipFees({
      totalFees,
      wipOptions,
      multicall3Client: this.multicall3Client,
      rpcClient: this.rpcClient,
      wipClient: this.wipClient,
      wipSpenders,
      contractCall,
      disableMultiCall,
      sender,
      wallet: this.wallet,
      txOptions,
      encodedTxs,
    });
    if (receipt) {
      const { ipId, tokenId } = this.getIpIdAndTokenIdsFromEvent(receipt)[0];
      return { txHash, ipId, tokenId, receipt };
    } else {
      return { txHash };
    }
  }
}
