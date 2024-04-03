import { Hex, PublicClient, WalletClient, getAddress } from "viem";

import { chain, parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { getIPAssetRegistryConfig } from "../abi/config";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import { RegisterIpResponse, RegisterRequest } from "../types/resources/ipAsset";

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private readonly chainId: SupportedChainIds;
  public ipAssetRegistryConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, chainId: SupportedChainIds) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.chainId = chainId;
    this.ipAssetRegistryConfig = getIPAssetRegistryConfig(chainId);
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
}
