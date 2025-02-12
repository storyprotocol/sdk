import { Address, Hash, PublicClient } from "viem";

import {
  EncodedTxData,
  MockErc20Client,
  SimpleWalletClient,
  WrappedIpClient,
} from "../abi/generated";

export interface TokenClient {
  balanceOf(account: Address): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, value: bigint): Promise<Hash>;
  approveEncode(spender: Address, value: bigint): EncodedTxData;
}

export class ERC20Client implements TokenClient {
  private ercClient: MockErc20Client;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, address: Address) {
    this.ercClient = new MockErc20Client(rpcClient, wallet, address);
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
}

export class WIPTokenClient implements TokenClient {
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
}
