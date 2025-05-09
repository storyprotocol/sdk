import { Hex } from "viem";

import { wrappedIpAddress } from "../abi/generated";
import { mainnet } from "../utils/chain";

export const defaultFunctionSelector: Hex = "0x00000000";
export const royaltySharesTotalSupply: number = 100_000_000;
export const MAX_ROYALTY_TOKEN = 100_000_000;
export const WIP_TOKEN_ADDRESS = wrappedIpAddress[mainnet.id];
