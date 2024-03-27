import { expect } from "chai";
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
import { renaissance } from "../../env";

describe("IP Asset Functions in renaissance", () => {
  let client: StoryClient;
  let senderAddress: string;
  before(function () {
    const config: StoryConfig = {
      chainId: "renaissance",
      transport: http(process.env.RENAISSANCE_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.RENAISSANCE_WALLET_PRIVATE_KEY as Hex),
    };
    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.ipAccountABI = IPAccountABI;
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
    client.license.licensingModuleConfig = getLicensingModuleConfig("1513");
  });

  describe("Create root IP Asset", async function () {
    it("should mint NFT successfully", async () => {
      const baseConfig = {
        chain: chainStringToViemChain("renaissance"),
        transport: http(process.env.RENAISSANCE_RPC_PROVIDER_URL),
      } as const;
      const publicClient = createPublicClient(baseConfig);
      const walletClient = createWalletClient({
        ...baseConfig,
        account: privateKeyToAccount(process.env.RENAISSANCE_WALLET_PRIVATE_KEY as Hex),
      });
      const { request } = await publicClient.simulateContract({
        abi: [
          {
            inputs: [
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "mintId",
            outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        address: renaissance.MockERC721 as Hex,
        functionName: "mintId",
        args: [process.env.RENAISSANCE_TEST_WALLET_ADDRESS as Hex, BigInt(121)],
      });
      const tokenId = await walletClient.writeContract(request);
      expect(tokenId).to.be.a("string");
      expect(tokenId).not.empty;
    });
  });
});
