import chai from "chai";
import { StoryClient } from "../../src";
import { Hex, encodeFunctionData, parseUnits } from "viem";
import chaiAsPromised from "chai-as-promised";
import { mockERC721, getTokenId, getStoryClient, iliadChainId } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import { royaltyPolicyLapAddress } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;
let snapshotId: bigint;
describe("Test royalty Functions", () => {
  let client: StoryClient;

  before(() => {
    client = getStoryClient();
  });
  describe("Royalty Functions", async () => {
    let ipId1: Hex;
    let ipId2: Hex;
    const getIpId = async (): Promise<Hex> => {
      const tokenId = await getTokenId();
      const response = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      return response.ipId! as Hex;
    };
    const getCommercialPolicyId = async (): Promise<bigint> => {
      const response = await client.license.registerCommercialRemixPIL({
        mintingFee: "1",
        currency: MockERC20.address,
        commercialRevShare: 100,
        txOptions: {
          waitForTransaction: true,
        },
      });
      return response.licenseTermsId!;
    };

    const attachLicenseTerms = async (ipId: Hex, licenseTermsId: bigint) => {
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
      const licenseTermsId = await getCommercialPolicyId();
      await attachLicenseTerms(ipId1, licenseTermsId);
      const mockERC20 = new MockERC20();
      await mockERC20.approve(
        royaltyPolicyLapAddress[Number(iliadChainId) as keyof typeof royaltyPolicyLapAddress],
      );
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
      expect(response.royaltyTokensCollected).to.be.a("bigint");
    });

    it("should not throw error when pay royalty on behalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: ipId1,
        payerIpId: ipId2,
        token: MockERC20.address,
        amount: "10",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });
    // Because of the snapshot interval is long, so we can't get the snapshotId in the same test case. Let's skip the related test case.
    it.skip("should not throw error when snapshot", async () => {
      const response = await client.royalty.snapshot({
        royaltyVaultIpId: ipId1,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
      expect(response.snapshotId).to.be.a("bigint");
      snapshotId = response.snapshotId!;
    });
    it.skip("should not throw error when claimable revenue", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: ipId1,
        account: ipId1,
        snapshotId: snapshotId.toString(),
        token: MockERC20.address,
      });
      expect(response).to.be.a("bigint");
    });

    it.skip("should not throw error when claim revenue by ipAccount", async () => {
      const response = await client.royalty.claimRevenue({
        royaltyVaultIpId: ipId1,
        snapshotIds: [snapshotId.toString()],
        account: ipId1,
        token: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.claimableToken).to.be.a("bigint");
    });

    it.skip("should not throw error when claim revenue by ipAccount by EOA", async () => {
      const proxyAddress = await client.royalty.getRoyaltyVaultAddress(ipId1);
      //1.transfer token to eoa
      await client.ipAccount.execute({
        to: proxyAddress,
        value: 0,
        ipId: ipId1,
        txOptions: {
          waitForTransaction: true,
        },
        data: encodeFunctionData({
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
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "transfer",
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
          ],
          functionName: "transfer",
          args: [process.env.TEST_WALLET_ADDRESS as Hex, BigInt(10 * 10 ** 6)],
        }),
      });
      //2. transfer token to royaltyVault，revenue token
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: ipId1,
        payerIpId: ipId2,
        token: MockERC20.address,
        amount: "10",
        txOptions: {
          waitForTransaction: true,
        },
      });
      const snapshotId = await client.royalty.snapshot({
        royaltyVaultIpId: ipId1,
        txOptions: { waitForTransaction: true },
      });

      const response = await client.royalty.claimRevenue({
        royaltyVaultIpId: ipId1,
        snapshotIds: [snapshotId.snapshotId!],
        token: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.claimableToken).to.be.a("bigint");
    });
  });
});
