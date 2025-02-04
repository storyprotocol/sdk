import { HandleTxOptionsParams, HandleTxOptionsResponse } from "../types/utils/txOptions";

export async function handleTxOptions({
  txOptions,
  rpcClient,
  txHash,
}: HandleTxOptionsParams): Promise<HandleTxOptionsResponse> {
  if (!txOptions || !txOptions.waitForTransaction) {
    return { txHash };
  }
  const receipt = await rpcClient.waitForTransactionReceipt({
    ...txOptions,
    hash: txHash,
  });
  return { txHash, receipt };
}
