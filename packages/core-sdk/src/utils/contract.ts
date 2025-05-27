import { WriteContractParameters } from "viem";

import { TransactionResponse } from "../types/options";
import { SimulateAndWriteContractParams } from "../types/utils/contract";

export const simulateAndWriteContract = async ({
  rpcClient,
  wallet,
  data,
}: SimulateAndWriteContractParams): Promise<TransactionResponse> => {
  const { request } = await rpcClient.simulateContract({
    ...data,
    account: wallet.account,
  });
  const txHash = await wallet.writeContract(request as WriteContractParameters);
  const receipt = await rpcClient.waitForTransactionReceipt({ hash: txHash });
  return { txHash, receipt };
};
