import { Hash } from "viem/types/misc";
import { DecodeEventLogReturnType } from "viem/_types/utils/abi/decodeEventLog";
import {
  Abi,
  decodeEventLog,
  PublicClient,
  encodeAbiParameters,
  parseAbiParameters,
  Chain,
  ContractEventName,
} from "viem";
import { sepolia } from "viem/chains";

import { Hex, TypedData } from "../types/common";
import { SupportedChainIds } from "../types/config";

export function isIntegerString(s: string): boolean {
  const num = Number(s);
  return !isNaN(num) && parseInt(s, 10) === num;
}

export function parseToBigInt(num: string | number): bigint {
  return BigInt(num);
}

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

export function dictToQueryParams(params: Record<string, string | number>): string {
  const queryParamList: string[] = [];
  for (const key in params) {
    const value = params[key];
    queryParamList.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }

  return queryParamList.join("&");
}

export function typedDataArrayToBytesArray(typedDataArray: Array<TypedData>): Array<Hex> {
  const result: Array<Hex> = [];
  typedDataArray.forEach(function (typedData: TypedData) {
    result.push(typedDataToBytes(typedData));
  });
  return result;
}

export function typedDataToBytes(typedData: TypedData): Hex {
  return encodeAbiParameters(parseAbiParameters(typedData.interface), typedData.data);
}

export function decodeShortstring(hexString: string): string {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  // Replace the last two hexadecimal digits with zero
  hexString = hexString.substring(0, hexString.length - 2) + "00";

  let asciiString = "";
  for (let i = 0; i < hexString.length; i += 2) {
    const hexByte = hexString.substring(i, i + 2);
    if (hexByte === "00") {
      break; // Stop if padding (00) is found
    }
    asciiString += String.fromCharCode(parseInt(hexByte, 16));
  }
  return asciiString;
}

export function splitIntoBytes32(hexString: string): Hex[] {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2); // Remove the '0x' prefix
  }

  if (hexString.length % 64 !== 0) {
    throw new Error("Hex string length must be a multiple of 64.");
  }

  const bytes32Array: string[] = [];
  for (let i = 0; i < hexString.length; i += 64) {
    bytes32Array.push("0x" + hexString.substring(i, i + 64));
  }

  return bytes32Array as Hex[];
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

export const chain: { [key in SupportedChainIds]: string } = {
  sepolia: "11155111",
  11155111: "11155111",
};
