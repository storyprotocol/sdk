import { PublicClient, getAddress, zeroAddress } from "viem";

import {
  IpAssetRegistryClient,
  LicenseRegistryEventClient,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  PiLicenseTemplateGetLicenseTermsResponse,
  PiLicenseTemplateReadOnlyClient,
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
} from "../types/resources/license";
import { handleError } from "../utils/errors";
import { getLicenseTermByType } from "../utils/getLicenseTermsByType";

export class LicenseClient {
  public licenseRegistryClient: LicenseRegistryEventClient;
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public piLicenseTemplateReadOnlyClient: PiLicenseTemplateReadOnlyClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public royaltyPolicyLAPClient: RoyaltyPolicyLapClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.licenseRegistryClient = new LicenseRegistryEventClient(rpcClient);
    this.piLicenseTemplateReadOnlyClient = new PiLicenseTemplateReadOnlyClient(rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.royaltyPolicyLAPClient = new RoyaltyPolicyLapClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }
  /**
   * Convenient function to register a PIL non commercial social remix license to the registry
   * @param request - [Optional] The request object that contains all data needed to register a PIL non commercial social remix license.
   *   @param request.txOptions [Optional] The transaction options.
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
      const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });
      if (request?.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
        return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register non commercial social remixing PIL");
    }
  }
  /**
   * Convenient function to register a PIL commercial use license to the registry.
   * @param request - The request object that contains all data needed to register a PIL commercial use license.
   *   @param request.mintingFee The fee to be paid when minting a license.
   *   @param request.currency The ERC20 token to be used to pay the minting fee and the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialUsePIL(
    request: RegisterCommercialUsePILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
        mintingFee: request.mintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
      });
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
        return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register commercial use PIL");
    }
  }
  /**
   * Convenient function to register a PIL commercial Remix license to the registry.
   * @param request - The request object that contains all data needed to register license.
   *   @param request.mintingFee The fee to be paid when minting a license.
   *   @param request.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *   @param request.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialRemixPIL(
    request: RegisterCommercialRemixPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_REMIX, {
        mintingFee: request.mintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
        commercialRevShare: request.commercialRevShare,
      });
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0n) {
        return { licenseTermsId: licenseTermsId };
      }
      const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
        return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
      } else {
        return { txHash: txHash };
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
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async attachLicenseTerms(request: AttachLicenseTermsRequest) {
    try {
      request.licenseTermsId = BigInt(request.licenseTermsId);
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.ipId),
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
            (request.licenseTemplate && getAddress(request.licenseTemplate)) ||
            this.licenseTemplateClient.address,
          licenseTermsId: request.licenseTermsId,
        });
      if (isAttachedLicenseTerms) {
        throw new Error(
          `License terms id ${request.licenseTermsId} is already attached to the IP with id ${request.ipId}.`,
        );
      }
      const txHash = await this.licensingModuleClient.attachLicenseTerms({
        ipId: request.ipId,
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        licenseTermsId: request.licenseTermsId,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash };
      } else {
        return { txHash: txHash };
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
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional license token ID if waitForTxn is set to true.
   * @emits LicenseTokensMinted (msg.sender, licensorIpId, licenseTemplate, licenseTermsId, amount, receiver, startLicenseTokenId);
   */
  public async mintLicenseTokens(
    request: MintLicenseTokensRequest,
  ): Promise<MintLicenseTokensResponse> {
    try {
      request.licenseTermsId = BigInt(request.licenseTermsId);
      const isLicenseIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.licensorIpId),
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
            (request.licenseTemplate && getAddress(request.licenseTemplate)) ||
            this.licenseTemplateClient.address,
          licenseTermsId: request.licenseTermsId,
        });
      if (!isAttachedLicenseTerms) {
        throw new Error(
          `License terms id ${request.licenseTermsId} is not attached to the IP with id ${request.licensorIpId}.`,
        );
      }
      const txHash = await this.licensingModuleClient.mintLicenseTokens({
        licensorIpId: request.licensorIpId,
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        licenseTermsId: request.licenseTermsId,
        amount: BigInt(request.amount || 1),
        receiver:
          (request.receiver && getAddress(request.receiver)) || this.wallet.account!.address,
        royaltyContext: zeroAddress,
      });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licensingModuleClient.parseTxLicenseTokensMintedEvent(txReceipt);

        return {
          txHash: txHash,
          licenseTokenId: targetLogs[0].startLicenseTokenId,
        };
      } else {
        return { txHash: txHash };
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
    selectedLicenseTermsId: string | number | bigint,
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
}
