import { expect } from "chai";
import {
  decodeChannelsOfDistribution,
  decodeDerivativesAllowedOptions,
  decodeShortstring,
  isIntegerString,
  paramsTagValueDecoder,
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

describe("Test decodeChannelsOfDistribution", function () {
  it("should decode a hex value to an array of strings", function () {
    const hexValue = "0x6368616e6e656c31000000000000000000000000000000000000000000000000"; // "channel1" in hex
    const decodedArray = decodeChannelsOfDistribution(hexValue);
    expect(decodedArray).to.deep.equal(["channel1"]);
  });

  it("should decode multiple hex values to an array of strings", function () {
    const hexValue =
      "0x6368616e6e656c310000000000000000000000000000000000000000000000006368616e6e656c32000000000000000000000000000000000000000000000000"; // "channel1" and "channel2" in hex
    const decodedArray = decodeChannelsOfDistribution(hexValue);
    expect(decodedArray).to.deep.equal(["channel1", "channel2"]);
  });

  it("should return an empty array for an empty input", function () {
    const hexValue = "0x";
    const decodedArray = decodeChannelsOfDistribution(hexValue);
    expect(decodedArray).to.deep.equal([]);
  });
});

describe("decodeDerivativesAllowedOptions", () => {
  const options = ["Option1", "Option2", "Option3"];

  it("correctly decodes options based on a bitmask", () => {
    const bitmask: number[] = [1, 0, 1];
    expect(decodeDerivativesAllowedOptions(bitmask, options)).to.deep.equal(["Option1", "Option3"]);
  });

  it("returns no options for a bitmask of all zeros", () => {
    const bitmask: number[] = [0, 0, 0];
    expect(decodeDerivativesAllowedOptions(bitmask, options)).to.deep.equal([]);
  });

  it("returns all options for a bitmask of all ones", () => {
    const bitmask: number[] = [1, 1, 1];
    expect(decodeDerivativesAllowedOptions(bitmask, options)).to.deep.equal(options);
  });

  it("returns no options for an empty bitmask", () => {
    const bitmask: number[] = [];
    expect(decodeDerivativesAllowedOptions(bitmask, options)).to.deep.equal([]);
  });

  it("returns an empty array for an empty options array", () => {
    const bitmask: number[] = [1, 0, 1];
    expect(decodeDerivativesAllowedOptions(bitmask, [])).to.deep.equal([]);
  });

  it("handles bitmask longer than options array", () => {
    const bitmask: number[] = [1, 0, 1, 1];
    expect(decodeDerivativesAllowedOptions(bitmask, options)).to.deep.equal(["Option1", "Option3"]);
  });

  it("handles options array longer than bitmask", () => {
    const bitmask: number[] = [1, 0];
    expect(decodeDerivativesAllowedOptions(bitmask, options)).to.deep.equal(["Option1"]);
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

describe("Test paramsTagValueDecoder", function () {
  it("should decode tag and value for case 1", function () {
    const tag = "0x4368616e6e656c732d4f662d446973747269627574696f6e0000000000000018";
    const value =
      "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000274657374310000000000000000000000000000000000000000000000000000057465737432000000000000000000000000000000000000000000000000000005";
    const result = paramsTagValueDecoder(tag, value);
    expect(result).to.deep.equal({
      tag: "Channels-Of-Distribution",
      type: "string[]",
      value: ["", "", "test1", "test2"],
    });
  });

  it("should decode tag and value for case 2", function () {
    const tag = "0x4174747269627574696f6e00000000000000000000000000000000000000000b";
    const value = "0x";
    const result = paramsTagValueDecoder(tag, value);
    expect(result).to.deep.equal({
      tag: "Attribution",
      value: false,
      type: "boolean",
    });
  });

  it("should decode tag and value for case 3", function () {
    const tag = "0x44657269766174697665732d416c6c6f77656400000000000000000000000013";
    const value = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const result = paramsTagValueDecoder(tag, value);
    expect(result).to.deep.equal({
      tag: "Derivatives-Allowed",
      value: true,
      type: "boolean",
    });
  });

  it("should decode tag and value for case 4", function () {
    const tag = "0x44657269766174697665732d416c6c6f7765642d4f7074696f6e73000000001b";
    const value = "0x0000000000000000000000000000000000000000000000000000000000000003";
    const result = paramsTagValueDecoder(tag, value);
    expect(result).to.deep.equal({
      tag: "Derivatives-Allowed-Options",
      value: ["Allowed-Reciprocal-License", "Allowed-With-Attribution"],
      type: "string[]",
    });
  });
});
