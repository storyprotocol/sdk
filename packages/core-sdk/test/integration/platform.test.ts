import { expect } from "chai";
import { StoryClient, StoryConfig } from "../../src";
import { createFileReaderMock } from "../unit/testUtils";
import { Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

describe("Platform client integration tests", () => {
  let client: StoryClient;
  before(() => {
    global.FileReader = createFileReaderMock(
      "data:base64,dGVzdCBzdHJpbmcgYmxvYg==",
      new Event("onload") as unknown as ProgressEvent<FileReader>,
    ) as any;
  });

  beforeEach(function () {
    const config: StoryConfig = {
      chainId: "sepolia",
      transport: http(process.env.RPC_PROVIDER_URL),
      account: privateKeyToAccount((process.env.WALLET_PRIVATE_KEY || "0x") as Hex),
    };

    client = StoryClient.newClient(config);
  });

  it("should return arweave url when a buffer file is uploaded to arweave", async () => {
    const response = await client.platform.uploadFile(Buffer.from("test"), "image/png");
    expect(response).to.have.property("uri");
    expect(response.uri).to.be.a("string");
  });
});
