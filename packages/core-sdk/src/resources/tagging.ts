import { PublicClient, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import { TaggingModuleConfig } from "../abi/config";
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

  public async readIsTagged({ tag, ipId }: { tag: string; ipId: `0x${string}` }) {
    return await this.rpcClient.readContract({
      ...TaggingModuleConfig,
      functionName: "isTagged",
      args: [tag, ipId],
    });
  }

  public async readTotalTagsForIp({ ipId }: { ipId: `0x${string}` }) {
    return await this.rpcClient.readContract({
      ...TaggingModuleConfig,
      functionName: "totalTagsForIp",
      args: [ipId],
    });
  }

  public async readTagAtIndexForIp({
    ipId,
    index,
  }: {
    ipId: `0x${string}`;
    index: number | string | bigint;
  }) {
    return await this.rpcClient.readContract({
      ...TaggingModuleConfig,
      functionName: "tagAtIndexForIp",
      args: [ipId, BigInt(index)],
    });
  }

  public async readTagStringAtIndexForIp({
    ipId,
    index,
  }: {
    ipId: `0x${string}`;
    index: number | string | bigint;
  }) {
    return await this.rpcClient.readContract({
      ...TaggingModuleConfig,
      functionName: "tagStringAtIndexForIp",
      args: [ipId, BigInt(index)],
    });
  }

  public async readName() {
    return await this.rpcClient.readContract({ ...TaggingModuleConfig, functionName: "name" });
  }

  public async readMaxTagPermissionsAtOnce() {
    return await this.rpcClient.readContract({
      ...TaggingModuleConfig,
      functionName: "MAX_TAG_PERMISSIONS_AT_ONCE",
    });
  }
}
