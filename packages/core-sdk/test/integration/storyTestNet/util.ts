import { http, createPublicClient, createWalletClient, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";

export const getTokenId = async (tokenId: number): Promise<string | undefined> => {
  const baseConfig = {
    chain: chainStringToViemChain("storyTestnet"),
    transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
  } as const;
  const publicClient = createPublicClient(baseConfig);
  const walletClient = createWalletClient({
    ...baseConfig,
    account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
  });
  const { request } = await publicClient.simulateContract({
    abi: [
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "mintId",
        outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: MockERC721,
    functionName: "mintId",
    args: [process.env.STORY_TEST_NET_TEST_WALLET_ADDRESS as Hex, BigInt(tokenId)],
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

export const MockERC20 = "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAE";
export const MockERC721 = "0x83DD606d14CcEb629dE9Bf8Aad7aE63767dB476f";
