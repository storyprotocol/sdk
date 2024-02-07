import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { DisputeClient } from "../../../src/resources/dispute";
import { AddressZero } from "../../../src";

chai.use(chaiAsPromised);

describe("Test DisputeClient", function () {
  let disputeClient: DisputeClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    disputeClient = new DisputeClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Whitelist Dispute Tags", async function () {
    it("should be able to whitelist dispute tags", async () => {
      const mockTxHash = "0xeef10fc5170f669b86c4cd0444882a96087221325f8bf2f55d6188633aa7be7c";
      rpcMock.simulateContract = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mockTxHash);

      const response = await disputeClient.whitelistDisputeTags({
        tag: "testTag",
        allowed: true,
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });
});
