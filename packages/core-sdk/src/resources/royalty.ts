import { PublicClient, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import { SupportedChainIds } from "../types/config";
import {
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
} from "../types/resources/royalty";
import { getRoyaltyVaultImplConfig } from "../abi/config";

export class RoyaltyClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  public royaltyVaultImplConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, chainId: SupportedChainIds) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.royaltyVaultImplConfig = getRoyaltyVaultImplConfig(chainId);
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
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.royaltyVaultImplConfig,
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
}
