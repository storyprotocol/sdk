import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex } from "viem";
import { StoryClient, StoryConfig } from "../../src";

export const getTokenId = async (): Promise<string | undefined> => {
  const baseConfig = {
    chain: chainStringToViemChain("sepolia"),
    transport: http(process.env.SEPOLIA_RPC_PROVIDER_URL),
  } as const;
  const publicClient = createPublicClient(baseConfig);
  const walletClient = createWalletClient({
    ...baseConfig,
    account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex),
  });
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
    address: MockERC721,
    functionName: "mint",
    args: [process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash,
  });
  if (logs[0].topics[3]) {
    return parseInt(logs[0].topics[3], 16).toString();
  }
};

export const MockERC20 = "0x857308523a01B430cB112400976B9FC4A6429D55";
export const MockERC721 = "0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F49";

export const getStoryClientInSepolia = (): StoryClient => {
  const config: StoryConfig = {
    chainId: "sepolia",
    transport: http(process.env.SEPOLIA_RPC_PROVIDER_URL),
    account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex),
  };
  return StoryClient.newClient(config);
};
