import { renderHook, act } from "@testing-library/react";
import {
  Address,
  Hex,
  encodeFunctionData,
  getAddress,
  toFunctionSelector,
} from "viem";

import { mockERC721Address, getTokenId } from "./utils/util";
import { AccessPermission, useIpAccount, useIpAsset } from "../../src";
import Wrapper from "./utils/Wrapper";

const coreMetadataModuleAddress = "0x290F414EA46b361ECFB6b430F98346CB593D02b9";
const permissionAddress = "0x01d470c28822d3701Db6325333cEE9737524776E";
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
        getAddress(process.env.TEST_WALLET_ADDRESS as Hex),
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
});
