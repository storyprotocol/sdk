import { Address, Hex } from "viem";

import { TxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";
import { TokenAmountInput } from "../common";

export type IPAccountExecuteRequest = {
  /** The IP ID of the IP Account {@link https://docs.story.foundation/docs/ip-account}. */
  ipId: Address;
  /** The recipient of the transaction. */
  to: Address;
  /** The amount of IP to send. */
  value: number;
  /** The data to send along with the transaction. */
  data: Address;
  txOptions?: TxOptions;
};

export type IPAccountExecuteResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};

export type IPAccountExecuteWithSigRequest = {
  /** The IP ID to get IP Account {@link https://docs.story.foundation/docs/ip-account}.*/
  ipId: Address;
  /** The recipient of the transaction. */
  to: Address;
  /** The data to send along with the transaction. */
  data: Address;
  /** The signer of the transaction. */
  signer: Address;
  /** The deadline of the transaction signature in seconds. */
  deadline: number | bigint | string;
  /** The signature of the transaction, EIP-712 encoded. The helper method `getPermissionSignature` supports generating the signature. */
  signature: Address;
  /** The amount of IP to send. */
  value?: number | bigint | string;
  txOptions?: TxOptions;
};

export type IPAccountExecuteWithSigResponse = {
  txHash?: Hex;
  encodedTxData?: EncodedTxData;
};

export type IpAccountStateResponse = Hex;

export type TokenResponse = {
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
};

export type SetIpMetadataRequest = {
  ipId: Address;
  /** The metadataURI to set for the IP asset. */
  metadataURI: string;
  /** The hash of metadata at metadataURI. */
  metadataHash: Hex;
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};

export type TransferErc20Request = {
  ipId: Address;
  tokens: {
    /** The address of the ERC20 token including WIP and standard ERC20. */
    address: Address;
    amount: TokenAmountInput;
    /** The address of the recipient. */
    target: Address;
  }[];
  txOptions?: Omit<TxOptions, "encodedTxDataOnly">;
};
