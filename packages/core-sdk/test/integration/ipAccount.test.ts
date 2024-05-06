import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./utils/util";
import {
  Hex,
  PublicClient,
  createPublicClient,
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getAddress,
  http,
  keccak256,
  toBytes,
  toHex,
} from "viem";
import { accessControllerAbi, accessControllerAddress } from "../../src/abi/generated";
import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain } from "../../src/utils/utils";
chai.use(chaiAsPromised);
const expect = chai.expect;
const sepoliaChainId = 11155111;

describe("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;
  let publicClient: PublicClient;
  const permissionAddress = accessControllerAddress[sepoliaChainId];

  before(async function () {
    client = getStoryClientInSepolia();
    const tokenId = await getTokenId();
    const registerResult = await client.ipAsset.register({
      tokenContract: MockERC721,
      tokenId: tokenId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    ipId = registerResult.ipId!;
    ipId = "0xf3135B9297928a99C7FFD8591dFCfC93Ad85c310";
    data = encodeFunctionData({
      abi: accessControllerAbi,
      functionName: "setPermission",
      args: [
        getAddress(ipId),
        getAddress(process.env.TEST_WALLET_ADDRESS as Hex),
        getAddress("0x2ac240293f12032E103458451dE8A8096c5A72E8"),
        "0x00000000" as Hex,
        1,
      ],
    });
    publicClient = await createPublicClient({
      chain: chainStringToViemChain("sepolia"),
      transport: http(process.env.SEPOLIA_RPC_PROVIDER_URL),
    });
  });

  it.skip("should not throw error when execute", async () => {
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
    const domain = {
      name: "Story Protocol IP Account",
      chainId: BigInt(sepoliaChainId),
      verifyingContract: permissionAddress,
      version: "1",
    } as const;
    const deadline = Number((await publicClient.getBlock()).timestamp + 100n);
    const state = await client.ipAccount.getIpAccountAddress(ipId);

    // const expectedState = keccak256(
    //   encodeAbiParameters(
    //     state,
    //     encodeFunctionData({
    //     abi: accessControllerAbi,
    //     functionName: "setPermission",
    //     args: [
    //       getAddress(ipId),
    //       getAddress(process.env.TEST_WALLET_ADDRESS as Hex),
    //       getAddress("0x2ac240293f12032E103458451dE8A8096c5A72E8"),
    //       "0x00000000" as Hex,
    //       1,
    //     ]
    //   }))
    // );
    const signature = await account.signTypedData({
      domain,
      types: {
        Execute: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "nonce", type: "bytes32" },
          { name: "deadline", type: "uint256" },
        ],
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
      },
      primaryType: "Execute",
      message: {
        to: permissionAddress,
        value: BigInt(0),
        data: data,
        // nonce: expectedState,
        nonce: toHex("", { size: 32 }),
        deadline: BigInt(deadline),
      },
    });
    const response = await client.ipAccount.executeWithSig({
      accountAddress: ipId,
      value: 0,
      to: permissionAddress,
      data: data,
      deadline: Number((await publicClient.getBlock()).timestamp + 100n),
      signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
      signature: signature,
      txOptions: {
        waitForTransaction: true,
      },
    });

    expect(response.txHash).to.be.a("string");
    expect(response.txHash).not.empty;
  });
});
