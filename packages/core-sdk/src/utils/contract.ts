import { WriteContractParameters } from "viem";

import { SimulateAndWriteContractParams } from "../types/utils/contract";

export async function simulateAndWriteContract({
  rpcClient,
  wallet,
  waitForTransaction,
  data,
}: SimulateAndWriteContractParams) {
  const { request } = await rpcClient.simulateContract({
    ...data,
    account: wallet.account,
  });
  const txHash = await wallet.writeContract(request as WriteContractParameters);
  if (waitForTransaction !== false) {
    const receipt = await rpcClient.waitForTransactionReceipt({ hash: txHash });
    return { txHash, receipt };
  }
  return { txHash };
}
