import { Address, PublicClient, WriteContractParameters } from "viem";

import { handleError } from "../utils/errors";
import { SimpleWalletClient, WrappedIpClient, wrappedIpAbi } from "../abi/generated";
import { validateAddress } from "../utils/utils";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import {
  ApproveRequest,
  DepositRequest,
  TransferFromRequest,
  TransferRequest,
  WithdrawRequest,
} from "../types/resources/wip";
import { waitForTxReceipt } from "../utils/txOptions";

export class WipClient {
  public wrappedIpClient: WrappedIpClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.wrappedIpClient = new WrappedIpClient(rpcClient, wallet, WIP_TOKEN_ADDRESS);
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
        abi: wrappedIpAbi,
        address: WIP_TOKEN_ADDRESS,
        functionName: "deposit",
        account: this.wallet.account,
        value: BigInt(amount),
      });
      const txHash = await this.wallet.writeContract(call as WriteContractParameters);
      return waitForTxReceipt({
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
      const txHash = await this.wrappedIpClient.withdraw({ value: targetAmt });
      return waitForTxReceipt({
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
  public async approve(req: ApproveRequest) {
    try {
      const amount = BigInt(req.amount);
      if (amount <= 0) {
        throw new Error("WIP approve amount must be greater than 0.");
      }
      const spender = validateAddress(req.spender);
      const txHash = await this.wrappedIpClient.approve({
        spender,
        amount,
      });
      return waitForTxReceipt({
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
    const ret = await this.wrappedIpClient.balanceOf({ owner });
    return ret.result;
  }

  /**
   * Transfers `amount` of WIP to a recipient `to`.
   */
  public async transfer(request: TransferRequest) {
    try {
      const amount = BigInt(request.amount);
      if (amount <= 0) {
        throw new Error("WIP transfer amount must be greater than 0.");
      }
      const txHash = await this.wrappedIpClient.transfer({
        to: validateAddress(request.to),
        amount,
      });
      return waitForTxReceipt({
        txHash,
        txOptions: request.txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      handleError(error, "Failed to transfer WIP");
    }
  }

  /**
   * Transfers `amount` of WIP from `from` to a recipient `to`.
   */
  public async transferFrom(request: TransferFromRequest) {
    try {
      const amount = BigInt(request.amount);
      if (amount <= 0) {
        throw new Error("WIP transfer amount must be greater than 0.");
      }
      const txHash = await this.wrappedIpClient.transferFrom({
        to: validateAddress(request.to),
        amount,
        from: validateAddress(request.from),
      });
      return waitForTxReceipt({
        txHash,
        txOptions: request.txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      handleError(error, "Failed to transfer WIP");
    }
  }
}
