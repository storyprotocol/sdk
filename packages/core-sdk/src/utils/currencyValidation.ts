import { Address, getAddress, zeroAddress } from "viem";

import { erc20Address, wrappedIpAddress } from "../abi/generated";
import { ChainIds, SupportedChainIds } from "../types/config";

const MAINNET_CHAIN_ID = 1514;
const AENEID_CHAIN_ID = 1315;

/** Per-chain whitelist: chainId -> set of allowed currency token addresses (checksummed). */
const CURRENCY_TOKEN_WHITELIST: Record<ChainIds, ReadonlySet<string>> = {
  [MAINNET_CHAIN_ID]: new Set([
    getAddress(wrappedIpAddress[MAINNET_CHAIN_ID]),
  ]),
  [AENEID_CHAIN_ID]: new Set([
    getAddress(wrappedIpAddress[AENEID_CHAIN_ID]),
    getAddress(erc20Address[AENEID_CHAIN_ID]),
  ]),
} as const;

/** Human-readable description and error hint per chain. */
const CHAIN_CURRENCY_HINT: Record<ChainIds, string> = {
  [MAINNET_CHAIN_ID]: "On Mainnet, only WIP is allowed as currency token.",
  [AENEID_CHAIN_ID]: "On Aeneid Testnet, only WIP or MERC20 is allowed as currency token.",
};

function toChainId(chainId: SupportedChainIds): ChainIds {
  if (chainId === "mainnet" || chainId === 1514) return 1514;
  if (chainId === "aeneid" || chainId === 1315) return 1315;
  return chainId as ChainIds;
}

/**
 * Validates that the currency token is allowed for the given chain.
 * - Aeneid Testnet (1315): allows WIP or MERC20
 * - Mainnet (1514): allows WIP only
 *
 * @param token - The currency token address to validate
 * @param chainId - The chain ID (1315 or "aeneid" for Aeneid, 1514 or "mainnet" for Mainnet)
 * @throws Error if token is zero address or not allowed for the chain
 */
export function validateCurrencyToken(
  token: Address,
  chainId: SupportedChainIds | ChainIds,
): void {
  if (token == null || token === zeroAddress) {
    throw new Error("Currency token cannot be zero address.");
  }

  const resolvedChainId = toChainId(chainId as SupportedChainIds);
  const allowedTokens = CURRENCY_TOKEN_WHITELIST[resolvedChainId];

  if (allowedTokens == null) {
    throw new Error(`Unsupported chain ID: ${chainId}.`);
  }

  const normalizedToken = getAddress(token);
  if (!allowedTokens.has(normalizedToken)) {
    throw new Error(
      `${CHAIN_CURRENCY_HINT[resolvedChainId]} The provided token is not allowed.`,
    );
  }
}
