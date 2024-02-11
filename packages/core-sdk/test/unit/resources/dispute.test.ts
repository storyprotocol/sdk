import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { DisputeClient } from "../../../src/resources/dispute";
import { AddressZero } from "../../../src";
import { CancelDisputeRequest } from "../../../src/types/resources/dispute";

chai.use(chaiAsPromised);

describe("Test DisputeClient", function () {
  let disputeClient: DisputeClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  const mock = {
    txHash: "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb",
  };

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    disputeClient = new DisputeClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("[Write Functions] Should be able to", async function () {
    it.skip("raise a dispute", async () => {
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      const raiseDisputeRequest = {
        targetIpId:
          "0xa3028b46ff4aeba585ebfa1c241ad4a453b6f10dc7bc3d3ebaa9cecc680a6f71" as `0x${string}`,
        arbitrationPolicy: "0xC6A1c49BCeeE2E512167d5c03e4753776477730b" as `0x${string}`,
        linkToDisputeEvidence: "foo",
        targetTag: "bar",
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(disputeClient.raiseDispute(raiseDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
    it("cancel a dispute and wait for txn", async () => {
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves();
      walletMock.writeContract = sinon.stub().resolves(mock.txHash);

      const cancelDisputeRequest: CancelDisputeRequest = {
        disputeId: 1,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const response = await expect(disputeClient.cancelDispute(cancelDisputeRequest)).to.not.be
        .rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });
});
