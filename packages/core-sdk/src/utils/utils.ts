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
  zeroAddress,
} from "viem";

import { aeneid, mainnet } from "./chain";
import { erc20Address, wrappedIpAddress } from "../abi/generated";
import { ChainIds, SupportedChainIds } from "../types/config";

/** Allowed currency token addresses per chain (whitelist for licensing, group, OOV3, dispute, etc.). */
const allowedCurrenciesByChain: Record<SupportedChainIds, readonly Address[]> = {
  aeneid: [erc20Address[1315] as Address, wrappedIpAddress[1315] as Address],
  1315: [erc20Address[1315] as Address, wrappedIpAddress[1315] as Address],
  mainnet: [wrappedIpAddress[1514] as Address],
  1514: [wrappedIpAddress[1514] as Address],
};

export const getAllowedCurrencies = (chainId: SupportedChainIds): readonly Address[] => {
  return allowedCurrenciesByChain[chainId];
};

/**
 * Validate that a currency token is allowed on a given chain.
 *
 * - If `currency` is the zero address, it's treated as "no currency" and allowed.
 * - Otherwise, it must exist in the allowed currency whitelist for the chain.
 *
 * Throws an Error with a consistent message used across the SDK.
 */
export const assertCurrencyAllowed = (currency: Address, chainId: SupportedChainIds): void => {
  if (currency === zeroAddress) {
    return;
  }

  if (!getAllowedCurrencies(chainId).includes(currency)) {
    throw new Error(`Currency token ${currency} is not allowed on chain ${String(chainId)}.`);
  }
};

/**
 * Validate that all currency tokens are allowed on a given chain.
 * Throws an Error with the same message shape previously used by callers that
 * validated arrays (e.g. group royalties distribution).
 */
export const assertCurrenciesAllowed = (
  currencies: readonly Address[],
  chainId: SupportedChainIds,
): void => {
  if (currencies.length === 0) {
    return;
  }

  if (currencies.some((c) => c !== zeroAddress && !getAllowedCurrencies(chainId).includes(c))) {
    throw new Error(
      `Currency token ${currencies.toString()} is not allowed on chain ${String(chainId)}.`,
    );
  }
};

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
