import { Hash, PublicClient, TransactionReceipt, WaitForTransactionReceiptParameters } from "viem";

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

export type ERC20Options = {
  /**
   * Automatically approve erc20 usage when erc20 is needed but current allowance
   * is not sufficient.
   * Set this to `false` to disable this behavior.
   *
   * @default true
   */
  enableAutoApprove?: boolean;
};
/**
 * Options to override the default behavior of the auto approve logic
 */
export type WithERC20Options = {
  erc20Options?: ERC20Options;
};

export type WipOptions = {
  /**
   * Use multicall to batch the WIP calls into one transaction when possible.
   *
   * @default true
   */
  useMulticallWhenPossible?: boolean;

  /**
   * By default IP is converted to WIP if the current WIP
   * balance does not cover the fees.
   * Set this to `false` to disable this behavior.
   *
   * @default true
   */
  enableAutoWrapIp?: boolean;

  /**
   * Automatically approve WIP usage when WIP is needed but current allowance
   * is not sufficient.
   * Set this to `false` to disable this behavior.
   *
   * @default true
   */
  enableAutoApprove?: boolean;
};
/**
 * Options to override the default behavior of the auto wrapping IP
 * and auto approve logic.
 */
export type WithWipOptions = {
  options?: {
    /** options to configure WIP behavior */
    wipOptions?: WipOptions;
  };
};

export type WithErc20AndWipOptions = {
  options?: {
    /** options to configure ERC20 behavior */
    erc20Options?: ERC20Options;
    /** options to configure WIP behavior */
    wipOptions?: WipOptions;
  };
};

export type WaitForTransactionReceiptRequest = {
  txHash: Hash;
  txOptions?: TxOptions;
  rpcClient: PublicClient;
};

export type WaitForTransactionReceiptsRequest = {
  txHashes: Hash[];
  txOptions?: TxOptions;
  rpcClient: PublicClient;
};

export type TransactionResponse = {
  txHash: Hash;

  /** Transaction receipt, only available if waitForTransaction is set to true */
  receipt?: TransactionReceipt;
};
