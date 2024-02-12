import { expect } from "chai";
import {
  decodeShortstring,
  isIntegerString,
  parseToBigInt,
  splitIntoBytes32,
} from "../../../src/utils/utils";

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
