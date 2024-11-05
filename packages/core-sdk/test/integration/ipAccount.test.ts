import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { AccessPermission, StoryClient } from "../../src";
import { mockERC721, getStoryClient, getTokenId, odyssey } from "./utils/util";
import {
  Hex,
  WalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  keccak256,
  toFunctionSelector,
  zeroAddress,
} from "viem";
import {
  accessControllerAbi,
  accessControllerAddress,
  coreMetadataModuleAddress,
  ipAccountImplAbi,
  licensingModuleAbi,
} from "../../src/abi/generated";
import { getDeadline } from "../../src/utils/sign";
import { privateKeyToAccount } from "viem/accounts";

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

  it.skip("should not throw error when execute", async () => {
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

  it.skip("should not throw error when getIpAccountNonce", async () => {
    const response = await client.ipAccount.getIpAccountNonce(ipId);
    expect(response).to.be.a("string").and.not.empty;
  });

  it.skip("should not throw error when call getToken", async () => {
    const response = await client.ipAccount.getToken(ipId);
    expect(response.chainId).to.be.a("bigint");
    expect(response.tokenContract).to.be.a("string").and.not.empty;
    expect(response.tokenId).to.be.a("bigint");
  });

  it("should not throw error when executeWithSig", async () => {
    const licenseModuleAddress = "0x58E2c909D557Cd23EF90D14f8fd21667A5Ae7a93";
    const childTokenId = await getTokenId();
    const childIpId = (
      await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: childTokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).ipId!;
    const noCommercialLicenseTermsId = (
      await client.license.registerNonComSocialRemixingPIL({
        txOptions: {
          waitForTransaction: true,
        },
      })
    ).licenseTermsId!;
    const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex);
    const calculatedDeadline = getDeadline();
    const state = await client.ipAccount.getIpAccountNonce(ipId);
    const data = encodeFunctionData({
      abi: licensingModuleAbi,
      functionName: "registerDerivative",
      args: [childIpId, [ipId], [noCommercialLicenseTermsId], licenseModuleAddress, zeroAddress],
    });
    const nonce = keccak256(
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
            args: [licenseModuleAddress, 0n, data],
          }),
        ],
      ),
    );
    const signature: Hex = await account.signTypedData({
      domain: {
        name: "Story Protocol IP Account",
        version: "1",
        chainId: 1516,
        verifyingContract: childIpId,
      },
      types: {
        Execute: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "nonce", type: "bytes32" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Execute",
      message: {
        to: licenseModuleAddress,
        value: BigInt(0),
        data,
        nonce,
        deadline: calculatedDeadline,
      },
    });
    const result = await client.ipAccount.executeWithSig({
      ipId: childIpId,
      value: 0,
      to: licenseModuleAddress,
      data: data,
      deadline: calculatedDeadline,
      signer: process.env.TEST_WALLET_ADDRESS as Hex,
      signature: signature,
      txOptions: {
        waitForTransaction: true,
      },
    });
    console.log("result", result);
  });
});
