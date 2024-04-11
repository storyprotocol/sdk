import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, createPublicClient, createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../../src/utils/utils";
import { storyTestnetAddress } from "../../env";
import chaiAsPromised from "chai-as-promised";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts";

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("IP Asset Functions in storyTestnet", () => {
  let client: StoryClient;
  let permissionLessClient: StoryClient;
  const account = privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex);

  before(async function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account,
    };
    client = StoryClient.newClient(config);

    const rpcUrl = "https://api.pimlico.io/v2/1513/rpc?apikey="+process.env.PIMLICO_API_KEY;
    const publicClient = createPublicClient({
      chain: chainStringToViemChain("storyTestnet"),
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
    });

    const pimlicoBundlerClient = createPimlicoBundlerClient({
      chain: chainStringToViemChain("storyTestnet"),
      transport: http(rpcUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });

    const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      signer: account,
    });

    const paymasterClient = createPimlicoPaymasterClient({
      transport: http(rpcUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });

    const smartAccountClient = createSmartAccountClient({
      account: kernelAccount,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      chain: chainStringToViemChain("storyTestnet"),
      bundlerTransport: http(rpcUrl),
      middleware: {
        gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
      },
    });

    console.log("AA Wallet: ", smartAccountClient.account.address);

    permissionLessClient = StoryClient.newClientUseWallet({
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      wallet: smartAccountClient,
    });
  });

  describe("Create IP Asset", async function () {
    let tokenId: string = "3000";
    before(async () => {
      //TODO: wait for MockERC721 redeploy
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
        args: [account.address, BigInt(10000)],
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

      let response;
      const waitForTransaction: boolean = true;
      try {
        response = await expect(
          permissionLessClient.ipAsset.register({
            tokenContract: storyTestnetAddress.MockERC721,
            tokenId: tokenId,
            txOptions: {
              waitForTransaction: waitForTransaction,
            },
          }),
        ).to.not.be.rejected;
      } catch (err) {
        console.log(err);
      }

      console.log(response);
      // expect(response.txHash).to.be.a("string");
      // expect(response.txHash).not.empty;
      if (waitForTransaction) {
        console.log(response.ipId);
        expect(response.ipId).to.be.a("string");
        expect(response.ipId).not.empty;
      }
    });
  });
});
