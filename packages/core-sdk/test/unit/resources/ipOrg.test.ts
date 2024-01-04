import chai, { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient, Account } from "viem";
import { IPOrgClient } from "../../../src";

chai.use(chaiAsPromised);
chai.config.truncateThreshold = 0;

describe(`Test IPOrgClient`, function () {
  let ipOrgClient: IPOrgClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    ipOrgClient = new IPOrgClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test ipOrgClient.create", async function () {
    const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
    it("should not throw error when creating a ip Org", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipOrgClient.create({
        name: "Star Wars",
        symbol: "STAR",
        owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        ipAssetTypes: ["Story", "Character"],
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(res.txHash).to.be.equal(txHash);
    });

    it("should not throw error when creating a ip Org with ZeroAddress", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);

      const res = await ipOrgClient.create({
        name: "Star Wars",
        symbol: "STAR",
        ipAssetTypes: ["Story", "Character"],
        txOptions: {
          waitForTransaction: false,
        },
      });
      expect(res.txHash).to.be.equal(txHash);
    });

    it("should not throw error when creating a ip Org and wait for transaction confirmed", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            topics: ["0x81e084d978860accc83df39f75b801d9019e40d18643b9b39f4cd2a70ca35adb"],
            data: "0x000000000000000000000000f398c12a45bc409b6c652e25bb0a3e702492a4ab0000000000000000000000000dad65978b6c637598674ea03b1c6f3333d00f5b00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000095374617220576172730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000453544152000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000",
            blockNumber: 4739106n,
            transactionHash: "0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8",
            transactionIndex: 105,
            blockHash: "0x6677ab7dc2bab685131a05db009865faad06cbfb785c71813feaebed066e2f2d",
            logIndex: 161,
            removed: false,
          },
        ],
      });
      const resp = await ipOrgClient.create({
        name: "Star Wars",
        symbol: "STAR",
        owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
        ipAssetTypes: ["Story", "Character"],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(resp.txHash).to.be.equal(txHash);
      expect(resp.ipOrgId).to.be.equal("0x0Dad65978B6C637598674ea03B1C6f3333D00f5B");
    });

    it("should throw error when registerIPOrg reverts", async function () {
      rpcMock.simulateContract = sinon.stub().rejects(new Error("revert"));
      await expect(
        ipOrgClient.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: false,
          },
        }),
      ).to.be.rejectedWith("revert");
    });

    it("should throw error when not found IPOrgRegistered event", async function () {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: [
          {
            address: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            topics: ["0x558b44f88e5959cec9c7836078a53ff4d6432142a9d5caa6f3a6eb7c83938981"],
            data: "0x000000000000000000000000794421212db0f3eac69124e4bad728ab74e1575ea0000000000000000000000003d114640e01c09b570ff7fddb66f194f7f1da6ef000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000009537461722057617273000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045354415200000000000000000000000000000000000000000000000000000000",
            blockNumber: 4739106n,
            transactionHash: "0x6bf8053b1e8ffdc8a767938b14a59eb1e08cf8821743be7f8377e5bad77f76a8",
            transactionIndex: 105,
            blockHash: "0x6677ab7dc2bab685131a05db009865faad06cbfb785c71813feaebed066e2f2d",
            logIndex: 161,
            removed: false,
          },
        ],
      });
      await expect(
        ipOrgClient.create({
          name: "Star Wars",
          symbol: "STAR",
          owner: "0x4f9693ac46f2c7e2f48dd14d8fe1ab44192cd57d",
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejectedWith(
        `Failed to create IPOrg: not found event IPOrgRegistered in target transaction`,
      );
    });
  });
});
