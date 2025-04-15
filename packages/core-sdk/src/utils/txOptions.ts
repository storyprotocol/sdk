import { HandleTxOptionsParams, TransactionResponse } from "../types/options";

export async function handleTxOptions({
  txOptions,
  rpcClient,
  txHash,
}: HandleTxOptionsParams): Promise<TransactionResponse | TransactionResponse[]> {
  if (Array.isArray(txHash)) {
    if (!txOptions || !txOptions.waitForTransaction) {
      return txHash.map((hash) => ({ txHash: hash }));
    }
    const receipts = await Promise.all(
      txHash.map((hash) => rpcClient.waitForTransactionReceipt({ ...txOptions, hash })),
    );
    return receipts.map((receipt) => ({ txHash: receipt.transactionHash, receipt }));
  }
  if (!txOptions || !txOptions.waitForTransaction) {
    return { txHash };
  }
  const receipt = await rpcClient.waitForTransactionReceipt({
    ...txOptions,
    hash: txHash,
  });
  return { txHash, receipt };
}
