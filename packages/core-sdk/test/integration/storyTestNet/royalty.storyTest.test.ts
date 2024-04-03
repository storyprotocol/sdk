import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, http, Account, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  IPAccountABI,
  getPILPolicyFrameworkManagerConfig,
  getIPAssetRegistryConfig,
  getLicenseRegistryConfig,
  getLicensingModuleConfig,
  getRoyaltyModuleConfig,
} from "../../config";
import chaiAsPromised from "chai-as-promised";
import { storyTestnetAddress } from "../../env";
import { chainStringToViemChain } from "../../../src/utils/utils";
chai.use(chaiAsPromised);
const expect = chai.expect;
describe("Test royalty Functions", () => {
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
    client.policy.ipAccountABI = IPAccountABI;
    client.policy.pilPolicyFrameworkManagerConfig =
      getPILPolicyFrameworkManagerConfig("storyTestnet");
    client.ipAsset.ipAssetRegistryConfig = getIPAssetRegistryConfig("1513");
    client.license.licenseRegistryConfig = getLicenseRegistryConfig("1513");
    client.license.licensingModuleConfig = getLicensingModuleConfig("1513");
    client.royalty.royaltyModuleConfig = getRoyaltyModuleConfig("1513");
  });
  describe("Royalty in storyTestNet", async function () {
    let ipId1: Hex = "0x4b6af545E7C0A1783F771964aee349bed29dE6F5";
    let ipId2: Hex = "0x4D10a566c4D378284a84242E3397b20092483eD4";
    let tokenId = 14;
    let commercialPolicyId: string = "5";
    const getIpId = async (): Promise<Hex> => {
      tokenId++;
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
      return response.ipId!;
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
      const response = await client.policy.addPolicyToIp({
        ipId,
        policyId,
        txOptions: {
          waitForTransaction: true,
        },
      });

      console.log("addPolicyToIp", response.index);
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
      return await client.license.linkIpToParent({
        licenseIds: licenseIds,
        childIpId: childIpId,
        txOptions: {
          waitForTransaction: true,
        },
      });
    };
    before(async () => {
      //   ipId1 = await getIpId();
      //   ipId2 = await getIpId();
      //   console.log("ipId", ipId1, ipId2);
      //   commercialPolicyId = await getCommercialPolicyId();
      //   console.log("commercialPolicyId", commercialPolicyId);
      //   addPolicyToIp(ipId1, commercialPolicyId);
      //   const licenseForIpId1 = await mintLicense(ipId1, commercialPolicyId);
      //   console.log("licenseForIpId1", licenseForIpId1);
      //   const response = await linkIpToParents([licenseForIpId1!], ipId2);
      //   console.log("response", response);
    });

    it("should not throw error when collect royalty tokens", async () => {
      const response = await client.royalty.collectRoyaltyTokens({
        ancestorIpId: ipId1,
        txOptions: {
          waitForTransaction: true,
        },
      });
      console.log("collectRoyaltyTokens", response);
      expect(response.txHash).to.be.a("string").not.empty;
    });
  });
});
