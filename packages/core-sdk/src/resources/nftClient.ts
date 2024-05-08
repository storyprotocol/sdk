import { PublicClient, getAddress, isAddress, maxUint32, zeroAddress } from "viem";

import { SimpleWalletClient, SpgClient } from "../abi/generated";
import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "../types/resources/nftClient";
import { handleError } from "../utils/errors";

export class NftClient {
  public spgClient: SpgClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.spgClient = new SpgClient(rpcClient, wallet);
  }

  /**
   * Creates a new SPG NFT Collection.
   * @param request - The request object containing necessary data to create a SPG NFT Collection.
   *   @param request.name - The name of the collection.
   * 	 @param request.symbol - The symbol of the collection.
   * 	 @param request.maxSupply - The maximum supply of the collection.
   * 	 @param request.mintCost - The cost to mint a token.
   * 	 @param request.mintToken - The token to mint.
   * 	 @param request.owner - The owner of the collection.
   *   @param request.txOptions - Optional transaction options.
   * @returns A Promise that resolves to a CreateNFTCollectionResponse containing the transaction hash and collection address.
   * @emits CollectionCreated (nftContract);
   */
  public async createNFTCollection<
    TReq extends CreateNFTCollectionRequest,
    TRes = CreateNFTCollectionResponse<TReq>,
  >(request: TReq): Promise<TRes> {
    try {
      if (request.mintCost && request.mintCost > 0n && !isAddress(request.mintToken || "")) {
        throw new Error("Invalid mint token address, mint cost is greater than 0.");
      }

      const txHash = await this.spgClient.createCollection({
        name: request.name,
        symbol: request.symbol,
        maxSupply: request.maxSupply ?? Number(maxUint32),
        mintCost: request.mintCost ?? 0n,
        mintToken: request.mintToken ?? zeroAddress,
        owner: (request.owner && getAddress(request.owner)) || this.wallet.account!.address,
      });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.spgClient.parseTxCollectionCreatedEvent(txReceipt);
        return {
          txHash: txHash,
          nftContract: targetLogs[0].nftContract,
        } as TRes;
      }
      return { txHash: txHash } as TRes;
    } catch (error) {
      handleError(error, "Failed to create a SPG NFT collection");
    }
  }
}
