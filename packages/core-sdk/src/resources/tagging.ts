import { AxiosInstance } from "axios";
import { PublicClient, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import { TaggingModuleConfig } from "../abi/taggingModule.abi";
import { TaggingReadOnlyClient } from "./taggingReadOnly";
import {
  RemoveTagRequest,
  RemoveTagResponse,
  SetTagRequest,
  SetTagResponse,
} from "../types/resources/tagging";

export class TaggingClient extends TaggingReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
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
