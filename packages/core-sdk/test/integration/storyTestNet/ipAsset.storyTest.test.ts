import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Account, Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import {
  IPAccountABI,
  getIPAssetRegistryConfig,
  getLicenseRegistryConfig,
  getLicensingModuleConfig,
} from "../../config";
import { storyTestnetAddress } from "../../env";

describe("IP Asset Functions in storyTestnet", () => {
  let client: StoryClient;
  let senderAddress: string;
  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    };
    const configAccount: Account = config.account as Account;
    senderAddress = configAccount.address;
    client = StoryClient.newClient(config);
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
    client.license.licensingModuleConfig = getLicensingModuleConfig("1513");
  });

  describe("Create root IP Asset", async function () {
    it("should mint NFT successfully", async () => {
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
            inputs: [{ internalType: "address", name: "to", type: "address" }],
            name: "mint",
            outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        address: storyTestnetAddress.MockERC721 as Hex,
        functionName: "mint",
        args: [process.env.STORY_TEST_NET_TEST_WALLET_ADDRESS as Hex],
      });
      const tokenId = await walletClient.writeContract(request);
      expect(tokenId).to.be.a("string");
      expect(tokenId).not.empty;
    });
  });
});
