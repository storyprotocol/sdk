import { Address, isAddress, maxUint32, PublicClient, zeroAddress } from "viem";

import {
  RegistrationWorkflowsClient,
  RegistrationWorkflowsCreateCollectionRequest,
  SimpleWalletClient,
  SpgnftImplClient,
  SpgnftImplReadOnlyClient,
} from "../abi/generated";
import { TransactionResponse } from "../types/options";
import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
  GetTokenURIRequest,
  SetTokenURIRequest,
} from "../types/resources/nftClient";
import { handleError } from "../utils/errors";
import { waitForTxReceipt } from "../utils/txOptions";
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
   *
   * Emits an on-chain `CollectionCreated` event.
   * @see {@link https://github.com/storyprotocol/protocol-periphery-v1/blob/v1.3.1/contracts/interfaces/workflows/IRegistrationWorkflows.sol#L12 | IRegistrationWorkflows}
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
      return handleError(error, "Failed to create an SPG NFT collection");
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

  /**
   * Sets the token URI for a specific token id.
   *
   * @remarks
   * Only callable by the owner of the token.
   */
  public async setTokenURI({
    tokenId,
    tokenURI,
    spgNftContract,
    txOptions,
  }: SetTokenURIRequest): Promise<TransactionResponse> {
    try {
      const spgNftClient = new SpgnftImplClient(
        this.rpcClient,
        this.wallet,
        validateAddress(spgNftContract),
      );
      const txHash = await spgNftClient.setTokenUri({
        tokenId: BigInt(tokenId),
        tokenUri: tokenURI,
      });
      return waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      return handleError(error, "Failed to set token URI");
    }
  }

  /**
   * Returns the token URI for a specific token id.
   */
  public async getTokenURI({ tokenId, spgNftContract }: GetTokenURIRequest): Promise<string> {
    const spgNftClient = new SpgnftImplReadOnlyClient(this.rpcClient, spgNftContract);
    return await spgNftClient.tokenUri({ tokenId: BigInt(tokenId) });
  }
}
