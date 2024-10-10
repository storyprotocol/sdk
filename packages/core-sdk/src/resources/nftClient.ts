import { PublicClient, isAddress, maxUint32, zeroAddress } from "viem";

import { RegistrationWorkflowsClient, SimpleWalletClient } from "../abi/generated";
import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "../types/resources/nftClient";
import { handleError } from "../utils/errors";
import { getAddress } from "../utils/utils";

export class NftClient {
  public registrationWorkflowsClient: RegistrationWorkflowsClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.registrationWorkflowsClient = new RegistrationWorkflowsClient(rpcClient, wallet);
  }

  /**
   * Creates a new SPG NFT Collection.
   * @param request - The request object containing necessary data to create a SPG NFT Collection.
   *   @param request.name - The name of the collection.
   * 	 @param request.symbol - The symbol of the collection.
   * 	 @param request.isPublicMinting - If true, anyone can mint from the collection. If false, only the addresses with the minter role can mint.
   * 	 @param request.mintOpen Whether the collection is open for minting on creation.
   *   @param request.mintFeeRecipient - The address to receive mint fees.
   * 	 @param request.baseURI - [Optional] The base URI for the collection. If baseURI is not empty, tokenURI will be either baseURI + token ID (if nftMetadataURI is empty) or baseURI + nftMetadataURI.
   * 	 @param request.maxSupply - [Optional] The maximum supply of the collection.
   * 	 @param request.mintFee - [Optional] The cost to mint a token.
   * 	 @param request.mintFeeToken - [Optional] The token to mint.
   * 	 @param request.owner - [Optional] The owner of the collection.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a CreateNFTCollectionResponse containing the transaction hash and collection address.
   * @emits CollectionCreated (spgNftContract);
   */
  public async createNFTCollection(
    request: CreateNFTCollectionRequest,
  ): Promise<CreateNFTCollectionResponse> {
    try {
      if (
        request.mintFee !== undefined &&
        (request.mintFee < 0n || !isAddress(request.mintFeeToken || ""))
      ) {
        throw new Error("Invalid mint fee token address, mint fee is greater than 0.");
      }

      const spgNftInitParams = {
        name: request.name,
        symbol: request.symbol,
        baseURI: request.baseURI ?? "",
        maxSupply: request.maxSupply ?? Number(maxUint32),
        mintFee: request.mintFee ?? 0n,
        mintFeeToken: request.mintFeeToken ?? zeroAddress,
        owner:
          (request.owner && getAddress(request.owner, "request.owner")) ||
          this.wallet.account!.address,
        mintFeeRecipient: getAddress(request.mintFeeRecipient, "request.mintFeeRecipient"),
        mintOpen: request.mintOpen,
        isPublicMinting: request.isPublicMinting,
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.registrationWorkflowsClient.createCollectionEncode({
            spgNftInitParams,
          }),
        };
      } else {
        const txHash = await this.registrationWorkflowsClient.createCollection({
          spgNftInitParams,
        });
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.registrationWorkflowsClient.parseTxCollectionCreatedEvent(txReceipt);
          return {
            txHash: txHash,
            nftContract: targetLogs[0].spgNftContract,
          };
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to create a SPG NFT collection");
    }
  }
}
