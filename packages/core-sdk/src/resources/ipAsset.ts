import { PublicClient, WalletClient, getAddress } from "viem";

import { StoryAPIClient } from "../clients/storyAPI";
import { chain, parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { getIPAssetRegistryConfig } from "../abi/config";
import { SupportedChainIds } from "../types/config";
import { storyTestnetAddress } from "../../test/env";
import { metadata } from "../constants/common";
import { handleError } from "../utils/errors";
import { RegisterRequest } from "../types/resources/ipAsset";

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
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
    console.log("ipId", ipId);
    const isRegistered = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "isRegistered",
      args: [ipId],
    });
    console.log("isRegistered", isRegistered);
    return isRegistered ? ipId : "0x";
  }

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request The request object that contains all data needed to register IP.
   *  @param request.chainId The chain identifier of where the NFT resides.
   *  @param request.tokenContract The address of the NFT.
   *  @param request.tokenId The token identifier of the NFT.
   *  @param request.createAccount Whether to create an IP account when registering.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async register(request: RegisterRequest) {
    try {
      const ipId = await this.isNFTRegistered(
        chain[this.chainId],
        request.tokenContract,
        request.tokenId,
      );
      console.log("ipId", ipId);
      if (ipId !== "0x") {
        return { ipId: ipId };
      }
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.ipAssetRegistryConfig,
        functionName: "register",
        args: [
          parseToBigInt(request.chainId),
          getAddress(request.tokenContract),
          parseToBigInt(request.tokenId),
          storyTestnetAddress.IPResolver,
          request.createAccount,
          metadata,
        ],
        account: this.wallet.account,
      });
      console.log("call", call);
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
}
