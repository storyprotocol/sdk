import { Address } from "viem";

import { TokenAmountInput } from "../common";
import { WithTxOptions } from "../options";

export type ApproveRequest = WithTxOptions & {
  /** The address that will use the WIP tokens */
  spender: Address;
  /** The amount of WIP tokens to approve.  */
  amount: TokenAmountInput;
};

export type DepositRequest = WithTxOptions & {
  amount: TokenAmountInput;
};

export type WithdrawRequest = WithTxOptions & {
  amount: TokenAmountInput;
};

export type TransferRequest = WithTxOptions & {
  to: Address;
  amount: TokenAmountInput;
};

export type TransferFromRequest = TransferRequest & {
  from: Address;
};
