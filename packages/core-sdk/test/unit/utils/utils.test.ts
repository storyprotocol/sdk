import { expect } from "chai";
import sinon from "sinon";
import * as viem from "viem";
import { mainnet, polygonMumbai, sepolia } from "viem/chains";
import { TypedData } from "../../../src/types/common";
import { SupportedChainIds } from "../../../src/types/config";
import {
  isIntegerString,
  parseToBigInt,
  decodeShortstring,
  splitIntoBytes32,
  waitTxAndFilterLog,
  dictToQueryParams,
  typedDataArrayToBytesArray,
  chainStringToViemChain,
} from "../../../src/utils/utils";
import { createMock } from "../testUtils";
import defaultAbi from "../../../src/abi/json/LicensingModule.abi";

describe("Test isIntegerString", function () {
  it("should return true when passing in an integer string", function () {
    expect(isIntegerString("7")).to.be.true;
  });

  it("should return false when passing in a non-integer string", function () {
    expect(isIntegerString("a")).to.be.false;
  });

  it("should parse string to big int", function () {
    expect(parseToBigInt("7")).to.be.equal(7n);
  });
});

describe("Test decodeShortstring", function () {
  it("should decode a short string", function () {
    const encodedString = "0x4368616e6e656c732d4f662d446973747269627574696f6e0000000000000018"; // "Hello World" in hex
    const decodedString = decodeShortstring(encodedString);
    expect(decodedString).to.equal("Channels-Of-Distribution");
  });

  it("should return an empty string for an empty input", function () {
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
  const rpcMock = createMock<viem.PublicClient>();
  afterEach(() => {
    sinon.restore();
  });

  it("should throw waitForTransactionReceipt if waitForTransactionReceipt throws an error", async () => {
    rpcMock.waitForTransactionReceipt = sinon
      .stub()
      .throws(new Error("waitForTransactionReceipt error"));
    const params = {
      abi: defaultAbi as viem.Abi,
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
          data: "0x00000000000000000000",
          topics: ["0x11111111111111111111"],
        },
      ],
    });
    sinon.stub(viem, "decodeEventLog").throws(new Error("decodeEventLog error"));

    const params = {
      abi: defaultAbi as viem.Abi,
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

  it("should return mainnet if id is 1", () => {
    const chain = chainStringToViemChain("1" as SupportedChainIds);
    expect(chain).to.equal(mainnet);
  });
  it("should return mainnet if id is mainnet", () => {
    const chain = chainStringToViemChain("mainnet" as SupportedChainIds);
    expect(chain).to.equal(mainnet);
  });
  it("should return sepolia if id is 11155111", () => {
    const chain = chainStringToViemChain("11155111" as SupportedChainIds);
    expect(chain).to.equal(sepolia);
  });
  it("should return sepolia if id is sepolia", () => {
    const chain = chainStringToViemChain("sepolia" as SupportedChainIds);
    expect(chain).to.equal(sepolia);
  });
  it("should return polygonMumbai if id is 80001", () => {
    const chain = chainStringToViemChain("80001" as SupportedChainIds);
    expect(chain).to.equal(polygonMumbai);
  });
  it("should return polygonMumbai if id is mumbai", () => {
    const chain = chainStringToViemChain("mumbai" as SupportedChainIds);
    expect(chain).to.equal(polygonMumbai);
  });
  it("should return polygonMumbai if id is polygonMumbai", () => {
    const chain = chainStringToViemChain("polygonMumbai" as SupportedChainIds);
    expect(chain).to.equal(polygonMumbai);
  });
});
