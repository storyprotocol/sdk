import { randomBytes } from "crypto";
import sinon from "sinon";
import { Address, Hex, keccak256 } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export function createMock<T>(obj = {}): T {
  const mockObj: any = obj;
  mockObj.waitForTransactionReceipt = sinon.stub().resolves({});
  mockObj.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
  mockObj.multicall = sinon.stub().returns([{ error: "", status: "success" }]);
  mockObj.getBlock = sinon.stub().resolves({ timestamp: 1629820800n });
  return mockObj;
}

export function generateRandomHash(): Hex {
  return keccak256(randomBytes(32));
}

export function generateRandomAddress(): Address {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const address = account.address;
  return address;
}

export const txHash = "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb";
