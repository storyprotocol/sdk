import { Address, PublicClient, zeroAddress } from "viem";

import {
  IpAccountImplClient,
  IpAssetRegistryClient,
  LicenseRegistryGetLicensingConfigRequest,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  LicensingModuleMintLicenseTokensRequest,
  LicensingModulePredictMintingLicenseFeeRequest,
  LicensingModulePredictMintingLicenseFeeResponse,
  LicensingModuleSetLicensingConfigRequest,
  ModuleRegistryReadOnlyClient,
  Multicall3Client,
  PiLicenseTemplateClient,
  PiLicenseTemplateGetLicenseTermsResponse,
  PiLicenseTemplateReadOnlyClient,
  royaltyModuleAddress,
  SimpleWalletClient,
  TotalLicenseTokenLimitHookClient,
  WrappedIpClient,
} from "../abi/generated";
import { LicensingConfig, RevShareType } from "../types/common";
import { ChainIds } from "../types/config";
import { TransactionResponse, TxOptions } from "../types/options";
import {
  AttachLicenseTermsRequest,
  AttachLicenseTermsResponse,
  GetLicensingConfigRequest,
  LicenseTerms,
  LicenseTermsId,
  LicenseTermsIdResponse,
  MintLicenseTokensRequest,
  MintLicenseTokensResponse,
  PredictMintingLicenseFeeRequest,
  RegisterCommercialRemixPILRequest,
  RegisterCommercialUsePILRequest,
  RegisterCreativeCommonsAttributionPILRequest,
  RegisterNonComSocialRemixingPILRequest,
  RegisterPILResponse,
  RegisterPILTermsRequest,
  SetLicensingConfigRequest,
  SetLicensingConfigResponse,
  SetMaxLicenseTokensRequest,
} from "../types/resources/license";
import { Erc20Spender } from "../types/utils/wip";
import { calculateLicenseWipMintFee, predictMintingLicenseFee } from "../utils/calculateMintFee";
import { handleError } from "../utils/errors";
import { contractCallWithFees } from "../utils/feeUtils";
import { PILFlavor } from "../utils/pilFlavor";
import { getRevenueShare } from "../utils/royalty";
import { waitForTxReceipt } from "../utils/txOptions";
import { validateAddress } from "../utils/utils";
import { validateLicenseConfig } from "../utils/validateLicenseConfig";

export class LicenseClient {
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public piLicenseTemplateReadOnlyClient: PiLicenseTemplateReadOnlyClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public moduleRegistryReadOnlyClient: ModuleRegistryReadOnlyClient;
  public multicall3Client: Multicall3Client;
  public totalLicenseTokenLimitHookClient: TotalLicenseTokenLimitHookClient;
  public wipClient: WrappedIpClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: ChainIds;
  private readonly walletAddress: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.piLicenseTemplateReadOnlyClient = new PiLicenseTemplateReadOnlyClient(rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.moduleRegistryReadOnlyClient = new ModuleRegistryReadOnlyClient(rpcClient);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.wipClient = new WrappedIpClient(rpcClient, wallet);
    this.totalLicenseTokenLimitHookClient = new TotalLicenseTokenLimitHookClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.walletAddress = wallet.account!.address;
  }

  /**
   * Registers new license terms and return the ID of the newly registered license terms.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicenseTemplate.sol#L19 | `LicenseTermsRegistered`} event.
   */
  public async registerPILTerms(request: RegisterPILTermsRequest): Promise<RegisterPILResponse> {
    try {
      const object = PILFlavor.validateLicenseTerms(
        {
          ...request,
          royaltyPolicy: request.royaltyPolicy ?? request.royaltyPolicyAddress,
        },
        this.chainId,
      );
      return await this.registerPILTermsHelper(object, request.txOptions);
    } catch (error) {
      return handleError(error, "Failed to register license terms");
    }
  }

