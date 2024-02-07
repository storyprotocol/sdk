import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { TaggingClient } from "../../../src/resources/tagging";
import { AddressZero } from "../../../src";

chai.use(chaiAsPromised);

describe("Test TaggingClient", function () {
  let taggingClient: TaggingClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    taggingClient = new TaggingClient(rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Set Tag", async function () {
    it("should be able to set tag and wait for transaction", async () => {
      const mockTxHash = "0xeef10fc5170f669b86c4cd0444882a96087221325f8bf2f55d6188633aa7be7c";
      rpcMock.readContract = sinon.stub().resolves(AddressZero);
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(mockTxHash);

      const response = await expect(
        taggingClient.setTag({
          tag: "testTag",
          ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });
});
