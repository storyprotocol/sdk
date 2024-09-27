import { PublicClient, zeroAddress } from "viem";

import {
  IpAssetRegistryClient,
  LicenseRegistryEventClient,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  PiLicenseTemplateGetLicenseTermsResponse,
  PiLicenseTemplateReadOnlyClient,
  RoyaltyModuleReadOnlyClient,
  RoyaltyPolicyLapClient,
  SimpleWalletClient,
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
} from "../types/resources/license";
import { handleError } from "../utils/errors";
import { getLicenseTermByType } from "../utils/getLicenseTermsByType";
import { getAddress } from "../utils/utils";

export class LicenseClient {
  public licenseRegistryClient: LicenseRegistryEventClient;
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public piLicenseTemplateReadOnlyClient: PiLicenseTemplateReadOnlyClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public royaltyPolicyLAPClient: RoyaltyPolicyLapClient;
  public royaltyModuleReadOnlyClient: RoyaltyModuleReadOnlyClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.licenseRegistryClient = new LicenseRegistryEventClient(rpcClient);
    this.piLicenseTemplateReadOnlyClient = new PiLicenseTemplateReadOnlyClient(rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.royaltyPolicyLAPClient = new RoyaltyPolicyLapClient(rpcClient, wallet);
    this.royaltyModuleReadOnlyClient = new RoyaltyModuleReadOnlyClient(rpcClient);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
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
   * @returns A Promise that resolves to an object containing the optional transaction hash, optional transaction encodedTxData and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerPILTerms(request: RegisterPILTermsRequest): Promise<RegisterPILResponse> {
    try {
      const { royaltyPolicy, currency } = request;
      if (getAddress(royaltyPolicy, "request.royaltyPolicy") !== zeroAddress) {
        const isWhitelistedArbitrationPolicy =
          await this.royaltyModuleReadOnlyClient.isWhitelistedRoyaltyPolicy({ royaltyPolicy });
        if (!isWhitelistedArbitrationPolicy) {
          throw new Error("The royalty policy is not whitelisted.");
        }
      }
      if (getAddress(currency, "request.currency") !== zeroAddress) {
        const isWhitelistedRoyaltyToken =
          await this.royaltyModuleReadOnlyClient.isWhitelistedRoyaltyToken({
            token: currency,
          });
        if (!isWhitelistedRoyaltyToken) {
          throw new Error("The currency token is not whitelisted.");
        }
      }
      if (royaltyPolicy !== zeroAddress && currency === zeroAddress) {
        throw new Error("Royalty policy requires currency token.");
      }
      const object = {
        ...request,
        defaultMintingFee: BigInt(request.defaultMintingFee),
        expiration: BigInt(request.expiration),
        commercialRevCeiling: BigInt(request.commercialRevCeiling),
        derivativeRevCeiling: BigInt(request.derivativeRevCeiling),
      };
      this.verifyCommercialUse(object);
      this.verifyDerivatives(object);
      if (object.commercialRevShare < 0 || object.commercialRevShare > 100) {
        throw new Error("CommercialRevShare should be between 0 and 100.");
      } else {
        object.commercialRevShare = (object.commercialRevShare / 100) * 100000000;
      }
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
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
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
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialUsePIL(
    request: RegisterCommercialUsePILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
        defaultMintingFee: request.defaultMintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
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
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialRemixPIL(
    request: RegisterCommercialRemixPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
        defaultMintingFee: request.defaultMintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
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
   * @returns A Promise that resolves to an object containing the transaction hash.
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
   * @returns A Promise that resolves to an object containing the transaction hash and optional license token IDs if waitForTxn is set to true.
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

  private async getLicenseTermsId(request: LicenseTerms): Promise<LicenseTermsIdResponse> {
    const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({ terms: request });
    return licenseRes.selectedLicenseTermsId;
  }
  private verifyCommercialUse(terms: LicenseTerms) {
    if (!terms.commercialUse) {
      if (terms.commercialAttribution) {
        throw new Error("Cannot add commercial attribution when commercial use is disabled.");
      }
      if (terms.commercializerChecker !== zeroAddress) {
        throw new Error("Cannot add commercializerChecker when commercial use is disabled.");
      }
      if (terms.commercialRevShare > 0) {
        throw new Error("Cannot add commercial revenue share when commercial use is disabled.");
      }
      if (terms.commercialRevCeiling > 0) {
        throw new Error("Cannot add commercial revenue ceiling when commercial use is disabled.");
      }
      if (terms.derivativeRevCeiling > 0) {
        throw new Error(
          "Cannot add derivative revenue ceiling share when commercial use is disabled.",
        );
      }
      if (terms.royaltyPolicy !== zeroAddress) {
        throw new Error("Cannot add commercial royalty policy when commercial use is disabled.");
      }
    } else {
      if (terms.royaltyPolicy === zeroAddress) {
        throw new Error("Royalty policy is required when commercial use is enabled.");
      }
    }
  }

  private verifyDerivatives(terms: LicenseTerms) {
    if (!terms.derivativesAllowed) {
      if (terms.derivativesAttribution) {
        throw new Error("Cannot add derivative attribution when derivative use is disabled.");
      }
      if (terms.derivativesApproval) {
        throw new Error("Cannot add derivative approval when derivative use is disabled.");
      }
      if (terms.derivativesReciprocal) {
        throw new Error("Cannot add derivative reciprocal when derivative use is disabled.");
      }
      if (terms.derivativeRevCeiling > 0) {
        throw new Error("Cannot add derivative revenue ceiling when derivative use is disabled.");
      }
    }
  }
}
