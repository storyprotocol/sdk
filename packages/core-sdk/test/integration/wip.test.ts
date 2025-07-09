import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { parseEther } from "viem";

import { StoryClient } from "../../src";
import { getStoryClient, TEST_WALLET_ADDRESS } from "./utils/util";

use(chaiAsPromised);

describe("WIP Functions", () => {
  let client: StoryClient;

  before(() => {
    client = getStoryClient();
  });

  describe("deposit", () => {
    it(`should deposit 0.01 WIP`, async () => {
      const ipAmt = parseEther("0.01");
      const balanceBefore = await client.getWalletBalance();
      const wipBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const rsp = await client.wipClient.deposit({
        amount: ipAmt,
      });
      expect(rsp.txHash).to.be.a("string");
      const balanceAfter = await client.getWalletBalance();
      const wipAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipAfter).to.equal(wipBefore + ipAmt);
      const gasCost = rsp.receipt.gasUsed * rsp.receipt.effectiveGasPrice;
      expect(balanceAfter).to.equal(balanceBefore - ipAmt - gasCost);
    });
  });
  describe("transfer", () => {
    it("should transfer WIP", async () => {
      const rsp = await client.wipClient.transfer({
        to: TEST_WALLET_ADDRESS,
        amount: parseEther("0.01"),
      });
      expect(rsp.txHash).to.be.a("string");
      //Due to approve cannot approve msy.sender, so skip transferFrom test
    });
  });

  describe("withdraw", () => {
    it("should withdrawal WIP", async () => {
      const balanceBefore = await client.getWalletBalance();
      const wipBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const rsp = await client.wipClient.withdraw({
        amount: wipBefore,
      });
      expect(rsp.txHash).to.be.a("string");
      const wipAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipAfter).to.equal(0n);
      const balanceAfter = await client.getWalletBalance();
      const gasCost = rsp.receipt.gasUsed * rsp.receipt.effectiveGasPrice;
      expect(balanceAfter).to.equal(balanceBefore + wipBefore - gasCost);
    });
  });
});
