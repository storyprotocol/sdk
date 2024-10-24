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
    //TODO: need to confirm the addresses
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
  testnet: true,
});
