import { renderHook, act, waitFor } from "@testing-library/react";
import { Address, toHex } from "viem";

import {
  CreateIpAssetWithPilTermsResponse,
  PIL_TYPE,
  RegisterIpResponse,
  useLicense,
  useNftClient,
} from "../../src";
import { useIpAsset } from "../../src";
import Wrapper from "./utils/Wrapper";
import {
  mockERC721Address,
  getTokenId,
  mockERC20Address,
  mintBySpg,
} from "./utils/util";

describe("useIpAsset Functions", () => {
  const {
    result: { current: ipAssetHook },
  } = renderHook(() => useIpAsset(), { wrapper: Wrapper });
  const {
    result: { current: licenseHook },
  } = renderHook(() => useLicense(), { wrapper: Wrapper });
  const {
    result: { current: nftClientHook },
  } = renderHook(() => useNftClient(), { wrapper: Wrapper });

  let childIpId: Address;
  let noCommercialLicenseTermsId: bigint;
  let parentIpId: Address;
  it("should success when call register", async () => {
    const tokenId = await getTokenId();
    let result: RegisterIpResponse;
    await act(async () => {
      result = await ipAssetHook.register({
        nftContract: mockERC721Address,
        tokenId: tokenId!,
        txOptions: {
          waitForTransaction: true,
        },
      });
      childIpId = result.ipId!;
    });
    await waitFor(() => {
      expect(result).toMatchObject({
        ipId: expect.any(String),
      });
      expect(result).toEqual(
        expect.objectContaining({
          ipId: expect.any(String),
          txHash: expect.any(String),
        })
      );
    });
  });

  it("should success when call register given metadata", async () => {
    const tokenId = await getTokenId();
    await act(async () => {
      await expect(
        ipAssetHook.register({
          nftContract: mockERC721Address,
          tokenId: tokenId!,
          ipMetadata: {
            ipMetadataURI: "test-uri",
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          },
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          ipId: expect.any(String),
          txHash: expect.any(String),
        })
      );
    });
  });

  it("should success when registering derivative", async () => {
    const tokenId = await getTokenId();
    await act(async () => {
      parentIpId = (
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
      noCommercialLicenseTermsId = (
        await licenseHook.registerNonComSocialRemixingPIL({
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).licenseTermsId!;
    });
    await act(async () => {
      await licenseHook.attachLicenseTerms({
        ipId: parentIpId,
        licenseTermsId: noCommercialLicenseTermsId,
        txOptions: {
          waitForTransaction: true,
        },
      });
    });
    await act(async () => {
      await expect(
        ipAssetHook.registerDerivative({
          parentIpIds: [parentIpId],
          childIpId: childIpId,
          licenseTermsIds: [noCommercialLicenseTermsId],
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

  it("should success when registering derivative with license tokens", async () => {
    const tokenId = await getTokenId();
    let ipId: Address;
    let licenseTokenId: bigint;
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
      licenseTokenId = (
        await licenseHook.mintLicenseTokens({
          licenseTermsId: noCommercialLicenseTermsId,
          licensorIpId: parentIpId,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).licenseTokenIds![0]!;
    });
    await act(async () => {
      await expect(
        ipAssetHook.registerDerivativeWithLicenseTokens({
          childIpId: ipId,
          licenseTokenIds: [licenseTokenId],
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

  describe("NFT Client (SPG)", () => {
    let nftContract: Address;
    beforeAll(async () => {
      await act(async () => {
        nftContract = (
          await nftClientHook.createNFTCollection({
            name: "test-collection",
            symbol: "TEST",
            maxSupply: 100,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).nftContract!;
      });
    });
    describe("should success when mint and register ip and attach pil terms", () => {
      it("Non-Commercial Remix", async () => {
        await act(async () => {
          await expect(
            ipAssetHook.mintAndRegisterIpAssetWithPilTerms({
              nftContract,
              pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
              ipMetadata: {
                ipMetadataURI: "test-uri",
                ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
                nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
              },
              txOptions: {
                waitForTransaction: true,
              },
            })
          ).resolves.toEqual(
            expect.objectContaining({
              ipId: expect.any(String),
              txHash: expect.any(String),
            })
          );
        });
      });

      it("Commercial Use", async () => {
        await act(async () => {
          await expect(
            ipAssetHook.mintAndRegisterIpAssetWithPilTerms({
              nftContract,
              pilType: PIL_TYPE.COMMERCIAL_USE,
              commercialRevShare: 10,
              mintingFee: "100",
              currency: mockERC20Address,
              ipMetadata: {
                ipMetadataURI: "test-uri",
                ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
                nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
              },
              txOptions: {
                waitForTransaction: true,
              },
            })
          ).resolves.toEqual(
            expect.objectContaining({
              ipId: expect.any(String),
              txHash: expect.any(String),
            })
          );
        });
      });

      it("Commercial Remix", async () => {
        await act(async () => {
          await expect(
            ipAssetHook.mintAndRegisterIpAssetWithPilTerms({
              nftContract,
              pilType: PIL_TYPE.COMMERCIAL_REMIX,
              commercialRevShare: 10,
              mintingFee: "100",
              currency: mockERC20Address,
              ipMetadata: {
                ipMetadataURI: "test-uri",
                ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
                nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
              },
              txOptions: {
                waitForTransaction: true,
              },
            })
          ).resolves.toEqual(
            expect.objectContaining({
              ipId: expect.any(String),
              txHash: expect.any(String),
            })
          );
        });
      });
    });

    it("should success when register derivative ip", async () => {
      const tokenChildId = await mintBySpg(nftContract, "test-metadata");
      let createIpAssetWithPilTermsResponse: CreateIpAssetWithPilTermsResponse;
      await act(async () => {
        createIpAssetWithPilTermsResponse =
          await ipAssetHook.mintAndRegisterIpAssetWithPilTerms({
            nftContract,
            pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
            txOptions: {
              waitForTransaction: true,
            },
          });
      });
      await act(async () => {
        await expect(
          ipAssetHook.registerDerivativeIp({
            nftContract: nftContract,
            tokenId: tokenChildId!,
            derivData: {
              parentIpIds: [createIpAssetWithPilTermsResponse.ipId!],
              licenseTermsIds: [
                createIpAssetWithPilTermsResponse.licenseTermsId!,
              ],
            },
            deadline: 1000n,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            txHash: expect.any(String),
            ipId: expect.any(String),
          })
        );
      });
    });

    it("should success when register ip and attach pil terms", async () => {
      const tokenId = await mintBySpg(nftContract, "test-metadata");
      const deadline = 1000n;
      await act(async () => {
        await expect(
          ipAssetHook.registerIpAndAttachPilTerms({
            nftContract: nftContract,
            tokenId: tokenId!,
            deadline,
            pilType: PIL_TYPE.COMMERCIAL_USE,
            mintingFee: "100",
            currency: mockERC20Address,
            txOptions: {
              waitForTransaction: true,
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            ipId: expect.any(String),
            txHash: expect.any(String),
          })
        );
      });
    });
  });
});
