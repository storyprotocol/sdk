import { privateKeyToAccount } from "viem/accounts";
import {
  http,
  createPublicClient,
  createWalletClient,
  Hex,
  Address,
  Chain,
} from "viem";
import { sepolia } from "viem/chains";
import { SupportedChainIds } from "@story-protocol/core-sdk";

export const RPC = "https://rpc.partner.testnet.storyprotocol.net";
// export const RPC = "http://127.0.0.1:8545";
export const mockERC721Address = "0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F49";
export const mockERC20Address = "0xB132A6B7AE652c974EE1557A3521D53d18F6739f";

function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case "11155111":
    case "sepolia":
      return sepolia;
    default:
      throw new Error(`chainId ${chainId as string} not supported`);
  }
}
const baseConfig = {
  chain: chainStringToViemChain("sepolia"),
  transport: http(RPC),
} as const;
export const publicClient = createPublicClient(baseConfig);
export const walletClient = createWalletClient({
  ...baseConfig,
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
});

export const getTokenId = async (
  nftContract?: Address,
): Promise<number | undefined> => {
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
    address: nftContract || mockERC721Address,
    functionName: "mint",
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    args: [process.env.WALLET_PRIVATE_KEY as Hex],
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
