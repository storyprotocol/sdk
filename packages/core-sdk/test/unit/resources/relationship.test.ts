import chai, { expect } from "chai";
import { RelationshipClient } from "../../../src";
import { createMock } from "../testUtils";
import * as sinon from "sinon";

import chaiAsPromised from "chai-as-promised";
import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, stringToHex } from "viem";

chai.use(chaiAsPromised);

describe("Test RelationshipClient", function () {
  let relationshipClient: RelationshipClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    relationshipClient = new RelationshipClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test RelationshipClient.register", async () => {
    it("should not throw error when registering a relationship", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const resp = await relationshipClient.register({
        ipOrgId: process.env.TEST_IPORG_ID as string,
        relType: "appears_in",
        srcContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
        srcTokenId: "4",
        dstContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
        dstTokenId: "5",
        preHookData: [
          {
            interface: "address",
            data: ["0xf398C12A45Bc409b6C652E25bb0a3e702492A4ab"],
          },
        ],
        postHookData: [
          {
            interface: "address",
            data: ["0xf398C12A45Bc409b6C652E25bb0a3e702492A4ab"],
          },
        ],
        txOptions: {
          waitForTransaction: false,
        },
      });

      expect(resp.txHash).to.be.equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
    });

    it("should not throw error when registering a relationship and wait for transaction confirmed", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x49477130a70a37e0d6e22b674ef9e923e6d0202c",
            topics: [
              "0xc1ab5d0231434d664068cd9e5f80a04152484f1844e564dd9fee5c687caa0d7c",
              "0x0000000000000000000000000000000000000000000000000000000000000001",
            ],
            data: "0x00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000ad2377c8f9f0ca6382fef166b08aede8318fe49c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ad2377c8f9f0ca6382fef166b08aede8318fe49c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a617070656172735f696e00000000000000000000000000000000000000000000",
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
        ipOrgId: process.env.TEST_IPORG_ID as string,
        relType: "appears_in",
        srcContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
        srcTokenId: "4",
        dstContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
        dstTokenId: "5",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(resp.txHash).to.be.equal(
        "0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8",
      );
    });

    it("should throw error when registerRelationship reverts", async function () {
      rpcMock.simulateContract = sinon.stub().rejects(new Error("revert"));
      await expect(
        relationshipClient.register({
          ipOrgId: process.env.TEST_IPORG_ID as string,
          relType: "appears_in",
          srcContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
          srcTokenId: "4",
          dstContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
          dstTokenId: "5",
          preHookData: [],
          postHookData: [],
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("revert");
    });

    it("should throw error when not found RelationshipCreated event", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("revert"));

      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x49477130a70a37e0d6e22b674ef9e923e6d0202c",
            topics: [
              "0xc1ab5d0231434d664068cd9e5f80a04152484f1844e564dd9fee5c687caa0d7c",
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              "0xfc7f0454ed02c478c10dae3ce113c900c4f9d3b10762ac2d41405fa8fc48713b",
            ],
            data: "0x000000000000000000000000177175a4b26f6ea050676f8c9a14d395f896492c0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000177175a4b26f6ea050676f8c9a14d395f896492c0000000000000000000000000000000000000000000000000000000000000005",
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
          ipOrgId: process.env.TEST_IPORG_ID as string,
          relType: "appears_in",
          srcContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
          srcTokenId: "4",
          dstContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
          dstTokenId: "5",
          preHookData: [],
          postHookData: [],
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("Failed to register relationship: revert");
    });
  });
});
