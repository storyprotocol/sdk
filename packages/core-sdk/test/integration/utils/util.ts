import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain, waitTx } from "../../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex, Address } from "viem";
import { StoryClient, StoryConfig } from "../../../src";
import {
  licenseTokenAbi,
  licenseTokenAddress,
  spgnftBeaconAddress,
} from "../../../src/abi/generated";
export const RPC = "https://story-testnet.aura.network";
export const iliadChainId = 1513;

export const mockERC721 = "0x322813fd9a801c5507c9de605d63cea4f2ce6c44";
export const licenseToken =
  licenseTokenAddress[Number(iliadChainId) as keyof typeof licenseTokenAddress];
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

export const approveForLicenseToken = async (address: Address) => {
  const tokenId = await publicClient.readContract({
    abi: licenseTokenAbi,
    address: licenseToken,
    functionName: "balanceOf",
    args: [address],
  });
  const { request: call } = await publicClient.simulateContract({
    abi: licenseTokenAbi,
    address: licenseToken,
    functionName: "approve",
    account: walletClient.account,
    args: [address, tokenId],
  });
  const hash = await walletClient.writeContract(call);
  console.log("erc721 approve hash: ", hash);
  await waitTx(publicClient, hash);
};
export const getStoryClient = (): StoryClient => {
  const config: StoryConfig = {
    chainId: "iliad",
    transport: http(RPC),
    account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Address),
  };
  return StoryClient.newClient(config);
};
