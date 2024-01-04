import chai, { expect } from "chai";
import { RelationshipTypeClient } from "../../../src/resources/relationshipType";
import { createMock } from "../testUtils";
import * as sinon from "sinon";

import chaiAsPromised from "chai-as-promised";
import { AxiosInstance } from "axios";
import { PublicClient, WalletClient } from "viem";
import exp from "constants";

chai.use(chaiAsPromised);

describe("Test Relationship Type Client", function () {
  let relationshipClient: RelationshipTypeClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    relationshipClient = new RelationshipTypeClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test RelationshipClient.registerRelationshipType", () => {
    it("should not throw error when registering a relationship type", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const resp = await relationshipClient.register({
        ipOrgId: "0xb422E54932c1dae83E78267A4DD2805aa64A8061",
        relType: "appears_in",
        relatedElements: {
          src: 1,
          dst: 1,
        },
        allowedSrcIpAssetTypes: [1],
        allowedDstIpAssetTypes: [1],
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(resp.txHash).to.be.equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
    });

    it("should not throw error when registering a relationship type and wait for transaction confirmed", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x49477130a70a37e0d6e22b674ef9e923e6d0202c",
            topics: [
              "0x5afe4586ed79afd39271a5d07aaa8d60de58e6e9a48ebf10c8f1ce828b592e75",
              "0xfc7f0454ed02c478c10dae3ce113c900c4f9d3b10762ac2d41405fa8fc48713b",
            ],
            data: "0x00000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000ad2377c8f9f0ca6382fef166b08aede8318fe49c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ad2377c8f9f0ca6382fef166b08aede8318fe49c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a617070656172735f696e00000000000000000000000000000000000000000000",
            blockNumber: 4727501,
            transactionHash: "0x99d5736c65bd81cd4a361a731d4a035375a0926c95e4132e8fcb80ad5b602b5c",
            transactionIndex: 105,
            blockHash: "0x6677ab7dc2bab685131a05db009865faad06cbfb785c71813feaebed066e2f2d",
            logIndex: 161,
            removed: false,
          },
        ],
      });

      const resp = await relationshipClient.register({
        ipOrgId: "0xb422E54932c1dae83E78267A4DD2805aa64A8061",
        relType: "appears_in",
        relatedElements: {
          src: 1,
          dst: 1,
        },
        allowedSrcIpAssetTypes: [1],
        allowedDstIpAssetTypes: [1],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(resp.txHash).to.be.equal(
        "0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8",
      );
    });

    it("should throw error when registerRelationshipType reverts", async function () {
      rpcMock.simulateContract = sinon.stub().rejects(new Error("revert"));
      await expect(
        relationshipClient.register({
          ipOrgId: "0xb422E54932c1dae83E78267A4DD2805aa64A8061",
          relType: "appears_in",
          relatedElements: {
            src: 1,
            dst: 1,
          },
          allowedSrcIpAssetTypes: [1],
          allowedDstIpAssetTypes: [1],
          preHooksConfig: [],
          postHooksConfig: [],
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("revert");
    });

    it("should throw error when not found RelationshipTypeSet event", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x49477130a70a37e0d6e22b674ef9e923e6d0202c",
            topics: [
              "0x5afe4586ed79afd39271a5d07aaa8d60de58e6e9a48ebf10c8f1ce828b592e75",
              "0xfc7f0454ed02c478c10dae3ce113c900c4f9d3b10762ac2d41405fa8fc48713b",
              "0xb422E54932c1dae83E78267A4DD2805aa64A8061",
            ],
            data: "0x000000000000000000000000177175a4b26f6ea050676f8c9a14d395f896492c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000177175a4b26f6ea050676f8c9a14d395f896492c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
            blockNumber: 4727501,
            transactionHash: "0x99d5736c65bd81cd4a361a731d4a035375a0926c95e4132e8fcb80ad5b602b5c",
            transactionIndex: 105,
            blockHash: "0x6677ab7dc2bab685131a05db009865faad06cbfb785c71813feaebed066e2f2d",
            logIndex: 161,
            removed: false,
          },
        ],
      });

      await expect(
        relationshipClient.register({
          ipOrgId: "0xb422E54932c1dae83E78267A4DD2805aa64A8061",
          relType: "appears_in",
          relatedElements: {
            src: 1,
            dst: 1,
          },
          allowedSrcIpAssetTypes: [1],
          allowedDstIpAssetTypes: [1],
          preHooksConfig: [],
          postHooksConfig: [],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejectedWith(
        "Failed to register relationship type: not found event RelationshipTypeSet in target transaction",
      );
    });
  });
});
