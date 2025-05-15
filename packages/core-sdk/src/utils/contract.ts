import { WriteContractParameters } from "viem";

import { SimulateAndWriteContractParams } from "../types/utils/contract";
import { TransactionResponse } from "../types/options";

export const simulateAndWriteContract = async ({
  rpcClient,
  wallet,
  waitForTransaction,
  data,
}: SimulateAndWriteContractParams): Promise<TransactionResponse> => {
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
};
