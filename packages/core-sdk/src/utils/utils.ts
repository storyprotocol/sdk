import { Hash } from "viem/types/misc";
import { DecodeEventLogReturnType } from "viem/_types/utils/abi/decodeEventLog";
import {
  Abi,
  decodeEventLog,
  PublicClient,
  encodeAbiParameters,
  parseAbiParameters,
  Chain,
} from "viem";
import { InferEventName } from "viem/types/contract";
import { mainnet, sepolia } from "viem/chains";

import { Hex, TypedData } from "../types/common";
import { DERIVATIVES_ALLOWED_OPTIONS, PARAMS_TAG } from "../constants/license";
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
  TEventName extends string | undefined = undefined,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
  TStrict extends boolean = true,
>(
  client: PublicClient,
  txHash: Hash,
  params: {
    abi: TAbi;
    eventName: InferEventName<TAbi, TEventName>;
    confirmations?: number;
    pollingInterval?: number;
    timeout?: number;
  },
): Promise<DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData, TStrict>> {
  const txReceipt = await client.waitForTransactionReceipt({
    hash: txHash,
    confirmations: params.confirmations,
    pollingInterval: params.pollingInterval,
    timeout: params.timeout,
  });

  for (const log of txReceipt.logs) {
    try {
      return decodeEventLog<TAbi, TEventName, TTopics, TData, TStrict>({
        abi: params.abi,
        eventName: params.eventName,
        data: log.data as TData,
        topics: log.topics as [signature: Hex, ...args: TTopics],
      });
    } catch (e) {
      continue;
    }
  }

  throw new Error(`not found event ${params.eventName} in target transaction`);
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

export function decodeChannelsOfDistribution(value: Hex): string[] {
  return splitIntoBytes32(value).map((bytes32) => {
    // Set the last byte to zero
    return decodeShortstring(bytes32);
  });
}

function hexToFixedLengthBitmask(hexString: string): number[] {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  let binaryString = BigInt("0x" + hexString).toString(2);

  // Pad or truncate the binary string to the desired length
  binaryString = binaryString.padStart(3, "0").slice(-3);

  return Array.from(binaryString).map((bit) => parseInt(bit));
}

function hexToBoolean(hexString: string): boolean {
  if (hexString.toLowerCase() === "0x") {
    return false;
  }

  if (hexString.toLowerCase().startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  return BigInt("0x" + hexString) !== BigInt(0);
}

export function decodeDerivativesAllowedOptions(bitmask: number[], options: string[]): string[] {
  return options.filter((_, index) => bitmask[index] === 1);
}

export function paramsTagValueDecoder(paramTag: Hex, paramValue: unknown) {
  const parsedTag = decodeShortstring(paramTag);
  let value = paramValue;
  let type = "unknown";
  switch (parsedTag) {
    case PARAMS_TAG.CHANNELS_OF_DISTRIBUTION:
      value = decodeChannelsOfDistribution(paramValue as Hex);
      type = "string[]";
      break;
    case PARAMS_TAG.ATTRIBUTION:
      value = hexToBoolean(paramValue as Hex);
      type = "boolean";
      break;
    case PARAMS_TAG.DERIVATIVES_ALLOWED:
      value = hexToBoolean(paramValue as Hex);
      type = "boolean";
      break;
    case PARAMS_TAG.DERIVATIVES_ALLOWED_OPTIONS:
      value = decodeDerivativesAllowedOptions(
        hexToFixedLengthBitmask(paramValue as Hex),
        DERIVATIVES_ALLOWED_OPTIONS,
      );
      type = "string[]";
      break;
  }

  return { tag: parsedTag, value, type };
}

export function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case "1":
    case "mainnet":
      return mainnet;
    case "11155111":
    case "sepolia":
      return sepolia;
    default:
      throw new Error(`chainId ${chainId as string} not supported`);
  }
}
