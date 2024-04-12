import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import chaiAsPromised from "chai-as-promised";
import { storyTestnetAddress } from "../../env";
import { chainStringToViemChain } from "../../../src/utils/utils";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("License Functions in storyTestnet", () => {
  let client: StoryClient;
  const account = privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex);

  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account,
    };
    client = StoryClient.newClient(config);
  });
  describe("registering license with different types", async function () {
    it("should not throw error when registering license with non commercial social remixing PIL", async function () {
      const result = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      // expect(result.txHash).to.a("string").and.not.empty;
      expect(result.licenseId).to.be.a("string").and.not.empty;
    });

    it("should not throw error when registering license with commercial use", async function () {
      const result = await client.license.registerCommercialUsePIL({
        mintingFee: "1",
        currency: storyTestnetAddress.MockERC20,
        txOptions: {
          waitForTransaction: true,
        },
      });
      // expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseId).to.be.a("string").not.empty;
    });

    it("should not throw error when registering license with commercial Remix use", async function () {
      const result = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        commercialRevShare: 100,
        currency: storyTestnetAddress.MockERC20,
        txOptions: {
          waitForTransaction: true,
        },
      });
      // expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseId).to.be.a("string").and.not.empty;
    });
  });

  describe("attach License Terms and mint license tokens", async function () {
    let ipId: Hex;
    let licenseId: string;
    let tokenId: string;
    before(async function () {
      const baseConfig = {
        chain: chainStringToViemChain("storyTestnet"),
        transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      } as const;
      const publicClient = createPublicClient(baseConfig);
      const walletClient = createWalletClient({
        ...baseConfig,
        account,
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
        args: [account.address, BigInt(Math.round(new Date().getTime() / 1000))],
      });
      const hash = await walletClient.writeContract(request);
      const { logs } = await publicClient.waitForTransactionReceipt({
        hash,
      });
      if (logs[0].topics[3]) {
        tokenId = parseInt(logs[0].topics[3], 16).toString();
      }

      const registerResult = await client.ipAsset.register({
        tokenContract: storyTestnetAddress.MockERC721,
        tokenId: tokenId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      ipId = registerResult.ipId!;

      const registerLicenseResult = await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      });
      licenseId = registerLicenseResult.licenseId!;
    });

    it("should not throw error when attach License Terms", async function () {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTemplate: storyTestnetAddress.PILicenseTemplate,
        licenseTermsId: licenseId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
    });

    it("should not throw error when minting license tokens", async function () {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(result.licenseTokenId).to.be.a("string").and.not.empty;
    });
  });
});
