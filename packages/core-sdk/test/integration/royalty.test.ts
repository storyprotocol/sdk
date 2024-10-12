import chai from "chai";
import { StoryClient } from "../../src";
import { Address, Hex, encodeFunctionData } from "viem";
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
    let parentIpId: Hex;
    let childIpId: Hex;
    let licenseTermsId: bigint;
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
        defaultMintingFee: "100",
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
        txOptions: {
          waitForTransaction: true,
        },
      });
    });

    it.skip("should not throw error when pay royalty on behalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: MockERC20.address,
        amount: "100",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").not.empty;
    });
    // Because of the snapshot interval is long, so we can't get the snapshotId in the same test case. Let's skip the related test case.
    it.skip("should not throw error when snapshot", async () => {
      const response = await client.royalty.snapshot({
        royaltyVaultIpId: parentIpId,
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
        royaltyVaultIpId: parentIpId,
        account: parentIpId,
        snapshotId: snapshotId.toString(),
        token: MockERC20.address,
      });
      expect(response).to.be.a("bigint");
    });

    it.skip("should not throw error when claim revenue by ipAccount", async () => {
      const response = await client.royalty.claimRevenue({
        royaltyVaultIpId: parentIpId,
        snapshotIds: [snapshotId.toString()],
        account: parentIpId,
        token: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.claimableToken).to.be.a("bigint");
    });

    it.skip("should not throw error when claim revenue by ipAccount by EOA", async () => {
      const proxyAddress = await client.royalty.getRoyaltyVaultAddress(parentIpId);
      //1.transfer token to eoa
      await client.ipAccount.execute({
        to: proxyAddress,
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
      //2. transfer token to royaltyVault，revenue token
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: MockERC20.address,
        amount: "10",
        txOptions: {
          waitForTransaction: true,
        },
      });
      const snapshotId = await client.royalty.snapshot({
        royaltyVaultIpId: parentIpId,
        txOptions: { waitForTransaction: true },
      });

      const response = await client.royalty.claimRevenue({
        royaltyVaultIpId: parentIpId,
        snapshotIds: [snapshotId.snapshotId!],
        token: MockERC20.address,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.claimableToken).to.be.a("bigint");
    });
    describe("royalty workflow", async () => {
      let child2IpId: Address;
      before(async () => {
        child2IpId = await getIpId();
        await client.ipAsset.registerDerivative({
          childIpId: child2IpId,
          parentIpIds: [childIpId],
          licenseTermsIds: [licenseTermsId],
          txOptions: {
            waitForTransaction: true,
          },
        });
      });
      it.skip("should not throw error when transfer to vault and snapshot and claim by token batch", async () => {
        await client.royalty.payRoyaltyOnBehalf({
          receiverIpId: childIpId,
          payerIpId: child2IpId,
          token: MockERC20.address,
          amount: "1000000",
          txOptions: {
            waitForTransaction: true,
          },
        });
        const response = await client.royalty.transferToVaultAndSnapshotAndClaimByTokenBatch({
          ancestorIpId: parentIpId,
          royaltyClaimDetails: [
            {
              childIpId: childIpId,
              royaltyPolicy:
                royaltyPolicyLapAddress[iliadChainId as keyof typeof royaltyPolicyLapAddress],
              currencyToken: MockERC20.address,
              amount: BigInt(1),
            },
          ],
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(response.txHash).to.be.a("string").not.empty;
      });
      it.skip("should not throw error when transfer to vault and snapshot and claim by snapshot batch", async () => {
        await client.royalty.payRoyaltyOnBehalf({
          receiverIpId: childIpId,
          payerIpId: child2IpId,
          token: MockERC20.address,
          amount: "100000",
          txOptions: {
            waitForTransaction: true,
          },
        });
        const { snapshotId } = await client.royalty.snapshot({
          royaltyVaultIpId: childIpId,
          txOptions: {
            waitForTransaction: true,
          },
        });
        const response = await client.royalty.transferToVaultAndSnapshotAndClaimBySnapshotBatch({
          ancestorIpId: parentIpId,
          royaltyClaimDetails: [
            {
              childIpId: childIpId,
              royaltyPolicy:
                royaltyPolicyLapAddress[iliadChainId as keyof typeof royaltyPolicyLapAddress],
              currencyToken: MockERC20.address,
              amount: BigInt(1),
            },
          ],
          unclaimedSnapshotIds: [snapshotId!],
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(response.txHash).to.be.a("string").not.empty;
      });

      it("should not throw error when snapshot and claim by token batch", async () => {
        await client.royalty.payRoyaltyOnBehalf({
          receiverIpId: childIpId,
          payerIpId: child2IpId,
          token: MockERC20.address,
          amount: "100000",
          txOptions: {
            waitForTransaction: true,
          },
        });
        const response = await client.royalty.snapshotAndClaimByTokenBatch({
          ipId: childIpId,
          currencyTokens: [MockERC20.address],
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(response.txHash).to.be.a("string").not.empty;
      });

      it("should not throw error when snapshot and claim by snapshot batch", async () => {
        await client.royalty.payRoyaltyOnBehalf({
          receiverIpId: childIpId,
          payerIpId: child2IpId,
          token: MockERC20.address,
          amount: "100000",
          txOptions: {
            waitForTransaction: true,
          },
        });
        const { snapshotId } = await client.royalty.snapshot({
          royaltyVaultIpId: childIpId,
          txOptions: {
            waitForTransaction: true,
          },
        });
        await client.royalty.payRoyaltyOnBehalf({
          receiverIpId: childIpId,
          payerIpId: child2IpId,
          token: MockERC20.address,
          amount: "100000",
          txOptions: {
            waitForTransaction: true,
          },
        });
        const response = await client.royalty.snapshotAndClaimBySnapshotBatch({
          ipId: childIpId,
          unclaimedSnapshotIds: [snapshotId!],
          currencyTokens: [MockERC20.address],
          txOptions: {
            waitForTransaction: true,
          },
        });
        expect(response.txHash).to.be.a("string").not.empty;
      });
    });
  });
});
