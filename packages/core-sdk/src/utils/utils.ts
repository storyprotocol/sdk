import {
  Abi,
  Address,
  Chain,
  ContractEventName,
  decodeEventLog,
  DecodeEventLogReturnType,
  formatEther,
  Hash,
  Hex,
  isAddress,
  PublicClient,
} from "viem";

import { aeneid, mainnet } from "./chain";
import { TokenAmountInput } from "../types/common";
import { ChainIds, SupportedChainIds } from "../types/config";

export const waitTxAndFilterLog = async <
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
): Promise<DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData, TStrict>[]> => {
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
    } catch {
      continue;
    }
  }

  if (targetLogs.length === 0) {
    throw new Error(`Not found event ${params.eventName} in target transaction`);
  }
  return targetLogs;
};

export const waitTx = async function (
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
};

export const chainStringToViemChain = function (chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case 1315:
    case "aeneid":
      return aeneid;
    case 1514:
    case "mainnet":
      return mainnet;
    default:
      throw new Error(`ChainId ${String(chainId)} not supported`);
  }
};

export const chain: Record<SupportedChainIds, ChainIds> = {
  aeneid: 1315,
  1315: 1315,
  mainnet: 1514,
  1514: 1514,
};

export const validateAddress = function (address: string): Address {
  if (!isAddress(address, { strict: false })) {
    throw Error(`Invalid address: ${address}.`);
  }
  return address;
};

export const validateAddresses = function (addresses: string[]): Address[] {
  return addresses.map((address) => validateAddress(address));
};

export const getTokenAmountDisplay = function (amount: bigint, unit = "IP"): string {
  return `${formatEther(amount)}${unit}`;
};

/**
 * Converts TokenAmountInput to bigint, supporting backward compatibility with string values.
 * @param amount - The amount to convert (bigint, number, or string)
 * @returns The amount as bigint
 * @deprecated Use toBigInt instead for new code
 */
export const convertToBigInt = function (amount: bigint | number | string): bigint {
  if (typeof amount === 'string') {
    return BigInt(amount);
  }
  return BigInt(amount);
};

/**
 * Converts TokenAmountInput to bigint.
 * @param amount - The amount to convert (bigint or number)
 * @returns The amount as bigint
 */
export const toBigInt = function (amount: TokenAmountInput): bigint {
  return BigInt(amount);
};
