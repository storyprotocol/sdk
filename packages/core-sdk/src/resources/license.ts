import { Address, PublicClient, zeroAddress } from "viem";

import {
  IpAssetRegistryClient,
  LicenseRegistryEventClient,
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
  SimpleWalletClient,
  WrappedIpClient,
  royaltyModuleAddress,
  royaltyPolicyLapAddress,
} from "../abi/generated";
import {
  LicenseTerms,
  RegisterNonComSocialRemixingPILRequest,
  RegisterPILResponse,
  RegisterCommercialUsePILRequest,
  RegisterCommercialRemixPILRequest,
  AttachLicenseTermsRequest,
  LicenseTermsIdResponse,
  MintLicenseTokensRequest,
  MintLicenseTokensResponse,
  PIL_TYPE,
  AttachLicenseTermsResponse,
  LicenseTermsId,
  RegisterPILTermsRequest,
  PredictMintingLicenseFeeRequest,
  SetLicensingConfigRequest,
  SetLicensingConfigResponse,
} from "../types/resources/license";
import { handleError } from "../utils/errors";
import {
  getLicenseTermByType,
  getRevenueShare,
  validateLicenseTerms,
} from "../utils/licenseTermsHelper";
import { chain, getAddress, validateAddress } from "../utils/utils";
import { ChainIds } from "../types/config";
import { calculateLicenseWipMintFee, contractCallWithFees } from "../utils/feeUtils";
import { Erc20Spender } from "../types/utils/wip";
import { validateLicenseConfig } from "../utils/validateLicenseConfig";

