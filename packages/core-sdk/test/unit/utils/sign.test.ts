import { expect } from "chai";
import { getDeadline, getPermissionSignature } from "../../../src/utils/sign";
import { Hex, LocalAccount, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepoliaChainId } from "../../integration/utils/util";
import sinon from "sinon";

describe("Sign", () => {
  describe("Get Permission Signature", () => {
    it("should throw sign error when call getPermissionSignature given account does not support signTypedData", async () => {
      try {
        await getPermissionSignature({
          ipId: zeroAddress,
          nonce: 1,
          deadline: 1000n,
          data: "0x",
          account: {} as LocalAccount,
          chainId: BigInt(sepoliaChainId),
        });
      } catch (e) {
        expect((e as Error).message).to.equal(
          "The account does not support signTypedData, Please use a local account.",
        );
      }
    });

    it("should return signature when call getPermissionSignature given account support signTypedData", async () => {
      const account = privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex);
      const result = await getPermissionSignature({
        ipId: zeroAddress,
        nonce: 1,
        deadline: 1000n,
        data: "0x",
        account,
        chainId: BigInt(sepoliaChainId),
      });
      expect(result).is.a("string").and.not.empty;
    });
  });
  describe("Get Deadline", () => {
    before(() => {
      sinon.stub(Date, "now").returns(1000);
    });
    it("should throw invalid deadline value when call getDeadline given deadline is not number", () => {
      try {
        getDeadline("invalid");
      } catch (e) {
        expect((e as Error).message).to.equal("Invalid deadline value.");
      }
    });

    it("should throw invalid deadline value when call getDeadline given deadline is less than 0", () => {
      try {
        getDeadline(-1);
      } catch (e) {
        expect((e as Error).message).to.equal("Invalid deadline value.");
      }
    });

    it("should return 2000 when call getDeadline", () => {
      const result = getDeadline();
      expect(result).to.equal(2000n);
    });

    it("should return timestamp plus deadline when call getDeadline given deadline", () => {
      const result = getDeadline(2000);
      expect(result).to.equal(3000n);
    });
  });
});
