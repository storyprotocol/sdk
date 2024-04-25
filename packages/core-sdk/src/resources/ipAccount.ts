import { PublicClient, getAddress } from "viem";

import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
} from "../types/resources/ipAccount";
import { handleError } from "../utils/errors";
import { parseToBigInt } from "../utils/utils";
import { IpAccountImplClient, SimpleWalletClient } from "../abi/generated";

export class IPAccountClient {
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
  }

  /** Executes a transaction from the IP Account.
   * @param request - The request object containing necessary data to execute IP Account a transaction.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.data The data to send along with the transaction.
   * @returns Tx hash for the transaction.
   */
  public async execute(request: IPAccountExecuteRequest): Promise<IPAccountExecuteResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.accountAddress),
      );

      const txHash = await ipAccountClient.execute({
        to: request.to,
        value: parseToBigInt(0),
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
        getAddress(request.accountAddress),
      );

      const txHash = await ipAccountClient.executeWithSig({
        to: request.to,
        value: parseToBigInt(0),
        data: request.data,
        signer: request.signer,
        deadline: parseToBigInt(request.deadline),
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
}
