import { expect } from "chai";
import { getDeadline, getPermissionSignature } from "../../../src/utils/sign";
import { Hex, WalletClient, createWalletClient, http, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { iliadChainId } from "../../integration/utils/util";
import sinon from "sinon";
import { chainStringToViemChain } from "../../../src/utils/utils";

describe("Sign", () => {
  describe("Get Permission Signature", () => {
    it("should throw sign error when call getPermissionSignature given wallet does not support signTypedData", async () => {
      try {
        await getPermissionSignature({
          ipId: zeroAddress,
          state: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e",
          deadline: 1000n,
          permissions: [],
          wallet: {} as WalletClient,
          chainId: BigInt(iliadChainId),
        });
      } catch (e) {
        expect((e as Error).message).to.equal(
          "The wallet client does not support signTypedData, please try again.",
        );
      }
    });

    it("should throw sign error when call getPermissionSignature given wallet does not have an account", async () => {
      try {
        await getPermissionSignature({
          ipId: zeroAddress,
          state: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e",
          deadline: 1000n,
          permissions: [],
          wallet: { signTypedData: () => Promise.resolve("") } as unknown as WalletClient,
          chainId: BigInt(iliadChainId),
        });
      } catch (e) {
        expect((e as Error).message).to.equal(
          "The wallet client does not have an account, please try again.",
        );
      }
    });

    it("should return signature when call getPermissionSignature given account support signTypedData", async () => {
      const walletClient = createWalletClient({
        chain: chainStringToViemChain("iliad"),
        transport: http(),
        account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
      });
      const result = await getPermissionSignature({
        ipId: zeroAddress,
        state: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e",
        deadline: 1000n,
        permissions: [{ ipId: zeroAddress, signer: zeroAddress, to: zeroAddress, permission: 0 }],
        wallet: walletClient,
        chainId: BigInt(iliadChainId),
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
