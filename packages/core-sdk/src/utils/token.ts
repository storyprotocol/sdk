import { Address, Hash, PublicClient } from "viem";

import { aeneid } from "./chain";
import {
  EncodedTxData,
  erc20Address,
  Erc20Client,
  SimpleWalletClient,
  WrappedIpClient,
} from "../abi/generated";

export interface TokenClient {
  balanceOf(account: Address): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, value: bigint): Promise<Hash>;
  approveEncode(spender: Address, value: bigint): EncodedTxData;
  transferFromEncode(from: Address, to: Address, value: bigint): EncodedTxData;
}

export class ERC20Client implements TokenClient {
  private ercClient: Erc20Client;

  constructor(
    rpcClient: PublicClient,
    wallet: SimpleWalletClient,
    address: Address = erc20Address[aeneid.id],
  ) {
    this.ercClient = new Erc20Client(rpcClient, wallet, address);
  }

  async balanceOf(account: Address): Promise<bigint> {
    return await this.ercClient.balanceOf({ account });
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    return await this.ercClient.allowance({ owner, spender });
  }

  async approve(spender: Address, value: bigint): Promise<Hash> {
    return await this.ercClient.approve({ spender, value });
  }

  approveEncode(spender: Address, value: bigint): EncodedTxData {
    return this.ercClient.approveEncode({ spender, value });
  }

  transferFromEncode(from: Address, to: Address, value: bigint): EncodedTxData {
    return this.ercClient.transferFromEncode({ from, to, value });
  }

  // The method only will work in test environment
  async mint(to: Address, amount: bigint): Promise<Hash> {
    return await this.ercClient.mint({ to, amount });
  }
}

export class WipTokenClient implements TokenClient {
  private wipClient: WrappedIpClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.wipClient = new WrappedIpClient(rpcClient, wallet);
  }

  async balanceOf(account: Address): Promise<bigint> {
    const { result: balance } = await this.wipClient.balanceOf({ owner: account });
    return balance;
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    const { result: allowance } = await this.wipClient.allowance({ owner, spender });
    return allowance;
  }

  async approve(spender: Address, value: bigint): Promise<Hash> {
    return await this.wipClient.approve({ spender, amount: value });
  }

  approveEncode(spender: Address, value: bigint): EncodedTxData {
    return this.wipClient.approveEncode({ spender, amount: value });
  }

  depositEncode(): EncodedTxData {
    return this.wipClient.depositEncode();
  }

  transferFromEncode(from: Address, to: Address, value: bigint): EncodedTxData {
    return this.wipClient.transferFromEncode({ from, to, amount: value });
  }

  get address(): Address {
    return this.wipClient.address;
  }
}
