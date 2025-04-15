import {
  Hex,
  PublicClient,
  zeroAddress,
  Address,
  zeroHash,
  encodeFunctionData,
  TransactionReceipt,
  Hash,
} from "viem";

import { chain, validateAddress } from "../utils/utils";
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
  RegisterIPAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse,
  BatchMintAndRegisterIpAssetWithPilTermsResult,
  IpIdAndTokenId,
  RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensRequest,
  RegisterDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensResponse,
  MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensRequest,
  MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  MintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokensResponse,
  MintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensResponse,
  CommonRegistrationTxResponse,
  CommonRegistrationParams,
  BatchRegisterIpWithOptions,
  BatchRegisterIpWithOptionsResponse,
  TransformIpRegistrationWorkflowResponse,
} from "../types/resources/ipAsset";
import {
  AccessControllerClient,
  CoreMetadataModuleClient,
  DerivativeWorkflowsClient,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsMintAndRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeRequest,
  DerivativeWorkflowsRegisterIpAndMakeDerivativeWithLicenseTokensRequest,
  EncodedTxData,
  IpAccountImplClient,
  IpAssetRegistryClient,
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
  RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsMintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndAttachPilTermsAndDeployRoyaltyVaultRequest,
  RoyaltyTokenDistributionWorkflowsRegisterIpAndMakeDerivativeAndDeployRoyaltyVaultRequest,
  SimpleWalletClient,
  SpgnftImplReadOnlyClient,
  WrappedIpClient,
  ipAccountImplAbi,
  licensingModuleAbi,
} from "../abi/generated";
import { getRevenueShare, validateLicenseTerms } from "../utils/licenseTermsHelper";
import { LicenseTerms } from "../types/resources/license";
import { MAX_ROYALTY_TOKEN } from "../constants/common";
import { RevShareType } from "../types/common";
import { getIpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";
import { calculateSPGWipMintFee, contractCallWithFees } from "../utils/feeUtils";
import { Erc20Spender } from "../types/utils/wip";
import { ChainIds } from "../types/config";
import { IpCreator, IpMetadata } from "../types/resources/ipMetadata";
import {
  calculateDerivativeMintingFee,
  generateOperationSignature,
  getCalculatedDeadline,
  getIpIdAddress,
  getRoyaltyShares,
  transformRegistrationRequest,
  validateLicenseTermsData,
  validateMaxRts,
  validateDerivativeData,
  mergeSpenders,
} from "../utils/registerHelper";
import { SignatureMethodType } from "../types/utils/registerHelper";
import { TransactionResponse } from "../types/options";

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

  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: ChainIds;
  private readonly walletAddress: Address;

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
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.walletAddress = this.wallet.account!.address;
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
      if (request.txOptions?.waitForTransaction) {
        const processTransaction = async (
          hash: Hex,
          contractType: "spgNftContract" | "nftContract",
        ) => {
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
   */
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
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
        const contractCall = () => {
          return this.licensingModuleClient.registerDerivative(object);
        };
        return this.handleRegistrationWithFees({
          sender: this.walletAddress,
          derivData: object,
          contractCall,
          txOptions: request.txOptions,
          encodedTxs: [encodedTxData],
          spgSpenderAddress: this.royaltyModuleEventClient.address,
          wipOptions: {
            ...request.wipOptions,
            useMulticallWhenPossible: false,
          },
        });
      }
    } catch (error) {
      handleError(error, "Failed to register derivative");
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
            arg.licenseTemplate || this.licenseTemplateClient.address,
            zeroAddress,
            BigInt(arg.maxMintingFee || 0),
            Number(arg.maxRts || MAX_ROYALTY_TOKEN),
            getRevenueShare(arg.maxRevenueShare || 100, RevShareType.MAX_REVENUE_SHARE),
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
   */
  public async registerDerivativeWithLicenseTokens(
    request: RegisterDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterDerivativeWithLicenseTokensResponse> {
    try {
      const req = {
        childIpId: validateAddress(request.childIpId),
        licenseTokenIds: request.licenseTokenIds.map((id) => BigInt(id)),
        royaltyContext: zeroAddress,
        maxRts: Number(request.maxRts),
      };
      validateMaxRts(req.maxRts);
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
   *
   * Emits on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} and {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicensingModule.sol#L19 | `LicenseTermsAttached`} events.
   */
  public async mintAndRegisterIpAssetWithPilTerms(
    request: MintAndRegisterIpAssetWithPilTermsRequest,
  ): Promise<MintAndRegisterIpAssetWithPilTermsResponse> {
    try {
      const { licenseTerms } = await validateLicenseTermsData(
        request.licenseTermsData,
        this.rpcClient,
      );
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
      const contractCall = () => {
        return this.licenseAttachmentWorkflowsClient.mintAndRegisterIpAndAttachPilTerms(
          transformRequest,
        );
      };
      const rsp = await this.handleRegistrationWithFees({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgNftContract: transformRequest.spgNftContract,
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
   * Register a given NFT as an IP and attach Programmable IP License Terms.
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
      const contractCall = () => {
        return this.derivativeWorkflowsClient.registerIpAndMakeDerivative(transformRequest);
      };
      return this.handleRegistrationWithFees({
        wipOptions: {
          ...request.wipOptions,
          useMulticallWhenPossible: false,
        },
        sender: this.walletAddress,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        derivData: transformRequest.derivData,
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
      const contractCall = () => {
        return this.derivativeWorkflowsClient.mintAndRegisterIpAndMakeDerivative(transformRequest);
      };
      return this.handleRegistrationWithFees({
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        spgNftContract,
        derivData: transformRequest.derivData,
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
      const contractCall = () => {
        return this.registrationWorkflowsClient.mintAndRegisterIp(object);
      };
      return this.handleRegistrationWithFees({
        sender: this.walletAddress,
        spgSpenderAddress: this.registrationWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
        wipOptions: {
          ...request.wipOptions,
          useMulticallWhenPossible: false,
        },
      });
    } catch (error) {
      handleError(error, "Failed to mint and register IP");
    }
  }
  /**
   * Register Programmable IP License Terms (if unregistered) and attach it to IP.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicensingModule.sol#L19 | `LicenseTermsAttached`} event.
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
      const { licenseTerms, licenseTermsData } = await validateLicenseTermsData(
        request.licenseTermsData,
        this.rpcClient,
      );
      const calculatedDeadline = await getCalculatedDeadline(this.rpcClient, request.deadline);
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, ipId);
      const { result: state } = await ipAccount.state();
      const signature = await generateOperationSignature({
        ipIdAddress: ipId,
        methodType: SignatureMethodType.REGISTER_PIL_TERMS_AND_ATTACH,
        deadline: calculatedDeadline,
        state,
        wallet: this.wallet,
        chainId: this.chainId,
      });
      const object: LicenseAttachmentWorkflowsRegisterPilTermsAndAttachRequest = {
        ipId: ipId,
        licenseTermsData,
        sigAttachAndConfig: {
          signer: validateAddress(this.walletAddress),
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
   * Mint an NFT from a collection and register it as a derivative IP using license tokens.
   * Requires caller to have the minter role or the SPG NFT to allow public minting. Caller must own the license tokens and have approved DerivativeWorkflows to transfer them.
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
          maxRts: Number(request.maxRts),
          allowDuplicates: request.allowDuplicates || true,
        };
      validateMaxRts(object.maxRts);

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
      return this.handleRegistrationWithFees({
        wipOptions: {
          ...request.wipOptions,
          // need to disable multicall to avoid needing to transfer the license
          // token to the multicall contract.
          useMulticallWhenPossible: false,
        },
        sender: this.walletAddress,
        spgNftContract: object.spgNftContract,
        spgSpenderAddress: this.derivativeWorkflowsClient.address,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: request.txOptions,
      });
    } catch (error) {
      handleError(error, "Failed to mint and register IP and make derivative with license tokens");
    }
  }
  /**
   * Register the given NFT as a derivative IP using license tokens.
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
        maxRts: Number(request.maxRts),
      };
      validateMaxRts(object.maxRts);
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
   * Register the given NFT and attach license terms and distribute royalty
   * tokens. In order to successfully distribute royalty tokens, the first
   * license terms attached to the IP must be a commercial license.
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
      const contractCall = () => {
        return this.royaltyTokenDistributionWorkflowsClient.registerIpAndMakeDerivativeAndDeployRoyaltyVault(
          transformRequest,
        );
      };
      const { txHash, ipId, tokenId, receipt } = await this.handleRegistrationWithFees({
        wipOptions: {
          ...request.wipOptions,
          useMulticallWhenPossible: false,
        },
        sender: this.walletAddress,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        derivData: transformRequest.derivData,
        encodedTxs: [encodedTxData],
        contractCall,
        txOptions: { ...request.txOptions, waitForTransaction: true },
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
      const contractCall = () => {
        return this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens(
          transformRequest,
        );
      };
      const { txHash, ipId, tokenId, receipt } = await this.handleRegistrationWithFees({
        wipOptions: request.wipOptions,
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
      const contractCall = () => {
        return this.royaltyTokenDistributionWorkflowsClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
          transformRequest,
        );
      };
      return this.handleRegistrationWithFees({
        spgNftContract: transformRequest.spgNftContract,
        wipOptions: request.wipOptions,
        sender: this.walletAddress,
        spgSpenderAddress: this.royaltyTokenDistributionWorkflowsClient.address,
        derivData: transformRequest.derivData,
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

  private async distributeRoyaltyTokens(request: DistributeRoyaltyTokens): Promise<Hex> {
    const { transformRequest } =
      await transformRegistrationRequest<RoyaltyTokenDistributionWorkflowsDistributeRoyaltyTokensRequest>(
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
    if (request.txOptions?.waitForTransaction) {
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      return txHash;
    }
    return txHash;
  }

  public async isRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: validateAddress(ipId) });
  }
  /**
   * Batch register IP with options which supports the following methods:
   * - {@link mintAndRegisterIpAndMakeDerivative}
   * - {@link mintAndRegisterIpAssetWithPilTerms}
   * - {@link mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens}
   * - {@link mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens}
   * - {@link registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens}
   * - {@link registerIpAndAttachPilTerms}
   * - {@link registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens}
   * - {@link registerDerivativeIp}
   *
   * This method allows for efficient batch processing of multiple IP registration operations
   * in a single transaction, optimizing gas costs and improving throughput.
   *
   * @remark The `useMulticallWhenPossible` option will be overridden (set to false) in the following cases:
   * 1. For methods prefixed with `mintAndRegister` when the `spgNftContract` has public minting enabled:
   *    In this case, we use SPG's multicall to batch the minting and registering operations.
   * 2. For methods prefixed with `register`:
   *    We use SPG's multicall to batch the registration operations.
   *
   * In all other scenarios, the `useMulticallWhenPossible` value from the request will be respected.
   */
  public async batchRegisterIpWithOptions(
    request: BatchRegisterIpWithOptions,
  ): Promise<BatchRegisterIpWithOptionsResponse[]> {
    try {
      const transferWorkflowResponses: TransformIpRegistrationWorkflowResponse[] = [];
      for (const req of request.requests) {
        const res = await transformRegistrationRequest({
          request: req,
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          chainId: this.chainId,
        });
        transferWorkflowResponses.push(res);
      }

      const aggregateRegistrationRequest: Record<
        string,
        {
          spenders: Erc20Spender[];
          totalFees: bigint;
          encodedTxData: EncodedTxData[];
          contractCall: Array<() => Promise<Hash>>;
        }
      > = {};
      for (const res of transferWorkflowResponses) {
        const { spenders, totalFees, encodedTxData, workflowClient, isUseMulticall3 } = res;
        if (isUseMulticall3) {
          const multicall3Address = this.multicall3Client.address;
          aggregateRegistrationRequest[multicall3Address].spenders = mergeSpenders(
            aggregateRegistrationRequest[multicall3Address].spenders,
            spenders || [],
          );
          aggregateRegistrationRequest[multicall3Address].totalFees += totalFees || 0n;
          aggregateRegistrationRequest[multicall3Address].encodedTxData.concat(encodedTxData || []);
          aggregateRegistrationRequest[multicall3Address].contractCall.concat(res.contractCall);
        } else {
          const spgMulticall3Address = workflowClient.address;
          aggregateRegistrationRequest[spgMulticall3Address] = {
            spenders: mergeSpenders(
              aggregateRegistrationRequest[spgMulticall3Address].spenders,
              spenders || [],
            ),
            totalFees:
              aggregateRegistrationRequest[spgMulticall3Address].totalFees + (totalFees || 0n),
            encodedTxData:
              aggregateRegistrationRequest[spgMulticall3Address].encodedTxData.concat(
                encodedTxData,
              ),
            contractCall: [
              () => {
                return workflowClient.multicall({
                  data: aggregateRegistrationRequest[spgMulticall3Address].encodedTxData.map(
                    (tx) => tx.data,
                  ),
                });
              },
            ],
          };
        }
      }
      const txHashes: TransactionResponse[] = [];
      for (const key in aggregateRegistrationRequest) {
        const { spenders, totalFees, encodedTxData, contractCall } =
          aggregateRegistrationRequest[key];
        const contractCalls = async () => {
          return await Promise.all(contractCall.map((call) => call()));
        };
        const useMulticallWhenPossible =
          key === this.multicall3Client.address
            ? request.wipOptions?.useMulticallWhenPossible
            : false;
        const txResponse = await contractCallWithFees({
          totalFees,
          options: {
            wipOptions: {
              ...request.wipOptions,
              useMulticallWhenPossible,
            },
          },
          multicall3Address: this.multicall3Client.address,
          rpcClient: this.rpcClient,
          tokenSpenders: spenders,
          contractCall: contractCalls,
          sender: this.walletAddress,
          wallet: this.wallet,
          encodedTxs: encodedTxData,
          txOptions: { waitForTransaction: true },
        });
        txHashes.push(...(Array.isArray(txResponse) ? txResponse : [txResponse]));
      }
      const responses: BatchRegisterIpWithOptionsResponse[] = [];
      for (const { txHash, receipt } of txHashes) {
        const event = this.getIpIdAndTokenIdsFromEvent(receipt!)?.[0];
        responses.push({
          txHash,
          receipt: receipt!,
          ...(event && {
            ipId: event.ipId ?? undefined,
            tokenId: event.tokenId ?? undefined,
          }),
        });
      }
      return responses;
    } catch (error) {
      handleError(error, "Failed to batch register IP with options");
    }
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

  private async handleRegistrationWithFees({
    sender,
    derivData,
    spgNftContract,
    spgSpenderAddress,
    txOptions,
    wipOptions,
    encodedTxs,
    contractCall,
  }: CommonRegistrationParams): Promise<CommonRegistrationTxResponse> {
    let totalFees = 0n;
    const wipSpenders: Erc20Spender[] = [];

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
      const totalDerivativeMintingFee = await calculateDerivativeMintingFee({
        derivData,
        rpcClient: this.rpcClient,
        wallet: this.wallet,
        chainId: this.chainId,
      });
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

    const txResponse = await contractCallWithFees({
      totalFees,
      options: { wipOptions },
      multicall3Address: this.multicall3Client.address,
      rpcClient: this.rpcClient,
      tokenSpenders: wipSpenders,
      contractCall,
      sender,
      wallet: this.wallet,
      txOptions,
      encodedTxs,
    });
    const { txHash, receipt } = txResponse as TransactionResponse;
    if (receipt) {
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
    return { txHash };
  }
}
