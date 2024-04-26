import chai from "chai";
import { StoryClient } from "../../src";
import {
  Hex,
  http,
  createPublicClient,
  createWalletClient,
  PublicClient,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import chaiAsPromised from "chai-as-promised";
import { chainStringToViemChain, waitTx } from "../../src/utils/utils";
import { MockERC721, MockERC20, getTokenId, getStoryClientInSepolia } from "./util";

chai.use(chaiAsPromised);
const expect = chai.expect;
let snapshotId: string;
describe("Test royalty Functions", () => {
  let client: StoryClient;
  let publicClient: PublicClient;
  let walletClient: WalletClient;

  before(function () {
    client = getStoryClientInSepolia();
    const baseConfig = {
      chain: chainStringToViemChain("sepolia"),
      transport: http(process.env.SEPOLIA_RPC_PROVIDER_URL),
    } as const;
    publicClient = createPublicClient(baseConfig);
    walletClient = createWalletClient({
      ...baseConfig,
      account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex),
    });
  });
  describe("Royalty in storyTestNet", async function () {
    let ipId1: Hex;
    let ipId2: Hex;
    const getIpId = async (): Promise<Hex> => {
      const tokenId = await getTokenId();
      const response = await client.ipAsset.register({
        tokenContract: MockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      return response.ipId! as Hex;
    };
    const getCommercialPolicyId = async (): Promise<string> => {
      const response = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        currency: MockERC20,
        commercialRevShare: 100,
        txOptions: {
          waitForTransaction: true,
        },
      });
      return response.licenseTermsId!;
    };

    const attachLicenseTerms = async (ipId: Hex, licenseTermsId: string) => {
      await client.license.attachLicenseTerms({
        ipId,
        licenseTermsId: licenseTermsId,
        txOptions: {
          waitForTransaction: true,
        },
      });
    };

    before(async () => {
      ipId1 = await getIpId();
      ipId2 = await getIpId();
      console.log("ipId1", ipId1, "ipId2", ipId2);
      const licenseTermsId = await getCommercialPolicyId();
      console.log("licenseTermsId", licenseTermsId);
      await attachLicenseTerms(ipId1, licenseTermsId);
      await client.ipAsset.registerDerivative({
        childIpId: ipId2,
        parentIpIds: [ipId1],
        licenseTermsIds: [licenseTermsId],
        txOptions: {
          waitForTransaction: true,
        },
      });
    });

    it("should not throw error when collect royalty tokens", async () => {
      const response = await client.royalty.collectRoyaltyTokens({
        parentIpId: ipId1,
        royaltyVaultIpId: ipId2,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
      expect(response.royaltyTokensCollected).to.be.a("string").not.empty;
    });

    it("should not throw error when snapshot", async () => {
      const response = await client.royalty.snapshot({
        royaltyVaultIpId: ipId2,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
      expect(response.snapshotId).to.be.a("string");
      snapshotId = response.snapshotId!;
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
        address: MockERC20,
        functionName: "approve",
        args: [client.royalty.royaltyPolicyLapClient.address, BigInt(100)],
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
        address: MockERC20,
        functionName: "mint",
        account: walletClient.account,
        args: [process.env.SEPOLIA_TEST_WALLET_ADDRESS! as Hex, BigInt(1000)],
      });
      const mintHash = await walletClient.writeContract(request);
      await waitTx(publicClient, mintHash);
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: ipId1,
        payerIpId: ipId2,
        token: MockERC20,
        amount: "10",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });

    it("should not throw error when claimable revenue", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: ipId2,
        account: ipId1,
        snapshotId: snapshotId.toString(),
        token: MockERC20,
      });
      expect(response).to.be.a("string");
      console.log("response", response);
    });

    it("should not throw error when claim revenue", async () => {
      console.log("snapshotId", snapshotId.toString(), "ipId1", ipId1, "ipId2", ipId2);
      const response = await client.royalty.claimRevenue({
        royaltyVaultIpId: ipId2,
        account: ipId1,
        snapshotIds: [snapshotId.toString()],
        token: MockERC20,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.claimableToken).to.be.a("string");
      console.log("response", response);
    });
  });
});
