import { erc20Abi } from "viem";

import { GetERC20BalanceParams } from "../types/utils/erc20";

export async function getERC20Balance({
  rcpClient,
  walletAddress,
  tokenAddress,
}: GetERC20BalanceParams) {
  return rcpClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [walletAddress],
  });
}
