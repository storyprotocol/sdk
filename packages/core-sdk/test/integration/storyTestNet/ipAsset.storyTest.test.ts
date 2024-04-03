import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import {
  IPAccountABI,
  getIPAssetRegistryConfig,
  getLicenseRegistryConfig,
  getLicensingModuleConfig,
} from "../../config";
import { storyTestnetAddress } from "../../env";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("IP Asset Functions in storyTestnet", () => {
  let client: StoryClient;
  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    };
    client = StoryClient.newClient(config);
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
    client.license.licensingModuleConfig = getLicensingModuleConfig("1513");
  });

  describe.skip("Create IP Asset", async function () {
    let tokenId: string;
    before(async () => {
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
        address: storyTestnetAddress.MockERC721,
        functionName: "mintId",
        args: [process.env.STORY_TEST_NET_TEST_WALLET_ADDRESS as Hex, BigInt(14)],
      });
      const hash = await walletClient.writeContract(request);
      const { logs } = await publicClient.waitForTransactionReceipt({
        hash,
      });

      if (logs[0].topics[3]) {
        tokenId = parseInt(logs[0].topics[3], 16).toString();
      }
    });

    it("should not throw error when registering a IP Asset", async () => {
      expect(tokenId).to.be.a("string");
      expect(tokenId).not.empty;

      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.register({
          tokenContract: storyTestnetAddress.MockERC721,
          tokenId: tokenId,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;
      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
      if (waitForTransaction) {
        expect(response.ipId).to.be.a("string");
        expect(response.ipId).not.empty;
      }
    });
  });
});
