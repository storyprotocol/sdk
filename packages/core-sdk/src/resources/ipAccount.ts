import { Address, PublicClient } from "viem";

import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
  IpAccountStateResponse,
  TokenResponse,
} from "../types/resources/ipAccount";
import { handleError } from "../utils/errors";
import { IpAccountImplClient, SimpleWalletClient } from "../abi/generated";
import { getAddress } from "../utils/utils";

export class IPAccountClient {
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
  }

  /** Executes a transaction from the IP Account.
   * @param request - The request object containing necessary data to execute IP Account a transaction.
   *   @param request.ipId The Ip Id to get ip account.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.accountAddress The ipId to send.
   *   @param request.data The data to send along with the transaction.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns Tx hash for the transaction.
   */
  public async execute(request: IPAccountExecuteRequest): Promise<IPAccountExecuteResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.ipId, "request.ipId"),
      );

      const req = {
        to: request.to,
        value: BigInt(0),
        data: request.data,
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipAccountClient.executeEncode({ ...req, operation: 0 }) };
      } else {
        const txHash = await ipAccountClient.execute({ ...req, operation: 0 });

        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to execute the IP Account transaction");
    }
  }

  /** Executes a transaction from the IP Account.
   * @param request - The request object containing necessary data to execute IP Account a transaction.
   *   @param request.ipId The Ip Id to get ip account.
   *   @param request.to The recipient of the transaction.
   *   @param request.data The data to send along with the transaction.
   *   @param request.signer The signer of the transaction.
   *   @param request.deadline The deadline of the transaction signature.
   *   @param request.signature The signature of the transaction, EIP-712 encoded.
   *   @param request.value [Optional] The amount of Ether to send.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns Tx hash for the transaction.
   */
  public async executeWithSig(
    request: IPAccountExecuteWithSigRequest,
  ): Promise<IPAccountExecuteWithSigResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.ipId, "request.ipId"),
      );

      const req = {
        to: getAddress(request.to, "request.to"),
        value: BigInt(request.value || 0),
        data: request.data,
        signer: getAddress(request.signer, "request.signer"),
        deadline: BigInt(request.deadline),
        signature: request.signature,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipAccountClient.executeWithSigEncode(req) };
      } else {
        const txHash = await ipAccountClient.executeWithSig(req);

        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to execute with signature for the IP Account transaction");
    }
  }

  /** Returns the IPAccount's internal nonce for transaction ordering.
   * @param ipId The IP ID
   * @returns A Promise that resolves to the IP Account's nonce.
   */
  public async getIpAccountNonce(ipId: Address): Promise<IpAccountStateResponse> {
    try {
      const ipAccount = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(ipId, "ipId"),
      );
      const { result: state } = await ipAccount.state();
      return state;
    } catch (error) {
      handleError(error, "Failed to get the IP Account nonce");
    }
  }

  /**
   * Returns the identifier of the non-fungible token which owns the account
   * @returns A Promise that resolves to an object containing the chain ID, token contract address, and token ID.
   */
  public async getToken(ipId: Address): Promise<TokenResponse> {
    try {
      const ipAccount = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(ipId, "ipId"),
      );
      const [chainId, tokenContract, tokenId] = await ipAccount.token();
      return {
        chainId,
        tokenContract,
        tokenId,
      };
    } catch (error) {
      handleError(error, "Failed to get the token");
    }
  }
}