  /**
   * @deprecated Use {@link PILFlavor.nonCommercialSocialRemixing} with {@link LicenseClient.registerPILTerms} instead.
   *  The method will be removed in the `v1.4.0`.
   *
   * Convenient function to register a PIL non commercial social remix license to the registry
   *
   * For more details, see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#flavor-%231%3A-non-commercial-social-remixing | Non Commercial Social Remixing}.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicenseTemplate.sol#L19 | `LicenseTermsRegistered`} event.
   */
  public async registerNonComSocialRemixingPIL(
    request?: RegisterNonComSocialRemixingPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = PILFlavor.nonCommercialSocialRemixing();
      return await this.registerPILTermsHelper(licenseTerms, request?.txOptions);
    } catch (error) {
      return handleError(error, "Failed to register non commercial social remixing PIL");
    }
  }

  /**
   * @deprecated Use {@link PILFlavor.commercialUse} with {@link LicenseClient.registerPILTerms} instead.
   *  The method will be removed in the `v1.4.0`.
   *
   * Convenient function to register a PIL commercial use license to the registry.
   *
   * For more details, see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#flavor-%232%3A-commercial-use | Commercial Use}.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicenseTemplate.sol#L19 | `LicenseTermsRegistered`} event.
   */
  public async registerCommercialUsePIL(
    request: RegisterCommercialUsePILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = PILFlavor.commercialUse({
        defaultMintingFee: Number(request.defaultMintingFee),
        currency: request.currency,
        royaltyPolicy: request.royaltyPolicy ?? request.royaltyPolicyAddress,
      });
      return await this.registerPILTermsHelper(licenseTerms, request.txOptions);
    } catch (error) {
      return handleError(error, "Failed to register commercial use PIL");
    }
  }

  /**
   * @deprecated Use {@link PILFlavor.commercialRemix} with {@link LicenseClient.registerPILTerms} instead.
   *  The method will be removed in the v1.4.0.
   *
   * Convenient function to register a PIL commercial Remix license to the registry.
   *
   * For more details, see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#flavor-%233%3A-commercial-remix | Commercial Remix }.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicenseTemplate.sol#L19 | `LicenseTermsRegistered`} event.
   */
  public async registerCommercialRemixPIL({
    defaultMintingFee,
    currency,
    royaltyPolicy,
    royaltyPolicyAddress,
    commercialRevShare,
    txOptions,
  }: RegisterCommercialRemixPILRequest): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = PILFlavor.commercialRemix({
        defaultMintingFee: Number(defaultMintingFee),
        currency,
        royaltyPolicy: royaltyPolicy ?? royaltyPolicyAddress,
        commercialRevShare,
      });
      return await this.registerPILTermsHelper(licenseTerms, txOptions);
    } catch (error) {
      return handleError(error, "Failed to register commercial remix PIL");
    }
  }

  /**
   * @deprecated Use {@link PILFlavor.creativeCommonsAttribution} with {@link LicenseClient.registerPILTerms} instead.
   *  The method will be removed in the `v1.4.0`.
   *
   * Convenient function to register a PIL creative commons attribution license to the registry.
   * Creates a Creative Commons Attribution (CC-BY) license terms flavor.
   *
   * For more details, see {@link https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#flavor-%234%3A-creative-commons-attribution | Creative Commons Attribution}.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicenseTemplate.sol#L19 | `LicenseTermsRegistered`} event.
   */
  public async registerCreativeCommonsAttributionPIL({
    currency,
    royaltyPolicy,
    royaltyPolicyAddress,
    txOptions,
  }: RegisterCreativeCommonsAttributionPILRequest): Promise<RegisterPILResponse> {
    try {
      return await this.registerPILTermsHelper(
        PILFlavor.creativeCommonsAttribution({
          currency,
          royaltyPolicy: royaltyPolicy ?? royaltyPolicyAddress,
        }),
        txOptions,
      );
    } catch (error) {
      return handleError(error, "Failed to register creative commons attribution PIL");
    }
  }

  /**
   * Attaches license terms to an IP.
   */
  public async attachLicenseTerms(
    request: AttachLicenseTermsRequest,
  ): Promise<AttachLicenseTermsResponse> {
    try {
      request.licenseTermsId = BigInt(request.licenseTermsId);
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(request.ipId),
      });
      if (!isRegistered) {
        throw new Error(`The IP with id ${request.ipId} is not registered.`);
      }
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId: request.licenseTermsId,
      });
      if (!isExisted) {
        throw new Error(`License terms id ${request.licenseTermsId} do not exist.`);
      }
      const isAttachedLicenseTerms =
        await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
          ipId: request.ipId,
          licenseTemplate: validateAddress(
            request.licenseTemplate || this.licenseTemplateClient.address,
          ),
          licenseTermsId: request.licenseTermsId,
        });
      if (isAttachedLicenseTerms) {
        return { success: false };
      }
      const req = {
        ipId: request.ipId,
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        licenseTermsId: request.licenseTermsId,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.licensingModuleClient.attachLicenseTermsEncode(req) };
      } else {
        const txHash = await this.licensingModuleClient.attachLicenseTerms(req);
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        return { txHash: txHash, success: true };
      }
    } catch (error) {
      return handleError(error, "Failed to attach license terms");
    }
  }

  /**
   * Mints license tokens for the license terms attached to an IP.
   * It might require the caller pay the minting fee, depending on the license terms or configured by the iP owner.
   * The minting fee is paid in the minting fee token specified in the license terms or configured by the IP owner.
   * IP owners can configure the minting fee of their IPs or configure the minting fee module to determine the minting fee.
   *
   * @remarks
   * Before minting license tokens, the license terms must be attached to the IP, with two exceptions:
   * 1. Default license terms can be minted without explicit attachment since they are automatically
   *    attached to all IPs by default
   * 2. IP owners have special privileges and can mint license tokens for their own IPs using any
   *    license terms, even if those terms are not explicitly attached
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/licensing/ILicensingModule.sol#L34 | `LicenseTokensMinted`} event.
   */
  public async mintLicenseTokens(
    request: MintLicenseTokensRequest,
  ): Promise<MintLicenseTokensResponse> {
    try {
      const receiver = validateAddress(request.receiver || this.walletAddress);
      const req: LicensingModuleMintLicenseTokensRequest = {
        licensorIpId: validateAddress(request.licensorIpId),
        licenseTemplate: validateAddress(
          request.licenseTemplate || this.licenseTemplateClient.address,
        ),
        licenseTermsId: BigInt(request.licenseTermsId),
        amount: BigInt(request.amount || 1),
        receiver,
        royaltyContext: zeroAddress,
        maxMintingFee: BigInt(request.maxMintingFee),
        maxRevenueShare: getRevenueShare(request.maxRevenueShare, RevShareType.MAX_REVENUE_SHARE),
      } as const;
      if (req.maxMintingFee < 0) {
        throw new Error(`The maxMintingFee must be greater than 0.`);
      }
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(request.licensorIpId),
      });
      if (!isLicenseIpIdRegistered) {
        throw new Error(`The licensor IP with id ${request.licensorIpId} is not registered.`);
      }
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId: req.licenseTermsId,
      });
      if (!isExisted) {
        throw new Error(`License terms id ${request.licenseTermsId} do not exist.`);
      }
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, req.licensorIpId);
      const ipOwner = await ipAccount.owner();
      if (ipOwner !== this.walletAddress) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: req.licensorIpId,
            licenseTemplate: req.licenseTemplate,
            licenseTermsId: req.licenseTermsId,
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms id ${req.licenseTermsId} is not attached to the IP with id ${req.licensorIpId}.`,
          );
        }
      }
      const encodedTxData = this.licensingModuleClient.mintLicenseTokensEncode(req);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      // get license token minting fee
      const licenseMintingFee = await calculateLicenseWipMintFee({
        predictMintingFeeRequest: req,
        rpcClient: this.rpcClient,
        chainId: this.chainId,
        walletAddress: this.walletAddress,
      });

      const wipSpenders: Erc20Spender[] = [];
      if (licenseMintingFee > 0n) {
        wipSpenders.push({
          address: royaltyModuleAddress[this.chainId],
          amount: licenseMintingFee,
        });
      }
      const { txHash, receipt } = await contractCallWithFees({
        totalFees: licenseMintingFee,
        options: { wipOptions: request.options?.wipOptions },
        multicall3Address: this.multicall3Client.address,
        rpcClient: this.rpcClient,
        tokenSpenders: wipSpenders,
        contractCall: () => {
          return this.licensingModuleClient.mintLicenseTokens(req);
        },
        wallet: this.wallet,
        sender: this.walletAddress,
        txOptions: request.txOptions,
        encodedTxs: [encodedTxData],
      });
      const targetLogs = this.licensingModuleClient.parseTxLicenseTokensMintedEvent(receipt);
      const startLicenseTokenId = targetLogs[0].startLicenseTokenId;
      const licenseTokenIds = [];
      for (let i = 0; i < req.amount; i++) {
        licenseTokenIds.push(startLicenseTokenId + BigInt(i));
      }
      return { txHash, licenseTokenIds: licenseTokenIds, receipt };
    } catch (error) {
      return handleError(error, "Failed to mint license tokens");
    }
  }

  /**
   * Gets license terms of the given ID.
   */
  public async getLicenseTerms(
    selectedLicenseTermsId: LicenseTermsId,
  ): Promise<PiLicenseTemplateGetLicenseTermsResponse> {
    try {
      return await this.piLicenseTemplateReadOnlyClient.getLicenseTerms({
        selectedLicenseTermsId: BigInt(selectedLicenseTermsId),
      });
    } catch (error) {
      return handleError(error, "Failed to get license terms");
    }
  }

  /**
   * Pre-compute the minting license fee for the given IP and license terms. The function can be used to calculate the minting license fee before minting license tokens.
   */
  public async predictMintingLicenseFee(
    request: PredictMintingLicenseFeeRequest,
  ): Promise<LicensingModulePredictMintingLicenseFeeResponse> {
    try {
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(request.licensorIpId),
      });
      if (!isLicenseIpIdRegistered) {
        throw new Error(`The licensor IP with id ${request.licensorIpId} is not registered.`);
      }
      const licenseTermsId = BigInt(request.licenseTermsId);
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId,
      });
      if (!isExisted) {
        throw new Error(`License terms id ${request.licenseTermsId} do not exist.`);
      }
      const object: LicensingModulePredictMintingLicenseFeeRequest = {
        ...request,
        receiver: validateAddress(request.receiver || this.walletAddress),
        amount: BigInt(request.amount),
        royaltyContext: zeroAddress,
        licenseTemplate: validateAddress(
          request.licenseTemplate || this.licenseTemplateClient.address,
        ),
        licenseTermsId,
      };
      return await predictMintingLicenseFee({
        predictMintingFeeRequest: object,
        rpcClient: this.rpcClient,
        chainId: this.chainId,
        walletAddress: this.walletAddress,
      });
    } catch (error) {
      return handleError(error, "Failed to predict minting license fee");
    }
  }

  /**
   * Sets the licensing configuration for a specific license terms of an IP. If both licenseTemplate and licenseTermsId are not specified then the licensing config apply to all licenses of given IP.
   */
  public async setLicensingConfig(
    request: SetLicensingConfigRequest,
  ): Promise<SetLicensingConfigResponse> {
    try {
      const req: LicensingModuleSetLicensingConfigRequest = {
        ipId: request.ipId,
        licenseTemplate: validateAddress(
          request.licenseTemplate || this.licenseTemplateClient.address,
        ),
        licenseTermsId: BigInt(request.licenseTermsId),
        licensingConfig: validateLicenseConfig(request.licensingConfig),
      };
      if (req.licenseTemplate === zeroAddress && req.licensingConfig.commercialRevShare !== 0) {
        throw new Error(
          "The license template cannot be zero address if commercial revenue share is not zero.",
        );
      }
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(req.ipId),
      });
      if (!isLicenseIpIdRegistered) {
        throw new Error(`The licensor IP with id ${req.ipId} is not registered.`);
      }
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId: req.licenseTermsId,
      });
      if (!isExisted) {
        throw new Error(`License terms id ${req.licenseTermsId} do not exist.`);
      }

      if (req.licensingConfig.licensingHook !== zeroAddress) {
        const isRegistered = await this.moduleRegistryReadOnlyClient.isRegistered({
          moduleAddress: req.licensingConfig.licensingHook,
        });
        if (!isRegistered) {
          throw new Error("The licensing hook is not registered.");
        }
      }

      if (req.licenseTemplate === zeroAddress && req.licenseTermsId !== 0n) {
        throw new Error("The license template is zero address but license terms id is not zero.");
      }

      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.licensingModuleClient.setLicensingConfigEncode(req) };
      } else {
        const txHash = await this.licensingModuleClient.setLicensingConfig(req);
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        return { txHash: txHash, success: true };
      }
    } catch (error) {
      return handleError(error, "Failed to set licensing config");
    }
  }

  /**
   * Set the max license token limit for a specific license.
   *
   * @remarks
   * This method automatically configures the licensing hook to use the
   * {@link https://github.com/storyprotocol/protocol-periphery-v1/blob/release/1.3/contracts/hooks/TotalLicenseTokenLimitHook.sol | TotalLicenseTokenLimitHook} contract
   * if the current licensing hook is not set to `TotalLicenseTokenLimitHook`, and sets the max license tokens
   * to the specified limit.
   */
  public async setMaxLicenseTokens({
    ipId,
    licenseTermsId,
    maxLicenseTokens,
    licenseTemplate,
    txOptions,
  }: SetMaxLicenseTokensRequest): Promise<TransactionResponse> {
    try {
      if (maxLicenseTokens < 0) {
        throw new Error("The max license tokens must be greater than 0.");
      }
      const newLicenseTermsId = BigInt(licenseTermsId);
      const newLicenseTemplate = validateAddress(
        licenseTemplate || this.licenseTemplateClient.address,
      );
      const licensingConfig = await this.getLicensingConfig({
        ipId,
        licenseTermsId: newLicenseTermsId,
        licenseTemplate: newLicenseTemplate,
      });
      if (licensingConfig.licensingHook !== this.totalLicenseTokenLimitHookClient.address) {
        await this.setLicensingConfig({
          ipId,
          licenseTermsId: newLicenseTermsId,
          licenseTemplate: newLicenseTemplate,
          licensingConfig: {
            ...licensingConfig,
            licensingHook: this.totalLicenseTokenLimitHookClient.address,
          },
        });
      }
      const txHash = await this.totalLicenseTokenLimitHookClient.setTotalLicenseTokenLimit({
        licensorIpId: ipId,
        licenseTemplate: newLicenseTemplate,
        licenseTermsId: newLicenseTermsId,
        limit: BigInt(maxLicenseTokens),
      });
      return waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      return handleError(error, "Failed to set max license tokens");
    }
  }

  public async getLicensingConfig(request: GetLicensingConfigRequest): Promise<LicensingConfig> {
    try {
      const licensingConfigParam: LicenseRegistryGetLicensingConfigRequest = {
        ipId: validateAddress(request.ipId),
        licenseTemplate: validateAddress(
          request.licenseTemplate || this.licenseTemplateClient.address,
        ),
        licenseTermsId: BigInt(request.licenseTermsId),
      };
      return await this.licenseRegistryReadOnlyClient.getLicensingConfig(licensingConfigParam);
    } catch (error) {
      return handleError(error, "Failed to get licensing config");
    }
  }

  private async getLicenseTermsId(request: LicenseTerms): Promise<LicenseTermsIdResponse> {
    const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({ terms: request });
    return licenseRes.selectedLicenseTermsId;
  }

  private async registerPILTermsHelper(
    licenseTerms: LicenseTerms,
    txOptions?: TxOptions,
  ): Promise<RegisterPILResponse> {
    if (txOptions?.encodedTxDataOnly) {
      return {
        encodedTxData: this.licenseTemplateClient.registerLicenseTermsEncode({
          terms: licenseTerms,
        }),
      };
    } else {
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      const txHash = await this.licenseTemplateClient.registerLicenseTerms({
        terms: licenseTerms,
      });

      const { receipt } = await waitForTxReceipt({
        txOptions,
        rpcClient: this.rpcClient,
        txHash,
      });
      const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(receipt);
      return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
    }
  }
}
