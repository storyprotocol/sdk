import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { parseEther } from "viem";
import { StoryClient } from "../../src";
import { getStoryClient, TEST_WALLET_ADDRESS } from "./utils/util";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("WIP Functions", () => {
  let client: StoryClient;

  before(async () => {
    client = getStoryClient();
  });

  describe("deposit", () => {
    const ipAmtStr = "0.01";
    const ipAmt = parseEther(ipAmtStr);

    it(`should deposit ${ipAmtStr} WIP`, async () => {
      const balanceBefore = await client.walletBalance();
      const wipBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const rsp = await client.wipClient.deposit({
        amount: ipAmt,
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
      const balanceAfter = await client.walletBalance();
      const wipAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipAfter).to.equal(wipBefore + ipAmt);
      const gasCost = rsp.receipt!.gasUsed * rsp.receipt!.effectiveGasPrice;
      expect(balanceAfter).to.equal(balanceBefore - ipAmt - gasCost);
    });
  });

  describe("withdraw", () => {
    it("should withdrawal WIP", async () => {
      const balanceBefore = await client.walletBalance();
      const wipBefore = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      const rsp = await client.wipClient.withdraw({
        amount: wipBefore,
        txOptions: { waitForTransaction: true },
      });
      expect(rsp.txHash).to.be.a("string");
      const wipAfter = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
      expect(wipAfter).to.equal(0n);
      const balanceAfter = await client.walletBalance();
      const gasCost = rsp.receipt!.gasUsed * rsp.receipt!.effectiveGasPrice;
      expect(balanceAfter).to.equal(balanceBefore + wipBefore - gasCost);
    });
  });
});
