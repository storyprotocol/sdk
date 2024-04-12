import { Hex, PublicClient, WalletClient, getAddress, zeroAddress } from "viem";

import { chain, parseToBigInt, waitTx, waitTxAndFilterLog } from "../utils/utils";
import {
  getIPAssetRegistryConfig,
  getLicenseTemplateConfig,
  getLicensingModuleConfig,
} from "../abi/config";
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

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private readonly chainId: SupportedChainIds;
  public ipAssetRegistryConfig;
  public licenseModuleConfig;
  public licenseTemplateConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, chainId: SupportedChainIds) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.chainId = chainId;
    this.ipAssetRegistryConfig = getIPAssetRegistryConfig(chainId);
    this.licenseModuleConfig = getLicensingModuleConfig(chainId);
    this.licenseTemplateConfig = getLicenseTemplateConfig(chainId);
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
    const tokenId = parseToBigInt(request.tokenId);
    try {
      const ipId = await this.isNFTRegistered(request.tokenContract, tokenId);
      if (ipId !== "0x") {
        return { ipId: ipId };
      }
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.ipAssetRegistryConfig,
        functionName: "register",
        args: [getAddress(request.tokenContract), tokenId],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLogs = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.ipAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipId: targetLogs[0].args.ipId };
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
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.licenseModuleConfig,
        functionName: "registerDerivative",
        args: [
          request.childIpId,
          request.parentIpIds,
          request.licenseTermsIds.map((id) => BigInt(id)),
          request.licenseTemplate || this.licenseTemplateConfig.address,
          zeroAddress,
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        await waitTx(this.rpcClient, txHash);
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
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.licenseModuleConfig,
        functionName: "registerDerivativeWithLicenseTokens",
        args: [request.childIpId, request.licenseTokenIds.map((id) => BigInt(id)), zeroAddress],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        await waitTx(this.rpcClient, txHash);
        return { txHash: txHash };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative with license tokens");
    }
  }
  private async isNFTRegistered(tokenAddress: Hex, tokenId: bigint): Promise<Hex> {
    const ipId = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "ipId",
      args: [parseToBigInt(chain[this.chainId]), tokenAddress, tokenId],
    });
    const isRegistered = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "isRegistered",
      args: [ipId],
    });
    return isRegistered ? ipId : "0x";
  }
}
