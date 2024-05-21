import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import {
  MockERC721,
  getBlockTimestamp,
  getStoryClientInSepolia,
  getTokenId,
  sepoliaChainId,
} from "./utils/util";
import { Hex, encodeFunctionData, getAddress, toFunctionSelector } from "viem";
import { accessControllerAbi, accessControllerAddress } from "../../src/abi/generated";
import { privateKeyToAccount } from "viem/accounts";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;
  const permissionAddress = accessControllerAddress[sepoliaChainId];

  before(async function () {
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
        getAddress(ipId),
        getAddress(process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex),
        getAddress("0xDa498A3f7c8a88cb72201138C366bE3778dB9575"),
        toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
        1,
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

  it.skip("should not throw error when executeWithSig setting permission", async () => {
    const account = privateKeyToAccount(process.env.SEPOLIA_WALLET_PRIVATE_KEY as Hex);
    const deadline = (await getBlockTimestamp()) + 100n;
    const state = await client.ipAccount.getIpAccountNonce(ipId);
    const expectedState = state + 1n;
    const signature = await account.signTypedData({
      domain: {
        name: "Story Protocol IP Account",
        version: "1",
        chainId: sepoliaChainId,
        verifyingContract: ipId,
      },
      types: {
        Execute: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Execute",
      message: {
        to: permissionAddress,
        value: BigInt(0),
        data: data,
        nonce: expectedState,
        deadline: BigInt(deadline),
      },
    });
    const response = await client.ipAccount.executeWithSig({
      accountAddress: ipId,
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
