import { act, renderHook } from "@testing-library/react";
import { Address } from "viem";

import { useIpAsset, usePermission } from "../../src";
import Wrapper from "./utils/Wrapper";
import { getTokenId, mockERC721Address } from "./utils/util";

describe("usePermission Functions", () => {
  const {
    result: { current: permissionHook },
  } = renderHook(() => usePermission(), { wrapper: Wrapper });
  const {
    result: { current: ipAssetHook },
  } = renderHook(() => useIpAsset(), { wrapper: Wrapper });

  let ipId: Address;
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
  });
  it("should success when call setPermission", async () => {
    await act(async () => {
      await expect(
        permissionHook.setPermission({
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
          permission: 1,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          success: true,
        })
      );
    });
  });

  it("should success when call setAllPermissions", async () => {
    await act(async () => {
      await expect(
        permissionHook.setAllPermissions({
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          permission: 1,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          success: true,
        })
      );
    });
  });

  it("should success when call createSetPermissionSignature", async () => {
    await act(async () => {
      await expect(
        permissionHook.createSetPermissionSignature({
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Address,
          to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
          permission: 1,
          deadline: 60000n,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          success: true,
        })
      );
    });
  });

  it("should success when call setBatchPermissions", async () => {
    await act(async () => {
      await expect(
        permissionHook.setBatchPermissions({
          permissions: [
            {
              ipId: ipId,
              signer: process.env.TEST_WALLET_ADDRESS as Address,
              to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
              permission: 1,
              func: "function setAll(address,string,bytes32,bytes32)",
            },
            {
              ipId: ipId,
              signer: process.env.TEST_WALLET_ADDRESS as Address,
              to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
              permission: 1,
              func: "function freezeMetadata(address)",
            },
          ],
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          success: true,
        })
      );
    });
  });

  it("should success when call createBatchPermissionSignature", async () => {
    await act(async () => {
      await expect(
        permissionHook.createBatchPermissionSignature({
          ipId: ipId,
          permissions: [
            {
              ipId: ipId,
              signer: process.env.TEST_WALLET_ADDRESS as Address,
              to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
              permission: 1,
              func: "function setAll(address,string,bytes32,bytes32)",
            },
            {
              ipId: ipId,
              signer: process.env.TEST_WALLET_ADDRESS as Address,
              to: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
              permission: 1,
              func: "function freezeMetadata(address)",
            },
          ],
          deadline: 60000n,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          success: true,
        })
      );
    });
  });
});
