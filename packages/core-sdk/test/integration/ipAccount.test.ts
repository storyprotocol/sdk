import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { AccessPermission, StoryClient, getPermissionSignature } from "../../src";
import {
  mockERC721,
  getStoryClient,
  getTokenId,
  storyTestChainId,
  walletClient,
} from "./utils/util";
import {
  Hex,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  keccak256,
  toFunctionSelector,
} from "viem";
import {
  accessControllerAbi,
  accessControllerAddress,
  coreMetadataModuleAddress,
  ipAccountImplAbi,
} from "../../src/abi/generated";
import { getDeadline } from "../../src/utils/sign";

chai.use(chaiAsPromised);
const expect = chai.expect;
const coreMetadataModule = coreMetadataModuleAddress[storyTestChainId];
describe("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;
  const permissionAddress = accessControllerAddress[storyTestChainId];

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
        getAddress(process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex),
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
    });
    expect(response.txHash).to.be.a("string").and.not.empty;
  });

  it("should not throw error when executeWithSig setting permission", async () => {
    const { result: state } = await client.ipAccount.getIpAccountNonce(ipId);
    const expectedState = keccak256(
      encodeAbiParameters(
        [
          { name: "", type: "bytes32" },
          { name: "", type: "bytes" },
        ],
        [
          state,
          encodeFunctionData({
            abi: ipAccountImplAbi,
            functionName: "execute",
            args: [permissionAddress, 0n, data],
          }),
        ],
      ),
    );
    const deadline = getDeadline(60000n);
    const signature = await getPermissionSignature({
      ipId,
      wallet: walletClient,
      permissions: [
        {
          ipId: ipId,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
          to: coreMetadataModule,
          permission: AccessPermission.ALLOW,
          func: "function setAll(address,string,bytes32,bytes32)",
        },
      ],
      nonce: expectedState,

      chainId: BigInt(storyTestChainId),
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
