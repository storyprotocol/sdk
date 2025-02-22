import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient, WalletClient, Account } from "viem";
import chaiAsPromised from "chai-as-promised";
import { RoyaltyClient } from "../../../src/resources/royalty";
import {
  IpRoyaltyVaultImplReadOnlyClient,
  erc20Address,
  wrappedIpAddress,
} from "../../../src/abi/generated";
import { aeneid } from "../../integration/utils/util";
import { ERC20Client, WIPTokenClient } from "../../../src/utils/token";
chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("Test RoyaltyClient", () => {
  let royaltyClient: RoyaltyClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    royaltyClient = new RoyaltyClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test royaltyClient.payRoyaltyOnBehalf", async () => {
    beforeEach(() => {
      sinon.stub(ERC20Client.prototype, "balanceOf").resolves(1n);
      sinon.stub(ERC20Client.prototype, "allowance").resolves(10000n);
      sinon.stub(ERC20Client.prototype, "approve").resolves(txHash);
      sinon.stub(WIPTokenClient.prototype, "balanceOf").resolves(1n);
      sinon.stub(WIPTokenClient.prototype, "allowance").resolves(1n);
      sinon.stub(WIPTokenClient.prototype, "approve").resolves(txHash);
      sinon.stub(WIPTokenClient.prototype, "address").get(() => wrappedIpAddress[aeneid]);
    });

    it("should throw receiverIpId error when call payRoyaltyOnBehalf given receiverIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.payRoyaltyOnBehalf({
          receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 1,
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to pay royalty on behalf: The receiver IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should throw payerIpId error when call payRoyaltyOnBehalf given payerIpId is not registered", async () => {
      sinon
        .stub(royaltyClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      try {
        await royaltyClient.payRoyaltyOnBehalf({
          receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          amount: 1,
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to pay royalty on behalf: The payer IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should return txHash when call payRoyaltyOnBehalf given correct args with erc20", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalf").resolves(txHash);
      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: erc20Address[aeneid],
        amount: 1,
      });

      expect(result.txHash).equals(txHash);
    });
    it("should convert IP to WIP when paying WIP via payRoyaltyOnBehalf", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      rpcMock.getBalance = sinon.stub().resolves(150n);
      const simulateContractStub = sinon.stub().resolves({ request: {} });
      rpcMock.simulateContract = simulateContractStub;
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: wrappedIpAddress[aeneid],
        amount: 100n,
        txOptions: { waitForTransaction: true },
      });
      expect(result.txHash).to.be.a("string").and.not.empty;
      expect(simulateContractStub.calledOnce).to.be.true;
      const calls = simulateContractStub.firstCall.args[0].args[0];
      expect(calls.length).to.equal(2); // deposit and payRoyaltyOnBehalf
    });

    it("should return encodedData when call payRoyaltyOnBehalf given correct args and encodedTxDataOnly is true", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(royaltyClient.royaltyModuleClient, "payRoyaltyOnBehalfEncode").returns({
        data: "0x",
        to: "0x",
      });

      const result = await royaltyClient.payRoyaltyOnBehalf({
        receiverIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        payerIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        amount: 1,
        txOptions: { encodedTxDataOnly: true },
      });

      expect(result.encodedTxData?.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test royaltyClient.claimableRevenue", async () => {
    it("should throw royaltyVaultIpId error when call claimableRevenue given royaltyVaultIpId is not registered", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: The royalty vault IP with id 0x73fCB515cEE99e4991465ef586CfE2B072EbB512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call claimableRevenue given royalty vault address is 0x", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      try {
        await royaltyClient.claimableRevenue({
          royaltyVaultIpId: "0x",
          claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to calculate claimable revenue: request.royaltyVaultIpId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call claimableRevenue given correct args", async () => {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyModuleClient, "ipRoyaltyVaults")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon.stub(IpRoyaltyVaultImplReadOnlyClient.prototype, "claimableRevenue").resolves(1n);

      const result = await royaltyClient.claimableRevenue({
        royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        claimer: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        token: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });
      expect(result).equals(1n);
    });
  });
});
