import { expect } from "chai";
import { Hex } from "viem";
import { StoryClient } from "../../src";
import { getStoryClientInSepolia } from "./utils/util";
import { PIL_TYPE } from "../../src/types/resources/license";
import { MockERC20 } from "./utils/mockERC20";

describe("SPG Functions", async function () {
  let client: StoryClient;
  let nftContract: Hex = "0x1c615bD9059AbE9c36FAA322732fcbcD29689088";
  let mockERC20: MockERC20;
  this.beforeAll(function () {
    client = getStoryClientInSepolia();
    mockERC20 = new MockERC20();
  });

  it("should not throw error when create SPG NFT Collection", async function () {
    const response = await client.spg.createSPGNFTCollection({
      name: "test",
      symbol: "test",
      maxSupply: 100,
      mintCost: "1",
      mintToken: MockERC20.address,
      owner: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(response.txHash).to.be.a("string").and.not.empty;
    nftContract = response.nftContract!;
  });

  it("should not throw error when mint and register IP and attach PIL terms", async function () {
    await mockERC20.approve(nftContract);
    const response = await client.spg.mintAndRegisterIpAndAttachPilTerms({
      nftContract,
      pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
      metadata: {
        metadataURI: "test",
        metadata: "test",
        nftMetadata: "test",
      },
      recipient: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
      mintingFee: "1",
      currency: MockERC20.address,
      commercialRevShare: 10,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(response).to.be.a("string").and.not.empty;
  });
});
