import { Address, PublicClient } from "viem";

export type GetERC20BalanceParams = {
  tokenAddress: Address;
  walletAddress: Address;
  rcpClient: PublicClient;
};
