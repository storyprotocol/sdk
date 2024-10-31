import { privateKeyToAccount } from "viem/accounts";
import {
  http,
  createPublicClient,
  createWalletClient,
  Hex,
  Address,
  defineChain,
} from "viem";

export const RPC = "https://testnet.storyrpc.io";
export const mockERC721Address = "0x322813fd9a801c5507c9de605d63cea4f2ce6c44";
export const mockERC20Address = "0x91f6F05B08c16769d3c85867548615d270C42fC7";
export const iliad = defineChain({
  id: 15_13,
  name: "iliad",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.storyrpc.io"],
      webSocket: ["wss://story-network.rpc.caldera.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://testnet.storyscan.xyz",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
  testnet: true,
});

const baseConfig = {
  chain: iliad,
  transport: http(RPC),
} as const;
export const publicClient = createPublicClient(baseConfig);
export const walletClient = createWalletClient({
  ...baseConfig,
  account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
});

export const getTokenId = async (): Promise<number | undefined> => {
  const { request } = await publicClient.simulateContract({
    abi: [
      {
        inputs: [{ internalType: "address", name: "to", type: "address" }],
        name: "mint",
        outputs: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: mockERC721Address,
    functionName: "mint",
    args: [process.env.TEST_WALLET_ADDRESS as Hex],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash,
  });
  if (logs[0].topics[3]) {
    return parseInt(logs[0].topics[3], 16);
  }
};

export const mintBySpg = async (nftContract: Hex, nftMetadata: string) => {
  const { request } = await publicClient.simulateContract({
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "string",
            name: "nftMetadata",
            type: "string",
          },
        ],
        name: "mint",
        outputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: nftContract,
    functionName: "mint",
    args: [process.env.TEST_WALLET_ADDRESS! as Address, nftMetadata],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash,
  });
  if (logs[0].topics[3]) {
    return parseInt(logs[0].topics[3], 16);
  }
};
