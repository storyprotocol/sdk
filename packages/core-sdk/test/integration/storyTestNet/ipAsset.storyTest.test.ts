import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import { storyTestnetAddress } from "../../env";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const expect = chai.expect;

const parentIpId = "0xca2def24ec4A50633a922245F84518504aaAE562";
const noCommercialLicenseTermsId = "6";
let startTokenId = 128;
let ipId: Hex;
describe("IP Asset Functions in storyTestnet", () => {
  let client: StoryClient;
  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    };
    client = StoryClient.newClient(config);
  });
  const getTokenId = async (tokenId: number): Promise<string | undefined> => {
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
  describe("Create IP Asset", async function () {
    it("should not throw error when registering a IP Asset", async () => {
      const tokenId = await getTokenId(startTokenId++);
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAsset.register({
          tokenContract: storyTestnetAddress.MockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;
      if (waitForTransaction) {
        expect(response.ipId).to.be.a("string").and.not.empty;
        ipId = response.ipId;
      }
    });

    it("should not throw error when registering derivative", async () => {
      await client.license.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const response = await expect(
        client.ipAsset.registerDerivative({
          childIpId: ipId,
          parentIpIds: [parentIpId],
          licenseTermsIds: [noCommercialLicenseTermsId],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when registering derivative with license tokens", async () => {
      const tokenId = await getTokenId(startTokenId++);
      const ipId = (
        await client.ipAsset.register({
          tokenContract: storyTestnetAddress.MockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
      const mintLicenseTokensResult = await client.license.mintLicenseTokens({
        licenseTermsId: noCommercialLicenseTermsId,
        licensorIpId: parentIpId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      const response = await expect(
        client.ipAsset.registerDerivativeWithLicenseTokens({
          childIpId: ipId,
          licenseTokenIds: [mintLicenseTokensResult.licenseTokenId!],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(response.txHash).to.be.a("string").not.empty;
    });
  });
});
