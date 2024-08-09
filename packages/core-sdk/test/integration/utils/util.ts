import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex, Address } from "viem";
import { StoryClient, StoryConfig } from "../../../src";
export const RPC = "https://rpc.partner.testnet.storyprotocol.net";
export const MockERC721 = "0xCa1D199b6F53Af7387ac543Af8e8a34455BBe5E0";

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
    address: nftContract || MockERC721,
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

export const getStoryClientInSepolia = (): StoryClient => {
  const config: StoryConfig = {
    chainId: "storyTestnet",
    transport: http(RPC),
    account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Address),
  };
  return StoryClient.newClient(config);
};
