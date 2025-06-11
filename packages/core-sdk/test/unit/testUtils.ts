import { randomBytes } from "crypto";

import { stub } from "sinon";
import {
  Address,
  createPublicClient,
  createWalletClient,
  GetBlockReturnType,
  Hex,
  http,
  keccak256,
  PublicClient,
  SimulateContractReturnType,
  WaitForTransactionReceiptReturnType,
  WalletClient,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { mockAddress, privateKey, txHash } from "./mockData";
import { aeneid } from "../../src";

export const createMockPublicClient = (): PublicClient => {
  const publicClient = createPublicClient({
    chain: aeneid,
    transport: http(),
  });
  publicClient.waitForTransactionReceipt = stub().resolves({
    transactionHash: txHash,
  } as unknown as WaitForTransactionReceiptReturnType);
  publicClient.getBlock = stub().resolves({
    timestamp: 1629820800n,
  } as unknown as GetBlockReturnType);
  publicClient.readContract = stub().resolves(txHash);
  publicClient.simulateContract = stub().resolves({
    request: {},
  } as unknown as SimulateContractReturnType);
  publicClient.getBalance = stub().resolves(1000n);
  return publicClient;
};

export const createMockWalletClient = (): WalletClient => {
  const walletClient = createWalletClient({
    chain: aeneid,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });
  walletClient.writeContract = stub().resolves(txHash);
  walletClient.signTypedData = stub().resolves(
    "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
  );
  return walletClient;
};

export const generateRandomHash = (): Hex => keccak256(randomBytes(32));

export const generateRandomAddress = (): Address => {
  const account = privateKeyToAccount(generatePrivateKey());
  const address = account.address;
  return address;
};

/**
 * Create a mock object with a fixed address
 * @returns A mock object with the given address
 */
export const createMockWithAddress = <T extends { address: Address }>(): T => {
  const mockObj = {
    address: mockAddress,
  } as unknown as T;
  return mockObj;
};
