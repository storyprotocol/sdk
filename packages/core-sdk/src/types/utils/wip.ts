import { Address, Hash, PublicClient } from "viem";

import {
  EncodedTxData,
  Erc20Client,
  Multicall3Aggregate3Request,
  SimpleWalletClient,
} from "../../abi/generated";
import { TokenClient, WipTokenClient } from "../../utils/token";
import {
  ERC20Options,
  TransactionResponse,
  TxOptions,
  WipOptions,
  WithWipOptions,
} from "../options";

export type Multicall3ValueCall = Multicall3Aggregate3Request["calls"][0] & { value: bigint };

export type Erc20Spender = {
  address: Address;
  /**
   * Amount that the address will spend in erc20 token.
   * If not provided, then unlimited amount is assumed.
   */
  amount?: bigint;
};

export type ApprovalCall = {
  spenders: Erc20Spender[];
  client: TokenClient;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
  multicallAddress?: Address;
};

export type TokenApprovalCall = {
  spenders: Erc20Spender[];
  client: Erc20Client;
  multicallAddress: Address;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
};

export type ContractCallWithFees<T extends Hash | Hash[] = Hash> = {
  totalFees: bigint;
  multicall3Address: Address;
  /** all possible spenders of the erc20 token */
  tokenSpenders: Erc20Spender[];
  contractCall: () => Promise<T>;
  encodedTxs: EncodedTxData[];
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  sender: Address;
  options: {
    wipOptions?: WipOptions;
    erc20Options?: ERC20Options;
  };
  token?: Address;
  txOptions?: TxOptions;
};

export type MulticallWithWrapIp = {
  calls: Multicall3ValueCall[];
  ipAmountToWrap: bigint;
  contractCall: () => Promise<Hash | Hash[]>;
  wipSpenders: Erc20Spender[];
  multicall3Address: Address;
  wipClient: WipTokenClient;
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  wipOptions?: WipOptions;
};

export type ContractCallWithFeesResponse<T extends Hash | Hash[]> = Promise<
  T extends Hash[] ? TransactionResponse[] : TransactionResponse
>;
