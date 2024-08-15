import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex, Address } from "viem";
import { StoryClient, StoryConfig } from "../../../src";
export const RPC = "https://rpc.partner.testnet.storyprotocol.net";
export const mockERC721 = "0x30062557fd9f1bf0be03fe3782d97edea24295c9";

const baseConfig = {
  chain: chainStringToViemChain("storyTestnet"),
  transport: http(RPC),
} as const;
export const publicClient = createPublicClient(baseConfig);
export const walletClient = createWalletClient({
  ...baseConfig,
  account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex),
});
export const storyTestChainId = 1513;

export const getTokenId = async (nftContract?: Address): Promise<number | undefined> => {
  const { request } = await publicClient.simulateContract({
    abi: [
      {
        inputs: [{ internalType: "address", name: "to", type: "address" }],
        name: "mint",
        outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: nftContract || mockERC721,
    functionName: "mint",
    args: [process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex],
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

export const getStoryClient = (): StoryClient => {
  const config: StoryConfig = {
    chainId: "storyTestnet",
    transport: http(RPC),
    account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Address),
  };
  return StoryClient.newClient(config);
};
