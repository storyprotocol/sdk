import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient, WalletClient, Account } from "viem";
import chaiAsPromised from "chai-as-promised";
import { RoyaltyClient } from "../../../src/resources/royalty";
import {
  IpRoyaltyVaultImplClient,
  RoyaltyPolicyLapGetRoyaltyDataResponse,
} from "../../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("Test RoyaltyClient", function () {
  let royaltyClient: RoyaltyClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    royaltyClient = new RoyaltyClient(rpcMock, walletMock);
    sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test royaltyClient.collectRoyaltyTokens", async function () {
    it("should throw parentIpId error when call collectRoyaltyTokens given parentIpId is not registered", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The parent IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultIpId error when call collectRoyaltyTokens given royaltyVaultIpId is not registered", async function () {
      sinon
        .stub(royaltyClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The royalty vault IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 is not registered.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call collectRoyaltyTokens given royalty vault address is empty", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([] as unknown as RoyaltyPolicyLapGetRoyaltyDataResponse);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The royalty vault IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 address is not set.",
        );
      }
    });

    it("should throw royaltyVaultAddress error when call collectRoyaltyTokens given royalty vault address is 0x", async function () {
      sinon.stub(royaltyClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(royaltyClient.royaltyPolicyLapClient, "getRoyaltyData")
        .resolves([true, "0x", 1, ["0x73fcb515cee99e4991465ef586cfe2b072ebb512"], [1]]);

      try {
        await royaltyClient.collectRoyaltyTokens({
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          royaltyVaultIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        });
      } catch (err) {
        expect((err as Error).message).equals(
          "Failed to collect royalty tokens: The royalty vault IP with id 0x73fcb515cee99e4991465ef586cfe2b072ebb512 address is not set.",
        );
      }
    });
  });
});
