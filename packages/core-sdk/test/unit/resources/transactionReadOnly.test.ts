import { AxiosInstance } from "axios";
import * as sinon from "sinon";
import { createMock } from "../testUtils";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient } from "viem";
import { ResourceType, TransactionClient, ActionType } from "../../../src";

chai.use(chaiAsPromised);

describe("Test TransactionClient", function () {
  let transactionClient: TransactionClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    transactionClient = new TransactionClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test transactionClient.get", function () {
    const transactionMock = {
      id: "1",
      txHash: "0x00a1a14e0193144e1d7024428ee242c44e5cacdbd7458c629d17c6366f6c5cb6",
      ipOrgId: "7",
      resourceId: "1",
      resourceType: ResourceType.IPAsset,
      actionType: ActionType.Create,
      initiator: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
      createdAt: "0001-01-01T00:00:00Z",
    };
    it("should get transaction ", async function () {
      axiosMock.get = sinon.stub().resolves({
        data: {
          transaction: transactionMock,
        },
      });

      const response = await transactionClient.get({ transactionId: "1" });
      expect(response.transaction).to.deep.equal(transactionMock);
    });

    it("should be able to throw an error", async function () {
      axiosMock.get = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(transactionClient.get({ transactionId: "abc" })).to.be.rejectedWith("HTTP 500");
    });
  });

  describe("Test transactionClient.list", function () {
    const transactionMock1 = {
      id: "1",
      txHash: "0x00a1a14e0193144e1d7024428ee242c44e5cacdbd7458c629d17c6366f6c5cb6",
      ipOrgId: "7",
      resourceId: "1",
      resourceType: ResourceType.IPAsset,
      actionType: ActionType.Configure,
      initiator: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
      createdAt: "0001-01-01T00:00:00Z",
    };
    const transactionMock2 = {
      id: "2",
      txHash: "0x00a1a14e0193144e1d7024428ee242c44e5cacdbd7458c629d17c6366f6c5cb6",
      ipOrgId: "7",
      resourceId: "2",
      resourceType: "License",
      actionType: ActionType.Register,
      initiator: "0xd84316a1b6f40902c17b8177854cdaeb3c957daf",
      createdAt: "0001-01-01T00:00:00Z",
    };
    it("should return list of collections", async function () {
      axiosMock.post = sinon.stub().resolves({
        data: {
          transactions: [transactionMock1, transactionMock2],
        },
      });

      const response = await transactionClient.list();
      const transactions = response.transactions;

      // First transaction in array
      expect(transactions[0]).to.be.deep.equal(transactionMock1);
      expect(transactions[1]).to.be.deep.equal(transactionMock2);
    });

    it("should be able to throw an error", async function () {
      axiosMock.post = sinon.stub().rejects(new Error("HTTP 500"));
      await expect(transactionClient.list()).to.be.rejectedWith("HTTP 500");
    });
  });
});
