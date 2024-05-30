import { expect } from "chai";
import sinon from "sinon";
import * as viem from "viem";
import { sepolia } from "viem/chains";
import { TypedData } from "../../../src/types/common";
import { SupportedChainIds } from "../../../src/types/config";
import {
  isIntegerString,
  decodeShortstring,
  splitIntoBytes32,
  waitTxAndFilterLog,
  dictToQueryParams,
  typedDataArrayToBytesArray,
  chainStringToViemChain,
  waitTx,
  getCustomAddress,
} from "../../../src/utils/utils";
import { createMock } from "../testUtils";
import { licensingModuleAbi } from "../../../src/abi/generated";

describe("Test isIntegerString", () => {
  it("should return true when passing in an integer string", () => {
    expect(isIntegerString("7")).to.be.true;
  });

  it("should return false when passing in a non-integer string", () => {
    expect(isIntegerString("a")).to.be.false;
  });
});

describe("Test decodeShortstring", () => {
  it("should decode a short string", () => {
    const encodedString = "0x4368616e6e656c732d4f662d446973747269627574696f6e0000000000000018"; // "Hello World" in hex
    const decodedString = decodeShortstring(encodedString);
    expect(decodedString).to.equal("Channels-Of-Distribution");
  });

  it("should return an empty string for an empty input", () => {
    const encodedString = "0x";
    const decodedString = decodeShortstring(encodedString);
    expect(decodedString).to.equal("");
  });
});

describe("splitIntoBytes32", () => {
  it("splits a valid hex string into bytes32 chunks", () => {
    const hexString = "a".repeat(64);
    const result = splitIntoBytes32(hexString);
    expect(result).to.deep.equal(["0x" + "a".repeat(64)]);
  });

  it("handles hex strings with 0x prefix correctly", () => {
    const hexString = "0x" + "b".repeat(64);
    const result = splitIntoBytes32(hexString);
    expect(result).to.deep.equal(["0x" + "b".repeat(64)]);
  });

  it("throws an error if hex string length is not a multiple of 64", () => {
    const hexString = "c".repeat(63);
    expect(() => splitIntoBytes32(hexString)).to.throw(
      "Hex string length must be a multiple of 64.",
    );
  });

  it("handles empty hex string", () => {
    const hexString = "";
    const result = splitIntoBytes32(hexString);
    expect(result).to.deep.equal([]);
  });
});

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

describe("Test dictToQueryParams", () => {
  it("should return expected query string", () => {
    const query = {
      package: "sdk",
      test: "dictToQueryParams",
    };
    const queryStr = dictToQueryParams(query);
    expect(queryStr).to.equal("package=sdk&test=dictToQueryParams");
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

  describe("Test typedDataArrayToBytesArray", () => {
    it("should return expected bytes array", () => {
      const data = [
        [
          [viem.zeroAddress],
          [20, 2, 4],
          [viem.zeroAddress],
          [viem.zeroAddress],
          [1, 2, 3],
          [1, 2, 3],
        ],
      ];
      const typedDataArray: Array<TypedData> = [
        {
          interface: "(address[], uint32[], address[], address[], uint32[], uint32[])",
          data,
        },
      ];
      const result = typedDataArrayToBytesArray(typedDataArray);
      const decodedResult = viem.decodeAbiParameters(
        viem.parseAbiParameters("(address[], uint32[], address[], address[], uint32[], uint32[])"),
        result[0],
      );
      expect(result.length).to.equal(1);
      expect(result[0].startsWith("0x")).to.equal(true);
      expect(decodedResult.length).to.equal(1);
      expect(decodedResult[0].length).to.equal(6);
      expect(decodedResult[0][0]).includes.all.members(data[0][0]);
      expect(decodedResult[0][1]).includes.all.members(data[0][1]);
      expect(decodedResult[0][2]).includes.all.members(data[0][2]);
      expect(decodedResult[0][3]).includes.all.members(data[0][3]);
      expect(decodedResult[0][4]).includes.all.members(data[0][4]);
      expect(decodedResult[0][5]).includes.all.members(data[0][5]);
    });
  });

  it("should return sepolia if id is 11155111", () => {
    const chain = chainStringToViemChain("11155111");
    expect(chain).to.equal(sepolia);
  });
  it("should return sepolia if id is sepolia", () => {
    const chain = chainStringToViemChain("sepolia");
    expect(chain).to.equal(sepolia);
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

describe("Test getCustomAddress", () => {
  it("should throw inValid address error when call getCustomAddress given invalid address", () => {
    try {
      getCustomAddress("invalid address", "address");
    } catch (e) {
      expect((e as Error).message).to.equal(
        "address address is invalid: invalid address, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
      );
    }
  });

  it("should return address when call getCustomAddress given valid address", () => {
    const address = getCustomAddress("0x176d33cc80ed3390256033bbf7fd651c9c5a364f", "address");
    expect(address).to.equal("0x176d33Cc80ed3390256033bbf7Fd651c9C5A364F");
  });
});
