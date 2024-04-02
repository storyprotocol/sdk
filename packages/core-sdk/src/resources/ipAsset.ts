import { PublicClient, WalletClient } from "viem";

import { StoryAPIClient } from "../clients/storyAPI";
import { parseToBigInt } from "../utils/utils";
import { getIPAssetRegistryConfig } from "../abi/config";
import { SupportedChainIds } from "../types/config";

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private readonly storyClient: StoryAPIClient;
  private readonly chainId: SupportedChainIds;
  public ipAssetRegistryConfig;

  constructor(
    rpcClient: PublicClient,
    wallet: WalletClient,
    storyClient: StoryAPIClient,
    chainId: SupportedChainIds,
  ) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.storyClient = storyClient;
    this.chainId = chainId;
    this.ipAssetRegistryConfig = getIPAssetRegistryConfig(chainId);
  }
  private async isNFTRegistered(
    chainId: string,
    tokenAddress: `0x${string}`,
    tokenId: string,
  ): Promise<`0x${string}`> {
    const ipId = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "ipId",
      args: [parseToBigInt(chainId), tokenAddress, parseToBigInt(tokenId)],
    });
    const isRegistered = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "isRegistered",
      args: [ipId],
    });

    return isRegistered ? ipId : "0x";
  }
}
