import { PublicClient, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import { TaggingModuleConfig } from "../abi/taggingModule.abi";
import {
  RemoveTagRequest,
  RemoveTagResponse,
  SetTagRequest,
  SetTagResponse,
} from "../types/resources/tagging";

export class TaggingClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  public async setTag(request: SetTagRequest): Promise<SetTagResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...TaggingModuleConfig,
        functionName: "setTag",
        args: [request.tag, request.ipId],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to set tag");
    }
  }

  public async removeTag(request: RemoveTagRequest): Promise<RemoveTagResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...TaggingModuleConfig,
        functionName: "removeTag",
        args: [request.tag, request.ipId],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to remove tag");
    }
  }
}
