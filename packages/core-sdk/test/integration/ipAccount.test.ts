import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { AccessPermission, StoryClient } from "../../src";
import { mockERC721, getStoryClient, getTokenId, odyssey } from "./utils/util";
import { Hex, encodeFunctionData, getAddress, toFunctionSelector } from "viem";
import {
  accessControllerAbi,
  accessControllerAddress,
  coreMetadataModuleAddress,
} from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;
describe("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;
  const coreMetadataModule = coreMetadataModuleAddress[odyssey];
  const permissionAddress = accessControllerAddress[odyssey];

  before(async () => {
    client = getStoryClient();
    const tokenId = await getTokenId();
    const registerResult = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    ipId = registerResult.ipId!;
    data = encodeFunctionData({
      abi: accessControllerAbi,
      functionName: "setPermission",
      args: [
        getAddress(ipId),
        getAddress(process.env.TEST_WALLET_ADDRESS as Hex),
        getAddress(coreMetadataModule),
        toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
        AccessPermission.ALLOW,
      ],
    });
  });

  it("should not throw error when execute", async () => {
    const response = await client.ipAccount.execute({
      to: permissionAddress,
      value: 0,
      data,
      ipId: ipId,
      txOptions: {
        waitForTransaction: true,
      },
    });
    expect(response.txHash).to.be.a("string").and.not.empty;
  });

  it("should not throw error when getIpAccountNonce", async () => {
    const response = await client.ipAccount.getIpAccountNonce(ipId);
    expect(response).to.be.a("string").and.not.empty;
  });

  it("should not throw error when call getToken", async () => {
    const response = await client.ipAccount.getToken(ipId);
    expect(response.chainId).to.be.a("bigint");
    expect(response.tokenContract).to.be.a("string").and.not.empty;
    expect(response.tokenId).to.be.a("bigint");
  });
});
