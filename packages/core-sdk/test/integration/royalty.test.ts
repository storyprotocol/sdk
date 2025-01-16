import chai from "chai";
import { StoryClient } from "../../src";
import { Address, Hex, encodeFunctionData } from "viem";
import chaiAsPromised from "chai-as-promised";
import { mockERC721, getTokenId, getStoryClient } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("Test royalty Functions", () => {
  let client: StoryClient;

  before(async () => {
    client = getStoryClient();
  });
  describe("Royalty Functions", async () => {
    let parentIpId: Hex;
    let childIpId: Hex;
    let licenseTermsId: bigint;
    let parentIpIdRoyaltyAddress: Address;
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
        defaultMintingFee: "100000",
        currency: MockERC20.address,
        commercialRevShare: 10,
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

    const transferToken = async () => {
      parentIpIdRoyaltyAddress = await client.royalty.getRoyaltyVaultAddress(parentIpId);
      //transfer revenue token to eoa
      await client.ipAccount.execute({
        to: parentIpIdRoyaltyAddress,
        value: 0,
        ipId: parentIpId,
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
    };
    before(async () => {
      parentIpId = await getIpId();
      childIpId = await getIpId();
      licenseTermsId = await getCommercialPolicyId();
      await attachLicenseTerms(parentIpId, licenseTermsId);
      const mockERC20 = new MockERC20();
      await mockERC20.approve(client.royalty.royaltyModuleClient.address);
      await client.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: [parentIpId],
        licenseTermsIds: [licenseTermsId],
        maxMintingFee: "0",
        maxRts: "0",
        maxRevenueShare: "0",
        txOptions: {
          waitForTransaction: true,
        },
      });
      await transferToken();
    });

    it("should not throw error when pay royalty on behalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: MockERC20.address,
        amount: 10 * 10 ** 2,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });

    it("should not throw error when claimable revenue", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: parentIpId,
        claimer: process.env.TEST_WALLET_ADDRESS as Address,
        token: MockERC20.address,
      });
      expect(response).to.be.a("bigint");
    });
  });
});
