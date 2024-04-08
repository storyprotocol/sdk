import { Hex, PublicClient, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import { SupportedChainIds } from "../types/config";
import {
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
} from "../types/resources/royalty";
import {
  getRoyaltyModuleConfig,
  getRoyaltyPolicyLAPConfig,
  getRoyaltyVaultImplConfig,
} from "../abi/config";
import { waitTx } from "../utils/utils";

export class RoyaltyClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  public royaltyVaultImplConfig;
  public royaltyPolicyLAPConfig;
  public royaltyModuleConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, chainId: SupportedChainIds) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.royaltyVaultImplConfig = getRoyaltyVaultImplConfig(chainId);
    this.royaltyPolicyLAPConfig = getRoyaltyPolicyLAPConfig(chainId);
    this.royaltyModuleConfig = getRoyaltyModuleConfig(chainId);
  }
  /**
   * Allows ancestors to claim the royalty tokens and any accrued revenue tokens
   * @param request - the licensing parameters for the Programmable IP License v1 (PIL) standard.
   *   @param request.ancestorIpId The ip id of the ancestor to whom the royalty tokens belong to.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns Tx hash for the transaction.
   * @emits RoyaltyTokensCollected (ancestorIpId, ancestorsRoyalty)
   */
  public async collectRoyaltyTokens(
    request: CollectRoyaltyTokensRequest,
  ): Promise<CollectRoyaltyTokensResponse> {
    try {
      const proxyAddress = await this.getProxyAddress(request.derivativeId);
      if (!proxyAddress) {
        throw new Error("Proxy address not found");
      }
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.royaltyVaultImplConfig,
        address: proxyAddress,
        functionName: "collectRoyaltyTokens",
        args: [request.ancestorIpId],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to collect royalty tokens");
    }
  }

  private async getProxyAddress(derivativeID: Hex) {
    const data = await this.rpcClient.readContract({
      ...this.royaltyPolicyLAPConfig,
      functionName: "getRoyaltyData",
      args: [derivativeID],
    });
    if (Array.isArray(data) && data[1]) {
      return data[1];
    }
  }

  /**
   * Allows the function caller to pay royalties to the receiver IP asset on behalf of the payer IP asset.
   * @param request - The request object that contains all data needed to pay royalty on behalf.
   *   @param request.receiverIpId The ipId that receives the royalties.
   *   @param request.payerIpId The ID of the IP asset that pays the royalties.
   *   @param request.token The token to use to pay the royalties.
   *   @param request.amount The amount to pay.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits RoyaltyPaid (receiverIpId, payerIpId, msg.sender, token, amount)
   */
  public async payRoyaltyOnBehalf(
    request: PayRoyaltyOnBehalfRequest,
  ): Promise<PayRoyaltyOnBehalfResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.royaltyModuleConfig,
        functionName: "payRoyaltyOnBehalf",
        args: [request.receiverIpId, request.payerIpId, request.token, request.amount],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        await waitTx(this.rpcClient, txHash);
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to pay royalty on behalf");
    }
  }
}
