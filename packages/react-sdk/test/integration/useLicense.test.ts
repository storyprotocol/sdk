import { renderHook } from "@testing-library/react";
import { Hex } from "viem";
import { act } from "react";

import { useIpAsset, useLicense } from "../../src";
import Wrapper from "./utils/Wrapper";
import { getTokenId, mockERC20Address, mockERC721Address } from "./utils/util";

describe("useLicense Functions", () => {
  const {
    result: { current: licenseHook },
  } = renderHook(() => useLicense(), { wrapper: Wrapper });
  const {
    result: { current: ipAssetHook },
  } = renderHook(() => useIpAsset(), { wrapper: Wrapper });
  describe("registering license with different types", () => {
    it("should success when register license with non commercial social remixing PIL", async () => {
      await act(async () => {
        await expect(
          licenseHook.registerNonComSocialRemixingPIL({
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            licenseTermsId: expect.any(BigInt),
          })
        );
      });
    });

    it("should success when register license with commercial use", async () => {
      await act(async () => {
        await expect(
          licenseHook.registerCommercialUsePIL({
            mintingFee: "1",
            currency: mockERC20Address,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            licenseTermsId: expect.any(BigInt),
          })
        );
      });
    });

    it("should success when register license with commercial Remix use", async () => {
      await act(async () => {
        await expect(
          licenseHook.registerCommercialRemixPIL({
            mintingFee: "1",
            commercialRevShare: 100,
            currency: mockERC20Address,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            licenseTermsId: expect.any(BigInt),
          })
        );
      });
    });
  });

  describe("attach License Terms and mint license tokens", () => {
    let ipId: Hex;
    let licenseId: bigint;
    let tokenId;
    beforeAll(async () => {
      tokenId = await getTokenId();
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
      await act(async () => {
        licenseId = (
          await licenseHook.registerNonComSocialRemixingPIL({
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).licenseTermsId!;
      });
    });

    it("should success when attach License Terms", async () => {
      await act(async () => {
        await expect(
          licenseHook.attachLicenseTerms({
            ipId: ipId,
            licenseTermsId: licenseId,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            txHash: expect.any(String),
            success: expect.any(Boolean),
          })
        );
      });
    });

    it("should success when minting license tokens", async () => {
      await act(async () => {
        await expect(
          licenseHook.mintLicenseTokens({
            licenseTermsId: licenseId,
            licensorIpId: ipId,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            txHash: expect.any(String),
            licenseTokenIds: expect.any(Array),
          })
        );
      });
    });

    it("should success when get license terms", async () => {
      await act(async () => {
        await expect(licenseHook.getLicenseTerms(licenseId)).resolves.toEqual(
          expect.any(Object)
        );
      });
    });
  });
});
