import { expect } from "chai";
import sinon from "sinon";
import * as viem from "viem";
import { SupportedChainIds } from "../../../src/types/config";
import {
  waitTxAndFilterLog,
  chainStringToViemChain,
  waitTx,
  getAddress,
} from "../../../src/utils/utils";
import { createMock } from "../testUtils";
import { licensingModuleAbi } from "../../../src/abi/generated";
import { odyssey } from "../../../src";

describe("Test waitTxAndFilterLog", () => {
  const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
  let rpcMock: viem.PublicClient = createMock<viem.PublicClient>();
  afterEach(() => {
    sinon.restore();
  });
  it("should throw waitForTransactionReceipt if waitForTransactionReceipt throws an error", async () => {
    rpcMock.waitForTransactionReceipt = sinon
      .stub()
      .throws(new Error("waitForTransactionReceipt error"));
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
    rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
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
    sinon.stub(viem, "decodeEventLog").throws(new Error("decodeEventLog error"));

    const params = {
      from: "0x0000000000000000000000000000000000000001" as `0x${string}`,
      abi: licensingModuleAbi as viem.Abi,
      eventName: "TransferSingle",
    };
    try {
      await waitTxAndFilterLog(rpcMock, txHash, params);
    } catch (err) {
      expect((err as Error).message).includes(
        "not found event TransferSingle in target transaction",
      );
    }
  });

  it("should not throw error if param.from exists and addresses in logs are same with params.address", async () => {
    rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
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
      expect((err as Error).message).includes("chainId invalid id not supported");
    }
  });

  it("should return iliad testnet if id is 1516", () => {
    const chain = chainStringToViemChain("1516");
    expect(chain).to.equal(odyssey);
  });
  it("should return iliad testnet if id is iliad", () => {
    const chain = chainStringToViemChain("odyssey");
    expect(chain).to.equal(odyssey);
  });
});

describe("Test waitTx", () => {
  it("should return txHash when call waitTx", async () => {
    const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
    let rpcMock: viem.PublicClient = createMock<viem.PublicClient>();
    const spyWaitForTransactionReceipt = sinon.spy();
    rpcMock.waitForTransactionReceipt = spyWaitForTransactionReceipt;

    await waitTx(rpcMock, txHash);

    expect(spyWaitForTransactionReceipt.called);
  });
});

describe("Test getAddress", () => {
  it("should throw inValid address error when call getAddress given invalid address", () => {
    try {
      getAddress("invalid address", "address");
    } catch (e) {
      expect((e as Error).message).to.equal(
        "address address is invalid: invalid address, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
      );
    }
  });

  it("should return address when call getAddress given valid address", () => {
    const address = getAddress("0x176d33cc80ed3390256033bbf7fd651c9c5a364f", "address");
    expect(address).to.equal("0x176d33Cc80ed3390256033bbf7Fd651c9C5A364F");
  });
});
