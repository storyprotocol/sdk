import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex, Address } from "viem";
import { StoryClient, StoryConfig } from "../../../src";
import { spgnftBeaconAddress } from "../../../src/abi/generated";
export const RPC = "https://testnet.storyrpc.io";
export const iliadChainId = 1513;

export const mockERC721 = "0x67baff31318638f497f4c4894cd73918563942c8";
export const spgNftBeacon =
  spgnftBeaconAddress[Number(iliadChainId) as keyof typeof spgnftBeaconAddress];

const baseConfig = {
  chain: chainStringToViemChain("iliad"),
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
        outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: mockERC721,
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
export const getStoryClient = (): StoryClient => {
  const config: StoryConfig = {
    chainId: "iliad",
    transport: http(RPC),
    account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Address),
  };
  return StoryClient.newClient(config);
};
