import { defineChain } from "viem/utils";

export const aeneid = defineChain({
  id: 15_12,
  name: "aeneid",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.devnet.storyrpc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://devnet.storyscan.xyz",
    },
  },
  contracts: {
    multicall3: {
      address: "0xfa9576089ef0528a10da54118f96D3090c6fc7E3",
      blockCreated: 1792,
    },
  },
  testnet: true,
});

export const mainnet = defineChain({
  id: 15_14,
  name: "mainnet",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.storyrpc.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://dev-mainnet.storyscan.xyz/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 340998,
    },
  },
  testnet: false,
});
