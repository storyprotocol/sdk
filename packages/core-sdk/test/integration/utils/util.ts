import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain, waitTx } from "../../../src/utils/utils";
import { http, createPublicClient, createWalletClient, Hex, Address } from "viem";
import { StoryClient, StoryConfig } from "../../../src";
import {
  licenseTokenAbi,
  licenseTokenAddress,
  spgnftBeaconAddress,
} from "../../../src/abi/generated";
export const RPC = "https://odyssey.storyrpc.io";
export const odyssey = 1516;

export const mockERC721 = "0xd7eb01052362e9fb13f624c17b4ead08e0eaae17";
export const licenseToken = licenseTokenAddress[odyssey];
export const spgNftBeacon = spgnftBeaconAddress[odyssey];

const baseConfig = {
  chain: chainStringToViemChain("odyssey"),
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

export const approveForLicenseToken = async (address: Address, tokenId: bigint) => {
  const { request: call } = await publicClient.simulateContract({
    abi: licenseTokenAbi,
    address: licenseToken,
    functionName: "approve",
    account: walletClient.account,
    args: [address, tokenId],
  });
  const hash = await walletClient.writeContract(call);
  await waitTx(publicClient, hash);
};
export const getStoryClient = (): StoryClient => {
  const config: StoryConfig = {
    chainId: "odyssey",
    transport: http(RPC),
    account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Address),
  };
  return StoryClient.newClient(config);
};
