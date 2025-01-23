import { PublicClient, zeroAddress } from "viem";

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
  PiLicenseTemplateClient,
  PiLicenseTemplateGetLicenseTermsResponse,
  PiLicenseTemplateReadOnlyClient,
  SimpleWalletClient,
} from "../abi/generated";
import {
  RegisterPILResponse,
  AttachLicenseTermsRequest,
  LicenseTermsIdResponse,
  MintLicenseTokensRequest,
  MintLicenseTokensResponse,
  PIL_TYPE,
  AttachLicenseTermsResponse,
  LicenseTermsId,
  PILTerms,
  PredictMintingLicenseFeeRequest,
  SetLicensingConfigRequest,
  SetLicensingConfigResponse,
  RegisterPILTermsRequest,
  CommercialLicenseTerms,
  CommercialRemixLicenseTerms,
  PILTermsInput,
} from "../types/resources/license";
import { handleError } from "../utils/errors";
import { getRevenueShare, validateLicenseTerms } from "../utils/licenseTermsHelper";
import { getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { PILFlavor } from "./PILFlavor";

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
   * If terms and type are both not provided, it will return the license terms ID of the no commercial license terms.
   * It will emit LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms).
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes license terms Id.
   */
  public async registerPILTerms<const PILType extends PIL_TYPE>(
    request: RegisterPILTermsRequest<PILType>,
  ): Promise<RegisterPILResponse> {
    try {
      let terms: PILTerms;
      if (!request.terms && !request.PILType) {
        terms = PILFlavor.nonComSocialRemixingPIL();
      } else if (request.PILType !== undefined) {
        terms = this.createTerms(request.PILType, request.terms);
      } else {
        terms = await validateLicenseTerms(request.terms as PILTermsInput, this.rpcClient);
      }
      const licenseTermsId = await this.getLicenseTermsId(terms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      if (request?.txOptions?.encodedTxDataOnly === true) {
        return {
          encodedTxData: this.licenseTemplateClient.registerLicenseTermsEncode({
            terms: terms,
          }),
        };
      } else {
        const txHash = await this.licenseTemplateClient.registerLicenseTerms({
          terms: terms,
        });
        if (request?.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
          return { txHash, licenseTermsId: targetLogs[0].licenseTermsId };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to register license terms");
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
      const req: LicensingModuleMintLicenseTokensRequest = {
        licensorIpId: getAddress(request.licensorIpId, "request.licensorIpId"),
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
        amount: BigInt(request.amount || 1),
        receiver:
          (request.receiver && getAddress(request.receiver, "request.receiver")) ||
          this.wallet.account!.address,
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
          for (let i = 0; i < req.amount; i++) {
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
   * @param request - The request object that contains all data needed to set licensing config.
   *   @param request.ipId The address of the IP for which the configuration is being set.
   *   @param request.licenseTermsId The ID of the license terms within the license template.
   *   @param request.licenseTemplate The address of the license template used, If not specified, the configuration applies to all licenses.
   *   @param request.licensingConfig The licensing configuration for the license.
   *   @param request.licensingConfig.isSet Whether the configuration is set or not.
   *   @param request.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *   @param request.licensingConfig.hookData The data to be used by the licensing hook.
   *   @param request.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none.
   *   @param request.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *   @param request.licensingConfig.disabled Whether the license is disabled or not.
   *   @param request.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *    If the remaining reward share in the group is less than the minimumGroupRewardShare, the IP cannot be added to the group.
   *   @param request.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address,
   *    or address(0) if the IP does not want to be added to any group.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes success.
   */
  public async setLicensingConfig(
    request: SetLicensingConfigRequest,
  ): Promise<SetLicensingConfigResponse> {
    try {
      const req: LicensingModuleSetLicensingConfigRequest = {
        ipId: request.ipId,
        licenseTemplate: getAddress(request.licenseTemplate, "request.licenseTemplate"),
        licenseTermsId: BigInt(request.licenseTermsId),
        licensingConfig: {
          isSet: request.licensingConfig.isSet,
          mintingFee: BigInt(request.licensingConfig.mintingFee),
          hookData: request.licensingConfig.hookData,
          licensingHook: request.licensingConfig.licensingHook,
          disabled: request.licensingConfig.disabled,
          commercialRevShare: getRevenueShare(request.licensingConfig.commercialRevShare),
          expectGroupRewardPool: getAddress(
            request.licensingConfig.expectGroupRewardPool,
            "request.licensingConfig.expectGroupRewardPool",
          ),
          expectMinimumGroupRewardShare: Number(
            request.licensingConfig.expectMinimumGroupRewardShare,
          ),
        },
      };
      if (req.licensingConfig.mintingFee < 0) {
        throw new Error("The minting fee must be greater than 0.");
      }
      if (
        request.licenseTemplate === zeroAddress &&
        request.licensingConfig.commercialRevShare !== 0
      ) {
        throw new Error(
          "The license template cannot be zero address if commercial revenue share is not zero.",
        );
      }
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.ipId, "request.ipId"),
      });
      if (!isLicenseIpIdRegistered) {
        throw new Error(`The licensor IP with id ${request.ipId} is not registered.`);
      }
      const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
        licenseTermsId: req.licenseTermsId,
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
  private async getLicenseTermsId(request: PILTerms): Promise<LicenseTermsIdResponse> {
    const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({ terms: request });
    return licenseRes.selectedLicenseTermsId;
  }
  private createTerms(
    PILType: PIL_TYPE,
    terms: RegisterPILTermsRequest<PIL_TYPE>["terms"],
  ): PILTerms {
    let innerTerms: PILTerms;
    switch (PILType) {
      case PIL_TYPE.NON_COMMERCIAL_REMIX:
        innerTerms = PILFlavor.nonComSocialRemixingPIL();
        break;
      case PIL_TYPE.COMMERCIAL_USE:
        innerTerms = PILFlavor.commercialUsePIL(
          (terms as CommercialLicenseTerms).defaultMintingFee,
          (terms as CommercialLicenseTerms).currency,
          (terms as CommercialLicenseTerms).royaltyPolicy,
        );
        break;
      case PIL_TYPE.COMMERCIAL_REMIX:
        innerTerms = PILFlavor.commercialRemixPIL(
          (terms as CommercialRemixLicenseTerms).defaultMintingFee,
          (terms as CommercialRemixLicenseTerms).royaltyPolicy,
          (terms as CommercialRemixLicenseTerms).currency,
          (terms as CommercialRemixLicenseTerms).commercialRevShare,
        );
        break;
    }
    return innerTerms;
  }
}
