import { defineChain } from "viem/utils";

export const devnet = defineChain({
  id: 13_15,
  name: "devnet",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://devnet.storyrpc.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://devnet.storyscan.xyz/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5882,
    },
  },
  testnet: true,
});
