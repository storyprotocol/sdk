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

  describe("[Write functions] Should be able to", async function () {
    it("set tag and wait for transaction", async () => {
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

    it("remove tag", async () => {
      const tagString = "bad-tag69";
      const ipId = "0xabCc2421F927c128B9F5a94B612F4541C8E624B6";
      const mockSetTxHash = "0xset123";
      const mockRemoveTxHash = "0xremove123";

      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(mockRemoveTxHash);

      const response = await expect(
        taggingClient.removeTag({
          tag: tagString,
          ipId: ipId,
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.equal(mockRemoveTxHash);
    });
  });

  /**
   *  READ FUNCTIONS
   */

  describe("[Read Functions] should be able to", function () {
    it("read isTagged", async () => {
      const mockResponse = true;
      rpcMock.readContract = sinon.stub().resolves(mockResponse);

      const response = await taggingClient.readIsTagged({
        tag: "testTag",
        ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
      });

      expect(response).to.equal(mockResponse);
    });

    it("read tag at index for an IP", async () => {
      const mockResponse = "0x7465737454616700000000000000000000000000000000000000000000000007";
      rpcMock.readContract = sinon.stub().resolves(mockResponse);

      const response = await taggingClient.readTagAtIndexForIp({
        ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
        index: 0,
      });

      expect(response).to.equal(mockResponse);
      expect(response).to.be.a("string");
    });

    it("read tag string at index for an IP", async () => {
      const mockResponse = "testTag";
      rpcMock.readContract = sinon.stub().resolves(mockResponse);

      const response = await taggingClient.readTagStringAtIndexForIp({
        ipId: "0xabCc2421F927c128B9F5a94B612F4541C8E624B6",
        index: 0,
      });

      expect(response).to.equal(mockResponse);
      expect(response).to.be.a("string");
    });
  });
});