export class LicenseClient {
  public licenseRegistryClient: LicenseRegistryEventClient;
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public piLicenseTemplateReadOnlyClient: PiLicenseTemplateReadOnlyClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public moduleRegistryReadOnlyClient: ModuleRegistryReadOnlyClient;
  public multicall3Client: Multicall3Client;
  public wipClient: WrappedIpClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: ChainIds;
  private readonly walletAddress: Address;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.licenseRegistryClient = new LicenseRegistryEventClient(rpcClient);
    this.piLicenseTemplateReadOnlyClient = new PiLicenseTemplateReadOnlyClient(rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.moduleRegistryReadOnlyClient = new ModuleRegistryReadOnlyClient(rpcClient);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.wipClient = new WrappedIpClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.walletAddress = wallet.account!.address;
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
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerPILTerms(request: RegisterPILTermsRequest): Promise<RegisterPILResponse> {
    try {
      const object = await validateLicenseTerms(request, this.rpcClient);
      const licenseTermsId = await this.getLicenseTermsId(object);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      if (request?.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.licenseTemplateClient.registerLicenseTermsEncode({
            terms: object,
          }),
        };
      } else {
        const txHash = await this.licenseTemplateClient.registerLicenseTerms({
          terms: object,
        });
        if (request?.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
          return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register license terms");
    }
  }
  /**
   * Convenient function to register a PIL non commercial social remix license to the registry
   * @param request - [Optional] The request object that contains all data needed to register a PIL non commercial social remix license.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerNonComSocialRemixingPIL(
    request?: RegisterNonComSocialRemixingPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.NON_COMMERCIAL_REMIX);
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      if (request?.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.licenseTemplateClient.registerLicenseTermsEncode({
            terms: licenseTerms,
          }),
        };
      } else {
        const txHash = await this.licenseTemplateClient.registerLicenseTerms({
          terms: licenseTerms,
        });
        if (request?.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
          return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register non commercial social remixing PIL");
    }
  }
  /**
   * Convenient function to register a PIL commercial use license to the registry.
   * @param request - The request object that contains all data needed to register a PIL commercial use license.
   *   @param request.defaultMintingFee The fee to be paid when minting a license.
   *   @param request.currency The ERC20 token to be used to pay the minting fee and the token must be registered in story protocol.
   *   @param request.royaltyPolicyAddress [Optional] The address of the royalty policy contract, default value is LAP.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialUsePIL(
    request: RegisterCommercialUsePILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
        defaultMintingFee: request.defaultMintingFee,
        currency: request.currency,
        royaltyPolicyAddress:
          (request.royaltyPolicyAddress &&
            getAddress(request.royaltyPolicyAddress, "request.royaltyPolicyAddress")) ||
          royaltyPolicyLapAddress[chain[this.chainId]],
      });
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.licenseTemplateClient.registerLicenseTermsEncode({
            terms: licenseTerms,
          }),
        };
      } else {
        const txHash = await this.licenseTemplateClient.registerLicenseTerms({
          terms: licenseTerms,
        });
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
          return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register commercial use PIL");
    }
  }
  /**
   * Convenient function to register a PIL commercial Remix license to the registry.
   * @param request - The request object that contains all data needed to register license.
   *   @param request.defaultMintingFee The fee to be paid when minting a license.
   *   @param request.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *   @param request.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.royaltyPolicyAddress [Optional] The address of the royalty policy contract, default value is LAP.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialRemixPIL(
    request: RegisterCommercialRemixPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
        defaultMintingFee: request.defaultMintingFee,
        currency: request.currency,
        royaltyPolicyAddress:
          (request.royaltyPolicyAddress &&
            getAddress(request.royaltyPolicyAddress, "request.royaltyPolicyAddress")) ||
          royaltyPolicyLapAddress[chain[this.chainId]],
        commercialRevShare: request.commercialRevShare,
      });
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.licenseTemplateClient.registerLicenseTermsEncode({
            terms: licenseTerms,
          }),
        };
      } else {
        const txHash = await this.licenseTemplateClient.registerLicenseTerms({
          terms: licenseTerms,
        });
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
          return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register commercial remix PIL");
    }
  }

  /**
   * Attaches license terms to an IP.
   * @param request - The request object that contains all data needed to attach license terms.
   *   @param request.ipId The address of the IP to which the license terms are attached.
   *   @param request.licenseTemplate The address of the license template, default value is Programmable IP License.
   *   @param request.licenseTermsId The ID of the license terms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes success.
   * If Ip have attached license terms, success will return false and txhash is empty.
   */
  public async attachLicenseTerms(
    request: AttachLicenseTermsRequest,
  ): Promise<AttachLicenseTermsResponse> {
    try {
      request.licenseTermsId = BigInt(request.licenseTermsId);
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.ipId, "request.ipId"),
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
          licenseTemplate:
            (request.licenseTemplate &&
              getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
            this.licenseTemplateClient.address,
          licenseTermsId: request.licenseTermsId,
        });
      if (isAttachedLicenseTerms) {
        return { txHash: "", success: false };
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
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to attach license terms");
    }
  }

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
   *   @param request.licenseTemplate The address of the license template, default value is Programmable IP License.
   *   @param request.licenseTermsId The ID of the license terms within the license template.
   *   @param request.amount The amount of license tokens to mint.
   *   @param request.receiver The address of the receiver.
   *   @param request.maxMintingFee The maximum minting fee that the caller is willing to pay. if set to 0 then no limit.
   *   @param request.maxRevenueShare The maximum revenue share percentage allowed for minting the License Tokens. Must be between 0 and 100,000,000 (where 100,000,000 represents 100%).
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license token IDs.
   * @emits LicenseTokensMinted (msg.sender, licensorIpId, licenseTemplate, licenseTermsId, amount, receiver, startLicenseTokenId);
   */
  public async mintLicenseTokens(
    request: MintLicenseTokensRequest,
  ): Promise<MintLicenseTokensResponse> {
    try {
      const receiver =
        (request.receiver && getAddress(request.receiver, "request.receiver")) ||
        this.walletAddress;
      const req: LicensingModuleMintLicenseTokensRequest = {
        licensorIpId: getAddress(request.licensorIpId, "request.licensorIpId"),
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
        amount: BigInt(request.amount || 1),
        receiver,
        royaltyContext: zeroAddress,
        maxMintingFee: BigInt(request.maxMintingFee),
        maxRevenueShare: getRevenueShare(request.maxRevenueShare),
      } as const;
      if (req.maxMintingFee < 0) {
        throw new Error(`The maxMintingFee must be greater than 0.`);
      }
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.licensorIpId, "request.licensorIpId"),
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
      const isAttachedLicenseTerms =
        await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
          ipId: request.licensorIpId,
          licenseTemplate:
            (request.licenseTemplate &&
              getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
            this.licenseTemplateClient.address,
          licenseTermsId: req.licenseTermsId,
        });
      if (!isAttachedLicenseTerms) {
        throw new Error(
          `License terms id ${request.licenseTermsId} is not attached to the IP with id ${request.licensorIpId}.`,
        );
      }
      const encodedTxData = this.licensingModuleClient.mintLicenseTokensEncode(req);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      }

