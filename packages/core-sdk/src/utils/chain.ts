import { defineChain } from "viem/utils";

export const odyssey = defineChain({
  id: 15_16,
  name: "odyssey",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://odyssey.storyrpc.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://odyssey-testnet-explorer.storyscan.xyz/",
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
