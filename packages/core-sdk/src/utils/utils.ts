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
  defineChain,
} from "viem";

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
//TODO: Some information is waiting for confirmation about chain
export const iliad = defineChain({
  id: 15_13,
  name: "iliad",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.partner.testnet.storyprotocol.net"],
      webSocket: ["wss://story-network.rpc.caldera.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.testnet.storyprotocol.net",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
  testnet: true,
});
export function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case "1513":
    case "iliad":
      return iliad;
    default:
      throw new Error(`chainId ${chainId as string} not supported`);
  }
}

export const chain: { [key in SupportedChainIds]: bigint } = {
  iliad: 1513n,
  1513: 1513n,
};

export const getAddress = (address: string, name: string, chainId?: number): Address => {
  if (!isAddress(address, { strict: false })) {
    throw Error(
      `${name} address is invalid: ${address}, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
    );
  }
  return checksumAddress(address, chainId);
};
