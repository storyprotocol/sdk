import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import {
  Hex,
  http,
  Account,
  createPublicClient,
  createWalletClient,
  PublicClient,
  WalletClient,
  Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  IPAccountABI,
  getPILPolicyFrameworkManagerConfig,
  getIPAssetRegistryConfig,
  getLicenseRegistryConfig,
  getLicensingModuleConfig,
  getRoyaltyPolicyLAPConfig,
  getRoyaltyVaultImplConfig,
} from "../../config";
import chaiAsPromised from "chai-as-promised";
import { storyTestnetAddress } from "../../env";
import { chainStringToViemChain, waitTx } from "../../../src/utils/utils";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.skip("Test royalty Functions", () => {
  let client: StoryClient;
  let senderAddress: string;
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    };
    const configAccount: Account = config.account as Account;
    senderAddress = configAccount.address;
    client = StoryClient.newClient(config);
    client.policy.ipAccountABI = IPAccountABI;
    client.policy.pilPolicyFrameworkManagerConfig =
      getPILPolicyFrameworkManagerConfig("storyTestnet");
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
    client.license.licensingModuleConfig = getLicensingModuleConfig("1513");
    client.royalty.royaltyPolicyLAPConfig = getRoyaltyPolicyLAPConfig("1513");
    client.royalty.royaltyVaultImplConfig = getRoyaltyVaultImplConfig("1513");
    const baseConfig = {
      chain: chainStringToViemChain("storyTestnet"),
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
    } as const;
    publicClient = createPublicClient(baseConfig);
    walletClient = createWalletClient({
      ...baseConfig,
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    });
  });
  describe("Royalty in storyTestNet", async function () {
    let ipId1: Hex;
    let ipId2: Hex;
    let tokenId = 44;
    const getIpId = async (): Promise<Hex> => {
      tokenId++;

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
      const response = await client.ipAsset.register({
        tokenContract: storyTestnetAddress.MockERC721,
        tokenId: parseInt(logs[0].topics[3]!, 16).toString(),
        txOptions: {
          waitForTransaction: true,
        },
      });
      return response.ipId! as Hex;
    };
    const getCommercialPolicyId = async (): Promise<string> => {
      const response = await client.policy.registerPILCommercialUsePolicy({
        commercialRevShare: 100,
        territories: [],
        distributionChannels: [],
        contentRestrictions: [],
        txOptions: {
          waitForTransaction: true,
        },
      });
      return response.policyId!;
    };

    const addPolicyToIp = async (ipId: Hex, policyId: string) => {
      await client.policy.addPolicyToIp({
        ipId,
        policyId,
        txOptions: {
          waitForTransaction: true,
        },
      });
    };

    const mintLicense = async (ipId: Hex, policyId: string) => {
      const mintLicenseResponse = await client.license.mintLicense({
        policyId,
        licensorIpId: ipId,
        mintAmount: 1,
        receiverAddress: process.env.STORY_TEST_NET_TEST_WALLET_ADDRESS as Hex,
        txOptions: {
          waitForTransaction: true,
        },
      });
      return mintLicenseResponse.licenseId;
    };

    const linkIpToParents = async (licenseIds: string[], childIpId: Hex) => {
      await client.license.linkIpToParent({
        licenseIds: licenseIds,
        childIpId: childIpId,
        txOptions: {
          waitForTransaction: true,
        },
      });
    };
    before(async () => {
      ipId1 = await getIpId();
      ipId2 = await getIpId();
      const commercialPolicyId = await getCommercialPolicyId();
      await addPolicyToIp(ipId1, commercialPolicyId);
      const licenseForIpId1 = await mintLicense(ipId1, commercialPolicyId);
      await linkIpToParents([licenseForIpId1!], ipId2);
    });

    it("should not throw error when pay royalty on behalf", async () => {
      //1. approve the spender
      const abi = [
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];
      const { request: call } = await publicClient.simulateContract({
        abi: abi,
        address: storyTestnetAddress.MockERC20,
        functionName: "approve",
        args: [client.royalty.royaltyPolicyLAPConfig.address, BigInt(100)],
        account: walletClient.account,
      });
      const approveHash = await walletClient.writeContract(call);
      await waitTx(publicClient, approveHash);
      //2. mint the token
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
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "mint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        address: storyTestnetAddress.MockERC20,
        functionName: "mint",
        account: walletClient.account,
        args: [process.env.STORY_TEST_NET_TEST_WALLET_ADDRESS! as Hex, BigInt(100)],
      });
      const mintHash = await walletClient.writeContract(request);
      await waitTx(publicClient, mintHash);
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: ipId1,
        payerIpId: ipId2,
        token: storyTestnetAddress.MockERC20,
        amount: BigInt(10),
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });

    it("should not throw error when collect royalty tokens", async () => {
      const response = await client.royalty.collectRoyaltyTokens({
        ancestorIpId: ipId1,
        derivativeId: ipId2,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });
  });
});
