import { Hex, PublicClient, getAddress, zeroAddress } from "viem";

import { chain } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import {
  RegisterDerivativeRequest,
  RegisterDerivativeResponse,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
  RegisterIpResponse,
  RegisterRequest,
} from "../types/resources/ipAsset";
import {
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  SimpleWalletClient,
} from "../abi/generated";

export class IPAssetClient {
  private readonly rpcClient: PublicClient;
  private readonly chainId: SupportedChainIds;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public licensingModuleClient: LicensingModuleClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  private licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.rpcClient = rpcClient;
    this.chainId = chainId;
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.licensingModuleClient = new LicensingModuleClient(this.rpcClient, wallet);
    this.licenseTemplateClient = new PiLicenseTemplateClient(this.rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(this.rpcClient);
  }

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request The request object that contains all data needed to register IP.
   *  @param request.tokenContract The address of the NFT.
   *  @param request.tokenId The token identifier of the NFT.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async register(request: RegisterRequest): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipId = await this.isNFTRegistered(request.tokenContract, tokenId);
      if (ipId !== "0x") {
        return { ipId: ipId };
      }
      const txHash = await this.ipAssetRegistryClient.register({
        tokenContract: getAddress(request.tokenContract),
        tokenId: tokenId,
      });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
        return { txHash: txHash, ipId: targetLogs[0].ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register IP");
    }
  }

  /**
   * Registers a derivative directly with parent IP's license terms, without needing license tokens,
   * and attaches the license terms of the parent IPs to the derivative IP.
   * The license terms must be attached to the parent IP before calling this function.
   * All IPs attached default license terms by default.
   * The derivative IP owner must be the caller or an authorized operator.
   * @param request The request object that contains all data needed to register derivative IP.
   *  @param request.childIpId The derivative IP ID.
   *  @param request.parentIpIds The parent IP IDs.
   *  @param request.licenseTermsIds The IDs of the license terms that the parent IP supports.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
    try {
      if (!(await this.isIpIdRegistered(request.childIpId))) {
        throw new Error("IP asset must be registered before registering derivative");
      }
      for (const parentId of request.parentIpIds) {
        if (!(await this.isIpIdRegistered(parentId))) {
          throw new Error("Parent IP asset must be registered before registering derivative");
        }
      }
      if (request.parentIpIds.length !== request.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs");
      }
      for (let i = 0; i < request.parentIpIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: request.parentIpIds[i],
            licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
            licenseTermsId: BigInt(request.licenseTermsIds[i]),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            "License terms must be attached to the parent ipId  before registering derivative",
          );
        }
      }

      const txHash = await this.licensingModuleClient.registerDerivative({
        childIpId: request.childIpId,
        parentIpIds: request.parentIpIds,
        licenseTermsIds: request.licenseTermsIds.map((id) => BigInt(id)),
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        royaltyContext: zeroAddress,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative");
    }
  }

  /**
   * Registers a derivative with license tokens.
   * the derivative IP is registered with license tokens minted from the parent IP's license terms.
   * the license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * the caller must be the derivative IP owner or an authorized operator.
   * @param request The request object that contains all data needed to register derivative license tokens.
   *  @param request.childIpId The derivative IP ID.
   *  @param request.licenseTokenIds The IDs of the license tokens.
   *  @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async registerDerivativeWithLicenseTokens(
    request: RegisterDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterDerivativeWithLicenseTokensResponse> {
    try {
      if (!(await this.isIpIdRegistered(request.childIpId))) {
        throw new Error(
          "IP asset must be registered before registering derivative with license tokens",
        );
      }
      const txHash = await this.licensingModuleClient.registerDerivativeWithLicenseTokens({
        childIpId: request.childIpId,
        licenseTokenIds: request.licenseTokenIds.map((id) => BigInt(id)),
        royaltyContext: zeroAddress,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative with license tokens");
    }
  }

  private async isNFTRegistered(tokenAddress: Hex, tokenId: bigint): Promise<Hex> {
    const ipId = await this.ipAssetRegistryClient.ipId({
      chainId: BigInt(chain[this.chainId]),
      tokenContract: tokenAddress,
      tokenId: tokenId,
    });
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({ id: ipId });
    return isRegistered ? ipId : "0x";
  }

  private async isIpIdRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: ipId });
  }
}
