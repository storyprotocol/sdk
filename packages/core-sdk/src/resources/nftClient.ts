import { Address, PublicClient, isAddress, maxUint32, zeroAddress } from "viem";

import {
  RegistrationWorkflowsClient,
  RegistrationWorkflowsCreateCollectionRequest,
  SimpleWalletClient,
  SpgnftImplReadOnlyClient,
} from "../abi/generated";
import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "../types/resources/nftClient";
import { handleError } from "../utils/errors";
import { validateAddress } from "../utils/utils";

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
   *   @param request.contractURI - The contract URI for the collection. Follows ERC-7572 standard. See https://eips.ethereum.org/EIPS/eip-7572
   * 	 @param request.baseURI - [Optional] The base URI for the collection. If baseURI is not empty, tokenURI will be either baseURI + token ID (if nftMetadataURI is empty) or baseURI + nftMetadataURI.
   * 	 @param request.maxSupply - [Optional] The maximum supply of the collection.
   * 	 @param request.mintFee - [Optional] The cost to mint a token.
   * 	 @param request.mintFeeToken - [Optional] The token to mint.
   * 	 @param request.owner - [Optional] The owner of the collection.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes spg nft contract address.
   * @emits CollectionCreated (spgNftContract);
   */
  public async createNFTCollection(
    request: CreateNFTCollectionRequest,
  ): Promise<CreateNFTCollectionResponse> {
    try {
      if (
        request.mintFee !== undefined &&
        (request.mintFee < 0n ||
          request.mintFeeToken === zeroAddress ||
          !isAddress(request.mintFeeToken || ""))
      ) {
        throw new Error("Invalid mint fee token address, mint fee is greater than 0.");
      }

      const object: RegistrationWorkflowsCreateCollectionRequest = {
        spgNftInitParams: {
          name: request.name,
          symbol: request.symbol,
          baseURI: request.baseURI ?? "",
          maxSupply: request.maxSupply ?? Number(maxUint32),
          mintFee: request.mintFee ?? 0n,
          mintFeeToken: request.mintFeeToken ?? zeroAddress,
          owner: validateAddress(request.owner || this.wallet.account!.address),
          mintFeeRecipient: validateAddress(request.mintFeeRecipient),
          mintOpen: request.mintOpen,
          isPublicMinting: request.isPublicMinting,
          contractURI: request.contractURI,
        },
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.registrationWorkflowsClient.createCollectionEncode(object),
        };
      } else {
        const txHash = await this.registrationWorkflowsClient.createCollection(object);
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs =
            this.registrationWorkflowsClient.parseTxCollectionCreatedEvent(txReceipt);
          return {
            txHash: txHash,
            spgNftContract: targetLogs[0].spgNftContract,
          };
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to create a SPG NFT collection");
    }
  }
  /**
   * Returns the current mint token of the collection.
   */
  public async getMintFeeToken(spgNftContract: Address): Promise<Address> {
    const spgNftClient = new SpgnftImplReadOnlyClient(
      this.rpcClient,
      validateAddress(spgNftContract),
    );
    return spgNftClient.mintFeeToken();
  }

  /**
   * Returns the current mint fee of the collection.
   */
  public async getMintFee(spgNftContract: Address): Promise<bigint> {
    const spgNftClient = new SpgnftImplReadOnlyClient(
      this.rpcClient,
      validateAddress(spgNftContract),
    );
    return spgNftClient.mintFee();
  }
}
