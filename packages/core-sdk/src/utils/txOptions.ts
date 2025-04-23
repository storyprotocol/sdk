import {
  WaitForTransactionReceiptRequest,
  TransactionResponse,
  WaitForTransactionReceiptsRequest,
} from "../types/options";

export async function waitForTxReceipt({
  txOptions,
  rpcClient,
  txHash,
}: WaitForTransactionReceiptRequest): Promise<TransactionResponse> {
  if (!txOptions || !txOptions.waitForTransaction) {
    return { txHash };
  }
  const receipt = await rpcClient.waitForTransactionReceipt({
    ...txOptions,
    hash: txHash,
  });
  return { txHash, receipt };
}

export async function waitForTxReceipts({
  txOptions,
  rpcClient,
  txHashes,
}: WaitForTransactionReceiptsRequest): Promise<TransactionResponse[]> {
  if (!txOptions || !txOptions.waitForTransaction) {
    return txHashes.map((hash) => ({ txHash: hash }));
  }
  const receipts = await Promise.all(
    txHashes.map((hash) => rpcClient.waitForTransactionReceipt({ ...txOptions, hash })),
  );
  return receipts.map((receipt) => ({ txHash: receipt.transactionHash, receipt }));
}
