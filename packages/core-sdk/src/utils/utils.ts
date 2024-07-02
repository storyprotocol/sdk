import { Hash } from "viem/types/misc";
import { DecodeEventLogReturnType } from "viem/_types/utils/abi/decodeEventLog";
import {
  Abi,
  decodeEventLog,
  PublicClient,
  Chain,
  ContractEventName,
  Hex,
  isAddress,
  checksumAddress,
  Address,
} from "viem";
import { sepolia } from "viem/chains";

import { SupportedChainIds } from "../types/config";

export async function waitTxAndFilterLog<
  const TAbi extends Abi | readonly unknown[],
  TEventName extends ContractEventName<TAbi> | undefined = ContractEventName<TAbi>,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
  TStrict extends boolean = true,
>(
  client: PublicClient,
  txHash: Hash,
  params: {
    abi: TAbi;
    eventName: TEventName;
    from?: Hex;
    confirmations?: number;
    pollingInterval?: number;
    timeout?: number;
  },
): Promise<DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData, TStrict>[]> {
  const txReceipt = await client.waitForTransactionReceipt({
    hash: txHash,
    confirmations: params.confirmations,
    pollingInterval: params.pollingInterval,
    timeout: params.timeout,
  });
  const targetLogs: DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData, TStrict>[] = [];
  for (const log of txReceipt.logs) {
    try {
      if (params.from && log.address !== params.from.toLowerCase()) {
        continue;
      }
      const currentLog = decodeEventLog<TAbi, TEventName, TTopics, TData, TStrict>({
        abi: params.abi,
        eventName: params.eventName,
        data: log.data as TData,
        topics: log.topics as [signature: Hex, ...args: TTopics],
      });
      targetLogs.push(currentLog);
    } catch (e) {
      continue;
    }
  }
  if (targetLogs.length === 0) {
    throw new Error(`not found event ${params.eventName} in target transaction`);
  }
  return targetLogs;
}

export async function waitTx(
  client: PublicClient,
  txHash: Hash,
  params?: {
    confirmations?: number;
    pollingInterval?: number;
    timeout?: number;
  },
): Promise<void> {
  await client.waitForTransactionReceipt({
    hash: txHash,
    ...params,
  });
}

export function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case "11155111":
    case "sepolia":
      return sepolia;
    default:
      throw new Error(`chainId ${chainId as string} not supported`);
  }
}

export const chain: { [key in SupportedChainIds]: bigint } = {
  sepolia: 11155111n,
  11155111: 11155111n,
};

export const getAddress = (address: string, name: string, chainId?: number): Address => {
  if (!isAddress(address, { strict: false })) {
    throw Error(
      `${name} address is invalid: ${address}, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
    );
  }
  return checksumAddress(address, chainId);
};
