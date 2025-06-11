import { expect } from "chai";
import { stub } from "sinon";
import * as viem from "viem";

import { aeneid, mainnet } from "../../../src";
import { licensingModuleAbi } from "../../../src/abi/generated";
import { SupportedChainIds } from "../../../src/types/config";
import {
  chainStringToViemChain,
  validateAddress,
  validateAddresses,
  waitTx,
  waitTxAndFilterLog,
} from "../../../src/utils/utils";
import { mockAddress } from "../mockData";
import { createMockPublicClient } from "../testUtils";

describe("Test waitTxAndFilterLog", () => {
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
  const rpcMock = createMockPublicClient();

  it("should throw waitForTransactionReceipt if waitForTransactionReceipt throws an error", async () => {
    rpcMock.waitForTransactionReceipt = stub().throws(new Error("waitForTransactionReceipt error"));
    const params = {
      abi: licensingModuleAbi as viem.Abi,
      eventName: "TransferSingle",
    };
    try {
      await waitTxAndFilterLog(rpcMock, txHash, params);
    } catch (err) {
      expect((err as Error).message).includes("waitForTransactionReceipt error");
    }
  });

  it("should throw not found event error if decodeEventLog throws an error", async () => {
    rpcMock.waitForTransactionReceipt = stub().resolves({
      logs: [
        {
          type: "event",
          data: "0x00000000000000000000",
          topics: ["0x11111111111111111111"],
          address: "0x0000000000000000000000000000000000000002",
        },
        {
          type: "event",
          data: "0x00000000000000000001",
          topics: ["0x222222222222222222222"],
          address: "0x0000000000000000000000000000000000000001",
        },
      ],
    });
    stub(viem, "decodeEventLog").throws(new Error("decodeEventLog error"));

    const params = {
      from: "0x0000000000000000000000000000000000000001" as `0x${string}`,
      abi: licensingModuleAbi as viem.Abi,
      eventName: "TransferSingle",
    };
    try {
      await waitTxAndFilterLog(rpcMock, txHash, params);
    } catch (err) {
      expect((err as Error).message).includes(
        "Not found event TransferSingle in target transaction",
      );
    }
  });

  it("should not throw error if param.from exists and addresses in logs are same with params.address", async () => {
    rpcMock.waitForTransactionReceipt = stub().resolves({
      logs: [
        {
          address: "0x176d33cc80ed3390256033bbf7fd651c9c5a364f",
          topics: [
            "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62",
            "0x0000000000000000000000009cddd88dd34429a0f39eadf91a56d1bf0533e72b",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000009a3a5edddfee1e3a1bbef6fdf0850b10d4979405",
          ],
          data: "0x00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001",
          blockNumber: 4738934n,
          transactionHash: "0x3600464c4f0794de350e55a484d67cdb6ed4a89917274709b9bb48246935c891",
          transactionIndex: 106,
          blockHash: "0x8d431865dbcfa54988f48b18c0a07fea503ca38c387b6326f513aa6f238faddc",
          logIndex: 52,
          removed: false,
        },
      ],
    });
    const params = {
      from: "0x176d33cc80ed3390256033bbf7fd651c9c5a364f" as `0x${string}`,
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "TransferSingle",
          type: "event",
        },
      ],
      eventName: "TransferSingle",
      confirmations: 2,
      pollingInterval: 10,
      timeout: 20,
    };
    let error: Error | undefined = undefined;
    try {
      await waitTxAndFilterLog(rpcMock, txHash, params);
    } catch (err) {
      error = err as Error;
    }
    expect(error).to.equal(undefined);
  });
});

describe("Test chainStringToViemChain", () => {
  it("should throw error if chainId is not supported", () => {
    try {
      chainStringToViemChain("invalid id" as SupportedChainIds);
    } catch (err) {
      expect((err as Error).message).includes("ChainId invalid id not supported");
    }
  });

  it("should return aeneid testnet if id is 1315", () => {
    const chain = chainStringToViemChain(1315);
    expect(chain).to.equal(aeneid);
  });
  it("should return aeneid testnet if id is iliad", () => {
    const chain = chainStringToViemChain("aeneid");
    expect(chain).to.equal(aeneid);
  });

  it("should return mainnet if id is 1514", () => {
    const chain = chainStringToViemChain(1514);
    expect(chain).to.equal(mainnet);
  });

  it("should return mainnet if id is mainnet", () => {
    const chain = chainStringToViemChain("mainnet");
    expect(chain).to.equal(mainnet);
  });
});

describe("Test waitTx", () => {
  it("should return txHash when call waitTx", async () => {
    const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
    const rpcMock = createMockPublicClient();
    const spyWaitForTransactionReceipt = stub();
    rpcMock.waitForTransactionReceipt = spyWaitForTransactionReceipt;

    await waitTx(rpcMock, txHash);

    expect(spyWaitForTransactionReceipt.called);
  });
});

describe("Test validateAddress", () => {
  it("should throw inValid address error when call validateAddress given invalid address", () => {
    try {
      validateAddress("0x");
    } catch (e) {
      expect((e as Error).message).to.equal("Invalid address: 0x.");
    }
  });
});

describe("Test validateAddresses", () => {
  it("should throw inValid address error when call validateAddresses given invalid address", () => {
    try {
      validateAddresses(["0x", mockAddress]);
    } catch (e) {
      expect((e as Error).message).to.equal("Invalid address: 0x.");
    }
  });
});
