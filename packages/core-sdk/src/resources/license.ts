import { PublicClient, zeroAddress } from "viem";

import { StoryAPIClient } from "../clients/storyAPI";
import {
  IpAssetRegistryClient,
  LicenseRegistryEventClient,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
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
} from "../types/resources/license";
import { handleError } from "../utils/errors";

export class LicenseClient {
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;
  private readonly storyClient: StoryAPIClient;
  public licenseRegistryClient: LicenseRegistryEventClient;
  public licensingModuleClient: LicensingModuleClient;
  private licenseTemplateClient: PiLicenseTemplateClient;
  private royaltyPolicyLAPClient: RoyaltyPolicyLapClient;
  private licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, storyClient: StoryAPIClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.storyClient = storyClient;
    this.licenseRegistryClient = new LicenseRegistryEventClient(this.rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(this.rpcClient, this.wallet);
    this.licensingModuleClient = new LicensingModuleClient(this.rpcClient, this.wallet);
    this.royaltyPolicyLAPClient = new RoyaltyPolicyLapClient(this.rpcClient, this.wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(this.rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
  }
  /**
   * Convenient function to register a PIL non commercial social remix license to the registry
   * @param request The request object that contains all data needed to register a PIL non commercial social remix license.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerNonComSocialRemixingPIL(
    request: RegisterNonComSocialRemixingPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms: LicenseTerms = {
        transferable: true,
        royaltyPolicy: zeroAddress,
        mintingFee: BigInt(0),
        expiration: BigInt(0),
        commercialUse: false,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCelling: BigInt(0),
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCelling: BigInt(0),
        currency: zeroAddress,
      };
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0) {
        return { licenseTermsId: licenseTermsId.toString() };
      }
      const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);

        return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register non commercial social remixing PIL");
    }
  }
  /**
   * Convenient function to register a PIL commercial use license to the registry.
   * @param request The request object that contains all data needed to register a PIL commercial use license.
   *  @param request.mintingFee The fee to be paid when minting a license.
   *  @param request.currency The ERC20 token to be used to pay the minting fee.
   *  the token must be registered in story protocol.
   *  @param request.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialUsePIL(
    request: RegisterCommercialUsePILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms: LicenseTerms = {
        transferable: true,
        royaltyPolicy: this.royaltyPolicyLAPClient.address,
        mintingFee: BigInt(request.mintingFee),
        expiration: BigInt(0),
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCelling: BigInt(0),
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: false,
        derivativeRevCelling: BigInt(0),
        currency: request.currency,
      };
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0) {
        return { licenseTermsId: licenseTermsId.toString() };
      }

      const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
        return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register commercial use PIL");
    }
  }
  /**
   * Convenient function to register a PIL commercial Remix license to the registry.
   * @param request The request object that contains all data needed to register license.
   *  @param request.mintingFee The fee to be paid when minting a license.
   *  @param request.commercialRevShare Percentage of revenue that must be shared with the licensor.
   *  @param request.currency The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *  @param request.royaltyPolicy The address of the royalty policy contract which required to StoryProtocol in advance.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the optional transaction hash and optional license terms Id.
   * @emits LicenseTermsRegistered (licenseTermsId, licenseTemplate, licenseTerms);
   */
  public async registerCommercialRemixPIL(
    request: RegisterCommercialRemixPILRequest,
  ): Promise<RegisterPILResponse> {
    try {
      const licenseTerms: LicenseTerms = {
        transferable: true,
        royaltyPolicy: this.royaltyPolicyLAPClient.address,
        mintingFee: BigInt(request.mintingFee),
        expiration: BigInt(0),
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: request.commercialRevShare,
        commercialRevCelling: BigInt(0),
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCelling: BigInt(0),
        currency: request.currency,
      };
      const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
      if (licenseTermsId !== 0) {
        return { licenseTermsId: licenseTermsId.toString() };
      }
      const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
        return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register commercial remix PIL");
    }
  }

  /**
   * Attaches license terms to an IP.
   * @param request The request object that contains all data needed to attach license terms.
   @param request.ipId The IP ID.
   @param request.tokenAddress The address of the NFT.
   @param request.licenseTemplate The address of the license template.
   @param request.licenseTermsId The ID of the license terms.
      @param request.ipId The address of the IP to which the license terms are attached.
      @param request.licenseTemplate The address of the license template.
      @param request.licenseTermsId The ID of the license terms.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async attachLicenseTerms(request: AttachLicenseTermsRequest) {
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({ id: request.ipId });
    if (!isRegistered) {
      throw new Error("IP asset must be registered before attaching license terms");
    }
    const isAttachedLicenseTerms =
      await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
        ipId: request.ipId,
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
      });
    if (isAttachedLicenseTerms) {
      throw new Error("License terms are already attached to the IP");
    }
    const txHash = await this.licensingModuleClient.attachLicenseTerms({
      ipId: request.ipId,
      licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
      licenseTermsId: BigInt(request.licenseTermsId),
    });
    if (request.txOptions?.waitForTransaction) {
      await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash: txHash };
    } else {
      return { txHash: txHash };
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
   * @param request The request object that contains all data needed to mint license tokens.
   *  @param request.licensorIpId The licensor IP ID.
   *  @param request.licenseTemplate The address of the license template.
   *  @param request.licenseTermsId The ID of the license terms within the license template.
   *  @param request.amount The amount of license tokens to mint.
   *  @param request.receiver The address of the receiver.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional license token ID if waitForTxn is set to true.
   * @emits LicenseTokensMinted (msg.sender, licensorIpId, licenseTemplate, licenseTermsId, amount, receiver, startLicenseTokenId);
   */
  public async mintLicenseTokens(
    request: MintLicenseTokensRequest,
  ): Promise<MintLicenseTokensResponse> {
    try {
      const isAttachedLicenseTerms =
        await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
          ipId: request.licensorIpId,
          licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
          licenseTermsId: BigInt(request.licenseTermsId),
        });
      if (!isAttachedLicenseTerms) {
        throw new Error("License terms are not attached to the IP");
      }
      const txHash = await this.licensingModuleClient.mintLicenseTokens({
        licensorIpId: request.licensorIpId,
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
        amount: BigInt(request.amount || 1),
        receiver: request.receiver || this.wallet.account!.address,
        royaltyContext: zeroAddress,
      });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.licensingModuleClient.parseTxLicenseTokensMintedEvent(txReceipt);

        return {
          txHash: txHash,
          licenseTokenId: targetLogs[0].startLicenseTokenId.toString(),
        };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint license tokens");
    }
  }

  private async getLicenseTermsId(request: LicenseTerms): Promise<LicenseTermsIdResponse> {
    const licenseRes = await this.licenseTemplateClient.getLicenseTermsId({ terms: request });
    return Number(licenseRes.selectedLicenseTermsId);
  }
}
