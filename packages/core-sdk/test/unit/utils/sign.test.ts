import { expect } from "chai";
import { getDeadline, getPermissionSignature } from "../../../src/utils/sign";
import { Hex, WalletClient, createWalletClient, http, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { storyTestChainId } from "../../integration/utils/util";
import sinon from "sinon";
import { chainStringToViemChain } from "../../../src/utils/utils";

describe("Sign", () => {
  describe("Get Permission Signature", () => {
    it("should throw sign error when call getPermissionSignature given wallet does not support signTypedData", async () => {
      try {
        await getPermissionSignature({
          ipId: zeroAddress,
          nonce: 1,
          deadline: 1000n,
          permissions: [],
          wallet: {} as WalletClient,
          chainId: BigInt(storyTestChainId),
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
          nonce: 1,
          deadline: 1000n,
          permissions: [],
          wallet: { signTypedData: () => Promise.resolve("") } as unknown as WalletClient,
          chainId: BigInt(storyTestChainId),
        });
      } catch (e) {
        expect((e as Error).message).to.equal(
          "The wallet client does not have an account, please try again.",
        );
      }
    });

    it("should return signature when call getPermissionSignature given account support signTypedData", async () => {
      const walletClient = createWalletClient({
        chain: chainStringToViemChain("storyTestnet"),
        transport: http(),
        account: privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex),
      });
      const result = await getPermissionSignature({
        ipId: zeroAddress,
        nonce: 1,
        deadline: 1000n,
        permissions: [{ ipId: zeroAddress, signer: zeroAddress, to: zeroAddress, permission: 0 }],
        wallet: walletClient,
        chainId: BigInt(storyTestChainId),
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