      // get license token minting fee
      const licenseMintingFee = await calculateLicenseWipMintFee({
        multicall3Client: this.multicall3Client,
        licenseTemplateClient: this.licenseTemplateClient,
        licensingModuleClient: this.licensingModuleClient,
        parentIpId: req.licensorIpId,
        licenseTermsId: req.licenseTermsId,
        receiver,
        amount: req.amount,
      });

      const wipSpenders: Erc20Spender[] = [];
      if (licenseMintingFee > 0n) {
        wipSpenders.push({
          address: royaltyModuleAddress[chain[this.chainId]],
          amount: licenseMintingFee,
        });
      }
      const { txHash, receipt } = await contractCallWithFees({
        totalFees: licenseMintingFee,
        options: { wipOptions: request.wipOptions },
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
      if (!receipt) {
        return { txHash };
      }
      const targetLogs = this.licensingModuleClient.parseTxLicenseTokensMintedEvent(receipt);
      const startLicenseTokenId = targetLogs[0].startLicenseTokenId;
      const licenseTokenIds = [];
      for (let i = 0; i < req.amount; i++) {
        licenseTokenIds.push(startLicenseTokenId + BigInt(i));
      }
      return { txHash, licenseTokenIds: licenseTokenIds, receipt };
    } catch (error) {
      handleError(error, "Failed to mint license tokens");
    }
  }

  /**
   * Gets license terms of the given ID.
   * @param selectedLicenseTermsId The ID of the license terms.
   * @returns A Promise that resolves to an object containing the PILTerms associate with the given ID.
   */
  public async getLicenseTerms(
    selectedLicenseTermsId: LicenseTermsId,
  ): Promise<PiLicenseTemplateGetLicenseTermsResponse> {
    try {
      return await this.piLicenseTemplateReadOnlyClient.getLicenseTerms({
        selectedLicenseTermsId: BigInt(selectedLicenseTermsId),
      });
    } catch (error) {
      handleError(error, "Failed to get license terms");
    }
  }

  /**
   * Pre-compute the minting license fee for the given IP and license terms. The function can be used to calculate the minting license fee before minting license tokens.
   * @param request - The request object that contains all data needed to predict minting licenses fee.
   *   @param request.licensorIpId The IP ID of the licensor.
   *   @param request.licenseTermsId The ID of the license terms.
   *   @param request.amount The amount of license tokens to mint.
   *   @param request.licenseTemplate [Optional] The address of the license template, default value is Programmable IP License.
   *   @param request.receiver [Optional] The address of the receiver,default value is your wallet address.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the currency token and token amount.
   */
  public async predictMintingLicenseFee(
    request: PredictMintingLicenseFeeRequest,
  ): Promise<LicensingModulePredictMintingLicenseFeeResponse> {
    try {
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.licensorIpId, "request.licensorIpId"),
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
        receiver:
          (request.receiver && getAddress(request.receiver, "request.receiver")) ||
          this.wallet.account!.address,
        amount: BigInt(request.amount),
        royaltyContext: zeroAddress,
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        licenseTermsId,
      };
      return await this.licensingModuleClient.predictMintingLicenseFee(object);
    } catch (error) {
      handleError(error, "Failed to predict minting license fee");
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
        licenseTemplate: validateAddress(request.licenseTemplate),
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
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to set licensing config");
    }
  }
  private async getLicenseTermsId(request: LicenseTerms): Promise<LicenseTermsIdResponse> {
    const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({ terms: request });
    return licenseRes.selectedLicenseTermsId;
  }
}
