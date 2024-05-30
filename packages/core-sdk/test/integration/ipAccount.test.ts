import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { AccessPermission, StoryClient } from "../../src";
import { MockERC721, getStoryClientInSepolia, getTokenId, sepoliaChainId } from "./utils/util";
import { Hex, encodeFunctionData, toFunctionSelector } from "viem";
import {
  accessControllerAbi,
  accessControllerAddress,
  coreMetadataModuleAddress,
} from "../../src/abi/generated";
import { privateKeyToAccount } from "viem/accounts";
import { getDeadline, getPermissionSignature } from "../../src/utils/sign";
chai.use(chaiAsPromised);
const expect = chai.expect;
const coreMetadataModule = coreMetadataModuleAddress[sepoliaChainId];
describe("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;
  const permissionAddress = accessControllerAddress[sepoliaChainId];

  before(async () => {
    client = getStoryClientInSepolia();
    const tokenId = await getTokenId();
    const registerResult = await client.ipAsset.register({
      nftContract: MockERC721,
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
        ipId,
        process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
        coreMetadataModule,
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
      accountAddress: ipId,
    });
    expect(response.txHash).to.be.a("string").and.not.empty;
  });

  it("should not throw error when executeWithSig setting permission", async () => {
    const account = privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex);
    const state = await client.ipAccount.getIpAccountNonce(ipId);
    const expectedState = state + 1n;
    const deadline = getDeadline(60000n);
    const signature = await getPermissionSignature({
      ipId,
      data,
      nonce: expectedState,
      account,
      chainId: BigInt(sepoliaChainId),
      deadline: deadline,
    });
    const response = await client.ipAccount.executeWithSig({
      ipId: ipId,
      value: 0,
      to: permissionAddress,
      data: data,
      deadline: deadline,
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
      signature: signature,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string").and.not.empty;
  });
});
