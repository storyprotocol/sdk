import { randomBytes } from "crypto";
import sinon from "sinon";
import { Address, Hex, keccak256 } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { walletAddress } from "./mockData";

export function createMock<T>(obj = {}): T {
  const mockObj: any = obj;
  mockObj.waitForTransactionReceipt = sinon.stub().resolves({});
  mockObj.address = walletAddress;
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
