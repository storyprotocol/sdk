import { PublicClient } from "viem";

import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
} from "../types/resources/ipAccount";
import { handleError } from "../utils/errors";
import {
  IpAccountImplClient,
  IpAccountImplStateResponse,
  SimpleWalletClient,
} from "../abi/generated";
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
   * @returns Tx hash for the transaction.
   */
  public async execute(request: IPAccountExecuteRequest): Promise<IPAccountExecuteResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.ipId, "request.ipId"),
      );

      const txHash = await ipAccountClient.execute({
        to: request.to,
        value: BigInt(0),
        data: request.data,
      });

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      }
      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to execute the IP Account transaction");
    }
  }

  /** Executes a transaction from the IP Account.
   * @param request - The request object containing necessary data to execute IP Account a transaction.
   *   @param request.ipId The Ip Id to get ip account.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.data The data to send along with the transaction.
   *   @param request.signer The signer of the transaction.
   *   @param request.deadline The deadline of the transaction signature.
   *   @param request.signature The signature of the transaction, EIP-712 encoded.
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

      const txHash = await ipAccountClient.executeWithSig({
        to: request.to,
        value: BigInt(0),
        data: request.data,
        signer: request.signer,
        deadline: BigInt(request.deadline),
        signature: request.signature,
      });

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
      }
      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to execute with signature for the IP Account transaction");
    }
  }

  /** Returns the IPAccount's internal nonce for transaction ordering.
   * @param ipId The IP ID
   * @returns The nonce for transaction ordering.
   */
  public async getIpAccountNonce(ipId: string): Promise<IpAccountImplStateResponse> {
    const ipAccount = new IpAccountImplClient(
      this.rpcClient,
      this.wallet,
      getAddress(ipId, "ipId"),
    );
    return await ipAccount.state();
  }
}
