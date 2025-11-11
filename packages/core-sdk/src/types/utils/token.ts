import { Address, Hash, PublicClient } from "viem";

import {
  EncodedTxData,
  Erc20Client,
  Multicall3Aggregate3Request,
  SimpleWalletClient,
} from "../../abi/generated";
import { TokenClient, WipTokenClient } from "../../utils/token";
import { ERC20Options, TransactionResponse, TxOptions, WipOptions } from "../options";

export type Multicall3ValueCall = Multicall3Aggregate3Request["calls"][0] & { value: bigint };

export type Fee = {
  token: Address;
  amount: bigint;
};
export type TokenSpender = {
  address: Address;
  /**
   * Amount that the address will spend in erc20 token or wrapped ip token.
   * If not provided, then unlimited amount is assumed.
   */
  amount?: bigint;
  /**
   * The token address that the address will spend.
   */
  token: Address;
};

export type ApprovalCall = {
  spenders: TokenSpender[];
  client: TokenClient;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
  multicallAddress?: Address;
};

export type TokenApprovalCall = {
  spenders: TokenSpender[];
  client: Erc20Client;
  multicallAddress: Address;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
};

export type ContractCallWithFees<T extends Hash | Hash[] = Hash> = {
  multicall3Address: Address;
  /** all possible spenders of the erc20 tokens or wrapped ip tokens. */
  tokenSpenders: TokenSpender[];
  contractCall: () => Promise<T>;
  encodedTxs: EncodedTxData[];
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  sender: Address;
  options?: {
    wipOptions?: WipOptions;
    erc20Options?: ERC20Options;
  };
  txOptions?: TxOptions;
};

export type MulticallWithWrapIp = {
  calls: Multicall3ValueCall[];
  ipAmountToWrap: bigint;
  contractCall: () => Promise<Hash | Hash[]>;
  wipSpenders: TokenSpender[];
  multicall3Address: Address;
  wipClient: WipTokenClient;
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  wipOptions?: WipOptions;
};

export type ContractCallWithFeesResponse<T extends Hash | Hash[]> = Promise<
  T extends Hash[] ? TransactionResponse[] : TransactionResponse
>;
