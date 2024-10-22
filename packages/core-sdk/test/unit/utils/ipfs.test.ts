import { expect } from "chai";
import { convertCIDtoHashIPFS, convertHashIPFStoCID } from "../../../src/utils/ipfs";
describe("IPFS", () => {
  it("should return hash when call convertCIDtoHashIPFS given CID with v0", async () => {
    const result = convertCIDtoHashIPFS("QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR");
    expect(result).to.equal("0xc3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a");
  });

  it("should return hash when call convertCIDtoHashIPFS given CID with v1", async () => {
    const result = convertCIDtoHashIPFS(
      "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
    );
    console.log(result);
    expect(result).to.equal("0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("should return CID when call convertHashIPFStoCID given hash with v0", async () => {
    const result = convertHashIPFStoCID(
      "0xc3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a",
      "v0",
    );
    expect(result).to.equal("QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR");
  });

  it("should return CID when call convertHashIPFStoCID given hash with v1", async () => {
    const result = convertHashIPFStoCID(
      "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "v1",
    );
    expect(result).to.equal("bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku");
  });
});
