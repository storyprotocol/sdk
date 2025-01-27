import chai from "chai";
import { StoryClient } from "../../src";
import { Address, Hex, encodeFunctionData } from "viem";
import chaiAsPromised from "chai-as-promised";
import { mockERC721, getTokenId, getStoryClient, homer } from "./utils/util";
import { MockERC20 } from "./utils/mockERC20";
import { mockErc20Address } from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Royalty Functions", () => {
  let client: StoryClient;
  let parentIpId: Hex;
  let childIpId: Hex;
  let licenseTermsId: bigint;
  let parentIpIdRoyaltyAddress: Address;
  let mockERC20: MockERC20;

  // Helper functions
  const getIpId = async (): Promise<Hex> => {
    const tokenId = await getTokenId();
    const response = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
      txOptions: { waitForTransaction: true },
    });
    if (!response.ipId) {
      throw new Error("Failed to register IP");
    }
    return response.ipId as Hex;
  };

  const getCommercialPolicyId = async (): Promise<bigint> => {
    const response = await client.license.registerCommercialRemixPIL({
      defaultMintingFee: "100000",
      currency: mockErc20Address[homer],
      commercialRevShare: 10,
      txOptions: { waitForTransaction: true },
    });
    return response.licenseTermsId!;
  };

  const attachLicenseTerms = async (ipId: Hex, licenseTermsId: bigint) => {
    await client.license.attachLicenseTerms({
      ipId,
      licenseTermsId: licenseTermsId,
      txOptions: { waitForTransaction: true },
    });
  };

  const setupRoyaltyVault = async () => {
    parentIpIdRoyaltyAddress = await client.royalty.getRoyaltyVaultAddress(parentIpId);
    await client.ipAccount.execute({
      to: parentIpIdRoyaltyAddress,
      value: 0,
      ipId: parentIpId,
      txOptions: { waitForTransaction: true },
      data: encodeFunctionData({
        abi: [
          {
            inputs: [
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "value", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
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
    client = getStoryClient();
    mockERC20 = new MockERC20();

    // Setup initial state
    parentIpId = await getIpId();
    childIpId = await getIpId();
    licenseTermsId = await getCommercialPolicyId();

    // Setup relationships and approvals
    await attachLicenseTerms(parentIpId, licenseTermsId);
    await mockERC20.approve(client.royalty.royaltyModuleClient.address);

    // Register derivative
    await client.ipAsset.registerDerivative({
      childIpId: childIpId,
      parentIpIds: [parentIpId],
      licenseTermsIds: [licenseTermsId],
      maxMintingFee: "0",
      maxRts: "0",
      maxRevenueShare: "0",
      txOptions: { waitForTransaction: true },
    });

    await setupRoyaltyVault();
  });

  describe("Royalty Payments", () => {
    it("should successfully pay royalty on behalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: mockErc20Address[homer],
        amount: 10 * 10 ** 2,
        txOptions: { waitForTransaction: true },
      });

      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should return encoded transaction data for payRoyaltyOnBehalf", async () => {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: parentIpId,
        payerIpId: childIpId,
        token: mockErc20Address[homer],
        amount: 10 * 10 ** 2,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should fail to pay royalty with unregistered receiver", async () => {
      const unregisteredIpId = "0x1234567890123456789012345678901234567890" as Hex;
      await expect(
        client.royalty.payRoyaltyOnBehalf({
          receiverIpId: unregisteredIpId,
          payerIpId: childIpId,
          token: mockErc20Address[homer],
          amount: 10 * 10 ** 2,
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejectedWith(`The receiver IP with id ${unregisteredIpId} is not registered.`);
    });
  });

  describe("Revenue Queries", () => {
    it("should return claimable revenue amount", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: parentIpId,
        claimer: process.env.TEST_WALLET_ADDRESS as Address,
        token: mockErc20Address[homer],
      });

      expect(response).to.be.a("bigint");
    });

    it("should get royalty vault address", async () => {
      const address = await client.royalty.getRoyaltyVaultAddress(parentIpId);
      expect(address).to.be.a("string").and.not.empty;
      expect(address).to.equal(parentIpIdRoyaltyAddress);
    });

    it("should fail to get royalty vault address for unregistered IP", async () => {
      const unregisteredIpId = "0x1234567890123456789012345678901234567890" as Hex;
      await expect(client.royalty.getRoyaltyVaultAddress(unregisteredIpId)).to.be.rejectedWith(
        `The royalty vault IP with id ${unregisteredIpId} is not registered.`,
      );
    });
  });

  describe("Error Cases", () => {
    it("should fail to pay royalty with invalid amount", async () => {
      await expect(
        client.royalty.payRoyaltyOnBehalf({
          receiverIpId: parentIpId,
          payerIpId: childIpId,
          token: mockErc20Address[homer],
          amount: -1,
          txOptions: { waitForTransaction: true },
        }),
      ).to.be.rejected;
    });

    it("should return zero for claimable revenue with invalid token", async () => {
      const response = await client.royalty.claimableRevenue({
        royaltyVaultIpId: parentIpId,
        claimer: process.env.TEST_WALLET_ADDRESS as Address,
        token: "0x0000000000000000000000000000000000000000" as Address,
      });

      expect(response).to.equal(0n);
    });
  });
});
