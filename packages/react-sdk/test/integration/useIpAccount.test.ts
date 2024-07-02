import { renderHook, act } from "@testing-library/react";
import { mockERC721Address, getTokenId, walletClient } from "./utils/util";
import {
  AccessPermission,
  getPermissionSignature,
  useIpAccount,
  useIpAsset,
} from "../../src";
import Wrapper from "./utils/Wrapper";
import {
  Address,
  Hex,
  encodeFunctionData,
  getAddress,
  toFunctionSelector,
} from "viem";
const coreMetadataModuleAddress = "0xDa498A3f7c8a88cb72201138C366bE3778dB9575";
const permissionAddress = "0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A";
const accessControllerAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "setPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
describe("useIpAccount Functions", () => {
  const {
    result: { current: ipAssetHook },
  } = renderHook(() => useIpAsset(), { wrapper: Wrapper });
  const {
    result: { current: ipAccountHook },
  } = renderHook(() => useIpAccount(), { wrapper: Wrapper });

  let ipId: Address;
  let data: Hex;
  beforeAll(async () => {
    const tokenId = await getTokenId();
    await act(async () => {
      ipId = (
        await ipAssetHook.register({
          nftContract: mockERC721Address,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
    });
    data = encodeFunctionData({
      abi: accessControllerAbi,
      functionName: "setPermission",
      args: [
        getAddress(ipId),
        getAddress(process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex),
        getAddress(coreMetadataModuleAddress),
        toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
        AccessPermission.ALLOW,
      ],
    });
  });

  it("should success when call execute", async () => {
    await act(async () => {
      await expect(
        ipAccountHook.execute({
          to: permissionAddress,
          value: 0,
          data,
          ipId: ipId,
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
        })
      );
    });
  });

  it("should success when executeWithSig setting permission", async () => {
    const state = await ipAccountHook.getIpAccountNonce(ipId);
    const expectedState = state + 1n;
    const deadline = Date.now() + 60000;
    const signature = await getPermissionSignature({
      ipId,
      wallet: walletClient,
      permissions: [
        {
          ipId: ipId,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
          to: coreMetadataModuleAddress,
          permission: AccessPermission.ALLOW,
          func: "function setAll(address,string,bytes32,bytes32)",
        },
      ],
      nonce: expectedState,

      chainId: 11155111n,
      deadline: BigInt(deadline),
    });
    await act(async () => {
      await expect(
        ipAccountHook.executeWithSig({
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
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
        })
      );
    });
  });
});
