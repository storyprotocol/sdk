import { HandleTxOptionsParams, TransactionResponse } from "../types/options";

export async function handleTxOptions({
  txOptions,
  rpcClient,
  txHash,
}: HandleTxOptionsParams): Promise<TransactionResponse> {
  if (!txOptions || !txOptions.waitForTransaction) {
    return { txHash };
  }
  const receipt = await rpcClient.waitForTransactionReceipt({
    ...txOptions,
    hash: txHash,
  });
  return { txHash, receipt };
}
