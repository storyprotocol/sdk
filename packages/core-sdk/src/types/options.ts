import { Hex, PublicClient, TransactionReceipt, WaitForTransactionReceiptParameters } from "viem";

export type TxOptions = Omit<WaitForTransactionReceiptParameters, "hash"> & {
  /**
   * Whether or not to wait for the transaction so you can receive a transaction receipt in return
   * (which contains data about the transaction and return values).
   */
  waitForTransaction?: boolean;
  /**
   * When this option is set, the transaction will not submit and execute.
   * It will only encode the ABI and function data and return.
   */
  encodedTxDataOnly?: boolean;
};

export type WithTxOptions = {
  txOptions?: TxOptions;
};

/**
 * Options to override the default behavior of the auto wrapping IP
 * and auto approve logic, use multicall.
 */

export type ERC20Options = {
  /** Options to configure erc20 behavior */
  erc20Options?: {
    /**
     * Use multicall to batch the erc20 calls into one transaction when possible.
     *
     * @default true
     * This option is not work if the token is not WIP.
     *
     */
    useMulticallWhenPossible?: boolean;

    /**
     * By default IP is converted to WIP if the current WIP
     * balance does not cover the fees.
     * Set this to `false` to disable this behavior.
     *
     * @default true
     * This option is not work if the token is not WIP.
     *
     */
    enableAutoWrapIp?: boolean;

    /**
     * Automatically approve token usage when token is needed but current allowance
     * is not sufficient.
     * Set this to `false` to disable this behavior.
     *
     * @default true
     */
    enableAutoApprove?: boolean;
  };
};

export type HandleTxOptionsParams = {
  txHash: Hex;
  txOptions?: TxOptions;
  rpcClient: PublicClient;
};

export type TransactionResponse = {
  txHash: Hex;

  /** Transaction receipt, only available if waitForTransaction is set to true */
  receipt?: TransactionReceipt;
};
