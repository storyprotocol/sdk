import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { stub } from "sinon";
import { PublicClient, WalletClient } from "viem";

import { WipClient } from "../../../src/resources/wip";
import { txHash } from "../mockData";
import { createMockPublicClient, createMockWalletClient } from "../testUtils";

use(chaiAsPromised);

describe("WIP Functions", () => {
  let wipClient: WipClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  before(() => {
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    wipClient = new WipClient(rpcMock, walletMock);
  });

  describe("deposit", () => {
    before(() => {
      wipClient = new WipClient(rpcMock, walletMock);
    });

    it("should throw an error when call deposit give amount is less than 0", async () => {
      try {
        await wipClient.deposit({
          amount: 0,
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
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });

  describe("withdraw", () => {
    it("should throw an error when call withdraw given amount is less than 0", async () => {
      try {
        await wipClient.withdraw({
          amount: 0,
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to withdraw WIP: WIP withdraw amount must be greater than 0.",
        );
      }
    });

    it("should withdraw successfully when call withdraw given amount is 1", async () => {
      stub(wipClient.wrappedIpClient, "withdraw").resolves(txHash);
      const rsp = await wipClient.withdraw({
        amount: 1,
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
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to approve WIP: WIP approve amount must be greater than 0.",
        );
      }
    });

    it("should approve successfully when call approve given amount is 1", async () => {
      stub(wipClient.wrappedIpClient, "approve").resolves(txHash);
      const rsp = await wipClient.approve({
        amount: 1,
        spender: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
      });
      expect(rsp.txHash).to.be.a("string");
    });

    it("should approve successfully when call approve given amount is 1", async () => {
      stub(wipClient.wrappedIpClient, "approve").resolves(txHash);
      const rsp = await wipClient.approve({
        amount: 1,
        spender: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
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
      stub(wipClient.wrappedIpClient, "balanceOf").resolves({ result: 0n });
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
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to transfer WIP: WIP transfer amount must be greater than 0.",
        );
      }
    });

    it("should transfer successfully when call transfer given amount is 1", async () => {
      stub(wipClient.wrappedIpClient, "transfer").resolves(txHash);
      const rsp = await wipClient.transfer({
        amount: 1,
        to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
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
        });
      } catch (error) {
        expect((error as Error).message).equals(
          "Failed to transfer WIP: WIP transfer amount must be greater than 0.",
        );
      }
    });

    it("should transfer successfully when call transferFrom given amount is 1", async () => {
      stub(wipClient.wrappedIpClient, "transferFrom").resolves(txHash);
      const rsp = await wipClient.transferFrom({
        amount: 1,
        from: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
        to: "0x12fcbf7d94388da4D4a38bEF15B19289a00e6c91",
      });
      expect(rsp.txHash).to.be.a("string");
    });
  });
});
