import { PublicClient, zeroAddress } from "viem";

import {
  IpAssetRegistryClient,
  LicenseRegistryEventClient,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  LicensingModulePredictMintingLicenseFeeRequest,
  LicensingModulePredictMintingLicenseFeeResponse,
  LicensingModuleSetLicensingConfigRequest,
  ModuleRegistryReadOnlyClient,
  PiLicenseTemplateClient,
  PiLicenseTemplateGetLicenseTermsResponse,
  PiLicenseTemplateReadOnlyClient,
  SimpleWalletClient,
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
import { getLicenseTermByType, validateLicenseTerms } from "../utils/licenseTermsHelper";
import { chain, getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";

export class LicenseClient {
  public licenseRegistryClient: LicenseRegistryEventClient;
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public piLicenseTemplateReadOnlyClient: PiLicenseTemplateReadOnlyClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public moduleRegistryReadOnlyClient: ModuleRegistryReadOnlyClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: SupportedChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.licenseRegistryClient = new LicenseRegistryEventClient(rpcClient);
    this.piLicenseTemplateReadOnlyClient = new PiLicenseTemplateReadOnlyClient(rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.moduleRegistryReadOnlyClient = new ModuleRegistryReadOnlyClient(rpcClient);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
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
   *   @param request.licenseTemplate The address of the license template.
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
   *   @param request.licenseTemplate The address of the license template.
   *   @param request.licenseTermsId The ID of the license terms within the license template.
   *   @param request.amount The amount of license tokens to mint.
   *   @param request.receiver The address of the receiver.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license token IDs.
   * @emits LicenseTokensMinted (msg.sender, licensorIpId, licenseTemplate, licenseTermsId, amount, receiver, startLicenseTokenId);
   */
  public async mintLicenseTokens(
    request: MintLicenseTokensRequest,
  ): Promise<MintLicenseTokensResponse> {
    try {
      request.licenseTermsId = BigInt(request.licenseTermsId);
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.licensorIpId, "request.licensorIpId"),
      });
      if (!isLicenseIpIdRegistered) {
        throw new Error(`The licensor IP with id ${request.licensorIpId} is not registered.`);
      }
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId: request.licenseTermsId,
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
          licenseTermsId: request.licenseTermsId,
        });
      if (!isAttachedLicenseTerms) {
        throw new Error(
          `License terms id ${request.licenseTermsId} is not attached to the IP with id ${request.licensorIpId}.`,
        );
      }
      const amount = BigInt(request.amount || 1);
      const req = {
        licensorIpId: request.licensorIpId,
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        licenseTermsId: request.licenseTermsId,
        amount,
        receiver:
          (request.receiver && getAddress(request.receiver, "request.receiver")) ||
          this.wallet.account!.address,
        royaltyContext: zeroAddress,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.licensingModuleClient.mintLicenseTokensEncode(req) };
      } else {
        const txHash = await this.licensingModuleClient.mintLicenseTokens(req);
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs = this.licensingModuleClient.parseTxLicenseTokensMintedEvent(txReceipt);
          const startLicenseTokenId = targetLogs[0].startLicenseTokenId;
          const licenseTokenIds = [];
          for (let i = 0; i < amount; i++) {
            licenseTokenIds.push(startLicenseTokenId + BigInt(i));
          }
          return { txHash: txHash, licenseTokenIds: licenseTokenIds };
        } else {
          return { txHash: txHash };
        }
      }
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
   *   @param request.licenseTemplate [Optional] The address of the license template,default value is Programmable IP License.
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
   * @param request - The request object that contains all data needed to set licensing config.
   *   @param request.ipId The address of the IP for which the configuration is being set.
   *   @param request.licenseTermsId The ID of the license terms within the license template.
   *   @param request.licenseTemplate The address of the license template used, If not specified, the configuration applies to all licenses.
   *   @param request.licensingConfig The licensing configuration for the license.
   *   @param request.licensingConfig.isSet Whether the configuration is set or not.
   *   @param request.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *   @param request.licensingConfig.hookData The data to be used by the licensing hook.
   *   @param request.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes success.
   */
  public async setLicensingConfig(
    request: SetLicensingConfigRequest,
  ): Promise<SetLicensingConfigResponse> {
    try {
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.ipId, "request.ipId"),
      });
      if (!isLicenseIpIdRegistered) {
        throw new Error(`The licensor IP with id ${request.ipId} is not registered.`);
      }
      const licenseTermsId = BigInt(request.licenseTermsId);
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId,
      });
      if (!isExisted) {
        throw new Error(`License terms id ${request.licenseTermsId} do not exist.`);
      }
      if (request.licensingConfig.licensingHook !== zeroAddress) {
        const isRegistered = await this.moduleRegistryReadOnlyClient.isRegistered({
          moduleAddress: request.licensingConfig.licensingHook,
        });
        if (!isRegistered) {
          throw new Error("The licensing hook is not registered.");
        }
      }

      if (request.licenseTemplate === zeroAddress && request.licenseTermsId !== 0n) {
        throw new Error("licenseTemplate is zero address but licenseTermsId is zero.");
      }
      const object: LicensingModuleSetLicensingConfigRequest = {
        ipId: request.ipId,
        licenseTemplate: getAddress(request.licenseTemplate, "request.licenseTemplate"),
        licenseTermsId,
        licensingConfig: {
          isSet: request.licensingConfig.isSet,
          mintingFee: BigInt(request.licensingConfig.mintingFee),
          hookData: request.licensingConfig.hookData,
          licensingHook: request.licensingConfig.licensingHook,
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.licensingModuleClient.setLicensingConfigEncode(object) };
      } else {
        const txHash = await this.licensingModuleClient.setLicensingConfig(object);
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
