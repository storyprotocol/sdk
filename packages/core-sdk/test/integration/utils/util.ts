import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex, Address } from "viem";
import { StoryClient, StoryConfig } from "../../../src";
const rpc = "http://localhost:8545";
const baseConfig = {
  chain: chainStringToViemChain("sepolia"),
  transport: http(rpc),
} as const;
export const publicClient = createPublicClient(baseConfig);
export const walletClient = createWalletClient({
  ...baseConfig,
  account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex),
});
export const sepoliaChainId = 11155111;

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

export const MockERC721 = "0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F49";

export const getStoryClientInSepolia = (privateKey?: Address): StoryClient => {
  const config: StoryConfig = {
    chainId: "sepolia",
    transport: http(rpc),
    account: privateKeyToAccount(privateKey || (process.env.SEPOLIA_WALLET_PRIVATE_KEY as Address)),
  };
  return StoryClient.newClient(config);
};

export const getBlockTimestamp = async (): Promise<bigint> => {
  return (await publicClient.getBlock()).timestamp;
};
