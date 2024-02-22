import { PublicClient, WalletClient, getAddress } from "viem";

import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
} from "../types/resources/ipAccount";
import { handleError } from "../utils/errors";
import { IPAccountABI } from "../abi/config";
import { parseToBigInt, waitTx } from "../utils/utils";

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  public ipAccountABI = IPAccountABI;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
  }

  /** Executes a transaction from the IP Account.
   * @param request The request object containing necessary data to execute IP Account a transaction.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.data The data to send along with the transaction.
   * @returns Tx hash for the transaction.
   */
  public async execute(request: IPAccountExecuteRequest): Promise<IPAccountExecuteResponse> {
    try {
      const IPAccountConfig = {
        abi: this.ipAccountABI,
        address: getAddress(request.accountAddress),
      };

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [request.to, parseToBigInt(0), request.data],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        await waitTx(this.rpcClient, txHash);
      }
      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to execute the IP Account transaction");
    }
  }

  /** Executes a transaction from the IP Account.
   * @param request The request object containing necessary data to execute IP Account a transaction.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.data The data to send along with the transaction.
   * @returns Tx hash for the transaction.
   */
  public async executeWithSig(
    request: IPAccountExecuteWithSigRequest,
  ): Promise<IPAccountExecuteWithSigResponse> {
    try {
      const IPAccountConfig = {
        abi: this.ipAccountABI,
        address: getAddress(request.accountAddress),
      };

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "executeWithSig",
        args: [
          request.to,
          parseToBigInt(0),
          request.data,
          request.signer,
          parseToBigInt(request.deadline),
          request.signature,
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        await waitTx(this.rpcClient, txHash);
      }
      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to execute with signature for the IP Account transaction");
    }
  }
}
