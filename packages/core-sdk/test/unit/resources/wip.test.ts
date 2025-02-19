import { PublicClient, WalletClient } from "viem";
import { WipClient } from "../../../src/resources/wip";
import chaiAsPromised from "chai-as-promised";
import chai from "chai";
import * as sinon from "sinon";
import { createMock } from "../testUtils";
chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

describe("WIP Functions", () => {
  let wipClient: WipClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  before(async () => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    wipClient = new WipClient(rpcMock, walletMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("deposit", () => {
    before(() => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      wipClient = new WipClient(rpcMock, walletMock);
    });
    after(() => {
      sinon.restore();
    });

    it("should throw an error when call deposit give amount is less than 0", async () => {
      try {
        await wipClient.deposit({
          amount: 0,
          txOptions: { waitForTransaction: true },
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to deposit IP for WIP: WIP deposit amount must be greater than 0.",
        );
      }
    });
    it("should deposit successfully when call deposit given amount is 1 ", async () => {
      const rsp = await wipClient.deposit({
        amount: 1,
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });

    it("should deposit successfully when call deposit given amount is 1 and waitForTransaction is true", async () => {
      const rsp = await wipClient.deposit({
        amount: 1,
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });

  describe("withdraw", () => {
    it("should throw an error when call withdraw given amount is less than 0", async () => {
      try {
        await wipClient.withdraw({
          amount: 0,
          txOptions: { waitForTransaction: true },
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to withdraw WIP: WIP withdraw amount must be greater than 0.",
        );
      }
    });

    it("should withdraw successfully when call withdraw given amount is 1", async () => {
      sinon.stub(wipClient.wrappedIpClient, "withdraw").resolves(txHash);
      const rsp = await wipClient.withdraw({
        amount: 1,
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });

    it("should withdraw successfully when call withdraw given amount is 1 and waitForTransaction is true", async () => {
      sinon.stub(wipClient.wrappedIpClient, "withdraw").resolves(txHash);
      const rsp = await wipClient.withdraw({
        amount: 1,
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });

  describe("approve", () => {
    it("should throw an error when call approve given amount is 0", async () => {
      try {
        await wipClient.approve({
          amount: 0,
          spender: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
          txOptions: { waitForTransaction: true },
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to approve WIP: WIP approve amount must be greater than 0.",
        );
      }
    });

    it("should approve successfully when call approve given amount is 1", async () => {
      sinon.stub(wipClient.wrappedIpClient, "approve").resolves(txHash);
      const rsp = await wipClient.approve({
        amount: 1,
        spender: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });

    it("should approve successfully when call approve given amount is 1 and waitForTransaction is true", async () => {
      sinon.stub(wipClient.wrappedIpClient, "approve").resolves(txHash);
      const rsp = await wipClient.approve({
        amount: 1,
        spender: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });

  describe("getBalance", () => {
    it("should throw an error when call getBalance given address is invalid", async () => {
      try {
        await wipClient.balanceOf("0x");
      } catch (error) {
        expect((error as Error).message).equals("Invalid address: 0x.");
      }
    });

    it("should get balance successfully when call getBalance given address is valid", async () => {
      sinon.stub(wipClient.wrappedIpClient, "balanceOf").resolves({ result: 0n });
      const rsp = await wipClient.balanceOf("0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91");
      expect(rsp).to.be.a("bigint");
    });
  });

  describe("transfer", () => {
    it("should throw an error when call transfer given amount is 0", async () => {
      try {
        await wipClient.transfer({
          amount: 0,
          to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
          txOptions: { waitForTransaction: true },
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to transfer WIP: WIP transfer amount must be greater than 0.",
        );
      }
    });

    it("should transfer successfully when call transfer given amount is 1", async () => {
      sinon.stub(wipClient.wrappedIpClient, "transfer").resolves(txHash);
      const rsp = await wipClient.transfer({
        amount: 1,
        to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        txOptions: { waitForTransaction: true },
      });

      expect(rsp.txHash).to.be.a("string");
    });

    it("should transfer successfully when call transfer given amount is 1 and waitForTransaction is true", async () => {
      sinon.stub(wipClient.wrappedIpClient, "transfer").resolves(txHash);
      const rsp = await wipClient.transfer({
        amount: 1,
        to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });

  describe("transferFrom", () => {
    it("should throw an error when call transferFrom given amount is 0", async () => {
      try {
        await wipClient.transferFrom({
          amount: 0,
          from: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
          to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
          txOptions: { waitForTransaction: true },
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to transfer WIP: WIP transfer amount must be greater than 0.",
        );
      }
    });

    it("should transfer successfully when call transferFrom given amount is 1", async () => {
      sinon.stub(wipClient.wrappedIpClient, "transferFrom").resolves(txHash);
      const rsp = await wipClient.transferFrom({
        amount: 1,
        from: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });

    it("should transfer successfully when call transferFrom given amount is 1 and waitForTransaction is true", async () => {
      sinon.stub(wipClient.wrappedIpClient, "transferFrom").resolves(txHash);
      const rsp = await wipClient.transferFrom({
        amount: 1,
        from: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });
});
