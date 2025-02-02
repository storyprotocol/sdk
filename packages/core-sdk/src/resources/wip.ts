import { Address, Hex, PublicClient, WriteContractParameters } from "viem";

import { handleError } from "../utils/errors";
import { Erc20TokenClient, SimpleWalletClient, erc20TokenAbi } from "../abi/generated";
import { validateAddress } from "../utils/utils";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { ApproveRequest, DepositRequest, WithdrawRequest } from "../types/resources/wip";
import { handleTxOptions } from "../utils/txOptions";

export class WipClient {
  public wipClient: Erc20TokenClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.wipClient = new Erc20TokenClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * Wraps the selected amount of IP to WIP.
   * The WIP will be deposited to the wallet that transferred the IP.
   */
  public async deposit({ amount, txOptions }: DepositRequest) {
    try {
      if (amount <= 0) {
        throw new Error("WIP deposit amount must be greater than 0.");
      }
      const { request: call } = await this.rpcClient.simulateContract({
        abi: erc20TokenAbi,
        address: WIP_TOKEN_ADDRESS,
        functionName: "deposit",
        account: this.wallet.account,
        value: BigInt(amount),
      });
      const txHash = await this.wallet.writeContract(call as WriteContractParameters);
      return handleTxOptions({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      handleError(error, "Failed to deposit IP for WIP");
    }
  }

  /**
   * Unwraps the selected amount of WIP to IP.
   */
  public async withdraw({ amount, txOptions }: WithdrawRequest) {
    try {
      const targetAmt = BigInt(amount);
      if (targetAmt <= 0) {
        throw new Error("WIP withdraw amount must be greater than 0.");
      }
      const txHash = await this.wipClient.withdraw({ value: targetAmt });
      return handleTxOptions({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      handleError(error, "Failed to withdraw WIP");
    }
  }

  /**
   * Approve a spender to use the wallet's WIP balance.
   */
  public async approve(req: ApproveRequest): Promise<{ txHash: Hex }> {
    try {
      const amount = BigInt(req.amount);
      if (amount <= 0) {
        throw new Error("WIP approve amount must be greater than 0.");
      }
      const spender = validateAddress(req.spender);
      const txHash = await this.wipClient.approve({
        spender,
        amount,
      });
      return handleTxOptions({
        txHash,
        txOptions: req.txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      handleError(error, "Failed to approve WIP");
    }
  }

  /**
   * Returns the balance of WIP for an address.
   */
  public async balanceOf(addr: Address): Promise<bigint> {
    const owner = validateAddress(addr);
    const ret = await this.wipClient.balanceOf({ owner });
    return ret.result;
  }
}
