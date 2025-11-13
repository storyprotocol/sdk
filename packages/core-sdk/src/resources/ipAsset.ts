import {
  Address,
  encodeFunctionData,
  Hash,
  Hex,
  PublicClient,
  TransactionReceipt,
  zeroAddress,
  zeroHash,
} from "viem";

import {
  AccessControllerClient,
  CoreMetadataModuleClient,
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  EncodedTxData,
  ipAccountImplAbi,
  IpAccountImplClient,
  IpAssetRegistryClient,
  LicenseAttachmentWorkflowsClient,
  LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest,
  LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  licensingModuleAbi,
  LicensingModuleClient,
  Multicall3Client,
  PiLicenseTemplateClient,
  registrationWorkflowsAbi,
  RegistrationWorkflowsClient,
  RegistrationWorkflowsMintAndRegisterIpRequest,
  RegistrationWorkflowsRegisterIpRequest,
  RoyaltyModuleEventClient,
  RoyaltyTokenDistributionWorkflowsClient,
  RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest,
  SimpleWalletClient,
  SpgnftImplReadOnlyClient,
  TotalLicenseTokenLimitHookClient,
  WrappedIpClient,
} from "../abi/generated";
import { LicenseTermsIdInput, RevShareType } from "../types/common";
import { ChainIds } from "../types/config";
import { TransactionResponse } from "../types/options";
import {
  BatchMintAndRegisterIpAndMakeDerivativeRequest,
  BatchMintAndRegisterIpAndMakeDerivativeResponse,
  BatchMintAndRegisterIpAssetWithPilTermsRequest,
  BatchMintAndRegisterIpAssetWithPilTermsResponse,
  BatchMintAndRegisterIpAssetWithPilTermsResult,
  BatchMintAndRegisterIpRequest,
  BatchMintAndRegisterIpResponse,
  BatchRegisterDerivativeRequest,
  BatchRegisterDerivativeResponse,
  BatchRegisterIpAssetsWithOptimizedWorkflowsRequest,
  BatchRegisterIpAssetsWithOptimizedWorkflowsResponse,
  BatchRegisterRequest,
  BatchRegisterResponse,
  BatchRegistrationResult,
  CommonRegistrationParams,
  CommonRegistrationTxResponse,
  DistributeRoyaltyTokens,
  ExtraData,
  IpIdAndTokenId,
  LinkDerivativeResponse,
  MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest,
  MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse,
  MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse,
  MintAndRegisterIpAndMakeDerivativeRequest,
  MintAndRegisterIpAndMakeDerivativeResponse,
  MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  MintAndRegisterIpAssetWithPilTermsRequest,
  MintAndRegisterIpAssetWithPilTermsResponse,
  MintAndRegisterIpRequest,
  MintedNFT,
  MintNFT,
  RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse,
  RegisterDerivativeIpAssetRequest,
  RegisterDerivativeIpAssetResponse,
  RegisterDerivativeRequest,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse,
  RegisterIpAndAttachPilTermsRequest,
  RegisterIpAndAttachPilTermsResponse,
  RegisterIpAndMakeDerivativeRequest,
  RegisterIpAndMakeDerivativeResponse,
  RegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  RegisterIpAssetRequest,
  RegisterIpAssetResponse,
  RegisterIpResponse,
  RegisterRequest,
  TransformedIpRegistrationWorkflowRequest,
} from "../types/resources/ipAsset";
import { IpCreator, IpMetadata } from "../types/resources/ipMetadata";
import { LicenseTerms } from "../types/resources/license";
import { AggregateRegistrationRequest, SignatureMethodType } from "../types/utils/registerHelper";
import { TokenSpender } from "../types/utils/token";
import { calculateDerivativeMintingFee, calculateSPGMintFee } from "../utils/calculateMintFee";
import { handleError } from "../utils/errors";
import { contractCallWithFees } from "../utils/feeUtils";
import { generateOperationSignature } from "../utils/generateOperationSignature";
import { getIpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";
import { PILFlavor } from "../utils/pilFlavor";
import { handleMulticall } from "../utils/registrationUtils/registerHelper";
import {
  getCalculatedDeadline,
  getIpIdAddress,
  getPublicMinting,
  getRoyaltyShares,
  hasMinterRole,
  mergeSpenders,
  validateDerivativeData,
  validateLicenseTermsData,
  validateMaxRts,
} from "../utils/registrationUtils/registerValidation";
import {
  prepareRoyaltyTokensDistributionRequests,
  transferDistributeRoyaltyTokensRequest,
  transformRegistrationRequest,
} from "../utils/registrationUtils/transformRegistrationRequest";
import { getRevenueShare } from "../utils/royalty";
import { setMaxLicenseTokens } from "../utils/setMaxLicenseTokens";
import { validateAddress } from "../utils/utils";

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
  public wipClient: WrappedIpClient;
  public spgNftClient: SpgnftImplReadOnlyClient;
  public totalLicenseTokenLimitHookClient: TotalLicenseTokenLimitHookClient;

  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: ChainIds;
  private readonly walletAddress: Address;
  private readonly licenseTemplateAddress: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
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
    this.wipClient = new WrappedIpClient(rpcClient, wallet);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.spgNftClient = new SpgnftImplReadOnlyClient(rpcClient);
    this.totalLicenseTokenLimitHookClient = new TotalLicenseTokenLimitHookClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.walletAddress = this.wallet.account!.address;
    this.licenseTemplateAddress = this.licenseTemplateClient.address;
  }

  public generateCreatorMetadata(creator: IpCreator): IpCreator {
    return creator;
  }

  public generateIpMetadata(metadata: IpMetadata): IpMetadata {
    return metadata;
  }

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async register(request: RegisterRequest): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await getIpIdAddress({
        nftContract: request.nftContract,
        tokenId,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        return { ipId: ipIdAddress };
      }
      const object: RegistrationWorkflowsRegisterIpRequest = {
        tokenId,
        nftContract: validateAddress(request.nftContract),
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };
      if (request.ipMetadata) {
        const calculatedDeadline = await getCalculatedDeadline(this.rpcClient, request.deadline);
        const signature = await generateOperationSignature({
          ipIdAddress,
          methodType: SignatureMethodType.REGISTER,
          deadline: calculatedDeadline,
          wallet: this.wallet,
          chainId: this.chainId,
        });
        object.sigMetadata = {
          signer: validateAddress(this.walletAddress),
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
              chainid: BigInt(this.chainId),
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

        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const log = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
        return { txHash, ...log };
      }
    } catch (error) {
      return handleError(error, "Failed to register IP");
    }
  }

  /**
   * Batch registers an NFT as IP, creating a corresponding IP record.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async batchRegister(request: BatchRegisterRequest): Promise<BatchRegisterResponse> {
    try {
      const contracts = [];
      const spgContracts: Hex[] = [];
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

        if (arg.ipMetadata) {
          spgContracts.push(encodedTxData);
        } else {
          contracts.push({
            target: this.ipAssetRegistryClient.address,
            allowFailure: false,
            callData: encodedTxData,
          });
        }
      }
      let spgTxHash: Hex | undefined;
      let txHash: Hex | undefined;
      if (spgContracts.length > 0) {
        spgTxHash = await this.registrationWorkflowsClient.multicall({ data: spgContracts });
      }

      if (contracts.length > 0) {
        txHash = await this.multicall3Client.aggregate3({ calls: contracts });
      }
      const results: IpIdAndTokenId<"spgNftContract" | "nftContract">[] = [];
      const processTransaction = async (
        hash: Hex,
        contractType: "spgNftContract" | "nftContract",
      ): Promise<void> => {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash,
        });
        const eventResults = this.getIpIdAndTokenIdsFromEvent(txReceipt, contractType);
        results.push(...eventResults);
      };

      if (txHash) {
        await processTransaction(txHash, "nftContract");
      }

      if (spgTxHash) {
        await processTransaction(spgTxHash, "spgNftContract");
      }
      return {
        txHash,
        spgTxHash,
        results,
      };
    } catch (error) {
      return handleError(error, "Failed to batch register IP");
    }
  }

  /**
   * Registers a derivative directly with parent IP's license terms, without needing license tokens,
   * and attaches the license terms of the parent IPs to the derivative IP.
   * The license terms must be attached to the parent IP before calling this function.
   * All IPs attached default license terms by default.
   * The derivative IP owner must be the caller or an authorized operator.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link linkDerivative} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerDerivative({
   *   childIpId: '0x...',
   *   parentIpIds: ['0x...'],
   *   licenseTermsIds: [1n]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.linkDerivative({
   *   childIpId: '0x...',
   *   parentIpIds: ['0x...'],
   *   licenseTermsIds: [1n]
   * });
   * ```
   */
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<LinkDerivativeResponse> {
    try {
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      const derivativeData = await validateDerivativeData({
        derivativeDataInput: request,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const object = {
        childIpId: request.childIpId,
        ...derivativeData,
      };
      const encodedTxData = this.licensingModuleClient.registerDerivativeEncode(object);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      } else {
        const contractCall = (): Promise<Hash> => {
          return this.licensingModuleClient.registerDerivative(object);
        };
        return this.handleRegistrationWithFees({
          sender: this.walletAddress,
          derivData: object,
          contractCall,
          txOptions: request.txOptions,
          encodedTxs: [encodedTxData],
          spgSpenderAddress: this.royaltyModuleEventClient.address,
          options: {
            ...request.options,
            wipOptions: {
              ...request.options?.wipOptions,
              useMulticallWhenPossible: false,
            },
          },
        });
      }
    } catch (error) {
      return handleError(error, "Failed to register derivative");
    }
  }

  /**
   * Batch registers a derivative directly with parent IP's license terms.
   */
  public async batchRegisterDerivative(
    request: BatchRegisterDerivativeRequest,
  ): Promise<BatchRegisterDerivativeResponse> {
    try {
      const contracts = [];
      const licenseModuleAddress = validateAddress(this.licensingModuleClient.address);
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
        const calculatedDeadline = await getCalculatedDeadline(this.rpcClient, request.deadline);

        const ipAccount = new IpAccountImplClient(
          this.rpcClient,
          this.wallet,
          validateAddress(arg.childIpId),
        );
        const data = encodeFunctionData({
          abi: licensingModuleAbi,
          functionName: "registerDerivative",
          args: [
            arg.childIpId,
            arg.parentIpIds,
            arg.licenseTermsIds.map((id) => BigInt(id)),
            arg.licenseTemplate || this.licenseTemplateAddress,
            zeroAddress,
            BigInt(arg.maxMintingFee ?? 0),
            validateMaxRts(arg.maxRts),
            getRevenueShare(arg.maxRevenueShare ?? 100, RevShareType.MAX_REVENUE_SHARE),
          ],
        });
        const { result: state } = await ipAccount.state();
        const signature = await generateOperationSignature({
          ipIdAddress: arg.childIpId,
          methodType: SignatureMethodType.BATCH_REGISTER_DERIVATIVE,
          state,
          encodeData: data,
          deadline: calculatedDeadline,
          wallet: this.wallet,
          chainId: this.chainId,
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
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      return { txHash };
    } catch (error) {
      return handleError(error, "Failed to batch register derivative");
    }
  }

  /**
   * Registers a derivative with license tokens. The derivative IP is registered with license tokens minted from the parent IP's license terms.
   * The license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * The caller must be the derivative IP owner or an authorized operator.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link linkDerivative} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerDerivativeWithLicenseTokens({
   *   childIpId: '0x...',
   *   licenseTokenIds: [1n, 2n, 3n]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.linkDerivative({
   *   childIpId: '0x...',
   *   licenseTokenIds: [1n, 2n, 3n]
   * });
   * ```
   */
  public async registerDerivativeWithLicenseTokens(
    request: RegisterDerivativeWithLicenseTokensRequest,
  ): Promise<LinkDerivativeResponse> {
    try {
      const req = {
        childIpId: validateAddress(request.childIpId),
        licenseTokenIds: request.licenseTokenIds.map((id) => BigInt(id)),
        royaltyContext: zeroAddress,
        maxRts: validateMaxRts(request.maxRts),
      };
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
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        return { txHash: txHash };
      }
    } catch (error) {
      return handleError(error, "Failed to register derivative with license tokens");
    }
  }
  /**
   * Mint an NFT from a collection and register it as an IP.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
   *   spgNftContract: '0x...',
   *   licenseTermsData: [{ terms: PILFlavor.commercialRemix({...}) }]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerIpAsset({
   *   nft: { type: 'mint', spgNftContract: '0x...' },
   *   licenseTermsData: [{ terms: PILFlavor.commercialRemix({...}) }]
   * });
   * ```
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicensingModule.sol#L19 | `LicenseTermsAttached`} events.
   */
  public async mintAndRegisterIpAssetWithPilTerms(
    request: MintAndRegisterIpAssetWithPilTermsRequest,
  ): Promise<MintAndRegisterIpAssetWithPilTermsResponse> {
    try {
      const { transformRequest } =
        await transformRegistrationRequest<LicenseAttachmentWorkflowsMintAndRegisterIpAndAttachPilTermsRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );
      const encodedTxData =
        this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTermsEncode(
          transformRequest,
        );
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      const contractCall = (): Promise<Hash> => {
        return this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms(
          transformRequest,
        );
      };
      const rsp = await this.handleRegistrationWithFees({
        options: request.options,
        sender: this.walletAddress,
        spgNftContract: transformRequest.spgNftContract,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
      const computedLicenseTermsIds = await this.getLicenseTermsId(
        transformRequest.licenseTermsData.map((data) => data.terms),
      );
      const maxLicenseTokensTxHashes = await setMaxLicenseTokens({
        maxLicenseTokensData: request.licenseTermsData,
        licensorIpId: rsp.ipId!,
        licenseTermsIds: computedLicenseTermsIds,
        totalLicenseTokenLimitHookClient: this.totalLicenseTokenLimitHookClient,
        templateAddress: this.licenseTemplateAddress,
      });
      return {
        ...rsp,
        licenseTermsIds: computedLicenseTermsIds,
        ...(maxLicenseTokensTxHashes.length > 0 && {
          maxLicenseTokensTxHashes,
        }),
      };
    } catch (error) {
      return handleError(error, "Failed to mint and register IP and attach PIL terms");
    }
  }

  /**
   * Batch mint an NFT from a collection and register it as an IP.
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicensingModule.sol#L19 | `LicenseTermsAttached`} events.
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
          const licenseTerm = PILFlavor.validateLicenseTerms(
            licenseTermsData[i].terms,
            this.chainId,
          );
          licenseTerms.push(licenseTerm);
        }
        const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
        results[j].licenseTermsIds = licenseTermsIds;
        const maxLicenseTokensTxHashes = await setMaxLicenseTokens({
          maxLicenseTokensData: licenseTermsData,
          licensorIpId: results[j].ipId,
          licenseTermsIds,
          totalLicenseTokenLimitHookClient: this.totalLicenseTokenLimitHookClient,
          templateAddress: this.licenseTemplateAddress,
        });
        if (maxLicenseTokensTxHashes.length > 0) {
          results[j].maxLicenseTokensTxHashes = maxLicenseTokensTxHashes;
        }
      }
      return {
        txHash: txHash,
        results,
      };
    } catch (error) {
      return handleError(error, "Failed to batch mint and register IP and attach PIL terms");
    }
  }

  /**
   * Register a given NFT as an IP and attach Programmable IP License Terms.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerIpAndAttachPilTerms({
   *   nftContract: '0x...',
   *   tokenId: 123n,
   *   licenseTermsData: [{ terms: PILFlavor.nonCommercialSocialRemixing() }]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerIpAsset({
   *   nft: { type: 'minted', nftContract: '0x...', tokenId: 123n },
   *   licenseTermsData: [{ terms: PILFlavor.nonCommercialSocialRemixing() }]
   * });
   * ```
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicensingModule.sol#L19 | `LicenseTermsAttached`} events.
   */
  public async registerIpAndAttachPilTerms(
    request: RegisterIpAndAttachPilTermsRequest,
  ): Promise<RegisterIpAndAttachPilTermsResponse> {
    try {
      request.tokenId = BigInt(request.tokenId);
      const ipIdAddress = await getIpIdAddress({
        nftContract: request.nftContract,
        tokenId: request.tokenId,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const { licenseTerms } = await validateLicenseTermsData(
        request.licenseTermsData,
        this.rpcClient,
        this.chainId,
      );
      const { transformRequest } =
        await transformRegistrationRequest<LicenseAttachmentWorkflowsRegisterIpAndAttachPilTermsRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.licenseAttachmentWorkflowsClient.registerIpAndAttachPilTermsEncode(
              transformRequest,
            ),
        };
      } else {
        const txHash = await this.licenseAttachmentWorkflowsClient.registerIpAndAttachPilTerms(
          transformRequest,
        );
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const log = this.getIpIdAndTokenIdsFromEvent(txReceipt)[0];
        const licenseTermsIds = await this.getLicenseTermsId(licenseTerms);
        const maxLicenseTokensTxHashes = await setMaxLicenseTokens({
          maxLicenseTokensData: request.licenseTermsData,
          licensorIpId: log.ipId,
          licenseTermsIds,
          totalLicenseTokenLimitHookClient: this.totalLicenseTokenLimitHookClient,
          templateAddress: this.licenseTemplateAddress,
        });
        return {
          txHash,
          licenseTermsIds,
          ...(maxLicenseTokensTxHashes.length > 0 && { maxLicenseTokensTxHashes }),
          ...log,
        };
      }
    } catch (error) {
      return handleError(error, "Failed to register IP and attach PIL terms");
    }
  }

  /**
   * Register the given NFT as a derivative IP with metadata without using license tokens.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerDerivativeIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerDerivativeIp({
   *   nftContract: '0x...',
   *   tokenId: 123n,
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] }
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: 'minted', nftContract: '0x...', tokenId: 123n },
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] }
   * });
   * ```
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async registerDerivativeIp(
    request: RegisterIpAndMakeDerivativeRequest,
  ): Promise<RegisterIpAndMakeDerivativeResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await getIpIdAddress({
        nftContract: request.nftContract,
        tokenId,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${tokenId} is already registered as IP.`);
      }
      const { transformRequest } =
        await transformRegistrationRequest<DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest>({
          request,
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          chainId: this.chainId,
        });
      const encodedTxData =
        this.derivativeWorkflowsClient.registerIpAndMakeDerivativeEncode(transformRequest);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      const contractCall = (): Promise<Hash> => {
        return this.derivativeWorkflowsClient.registerIpAndMakeDerivative(transformRequest);
      };
      return this.handleRegistrationWithFees({
        options: {
          ...request.options,
          wipOptions: {
            ...request.options?.wipOptions,
            useMulticallWhenPossible: false,
          },
        },
        sender: this.walletAddress,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        derivData: transformRequest.derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      return handleError(error, "Failed to register derivative IP");
    }
  }

  /**
   * Mint an NFT from a collection and register it as a derivative IP without license tokens.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerDerivativeIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
   *   spgNftContract: '0x...',
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] }
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: 'mint', spgNftContract: '0x...' },
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] }
   * });
   * ```
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async mintAndRegisterIpAndMakeDerivative(
    request: MintAndRegisterIpAndMakeDerivativeRequest,
  ): Promise<MintAndRegisterIpAndMakeDerivativeResponse> {
    try {
      const spgNftContract = validateAddress(request.spgNftContract);
      const { transformRequest } =
        await transformRegistrationRequest<DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );
      const encodedTxData =
        this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeEncode(transformRequest);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      const contractCall = (): Promise<Hash> => {
        return this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivative(transformRequest);
      };
      return this.handleRegistrationWithFees({
        options: request.options,
        sender: this.walletAddress,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        spgNftContract,
        derivData: transformRequest.derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      return handleError(error, "Failed to mint and register IP and make derivative");
    }
  }

  /**
   * Batch mint an NFT from a collection and register it as a derivative IP without license tokens.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
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
      const txReceipt = await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      return {
        txHash,
        results: this.getIpIdAndTokenIdsFromEvent(txReceipt, "spgNftContract"),
      };
    } catch (error) {
      return handleError(error, "Failed to batch mint and register IP and make derivative");
    }
  }

  /**
   * Mint an NFT from a SPGNFT collection and register it with metadata as an IP.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.mintAndRegisterIp({
   *   spgNftContract: '0x...',
   *   recipient: '0x...'
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerIpAsset({
   *   nft: { type: 'mint', spgNftContract: '0x...', recipient: '0x...' }
   * });
   * ```
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async mintAndRegisterIp(request: MintAndRegisterIpRequest): Promise<RegisterIpResponse> {
    try {
      const object: RegistrationWorkflowsMintAndRegisterIpRequest = {
        spgNftContract: validateAddress(request.spgNftContract),
        recipient: validateAddress(request.recipient || this.walletAddress),
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        allowDuplicates: request.allowDuplicates || true,
      };
      const encodedTxData = this.registrationWorkflowsClient.mintAndRegisterIpEncode(object);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      const contractCall = (): Promise<Hash> => {
        return this.registrationWorkflowsClient.mintAndRegisterIp(object);
      };
      return this.handleRegistrationWithFees({
        sender: this.walletAddress,
        spgSpenderAddress: this.registrationWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        spgNftContract: object.spgNftContract,
        txOptions: request.txOptions,
        options: {
          ...request.options,
          wipOptions: {
            ...request.options?.wipOptions,
            useMulticallWhenPossible: false,
          },
        },
      });
    } catch (error) {
      return handleError(error, "Failed to mint and register IP");
    }
  }

  /**
   * Batch mints NFTs from SPGNFT collections and registers them as IP assets.
   *
   * Optimizes transaction processing by grouping requests and automatically selecting the most efficient multicall strategy:
   * - Uses `multicall3` for public minting contracts.
   * - Uses `SPG's multicall` for private minting contracts.
   *
   * @remark
   * For private minting, verifies the `caller` has the `minter role` and avoids `multicall3` batching to ensure correct `msg.sender`.
   *
   * Automatically manages minting fees, including wrapping IP tokens into WIP tokens if balances are insufficient, and checks or sets allowances for all spenders as needed.
   * The `multicall` and token handling behavior can be configured via `wipOptions`.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async batchMintAndRegisterIp(
    request: BatchMintAndRegisterIpRequest,
  ): Promise<BatchMintAndRegisterIpResponse> {
    try {
      const publicMintEncodedTxs: EncodedTxData[] = [];
      let publicMintSpenders: TokenSpender[] = [];
      const privateMintEncodedTxs: EncodedTxData[] = [];
      let privateMintSpenders: TokenSpender[] = [];
      for (const req of request.requests) {
        const registrationRequest: RegistrationWorkflowsMintAndRegisterIpRequest = {
          spgNftContract: validateAddress(req.spgNftContract),
          recipient: validateAddress(req.recipient || this.walletAddress),
          ipMetadata: getIpMetadataForWorkflow(req.ipMetadata),
          allowDuplicates: req.allowDuplicates || true,
        };
        const isPublicMinting = await getPublicMinting(req.spgNftContract, this.rpcClient);
        const nftMintFee = await calculateSPGMintFee(
          new SpgnftImplReadOnlyClient(this.rpcClient, registrationRequest.spgNftContract),
        );
        const encodeTx = {
          to: this.registrationWorkflowsClient.address,
          data: encodeFunctionData({
            abi: registrationWorkflowsAbi,
            functionName: "mintAndRegisterIp",
            args: [
              registrationRequest.spgNftContract,
              registrationRequest.recipient,
              registrationRequest.ipMetadata,
              registrationRequest.allowDuplicates,
            ],
          }),
        };
        if (isPublicMinting) {
          publicMintSpenders = mergeSpenders(
            publicMintSpenders,
            nftMintFee ? [{ address: registrationRequest.spgNftContract, ...nftMintFee }] : [],
          );
          publicMintEncodedTxs.push(encodeTx);
        } else {
          const isMinterRole = await hasMinterRole(
            registrationRequest.spgNftContract,
            this.rpcClient,
            this.walletAddress,
          );
          if (!isMinterRole) {
            throw new Error(
              `Caller ${this.walletAddress} does not have the minter role for ${registrationRequest.spgNftContract}`,
            );
          }
          privateMintSpenders = mergeSpenders(
            privateMintSpenders,
            nftMintFee ? [{ address: registrationRequest.spgNftContract, ...nftMintFee }] : [],
          );
          privateMintEncodedTxs.push(encodeTx);
        }
      }

      const handlePublicMintTransactions = async (): Promise<TransactionResponse> => {
        return await contractCallWithFees({
          options: { wipOptions: request.wipOptions, erc20Options: request.erc20Options },
          multicall3Address: this.multicall3Client.address,
          rpcClient: this.rpcClient,
          tokenSpenders: publicMintSpenders,
          contractCall: () =>
            this.registrationWorkflowsClient.multicall({
              data: publicMintEncodedTxs.map((tx) => tx.data),
            }),
          sender: this.walletAddress,
          wallet: this.wallet,
          txOptions: request.txOptions,
          encodedTxs: publicMintEncodedTxs,
        });
      };

      const handlePrivateMintTransactions = async (): Promise<TransactionResponse> => {
        return await contractCallWithFees({
          options: {
            wipOptions: { ...request.wipOptions, useMulticallWhenPossible: false },
            erc20Options: request.erc20Options,
          },
          multicall3Address: this.multicall3Client.address,
          rpcClient: this.rpcClient,
          tokenSpenders: privateMintSpenders,
          contractCall: () =>
            this.registrationWorkflowsClient.multicall({
              data: privateMintEncodedTxs.map((tx) => tx.data),
            }),
          sender: this.walletAddress,
          wallet: this.wallet,
          txOptions: request.txOptions,
          encodedTxs: privateMintEncodedTxs,
        });
      };
      let transactionResponses: TransactionResponse[] = [];
      if (privateMintEncodedTxs.length === 0) {
        transactionResponses = [await handlePublicMintTransactions()];
      } else if (publicMintEncodedTxs.length === 0) {
        transactionResponses = [await handlePrivateMintTransactions()];
      } else {
        const publicMintResponse = await handlePublicMintTransactions();
        const privateMintResponse = await handlePrivateMintTransactions();
        transactionResponses = [publicMintResponse, privateMintResponse];
      }
      return {
        registrationResults: transactionResponses.map((r) => ({
          txHash: r.txHash,
          receipt: r.receipt,
          ipIdsAndTokenIds: this.getIpIdAndTokenIdsFromEvent(r.receipt, "spgNftContract"),
        })),
      };
    } catch (error) {
      return handleError(error, "Failed to batch mint and register IP");
    }
  }

  /**
   * Mint an NFT from a collection and register it as a derivative IP using license tokens.
   * Requires caller to have the minter role or the SPG NFT to allow public minting. Caller must own the license tokens and have approved DerivativeWorkflows to transfer them.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerDerivativeIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
   *   spgNftContract: '0x...',
   *   licenseTokenIds: [1n, 2n, 3n]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: 'mint', spgNftContract: '0x...' },
   *   licenseTokenIds: [1n, 2n, 3n]
   * });
   * ```
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
    request: MintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterIpResponse> {
    try {
      const licenseTokenIds = await this.validateLicenseTokenIds(request.licenseTokenIds);
      const object: DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest =
        {
          spgNftContract: validateAddress(request.spgNftContract),
          recipient: validateAddress(request.recipient || this.walletAddress),
          ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
          licenseTokenIds: licenseTokenIds,
          royaltyContext: zeroAddress,
          maxRts: validateMaxRts(request.maxRts),
          allowDuplicates: request.allowDuplicates || true,
        };
      const encodedTxData =
        this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokensEncode(
          object,
        );
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      const contractCall = async (): Promise<Hash> => {
        return this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
          object,
        );
      };
      return this.handleRegistrationWithFees({
        options: {
          ...request.options,
          wipOptions: {
            ...request.options?.wipOptions,
            // need to disable multicall to avoid needing to transfer the license
            // token to the multicall contract.
            useMulticallWhenPossible: false,
          },
        },
        sender: this.walletAddress,
        spgNftContract: object.spgNftContract,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      return handleError(
        error,
        "Failed to mint and register IP and make derivative with license tokens",
      );
    }
  }

  /**
   * Register the given NFT as a derivative IP using license tokens.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerDerivativeIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerIpAndMakeDerivativeWithLicenseTokens({
   *   nftContract: '0x...',
   *   tokenId: 123n,
   *   licenseTokenIds: [1n, 2n, 3n]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: 'minted', nftContract: '0x...', tokenId: 123n },
   *   licenseTokenIds: [1n, 2n, 3n]
   * });
   * ```
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async registerIpAndMakeDerivativeWithLicenseTokens(
    request: RegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await getIpIdAddress({
        nftContract: request.nftContract,
        tokenId,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${tokenId} is already registered as IP.`);
      }
      const licenseTokenIds = await this.validateLicenseTokenIds(request.licenseTokenIds);
      const calculatedDeadline = await getCalculatedDeadline(this.rpcClient, request.deadline);
      const signature = await generateOperationSignature({
        ipIdAddress,
        methodType: SignatureMethodType.REGISTER_IP_AND_MAKE_DERIVATIVE_WITH_LICENSE_TOKENS,
        deadline: calculatedDeadline,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const object: DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest = {
        ...request,
        tokenId,
        licenseTokenIds,
        royaltyContext: zeroAddress,
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        sigMetadataAndRegister: {
          signer: validateAddress(this.walletAddress),
          deadline: calculatedDeadline,
          signature,
        },
        maxRts: validateMaxRts(request.maxRts),
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
        const receipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const log = this.getIpIdAndTokenIdsFromEvent(receipt)[0];
        return { txHash, ...log };
      }
    } catch (error) {
      return handleError(error, "Failed to register IP and make derivative with license tokens");
    }
  }

  /**
   * Register the given NFT and attach license terms and distribute royalty
   * tokens. In order to successfully distribute royalty tokens, the first
   * license terms attached to the IP must be a commercial license.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
   *   nftContract: '0x...',
   *   tokenId: 123n,
   *   licenseTermsData: [{ terms: PILFlavor.commercialRemix({...}) }],
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerIpAsset({
   *   nft: { type: 'minted', nftContract: '0x...', tokenId: 123n },
   *   licenseTermsData: [{ terms: PILFlavor.commercialRemix({...}) }],
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   * ```
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/royalty/IRoyaltyModule.sol#L88 | `IpRoyaltyVaultDeployed`} events.
   */
  public async registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens(
    request: RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  ): Promise<RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse> {
    try {
      const { royaltyShares, totalAmount } = getRoyaltyShares(request.royaltyShares);
      const { licenseTerms } = await validateLicenseTermsData(
        request.licenseTermsData,
        this.rpcClient,
        this.chainId,
      );
      const calculatedDeadline = await getCalculatedDeadline(this.rpcClient, request.deadline);
      const ipIdAddress = await getIpIdAddress({
        nftContract: validateAddress(request.nftContract),
        tokenId: BigInt(request.tokenId),
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const { transformRequest } =
        await transformRegistrationRequest<RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );
      const registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash =
        await this.royaltyTokenDistributionWorkflowsClient.registerIpAndAttachPilTermsAndDeployRoyaltyVault(
          transformRequest,
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
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: distributeRoyaltyTokensTxHash,
      });
      const maxLicenseTokensTxHashes = await setMaxLicenseTokens({
        maxLicenseTokensData: request.licenseTermsData,
        licensorIpId: ipId,
        licenseTermsIds,
        totalLicenseTokenLimitHookClient: this.totalLicenseTokenLimitHookClient,
        templateAddress: this.licenseTemplateAddress,
      });
      return {
        registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash,
        distributeRoyaltyTokensTxHash,
        ipId,
        licenseTermsIds,
        ipRoyaltyVault,
        ...(maxLicenseTokensTxHashes.length > 0 && { maxLicenseTokensTxHashes }),
      };
    } catch (error) {
      return handleError(
        error,
        "Failed to register IP and attach license terms and distribute royalty tokens",
      );
    }
  }

  /**
   * Register the given NFT as a derivative IP and attach license terms and distribute royalty tokens.  In order to successfully distribute royalty tokens, the license terms attached to the IP must be
   * a commercial license.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerDerivativeIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
   *   nftContract: '0x...',
   *   tokenId: 123n,
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] },
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: 'minted', nftContract: '0x...', tokenId: 123n },
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] },
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   * ```
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/royalty/IRoyaltyModule.sol#L88| `IpRoyaltyVaultDeployed`} events.
   */
  public async registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens(
    request: RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  ): Promise<RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse> {
    try {
      const ipIdAddress = await getIpIdAddress({
        nftContract: validateAddress(request.nftContract),
        tokenId: BigInt(request.tokenId),
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const { transformRequest } =
        await transformRegistrationRequest<RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );
      const { royaltyShares, totalAmount } = getRoyaltyShares(request.royaltyShares);
      const isRegistered = await this.isRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const encodedTxData =
        this.royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVaultEncode(
          transformRequest,
        );
      const contractCall = (): Promise<Hash> => {
        return this.royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVault(
          transformRequest,
        );
      };
      const { txHash, ipId, tokenId, receipt } = await this.handleRegistrationWithFees({
        options: {
          ...request.options,
          wipOptions: {
            ...request.options?.wipOptions,
            useMulticallWhenPossible: false,
          },
        },
        sender: this.walletAddress,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        derivData: transformRequest.derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: { ...request.txOptions },
      });
      // Need to consider tokenId is 0n, so we can't check !tokenId.
      if (tokenId === undefined || !ipId || !receipt) {
        throw new Error("Failed to register derivative ip and deploy royalty vault.");
      }
      const { ipRoyaltyVault } = this.royaltyModuleEventClient
        .parseTxIpRoyaltyVaultDeployedEvent(receipt)
        .filter((item) => item.ipId === ipId)[0];
      const distributeRoyaltyTokensTxHash = await this.distributeRoyaltyTokens({
        ipId,
        deadline: request.deadline,
        ipRoyaltyVault,
        royaltyShares: royaltyShares,
        totalAmount: totalAmount,
        txOptions: request.txOptions,
      });
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: distributeRoyaltyTokensTxHash,
      });
      return {
        registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: txHash,
        distributeRoyaltyTokensTxHash,
        ipId,
        tokenId,
        ipRoyaltyVault,
      };
    } catch (error) {
      return handleError(
        error,
        "Failed to register derivative IP and attach license terms and distribute royalty tokens",
      );
    }
  }

  /**
   * Mint an NFT and register the IP, attach PIL terms, and distribute royalty tokens.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
   *   spgNftContract: '0x...',
   *   licenseTermsData: [{ terms: PILFlavor.commercialRemix({...}) }],
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerIpAsset({
   *   nft: { type: 'mint', spgNftContract: '0x...' },
   *   licenseTermsData: [{ terms: PILFlavor.commercialRemix({...}) }],
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   * ```
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/royalty/IRoyaltyModule.sol#L88| `IpRoyaltyVaultDeployed`} events.
   */
  public async mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
    request: MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest,
  ): Promise<MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse> {
    try {
      const { licenseTerms } = await validateLicenseTermsData(
        request.licenseTermsData,
        this.rpcClient,
        this.chainId,
      );
      const { transformRequest } =
        await transformRegistrationRequest<RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );
      const encodedTxData =
        this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensEncode(
          transformRequest,
        );
      const contractCall = (): Promise<Hash> => {
        return this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
          transformRequest,
        );
      };
      const { txHash, ipId, tokenId, receipt } = await this.handleRegistrationWithFees({
        options: request.options,
        sender: this.walletAddress,
        spgNftContract: transformRequest.spgNftContract,
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
      const maxLicenseTokensTxHashes = await setMaxLicenseTokens({
        maxLicenseTokensData: request.licenseTermsData,
        licensorIpId: ipId!,
        licenseTermsIds,
        totalLicenseTokenLimitHookClient: this.totalLicenseTokenLimitHookClient,
        templateAddress: this.licenseTemplateAddress,
      });
      return {
        txHash,
        ipId,
        licenseTermsIds,
        ipRoyaltyVault,
        tokenId,
        ...(maxLicenseTokensTxHashes.length > 0 && { maxLicenseTokensTxHashes }),
      };
    } catch (error) {
      return handleError(
        error,
        "Failed to mint and register IP and attach PIL terms and distribute royalty tokens",
      );
    }
  }

  /**
   * Mint an NFT and register the IP, make a derivative, and distribute royalty tokens.
   *
   * @deprecated This method is deprecated. Please use the unified entry point {@link registerDerivativeIpAsset} instead.
   * This method will become internal soon.
   *
   * @example Migration Example
   * ```typescript
   * // Before (deprecated):
   * await client.ipAsset.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
   *   spgNftContract: '0x...',
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] },
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   *
   * // After (recommended):
   * await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: 'mint', spgNftContract: '0x...' },
   *   derivData: { parentIpIds: ['0x...'], licenseTermsIds: [1n] },
   *   royaltyShares: [{ recipient: '0x...', percentage: 100 }]
   * });
   * ```
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
    request: MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  ): Promise<MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse> {
    try {
      const { transformRequest } =
        await transformRegistrationRequest<RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest>(
          {
            request,
            rpcClient: this.rpcClient,
            wallet: this.wallet,
            chainId: this.chainId,
          },
        );

      const encodedTxData =
        this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensEncode(
          transformRequest,
        );
      const contractCall = (): Promise<Hash> => {
        return this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
          transformRequest,
        );
      };
      return await this.handleRegistrationWithFees({
        spgNftContract: transformRequest.spgNftContract,
        options: request.options,
        sender: this.walletAddress,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        derivData: transformRequest.derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      return handleError(
        error,
        "Failed to mint and register IP and make derivative and distribute royalty tokens",
      );
    }
  }

  private async distributeRoyaltyTokens(request: DistributeRoyaltyTokens): Promise<Hex> {
    const { transformRequest } =
      await transferDistributeRoyaltyTokensRequest<RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest>(
        {
          request,
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          chainId: this.chainId,
        },
      );
    const txHash = await this.royaltyTokenDistributionWorkflowsClient.distributeRoyaltyTokens(
      transformRequest,
    );
    await this.rpcClient.waitForTransactionReceipt({
      ...request.txOptions,
      hash: txHash,
    });
    return txHash;
  }

  public async isRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: validateAddress(ipId) });
  }

  /**
   * Batch register multiple IP assets in optimized transactions, supporting various registration methods:
   * - {@link mintAndRegisterIpAndMakeDerivative}
   * - {@link mintAndRegisterIpAssetWithPilTerms}
   * - {@link mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens}
   * - {@link mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens}
   * - {@link registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens}
   * - {@link registerIpAndAttachPilTerms}
   * - {@link registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens}
   * - {@link registerDerivativeIp}
   *
   * This method optimizes transaction processing by:
   * 1. Transforming all requests into appropriate workflow formats
   * 2. Grouping related workflow requests together
   * 3. Intelligently selecting between multicall3 and SPG's multicall based on compatibility
   *
   * The batching strategy significantly reduces gas costs and improves transaction throughput
   * by minimizing the number of separate blockchain transactions. It also handles complex
   * workflows like royalty token distribution automatically.
   *
   * The method supports automatic token handling for minting fees:
   * - If the wallet's IP token balance is insufficient to cover minting fees, it automatically wraps native IP tokens into WIP tokens.
   * - It checks allowances for all required spenders and automatically approves them if their current allowance is lower than needed.
   * - These automatic processes can be configured through the `options` parameter to control behavior like multicall usage and approval settings.
   *
   * @remark Multicall selection logic:
   *
   * 1. For `mintAndRegister*` methods:
   *    - When `spgNftContract` has public minting disabled: Uses SPG's multicall
   *    - When `spgNftContract` has public minting enabled: Uses multicall3
   *    - Exception: {@link mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens} always uses
   *      SPG's multicall due to contract logic
   *
   * 2. For `register*` methods:
   *    - Always uses SPG's multicall for batching registration operations
   *
   * Additionally, when multicall3 methods are used, transactions may be sequenced based on fee sufficiency and the presence of ERC20 tokens.
   * Note: If the provided fees fully cover all actions or any ERC20 tokens are involved in the batch, multicall3 cannot be used due to `msg.sender` context limitations.
   */
  public async batchRegisterIpAssetsWithOptimizedWorkflows(
    request: BatchRegisterIpAssetsWithOptimizedWorkflowsRequest,
  ): Promise<BatchRegisterIpAssetsWithOptimizedWorkflowsResponse> {
    try {
      // Transform requests into workflow format
      const transferWorkflowRequests: TransformedIpRegistrationWorkflowRequest[] = [];
      for (const req of request.requests) {
        const res = await transformRegistrationRequest({
          request: req,
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          chainId: this.chainId,
        });
        transferWorkflowRequests.push(res);
      }
      /**
       * Extract royalty distribution requests from workflow responses that contain royalty shares
       * We need to handle `distributeRoyaltyTokens` separately because this method requires
       * a signature with the royalty vault address, which is only available after the initial registration
       */
      const royaltyDistributionRequests = (
        transferWorkflowRequests.filter(
          (res) => res.extraData?.royaltyShares,
        ) as TransformedIpRegistrationWorkflowRequest<
          | RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest
          | RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest
        >[]
      ).map((res) => ({
        nftContract: res.transformRequest.nftContract,
        tokenId: res.transformRequest.tokenId,
        royaltyShares: res.extraData!.royaltyShares,
        deadline: res.extraData!.deadline,
      }));
      // Process initial registration transactions
      const { response: txResponses, aggregateRegistrationRequest } = await handleMulticall({
        transferWorkflowRequests,
        multicall3Address: this.multicall3Client.address,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        walletAddress: this.walletAddress,
        options: request.options,
        chainId: this.chainId,
      });
      const responses: BatchRegistrationResult[] = [];
      const royaltyTokensDistributionRequests: TransformedIpRegistrationWorkflowRequest[] = [];

      // Process each transaction response
      for (const { txHash, receipt } of txResponses) {
        const iPRegisteredLog = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt);
        const ipRoyaltyVaultEvent =
          this.royaltyModuleEventClient.parseTxIpRoyaltyVaultDeployedEvent(receipt);
        const ipRoyaltyVault = iPRegisteredLog
          .map((log) => {
            return ipRoyaltyVaultEvent.find((vault) => vault.ipId === log.ipId);
          })
          .filter((vault) => vault !== undefined);
        // Prepare royalty distribution if needed
        const royaltyTokensDistributionRequest = await prepareRoyaltyTokensDistributionRequests({
          royaltyDistributionRequests,
          ipRegisteredLog: iPRegisteredLog,
          ipRoyaltyVault: ipRoyaltyVaultEvent,
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          chainId: this.chainId,
        });

        royaltyTokensDistributionRequests.push(...royaltyTokensDistributionRequest);

        responses.push({
          txHash,
          receipt,
          ipRoyaltyVault,
          ipAssetsWithLicenseTerms: iPRegisteredLog.map((log) => {
            return {
              ipId: log.ipId,
              tokenId: log.tokenId,
            };
          }),
        });
      }
      let distributeRoyaltyTokensTxHashes: Hash[] | undefined;
      // Process royalty distribution transactions if any
      if (royaltyTokensDistributionRequests.length > 0) {
        const { response: txResponse } = await handleMulticall({
          transferWorkflowRequests: royaltyTokensDistributionRequests,
          multicall3Address: this.multicall3Client.address,
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          walletAddress: this.walletAddress,
          options: request.options,
          chainId: this.chainId,
        });
        distributeRoyaltyTokensTxHashes = txResponse.map((tx) => tx.txHash);
      }

      const registrationResults = await this.populateLicenseAndTokenIdsForRegistrationResults(
        responses,
        aggregateRegistrationRequest,
      );
      return {
        registrationResults,
        ...(distributeRoyaltyTokensTxHashes && { distributeRoyaltyTokensTxHashes }),
      };
    } catch (error) {
      return handleError(error, "Failed to batch register IP assets with optimized workflows");
    }
  }
  /**
   * Register an IP asset, supporting both minted and mint-on-demand NFTs, with optional `licenseTermsData` and `royaltyShares`.
   *
   * This method automatically selects and calls the appropriate workflow from 6 available methods based on your input parameters.
   * Here are three common usage patterns:
   *
   * **1. Minted NFT with License Terms and Royalty Distribution:**
   * ```typescript
   * const result = await client.ipAsset.registerIpAsset({
   *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n },
   *   licenseTermsData: [
   *     {
   *       terms: PILFlavor.commercialRemix({
   *         defaultMintingFee: 10000n,
   *         commercialRevShare: 100,
   *         currency: "0x..."
   *       })
   *     }
   *   ],
   *   royaltyShares: [
   *     { recipient: "0x...", percentage: 100 }
   *   ]
   * });
   * ```
   *
   * **2. Minted NFT with Basic License Terms:**
   * ```typescript
   * const result = await client.ipAsset.registerIpAsset({
   *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n },
   *   licenseTermsData: [
   *     {
   *       terms: PILFlavor.nonCommercialSocialRemixing()
   *     }
   *   ]
   * });
   * ```
   *
   * **3. Mint NFT with IP Asset:**
   * ```typescript
   * const result = await client.ipAsset.registerIpAsset({
   *   nft: { type: "mint", spgNftContract: "0x...", recipient: "0x...", allowDuplicates: false },
   * });
   * ```
   *
   * **Supported Workflows (6 methods automatically selected based on parameters):**
   * - {@link registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens} - Register IP with license terms and royalty distribution
   * - {@link registerIpAndAttachPilTerms} - Register IP with license terms
   * - {@link register} - Register basic IP asset
   * - {@link mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens} - Mint NFT and register IP with license terms and royalty distribution
   * - {@link mintAndRegisterIpAssetWithPilTerms} - Mint NFT and register IP with license terms
   * - {@link mintAndRegisterIp} - Mint NFT and register basic IP asset
   *
   * **Automatic Token Handling:**
   * - If the wallet's IP token balance is insufficient to cover minting fees, it automatically wraps native IP tokens into WIP tokens.
   * - It checks allowances for all required spenders and automatically approves them if their current allowance is lower than needed.
   * - These automatic processes can be configured through the `options` parameter to control behavior like multicall usage and approval settings.
   *
   * @throws {Error} If the NFT type is invalid.
   * @throws {Error} If `licenseTermsData` is not provided when `royaltyShares` are specified.
   *
   */
  public async registerIpAsset<T extends RegisterIpAssetRequest<MintedNFT | MintNFT>>(
    request: T,
  ): Promise<RegisterIpAssetResponse<T>> {
    try {
      const { nft, licenseTermsData, royaltyShares } = request;

      // Validate royalty shares without license terms
      if (royaltyShares && !licenseTermsData) {
        throw new Error("License terms data must be provided when royalty shares are specified.");
      }

      if (nft.type === "minted") {
        return (await this.handleMintedNftRegistration(
          request as RegisterIpAssetRequest<MintedNFT>,
        )) as RegisterIpAssetResponse<T>;
      } else if (nft.type === "mint") {
        return (await this.handleMintNftRegistration(
          request as RegisterIpAssetRequest<MintNFT>,
        )) as RegisterIpAssetResponse<T>;
      } else {
        throw new Error("Invalid NFT type");
      }
    } catch (error) {
      return handleError(error, "Failed to register IP Asset");
    }
  }
  /**
   * Register a derivative IP asset, supporting both minted and mint-on-demand NFTs, with optional `derivData`, `royaltyShares` and `licenseTokenIds`.
   *
   * This method automatically selects and calls the appropriate workflow from 6 available methods based on your input parameters.
   * Here are three common usage patterns:
   *
   * **1. Minted NFT with License Terms and Royalty Distribution:**
   * ```typescript
   * const result = await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n },
   *   derivData: {
   *     parentIpIds: ["0x..."],
   *     licenseTermsIds: [1n],
   *     maxMintingFee: 10000n,
   *     maxRevenueShare: 100
   *   },
   *   royaltyShares: [
   *     { recipient: "0x...", percentage: 100 }
   *   ]
   * });
   * ```
   *
   * **2. Minted NFT with Basic Derivative Registration:**
   * ```typescript
   * const result = await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: "minted", nftContract: "0x...", tokenId: 1n },
   *   derivData: {
   *     parentIpIds: ["0x..."],
   *     licenseTermsIds: [1n],
   *     maxMintingFee: 10000n,
   *     maxRevenueShare: 100
   *   }
   * });
   * ```
   *
   * **3. Mint NFT with License Token IDs:**
   * ```typescript
   * const result = await client.ipAsset.registerDerivativeIpAsset({
   *   nft: { type: "mint", spgNftContract: "0x...", recipient: "0x...", allowDuplicates: false },
   *   licenseTokenIds: [1, 2, 3],
   * });
   * ```
   *
   * **Supported Workflows (6 methods automatically selected based on parameters):**
   * - {@link registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens} - Register derivative with license terms and royalty distribution
   * - {@link registerDerivativeIp} - Register derivative with basic derivative data
   * - {@link registerIpAndMakeDerivativeWithLicenseTokens} - Register derivative using existing license tokens
   * - {@link mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens} - Mint NFT and register as derivative with royalty distribution
   * - {@link mintAndRegisterIpAndMakeDerivative} - Mint NFT and register as derivative
   * - {@link mintAndRegisterIpAndMakeDerivativeWithLicenseTokens} - Mint NFT and register as derivative using license tokens
   *
   * **Automatic Token Handling:**
   * - If the wallet's IP token balance is insufficient to cover minting fees, it automatically wraps native IP tokens into WIP tokens.
   * - It checks allowances for all required spenders and automatically approves them if their current allowance is lower than needed.
   * - These automatic processes can be configured through the `options` parameter to control behavior like multicall usage and approval settings.
   *
   * @throws {Error} If `derivData` is not provided when `royaltyShares` are provided.
   * @throws {Error} If neither `derivData` nor `licenseTokenIds` are provided.
   * @throws {Error} If the NFT type is invalid.
   */
  public async registerDerivativeIpAsset<
    T extends RegisterDerivativeIpAssetRequest<MintedNFT | MintNFT>,
  >(request: T): Promise<RegisterDerivativeIpAssetResponse<T>> {
    try {
      const { nft, licenseTokenIds, royaltyShares, derivData } = request;
      if (royaltyShares && !derivData) {
        throw new Error("derivData must be provided when royaltyShares are provided.");
      }

      // Validate that at least one valid combination is provided
      const hasDerivData = !!derivData;
      const hasLicenseTokens = !!(licenseTokenIds && licenseTokenIds.length > 0);

      if (!hasDerivData && !hasLicenseTokens) {
        throw new Error("Either derivData or licenseTokenIds must be provided.");
      }

      if (nft.type === "minted") {
        return (await this.handleMintedNftDerivativeRegistration(
          request as RegisterDerivativeIpAssetRequest<MintedNFT>,
        )) as RegisterDerivativeIpAssetResponse<T>;
      } else if (nft.type === "mint") {
        return (await this.handleMintNftDerivativeRegistration(
          request as RegisterDerivativeIpAssetRequest<MintNFT>,
        )) as RegisterDerivativeIpAssetResponse<T>;
      } else {
        throw new Error("Invalid NFT type.");
      }
    } catch (error) {
      return handleError(error, "Failed to register derivative IP Asset");
    }
  }

  /**
   * Handles derivative registration for already minted NFTs with optional `derivData`, `royaltyShares` and `licenseTokenIds`.
   *
   * Supports the following workflows:
   * - {@link registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens}
   * - {@link registerDerivativeIp}
   * - {@link registerIpAndMakeDerivativeWithLicenseTokens}
   */
  private async handleMintedNftDerivativeRegistration(
    request: RegisterDerivativeIpAssetRequest<MintedNFT>,
  ): Promise<RegisterDerivativeIpAssetResponse<typeof request>> {
    const {
      nft,
      royaltyShares,
      derivData,
      maxRts,
      licenseTokenIds,
      deadline,
      txOptions,
      options,
      ipMetadata,
    } = request;
    const baseParams = {
      nftContract: nft.nftContract,
      tokenId: nft.tokenId,
      ipMetadata: ipMetadata,
      deadline: deadline,
      txOptions: txOptions,
      options: options,
    };
    if (royaltyShares && derivData) {
      return this.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
        ...baseParams,
        royaltyShares: royaltyShares,
        derivData: derivData,
      });
    }

    if (derivData) {
      return this.registerDerivativeIp({
        ...baseParams,
        derivData: derivData,
      });
    }

    return this.registerIpAndMakeDerivativeWithLicenseTokens({
      ...baseParams,
      licenseTokenIds: licenseTokenIds!,
      maxRts,
    });
  }

  /**
   * Handles derivative registration for minted NFTs with optional `derivData`, `royaltyShares` and `licenseTokenIds`.
   *
   * Supports the following workflows:
   * - {@link mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens}
   * - {@link mintAndRegisterIpAndMakeDerivative}
   * - {@link mintAndRegisterIpAndMakeDerivativeWithLicenseTokens}
   */
  private async handleMintNftDerivativeRegistration(
    request: RegisterDerivativeIpAssetRequest<MintNFT>,
  ): Promise<RegisterDerivativeIpAssetResponse<typeof request>> {
    const {
      nft,
      royaltyShares,
      derivData,
      maxRts,
      licenseTokenIds,
      txOptions,
      options,
      ipMetadata,
    } = request;
    const baseParams = {
      spgNftContract: nft.spgNftContract,
      recipient: nft.recipient,
      allowDuplicates: nft.allowDuplicates,
      ipMetadata: ipMetadata,
      txOptions: txOptions,
      options: options,
    };

    if (royaltyShares && derivData) {
      return this.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
        ...baseParams,
        royaltyShares: royaltyShares,
        derivData: derivData,
      });
    }

    if (derivData) {
      return this.mintAndRegisterIpAndMakeDerivative({
        ...baseParams,
        derivData: derivData,
      });
    }

    return this.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
      ...baseParams,
      licenseTokenIds: licenseTokenIds!,
      maxRts,
    });
  }

  /**
   * Link a derivative IP asset using parent IP's license terms or license tokens.
   *
   * Supports the following workflows:
   * - {@link registerDerivative}
   * - {@link registerDerivativeWithLicenseTokens}
   *
   * @example
   * ```typescript
   * const result = await client.ipAsset.linkDerivative({
   *   licenseTokenIds: [1, 2, 3],
   *   childIpId: "0x...",
   * });
   * ```
   *
   * @example
   * ```typescript
   * const result = await client.ipAsset.linkDerivative({
   *   parentIpIds: ["0x..."],
   *   licenseTermsIds: [1],
   *   childIpId: "0x...",
   * });
   * ```
   *
   * **Automatic Token Handling:**
   * - If the wallet's IP token balance is insufficient to cover minting fees, it automatically wraps native IP tokens into WIP tokens.
   * - It checks allowances for all required spenders and automatically approves them if their current allowance is lower than needed.
   * - These automatic processes can be configured through the `options` parameter to control behavior like multicall usage and approval settings.
   */
  public async linkDerivative(
    request: RegisterDerivativeWithLicenseTokensRequest | RegisterDerivativeRequest,
  ): Promise<LinkDerivativeResponse> {
    try {
      if ("parentIpIds" in request) {
        return this.registerDerivative(request);
      } else {
        return this.registerDerivativeWithLicenseTokens(request);
      }
    } catch (error) {
      return handleError(error, "Failed to link derivative");
    }
  }
  /**
   * Handles registration for already minted NFTs with optional license terms and royalty shares.
   *
   * Supports the following workflows:
   * - {@link registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens}
   * - {@link registerIpAndAttachPilTerms}
   * - {@link register}
   */
  private async handleMintedNftRegistration(
    request: RegisterIpAssetRequest<MintedNFT>,
  ): Promise<RegisterIpAssetResponse<RegisterIpAssetRequest<MintedNFT>>> {
    const { nft, ipMetadata, txOptions, licenseTermsData, royaltyShares, deadline } = request;
    const baseParams = {
      nftContract: nft.nftContract,
      tokenId: nft.tokenId,
      ipMetadata: ipMetadata,
      deadline: deadline,
      txOptions: txOptions,
    };

    if (licenseTermsData && royaltyShares) {
      return this.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
        ...baseParams,
        licenseTermsData: licenseTermsData,
        royaltyShares: royaltyShares,
      });
    }

    if (licenseTermsData) {
      return this.registerIpAndAttachPilTerms({
        ...baseParams,
        licenseTermsData: licenseTermsData,
      });
    }

    return this.register({
      ...baseParams,
    });
  }

  /**
   * Handles minting and registration of new NFTs with optional license terms and royalty shares.
   *
   * Supports the following workflows:
   * - {@link mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens}
   * - {@link mintAndRegisterIpAssetWithPilTerms}
   * - {@link mintAndRegisterIp}
   */
  private async handleMintNftRegistration(
    request: RegisterIpAssetRequest<MintNFT>,
  ): Promise<RegisterIpAssetResponse<RegisterIpAssetRequest<MintNFT>>> {
    const { nft, ipMetadata, txOptions, options, licenseTermsData, royaltyShares } = request;
    const baseParams = {
      spgNftContract: nft.spgNftContract,
      recipient: nft.recipient,
      allowDuplicates: nft.allowDuplicates,
      ipMetadata: ipMetadata,
      txOptions: txOptions,
      options: options,
    };

    if (licenseTermsData && royaltyShares) {
      return this.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
        ...baseParams,
        licenseTermsData: licenseTermsData,
        royaltyShares: royaltyShares,
      });
    }

    if (licenseTermsData) {
      return this.mintAndRegisterIpAssetWithPilTerms({
        ...baseParams,
        licenseTermsData: licenseTermsData,
      });
    }

    return this.mintAndRegisterIp({
      ...baseParams,
    });
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

  private async validateLicenseTokenIds(licenseTokenIds: LicenseTermsIdInput[]): Promise<bigint[]> {
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
    const ipRegisteredLog = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
    return ipRegisteredLog.map((log) => {
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

  private async handleRegistrationWithFees({
    sender,
    derivData,
    spgNftContract,
    spgSpenderAddress,
    txOptions,
    options,
    encodedTxs,
    contractCall,
  }: CommonRegistrationParams): Promise<CommonRegistrationTxResponse> {
    const tokenSpenders: TokenSpender[] = [];
    const wipOptions = options?.wipOptions;
    let useMulticallWhenPossible = wipOptions?.useMulticallWhenPossible ?? true;

    // get spg minting fee
    if (spgNftContract) {
      const nftMintFee = await calculateSPGMintFee(
        new SpgnftImplReadOnlyClient(this.rpcClient, spgNftContract),
      );
      const publicMinting = await getPublicMinting(spgNftContract, this.rpcClient);
      /**
       * If the SPG NFT contract's public minting is disabled, we need to check if the caller has the `minter role`.
       * When public minting is disabled, we can't use multicall because we need to perform additional role checks
       * that aren't compatible with batched transactions.
       *
       * This is because role-based access control requires the transaction's msg.sender to be verified directly,
       * which is not preserved when using multicall (where the multicall contract becomes the sender).
       */
      if (!publicMinting) {
        useMulticallWhenPossible = false;
      }
      tokenSpenders.push(...(nftMintFee ? [{ address: spgNftContract, ...nftMintFee }] : []));
    }

    // get derivative minting fee
    if (derivData) {
      const mintFees = await calculateDerivativeMintingFee({
        derivData,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
        sender,
      });
      for (const mintFee of mintFees) {
        tokenSpenders.push({
          address: spgSpenderAddress,
          ...mintFee,
        });
      }
    }

    const { txHash, receipt } = await contractCallWithFees({
      options: {
        ...options,
        wipOptions: { ...wipOptions, useMulticallWhenPossible },
      },
      multicall3Address: this.multicall3Client.address,
      rpcClient: this.rpcClient,
      tokenSpenders: tokenSpenders,
      contractCall,
      sender,
      wallet: this.wallet,
      txOptions,
      encodedTxs,
    });
    const event = this.getIpIdAndTokenIdsFromEvent(receipt)?.[0];
    return {
      txHash,
      receipt,
      ...(event && {
        ipId: event.ipId ?? undefined,
        tokenId: event.tokenId ?? undefined,
      }),
    };
  }

  /**
   * Process the `LicenseTermsIds` and `maxLicenseTokensTxHashes` for each IP asset.
   */
  private async populateLicenseAndTokenIdsForRegistrationResults(
    registrationResults: BatchRegistrationResult[],
    aggregateRegistrationRequest: AggregateRegistrationRequest,
  ): Promise<BatchRegistrationResult[]> {
    const allExtraDataArrays = Object.values(aggregateRegistrationRequest).map(
      ({ extraData }) => extraData,
    );
    const allExtraData = allExtraDataArrays.flat();
    let extraDataFlatIndex = -1;
    for (const registrationResult of registrationResults) {
      for (let i = 0; i < registrationResult.ipAssetsWithLicenseTerms.length; i++) {
        extraDataFlatIndex++;
        if (registrationResult.ipAssetsWithLicenseTerms[i] && allExtraData[extraDataFlatIndex]) {
          const ipAsset = await this.processIpAssetLicenseTerms(
            registrationResult.ipAssetsWithLicenseTerms[i],
            allExtraData[extraDataFlatIndex],
          );
          registrationResult.ipAssetsWithLicenseTerms[i] = ipAsset;
        }
      }
    }
    return registrationResults;
  }
  private async processIpAssetLicenseTerms(
    ipAsset: BatchRegistrationResult["ipAssetsWithLicenseTerms"][number],
    extraData: ExtraData | undefined,
  ): Promise<BatchRegistrationResult["ipAssetsWithLicenseTerms"][number]> {
    if (!extraData?.licenseTermsData?.length) {
      return ipAsset;
    }
    const licenseTermsIds = await this.getLicenseTermsId(
      extraData.licenseTermsData.map((item) => item.terms),
    );
    ipAsset.licenseTermsIds = licenseTermsIds;
    const maxLicenseTokens = extraData.maxLicenseTokens;
    if (!maxLicenseTokens?.length) {
      return ipAsset;
    }
    const maxLicenseTokensData = maxLicenseTokens
      .filter((maxLicenseToken): maxLicenseToken is bigint => maxLicenseToken !== undefined)
      .map((maxLicenseToken) => ({
        maxLicenseTokens: maxLicenseToken,
      }));
    const maxLicenseTokensTxHashes = await setMaxLicenseTokens({
      maxLicenseTokensData,
      licensorIpId: ipAsset.ipId,
      licenseTermsIds,
      totalLicenseTokenLimitHookClient: this.totalLicenseTokenLimitHookClient,
      templateAddress: this.licenseTemplateAddress,
    });
    if (maxLicenseTokensTxHashes?.length) {
      ipAsset.maxLicenseTokensTxHashes = maxLicenseTokensTxHashes;
    }
    return ipAsset;
  }
}
