import { Hex, PublicClient, getAddress } from "viem";

import { chain, parseToBigInt } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import { RegisterIpResponse, RegisterRequest } from "../types/resources/ipAsset";
import { IpAssetRegistryClient, SimpleWalletClient } from "../abi/generated";

export class IPAssetClient {
  private readonly rpcClient: PublicClient;
  private readonly chainId: SupportedChainIds;
  public ipAssetRegistryClient: IpAssetRegistryClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.rpcClient = rpcClient;
    this.chainId = chainId;
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
  }

  private async isNFTRegistered(tokenAddress: Hex, tokenId: bigint): Promise<Hex> {
    const ipId = await this.ipAssetRegistryClient.ipId({
      chainId: parseToBigInt(chain[this.chainId]),
      tokenContract: tokenAddress,
      tokenId: tokenId,
    });
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({ id: ipId });
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
}
